import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone TEXT,
        website TEXT,
        company TEXT,
        category TEXT,
        plan TEXT NOT NULL,
        status TEXT NOT NULL,
        storage BIGINT DEFAULT 0,
        storage_limit BIGINT DEFAULT 2000000000,
        pages INTEGER DEFAULT 0,
        notes TEXT,
        avatar TEXT,
        password_hash TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS tickets (
        id VARCHAR(255) PRIMARY KEY,
        subject TEXT NOT NULL,
        description TEXT,
        client_id VARCHAR(255) REFERENCES clients(id) ON DELETE SET NULL,
        client_name TEXT,
        priority TEXT NOT NULL,
        status TEXT NOT NULL,
        assigned_to TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS activity_log (
        id VARCHAR(255) PRIMARY KEY DEFAULT (gen_random_uuid()),
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        client_id VARCHAR(255),
        client_name TEXT,
        actor TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(255) PRIMARY KEY DEFAULT (gen_random_uuid()),
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        read_status BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS platform_settings (
        setting_key VARCHAR(255) PRIMARY KEY,
        setting_value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS client_pages (
        id VARCHAR(255) PRIMARY KEY DEFAULT (gen_random_uuid()),
        client_id VARCHAR(255) NOT NULL,
        title TEXT NOT NULL,
        slug VARCHAR(255) NOT NULL,
        status TEXT NOT NULL,
        content JSONB DEFAULT ('{}'::jsonb),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(client_id, slug)
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS client_settings (
        id VARCHAR(255) PRIMARY KEY DEFAULT (gen_random_uuid()),
        client_id VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        setting_key VARCHAR(255) NOT NULL,
        setting_value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(client_id, setting_key)
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS client_sessions (
        id VARCHAR(255) PRIMARY KEY DEFAULT (gen_random_uuid()),
        client_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id VARCHAR(255) PRIMARY KEY DEFAULT (gen_random_uuid()),
        client_id VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        slug VARCHAR(255) NOT NULL,
        category TEXT,
        status TEXT NOT NULL,
        content TEXT,
        excerpt TEXT,
        featured_image TEXT,
        meta_title TEXT,
        meta_description TEXT,
        views INTEGER DEFAULT 0,
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(client_id, slug)
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY DEFAULT (gen_random_uuid()),
        client_id VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        sku TEXT,
        description TEXT,
        category TEXT,
        price NUMERIC(10,2) NOT NULL DEFAULT 0,
        sale_price NUMERIC(10,2),
        stock INTEGER DEFAULT 0,
        low_stock_threshold INTEGER DEFAULT 10,
        status TEXT NOT NULL,
        image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY DEFAULT (gen_random_uuid()),
        client_id VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        order_number TEXT NOT NULL,
        customer_name TEXT,
        customer_email TEXT,
        items JSONB DEFAULT ('[]'::jsonb),
        total NUMERIC(10,2) DEFAULT 0,
        payment_status TEXT NOT NULL,
        fulfillment_status TEXT NOT NULL,
        shipping_address JSONB,
        notes TEXT,
        source_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS form_submissions (
        id VARCHAR(255) PRIMARY KEY DEFAULT (gen_random_uuid()),
        client_id VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        form_name TEXT NOT NULL,
        fields JSONB DEFAULT ('{}'::jsonb),
        status TEXT NOT NULL,
        ip TEXT,
        page TEXT,
        source_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS media_files (
        id VARCHAR(255) PRIMARY KEY DEFAULT (gen_random_uuid()),
        client_id VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        type TEXT,
        file_size BIGINT DEFAULT 0,
        file_type TEXT,
        dimensions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(255) PRIMARY KEY DEFAULT (gen_random_uuid()),
        client_id VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        orders_count INTEGER DEFAULT 0,
        total_spent NUMERIC(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS contact_forms (
        id VARCHAR(255) PRIMARY KEY DEFAULT (gen_random_uuid()),
        client_id VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        fields JSONB DEFAULT ('[]'::jsonb),
        settings JSONB DEFAULT ('{}'::jsonb),
        submissions_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(255) PRIMARY KEY DEFAULT (gen_random_uuid()),
        client_id VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        parent_id VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(255) PRIMARY KEY DEFAULT (gen_random_uuid()),
        client_id VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        customer_name TEXT,
        customer_email TEXT,
        customer_phone TEXT,
        service TEXT,
        booking_date DATE,
        booking_time TEXT,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS discounts (
        id VARCHAR(255) PRIMARY KEY DEFAULT (gen_random_uuid()),
        client_id VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        code VARCHAR(255) NOT NULL,
        type TEXT NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        min_order NUMERIC(10,2) DEFAULT 0,
        usage_limit INTEGER,
        used_count INTEGER DEFAULT 0,
        expiry_date DATE,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS navigation_menus (
        id VARCHAR(255) PRIMARY KEY DEFAULT (gen_random_uuid()),
        client_id VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        menu_name VARCHAR(255) NOT NULL,
        items JSONB DEFAULT ('[]'::jsonb),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (client_id, menu_name)
      )
    `
    // Removed ALTER TABLES that add columns, just include them in the CREATE TABLE above since this script will recreate schemas

    return NextResponse.json({ success: true, message: 'Database schema created successfully' })
  } catch (error) {
    return NextResponse.json({ message: 'Migration failed', error: String(error) }, { status: 500 })
  }
}
