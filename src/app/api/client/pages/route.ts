import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { getClientSession } from '@/lib/client-auth'

function getDb() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) throw new Error('DATABASE_URL not set')
  return neon(url)
}

export async function GET() {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  try {
    const db = getDb()
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
    const db = getDb()
    const rows = await db`
      INSERT INTO client_pages (client_id, title, slug, status, content)
      VALUES (${session.clientId}, ${title}, ${slug}, ${status ?? 'draft'}, ${JSON.stringify(content ?? {})})
      RETURNING *
    `
    return NextResponse.json(rows[0])
  } catch (err) {
    return NextResponse.json({ message: String(err) }, { status: 500 })
  }
}
