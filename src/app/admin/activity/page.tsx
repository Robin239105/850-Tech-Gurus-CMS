
'use client'

import { useState } from 'react'
import { Activity, Filter, Search, RefreshCw, User, Clock, Calendar } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { mockActivity, onlineUsers, recentSignups } from '@/lib/mock-data'
import { formatRelativeTime, formatDate } from '@/lib/utils'

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

export default function ActivityPage() {
  const [filter, setFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1500)
  }

  const filteredActivity = filter === 'all'
    ? mockActivity
    : mockActivity.filter(a => a.type === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">Live Activity</h1>
          <p className="text-sm text-text-secondary mt-1">Real-time platform activity monitor</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
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
            {filteredActivity.length} events
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
              {filteredActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-1 h-16 rounded-full self-stretch ${activityColors[activity.type]}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="gray">{activityLabels[activity.type]}</Badge>
                      <span className="text-xs text-text-muted">{formatRelativeTime(activity.timestamp)}</span>
                    </div>
                    <p className="text-sm text-text-primary font-medium">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
                      {activity.client && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {activity.client}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activity.user}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h3">Currently Online</h2>
              <span className="online-dot" />
            </div>
            <div className="space-y-3">
              {onlineUsers.map((user, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="relative">
                    <Avatar className="w-9 h-9 bg-brand-indigo text-white text-xs">
                      {user.avatar}
                    </Avatar>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-status-success border-2 border-white rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{user.name}</p>
                    <p className="text-xs text-text-muted truncate">{user.client}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-h3 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-indigo" />
              Today&apos;s Summary
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Total Events', value: '47', color: 'text-brand-indigo' },
                { label: 'Active Users', value: '12', color: 'text-status-success' },
                { label: 'Page Updates', value: '18', color: 'text-status-info' },
                { label: 'Form Submissions', value: '7', color: 'text-status-warning' },
                { label: 'New Orders', value: '3', color: 'text-purple-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{item.label}</span>
                  <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
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
                    <p className="text-xs text-text-muted">{formatDate(signup.date)}</p>
                  </div>
                  <Badge variant="blue">{signup.plan}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}