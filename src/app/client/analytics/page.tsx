'use client'

import { useState, useEffect } from 'react'
import { BarChart3, FileText, ShoppingCart, Mail, Image, TrendingUp, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

type Stats = {
  pages: number
  products: number
  orders: number
  submissions: number
  media: number
  revenue: number
}

export default function ClientAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [website, setWebsite] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/client/pages').then(r => r.ok ? r.json() : []),
      fetch('/api/client/products').then(r => r.ok ? r.json() : []),
      fetch('/api/client/orders').then(r => r.ok ? r.json() : []),
      fetch('/api/client/submissions').then(r => r.ok ? r.json() : []),
      fetch('/api/client/media').then(r => r.ok ? r.json() : []),
      fetch('/api/client/me').then(r => r.ok ? r.json() : {}),
    ]).then(([pages, products, orders, submissions, media, me]) => {
      const orderArr = Array.isArray(orders) ? orders : []
      const revenue = orderArr
        .filter((o: Record<string, unknown>) => o.payment_status === 'paid')
        .reduce((sum: number, o: Record<string, unknown>) => sum + Number(o.total ?? 0), 0)
      setStats({
        pages: Array.isArray(pages) ? pages.length : 0,
        products: Array.isArray(products) ? products.length : 0,
        orders: orderArr.length,
        submissions: Array.isArray(submissions) ? submissions.length : 0,
        media: Array.isArray(media) ? media.length : 0,
        revenue,
      })
      const m = me as Record<string, string>
      setWebsite(m?.website ?? null)
    }).finally(() => setLoading(false))
  }, [])

  const cards = stats ? [
    { label: 'Total Pages', value: stats.pages, icon: FileText, color: 'text-brand-indigo', link: '/client/pages' },
    { label: 'Products', value: stats.products, icon: BarChart3, color: 'text-brand-cyan', link: '/client/products' },
    { label: 'Orders', value: stats.orders, icon: ShoppingCart, color: 'text-status-success', link: '/client/orders' },
    { label: 'Form Leads', value: stats.submissions, icon: Mail, color: 'text-status-warning', link: '/client/submissions' },
    { label: 'Media Files', value: stats.media, icon: Image, color: 'text-purple-500', link: '/client/media' },
    { label: 'Revenue', value: formatCurrency(stats.revenue), icon: TrendingUp, color: 'text-status-success', link: '/client/orders' },
  ] : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics Overview</h1>
          <p className="text-text-secondary mt-1">Live counts from your CMS data</p>
        </div>
        {website && (
          <a href={website} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              View Live Site
            </Button>
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse"><CardContent className="p-5 h-24" /></Card>
            ))
          : cards.map(card => {
              const Icon = card.icon
              return (
                <Link key={card.label} href={card.link}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-text-secondary">{card.label}</span>
                        <Icon className={`w-5 h-5 ${card.color}`} />
                      </div>
                      <p className="text-2xl font-bold text-text-primary">{card.value}</p>
                      <p className="text-xs text-text-muted mt-1">Click to view →</p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
      </div>

      <Card>
        <CardContent className="p-6 text-center">
          <BarChart3 className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="font-semibold text-text-primary mb-2">Page View Analytics</h3>
          <p className="text-sm text-text-secondary mb-4">
            To track visitor counts, page views, and traffic sources, add Google Analytics or Plausible to your website.
          </p>
          <div className="flex gap-3 justify-center">
            <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">Google Analytics</Button>
            </a>
            <a href="https://plausible.io" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">Plausible.io</Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
