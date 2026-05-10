import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { getClientSession } from '@/lib/client-auth'

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await sql`SELECT * FROM navigation_menus WHERE client_id = ${session.clientId} ORDER BY created_at ASC`
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { menu_name, items } = await req.json()
  const rows = await sql`
    INSERT INTO navigation_menus (client_id, menu_name, items, created_at, updated_at)
    VALUES (${session.clientId}, ${menu_name || 'Main Menu'}, ${JSON.stringify(items || [])}, NOW(), NOW())
    ON CONFLICT (client_id, menu_name) DO UPDATE SET items = EXCLUDED.items, updated_at = NOW()
    RETURNING *`
  return NextResponse.json(rows[0])
}
