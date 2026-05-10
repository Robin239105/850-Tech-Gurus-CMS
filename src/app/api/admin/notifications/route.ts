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

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  try {
    const db = getDb()
    const rows = await db`SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50`
    return NextResponse.json(rows)
  } catch (error) {
    return NextResponse.json({ message: 'Database error', error: String(error) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  try {
    const db = getDb()
    const body = await req.json()
    if (body.markAllRead) {
      await db`UPDATE notifications SET read = true`
      return NextResponse.json({ success: true })
    }
    if (body.id) {
      await db`UPDATE notifications SET read = true WHERE id = ${body.id}`
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ message: 'Update failed', error: String(error) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  try {
    const db = getDb()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ message: 'ID required' }, { status: 400 })
    await db`DELETE FROM notifications WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ message: 'Delete failed', error: String(error) }, { status: 500 })
  }
}
