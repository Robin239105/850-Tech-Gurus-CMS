import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { cookies } from 'next/headers'

function getDb() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) throw new Error('DATABASE_URL not set')
  return neon(url)
}

async function requireAdmin() {
  const cookieStore = await cookies()
  return !!cookieStore.get('admin_session')
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'all'
  const priority = searchParams.get('priority') || 'all'

  try {
    const db = getDb()
    const rows = await db`
      SELECT * FROM tickets
      WHERE (${status} = 'all' OR status = ${status})
      AND (${priority} = 'all' OR priority = ${priority})
      ORDER BY
        CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
        created_at DESC
    `
    return NextResponse.json(rows)
  } catch (error) {
    return NextResponse.json({ message: 'Database error', error: String(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  try {
    const db = getDb()
    const body = await req.json()
    const { subject, description, client_name, priority, assigned_to } = body
    if (!subject) return NextResponse.json({ message: 'Subject is required' }, { status: 400 })

    const id = `tkt_${Date.now()}`
    const rows = await db`
      INSERT INTO tickets (id, subject, description, client_name, priority, status, assigned_to)
      VALUES (${id}, ${subject}, ${description || ''}, ${client_name || ''}, ${priority || 'medium'}, 'open', ${assigned_to || 'Support Team'})
      RETURNING *
    `
    return NextResponse.json(rows[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create ticket', error: String(error) }, { status: 500 })
  }
}
