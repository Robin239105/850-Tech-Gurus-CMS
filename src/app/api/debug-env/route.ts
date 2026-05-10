import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD_HASH: !!process.env.ADMIN_PASSWORD_HASH,
    ADMIN_TOTP_SECRET: !!process.env.ADMIN_TOTP_SECRET,
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    NODE_ENV: process.env.NODE_ENV,
  })
}
