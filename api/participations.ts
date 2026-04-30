import type { VercelRequest, VercelResponse } from '@vercel/node'
import { withApi, ApiError, requireMethod } from './_lib/handler.js'
import { sql } from './_lib/db.js'
import { requireAuth } from './_lib/auth.js'

/**
 * Participations ("Je viens") a un evenement.
 *
 *   GET    /api/participations?evenement=42  -> liste des participants (+ count)
 *   GET    /api/participations?me=1          -> mes participations a venir
 *   POST   /api/participations  { evenement_id } -> s'inscrire (idempotent)
 *   DELETE /api/participations?evenement=42  -> se desinscrire
 */
export default withApi(async (req: VercelRequest, _res: VercelResponse) => {
  const method = requireMethod(req, ['GET', 'POST', 'DELETE'])
  const token = requireAuth(req)

  if (method === 'GET') {
    if (req.query.me) {
      const rows = await sql`
        select p.evenement_id, p.created_at, e.date, e.nom, e.lieu_id
        from participation p
        join evenement e on e.id = p.evenement_id
        where p.utilisateur_id = ${token.uid}
          and e.date >= now()
        order by e.date asc
      `
      return rows
    }

    const evenement = req.query.evenement ? Number(req.query.evenement) : null
    if (!evenement) throw new ApiError(400, 'Specify ?evenement or ?me=1')

    const participants = await sql`
      select u.id, u.nom, u.prenom, u.pseudo, p.created_at
      from participation p
      join utilisateur u on u.id = p.utilisateur_id
      where p.evenement_id = ${evenement}
      order by p.created_at asc
    `
    const mine = participants.some((p: any) => Number(p.id) === Number(token.uid))
    return { evenement_id: evenement, count: participants.length, mine, participants }
  }

  if (method === 'POST') {
    const body = (req.body ?? {}) as Record<string, any>
    const evenement_id = Number(body.evenement_id)
    if (!evenement_id) throw new ApiError(422, 'Missing evenement_id')

    // Idempotent : si deja inscrit, pas d'erreur
    const rows = await sql`
      insert into participation (utilisateur_id, evenement_id)
      values (${token.uid}, ${evenement_id})
      on conflict (utilisateur_id, evenement_id) do nothing
      returning id
    `
    return { ok: true, created: rows.length > 0, evenement_id }
  }

  // DELETE
  // - sans ?utilisateur : l'utilisateur courant se desinscrit lui-meme
  // - avec ?utilisateur=X : un admin retire l'inscription d'un autre joueur
  const evenement = req.query.evenement ? Number(req.query.evenement) : Number((req.body as any)?.evenement_id)
  if (!evenement) throw new ApiError(400, 'Specify ?evenement')

  const targetUser = req.query.utilisateur ? Number(req.query.utilisateur) : Number(token.uid)
  if (targetUser !== Number(token.uid)) {
    if (!token.admin) throw new ApiError(403, 'Admin only')
  }

  await sql`
    delete from participation
    where utilisateur_id = ${targetUser}
      and evenement_id = ${evenement}
  `
  return { ok: true, evenement_id: evenement, utilisateur_id: targetUser }
})
