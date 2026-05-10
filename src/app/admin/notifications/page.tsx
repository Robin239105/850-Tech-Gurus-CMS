'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Bell, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatRelativeTime } from '@/lib/utils'

type Notification = Record<string, unknown>

const typeIcons: Record<string, React.ElementType> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
}

const typeColors: Record<string, string> = {
  info: 'text-status-info bg-status-info/10',
  success: 'text-status-success bg-status-success/10',
  warning: 'text-status-warning bg-status-warning/10',
  error: 'text-status-danger bg-status-danger/10',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState('all')

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/notifications')
    if (res.ok) setNotifications(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = async (id: string) => {
    setNotifications(notifications.map(n => String(n.id) === id ? { ...n, read: true } : n))
    await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
  }

  const markAllAsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
    await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    })
  }

  const deleteNotification = async (id: string) => {
    setNotifications(notifications.filter(n => String(n.id) !== id))
    await fetch(`/api/admin/notifications?id=${id}`, { method: 'DELETE' })
  }

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => String(n.type) === filter)

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
              const n = notification as Record<string, unknown>
              const Icon = typeIcons[String(n.type)] ?? Info
              const id = String(n.id)
              return (
                <div
                  key={id}
                  className={`p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !n.read ? 'bg-brand-indigo-light/30' : ''
                  }`}
                  onClick={() => markAsRead(id)}
                >
                  <div className={`p-2 rounded-lg ${typeColors[String(n.type)] ?? typeColors.info}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-text-primary">{String(n.title)}</h3>
                      {!n.read && <span className="w-2 h-2 bg-brand-indigo rounded-full" />}
                    </div>
                    <p className="text-sm text-text-secondary">{String(n.description ?? '')}</p>
                    <p className="text-xs text-text-muted mt-2">{formatRelativeTime(String(n.created_at))}</p>
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); deleteNotification(id) }}>
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