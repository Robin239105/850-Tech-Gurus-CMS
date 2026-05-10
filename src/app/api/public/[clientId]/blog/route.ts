import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(
  _req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const { clientId } = params
  const rows = await sql`
    SELECT id, title, slug, excerpt, content, featured_image, author, status, created_at, updated_at
    FROM blog_posts
    WHERE client_id = ${clientId} AND status = 'published'
    ORDER BY created_at DESC
  `
  return NextResponse.json(rows, {
    headers: { 'Access-Control-Allow-Origin': '*' },
  })
}
