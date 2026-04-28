import postgres from 'postgres'

/**
 * Client Postgres serverless-friendly (lib `postgres` de porsager).
 * Reutilise une connexion entre warm starts pour limiter les cold starts.
 *
 * Variables d'environnement attendues :
 *   DATABASE_URL : connection string Supabase (Pooler / port 6543, mode "transaction")
 *
 * Sur Supabase :
 *   Project Settings > Database > Connection string > "Transaction pooler"
 */

declare global {
  // eslint-disable-next-line no-var
  var __pgSql: ReturnType<typeof postgres> | undefined
}

function build() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('Missing DATABASE_URL env var')
  return postgres(url, {
    max: 5,
    idle_timeout: 20,
    prepare: false, // requis pour le pooler "transaction" de Supabase
    connection: { application_name: 'vsop-lyon-api' },
  })
}

export const sql = globalThis.__pgSql ?? (globalThis.__pgSql = build())
