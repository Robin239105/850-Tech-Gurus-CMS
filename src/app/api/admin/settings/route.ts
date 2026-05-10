import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { cookies } from 'next/headers'

function getDb() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) throw new Error('DATABASE_URL not set')
  return neon(url)
}

async function requireAdmin() {
  const cookieStore = await cookies()
  return !!cookieStore.get('admin_session')
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  try {
    const db = getDb()
    const rows = await db`SELECT key, value FROM platform_settings`
    const settings = Object.fromEntries(rows.map((r) => [(r as Record<string, string>).key, (r as Record<string, string>).value]))
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ message: 'Database error', error: String(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  try {
    const db = getDb()
    const body = await req.json()
    for (const [key, value] of Object.entries(body)) {
      await db`
        INSERT INTO platform_settings (key, value, updated_at)
        VALUES (${key}, ${String(value)}, NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ message: 'Save failed', error: String(error) }, { status: 500 })
  }
}
