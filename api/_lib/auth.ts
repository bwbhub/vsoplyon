import jwt from 'jsonwebtoken'
import type { VercelRequest } from '@vercel/node'
import { ApiError } from './handler.js'

export interface JwtPayload {
  uid: number
  pseudo: string | null
  mail: string | null
  admin: boolean
  iat?: number
  exp?: number
}

const TOKEN_TTL = '7d'

function getSecret(): string {
  const s = process.env.JWT_SECRET
  if (!s || s.length < 16) {
    throw new Error('JWT_SECRET env var missing or too short (min 16 chars)')
  }
  return s
}

export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, getSecret(), { expiresIn: TOKEN_TTL })
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, getSecret()) as JwtPayload
  } catch {
    throw new ApiError(401, 'Invalid or expired token')
  }
}

/** Extrait et valide le token Bearer. Throws 401 si invalide / absent. */
export function requireAuth(req: VercelRequest): JwtPayload {
  const header = req.headers.authorization || ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  if (!match) throw new ApiError(401, 'Missing Bearer token')
  return verifyToken(match[1])
}

/** Idem mais exige aussi le flag admin. Throws 403 sinon. */
export function requireAdmin(req: VercelRequest): JwtPayload {
  const payload = requireAuth(req)
  if (!payload.admin) throw new ApiError(403, 'Admin only')
  return payload
}
