'use client'

import { useState, useEffect } from 'react'
import { HardDrive, Loader2, AlertTriangle, TrendingUp, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatBytes } from '@/lib/utils'

function barColor(pct: number) {
  if (pct >= 90) return 'bg-status-danger'
  if (pct >= 75) return 'bg-status-warning'
  return 'bg-brand-indigo'
}

export default function StoragePage() {
  const [clients, setClients] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/clients')
      .then(r => r.ok ? r.json() : [])
      .then(setClients)
      .finally(() => setLoading(false))
  }, [])

  const totalUsed = clients.reduce((s, c) => s + Number(c.storage ?? 0), 0)
  const totalLimit = clients.reduce((s, c) => s + Number(c.storage_limit ?? 0), 0)
  const overallPct = totalLimit > 0 ? Math.round((totalUsed / totalLimit) * 100) : 0
  const nearLimit = clients.filter(c => {
    const pct = Number(c.storage_limit) > 0 ? (Number(c.storage) / Number(c.storage_limit)) * 100 : 0
    return pct >= 80
  }).length
  const sorted = [...clients].sort((a, b) => Number(b.storage ?? 0) - Number(a.storage ?? 0))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1">Storage Monitor</h1>
        <p className="text-sm text-text-secondary mt-1">Track storage usage across all client accounts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-secondary">Total Used</p>
            <HardDrive className="w-5 h-5 text-brand-indigo" />
          </div>
          <p className="text-2xl font-bold">{formatBytes(totalUsed)}</p>
          <p className="text-xs text-text-muted mt-1">of {formatBytes(totalLimit)} allocated</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-secondary">Overall Usage</p>
            <TrendingUp className="w-5 h-5 text-brand-cyan" />
          </div>
          <p className={`text-2xl font-bold ${overallPct >= 90 ? 'text-status-danger' : overallPct >= 75 ? 'text-status-warning' : 'text-text-primary'}`}>
            {overallPct}%
          </p>
          <Progress value={overallPct} className="h-1.5 mt-2" />
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-secondary">Total Clients</p>
            <Users className="w-5 h-5 text-status-success" />
          </div>
          <p className="text-2xl font-bold">{clients.length}</p>
          <p className="text-xs text-text-muted mt-1">with storage allocated</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-secondary">Near Limit</p>
            <AlertTriangle className={`w-5 h-5 ${nearLimit > 0 ? 'text-status-warning' : 'text-text-muted'}`} />
          </div>
          <p className={`text-2xl font-bold ${nearLimit > 0 ? 'text-status-warning' : 'text-text-primary'}`}>
            {nearLimit}
          </p>
          <p className="text-xs text-text-muted mt-1">clients at ≥80% capacity</p>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-h3 mb-4">Per-Client Breakdown</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-brand-indigo" />
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-12">
            <HardDrive className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="font-medium text-text-primary">No clients yet</p>
            <p className="text-sm text-text-muted mt-1">Storage usage will appear here once clients are added.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {sorted.map((c) => {
              const used = Number(c.storage ?? 0)
              const limit = Number(c.storage_limit ?? 0)
              const pct = limit > 0 ? Math.round((used / limit) * 100) : 0
              return (
                <div key={String(c.id)}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">{String(c.name)}</span>
                      <Badge variant="gray" className="text-[10px]">{String(c.plan ?? 'Starter')}</Badge>
                      {pct >= 90 && <Badge className="badge-red text-[10px]">Critical</Badge>}
                      {pct >= 75 && pct < 90 && <Badge className="badge-amber text-[10px]">Warning</Badge>}
                    </div>
                    <span className="text-xs text-text-muted tabular-nums">
                      {formatBytes(used)} / {formatBytes(limit)} &nbsp;·&nbsp; <span className={`font-semibold ${pct >= 90 ? 'text-status-danger' : pct >= 75 ? 'text-status-warning' : 'text-text-primary'}`}>{pct}%</span>
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${barColor(pct)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
