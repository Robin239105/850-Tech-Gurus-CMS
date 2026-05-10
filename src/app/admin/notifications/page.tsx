'use client'

import { useState } from 'react'
import { Bell, Info, CheckCircle, AlertTriangle, XCircle, Filter } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { mockNotifications } from '@/lib/mock-data'
import { formatRelativeTime } from '@/lib/utils'

const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
}

const typeColors = {
  info: 'text-status-info bg-status-info/10',
  success: 'text-status-success bg-status-success/10',
  warning: 'text-status-warning bg-status-warning/10',
  error: 'text-status-danger bg-status-danger/10',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [filter, setFilter] = useState('all')

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => n.type === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">Notifications</h1>
          <p className="text-sm text-text-secondary mt-1">Stay updated with platform events</p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllAsRead}>
          Mark all as read
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-card-border">
          <Bell className="w-5 h-5 text-brand-indigo" />
          <span className="text-text-secondary">Unread:</span>
          <span className="font-bold text-text-primary">{unreadCount}</span>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="success">Success</TabsTrigger>
          <TabsTrigger value="warning">Warning</TabsTrigger>
          <TabsTrigger value="error">Error</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          <Card className="divide-y divide-card-border">
            {filteredNotifications.map((notification) => {
              const Icon = typeIcons[notification.type]
              return (
                <div
                  key={notification.id}
                  className={`p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-brand-indigo-light/30' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className={`p-2 rounded-lg ${typeColors[notification.type]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-text-primary">{notification.title}</h3>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-brand-indigo rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-text-secondary">{notification.description}</p>
                    <p className="text-xs text-text-muted mt-2">{formatRelativeTime(notification.timestamp)}</p>
                  </div>
                  <Button variant="ghost" size="icon-sm">
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              )
            })}

            {filteredNotifications.length === 0 && (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <p className="text-text-secondary">No notifications</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}