import { neon } from '@neondatabase/serverless'

function getDb() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) throw new Error('DATABASE_URL or POSTGRES_URL environment variable is not set')
  return neon(url)
}

export const sql = getDb()
