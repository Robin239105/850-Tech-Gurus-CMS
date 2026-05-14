import { NextRequest, NextResponse } from 'next/server'
import { sql as db } from '@/lib/db'
import crypto from 'crypto'


const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-CMS-Key',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params
    const body = await req.json() as {
      formName?: string
      fields?: Record<string, unknown>
      page?: string
    }
    const { formName = 'Contact Form', fields = {}, page } = body

    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
    const referer = req.headers.get('referer') ?? page ?? null

    // Verify client exists and is active
    const clients = await db`
      SELECT id, name, email FROM clients
      WHERE id = ${clientId} AND status != 'suspended'
      LIMIT 1
    `
    if (!clients[0]) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404, headers: CORS })
    }
    const client = clients[0] as { id: string; name: string; email: string }

    // Save submission
    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    await db`
      INSERT INTO form_submissions (id, client_id, form_name, fields, status, ip, page, source_url)
      VALUES (
        ${submissionId},
        ${clientId},
        ${formName},
        ${JSON.stringify(fields)},
        'new',
        ${ip},
        ${referer},
        ${referer}
      )
    `

    await db`
      INSERT INTO activity_log (type, description, client_name, actor)
      VALUES (
        'form_submitted',
        ${'Form submission: ' + formName},
        ${client.name},
        'Website'
      )
    `

    // Email notification via Resend
    if (process.env.RESEND_API_KEY && client.email) {
      const fieldsHtml = Object.entries(fields)
        .map(([k, v]) => `<tr><td style="padding:6px 12px;font-weight:600;color:#374151">${k}</td><td style="padding:6px 12px;color:#111">${v}</td></tr>`)
        .join('')

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'noreply@850techgurus.com',
          to: [client.email],
          subject: `📬 New Form Submission: ${formName}`,
          html: `
            <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
              <div style="background:#4F46E5;padding:24px;border-radius:8px 8px 0 0">
                <h1 style="color:white;margin:0;font-size:20px">New Form Submission</h1>
                <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:14px">${client.name} · ${formName}</p>
              </div>
              <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none">
                <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb">
                  ${fieldsHtml}
                </table>
                ${referer ? `<p style="font-size:12px;color:#6b7280;margin-top:16px">Submitted from: <a href="${referer}" style="color:#4F46E5">${referer}</a></p>` : ''}
              </div>
              <div style="background:#1f2937;padding:16px;border-radius:0 0 8px 8px;text-align:center">
                <a href="${process.env.NEXT_PUBLIC_CMS_URL || 'https://cms.850techgurus.com'}/client/submissions"
                   style="color:#60a5fa;font-size:13px;text-decoration:none">
                  View all submissions in your dashboard →
                </a>
              </div>
            </div>
          `,
        }),
      }).catch(() => { /* email failure is non-fatal */ })
    }

    return NextResponse.json({ success: true, id: submissionId }, { headers: CORS })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500, headers: CORS })
  }
}
