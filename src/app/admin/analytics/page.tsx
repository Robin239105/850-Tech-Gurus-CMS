'use client'

import { useState, useEffect } from 'react'
import { Calendar, Download, Eye, FileText, ShoppingCart, Users, TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'

const stats = [
  { label: 'Page Views', value: '125,432', change: '+12.5%', trend: 'up', icon: Eye },
  { label: 'Form Submissions', value: '3,847', change: '+8.2%', trend: 'up', icon: FileText },
  { label: 'Orders', value: '1,256', change: '-2.1%', trend: 'down', icon: ShoppingCart },
  { label: 'New Signups', value: '342', change: '+15.3%', trend: 'up', icon: Users },
]

const moduleUsage = [
  { name: 'Page Builder', percent: 78 },
  { name: 'Media Library', percent: 65 },
  { name: 'Forms', percent: 52 },
  { name: 'E-commerce', percent: 45 },
  { name: 'Blog', percent: 38 },
  { name: 'Analytics', percent: 28 },
]

const reports = [
  { name: 'Monthly Performance Report', format: 'PDF', size: '2.4 MB' },
  { name: 'Client Activity Report', format: 'CSV', size: '1.1 MB' },
  { name: 'Revenue Analytics', format: 'XLSX', size: '850 KB' },
]

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d')
  const [topClients, setTopClients] = useState<Record<string, unknown>[]>([])

  useEffect(() => {
    fetch('/api/admin/clients?limit=5')
      .then(r => r.ok ? r.json() : [])
      .then(setTopClients)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">Analytics & Reports</h1>
          <p className="text-sm text-text-secondary mt-1">Platform performance insights</p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <Calendar className="w-4 h-4 mr-2" />
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown
          return (
            <Card key={stat.label} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-text-secondary text-sm">{stat.label}</span>
                <Icon className="w-5 h-5 text-brand-indigo" />
              </div>
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              <div className={`flex items-center gap-1 mt-2 text-xs ${stat.trend === 'up' ? 'text-status-success' : 'text-status-danger'}`}>
                <TrendIcon className="w-3 h-3" />
                <span>{stat.change} vs last period</span>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <h2 className="text-h3 mb-4">Traffic Overview</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-brand-indigo mx-auto mb-2" />
              <p className="text-text-muted">Traffic chart visualization</p>
              <p className="text-xs text-text-muted">Data from {dateRange === '30d' ? '30 days' : dateRange}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-h3 mb-4">Usage by Category</h2>
          <div className="space-y-4">
            {[
              { label: 'Direct Traffic', value: 35, color: 'bg-brand-indigo' },
              { label: 'Organic Search', value: 28, color: 'bg-brand-cyan' },
              { label: 'Referral', value: 22, color: 'bg-status-success' },
              { label: 'Social', value: 15, color: 'bg-status-warning' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-text-secondary">{item.label}</span>
                  <span className="text-sm font-medium text-text-primary">{item.value}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="text-h3 mb-4">Top Performing Clients</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Page Views</th>
                  <th>Conversions</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topClients.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-text-muted">No client data yet</td></tr>
                ) : topClients.map((client) => {
                  const c = client as Record<string, unknown>
                  const planPrice = c.plan === 'Enterprise' ? 299 : c.plan === 'Business' ? 149 : c.plan === 'Pro' ? 79 : 29
                  return (
                    <tr key={String(c.id)}>
                      <td className="font-medium text-text-primary">{String(c.name)}</td>
                      <td className="text-text-secondary">—</td>
                      <td className="text-text-secondary">—</td>
                      <td className="text-text-secondary">{formatCurrency(planPrice)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-h3 mb-4">Module Usage</h2>
          <div className="space-y-4">
            {moduleUsage.map((module) => (
              <div key={module.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-text-secondary">{module.name}</span>
                  <span className="text-sm font-medium text-text-primary">{module.percent}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-indigo rounded-full" style={{ width: `${module.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-h3 mb-4">Downloadable Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reports.map((report) => (
            <div key={report.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-text-primary">{report.name}</p>
                <p className="text-xs text-text-muted mt-1">{report.format} • {report.size}</p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}