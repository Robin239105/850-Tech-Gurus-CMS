import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { getClientSession } from '@/lib/client-auth'

function getDb() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) throw new Error('DATABASE_URL not set')
  return neon(url)
}

export async function GET() {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  try {
    const db = getDb()
    const rows = await db`SELECT * FROM products WHERE client_id = ${session.clientId} ORDER BY created_at DESC`
    return NextResponse.json(rows)
  } catch (err) {
    return NextResponse.json({ message: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  try {
    const { name, sku, description, category, price, sale_price, stock, low_stock_threshold, status, image } = await req.json()
    if (!name) return NextResponse.json({ message: 'Name required' }, { status: 400 })
    const db = getDb()
    const rows = await db`
      INSERT INTO products (client_id, name, sku, description, category, price, sale_price, stock, low_stock_threshold, status, image)
      VALUES (${session.clientId}, ${name}, ${sku ?? null}, ${description ?? null}, ${category ?? null}, ${price ?? 0}, ${sale_price ?? null}, ${stock ?? 0}, ${low_stock_threshold ?? 10}, ${status ?? 'draft'}, ${image ?? null})
      RETURNING *
    `
    return NextResponse.json(rows[0])
  } catch (err) {
    return NextResponse.json({ message: String(err) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  try {
    const { id, name, sku, description, category, price, sale_price, stock, low_stock_threshold, status, image } = await req.json()
    const db = getDb()
    const rows = await db`
      UPDATE products SET
        name = COALESCE(${name ?? null}, name),
        sku = COALESCE(${sku ?? null}, sku),
        description = COALESCE(${description ?? null}, description),
        category = COALESCE(${category ?? null}, category),
        price = COALESCE(${price ?? null}, price),
        sale_price = COALESCE(${sale_price ?? null}, sale_price),
        stock = COALESCE(${stock ?? null}, stock),
        low_stock_threshold = COALESCE(${low_stock_threshold ?? null}, low_stock_threshold),
        status = COALESCE(${status ?? null}, status),
        image = COALESCE(${image ?? null}, image),
        updated_at = NOW()
      WHERE id = ${id} AND client_id = ${session.clientId} RETURNING *
    `
    return NextResponse.json(rows[0])
  } catch (err) {
    return NextResponse.json({ message: String(err) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  try {
    const { id } = await req.json()
    const db = getDb()
    await db`DELETE FROM products WHERE id = ${id} AND client_id = ${session.clientId}`
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ message: String(err) }, { status: 500 })
  }
}
