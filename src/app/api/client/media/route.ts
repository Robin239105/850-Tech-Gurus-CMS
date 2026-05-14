import { NextRequest, NextResponse } from 'next/server'
import { sql as db } from '@/lib/db'
import crypto from 'crypto'
import { getClientSession } from '@/lib/client-auth'


export async function GET() {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  try {
    const rows = await db`SELECT * FROM media_files WHERE client_id = ${session.clientId} ORDER BY created_at DESC`
    return NextResponse.json(rows)
  } catch (err) {
    return NextResponse.json({ message: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, url, file_type, file_size, type } = await req.json()
  if (!name || !url) return NextResponse.json({ error: 'name and url required' }, { status: 400 })
  const id = crypto.randomUUID();
    await db`
      INSERT INTO media_files (id, client_id, name, url, file_type, file_size, type, created_at)
      VALUES (${id}, ${session.clientId}, ${name}, ${url}, ${file_type || 'application/octet-stream'}, ${file_size || 0}, ${type || 'other'}, NOW())`;
    const rows = await db`SELECT * FROM media_files WHERE id = ${id}`
  return NextResponse.json(rows[0])
}

export async function DELETE(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  await db`DELETE FROM media_files WHERE id = ${id} AND client_id = ${session.clientId}`
  return NextResponse.json({ ok: true })
}
