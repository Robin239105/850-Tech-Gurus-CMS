import { NextRequest, NextResponse } from 'next/server'
import { sql as db } from '@/lib/db'
import crypto from 'crypto'


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
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params
    const rows = await db`
      SELECT id, title, slug, excerpt, content, featured_image, status, created_at, updated_at
      FROM blog_posts
      WHERE client_id = ${clientId} AND status = 'published'
      ORDER BY created_at DESC
    `
    return NextResponse.json(rows, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  }
}
