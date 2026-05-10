import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

function getDb() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) throw new Error('DATABASE_URL not set')
  return neon(url)
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params
    const db = getDb()
    const rows = await db`
      SELECT settings
      FROM client_settings
      WHERE client_id = ${clientId}
      LIMIT 1
    `
    const client = await db`
      SELECT name, website
      FROM clients
      WHERE id = ${clientId}
      LIMIT 1
    `
    return NextResponse.json(
      { ...(rows[0]?.settings ?? {}), siteName: client[0]?.name, website: client[0]?.website },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    )
  } catch (err) {
    return NextResponse.json({ error: String(err) }, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  }
}
