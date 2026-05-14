import { NextRequest, NextResponse } from 'next/server'
import { sql as db } from '@/lib/db'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'


async function requireAdmin() {
  const cookieStore = await cookies()
  return !!cookieStore.get('admin_session')
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  const { id } = await params
  try {
    const { password, activate } = await req.json()
    if (!password || String(password).length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters.' }, { status: 400 })
    }
    const hash = await bcrypt.hash(String(password), 10)
    const newStatus = activate ? 'active' : undefined
    const rows = await db`
      UPDATE clients SET
        password_hash = ${hash},
        status = COALESCE(${newStatus ?? null}, status),
        last_active = NOW()
      WHERE id = ${id}
      
    `
    if (!rows.length) return NextResponse.json({ message: 'Client not found' }, { status: 404 })
    return NextResponse.json({ success: true, client: rows[0] })
  } catch (err) {
    return NextResponse.json({ message: String(err) }, { status: 500 })
  }
}
