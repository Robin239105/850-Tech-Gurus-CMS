'use client'

import { useState, useEffect } from 'react'
import { HardDrive, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatBytes } from '@/lib/utils'

export default function StoragePage() {
  const [clients, setClients] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/clients')
      .then(r => r.ok ? r.json() : [])
      .then(setClients)
      .finally(() => setLoading(false))
  }, [])

  const totalStorage = clients.reduce((sum, c) => sum + Number(c.storage ?? 0), 0)
  const totalLimit = clients.reduce((sum, c) => sum + Number(c.storage_limit ?? 0), 0)
  const overallPercent = totalLimit > 0 ? Math.round((totalStorage / totalLimit) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1">Storage Monitor</h1>
        <p className="text-sm text-text-secondary mt-1">Track storage usage across all client accounts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-sm text-text-secondary">Total Used</p>
          <p className="text-2xl font-bold mt-1">{formatBytes(totalStorage)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-text-secondary">Total Allocated</p>
          <p className="text-2xl font-bold mt-1">{formatBytes(totalLimit)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-text-secondary">Overall Usage</p>
          <p className="text-2xl font-bold mt-1">{overallPercent}%</p>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-h3 mb-4">Per-Client Storage</h2>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-brand-indigo" /></div>
        ) : clients.length === 0 ? (
          <div className="text-center py-8">
            <HardDrive className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted text-sm">No clients yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {clients.map((c) => {
              const used = Number(c.storage ?? 0)
              const limit = Number(c.storage_limit ?? 0)
              const pct = limit > 0 ? Math.round((used / limit) * 100) : 0
              return (
                <div key={String(c.id)}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-text-primary">{String(c.name)}</span>
                    <span className="text-xs text-text-muted">{formatBytes(used)} / {formatBytes(limit)} ({pct}%)</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
