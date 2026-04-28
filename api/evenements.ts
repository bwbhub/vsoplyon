import type { VercelRequest, VercelResponse } from '@vercel/node'
import { withApi, ApiError, requireMethod, parseId } from './_lib/handler.js'
import { sql } from './_lib/db.js'
import { requireAuth } from './_lib/auth.js'

function clampLimit(raw: unknown, max = 100, def = 50): number {
  const n = Number(raw)
  if (!Number.isFinite(n)) return def
  return Math.max(1, Math.min(max, Math.trunc(n)))
}

export default withApi(async (req: VercelRequest, _res: VercelResponse) => {
  requireMethod(req, ['GET'])
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
