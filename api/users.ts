import type { VercelRequest, VercelResponse } from '@vercel/node'
import { withApi, ApiError, parseId } from './_lib/handler.js'
import { sql } from './_lib/db.js'
import { requireAuth, requireAdmin } from './_lib/auth.js'
import { hashPassword } from './_lib/password.js'

const PUBLIC_FIELDS = sql`id, nom, prenom, pseudo, mail, tel, admin, created_at`

export default withApi(async (req: VercelRequest, _res: VercelResponse) => {
  const method = (req.method || 'GET').toUpperCase()

  switch (method) {
    case 'GET': {
      requireAuth(req)
      if (req.query.id) {
        const id = parseId(req)
        const rows = await sql`SELECT ${PUBLIC_FIELDS} FROM utilisateur WHERE id = ${id}`
        if (!rows[0]) throw new ApiError(404, 'User not found')
        return rows[0]
      }
      const search = (req.query.search as string | undefined)?.trim()
      if (search) {
        const like = `%${search}%`
        return await sql`
          SELECT ${PUBLIC_FIELDS}
          FROM utilisateur
          WHERE nom ILIKE ${like}
             OR prenom ILIKE ${like}
             OR pseudo ILIKE ${like}
             OR mail ILIKE ${like}
          ORDER BY nom, prenom
        `
      }
      return await sql`SELECT ${PUBLIC_FIELDS} FROM utilisateur ORDER BY nom, prenom`
    }

    case 'POST': {
      requireAdmin(req)
      const body = (req.body ?? {}) as Record<string, any>
      if (!body.nom || !body.prenom || !body.mail) {
        throw new ApiError(422, 'Missing nom, prenom or mail')
      }
      const passwordHash = body.password ? hashPassword(String(body.password)) : ''
      const admin = body.admin === true || body.admin === 'Oui' || body.admin === 'true'

      const rows = await sql`
        INSERT INTO utilisateur (nom, prenom, pseudo, mail, tel, password, admin)
        VALUES (
          ${body.nom},
          ${body.prenom},
          ${body.pseudo ?? null},
          ${body.mail},
          ${body.tel ?? null},
          ${passwordHash},
          ${admin}
        )
        RETURNING ${PUBLIC_FIELDS}
      `
      return rows[0]
    }

    case 'PUT':
    case 'PATCH': {
      requireAdmin(req)
      const id = parseId(req)
      const body = (req.body ?? {}) as Record<string, any>

      const updates: Record<string, any> = {}
      const allowed = ['nom', 'prenom', 'pseudo', 'mail', 'tel', 'admin']
      for (const f of allowed) {
        if (Object.prototype.hasOwnProperty.call(body, f)) updates[f] = body[f]
      }
      if (body.password) updates.password = hashPassword(String(body.password))
      if (Object.prototype.hasOwnProperty.call(updates, 'admin')) {
        updates.admin = updates.admin === true || updates.admin === 'Oui' || updates.admin === 'true'
      }
      if (Object.keys(updates).length === 0) throw new ApiError(422, 'No fields to update')

      const rows = await sql`
        UPDATE utilisateur SET ${sql(updates)} WHERE id = ${id}
        RETURNING ${PUBLIC_FIELDS}
      `
      if (!rows[0]) throw new ApiError(404, 'User not found')
      return rows[0]
    }

    case 'DELETE': {
      requireAdmin(req)
      const id = parseId(req)
      const rows = await sql`DELETE FROM utilisateur WHERE id = ${id} RETURNING id`
      return { deleted: rows.length }
    }

    default:
      throw new ApiError(405, 'Method not allowed')
  }
})
