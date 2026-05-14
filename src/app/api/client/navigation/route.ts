import { NextRequest, NextResponse } from 'next/server'
import { getClientSession } from '@/lib/client-auth'
import { sql as db } from '@/lib/db'

export async function GET() {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await db`SELECT * FROM navigation_menus WHERE client_id = ${session.clientId} ORDER BY created_at ASC`
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { menu_name, items } = await req.json()
  const id = crypto.randomUUID();
    await db`
      INSERT INTO navigation_menus (id, client_id, menu_name, items, created_at, updated_at)
      VALUES (${id}, ${session.clientId}, ${menu_name || 'Main Menu'}, ${JSON.stringify(items || [])}, NOW(), NOW())
    ON CONFLICT (client_id, menu_name) DO UPDATE SET items = EXCLUDED.items, updated_at = NOW()`;
    const rows = await db`SELECT * FROM navigation_menus WHERE id = ${id}`
  return NextResponse.json(rows[0])
}
