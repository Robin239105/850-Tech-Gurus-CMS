import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string; slug: string }> }
) {
  const { clientId, slug } = await params
  const rows = await sql`
    SELECT id, title, slug, excerpt, content, featured_image, author, status, created_at, updated_at
    FROM blog_posts
    WHERE client_id = ${clientId} AND slug = ${slug} AND status = 'published'
    LIMIT 1
  `
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rows[0], {
    headers: { 'Access-Control-Allow-Origin': '*' },
  })
}
