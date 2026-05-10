import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(
  _req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const { clientId } = params
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
