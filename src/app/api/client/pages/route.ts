import { NextRequest, NextResponse } from 'next/server'
import { sql as db } from '@/lib/db'
import crypto from 'crypto'
import { getClientSession } from '@/lib/client-auth'


export async function GET() {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  try {
    const rows = await db`SELECT * FROM client_pages WHERE client_id = ${session.clientId} ORDER BY updated_at DESC`
    return NextResponse.json(rows)
  } catch (err) {
    return NextResponse.json({ message: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  try {
    const { title, slug, status, content } = await req.json()
    if (!title || !slug) return NextResponse.json({ message: 'Title and slug required' }, { status: 400 })
    const id = crypto.randomUUID();
    await db`
      INSERT INTO client_pages (id, client_id, title, slug, status, content)
      VALUES (${id}, ${session.clientId}, ${title}, ${slug}, ${status ?? 'draft'}, ${JSON.stringify(content ?? {})})`;
    const rows = await db`SELECT * FROM client_pages WHERE id = ${id}`
    return NextResponse.json(rows[0])
  } catch (err) {
    return NextResponse.json({ message: String(err) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  try {
    const { id, title, slug, status, content } = await req.json()
    await db`
      UPDATE client_pages SET
        title = COALESCE(${title ?? null}, title),
        slug = COALESCE(${slug ?? null}, slug),
        status = COALESCE(${status ?? null}, status),
        content = COALESCE(${content != null ? JSON.stringify(content) : null}, content),
        updated_at = NOW()
      WHERE id = ${id} AND client_id = ${session.clientId} `;
    const rows = await db`SELECT * FROM client_pages WHERE id = ${id}`
    return NextResponse.json(rows[0])
  } catch (err) {
    return NextResponse.json({ message: String(err) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  try {
    const { id } = await req.json()
    await db`DELETE FROM client_pages WHERE id = ${id} AND client_id = ${session.clientId}`
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ message: String(err) }, { status: 500 })
  }
}
