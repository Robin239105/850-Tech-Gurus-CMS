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

    await sql`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        slug TEXT NOT NULL,
        category TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        content TEXT,
        excerpt TEXT,
        featured_image TEXT,
        meta_title TEXT,
        meta_description TEXT,
        views INTEGER DEFAULT 0,
        published_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(client_id, slug)
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        sku TEXT,
        description TEXT,
        category TEXT,
        price NUMERIC(10,2) NOT NULL DEFAULT 0,
        sale_price NUMERIC(10,2),
        stock INTEGER DEFAULT 0,
        low_stock_threshold INTEGER DEFAULT 10,
        status TEXT NOT NULL DEFAULT 'draft',
        image TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        order_number TEXT NOT NULL,
        customer_name TEXT,
        customer_email TEXT,
        items JSONB DEFAULT '[]',
        total NUMERIC(10,2) DEFAULT 0,
        payment_status TEXT NOT NULL DEFAULT 'pending',
        fulfillment_status TEXT NOT NULL DEFAULT 'pending',
        shipping_address JSONB,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS form_submissions (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        form_name TEXT NOT NULL,
        fields JSONB DEFAULT '{}',
        status TEXT NOT NULL DEFAULT 'new',
        ip TEXT,
        page TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS media_files (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        type TEXT,
        size BIGINT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        orders_count INTEGER DEFAULT 0,
        total_spent NUMERIC(10,2) DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS contact_forms (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        fields JSONB DEFAULT '[]',
        submissions_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        parent_id TEXT,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        customer_name TEXT,
        customer_email TEXT,
        customer_phone TEXT,
        service TEXT,
        booking_date DATE,
        booking_time TEXT,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS discounts (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        code TEXT NOT NULL,
        type TEXT NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        min_order NUMERIC(10,2) DEFAULT 0,
        usage_limit INTEGER,
        used_count INTEGER DEFAULT 0,
        expiry_date DATE,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS navigation_menus (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        menu_name TEXT NOT NULL DEFAULT 'Main Menu',
        items JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (client_id, menu_name)
      )
    `

    await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS password_hash TEXT`
    await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`
    await sql`ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS client_id TEXT`
    await sql`ALTER TABLE contact_forms ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'`
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_title TEXT`
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_description TEXT`
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS featured_image TEXT`

    return NextResponse.json({ success: true, message: 'Database schema created successfully' })
  } catch (error) {
    return NextResponse.json({ message: 'Migration failed', error: String(error) }, { status: 500 })
  }
}
