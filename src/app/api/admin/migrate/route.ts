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
    await sql`
      CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        website TEXT,
        company TEXT,
        category TEXT,
        plan TEXT NOT NULL DEFAULT 'Starter',
        status TEXT NOT NULL DEFAULT 'pending',
        storage BIGINT DEFAULT 0,
        storage_limit BIGINT DEFAULT 2000000000,
        pages INTEGER DEFAULT 0,
        notes TEXT,
        avatar TEXT,
        password_hash TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        last_active TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        subject TEXT NOT NULL,
        description TEXT,
        client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
        client_name TEXT,
        priority TEXT NOT NULL DEFAULT 'medium',
        status TEXT NOT NULL DEFAULT 'open',
        assigned_to TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS activity_log (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        client_id TEXT,
        client_name TEXT,
        actor TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        type TEXT NOT NULL DEFAULT 'info',
        title TEXT NOT NULL,
        description TEXT,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS platform_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS client_pages (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        client_id TEXT NOT NULL,
        title TEXT NOT NULL,
        slug TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        content JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(client_id, slug)
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS client_settings (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(client_id, key)
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS client_sessions (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS password_hash TEXT`
    await sql`ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS client_id TEXT`

    return NextResponse.json({ success: true, message: 'Database schema created successfully' })
  } catch (error) {
    return NextResponse.json({ message: 'Migration failed', error: String(error) }, { status: 500 })
  }
}
