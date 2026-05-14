import { NextRequest, NextResponse } from 'next/server'
import { sql as db } from '@/lib/db'
import crypto from 'crypto'


export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params
    const rows = await db`
      SELECT setting_key, setting_value
      FROM client_settings
      WHERE client_id = ${clientId}
    `
    const client = await db`
      SELECT name, website
      FROM clients
      WHERE id = ${clientId}
      LIMIT 1
    `
    const settings = Object.fromEntries(rows.map((r: any) => [r.setting_key, r.setting_value]))
    return NextResponse.json(
      { ...settings, siteName: client[0]?.name, website: client[0]?.website },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    )
  } catch (err) {
    return NextResponse.json({ error: String(err) }, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  }
}
