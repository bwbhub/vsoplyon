import type { VercelRequest, VercelResponse } from '@vercel/node'
import { withApi, ApiError, requireMethod } from './_lib/handler.js'
import { sql } from './_lib/db.js'
import { requireAuth, requireAdmin } from './_lib/auth.js'

export default withApi(async (req: VercelRequest, _res: VercelResponse) => {
  const method = requireMethod(req, ['GET', 'POST', 'DELETE'])

  if (method === 'GET') {
    requireAuth(req)
    const evenement = req.query.evenement ? Number(req.query.evenement) : null
    const utilisateur = req.query.utilisateur ? Number(req.query.utilisateur) : null
    const tournoi = req.query.tournoi ? Number(req.query.tournoi) : null

    if (evenement) {
      return await sql`
        SELECT s.*, u.nom, u.prenom, u.pseudo
        FROM score_evenement s
        JOIN utilisateur u ON u.id = s.utilisateur_id
        WHERE s.evenement_id = ${evenement}
        ORDER BY s.score DESC, s.position_sortie DESC
      `
    }
    if (utilisateur) {
      return await sql`
        SELECT s.*, e.date, e.tournoi_id, t.nom AS tournoi_nom
        FROM score_evenement s
        JOIN evenement e ON e.id = s.evenement_id
        LEFT JOIN tournoi t ON t.id = e.tournoi_id
        WHERE s.utilisateur_id = ${utilisateur}
        ORDER BY e.date DESC
      `
    }
    if (tournoi) {
      return await sql`
        SELECT st.*, u.nom, u.prenom, u.pseudo
        FROM score_tournoi st
        JOIN utilisateur u ON u.id = st.utilisateur_id
        WHERE st.tournoi_id = ${tournoi}
        ORDER BY (st.points + st.bonus) DESC
      `
    }
    throw new ApiError(400, 'Specify ?evenement, ?utilisateur or ?tournoi')
  }

  // DELETE -> efface tous les scores d'un evenement (admin only).
  // Permet de re-saisir un classement complet apres correction.
  if (method === 'DELETE') {
    requireAdmin(req)
    const evenement = req.query.evenement ? Number(req.query.evenement) : null
    if (!evenement) throw new ApiError(400, 'Specify ?evenement')
    const deleted = await sql`
      delete from score_evenement where evenement_id = ${evenement} returning id
    `
    return { ok: true, deleted: deleted.length }
  }

  // POST -> insertion (admin)
  requireAdmin(req)
  const body = (req.body ?? {}) as Record<string, any>
  for (const f of ['utilisateur_id', 'evenement_id']) {
    if (body[f] === undefined || body[f] === null) {
      throw new ApiError(422, `Missing field: ${f}`)
    }
  }

  const points = Number(body.points ?? 0) | 0
  const bonus = Number(body.bonus ?? 0) | 0
  const kills = Number(body.kills ?? 0) | 0
  const score = body.score !== undefined ? Number(body.score) | 0 : points + bonus
  const carre = Number(body.carre ?? 0) | 0
  const royal_flush = Number(body.royal_flush ?? 0) | 0
  const flush = Number(body.flush ?? 0) | 0
  const bounty = body.bounty === true || body.bounty === 'true'

  const rows = await sql`
    INSERT INTO score_evenement
      (utilisateur_id, evenement_id, tournoi_id, points, bonus, kills, position_sortie, score, repas,
       carre, royal_flush, flush, bounty)
    VALUES (
      ${Number(body.utilisateur_id)},
      ${Number(body.evenement_id)},
      ${body.tournoi_id ? Number(body.tournoi_id) : null},
      ${points},
      ${bonus},
      ${kills},
      ${body.position_sortie ? Number(body.position_sortie) : null},
      ${score},
      ${body.repas === true || body.repas === 'oui'},
      ${carre},
      ${royal_flush},
      ${flush},
      ${bounty}
    )
    RETURNING id
  `

  // Auto-cloture de la saison si l'evenement est de type 'finale'
  // (idempotent : ne le fait qu'une fois grace au check date_fin null)
  const ev = await sql<{ type: string; tournoi_id: number | null }[]>`
    select type, tournoi_id from evenement where id = ${Number(body.evenement_id)}
  `
  if (ev[0]?.type === 'finale' && ev[0].tournoi_id) {
    const tour = await sql<{ id: number; date_fin: string | null }[]>`
      select id, date_fin from tournoi where id = ${ev[0].tournoi_id}
    `
    if (tour[0] && tour[0].date_fin === null) {
      const year = new Date().getUTCFullYear()
      await sql`update tournoi set date_fin = current_date where id = ${tour[0].id}`
      const last = await sql<{ numero: number | null }[]>`
        select max(numero) as numero from tournoi where annee = ${year}
      `
      const nextNum = (last[0]?.numero ?? 0) + 1
      await sql`
        insert into tournoi (nom, annee, numero, date_debut)
        values (${`Saison ${nextNum} - ${year}`}, ${year}, ${nextNum}, current_date)
      `
    }
  }

  return rows[0]
})
