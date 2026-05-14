import { NextRequest, NextResponse } from 'next/server'
import { sql as db } from '@/lib/db'
import crypto from 'crypto'
import { cookies } from 'next/headers'


async function requireAdmin() {
  const cookieStore = await cookies()
  return !!cookieStore.get('admin_session')
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  try {
    const rows = await db`SELECT setting_key, setting_value FROM platform_settings`
    const settings = Object.fromEntries(rows.map((r) => [(r as Record<string, string>).setting_key, (r as Record<string, string>).setting_value]))
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ message: 'Database error', error: String(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  try {
    const body = await req.json()
    for (const [key, value] of Object.entries(body)) {
      await db`
        INSERT INTO platform_settings (setting_key, setting_value, updated_at)
        VALUES (${key}, ${String(value)}, NOW())
        ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW()
      `
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ message: 'Save failed', error: String(error) }, { status: 500 })
  }
}
