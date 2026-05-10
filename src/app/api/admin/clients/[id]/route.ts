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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  const { id } = await params
  try {
    const db = getDb()
    const rows = await db`SELECT * FROM clients WHERE id = ${id}`
    if (!rows.length) return NextResponse.json({ message: 'Client not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (error) {
    return NextResponse.json({ message: 'Database error', error: String(error) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  const { id } = await params
  try {
    const db = getDb()
    const body = await req.json()
    const { name, email, phone, website, company, category, plan, status, notes } = body
    const rows = await db`
      UPDATE clients SET
        name = COALESCE(${name}, name),
        email = COALESCE(${email}, email),
        phone = COALESCE(${phone}, phone),
        website = COALESCE(${website}, website),
        company = COALESCE(${company}, company),
        category = COALESCE(${category}, category),
        plan = COALESCE(${plan}, plan),
        status = COALESCE(${status}, status),
        notes = COALESCE(${notes}, notes),
        last_active = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    if (!rows.length) return NextResponse.json({ message: 'Client not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (error) {
    return NextResponse.json({ message: 'Update failed', error: String(error) }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  const { id } = await params
  try {
    const db = getDb()
    await db`DELETE FROM clients WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ message: 'Delete failed', error: String(error) }, { status: 500 })
  }
}
