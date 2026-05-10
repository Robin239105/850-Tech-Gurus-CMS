import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  
  if (!session) {
    return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  }

  try {
    // Truncate all tables to remove the accidentally seeded demo data
    await sql`TRUNCATE TABLE clients, tickets, activity_log, notifications, orders, customers, bookings, blog_posts, products CASCADE`

    return NextResponse.json({ 
      success: true, 
      message: 'All data has been successfully removed from the database.'
    })
  } catch (error) {
    console.error('Clear DB failed:', error)
    return NextResponse.json({ message: 'Failed to clear database', error: String(error) }, { status: 500 })
  }
}
