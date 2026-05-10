import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { getClientSession } from '@/lib/client-auth'

function getDb() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) throw new Error('DATABASE_URL not set')
  return neon(url)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  const { id } = await params
  try {
    const { title, slug, status, content } = await req.json()
    const db = getDb()
    const rows = await db`
      UPDATE client_pages SET
        title = COALESCE(${title}, title),
        slug = COALESCE(${slug}, slug),
        status = COALESCE(${status}, status),
        content = COALESCE(${content ? JSON.stringify(content) : null}::jsonb, content),
        updated_at = NOW()
      WHERE id = ${id} AND client_id = ${session.clientId}
      RETURNING *
    `
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
    const db = getDb()
    await db`DELETE FROM client_pages WHERE id = ${id} AND client_id = ${session.clientId}`
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ message: String(err) }, { status: 500 })
  }
}
