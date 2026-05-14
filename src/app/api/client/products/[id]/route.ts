import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const rows = await sql`SELECT * FROM products WHERE id = ${id}`
    if (rows.length === 0) return NextResponse.json({ message: 'Product not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (error) {
    return NextResponse.json({ message: 'Database error', error: String(error) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()
    const { name, description, price, salePrice, sku, stock, category, status } = body

    await sql`
      UPDATE products 
      SET 
        name = ${name}, 
        description = ${description}, 
        price = ${price}, 
        sale_price = ${salePrice}, 
        sku = ${sku}, 
        stock = ${stock}, 
        category = ${category}, 
        status = ${status},
        updated_at = NOW()
      WHERE id = ${id}
    `
    const rows = await sql`SELECT * FROM products WHERE id = ${id}`
    if (rows.length === 0) return NextResponse.json({ message: 'Product not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (error) {
    return NextResponse.json({ message: 'Update failed', error: String(error) }, { status: 500 })
  }
}
