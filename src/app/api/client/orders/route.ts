import { NextRequest, NextResponse } from 'next/server'
import { sql as db } from '@/lib/db'
import crypto from 'crypto'
import { getClientSession } from '@/lib/client-auth'


export async function GET() {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  try {
    const rows = await db`SELECT * FROM orders WHERE client_id = ${session.clientId} ORDER BY created_at DESC`
    return NextResponse.json(rows)
  } catch (err) {
    return NextResponse.json({ message: String(err) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  try {
    const { id, fulfillment_status, payment_status } = await req.json()
    await db`
      UPDATE orders SET
        fulfillment_status = COALESCE(${fulfillment_status ?? null}, fulfillment_status),
        payment_status = COALESCE(${payment_status ?? null}, payment_status),
        updated_at = NOW()
      WHERE id = ${id} AND client_id = ${session.clientId} `;
    const rows = await db`SELECT * FROM orders WHERE id = ${id}`
    return NextResponse.json(rows[0])
  } catch (err) {
    return NextResponse.json({ message: String(err) }, { status: 500 })
  }
}
