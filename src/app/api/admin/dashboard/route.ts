import { NextResponse } from 'next/server'
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

    const [totalClients] = await db`SELECT COUNT(*) as count FROM clients`
    const [activePlans] = await db`SELECT COUNT(*) as count FROM clients WHERE status = 'active'`
    const [openTickets] = await db`SELECT COUNT(*) as count FROM tickets WHERE status IN ('open','in_progress')`
    const [storageRow] = await db`
      SELECT COALESCE(SUM(storage),0) as used, COALESCE(SUM(storage_limit),1) as total FROM clients
    `
    const recentClients = await db`SELECT * FROM clients ORDER BY created_at DESC LIMIT 5`
    const recentActivity = await db`SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 8`
    const recentSignups = await db`SELECT name, created_at, plan FROM clients ORDER BY created_at DESC LIMIT 5`

    const storagePercent = storageRow.total > 0
      ? Math.round((Number(storageRow.used) / Number(storageRow.total)) * 100)
      : 0

    return NextResponse.json({
      totalClients: Number(totalClients.count),
      activePlans: Number(activePlans.count),
      openTickets: Number(openTickets.count),
      storageUsed: storagePercent,
      recentClients,
      recentActivity,
      recentSignups,
    })
  } catch (error) {
    return NextResponse.json({ message: 'Database error', error: String(error) }, { status: 500 })
  }
}
