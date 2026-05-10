'use client'

import { useState } from 'react'
import { RefreshCw, Users, CreditCard, Ticket, HardDrive, DollarSign, TrendingUp, Plus, Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Avatar } from '@/components/ui/avatar'
import { mockClients, dashboardStats, onlineUsers, recentSignups, mockActivity, plans } from '@/lib/mock-data'
import { formatRelativeTime, formatCurrency, formatBytes } from '@/lib/utils'

export default function DashboardPage() {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1500)
  }

  const statusItems = [
    { label: 'Total Clients', value: dashboardStats.totalClients, icon: Users },
    { label: 'Active Plans', value: dashboardStats.activePlans, icon: CreditCard },
    { label: 'Open Tickets', value: dashboardStats.openTickets, icon: Ticket },
    { label: 'Storage Used', value: `${dashboardStats.storageUsed}%`, icon: HardDrive },
    { label: 'Revenue', value: formatCurrency(dashboardStats.monthlyRevenue), icon: DollarSign },
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

      <div className="bg-brand-indigo rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-text-secondary text-sm">Total Clients</span>
            <Users className="w-5 h-5 text-brand-indigo" />
          </div>
          <p className="text-2xl font-bold text-text-primary">{dashboardStats.totalClients}</p>
          <p className="text-xs text-status-success mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +12 this month
          </p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-text-secondary text-sm">Active Plans</span>
            <CreditCard className="w-5 h-5 text-brand-indigo" />
          </div>
          <p className="text-2xl font-bold text-text-primary">{dashboardStats.activePlans}</p>
          <p className="text-xs text-text-muted mt-1">91% of total</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-text-secondary text-sm">Open Tickets</span>
            <Ticket className="w-5 h-5 text-brand-indigo" />
          </div>
          <p className="text-2xl font-bold text-text-primary">{dashboardStats.openTickets}</p>
          <p className="text-xs text-status-warning mt-1">5 high priority</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-text-secondary text-sm">Storage Used</span>
            <HardDrive className="w-5 h-5 text-brand-indigo" />
          </div>
          <p className="text-2xl font-bold text-text-primary">{dashboardStats.storageUsed}%</p>
          <Progress value={dashboardStats.storageUsed} className="mt-2 h-1.5" />
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-text-secondary text-sm">Revenue</span>
            <DollarSign className="w-5 h-5 text-brand-indigo" />
          </div>
          <p className="text-2xl font-bold text-text-primary">{formatCurrency(dashboardStats.monthlyRevenue)}</p>
          <p className="text-xs text-status-success mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +8% vs last month
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h3">Client Overview</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <Input placeholder="Search clients..." className="pl-9 w-48" />
                </div>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Client
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Storage</th>
                    <th>Pages</th>
                    <th>Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {mockClients.slice(0, 5).map((client) => (
                    <tr key={client.id}>
                      <td>
                        <div>
                          <p className="font-medium text-text-primary">{client.name}</p>
                          <p className="text-xs text-text-muted">{client.email}</p>
                        </div>
                      </td>
                      <td>
                        <Badge variant="indigo">{client.plan}</Badge>
                      </td>
                      <td>
                        <Badge className={client.status === 'active' ? 'badge-green' : client.status === 'pending' ? 'badge-amber' : 'badge-gray'}>
                          {client.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="w-24">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-text-muted">{Math.round((client.storage / client.storageLimit) * 100)}%</span>
                          </div>
                          <Progress value={(client.storage / client.storageLimit) * 100} className="h-1.5" />
                        </div>
                      </td>
                      <td className="text-text-secondary">{client.pages}</td>
                      <td className="text-text-secondary text-xs">{formatRelativeTime(client.lastActive)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h3">Currently Online</h2>
              <span className="online-dot" />
            </div>
            <div className="space-y-3">
              {onlineUsers.map((user, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <Avatar className="w-8 h-8 bg-brand-indigo text-white text-xs">{user.avatar}</Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{user.name}</p>
                    <p className="text-xs text-text-muted truncate">{user.client}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-h3 mb-4">Recent Sign-ups</h2>
            <div className="space-y-3">
              {recentSignups.map((signup, index) => (
                <div key={index} className="flex items-center justify-between p-2">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{signup.name}</p>
                    <p className="text-xs text-text-muted">{formatRelativeTime(signup.date)}</p>
                  </div>
                  <Badge variant="blue">{signup.plan}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-h3 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">Add Client</Button>
              <Button variant="outline" size="sm">View Tickets</Button>
              <Button variant="outline" size="sm">Reports</Button>
              <Button variant="outline" size="sm">Settings</Button>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="text-h3 mb-4">Platform Activity</h2>
          <div className="space-y-3">
            {mockActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <div
                  className={`w-1 h-full rounded-full self-stretch ${
                    activity.type === 'login' ? 'bg-brand-cyan' :
                    activity.type === 'page_created' || activity.type === 'page_updated' ? 'bg-brand-indigo' :
                    activity.type === 'media_uploaded' ? 'bg-status-success' :
                    activity.type === 'form_submitted' ? 'bg-status-warning' :
                    activity.type === 'order_created' ? 'bg-status-info' :
                    'bg-text-muted'
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm text-text-primary">{activity.description}</p>
                  <p className="text-xs text-text-muted mt-1">
                    {activity.client && <span className="font-medium">{activity.client}</span>}
                    {activity.client && ' • '}
                    {activity.user}
                  </p>
                </div>
                <span className="text-xs text-text-muted whitespace-nowrap">
                  {formatRelativeTime(activity.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h3">System Health</h2>
              <Badge variant="green">Healthy</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {['API', 'Database', 'Storage'].map((item) => (
                <div key={item} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-text-muted mb-1">{item}</p>
                  <p className="text-sm font-semibold text-status-success">99.9%</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-h3 mb-4">Storage Breakdown</h2>
            <div className="space-y-4">
              {[
                { label: 'Client Media', percent: 45, color: 'bg-brand-indigo' },
                { label: 'Page Assets', percent: 30, color: 'bg-brand-cyan' },
                { label: 'Database', percent: 15, color: 'bg-status-success' },
                { label: 'Backups', percent: 10, color: 'bg-status-warning' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-text-secondary">{item.label}</span>
                    <span className="text-sm text-text-primary font-medium">{item.percent}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}