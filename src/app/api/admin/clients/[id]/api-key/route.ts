import { NextRequest, NextResponse } from 'next/server'
import { sql as db } from '@/lib/db'
import crypto from 'crypto'
import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'


async function requireAdmin() {
  const cookieStore = await cookies()
  return !!cookieStore.get('admin_session')
}

// GET — fetch current API key for a client
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  const { id } = await params
  const rows = await db`SELECT api_key FROM clients WHERE id = ${id}`
  return NextResponse.json({ api_key: (rows[0] as { api_key: string | null } | undefined)?.api_key ?? null })
}

// POST — generate (or regenerate) API key for a client
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  const { id } = await params
  const apiKey = 'sk_850_' + randomBytes(24).toString('hex')
  await db`UPDATE clients SET api_key = ${apiKey} WHERE id = ${id}`
  await db`
    INSERT INTO activity_log (type, description, actor)
    VALUES ('settings_changed', ${'API key generated for client ' + id}, 'Admin')
  `
  return NextResponse.json({ api_key: apiKey })
}
