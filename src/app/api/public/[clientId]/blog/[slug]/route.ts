import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

function getDb() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) throw new Error('DATABASE_URL not set')
  return neon(url)
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string; slug: string }> }
) {
  try {
    const { clientId, slug } = await params
    const db = getDb()
    const rows = await db`
      SELECT id, title, slug, excerpt, content, featured_image, status, created_at, updated_at
      FROM blog_posts
      WHERE client_id = ${clientId} AND slug = ${slug} AND status = 'published'
      LIMIT 1
    `
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } })
    return NextResponse.json(rows[0], {
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  }
}
