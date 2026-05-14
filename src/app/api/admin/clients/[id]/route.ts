import { NextRequest, NextResponse } from 'next/server'
import { sql as db } from '@/lib/db'
import crypto from 'crypto'
import { cookies } from 'next/headers'


async function requireAdmin() {
  const cookieStore = await cookies()
  return !!cookieStore.get('admin_session')
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  const { id } = await params
  try {
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
    const body = await req.json()
    const { name, email, phone, website, company, category, status, notes } = body
    await db`
      UPDATE clients SET
        name = COALESCE(${name}, name),
        email = COALESCE(${email}, email),
        phone = COALESCE(${phone}, phone),
        website = COALESCE(${website}, website),
        company = COALESCE(${company}, company),
        category = COALESCE(${category}, category),

        status = COALESCE(${status}, status),
        notes = COALESCE(${notes}, notes),
        last_active = NOW()
      WHERE id = ${id}
      `;
    const rows = await db`SELECT * FROM clients WHERE id = ${id}`
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
    await db`DELETE FROM clients WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ message: 'Delete failed', error: String(error) }, { status: 500 })
  }
}
