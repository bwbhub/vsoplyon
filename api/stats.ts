import type { VercelRequest, VercelResponse } from '@vercel/node'
import { withApi, ApiError, requireMethod } from './_lib/handler.js'
import { sql } from './_lib/db.js'
import { requireAuth } from './_lib/auth.js'

/**
 * Statistiques globales d'un utilisateur.
 *
 *   GET /api/stats?utilisateur=42              -> all-time
 *   GET /api/stats?utilisateur=42&tournoi=7    -> limite a la saison 7
 *
 * Retour :
 *   {
 *     utilisateur_id, total_kills, total_participations,
 *     tables_finales, victoires, podiums, meilleure_position,
 *     total_carres, total_royal_flush, total_flush, total_bounty
 *   }
 *
 * Definitions :
 *   - table finale = position_sortie entre 1 et 8 (top 8 d'une session)
 *   - victoire    = position_sortie = 1 (1er)
 *   - podium      = position_sortie <= 3
 *   - bounty      = joueur ayant fait le plus de kills sur une session
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

  const tournoi = req.query.tournoi ? Number(req.query.tournoi) : null

  // Filtre optionnel par saison : on fait un JOIN sur evenement pour pouvoir
  // restreindre via evenement.tournoi_id (plus fiable que score.tournoi_id
  // qui peut etre null en cas de re-assignation).
  const rows = tournoi
    ? await sql<any[]>`
        select
          coalesce(sum(s.kills), 0)::int                                              as total_kills,
          count(*)::int                                                               as total_participations,
          count(*) filter (where s.position_sortie between 1 and 8)::int              as tables_finales,
          count(*) filter (where s.position_sortie = 1)::int                          as victoires,
          count(*) filter (where s.position_sortie between 1 and 3)::int              as podiums,
          min(s.position_sortie)::int                                                 as meilleure_position,
          coalesce(sum(s.carre), 0)::int                                              as total_carres,
          coalesce(sum(s.royal_flush), 0)::int                                        as total_royal_flush,
          coalesce(sum(s.flush), 0)::int                                              as total_flush,
          count(*) filter (where s.bounty = true)::int                                as total_bounty
        from score_evenement s
        join evenement e on e.id = s.evenement_id
        where s.utilisateur_id = ${utilisateur_id}
          and e.tournoi_id = ${tournoi}
      `
    : await sql<any[]>`
        select
          coalesce(sum(kills), 0)::int                                              as total_kills,
          count(*)::int                                                             as total_participations,
          count(*) filter (where position_sortie between 1 and 8)::int              as tables_finales,
          count(*) filter (where position_sortie = 1)::int                          as victoires,
          count(*) filter (where position_sortie between 1 and 3)::int              as podiums,
          min(position_sortie)::int                                                 as meilleure_position,
          coalesce(sum(carre), 0)::int                                              as total_carres,
          coalesce(sum(royal_flush), 0)::int                                        as total_royal_flush,
          coalesce(sum(flush), 0)::int                                              as total_flush,
          count(*) filter (where bounty = true)::int                                as total_bounty
        from score_evenement
        where utilisateur_id = ${utilisateur_id}
      `
  // ----- Hauts faits -----
  // Pour chaque saison (ou celle filtree), on determine le premier evenement
  // chronologique ou une main a ete enregistree (carre/royal_flush/flush).
  // Si l'utilisateur cible fait partie des joueurs ayant realise cette main
  // a cet evenement, on l'ajoute comme haut fait.
  const achievements = await sql<any[]>`
    with
    carre_first as (
      select distinct on (e.tournoi_id) e.tournoi_id, e.id as evenement_id, e.date
      from score_evenement s
      join evenement e on e.id = s.evenement_id
      where s.carre > 0
        and e.tournoi_id is not null
        ${tournoi ? sql`and e.tournoi_id = ${tournoi}` : sql``}
      order by e.tournoi_id, e.date asc, e.id asc
    ),
    rf_first as (
      select distinct on (e.tournoi_id) e.tournoi_id, e.id as evenement_id, e.date
      from score_evenement s
      join evenement e on e.id = s.evenement_id
      where s.royal_flush > 0
        and e.tournoi_id is not null
        ${tournoi ? sql`and e.tournoi_id = ${tournoi}` : sql``}
      order by e.tournoi_id, e.date asc, e.id asc
    ),
    flush_first as (
      select distinct on (e.tournoi_id) e.tournoi_id, e.id as evenement_id, e.date
      from score_evenement s
      join evenement e on e.id = s.evenement_id
      where s.flush > 0
        and e.tournoi_id is not null
        ${tournoi ? sql`and e.tournoi_id = ${tournoi}` : sql``}
      order by e.tournoi_id, e.date asc, e.id asc
    )
    select 'carre' as hand, cf.tournoi_id, cf.evenement_id, cf.date, t.nom as tournoi_nom
      from carre_first cf
      join score_evenement s on s.evenement_id = cf.evenement_id
                              and s.utilisateur_id = ${utilisateur_id}
                              and s.carre > 0
      join tournoi t on t.id = cf.tournoi_id
    union all
    select 'royal_flush' as hand, rf.tournoi_id, rf.evenement_id, rf.date, t.nom as tournoi_nom
      from rf_first rf
      join score_evenement s on s.evenement_id = rf.evenement_id
                              and s.utilisateur_id = ${utilisateur_id}
                              and s.royal_flush > 0
      join tournoi t on t.id = rf.tournoi_id
    union all
    select 'flush' as hand, ff.tournoi_id, ff.evenement_id, ff.date, t.nom as tournoi_nom
      from flush_first ff
      join score_evenement s on s.evenement_id = ff.evenement_id
                              and s.utilisateur_id = ${utilisateur_id}
                              and s.flush > 0
      join tournoi t on t.id = ff.tournoi_id
    order by date asc
  `

  return { utilisateur_id, tournoi_id: tournoi, ...rows[0], achievements }
})
