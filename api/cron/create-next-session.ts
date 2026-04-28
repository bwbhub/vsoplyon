import type { VercelRequest, VercelResponse } from '@vercel/node'
import { withApi, ApiError } from '../_lib/handler.js'
import { sql } from '../_lib/db.js'

/**
 * Cron : cree automatiquement la session du MERCREDI SUIVANT si elle n'existe pas.
 *
 * - Declenche par Vercel Cron (voir vercel.json) tous les jours a 06:00 UTC.
 * - Idempotent : si un evenement existe deja a cette date, ne fait rien.
 * - Rattache la session au tournoi actif (le plus recent non termine).
 *
 * Securite :
 *   Vercel Cron envoie un header `Authorization: Bearer <CRON_SECRET>`.
 *   On rejette toute requete qui ne porte pas ce secret.
 */

// Retourne le prochain mercredi a 20h00 locales (Europe/Paris).
// On stocke en UTC : 20h Paris = 18h UTC en ete, 19h UTC en hiver.
// On choisit 19h UTC (legere imprecision d'1h selon DST, corrigible par l'admin).
function nextWednesday20h(ref = new Date()): Date {
  const d = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate()))
  const day = d.getUTCDay() // 0=Dim ... 3=Mer ... 6=Sam
  let delta = (3 - day + 7) % 7
  if (delta === 0) delta = 7 // toujours le MERCREDI SUIVANT (jamais aujourd'hui)
  d.setUTCDate(d.getUTCDate() + delta)
  d.setUTCHours(19, 0, 0, 0)
  return d
}

export default withApi(async (req: VercelRequest, _res: VercelResponse) => {
  // Auth cron
  const expected = process.env.CRON_SECRET
  if (expected) {
    const header = (req.headers.authorization as string) || ''
    if (header !== `Bearer ${expected}`) {
      throw new ApiError(401, 'Unauthorized')
    }
  }

  const date = nextWednesday20h()
  const isoDate = date.toISOString()

  // Tournoi actif : le plus recent dont la date_fin est future ou nulle
  const tournois = await sql<{ id: number }[]>`
    select id from tournoi
    where (date_fin is null or date_fin >= current_date)
    order by date_debut desc nulls last, id desc
    limit 1
  `
  const tournoiId = tournois[0]?.id ?? null

  // Idempotent : un seul evenement par journee
  const existing = await sql<{ id: number }[]>`
    select id from evenement
    where date >= ${isoDate}::timestamptz - interval '12 hours'
      and date <  ${isoDate}::timestamptz + interval '12 hours'
    limit 1
  `
  if (existing.length) {
    return { created: false, event_id: existing[0].id, date: isoDate, message: 'already exists' }
  }

  const rows = await sql<{ id: number }[]>`
    insert into evenement (date, lieu_id, tournoi_id, nom)
    values (${isoDate}::timestamptz, null, ${tournoiId}, 'Session du mercredi')
    returning id
  `
  return { created: true, event_id: rows[0].id, date: isoDate, tournoi_id: tournoiId }
})
