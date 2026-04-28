import type { VercelRequest, VercelResponse } from '@vercel/node'
import { withApi, ApiError, requireMethod, parseId } from './_lib/handler.js'
import { sql } from './_lib/db.js'
import { requireAuth } from './_lib/auth.js'

export default withApi(async (req: VercelRequest, _res: VercelResponse) => {
  requireMethod(req, ['GET'])
  requireAuth(req)

  if (req.query.id) {
    const id = parseId(req)
    const rows = await sql`SELECT * FROM tournoi WHERE id = ${id}`
    if (!rows[0]) throw new ApiError(404, 'Tournoi not found')
    return rows[0]
  }

  return await sql`SELECT * FROM tournoi ORDER BY id DESC`
})
