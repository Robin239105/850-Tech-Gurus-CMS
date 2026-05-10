'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Search, Filter, Plus, Clock, CheckCircle, XCircle, AlertTriangle, MessageSquare, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatRelativeTime } from '@/lib/utils'

type Ticket = Record<string, unknown>

const priorityColors: Record<string, string> = {
  low: 'badge-gray',
  medium: 'badge-blue',
  high: 'badge-amber',
  critical: 'badge-red',
}

const statusIcons: Record<string, React.ElementType> = {
  open: AlertTriangle,
  in_progress: Clock,
  resolved: CheckCircle,
  closed: XCircle,
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('status', filter)
      if (priorityFilter !== 'all') params.set('priority', priorityFilter)
      const res = await fetch(`/api/admin/tickets?${params}`)
      if (res.ok) setTickets(await res.json())
    } finally {
      setLoading(false)
    }
  }, [filter, priorityFilter])

  useEffect(() => { load() }, [load])

  const updateTicket = async (id: string, data: Record<string, string>) => {
    await fetch(`/api/admin/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    load()
    setSelectedTicket(null)
  }

  const filteredTickets = tickets

  const stats = [
    { label: 'Open', value: tickets.filter(t => t.status === 'open').length, color: 'text-status-danger' },
    { label: 'In Progress', value: tickets.filter(t => t.status === 'in_progress').length, color: 'text-status-warning' },
    { label: 'Resolved', value: tickets.filter(t => t.status === 'resolved').length, color: 'text-status-success' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">Support Tickets</h1>
          <p className="text-sm text-text-secondary mt-1">Manage and respond to support requests</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5 text-center">
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-text-muted mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              placeholder="Search tickets..."
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-36">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Subject</th>
                    <th>Client</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned</th>
                    <th>Updated</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-text-muted" /></td></tr>
                  ) : filteredTickets.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-12 text-text-muted">No tickets found</td></tr>
                  ) : filteredTickets.map((ticket) => {
                    const t = ticket as Record<string, unknown>
                    const StatusIcon = statusIcons[String(t.status)] ?? AlertTriangle
                    return (
                      <tr
                        key={String(t.id)}
                        className={`cursor-pointer ${selectedTicket === String(t.id) ? 'bg-brand-indigo-light/30' : ''}`}
                        onClick={() => setSelectedTicket(String(t.id))}
                      >
                        <td className="font-mono text-xs text-text-muted">{String(t.id)}</td>
                        <td><p className="font-medium text-text-primary max-w-xs truncate">{String(t.subject)}</p></td>
                        <td className="text-text-secondary">{String(t.client_name ?? '—')}</td>
                        <td>
                          <Badge className={priorityColors[String(t.priority)] ?? 'badge-gray'}>{String(t.priority)}</Badge>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <StatusIcon className={`w-4 h-4 ${
                              t.status === 'open' ? 'text-status-danger' :
                              t.status === 'in_progress' ? 'text-status-warning' :
                              t.status === 'resolved' ? 'text-status-success' :
                              'text-text-muted'
                            }`} />
                            <span className="text-text-secondary text-xs capitalize">{String(t.status).replace('_', ' ')}</span>
                          </div>
                        </td>
                        <td className="text-text-secondary text-xs">{String(t.assigned_to ?? '—')}</td>
                        <td className="text-text-secondary text-xs">{formatRelativeTime(String(t.updated_at))}</td>
                        <td />
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          {selectedTicket ? (
            <Card className="p-5 sticky top-20">
              {(() => {
                const ticket = tickets.find(t => String(t.id) === selectedTicket)
                if (!ticket) return null
                const t = ticket as Record<string, unknown>
                const StatusIcon = statusIcons[String(t.status)] ?? AlertTriangle
                return (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-text-primary">{String(t.subject)}</h3>
                        <p className="text-xs text-text-muted mt-1">{String(t.id)}</p>
                      </div>
                      <Button variant="ghost" size="icon-sm" onClick={() => setSelectedTicket(null)}>
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={priorityColors[String(t.priority)] ?? 'badge-gray'}>{String(t.priority)}</Badge>
                      <Badge className={t.status === 'open' ? 'badge-red' : t.status === 'in_progress' ? 'badge-amber' : 'badge-green'}>
                        {String(t.status).replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-muted">Client</span>
                        <span className="text-text-primary">{String(t.client_name ?? '—')}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-muted">Assigned to</span>
                        <span className="text-text-primary">{String(t.assigned_to ?? '—')}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-muted">Created</span>
                        <span className="text-text-primary">{formatRelativeTime(String(t.created_at))}</span>
                      </div>
                    </div>
                    <div className="mb-6">
                      <p className="text-xs font-semibold text-text-secondary mb-2">Description</p>
                      <p className="text-sm text-text-primary p-3 bg-gray-50 rounded-lg">{String(t.description ?? '')}</p>
                    </div>
                    <div className="space-y-2">
                      <Button className="w-full" onClick={() => updateTicket(String(t.id), { status: 'in_progress' })}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Mark In Progress
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => updateTicket(String(t.id), { priority: 'critical' })}>Escalate</Button>
                        <Button variant="outline" className="flex-1" onClick={() => updateTicket(String(t.id), { status: t.status === 'resolved' ? 'open' : 'resolved' })}>
                          {t.status === 'resolved' ? 'Reopen' : 'Resolve'}
                        </Button>
                      </div>
                    </div>
                  </>
                )
              })()}
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-secondary">Select a ticket to view details</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}