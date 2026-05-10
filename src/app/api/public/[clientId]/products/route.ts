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
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params
  const rows = await sql`
    SELECT id, name, slug, description, price, compare_price, images, status, created_at
    FROM products
    WHERE client_id = ${clientId} AND status = 'active'
    ORDER BY created_at DESC
  `
  return NextResponse.json(rows, {
    headers: { 'Access-Control-Allow-Origin': '*' },
  })
}
