import { NextRequest, NextResponse } from 'next/server'
import { sql as db } from '@/lib/db'
import crypto from 'crypto'


const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params

    const [clients, settings, navRows, products] = await Promise.all([
      db`SELECT name, website, email, phone FROM clients WHERE id = ${clientId} LIMIT 1`,
      db`SELECT setting_key, setting_value FROM client_settings WHERE client_id = ${clientId}`,
      db`SELECT items FROM navigation_menus WHERE client_id = ${clientId} AND menu_name = 'Main Menu' LIMIT 1`,
      db`SELECT id, name, price, sale_price, image, description, category, status
         FROM products WHERE client_id = ${clientId} AND status = 'active'
         ORDER BY created_at DESC LIMIT 50`,
    ])

    if (!clients[0]) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404, headers: CORS })
    }

    const client = clients[0] as Record<string, string>
    const s = Object.fromEntries(
      (settings as Record<string, string>[]).map(r => [r.setting_key, r.setting_value])
    )

    return NextResponse.json({
      clientId,
      siteName:       s.site_title      || client.name   || '',
      tagline:        s.site_tagline    || '',
      phone:          s.site_phone      || client.phone  || '',
      email:          s.admin_email     || client.email  || '',
      address:        s.site_address    || '',
      hours:          s.site_hours      || '',
      logo:           s.logo_url        || null,
      favicon:        s.favicon_url     || null,
      primaryColor:   s.primary_color   || '#4F46E5',
      secondaryColor: s.secondary_color || '#06B6D4',
      social: {
        facebook:  s['Facebook']  || '',
        instagram: s['Instagram'] || '',
        twitter:   s['Twitter/X'] || '',
        linkedin:  s['LinkedIn']  || '',
        youtube:   s['YouTube']   || '',
        tiktok:    s['TikTok']    || '',
        whatsapp:  s['WhatsApp']  || '',
      },
      navigation: navRows[0] ? (navRows[0] as Record<string, unknown>).items : [],
      products,
      seo: {
        metaTitle:       s.meta_title       || s.site_title || client.name || '',
        metaDescription: s.meta_description || s.site_tagline || '',
      },
    }, { headers: CORS })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500, headers: CORS })
  }
}
