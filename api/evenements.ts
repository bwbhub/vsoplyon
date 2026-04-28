import type { VercelRequest, VercelResponse } from '@vercel/node'
import { withApi, ApiError, requireMethod, parseId } from './_lib/handler.js'
import { sql } from './_lib/db.js'
import { requireAuth, requireAdmin } from './_lib/auth.js'

function clampLimit(raw: unknown, max = 100, def = 50): number {
  const n = Number(raw)
  if (!Number.isFinite(n)) return def
  return Math.max(1, Math.min(max, Math.trunc(n)))
}

export default withApi(async (req: VercelRequest, _res: VercelResponse) => {
  const method = requireMethod(req, ['GET', 'POST', 'PATCH', 'DELETE'])

  // ---------- POST : creer une session (admin) ----------
  if (method === 'POST') {
    requireAdmin(req)
    const body = (req.body ?? {}) as Record<string, any>
    if (!body.date) throw new ApiError(422, 'Missing date')
    const type = body.type === 'finale' ? 'finale' : 'normal'

    // tournoi actif si non specifie
    let tournoi_id: number | null = body.tournoi_id ? Number(body.tournoi_id) : null
    if (!tournoi_id) {
      const t = await sql<{ id: number }[]>`
        select id from tournoi where date_fin is null
        order by date_debut desc nulls last, id desc limit 1
      `
      tournoi_id = t[0]?.id ?? null
    }

    const rows = await sql<{ id: number }[]>`
      insert into evenement (date, lieu_id, tournoi_id, nom, description, type, annulation)
      values (
        ${body.date}::timestamptz,
        ${body.lieu_id ? Number(body.lieu_id) : null},
        ${tournoi_id},
        ${body.nom ?? 'Session du mercredi'},
        ${body.description ?? null},
        ${type},
        ${body.annulation === true}
      )
      returning id
    `
    return rows[0]
  }

  // ---------- PATCH : modifier une session (admin) ----------
  if (method === 'PATCH') {
    requireAdmin(req)
    const id = parseId(req)
    const body = (req.body ?? {}) as Record<string, any>

    const fields: any[] = []
    if (body.type !== undefined) {
      const t = body.type === 'finale' ? 'finale' : 'normal'
      fields.push(sql`type = ${t}`)
    }
    if (body.date !== undefined)        fields.push(sql`date = ${body.date}::timestamptz`)
    if (body.lieu_id !== undefined)     fields.push(sql`lieu_id = ${body.lieu_id ? Number(body.lieu_id) : null}`)
    if (body.tournoi_id !== undefined)  fields.push(sql`tournoi_id = ${body.tournoi_id ? Number(body.tournoi_id) : null}`)
    if (body.nom !== undefined)         fields.push(sql`nom = ${body.nom}`)
    if (body.description !== undefined) fields.push(sql`description = ${body.description}`)
    if (body.annulation !== undefined)  fields.push(sql`annulation = ${body.annulation === true}`)

    if (fields.length === 0) throw new ApiError(400, 'No fields to update')

    let setExpr = fields[0]
    for (let i = 1; i < fields.length; i++) setExpr = sql`${setExpr}, ${fields[i]}`

    const rows = await sql`update evenement set ${setExpr} where id = ${id} returning *`
    if (!rows[0]) throw new ApiError(404, 'Evenement not found')
    return rows[0]
  }

  // ---------- DELETE : supprimer une session (admin) ----------
  if (method === 'DELETE') {
    requireAdmin(req)
    const id = parseId(req)
    await sql`delete from evenement where id = ${id}`
    return { ok: true }
  }

  // ---------- GET ----------
  requireAuth(req)

  if (req.query.id) {
    const id = parseId(req)
    const rows = await sql`
      SELECT e.*, l.nom AS lieu_nom, t.nom AS tournoi_nom
      FROM evenement e
      LEFT JOIN lieu l    ON l.id = e.lieu_id
      LEFT JOIN tournoi t ON t.id = e.tournoi_id
      WHERE e.id = ${id}
    `
    if (!rows[0]) throw new ApiError(404, 'Evenement not found')
    return rows[0]
  }

  const tournoi = req.query.tournoi ? Number(req.query.tournoi) : null
  const upcoming = req.query.upcoming && req.query.upcoming !== '0'
  const recent = req.query.recent && req.query.recent !== '0'
  const limit = clampLimit(req.query.limit)

  // On compose la requete avec des fragments tagges (postgres.js gere ca)
  const filters: any[] = []
  if (tournoi) filters.push(sql`e.tournoi_id = ${tournoi}`)
  if (upcoming) filters.push(sql`e.date >= now() AND e.annulation = false`)
  if (recent) filters.push(sql`e.date < now()`)

  let where = sql``
  if (filters.length > 0) {
    where = sql`WHERE ${filters[0]}`
    for (let i = 1; i < filters.length; i++) {
      where = sql`${where} AND ${filters[i]}`
    }
  }

  const order = upcoming ? sql`ORDER BY e.date ASC` : sql`ORDER BY e.date DESC`

  return await sql`
    SELECT e.*, l.nom AS lieu_nom, t.nom AS tournoi_nom
    FROM evenement e
    LEFT JOIN lieu l    ON l.id = e.lieu_id
    LEFT JOIN tournoi t ON t.id = e.tournoi_id
    ${where}
    ${order}
    LIMIT ${limit}
  `
})
