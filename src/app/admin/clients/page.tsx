'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, Plus, Grid, List, Eye, Globe, Loader2, MoreHorizontal, Mail } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Avatar } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatRelativeTime, formatBytes } from '@/lib/utils'

type Client = Record<string, unknown>

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const res = await fetch(`/api/admin/clients?${params}`)
      if (res.ok) setClients(await res.json())
    } finally {
      setLoading(false)
    }
  }, [searchQuery, statusFilter])

  useEffect(() => { load() }, [load])

  const handleBulkAction = async (action: 'activate' | 'suspend' | 'delete') => {
    await Promise.all(selectedClients.map(id =>
      fetch(`/api/admin/clients/${id}`, {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: action !== 'delete' ? JSON.stringify({ status: action === 'activate' ? 'active' : 'suspended' }) : undefined,
      })
    ))
    setSelectedClients([])
    load()
  }

  const filteredClients = clients

  const toggleSelectAll = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([])
    } else {
      setSelectedClients(filteredClients.map(c => String(c.id)))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedClients.includes(id)) {
      setSelectedClients(selectedClients.filter(c => c !== id))
    } else {
      setSelectedClients([...selectedClients, id])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">All Clients</h1>
          <p className="text-sm text-text-secondary mt-1">Manage and monitor all your clients</p>
        </div>
        <Link href="/admin/clients/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add New Client
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>



            <div className="flex items-center border border-card-border rounded-md">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-r-none"
                onClick={() => setViewMode('table')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-l-none"
                onClick={() => setViewMode('card')}
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {selectedClients.length > 0 && (
        <Card className="p-4 bg-brand-indigo-light border-brand-indigo">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-brand-indigo">
              {selectedClients.length} client(s) selected
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('activate')}>Activate</Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('suspend')}>Suspend</Button>
              <Button variant="outline" size="sm" className="text-status-danger border-status-danger hover:bg-red-50" onClick={() => handleBulkAction('delete')}>
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {viewMode === 'table' ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-12">
                    <Checkbox
                      checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th>Client</th>
                  <th>Website</th>
                  <th>Status</th>
                  <th>Storage</th>
                  <th>Pages</th>
                  <th>Last Active</th>
                  <th>Created</th>
                  <th className="w-12">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-text-muted" /></td></tr>
                ) : filteredClients.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-12 text-text-muted">No clients found</td></tr>
                ) : filteredClients.map((client) => {
                  const id = String(client.id)
                  const storagePercent = client.storage_limit ? Math.round((Number(client.storage) / Number(client.storage_limit)) * 100) : 0
                  return (
                    <tr key={id}>
                      <td>
                        <Checkbox
                          checked={selectedClients.includes(id)}
                          onCheckedChange={() => toggleSelect(id)}
                        />
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8 bg-brand-indigo text-white text-xs">
                            {String(client.name).split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </Avatar>
                          <div>
                            <p className="font-medium text-text-primary">{String(client.name)}</p>
                            <p className="text-xs text-text-muted">{String(client.email)}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        {client.website ? (
                          <a href={String(client.website)} target="_blank" rel="noopener noreferrer" className="text-brand-indigo hover:underline flex items-center gap-1">
                            <Globe className="w-3 h-3" />Visit
                          </a>
                        ) : '—'}
                      </td>
                      <td>
                        <Badge className={client.status === 'active' ? 'badge-green' : client.status === 'pending' ? 'badge-amber' : client.status === 'inactive' ? 'badge-gray' : 'badge-red'}>
                          {String(client.status)}
                        </Badge>
                      </td>
                      <td>
                        <div className="w-24">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-text-muted">{formatBytes(Number(client.storage))}</span>
                            <span className="text-xs text-text-muted">{storagePercent}%</span>
                          </div>
                          <Progress value={storagePercent} className="h-1.5" />
                        </div>
                      </td>
                      <td className="text-text-secondary">{String(client.pages ?? 0)}</td>
                      <td className="text-text-secondary text-xs">{formatRelativeTime(String(client.last_active))}</td>
                      <td className="text-text-secondary text-xs">{formatRelativeTime(String(client.created_at))}</td>
                      <td>
                        <Link href={`/admin/clients/${id}`}>
                          <Button variant="ghost" size="icon-sm"><Eye className="w-4 h-4" /></Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const c = client as Record<string, unknown>
            const id = String(c.id)
            const storagePercent = c.storage_limit ? Math.round((Number(c.storage) / Number(c.storage_limit)) * 100) : 0
            return (
              <Card key={id} className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 bg-brand-indigo text-white">
                      {String(c.name).split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-text-primary">{String(c.name)}</h3>
                      <p className="text-xs text-text-muted">{String(c.email)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon-sm"><MoreHorizontal className="w-4 h-4" /></Button>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Status</span>
                    <Badge className={c.status === 'active' ? 'badge-green' : c.status === 'pending' ? 'badge-amber' : 'badge-gray'}>{String(c.status)}</Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Storage</span>
                    <span className="text-text-primary font-medium">{storagePercent}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Pages</span>
                    <span className="text-text-primary font-medium">{String(c.pages ?? 0)}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-card-border flex items-center gap-2">
                  <Link href={`/admin/clients/${id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full"><Eye className="w-4 h-4 mr-1" />View</Button>
                  </Link>
                  <Button variant="ghost" size="sm"><Mail className="w-4 h-4" /></Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Showing {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm">1</Button>
          <Button variant="outline" size="sm">2</Button>
          <Button variant="outline" size="sm">3</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  )
}