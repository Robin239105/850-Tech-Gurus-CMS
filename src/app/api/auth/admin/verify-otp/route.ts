import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const pending2fa = req.cookies.get('admin_pending_2fa')?.value
    if (!pending2fa) {
      return NextResponse.json({ message: 'Session expired. Please log in again.' }, { status: 401 })
    }

    const { otp } = await req.json()

    if (!otp || otp.length !== 6) {
      return NextResponse.json({ message: 'Please enter a valid 6-digit code.' }, { status: 400 })
    }

    const totpSecret = process.env.ADMIN_TOTP_SECRET
    if (!totpSecret) {
      return NextResponse.json(
        { message: 'Server is not configured. Contact your administrator.' },
        { status: 503 }
      )
    }

    const { verify } = await import('otplib')
    const result = await verify({ secret: totpSecret, token: otp })
    if (!result.valid) {
      return NextResponse.json({ message: 'Invalid or expired code. Please try again.' }, { status: 401 })
    }

    const res = NextResponse.json({ success: true })
    res.cookies.delete('admin_pending_2fa')
    res.cookies.set('admin_session', '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    })
    return res
  } catch {
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 })
  }
}
