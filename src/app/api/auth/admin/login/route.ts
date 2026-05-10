import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 })
    }

    const adminEmail = process.env.ADMIN_EMAIL
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

    if (!adminEmail || !adminPasswordHash) {
      return NextResponse.json(
        { message: 'Server is not configured. Contact your administrator.' },
        { status: 503 }
      )
    }

    if (email !== adminEmail) {
      return NextResponse.json({ message: 'Invalid credentials. Please try again.' }, { status: 401 })
    }

    const bcrypt = await import('bcryptjs').catch(() => null)
    let passwordValid = false

    if (bcrypt) {
      passwordValid = await bcrypt.compare(password, adminPasswordHash)
    } else {
      return NextResponse.json(
        { message: 'Server error. Contact your administrator.' },
        { status: 500 }
      )
    }

    if (!passwordValid) {
      return NextResponse.json({ message: 'Invalid credentials. Please try again.' }, { status: 401 })
    }

    const res = NextResponse.json({ success: true })
    res.cookies.set('admin_pending_2fa', '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 5,
      path: '/',
    })
    return res
  } catch {
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 })
  }
}
