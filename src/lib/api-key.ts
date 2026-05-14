import { sql as db } from '@/lib/db'
import { NextRequest } from 'next/server'

/**
 * Validates X-CMS-Key header and returns the clientId if valid.
 * Returns null if invalid / missing.
 */
export async function validateApiKey(req: NextRequest): Promise<string | null> {
  const apiKey = req.headers.get('X-CMS-Key') || req.headers.get('x-cms-key')
  if (!apiKey) return null

  try {
    const rows = await db`
      SELECT id FROM clients
      WHERE api_key = ${apiKey} AND status != 'suspended'
      LIMIT 1
    `
    return (rows[0] as { id: string } | undefined)?.id ?? null
  } catch {
    return null
  }
}
