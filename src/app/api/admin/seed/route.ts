import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { cookies } from 'next/headers'
import { mockClients, mockActivity, mockTickets, mockNotifications } from '@/lib/mock-data'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  
  // Allow seeding if session exists OR if we are in development
  // In production, you should ideally keep this protected or delete after use
  if (!session && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  }

  try {
    // 1. Clear existing data (optional, but good for a clean seed)
    const { searchParams } = new URL(req.url)
    const clear = searchParams.get('clear') === 'true'
    
    if (clear) {
      await sql`TRUNCATE TABLE clients, tickets, activity_log, notifications CASCADE`
    }

    // 2. Seed Clients
    for (const client of mockClients) {
      await sql`
        INSERT INTO clients (
          id, name, email, phone, website, company, category, plan, status, storage, storage_limit, pages, created_at, last_active
        ) VALUES (
          ${client.id}, ${client.name}, ${client.email}, ${client.phone}, ${client.website}, 
          ${client.company}, ${client.category}, ${client.plan}, ${client.status}, 
          ${client.storage}, ${client.storageLimit}, ${client.pages}, 
          ${client.createdAt}, ${client.lastActive}
        ) ON CONFLICT (id) DO NOTHING
      `
    }

    // 3. Seed Activity Log
    for (const activity of mockActivity) {
      await sql`
        INSERT INTO activity_log (
          id, type, description, client_name, actor, created_at
        ) VALUES (
          ${activity.id}, ${activity.type}, ${activity.description}, 
          ${activity.client || null}, ${activity.user}, ${activity.timestamp}
        ) ON CONFLICT (id) DO NOTHING
      `
    }

    // 4. Seed Tickets
    for (const ticket of mockTickets) {
      await sql`
        INSERT INTO tickets (
          id, subject, description, client_id, client_name, priority, status, assigned_to, created_at, updated_at
        ) VALUES (
          ${ticket.id}, ${ticket.subject}, ${ticket.description}, 
          null, ${ticket.client}, ${ticket.priority}, ${ticket.status}, 
          ${ticket.assignedTo || 'Support Team'}, ${ticket.createdAt}, ${ticket.updatedAt}
        ) ON CONFLICT (id) DO NOTHING
      `
    }

    // 5. Seed Notifications
    for (const notif of mockNotifications) {
      await sql`
        INSERT INTO notifications (
          id, type, title, description, read, created_at
        ) VALUES (
          ${notif.id}, ${notif.type}, ${notif.title}, ${notif.description}, 
          ${notif.read}, ${notif.timestamp}
        ) ON CONFLICT (id) DO NOTHING
      `
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully',
      stats: {
        clients: mockClients.length,
        activity: mockActivity.length,
        tickets: mockTickets.length,
        notifications: mockNotifications.length
      }
    })
  } catch (error) {
    console.error('Seeding failed:', error)
    return NextResponse.json({ message: 'Seeding failed', error: String(error) }, { status: 500 })
  }
}
