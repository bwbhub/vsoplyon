import type { VercelRequest, VercelResponse } from '@vercel/node'
import { withApi, requireMethod } from './_lib/handler.js'
import { sql } from './_lib/db.js'
import { requireAuth } from './_lib/auth.js'

export default withApi(async (req: VercelRequest, _res: VercelResponse) => {
  requireMethod(req, ['GET'])
  requireAuth(req)
  return await sql`SELECT id, nom, adresse FROM lieu ORDER BY nom`
})
