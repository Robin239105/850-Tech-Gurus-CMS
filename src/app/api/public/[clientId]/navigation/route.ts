import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params
  const rows = await sql`
    SELECT menu_name, items
    FROM navigation_menus
    WHERE client_id = ${clientId}
    ORDER BY created_at ASC
  `
  return NextResponse.json(rows, {
    headers: { 'Access-Control-Allow-Origin': '*' },
  })
}
