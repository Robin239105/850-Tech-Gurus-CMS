'use client'

import { useState, useEffect, useCallback } from 'react'
import { Filter, Search, RefreshCw, User, Clock, Calendar } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatRelativeTime } from '@/lib/utils'

const activityColors: Record<string, string> = {
  login: 'bg-brand-cyan',
  page_created: 'bg-brand-indigo',
  page_updated: 'bg-status-info',
  media_uploaded: 'bg-status-success',
  form_submitted: 'bg-status-warning',
  order_created: 'bg-purple-500',
  client_added: 'bg-pink-500',
  settings_changed: 'bg-orange-500',
  ticket_created: 'bg-red-500',
}

const activityLabels: Record<string, string> = {
  login: 'Login',
  page_created: 'Page Created',
  page_updated: 'Page Updated',
  media_uploaded: 'Media Uploaded',
  form_submitted: 'Form Submitted',
  order_created: 'Order Created',
  client_added: 'Client Added',
  settings_changed: 'Settings Changed',
  ticket_created: 'Ticket Created',
}

type Activity = Record<string, unknown>

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [filter, setFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/admin/activity')
      if (res.ok) setActivities(await res.json())
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filteredActivity = filter === 'all'
    ? activities
    : activities.filter(a => String(a.type) === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">Live Activity</h1>
          <p className="text-sm text-text-secondary mt-1">Real-time platform activity monitor</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="bg-brand-cyan rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-white font-medium">Live Activity Stream</span>
          </div>
          <Badge className="bg-white/20 text-white border-0">
            {filteredActivity.length} event{filteredActivity.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h3">Activity Feed</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <Input placeholder="Search..." className="pl-9 w-48" />
                </div>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-36">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activity</SelectItem>
                    <SelectItem value="login">Logins</SelectItem>
                    <SelectItem value="page_created">Page Created</SelectItem>
                    <SelectItem value="page_updated">Page Updated</SelectItem>
                    <SelectItem value="media_uploaded">Media Uploaded</SelectItem>
                    <SelectItem value="form_submitted">Form Submitted</SelectItem>
                    <SelectItem value="order_created">Order Created</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredActivity.length === 0 && (
                <p className="text-text-muted text-sm text-center py-8">No activity yet</p>
              )}
              {filteredActivity.map((activity) => {
                const a = activity as Record<string, unknown>
                const type = String(a.type ?? '')
                return (
                  <div key={String(a.id)} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-1 h-16 rounded-full self-stretch ${activityColors[type] ?? 'bg-text-muted'}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="gray">{activityLabels[type] ?? type}</Badge>
                        <span className="text-xs text-text-muted">{formatRelativeTime(String(a.created_at))}</span>
                      </div>
                      <p className="text-sm text-text-primary font-medium">{String(a.description)}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
                        {!!a.client_name && (
                          <span className="flex items-center gap-1"><User className="w-3 h-3" />{String(a.client_name)}</span>
                        )}
                        {!!a.actor && (
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{String(a.actor)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h3">Today&apos;s Summary</h2>
              <Calendar className="w-5 h-5 text-brand-indigo" />
            </div>
            <div className="space-y-3">
              {[
                { label: 'Total Events', value: activities.length, color: 'text-brand-indigo' },
                { label: 'Client Events', value: activities.filter(a => !!a.client_name).length, color: 'text-status-success' },
                { label: 'Page Events', value: activities.filter(a => String(a.type).includes('page')).length, color: 'text-status-info' },
                { label: 'Form Events', value: activities.filter(a => String(a.type).includes('form')).length, color: 'text-status-warning' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{item.label}</span>
                  <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}