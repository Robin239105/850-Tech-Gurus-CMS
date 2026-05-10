'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Mail, Globe, Phone, Edit, MoreHorizontal, FileText, Image, ShoppingCart, FormInput, Settings, Clock, CreditCard, User, Loader2, CheckCircle, Ban, Key, Save } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

type Client = Record<string, unknown>
type Activity = Record<string, unknown>

const PLANS = ['Starter', 'Pro', 'Business', 'Enterprise']

export default function ClientDetailPage() {
  const params = useParams()
  const [client, setClient] = useState<Client | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [actionMsg, setActionMsg] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwError, setPwError] = useState('')

  const id = String(params.id)

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/clients/${id}`).then(r => r.ok ? r.json() : null),
      fetch('/api/admin/activity').then(r => r.ok ? r.json() : []),
    ]).then(([c, a]) => {
      setClient(c)
      setActivities(a)
    }).finally(() => setLoading(false))
  }, [id])

  const setStatus = async (status: string) => {
    setSaving(true)
    const res = await fetch(`/api/admin/clients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const updated = await res.json()
      setClient(updated)
      setActionMsg(`Client ${status} successfully`)
    }
    setSaving(false)
    setTimeout(() => setActionMsg(''), 3000)
  }

  const setPlan = async (plan: string) => {
    setSaving(true)
    const res = await fetch(`/api/admin/clients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    if (res.ok) {
      const updated = await res.json()
      setClient(updated)
      setActionMsg('Plan updated')
    }
    setSaving(false)
    setTimeout(() => setActionMsg(''), 3000)
  }

  const handleSetPassword = async (activate: boolean) => {
    setPwError('')
    if (newPassword.length < 8) { setPwError('Password must be at least 8 characters.'); return }
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match.'); return }
    setSaving(true)
    const res = await fetch(`/api/admin/clients/${id}/set-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword, activate }),
    })
    const data = await res.json()
    if (res.ok) {
      setClient(prev => prev ? { ...prev, ...data.client } : prev)
      setNewPassword('')
      setConfirmPassword('')
      setActionMsg(activate ? 'Password set and client activated!' : 'Password updated')
    } else {
      setPwError(data.message)
    }
    setSaving(false)
    setTimeout(() => setActionMsg(''), 4000)
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-brand-indigo" /></div>
  }

  if (!client) {
    return (
      <div className="text-center py-20">
        <p className="text-text-muted">Client not found.</p>
        <Link href="/admin/clients"><Button variant="outline" className="mt-4">Back to Clients</Button></Link>
      </div>
    )
  }

  const storagePercent = client.storage_limit ? Math.round((Number(client.storage) / Number(client.storage_limit)) * 100) : 0
  const clientActivities = activities.filter(a => a.client_id === client.id)

  const stats = [
    { label: 'Total Pages', value: String(client.pages ?? 0) },
    { label: 'Storage Used', value: formatBytes(Number(client.storage ?? 0)) },
    { label: 'Forms', value: '—' },
    { label: 'Orders', value: '—' },
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
              {String(client.name ?? '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </Avatar>
            <div>
              <h2 className="text-h2">{String(client.name)}</h2>
              <p className="text-sm text-text-secondary">{String(client.company ?? '')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={client.status === 'active' ? 'badge-green' : client.status === 'pending' ? 'badge-amber' : client.status === 'suspended' ? 'badge-red' : 'badge-gray'}>
              {String(client.status)}
            </Badge>
            {client.status !== 'active' && (
              <Button size="sm" onClick={() => setStatus('active')} disabled={saving}>
                <CheckCircle className="w-4 h-4 mr-2" />Activate
              </Button>
            )}
            {client.status === 'active' && (
              <Button size="sm" variant="outline" onClick={() => setStatus('suspended')} disabled={saving}>
                <Ban className="w-4 h-4 mr-2" />Suspend
              </Button>
            )}
            {actionMsg && <span className="text-xs text-status-success font-medium">{actionMsg}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Mail className="w-5 h-5 text-text-muted" />
            <div>
              <p className="text-xs text-text-muted">Email</p>
              <p className="text-sm font-medium text-text-primary">{String(client.email ?? '—')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Phone className="w-5 h-5 text-text-muted" />
            <div>
              <p className="text-xs text-text-muted">Phone</p>
              <p className="text-sm font-medium text-text-primary">{String(client.phone ?? '—')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Globe className="w-5 h-5 text-text-muted" />
            <div>
              <p className="text-xs text-text-muted">Website</p>
              {client.website ? (
                <a href={String(client.website)} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-indigo hover:underline">
                  {String(client.website).replace('https://', '')}
                </a>
              ) : <span className="text-sm text-text-muted">—</span>}
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <CreditCard className="w-5 h-5 text-text-muted" />
            <div>
              <p className="text-xs text-text-muted">Plan</p>
              <Badge className="badge-indigo mt-1">{String(client.plan ?? '—')}</Badge>
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
              {formatBytes(Number(client.storage ?? 0))} / {formatBytes(Number(client.storage_limit ?? 0))}
            </span>
          </div>
          <Progress value={storagePercent} className="h-2" />
          <p className="text-xs text-text-muted mt-2">{storagePercent}% of storage used</p>
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
                  <span className="text-text-primary font-medium">{String(client.category ?? '—')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Created</span>
                  <span className="text-text-primary font-medium">{formatDate(String(client.created_at ?? ''))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Last Active</span>
                  <span className="text-text-primary font-medium">{formatRelativeTime(String(client.last_active ?? ''))}</span>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-h3 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {clientActivities.slice(0, 5).map((a) => (
                  <div key={String(a.id)} className="flex items-start gap-3 p-2">
                    <div className="w-2 h-2 rounded-full bg-brand-indigo mt-2" />
                    <div className="flex-1">
                      <p className="text-sm text-text-primary">{String(a.description)}</p>
                      <p className="text-xs text-text-muted mt-1">{String(a.actor ?? '')} • {formatRelativeTime(String(a.created_at))}</p>
                    </div>
                  </div>
                ))}
                {clientActivities.length === 0 && (
                  <p className="text-sm text-text-muted">No recent activity</p>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pages" className="mt-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-h3">Pages ({String(client.pages ?? 0)})</h3>
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
          <div className="space-y-4">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Key className="w-5 h-5 text-brand-indigo" />
                <h3 className="text-h3">Set Client Password</h3>
              </div>
              <p className="text-sm text-text-secondary mb-4">
                {client.password_hash ? 'Update the client login password.' : 'This client has no password yet — set one to let them log in.'}
              </p>
              <div className="space-y-3 max-w-sm">
                <div>
                  <Label>New Password</Label>
                  <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters" className="mt-1" />
                </div>
                <div>
                  <Label>Confirm Password</Label>
                  <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" className="mt-1" />
                </div>
                {pwError && <p className="text-sm text-status-danger">{pwError}</p>}
                <div className="flex gap-2 pt-1">
                  <Button onClick={() => handleSetPassword(false)} disabled={saving || !newPassword}>
                    <Save className="w-4 h-4 mr-2" />Save Password
                  </Button>
                  {client.status !== 'active' && (
                    <Button variant="outline" onClick={() => handleSetPassword(true)} disabled={saving || !newPassword}>
                      <CheckCircle className="w-4 h-4 mr-2" />Set Password &amp; Activate
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-h3 mb-4">Account Status</h3>
              <div className="flex items-center gap-3">
                <Badge className={client.status === 'active' ? 'badge-green' : client.status === 'pending' ? 'badge-amber' : 'badge-red'}>{String(client.status)}</Badge>
                {client.status !== 'active' && <Button size="sm" onClick={() => setStatus('active')} disabled={saving}><CheckCircle className="w-4 h-4 mr-2" />Activate</Button>}
                {client.status === 'active' && <Button size="sm" variant="outline" onClick={() => setStatus('suspended')} disabled={saving}><Ban className="w-4 h-4 mr-2" />Suspend</Button>}
                {client.status === 'suspended' && <Button size="sm" variant="outline" onClick={() => setStatus('pending')} disabled={saving}>Reset to Pending</Button>}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card className="p-5">
            <h3 className="text-h3 mb-4">Activity Log</h3>
            <div className="space-y-3">
              {clientActivities.map((a) => (
                <div key={String(a.id)} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-brand-indigo mt-2" />
                  <div className="flex-1">
                    <p className="text-sm text-text-primary">{String(a.description)}</p>
                    <p className="text-xs text-text-muted mt-1">
                      {String(a.actor ?? '')} • {formatRelativeTime(String(a.created_at))}
                    </p>
                  </div>
                </div>
              ))}
              {clientActivities.length === 0 && <p className="text-text-muted text-sm">No activity found.</p>}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="text-h3 mb-4">Current Plan</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PLANS.map(plan => (
                  <button
                    key={plan}
                    onClick={() => setPlan(plan)}
                    disabled={saving}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      client.plan === plan
                        ? 'border-brand-indigo bg-brand-indigo/5'
                        : 'border-card-border hover:border-brand-indigo/50'
                    }`}
                  >
                    <p className="font-semibold text-text-primary">{plan}</p>
                    <p className="text-xs text-text-muted mt-1">
                      {plan === 'Starter' ? '$29/mo' : plan === 'Pro' ? '$79/mo' : plan === 'Business' ? '$149/mo' : '$299/mo'}
                    </p>
                    {client.plan === plan && <Badge className="badge-indigo mt-2 text-[10px]">Current</Badge>}
                  </button>
                ))}
              </div>
              {actionMsg && <p className="text-sm text-status-success mt-3">{actionMsg}</p>}
            </Card>
            <Card className="p-5">
              <h3 className="text-h3 mb-2">Invoices</h3>
              <p className="text-sm text-text-muted">Invoice management coming soon.</p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}