'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Plus, Grid, List, Filter, MoreHorizontal, Eye, Edit, Trash2, Mail, Globe } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Avatar } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { mockClients } from '@/lib/mock-data'
import { formatRelativeTime, formatBytes } from '@/lib/utils'

export default function ClientsPage() {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.website.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleSelectAll = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([])
    } else {
      setSelectedClients(filteredClients.map(c => c.id))
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
            <Select defaultValue="all">
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

            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
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
              <Button variant="outline" size="sm">Activate</Button>
              <Button variant="outline" size="sm">Suspend</Button>
              <Button variant="outline" size="sm" className="text-status-danger border-status-danger hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-1" />
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
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Storage</th>
                  <th>Pages</th>
                  <th>Last Active</th>
                  <th>Created</th>
                  <th className="w-12">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <Checkbox
                        checked={selectedClients.includes(client.id)}
                        onCheckedChange={() => toggleSelect(client.id)}
                      />
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 bg-brand-indigo text-white text-xs">
                          {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </Avatar>
                        <div>
                          <p className="font-medium text-text-primary">{client.name}</p>
                          <p className="text-xs text-text-muted">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-brand-indigo hover:underline flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        Visit
                      </a>
                    </td>
                    <td>
                      <Badge variant="indigo">{client.plan}</Badge>
                    </td>
                    <td>
                      <Badge className={client.status === 'active' ? 'badge-green' : client.status === 'pending' ? 'badge-amber' : client.status === 'inactive' ? 'badge-gray' : 'badge-red'}>
                        {client.status}
                      </Badge>
                    </td>
                    <td>
                      <div className="w-24">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-text-muted">{formatBytes(client.storage)}</span>
                          <span className="text-xs text-text-muted">{Math.round((client.storage / client.storageLimit) * 100)}%</span>
                        </div>
                        <Progress value={(client.storage / client.storageLimit) * 100} className="h-1.5" />
                      </div>
                    </td>
                    <td className="text-text-secondary">{client.pages}</td>
                    <td className="text-text-secondary text-xs">{formatRelativeTime(client.lastActive)}</td>
                    <td className="text-text-secondary text-xs">{formatRelativeTime(client.createdAt)}</td>
                    <td>
                      <Link href={`/admin/clients/${client.id}`}>
                        <Button variant="ghost" size="icon-sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 bg-brand-indigo text-white">
                    {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-text-primary">{client.name}</h3>
                    <p className="text-xs text-text-muted">{client.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Status</span>
                  <Badge className={client.status === 'active' ? 'badge-green' : client.status === 'pending' ? 'badge-amber' : 'badge-gray'}>
                    {client.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Plan</span>
                  <Badge variant="indigo">{client.plan}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Storage</span>
                  <span className="text-text-primary font-medium">{Math.round((client.storage / client.storageLimit) * 100)}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Pages</span>
                  <span className="text-text-primary font-medium">{client.pages}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-card-border flex items-center gap-2">
                <Link href={`/admin/clients/${client.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </Link>
                <Button variant="ghost" size="sm">
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Showing {filteredClients.length} of {mockClients.length} clients
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