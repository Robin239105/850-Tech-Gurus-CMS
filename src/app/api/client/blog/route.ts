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
    const rows = await db`SELECT * FROM blog_posts WHERE client_id = ${session.clientId} ORDER BY created_at DESC`
    return NextResponse.json(rows)
  } catch (err) {
    return NextResponse.json({ message: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  try {
    const { title, slug, category, status, content, excerpt, meta_title, meta_description } = await req.json()
    if (!title || !slug) return NextResponse.json({ message: 'Title and slug required' }, { status: 400 })
    const db = getDb()
    await db`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_title TEXT`
    await db`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_description TEXT`
    const rows = await db`
      INSERT INTO blog_posts (client_id, title, slug, category, status, content, excerpt, meta_title, meta_description)
      VALUES (${session.clientId}, ${title}, ${slug}, ${category ?? null}, ${status ?? 'draft'}, ${content ?? null}, ${excerpt ?? null}, ${meta_title ?? null}, ${meta_description ?? null})
      RETURNING *
    `
    return NextResponse.json(rows[0])
  } catch (err) {
    return NextResponse.json({ message: String(err) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  try {
    const { id, title, slug, content, excerpt, category, status, featured_image, meta_title, meta_description } = await req.json()
    const db = getDb()
    const rows = await db`
      UPDATE blog_posts SET
        title = COALESCE(${title ?? null}, title),
        slug = COALESCE(${slug ?? null}, slug),
        content = COALESCE(${content ?? null}, content),
        excerpt = COALESCE(${excerpt ?? null}, excerpt),
        category = COALESCE(${category ?? null}, category),
        status = COALESCE(${status ?? null}, status),
        featured_image = COALESCE(${featured_image ?? null}, featured_image),
        meta_title = COALESCE(${meta_title ?? null}, meta_title),
        meta_description = COALESCE(${meta_description ?? null}, meta_description),
        published_at = CASE WHEN ${status ?? null} = 'published' AND published_at IS NULL THEN NOW() ELSE published_at END,
        updated_at = NOW()
      WHERE id = ${id} AND client_id = ${session.clientId} RETURNING *
    `
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
    const db = getDb()
    await db`DELETE FROM blog_posts WHERE id = ${id} AND client_id = ${session.clientId}`
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ message: String(err) }, { status: 500 })
  }
}
