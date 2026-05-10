import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  if (!session) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })

  try {
    const rows = await sql`
      SELECT f.*, c.name as client_name 
      FROM form_submissions f
      JOIN clients c ON f.client_id = c.id
      ORDER BY f.created_at DESC
    `
    return NextResponse.json(rows)
  } catch (error) {
    return NextResponse.json({ message: 'Database error', error: String(error) }, { status: 500 })
  }
}
