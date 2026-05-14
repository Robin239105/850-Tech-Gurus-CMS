import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  if (!session) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })

  try {
    const rows = await sql`
      SELECT p.*, c.name as client_name, c.website
      FROM blog_posts p
      JOIN clients c ON p.client_id = c.id
      ORDER BY p.created_at DESC
    `
    return NextResponse.json(rows)
  } catch (error) {
    return NextResponse.json({ message: 'Database error', error: String(error) }, { status: 500 })
  }
}
