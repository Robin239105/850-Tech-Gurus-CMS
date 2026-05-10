'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Mail, Globe, Phone, Edit, MoreHorizontal, FileText, Image, ShoppingCart, FormInput, Settings, Clock, CreditCard, User } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { mockClients, mockActivity } from '@/lib/mock-data'
import { formatRelativeTime, formatBytes, formatDate } from '@/lib/utils'

const tabs = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'pages', label: 'Pages', icon: FileText },
  { id: 'media', label: 'Media', icon: Image },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'forms', label: 'Forms', icon: FormInput },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'activity', label: 'Activity Log', icon: Clock },
  { id: 'billing', label: 'Billing', icon: CreditCard },
]

export default function ClientDetailPage() {
  const params = useParams()
  const client = mockClients.find(c => c.id === params.id) || mockClients[0]

  const stats = [
    { label: 'Total Pages', value: client.pages },
    { label: 'Storage Used', value: formatBytes(client.storage) },
    { label: 'Forms', value: 12 },
    { label: 'Orders', value: 45 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/clients">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-h1">Client Details</h1>
          <p className="text-sm text-text-secondary">View and manage client information</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 bg-brand-indigo text-white text-xl">
              {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </Avatar>
            <div>
              <h2 className="text-h2">{client.name}</h2>
              <p className="text-sm text-text-secondary">{client.company}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={client.status === 'active' ? 'badge-green' : client.status === 'pending' ? 'badge-amber' : 'badge-gray'}>
              {client.status}
            </Badge>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Mail className="w-5 h-5 text-text-muted" />
            <div>
              <p className="text-xs text-text-muted">Email</p>
              <p className="text-sm font-medium text-text-primary">{client.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Phone className="w-5 h-5 text-text-muted" />
            <div>
              <p className="text-xs text-text-muted">Phone</p>
              <p className="text-sm font-medium text-text-primary">{client.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Globe className="w-5 h-5 text-text-muted" />
            <div>
              <p className="text-xs text-text-muted">Website</p>
              <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-indigo hover:underline">
                {client.website.replace('https://', '')}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <CreditCard className="w-5 h-5 text-text-muted" />
            <div>
              <p className="text-xs text-text-muted">Plan</p>
              <Badge className="badge-indigo mt-1">{client.plan}</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              <p className="text-xs text-text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-card-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">Storage Usage</span>
            <span className="text-sm font-medium text-text-primary">
              {formatBytes(client.storage)} / {formatBytes(client.storageLimit)}
            </span>
          </div>
          <Progress value={(client.storage / client.storageLimit) * 100} className="h-2" />
          <p className="text-xs text-text-muted mt-2">
            {Math.round((client.storage / client.storageLimit) * 100)}% of storage used
          </p>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-5">
              <h3 className="text-h3 mb-4">Client Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Category</span>
                  <span className="text-text-primary font-medium">{client.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Created</span>
                  <span className="text-text-primary font-medium">{formatDate(client.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Last Active</span>
                  <span className="text-text-primary font-medium">{formatRelativeTime(client.lastActive)}</span>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-h3 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {mockActivity.filter(a => a.client === client.name).slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-2">
                    <div className="w-2 h-2 rounded-full bg-brand-indigo mt-2" />
                    <div className="flex-1">
                      <p className="text-sm text-text-primary">{activity.description}</p>
                      <p className="text-xs text-text-muted mt-1">{activity.user} • {formatRelativeTime(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
                {mockActivity.filter(a => a.client === client.name).length === 0 && (
                  <p className="text-sm text-text-muted">No recent activity</p>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pages" className="mt-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-h3">Pages ({client.pages})</h3>
              <Button size="sm">Add Page</Button>
            </div>
            <p className="text-text-muted text-sm">No pages found. Create your first page to get started.</p>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-h3">Media Library</h3>
              <Button size="sm">Upload Media</Button>
            </div>
            <p className="text-text-muted text-sm">No media files found. Upload files to get started.</p>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card className="p-5">
            <h3 className="text-h3 mb-4">Orders</h3>
            <p className="text-text-muted text-sm">No orders found.</p>
          </Card>
        </TabsContent>

        <TabsContent value="forms" className="mt-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-h3">Form Submissions</h3>
              <Button size="sm">Create Form</Button>
            </div>
            <p className="text-text-muted text-sm">No form submissions found.</p>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card className="p-5">
            <h3 className="text-h3 mb-4">Client Settings</h3>
            <p className="text-text-muted text-sm">Configure client-specific settings here.</p>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card className="p-5">
            <h3 className="text-h3 mb-4">Activity Log</h3>
            <div className="space-y-3">
              {mockActivity.filter(a => a.client === client.name || !a.client).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-brand-indigo mt-2" />
                  <div className="flex-1">
                    <p className="text-sm text-text-primary">{activity.description}</p>
                    <p className="text-xs text-text-muted mt-1">
                      {activity.client && `${activity.client} • `}
                      {activity.user} • {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <Card className="p-5">
            <h3 className="text-h3 mb-4">Billing & Invoices</h3>
            <p className="text-text-muted text-sm">No invoices found.</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}