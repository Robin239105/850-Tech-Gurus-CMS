import { NextRequest, NextResponse } from 'next/server'
import { getClientSession } from '@/lib/client-auth'
import { getDb } from '@/lib/db'

export async function GET() {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getDb()
  const rows = await db`SELECT * FROM bookings WHERE client_id = ${session.clientId} ORDER BY booking_date DESC, booking_time ASC`
  return NextResponse.json(rows)
}

export async function PATCH(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, status, notes } = await req.json()
  const db = getDb()
  await db`UPDATE bookings SET status = COALESCE(${status}, status), notes = COALESCE(${notes ?? null}, notes) WHERE id = ${id} AND client_id = ${session.clientId}`
  return NextResponse.json({ ok: true })
}
