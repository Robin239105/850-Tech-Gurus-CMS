import { NextResponse } from 'next/server'
import { getClientSession } from '@/lib/client-auth'
import { sql as db } from '@/lib/db'
import crypto from 'crypto'


export async function GET() {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  try {
    const rows = await db`SELECT id, name, email, plan, status, storage, storage_limit, website FROM clients WHERE id = ${session.clientId}`
    if (!rows.length) return NextResponse.json({ message: 'Not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (err) {
    return NextResponse.json({ message: String(err) }, { status: 500 })
  }
}
