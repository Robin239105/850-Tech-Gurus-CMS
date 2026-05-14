import { NextRequest, NextResponse } from 'next/server'
import { sql as db } from '@/lib/db'
import crypto from 'crypto'
import { getClientSession } from '@/lib/client-auth'


export async function GET() {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  try {
    const rows = await db`SELECT * FROM form_submissions WHERE client_id = ${session.clientId} ORDER BY created_at DESC`
    const mappedRows = rows.map((r: any) => {
      const fieldsObj = r.fields || {}
      return {
        ...r,
        submitted_at: r.created_at,
        name: fieldsObj.name || fieldsObj.fullName || fieldsObj.first_name || null,
        email: fieldsObj.email || fieldsObj.emailAddress || null,
        message: fieldsObj.message || fieldsObj.comments || null,
        ip_address: r.ip,
        page_url: r.page || r.source_url,
        fields: Object.entries(fieldsObj).map(([k, v]) => ({ label: k, value: String(v) }))
      }
    })
    return NextResponse.json(mappedRows)
  } catch (err) {
    return NextResponse.json({ message: String(err) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  try {
    const { id, status } = await req.json()
    await db`
      UPDATE form_submissions SET status = ${status} WHERE id = ${id} AND client_id = ${session.clientId} `;
    const rows = await db`SELECT * FROM form_submissions WHERE id = ${id}`
    if (!rows.length) return NextResponse.json({ message: 'Not found' }, { status: 404 })
    const r = rows[0] as any
    const fieldsObj = r.fields || {}
    const mappedRow = {
      ...r,
      submitted_at: r.created_at,
      name: fieldsObj.name || fieldsObj.fullName || fieldsObj.first_name || null,
      email: fieldsObj.email || fieldsObj.emailAddress || null,
      message: fieldsObj.message || fieldsObj.comments || null,
      ip_address: r.ip,
      page_url: r.page || r.source_url,
      fields: Object.entries(fieldsObj).map(([k, v]) => ({ label: k, value: String(v) }))
    }
    return NextResponse.json(mappedRow)
  } catch (err) {
    return NextResponse.json({ message: String(err) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  try {
    const { id } = await req.json()
    await db`DELETE FROM form_submissions WHERE id = ${id} AND client_id = ${session.clientId}`
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ message: String(err) }, { status: 500 })
  }
}
