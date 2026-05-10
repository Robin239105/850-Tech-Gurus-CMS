import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete('admin_session')
  res.cookies.delete('admin_pending_2fa')
  return res
}
