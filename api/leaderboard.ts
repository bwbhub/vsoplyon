import type { VercelRequest, VercelResponse } from '@vercel/node'
import { withApi, ApiError, requireMethod } from './_lib/handler.js'
import { sql } from './_lib/db.js'
import { requireAuth } from './_lib/auth.js'

function clampLimit(raw: unknown, max = 500, def = 100): number {
  const n = Number(raw)
  if (!Number.isFinite(n)) return def
  return Math.max(1, Math.min(max, Math.trunc(n)))
}

export default withApi(async (req: VercelRequest, _res: VercelResponse) => {
  requireMethod(req, ['GET'])
  requireAuth(req)

  const tournoi = req.query.tournoi ? Number(req.query.tournoi) : null
  const all = req.query.all && req.query.all !== '0'
  const limit = clampLimit(req.query.limit)

  if (tournoi) {
    return await sql`
      SELECT u.id, u.nom, u.prenom, u.pseudo,
             coalesce(st.points, 0) AS points,
             coalesce(st.bonus, 0)  AS bonus,
             coalesce(st.points, 0) + coalesce(st.bonus, 0) AS total
      FROM score_tournoi st
      JOIN utilisateur u ON u.id = st.utilisateur_id
      WHERE st.tournoi_id = ${tournoi}
      ORDER BY total DESC, u.nom ASC
      LIMIT ${limit}
    `
  }

  if (all) {
    return await sql`
      SELECT u.id, u.nom, u.prenom, u.pseudo,
             sum(coalesce(s.score, 0))  AS total_score,
             sum(coalesce(s.points, 0)) AS total_points,
             sum(coalesce(s.bonus, 0))  AS total_bonus,
             count(s.id)                AS participations
      FROM utilisateur u
      LEFT JOIN score_evenement s ON s.utilisateur_id = u.id
      GROUP BY u.id
      HAVING count(s.id) > 0
      ORDER BY total_score DESC
      LIMIT ${limit}
    `
  }

  throw new ApiError(400, 'Specify ?tournoi=<id> or ?all=1')
})
