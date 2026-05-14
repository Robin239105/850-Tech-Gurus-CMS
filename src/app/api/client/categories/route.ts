import { NextRequest, NextResponse } from 'next/server'
import { getClientSession } from '@/lib/client-auth'
import { sql as db } from '@/lib/db'

export async function GET() {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await db`SELECT * FROM categories WHERE client_id = ${session.clientId} ORDER BY parent_id NULLS FIRST, name ASC`
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, slug, parent_id, description } = await req.json()
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const id = crypto.randomUUID();
    await db`
      INSERT INTO categories (id, client_id, name, slug, parent_id, description, created_at)
      VALUES (${id}, ${session.clientId}, ${name}, ${slug || name.toLowerCase().replace(/\s+/g, '-')}, ${parent_id || null}, ${description || null}, NOW())`;
    const rows = await db`SELECT * FROM categories WHERE id = ${id}`
  return NextResponse.json(rows[0])
}

export async function PATCH(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, name, slug } = await req.json()
  await db`UPDATE categories SET name = ${name}, slug = ${slug || name.toLowerCase().replace(/\s+/g, '-')} WHERE id = ${id} AND client_id = ${session.clientId}`
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  await db`DELETE FROM categories WHERE id = ${id} AND client_id = ${session.clientId}`
  return NextResponse.json({ ok: true })
}
