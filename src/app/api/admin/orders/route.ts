import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  if (!session) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'all'
    
    const rows = await sql`
      SELECT o.*, c.name as client_name 
      FROM orders o
      JOIN clients c ON o.client_id = c.id
      WHERE (${status} = 'all' OR o.payment_status = ${status})
      ORDER BY o.created_at DESC
    `
    return NextResponse.json(rows)
  } catch (error) {
    return NextResponse.json({ message: 'Database error', error: String(error) }, { status: 500 })
  }
}
