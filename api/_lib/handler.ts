import type { VercelRequest, VercelResponse } from '@vercel/node'

/** Erreur metier qui sera convertie en reponse JSON propre. */
export class ApiError extends Error {
  constructor(public status: number, message: string, public extra?: Record<string, any>) {
    super(message)
  }
}

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<unknown> | unknown

/**
 * Wrap d'un handler avec :
 *  - CORS (autorise toutes les origines en dev, configurable via CORS_ORIGINS)
 *  - Reponse OPTIONS preflight automatique
 *  - Capture des ApiError + erreurs inattendues -> JSON
 */
export function withApi(handler: Handler) {
  return async (req: VercelRequest, res: VercelResponse) => {
    applyCors(req, res)

    if (req.method === 'OPTIONS') {
      res.status(204).end()
      return
    }

    try {
      const result = await handler(req, res)
      if (!res.headersSent && result !== undefined) {
        res.status(200).json(result)
      }
    } catch (err: any) {
      const debug = process.env.DEBUG_API === '1'
      if (err instanceof ApiError) {
        res.status(err.status).json({ error: err.message, ...(err.extra ?? {}) })
      } else {
        const msg = debug ? String(err?.message || err) : 'Internal server error'
        if (debug) console.error(err)
        res.status(500).json({ error: msg })
      }
    }
  }
}

function applyCors(req: VercelRequest, res: VercelResponse) {
  const origin = (req.headers.origin as string) || ''
  const allowed = (process.env.CORS_ORIGINS || '*')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean)

  if (allowed.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', '*')
  } else if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Max-Age', '86400')
}

/** Helper : exige une methode parmi la liste, sinon 405. */
export function requireMethod(req: VercelRequest, allowed: string[]) {
  const m = (req.method || 'GET').toUpperCase()
  if (!allowed.includes(m)) {
    throw new ApiError(405, `Method not allowed (allowed: ${allowed.join(', ')})`)
  }
  return m
}

/** Helper : parse un id depuis query.id, throws 400 si manquant/invalide. */
export function parseId(req: VercelRequest, key = 'id'): number {
  const raw = req.query[key]
  const v = Array.isArray(raw) ? raw[0] : raw
  const n = Number(v)
  if (!v || !Number.isFinite(n) || n <= 0) {
    throw new ApiError(400, `Missing or invalid ${key}`)
  }
  return n
}
