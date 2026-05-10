import { NextRequest, NextResponse } from 'next/server'
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

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || 'all'
  const plan = searchParams.get('plan') || 'all'

  try {
    const db = getDb()
    const rows = await db`
      SELECT * FROM clients
      WHERE (${search} = '' OR name ILIKE ${'%' + search + '%'} OR email ILIKE ${'%' + search + '%'})
      AND (${status} = 'all' OR status = ${status})
      AND (${plan} = 'all' OR plan = ${plan})
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
    const { name, email, phone, website, company, category, plan, notes } = body

    if (!name || !email) {
      return NextResponse.json({ message: 'Name and email are required' }, { status: 400 })
    }

    const db = getDb()
    const id = `cl_${Date.now()}`
    const rows = await db`
      INSERT INTO clients (id, name, email, phone, website, company, category, plan, status, notes)
      VALUES (${id}, ${name}, ${email}, ${phone || ''}, ${website || ''}, ${company || name}, ${category || 'General'}, ${plan || 'Starter'}, 'pending', ${notes || ''})
      RETURNING *
    `

    await db`
      INSERT INTO activity_log (type, description, client_name, actor)
      VALUES ('client_added', ${'New client onboarding: ' + name}, ${name}, 'Admin')
    `

    return NextResponse.json(rows[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create client', error: String(error) }, { status: 500 })
  }
}
