import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql as db } from '@/lib/db'
import crypto from 'crypto'


async function getClientId(): Promise<string | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get('client_session')?.value
  if (!session) return null
  try {
    const decoded = Buffer.from(session, 'base64').toString('utf8')
    const data = JSON.parse(decoded)
    return data.clientId ?? null
  } catch {
    return null
  }
}

export async function GET() {
  const clientId = await getClientId()
  if (!clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const rows = await db`SELECT setting_key, setting_value FROM client_settings WHERE client_id = ${clientId}`
    const settings = Object.fromEntries(rows.map((r) => [(r as Record<string, string>).setting_key, (r as Record<string, string>).setting_value]))
    return NextResponse.json(settings)
  } catch {
    return NextResponse.json({})
  }
}

export async function POST(req: NextRequest) {
  const clientId = await getClientId()
  if (!clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json() as Record<string, string>
    for (const [key, value] of Object.entries(body)) {
      await db`
        INSERT INTO client_settings (client_id, setting_key, setting_value)
        VALUES (${clientId}, ${key}, ${String(value)})
        ON CONFLICT (client_id, setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW()
      `
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
