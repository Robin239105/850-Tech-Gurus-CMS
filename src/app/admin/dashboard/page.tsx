'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Users, CreditCard, Ticket, HardDrive, TrendingUp, Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar } from '@/components/ui/avatar'
import { formatRelativeTime, formatBytes } from '@/lib/utils'

interface DashboardData {
  totalClients: number
  activePlans: number
  openTickets: number
  storageUsed: number
  recentClients: Record<string, unknown>[]
  recentActivity: Record<string, unknown>[]
  recentSignups: Record<string, unknown>[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/dashboard')
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleRefresh = () => {
    setRefreshing(true)
    load()
  }

  const statusItems = [
    { label: 'Total Clients', value: data?.totalClients ?? '—', icon: Users },
    { label: 'Active Plans', value: data?.activePlans ?? '—', icon: CreditCard },
    { label: 'Open Tickets', value: data?.openTickets ?? '—', icon: Ticket },
    { label: 'Storage Used', value: data ? `${data.storageUsed}%` : '—', icon: HardDrive },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">Command Center</h1>
          <p className="text-sm text-text-secondary mt-1">Last updated: {formatRelativeTime(new Date())}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Card key={i} className="p-5 h-24 animate-pulse bg-gray-100" />)}
        </div>
      ) : (
        <div className="bg-brand-indigo rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statusItems.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-indigo-200" />
                    <span className="text-indigo-200 text-xs">{item.label}</span>
                  </div>
                  <p className="text-white text-xl font-bold">{item.value}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-text-secondary text-sm">Total Clients</span>
            <Users className="w-5 h-5 text-brand-indigo" />
          </div>
          <p className="text-2xl font-bold text-text-primary">{data?.totalClients ?? '—'}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-text-secondary text-sm">Active Plans</span>
            <CreditCard className="w-5 h-5 text-brand-indigo" />
          </div>
          <p className="text-2xl font-bold text-text-primary">{data?.activePlans ?? '—'}</p>
          <p className="text-xs text-text-muted mt-1">
            {data ? `${data.totalClients > 0 ? Math.round((data.activePlans / data.totalClients) * 100) : 0}% of total` : ''}
          </p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-text-secondary text-sm">Open Tickets</span>
            <Ticket className="w-5 h-5 text-brand-indigo" />
          </div>
          <p className="text-2xl font-bold text-text-primary">{data?.openTickets ?? '—'}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-text-secondary text-sm">Storage Used</span>
            <HardDrive className="w-5 h-5 text-brand-indigo" />
          </div>
          <p className="text-2xl font-bold text-text-primary">{data ? `${data.storageUsed}%` : '—'}</p>
          <Progress value={data?.storageUsed ?? 0} className="mt-2 h-1.5" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h3">Recent Clients</h2>
              <Button size="sm" onClick={() => window.location.href = '/admin/clients'}>
                <Plus className="w-4 h-4 mr-1" />
                Add Client
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Storage</th>
                    <th>Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.recentClients ?? []).map((client) => {
                    const c = client as Record<string, unknown>
                    const storagePercent = c.storage_limit ? Math.round((Number(c.storage) / Number(c.storage_limit)) * 100) : 0
                    return (
                      <tr key={String(c.id)}>
                        <td>
                          <p className="font-medium text-text-primary">{String(c.name)}</p>
                          <p className="text-xs text-text-muted">{String(c.email)}</p>
                        </td>
                        <td><Badge variant="indigo">{String(c.plan)}</Badge></td>
                        <td>
                          <Badge className={c.status === 'active' ? 'badge-green' : c.status === 'pending' ? 'badge-amber' : 'badge-gray'}>
                            {String(c.status)}
                          </Badge>
                        </td>
                        <td>
                          <div className="w-20">
                            <span className="text-xs text-text-muted">{storagePercent}%</span>
                            <Progress value={storagePercent} className="h-1.5 mt-1" />
                          </div>
                        </td>
                        <td className="text-text-secondary text-xs">{formatRelativeTime(String(c.last_active))}</td>
                      </tr>
                    )
                  })}
                  {!loading && !data?.recentClients?.length && (
                    <tr><td colSpan={5} className="text-center text-text-muted py-8">No clients yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="text-h3 mb-4">Recent Sign-ups</h2>
            <div className="space-y-3">
              {(data?.recentSignups ?? []).map((signup, index) => {
                const s = signup as Record<string, unknown>
                return (
                  <div key={index} className="flex items-center justify-between p-2">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{String(s.name)}</p>
                      <p className="text-xs text-text-muted">{formatRelativeTime(String(s.created_at))}</p>
                    </div>
                    <Badge variant="blue">{String(s.plan)}</Badge>
                  </div>
                )
              })}
              {!loading && !data?.recentSignups?.length && (
                <p className="text-text-muted text-sm text-center py-4">No sign-ups yet</p>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-h3 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.href='/admin/clients/new'}>Add Client</Button>
              <Button variant="outline" size="sm" onClick={() => window.location.href='/admin/tickets'}>View Tickets</Button>
              <Button variant="outline" size="sm" onClick={() => window.location.href='/admin/activity'}>Activity Log</Button>
              <Button variant="outline" size="sm" onClick={() => window.location.href='/admin/settings'}>Settings</Button>
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-5">
        <h2 className="text-h3 mb-4">Platform Activity</h2>
        <div className="space-y-3">
          {(data?.recentActivity ?? []).map((activity) => {
            const a = activity as Record<string, unknown>
            return (
              <div key={String(a.id)} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                <div className={`w-1 h-full rounded-full self-stretch ${
                  a.type === 'login' ? 'bg-brand-cyan' :
                  a.type === 'page_created' || a.type === 'page_updated' ? 'bg-brand-indigo' :
                  a.type === 'media_uploaded' ? 'bg-status-success' :
                  a.type === 'form_submitted' ? 'bg-status-warning' :
                  'bg-text-muted'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-text-primary">{String(a.description)}</p>
                  {!!a.client_name && <p className="text-xs text-text-muted mt-1">{String(a.client_name)}{a.actor ? ` • ${String(a.actor)}` : ''}</p>}
                </div>
                <span className="text-xs text-text-muted whitespace-nowrap">{formatRelativeTime(String(a.created_at))}</span>
              </div>
            )
          })}
          {!loading && !data?.recentActivity?.length && (
            <p className="text-text-muted text-sm text-center py-8">No activity yet</p>
          )}
        </div>
      </Card>
    </div>
  )
}