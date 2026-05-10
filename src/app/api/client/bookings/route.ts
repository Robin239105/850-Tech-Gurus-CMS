import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { getClientSession } from '@/lib/client-auth'

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await sql`SELECT * FROM bookings WHERE client_id = ${session.clientId} ORDER BY booking_date DESC, booking_time ASC`
  return NextResponse.json(rows)
}

export async function PATCH(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, status, notes } = await req.json()
  await sql`UPDATE bookings SET status = COALESCE(${status}, status), notes = COALESCE(${notes ?? null}, notes) WHERE id = ${id} AND client_id = ${session.clientId}`
  return NextResponse.json({ ok: true })
}
