import { NextRequest, NextResponse } from 'next/server'
import { sql as db } from '@/lib/db'
import crypto from 'crypto'
import { cookies } from 'next/headers'


async function requireAdmin() {
  const cookieStore = await cookies()
  return !!cookieStore.get('admin_session')
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    const { status, priority, assigned_to } = body
    await db`
      UPDATE tickets SET
        status = COALESCE(${status}, status),
        priority = COALESCE(${priority}, priority),
        assigned_to = COALESCE(${assigned_to}, assigned_to),
        updated_at = NOW()
      WHERE id = ${id}
      `;
    const rows = await db`SELECT * FROM tickets WHERE id = ${id}`
    if (!rows.length) return NextResponse.json({ message: 'Ticket not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (error) {
    return NextResponse.json({ message: 'Update failed', error: String(error) }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  const { id } = await params
  try {
    await db`DELETE FROM tickets WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ message: 'Delete failed', error: String(error) }, { status: 500 })
  }
}
