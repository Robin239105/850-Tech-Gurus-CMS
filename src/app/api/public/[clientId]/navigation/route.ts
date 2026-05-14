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
      SELECT menu_name, items
      FROM navigation_menus
      WHERE client_id = ${clientId}
      ORDER BY created_at ASC
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
