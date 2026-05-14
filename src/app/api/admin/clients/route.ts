import { NextRequest, NextResponse } from 'next/server'
import { sql as db } from '@/lib/db'
import crypto from 'crypto'
import { cookies } from 'next/headers'


async function requireAdmin() {
  const cookieStore = await cookies()
  return !!cookieStore.get('admin_session')
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || 'all'


  try {
    const rows = await db`
      SELECT * FROM clients
      WHERE (${search} = '' OR name LIKE ${'%' + search + '%'} OR email LIKE ${'%' + search + '%'})
      AND (${status} = 'all' OR status = ${status})

      ORDER BY created_at DESC
    `
    return NextResponse.json(rows)
  } catch (error) {
    return NextResponse.json({ message: 'Database error', error: String(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })

  try {
    const body = await req.json()
    const { name, email, phone, website, company, category, notes } = body

    if (!name || !email) {
      return NextResponse.json({ message: 'Name and email are required' }, { status: 400 })
    }
    const id = `cl_${Date.now()}`
    await db`
      INSERT INTO clients (id, name, email, phone, website, company, category, plan, status, notes)
      VALUES (${id}, ${name}, ${email}, ${phone || ''}, ${website || ''}, ${company || name}, ${category || 'General'}, 'Starter', 'pending', ${notes || ''})`;
    const rows = await db`SELECT * FROM clients WHERE id = ${id}`

    await db`
      INSERT INTO activity_log (type, description, client_name, actor)
      VALUES ('client_added', ${'New client onboarding: ' + name}, ${name}, 'Admin')
    `

    return NextResponse.json(rows[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create client', error: String(error) }, { status: 500 })
  }
}
