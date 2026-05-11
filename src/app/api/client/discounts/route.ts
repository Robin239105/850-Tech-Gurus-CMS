import { NextRequest, NextResponse } from 'next/server'
import { getClientSession } from '@/lib/client-auth'
import { getDb } from '@/lib/db'

export async function GET() {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getDb()
  const rows = await db`SELECT * FROM discounts WHERE client_id = ${session.clientId} ORDER BY created_at DESC`
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { code, type, amount, min_order, usage_limit, expiry_date, active } = await req.json()
  if (!code || !type || amount === undefined) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const db = getDb()
  const rows = await db`
    INSERT INTO discounts (client_id, code, type, amount, min_order, usage_limit, used_count, expiry_date, active, created_at)
    VALUES (${session.clientId}, ${code.toUpperCase()}, ${type}, ${amount}, ${min_order || 0}, ${usage_limit || null}, 0, ${expiry_date || null}, ${active !== false}, NOW())
    RETURNING *`
  return NextResponse.json(rows[0])
}

export async function PATCH(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, active, code, type, amount, min_order, usage_limit, expiry_date } = await req.json()
  const db = getDb()
  await db`
    UPDATE discounts SET
      active = COALESCE(${active ?? null}, active),
      code = COALESCE(${code ?? null}, code),
      type = COALESCE(${type ?? null}, type),
      amount = COALESCE(${amount ?? null}, amount),
      min_order = COALESCE(${min_order ?? null}, min_order),
      usage_limit = COALESCE(${usage_limit ?? null}, usage_limit),
      expiry_date = COALESCE(${expiry_date ?? null}, expiry_date)
    WHERE id = ${id} AND client_id = ${session.clientId}`
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  const db = getDb()
  await db`DELETE FROM discounts WHERE id = ${id} AND client_id = ${session.clientId}`
  return NextResponse.json({ ok: true })
}
