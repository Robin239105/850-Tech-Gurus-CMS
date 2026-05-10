import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { getClientSession } from '@/lib/client-auth'

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await sql`SELECT * FROM contact_forms WHERE client_id = ${session.clientId} ORDER BY created_at DESC`
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, fields, settings } = await req.json()
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const rows = await sql`
    INSERT INTO contact_forms (client_id, name, fields, settings, created_at)
    VALUES (${session.clientId}, ${name}, ${JSON.stringify(fields || [])}, ${JSON.stringify(settings || {})}, NOW())
    RETURNING *`
  return NextResponse.json(rows[0])
}

export async function PATCH(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, name, fields, settings } = await req.json()
  await sql`UPDATE contact_forms SET name = COALESCE(${name ?? null}, name), fields = COALESCE(${fields ? JSON.stringify(fields) : null}, fields), settings = COALESCE(${settings ? JSON.stringify(settings) : null}, settings) WHERE id = ${id} AND client_id = ${session.clientId}`
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  await sql`DELETE FROM contact_forms WHERE id = ${id} AND client_id = ${session.clientId}`
  return NextResponse.json({ ok: true })
}
