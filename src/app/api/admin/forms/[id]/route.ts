import { NextRequest, NextResponse } from 'next/server'
import { sql as db } from '@/lib/db'
import crypto from 'crypto'
import { cookies } from 'next/headers'


async function requireAdmin() {
  const cookieStore = await cookies()
  return !!cookieStore.get('admin_session')
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  const { id } = await params
  const body = await req.json() as { status?: string; notes?: string }
  await db`
    UPDATE form_submissions
    SET status = COALESCE(${body.status ?? null}, status)
    WHERE id = ${id}
  `
  return NextResponse.json({ success: true })
}
