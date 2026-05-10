import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

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
  const { clientId, slug } = await params
  const rows = await sql`
    SELECT id, title, slug, content, meta_title, meta_description, status, created_at, updated_at
    FROM pages
    WHERE client_id = ${clientId} AND slug = ${slug} AND status = 'published'
    LIMIT 1
  `
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rows[0], {
    headers: { 'Access-Control-Allow-Origin': '*' },
  })
}
