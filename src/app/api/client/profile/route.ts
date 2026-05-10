import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { getClientSession } from '@/lib/client-auth'
import bcrypt from 'bcryptjs'

const sql = neon(process.env.DATABASE_URL!)

export async function PATCH(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  if (body.name !== undefined) {
    await sql`UPDATE clients SET name = ${body.name}, updated_at = NOW() WHERE id = ${session.clientId}`
    return NextResponse.json({ ok: true })
  }

  if (body.currentPassword && body.newPassword) {
    const rows = await sql`SELECT password_hash FROM clients WHERE id = ${session.clientId}`
    if (!rows[0]) return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    const valid = await bcrypt.compare(body.currentPassword, rows[0].password_hash)
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    const hash = await bcrypt.hash(body.newPassword, 12)
    await sql`UPDATE clients SET password_hash = ${hash}, updated_at = NOW() WHERE id = ${session.clientId}`
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
}
