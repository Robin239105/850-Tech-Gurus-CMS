import { neon, NeonQueryFunction } from '@neondatabase/serverless'

let _sql: NeonQueryFunction<false, false> | null = null

function getClient(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
    if (!url) throw new Error('DATABASE_URL or POSTGRES_URL environment variable is not set')
    _sql = neon(url)
  }
  return _sql
}

export function getDb() {
  return getClient()
}

export const sql: NeonQueryFunction<false, false> = new Proxy(
  {} as NeonQueryFunction<false, false>,
  {
    apply(_target, _thisArg, args) {
      return (getClient() as unknown as (...a: unknown[]) => unknown)(...args)
    },
    get(_target, prop) {
      return (getClient() as unknown as Record<string | symbol, unknown>)[prop]
    },
  }
)
