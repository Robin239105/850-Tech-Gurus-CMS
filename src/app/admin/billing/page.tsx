'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Loader2, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const PLANS = [
  { name: 'Starter', price: 29, color: 'badge-gray' },
  { name: 'Pro', price: 79, color: 'badge-indigo' },
  { name: 'Business', price: 149, color: 'badge-cyan' },
  { name: 'Enterprise', price: 299, color: 'badge-green' },
]

export default function BillingPage() {
  const [clients, setClients] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/api/admin/clients')
      .then(r => r.ok ? r.json() : [])
      .then(setClients)
      .finally(() => setLoading(false))
  }, [])

  const changePlan = async (clientId: string, plan: string) => {
    setSaving(clientId)
    const res = await fetch(`/api/admin/clients/${clientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    if (res.ok) {
      const updated = await res.json() as Record<string, unknown>
      setClients(prev => prev.map(c => c.id === clientId ? updated : c))
      setMsg('Plan updated')
      setTimeout(() => setMsg(''), 3000)
    }
    setSaving(null)
  }

  const totalMRR = clients.reduce((sum, c) => {
    const p = PLANS.find(p => p.name === c.plan)
    return sum + (p?.price ?? 0)
  }, 0)

  const planCounts = PLANS.map(p => ({
    ...p,
    count: clients.filter(c => c.plan === p.name).length,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1">Billing & Plans</h1>
        <p className="text-sm text-text-secondary mt-1">Manage client subscriptions and billing</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {planCounts.map(p => (
          <Card key={p.name} className="p-5">
            <div className="flex items-center justify-between mb-2">
              <Badge className={p.color}>{p.name}</Badge>
              <span className="text-xs text-text-muted">${p.price}/mo</span>
            </div>
            <p className="text-3xl font-bold text-text-primary">{p.count}</p>
            <p className="text-xs text-text-muted mt-1">clients</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-h3">Monthly Recurring Revenue</h2>
          <CreditCard className="w-5 h-5 text-brand-indigo" />
        </div>
        <p className="text-4xl font-bold text-brand-indigo mt-2">${totalMRR.toLocaleString()}<span className="text-lg text-text-muted font-normal">/mo</span></p>
        <p className="text-sm text-text-secondary mt-1">Based on {clients.length} active subscriptions</p>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h3">Client Subscriptions</h2>
          {msg && <span className="text-sm text-status-success flex items-center gap-1"><CheckCircle className="w-4 h-4" />{msg}</span>}
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-brand-indigo" /></div>
        ) : clients.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="font-medium">No clients yet</p>
            <p className="text-sm text-text-muted mt-1">Add clients to manage their billing.</p>
            <Link href="/admin/clients/new"><Button className="mt-4">Add First Client</Button></Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Current Plan</th>
                  <th>MRR</th>
                  <th>Change Plan</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(c => {
                  const planDef = PLANS.find(p => p.name === c.plan)
                  return (
                    <tr key={String(c.id)}>
                      <td className="font-medium text-text-primary">
                        <Link href={`/admin/clients/${String(c.id)}`} className="hover:text-brand-indigo">
                          {String(c.name)}
                        </Link>
                      </td>
                      <td className="text-text-secondary text-sm">{String(c.email)}</td>
                      <td>
                        <Badge className={c.status === 'active' ? 'badge-green' : c.status === 'pending' ? 'badge-amber' : 'badge-red'}>
                          {String(c.status)}
                        </Badge>
                      </td>
                      <td><Badge className={planDef?.color ?? 'badge-gray'}>{String(c.plan ?? 'Starter')}</Badge></td>
                      <td className="text-text-primary font-medium">${planDef?.price ?? 0}/mo</td>
                      <td>
                        <select
                          className="text-sm border border-card-border rounded-md px-2 py-1 bg-white"
                          value={String(c.plan ?? 'Starter')}
                          disabled={saving === String(c.id)}
                          onChange={e => changePlan(String(c.id), e.target.value)}
                        >
                          {PLANS.map(p => <option key={p.name} value={p.name}>{p.name} — ${p.price}/mo</option>)}
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
