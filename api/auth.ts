import type { VercelRequest, VercelResponse } from '@vercel/node'
import { withApi, ApiError, requireMethod } from './_lib/handler.js'
import { sql } from './_lib/db.js'
import { signToken } from './_lib/auth.js'
import { verifyPassword } from './_lib/password.js'

interface UserRow {
  id: number
  nom: string
  prenom: string
  pseudo: string | null
  mail: string
  tel: string | null
  password: string
  admin: boolean
}

export default withApi(async (req: VercelRequest, _res: VercelResponse) => {
  requireMethod(req, ['POST'])

  const body = (req.body ?? {}) as { login?: string; password?: string }
  const login = (body.login ?? '').trim()
  const password = body.password ?? ''

  if (!login || !password) {
    throw new ApiError(422, 'Missing login or password')
  }

  const rows = await sql<UserRow[]>`
    SELECT *
    FROM utilisateur
    WHERE lower(pseudo) = lower(${login})
       OR lower(mail)   = lower(${login})
    LIMIT 1
  `
  const user = rows[0]
  if (!user) throw new ApiError(401, 'Invalid credentials')

  if (!verifyPassword(password, user.password)) {
    throw new ApiError(401, 'Invalid credentials')
  }

  const token = signToken({
    uid: user.id,
    pseudo: user.pseudo,
    mail: user.mail,
    admin: user.admin,
  })

  const { password: _p, ...safe } = user
  return { token, user: safe }
})
