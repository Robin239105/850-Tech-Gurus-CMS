import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  if (!session) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })

  try {
    const rows = await sql`SELECT * FROM billing_plans WHERE is_active = true ORDER BY price ASC`
    return NextResponse.json(rows)
  } catch (error) {
    return NextResponse.json({ message: 'Database error', error: String(error) }, { status: 500 })
  }
}
