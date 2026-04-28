import bcrypt from 'bcryptjs'

/**
 * Verifie un mot de passe contre un hash bcrypt.
 * Le repo demarre avec une BDD vierge : tous les mots de passe sont stockes
 * en bcrypt, plus aucun format legacy a gerer.
 */
export function verifyPassword(input: string, stored: string): boolean {
  if (!stored) return false
  return bcrypt.compareSync(input, stored)
}

/** Hashe un mot de passe en bcrypt (cost 10). */
export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10)
}
