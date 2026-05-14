'use client'

import { useState, useEffect } from 'react'
import { Eye, FileText, ShoppingCart, Users, TrendingUp, Download, BarChart3 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

type DashboardStats = {
  totalClients: number
  activeClients: number
  totalOrders: number
  totalRevenue: number
  totalFormSubmissions: number
  openTickets: number
  totalMediaFiles: number
  recentClients: Record<string, unknown>[]
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [topClients, setTopClients] = useState<Record<string, unknown>[]>([])
  const [plans, setPlans] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/dashboard').then(r => r.ok ? r.json() : null),
      fetch('/api/admin/clients?limit=5').then(r => r.ok ? r.json() : []),
      fetch('/api/admin/plans').then(r => r.ok ? r.json() : []),
    ]).then(([dashData, clientsData, plansData]) => {
      setStats(dashData)
      setTopClients(clientsData)
      setPlans(plansData)
      setLoading(false)
    })
  }, [dateRange])

  const statCards = stats ? [
    { label: 'Total Clients', value: stats.totalClients.toLocaleString(), icon: Users, color: 'text-brand-indigo', link: '/admin/clients' },
    { label: 'Form Submissions', value: stats.totalFormSubmissions.toLocaleString(), icon: FileText, color: 'text-brand-cyan', link: '/admin/forms' },
    { label: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: ShoppingCart, color: 'text-status-success', link: '/admin/orders' },
    { label: 'Platform Revenue', value: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: 'text-status-warning', link: '/admin/billing' },
  ] : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">Analytics & Reports</h1>
          <p className="text-sm text-text-secondary mt-1">Live platform performance from your database</p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="ytd">Year to date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Live stats from DB */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5 animate-pulse">
              <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
              <div className="h-8 w-16 bg-gray-200 rounded" />
            </Card>
          ))
        ) : statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.link}>
              <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-text-secondary text-sm">{stat.label}</span>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                <p className="text-xs text-text-muted mt-1">Live from database</p>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top clients table */}
        <Card className="lg:col-span-2 p-5">
          <h2 className="text-h3 mb-4">Top Clients by Plan</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Plan</th>
                  <th>MRR</th>
                </tr>
              </thead>
              <tbody>
                {topClients.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-text-muted">No clients yet</td></tr>
                ) : topClients.map((client) => {
                  const c = client as Record<string, unknown>
                  const planDef = (plans as Record<string, unknown>[]).find(p => p.name === c.plan)
                  const mrr = planDef ? Number(planDef.price) : 0
                  return (
                    <tr key={String(c.id)}>
                      <td>
                        <Link href={`/admin/clients/${String(c.id)}`} className="font-medium text-text-primary hover:text-brand-indigo">
                          {String(c.name)}
                        </Link>
                        <p className="text-xs text-text-muted">{String(c.email)}</p>
                      </td>
                      <td>
                        <Badge className={c.status === 'active' ? 'badge-green' : 'badge-amber'}>
                          {String(c.status)}
                        </Badge>
                      </td>
                      <td><Badge className="badge-indigo">{String(c.plan ?? 'Starter')}</Badge></td>
                      <td className="font-medium">{formatCurrency(mrr)}/mo</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right">
            <Link href="/admin/clients" className="text-sm text-brand-indigo hover:underline">View all clients →</Link>
          </div>
        </Card>

        {/* Platform summary */}
        <Card className="p-5">
          <h2 className="text-h3 mb-4">Platform Summary</h2>
          <div className="space-y-4">
            {stats && [
              { label: 'Active Clients', value: stats.activeClients, total: stats.totalClients, color: 'bg-brand-indigo' },
              { label: 'Orders Placed', value: stats.totalOrders, total: Math.max(stats.totalOrders, 1), color: 'bg-status-success' },
              { label: 'Open Tickets', value: stats.openTickets, total: Math.max(stats.openTickets, 1), color: 'bg-status-warning' },
              { label: 'Media Files', value: stats.totalMediaFiles, total: Math.max(stats.totalMediaFiles, 1), color: 'bg-brand-cyan' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-text-secondary">{item.label}</span>
                  <span className="text-sm font-semibold text-text-primary">{item.value}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all`}
                    style={{ width: item.total > 0 ? `${Math.min(100, (item.value / item.total) * 100)}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent activity */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h3">Downloadable Reports</h2>
          <Badge variant="gray">Coming soon</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Client Export (CSV)', desc: 'All clients with status and plan' },
            { name: 'Revenue Report', desc: 'MRR breakdown by plan tier' },
            { name: 'Form Submissions Export', desc: 'All form submissions as CSV' },
          ].map((report) => (
            <div key={report.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-text-primary text-sm">{report.name}</p>
                <p className="text-xs text-text-muted mt-0.5">{report.desc}</p>
              </div>
              <button
                onClick={() => alert('Export feature coming soon')}
                className="flex items-center gap-1.5 text-xs text-brand-indigo hover:text-brand-indigo/80 font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center gap-2 p-3 bg-brand-indigo/5 border border-brand-indigo/20 rounded-xl">
        <BarChart3 className="w-5 h-5 text-brand-indigo shrink-0" />
        <p className="text-sm text-text-secondary">
          <strong className="text-text-primary">Pro tip:</strong> All numbers above are live from your PostgreSQL database. For page-view analytics, connect Google Analytics or Plausible to your client websites.
        </p>
      </div>
    </div>
  )
}