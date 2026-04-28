import type { VercelRequest, VercelResponse } from '@vercel/node'
import { withApi, ApiError, requireMethod } from './_lib/handler.js'
import { sql } from './_lib/db.js'
import { requireAuth } from './_lib/auth.js'

/**
 * Statistiques globales d'un utilisateur depuis son inscription.
 *
 *   GET /api/stats?utilisateur=42  (utilisateur=me => utilisateur courant)
 *
 * Retour :
 *   {
 *     utilisateur_id, total_kills, total_participations,
 *     tables_finales, victoires, podiums, meilleure_position
 *   }
 *
 * Definitions :
 *   - table finale = position_sortie entre 1 et 8 (top 8 d'une session)
 *   - victoire    = position_sortie = 1 (1er)
 *   - podium      = position_sortie <= 3
 */
export default withApi(async (req: VercelRequest, _res: VercelResponse) => {
  requireMethod(req, ['GET'])
  const token = requireAuth(req)

  let utilisateur_id: number
  const raw = req.query.utilisateur
  if (!raw || raw === 'me') {
    utilisateur_id = Number(token.uid)
  } else {
    utilisateur_id = Number(raw)
  }
  if (!utilisateur_id || !Number.isFinite(utilisateur_id)) {
    throw new ApiError(400, 'Invalid utilisateur')
  }

  const rows = await sql<any[]>`
    select
      coalesce(sum(kills), 0)::int                                              as total_kills,
      count(*)::int                                                             as total_participations,
      count(*) filter (where position_sortie between 1 and 8)::int              as tables_finales,
      count(*) filter (where position_sortie = 1)::int                          as victoires,
      count(*) filter (where position_sortie between 1 and 3)::int              as podiums,
      min(position_sortie)::int                                                 as meilleure_position
    from score_evenement
    where utilisateur_id = ${utilisateur_id}
  `
  return { utilisateur_id, ...rows[0] }
})
