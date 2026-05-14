import { NextRequest, NextResponse } from 'next/server'
import { sql as db } from '@/lib/db'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'


export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 })
    }
    const rows = await db`SELECT * FROM clients WHERE email = ${email.toLowerCase().trim()} LIMIT 1`

    if (!rows.length) {
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 })
    }

    const client = rows[0] as Record<string, unknown>

    if (client.status === 'suspended') {
      return NextResponse.json({ message: 'Your account has been suspended. Please contact support.' }, { status: 403 })
    }

    if (client.status === 'pending') {
      return NextResponse.json({ message: 'Your account is pending activation. Please contact support.' }, { status: 403 })
    }

    if (!client.password_hash) {
      return NextResponse.json({ message: 'Account not yet activated. Please contact your administrator.' }, { status: 403 })
    }

    const valid = await bcrypt.compare(password, String(client.password_hash))
    if (!valid) {
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 })
    }

    const sessionData = Buffer.from(JSON.stringify({
      clientId: client.id,
      email: client.email,
      name: client.name,
      plan: client.plan,
    })).toString('base64')

    const cookieStore = await cookies()
    cookieStore.set('client_session', sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    await db`UPDATE clients SET last_active = NOW() WHERE id = ${String(client.id)}`

    return NextResponse.json({
      success: true,
      client: { id: client.id, name: client.name, email: client.email, plan: client.plan },
    })
  } catch (err) {
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 })
  }
}
