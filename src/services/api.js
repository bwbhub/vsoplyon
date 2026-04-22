/**
 * Client API centralisé.
 * L'URL de base est définie par la variable d'environnement VITE_API_URL
 * - en local : http://localhost:8000/api
 * - en prod  : https://vsop-lyon.fr/api
 */

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '')

const TOKEN_KEY = 'vsop_token'
const USER_KEY = 'vsop_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}
export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}
export function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

async function request(path, { method = 'GET', body, params } = {}) {
  const url = new URL(BASE_URL + path, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
    })
  }

  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  let data = null
  const text = await res.text()
  try { data = text ? JSON.parse(text) : null } catch { data = { raw: text } }

  if (!res.ok) {
    const msg = (data && data.error) || `HTTP ${res.status}`
    const err = new Error(msg)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

/* -------- Auth -------- */
export const auth = {
  async login(login, password) {
    const data = await request('/auth.php', { method: 'POST', body: { login, password } })
    setAuth(data.token, data.user)
    return data
  },
  logout() { clearAuth() },
  current() { return getStoredUser() },
}

/* -------- Users -------- */
export const users = {
  list: (search) => request('/users.php', { params: { search } }),
  get:  (id)     => request('/users.php', { params: { id } }),
  create: (data) => request('/users.php', { method: 'POST', body: data }),
  update: (id, data) => request('/users.php', { method: 'PUT', body: data, params: { id } }),
  remove: (id)   => request('/users.php', { method: 'DELETE', params: { id } }),
}

/* -------- Tournois -------- */
export const tournois = {
  list: ()   => request('/tournois.php'),
  get:  (id) => request('/tournois.php', { params: { id } }),
}

/* -------- Lieux -------- */
export const lieux = {
  list: () => request('/lieux.php'),
}

/* -------- Evenements (sessions) -------- */
export const evenements = {
  list: (opts = {}) => request('/evenements.php', { params: opts }),
  get:  (id)        => request('/evenements.php', { params: { id } }),
  upcoming: (limit = 1) => request('/evenements.php', { params: { upcoming: 1, limit } }),
  recent:   (limit = 5) => request('/evenements.php', { params: { recent: 1, limit } }),
  byTournoi: (tournoi)  => request('/evenements.php', { params: { tournoi } }),
}

/* -------- Scores -------- */
export const scores = {
  byEvenement:   (evenement)   => request('/scores.php', { params: { evenement } }),
  byUtilisateur: (utilisateur) => request('/scores.php', { params: { utilisateur } }),
  byTournoi:     (tournoi)     => request('/scores.php', { params: { tournoi } }),
  create: (data) => request('/scores.php', { method: 'POST', body: data }),
}

/* -------- Leaderboard -------- */
export const leaderboard = {
  byTournoi: (tournoi, limit = 100) => request('/leaderboard.php', { params: { tournoi, limit } }),
  allTime:   (limit = 100)          => request('/leaderboard.php', { params: { all: 1, limit } }),
}

export default { auth, users, tournois, lieux, evenements, scores, leaderboard }
