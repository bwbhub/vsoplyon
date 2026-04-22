/**
 * Utilitaires de formatage (FR).
 */

const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]
const MONTHS_FR_SHORT = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
]

export function parseDate(input) {
  if (!input) return null
  if (input instanceof Date) return input
  // MySQL peut renvoyer "YYYY-MM-DD"
  const d = new Date(typeof input === 'string' ? input.replace(' ', 'T') : input)
  return isNaN(d.getTime()) ? null : d
}

export function formatDateLong(input) {
  const d = parseDate(input)
  if (!d) return ''
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`
}

export function formatDateShort(input) {
  const d = parseDate(input)
  if (!d) return ''
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS_FR_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

export function formatMonthYear(input) {
  const d = parseDate(input)
  if (!d) return ''
  return `${MONTHS_FR_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

export function fullName(user) {
  if (!user) return ''
  const parts = [user.prenom, user.nom].filter(Boolean)
  return parts.join(' ').trim() || user.pseudo || ''
}

export function initials(user) {
  if (!user) return '?'
  const source = (user.prenom || '') + ' ' + (user.nom || user.pseudo || '')
  const chars = source
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
  return (chars || '?').toUpperCase()
}

export function formatPoints(n) {
  const num = Number(n) || 0
  return num.toLocaleString('fr-FR')
}

// Palette pour les avatars generiques (basee sur l'id pour la stabilite)
const AVATAR_COLORS = [
  'var(--primary)',
  'var(--tertiary)',
  'var(--secondary)',
  'rgba(136, 212, 204, 0.3)',
  'rgba(217, 167, 119, 0.3)',
  'rgba(231, 180, 131, 0.3)',
]
export function avatarColor(id) {
  const n = Math.abs(Number(id) || 0)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}
