import { NextRequest, NextResponse } from 'next/server'
import { sql as db } from '@/lib/db'
import crypto from 'crypto'
import { getClientSession } from '@/lib/client-auth'


export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  const { id } = await params
  try {
    const { title, slug, status, content } = await req.json()
    await db`
      UPDATE client_pages SET
        title = COALESCE(${title}, title),
        slug = COALESCE(${slug}, slug),
        status = COALESCE(${status}, status),
        content = COALESCE(${content ? JSON.stringify(content) : null}::jsonb, content),
        updated_at = NOW()
      WHERE id = ${id} AND client_id = ${session.clientId}
      `;
    const rows = await db`SELECT * FROM client_pages WHERE id = ${id}`
    if (!rows.length) return NextResponse.json({ message: 'Not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (err) {
    return NextResponse.json({ message: String(err) }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  const { id } = await params
  try {
    await db`DELETE FROM client_pages WHERE id = ${id} AND client_id = ${session.clientId}`
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ message: String(err) }, { status: 500 })
  }
}
