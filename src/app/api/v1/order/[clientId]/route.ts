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

    // API key is required for order writes
    const apiKey = req.headers.get('X-CMS-Key') || req.headers.get('x-cms-key')
    if (!apiKey) {
      return NextResponse.json(
        { error: 'X-CMS-Key header is required for order intake' },
        { status: 401, headers: CORS }
      )
    }
    const keyCheck = await db`
      SELECT id, name, email FROM clients
      WHERE id = ${clientId} AND api_key = ${apiKey} AND status != 'suspended'
      LIMIT 1
    `
    if (!keyCheck[0]) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401, headers: CORS })
    }
    const client = keyCheck[0] as { id: string; name: string; email: string }

    const body = await req.json() as {
      items?: Array<{ name?: string; qty?: number; quantity?: number; price?: number }>
      customer?: { name?: string; email?: string }
      total?: number
      shippingAddress?: Record<string, unknown>
      notes?: string
      paymentStatus?: string
    }
    const { items = [], customer = {}, total = 0, shippingAddress, notes, paymentStatus } = body

    const orderNumber = 'ORD-' + Date.now().toString().slice(-8)
    const referer = req.headers.get('referer') ?? null

    const id = crypto.randomUUID();
    await db`
      INSERT INTO orders (id, 
        client_id, order_number, customer_name, customer_email,
        items, total, payment_status, fulfillment_status,
        shipping_address, notes, source_url
      )
      VALUES (${id}, 
        ${clientId},
        ${orderNumber},
        ${customer.name || 'Guest'},
        ${customer.email || ''},
        ${JSON.stringify(items)},
        ${total},
        ${paymentStatus || 'pending'},
        'pending',
        ${JSON.stringify(shippingAddress || {})},
        ${notes || null},
        ${referer}
      )`;
    const rows = await db`SELECT * FROM orders WHERE id = ${id}`

    await db`
      INSERT INTO activity_log (type, description, client_name, actor)
      VALUES (
        'order_created',
        ${'New order ' + orderNumber + ' from ' + (customer.name || 'Guest') + ' — $' + total},
        ${client.name},
        'Website'
      )
    `

    // Email notification via Resend
    if (process.env.RESEND_API_KEY && client.email) {
      const itemsHtml = items.map(item =>
        `<tr>
          <td style="padding:6px 12px">${item.name || 'Item'}</td>
          <td style="padding:6px 12px;text-align:center">${item.qty || item.quantity || 1}</td>
          <td style="padding:6px 12px;text-align:right">$${item.price || 0}</td>
        </tr>`
      ).join('')

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'noreply@850techgurus.com',
          to: [client.email],
          subject: `🛒 New Order: ${orderNumber}`,
          html: `
            <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
              <div style="background:#059669;padding:24px;border-radius:8px 8px 0 0">
                <h1 style="color:white;margin:0;font-size:20px">New Order Received</h1>
                <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:14px">${orderNumber} · ${client.name}</p>
              </div>
              <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none">
                <p><strong>Customer:</strong> ${customer.name || 'Guest'} ${customer.email ? `(${customer.email})` : ''}</p>
                <p><strong>Total:</strong> <span style="font-size:20px;font-weight:700;color:#059669">$${total}</span></p>
                <table style="width:100%;border-collapse:collapse;margin-top:16px;background:white;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb">
                  <thead>
                    <tr style="background:#f3f4f6">
                      <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280">ITEM</th>
                      <th style="padding:8px 12px;text-align:center;font-size:12px;color:#6b7280">QTY</th>
                      <th style="padding:8px 12px;text-align:right;font-size:12px;color:#6b7280">PRICE</th>
                    </tr>
                  </thead>
                  <tbody>${itemsHtml}</tbody>
                </table>
              </div>
              <div style="background:#1f2937;padding:16px;border-radius:0 0 8px 8px;text-align:center">
                <a href="${process.env.NEXT_PUBLIC_CMS_URL || 'https://cms.850techgurus.com'}/client/orders"
                   style="color:#60a5fa;font-size:13px;text-decoration:none">
                  Manage this order in your dashboard →
                </a>
              </div>
            </div>
          `,
        }),
      }).catch(() => { /* non-fatal */ })
    }

    const order = rows[0] as Record<string, unknown>
    return NextResponse.json(
      { success: true, orderId: order.id, orderNumber },
      { headers: CORS }
    )
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500, headers: CORS })
  }
}
