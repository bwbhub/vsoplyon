import type { VercelRequest, VercelResponse } from '@vercel/node'
import { withApi, ApiError, requireMethod, parseId } from './_lib/handler.js'
import { sql } from './_lib/db.js'
import { requireAuth, requireAdmin } from './_lib/auth.js'

/**
 * Saisons (table `tournoi`).
 *
 *   GET  /api/tournois              -> toutes les saisons (DESC)
 *   GET  /api/tournois?id=12        -> une saison
 *   GET  /api/tournois?active=1     -> la saison active (date_fin null)
 *   POST /api/tournois              -> creer une saison (admin)
 *                                      auto-numerotee dans l'annee si numero absent
 *   POST /api/tournois?action=close { id }
 *                                   -> cloturer une saison + ouvrir la suivante (admin)
 */

async function startNextSaison(closeId?: number) {
  // Cloturer la saison courante si demande
  if (closeId) {
    await sql`update tournoi set date_fin = current_date where id = ${closeId} and date_fin is null`
  }
  // Numero suivant pour l'annee courante
  const year = new Date().getUTCFullYear()
  const last = await sql<{ numero: number | null }[]>`
    select max(numero) as numero from tournoi where annee = ${year}
  `
  const nextNum = (last[0]?.numero ?? 0) + 1
  const rows = await sql<{ id: number }[]>`
    insert into tournoi (nom, annee, numero, date_debut)
    values (${`Saison ${nextNum} - ${year}`}, ${year}, ${nextNum}, current_date)
    returning id
  `
  return rows[0]
}

export default withApi(async (req: VercelRequest, _res: VercelResponse) => {
  const method = requireMethod(req, ['GET', 'POST'])

  if (method === 'POST') {
    requireAdmin(req)
    const action = String(req.query.action || '')
    const body = (req.body ?? {}) as Record<string, any>

    if (action === 'close') {
      const id = Number(body.id ?? req.query.id)
      if (!id) throw new ApiError(422, 'Missing id')
      const next = await startNextSaison(id)
      return { closed_id: id, next }
    }

    // Creation simple
    const annee = body.annee ? Number(body.annee) : new Date().getUTCFullYear()
    let numero = body.numero ? Number(body.numero) : null
    if (!numero) {
      const last = await sql<{ numero: number | null }[]>`
        select max(numero) as numero from tournoi where annee = ${annee}
      `
      numero = (last[0]?.numero ?? 0) + 1
    }
    const nom = body.nom || `Saison ${numero} - ${annee}`
    const rows = await sql<{ id: number }[]>`
      insert into tournoi (nom, annee, numero, date_debut)
      values (${nom}, ${annee}, ${numero}, current_date)
      returning *
    `
    return rows[0]
  }

  // GET
  requireAuth(req)

  if (req.query.id) {
    const id = parseId(req)
    const rows = await sql`select * from tournoi where id = ${id}`
    if (!rows[0]) throw new ApiError(404, 'Tournoi not found')
    return rows[0]
  }

  if (req.query.active) {
    const rows = await sql`
      select * from tournoi where date_fin is null
      order by date_debut desc nulls last, id desc limit 1
    `
    return rows[0] || null
  }

  return await sql`select * from tournoi order by date_debut desc nulls last, id desc`
})

export { startNextSaison }

