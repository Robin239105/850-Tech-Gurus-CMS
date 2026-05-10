import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params
  const rows = await sql`
    SELECT settings
    FROM client_settings
    WHERE client_id = ${clientId}
    LIMIT 1
  `
  const client = await sql`
    SELECT name, website
    FROM clients
    WHERE id = ${clientId}
    LIMIT 1
  `
  return NextResponse.json(
    { ...(rows[0]?.settings ?? {}), siteName: client[0]?.name, website: client[0]?.website },
    { headers: { 'Access-Control-Allow-Origin': '*' } }
  )
}
