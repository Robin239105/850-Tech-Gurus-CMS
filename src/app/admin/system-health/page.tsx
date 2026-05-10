'use client'

import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

type ServiceStatus = 'operational' | 'degraded' | 'down'

type Service = {
  name: string
  endpoint: string
  status: ServiceStatus
  responseTime: number | null
  history: number[]
  checkedAt: string
}

const SERVICE_DEFS = [
  { name: 'API — Clients',      endpoint: '/api/admin/clients' },
  { name: 'API — Dashboard',    endpoint: '/api/admin/dashboard' },
  { name: 'API — Tickets',      endpoint: '/api/admin/tickets' },
  { name: 'API — Notifications',endpoint: '/api/admin/notifications' },
  { name: 'API — Activity',     endpoint: '/api/admin/activity' },
  { name: 'API — Settings',     endpoint: '/api/admin/settings' },
]

function deriveStatus(ms: number | null): ServiceStatus {
  if (ms === null) return 'down'
  if (ms > 2000) return 'degraded'
  return 'operational'
}

const statusIcons = {
  operational: CheckCircle,
  degraded: AlertTriangle,
  down: XCircle,
}

const statusColors = {
  operational: 'text-status-success',
  degraded: 'text-status-warning',
  down: 'text-status-danger',
}

function MiniChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((v, i) => (
        <div
          key={i}
          className="w-1.5 bg-brand-indigo/60 rounded-sm"
          style={{ height: `${Math.max(10, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  )
}

async function pingService(endpoint: string): Promise<number | null> {
  try {
    const start = performance.now()
    const res = await fetch(endpoint, { method: 'GET' })
    const ms = Math.round(performance.now() - start)
    return res.status < 500 ? ms : null
  } catch {
    return null
  }
}

export default function SystemHealthPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [services, setServices] = useState<Service[]>(
    SERVICE_DEFS.map(s => ({ ...s, status: 'operational', responseTime: null, history: [], checkedAt: '' }))
  )
  const [checking, setChecking] = useState(false)
  const [lastChecked, setLastChecked] = useState<string>('')

  const runChecks = useCallback(async () => {
    setChecking(true)
    const results = await Promise.all(
      SERVICE_DEFS.map(async (def) => {
        const ms = await pingService(def.endpoint)
        return { ...def, status: deriveStatus(ms), responseTime: ms, checkedAt: new Date().toISOString() }
      })
    )
    setServices(prev =>
      results.map((r, i) => ({
        ...r,
        history: [...(prev[i]?.history ?? []).slice(-11), r.responseTime ?? 0],
      }))
    )
    setLastChecked(new Date().toLocaleTimeString())
    setChecking(false)
  }, [])

  useEffect(() => { runChecks() }, [runChecks])

  const downCount = services.filter(s => s.status === 'down').length
  const degradedCount = services.filter(s => s.status === 'degraded').length
  const avgResponse = Math.round(
    services.filter(s => s.responseTime !== null).reduce((sum, s) => sum + (s.responseTime ?? 0), 0) /
    Math.max(1, services.filter(s => s.responseTime !== null).length)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">System Health</h1>
          <p className="text-sm text-text-secondary mt-1">Monitor platform services and status</p>
        </div>
        <div className="flex items-center gap-3">
          {lastChecked && <span className="text-xs text-text-muted">Last checked: {lastChecked}</span>}
          <Button variant="outline" size="sm" onClick={runChecks} disabled={checking}>
            <RefreshCw className={`w-4 h-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Checking…' : 'Check Now'}
          </Button>
          <span className="text-sm text-text-secondary">Maintenance Mode</span>
          <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
        </div>
      </div>

      {maintenanceMode && (
        <Card className="p-4 bg-status-warning/10 border-status-warning">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-status-warning" />
            <div>
              <p className="font-medium text-status-warning">Maintenance Mode Active</p>
              <p className="text-sm text-text-secondary">Only admins can access the platform</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => {
          const StatusIcon = statusIcons[service.status]
          return (
            <Card key={service.name} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-text-primary">{service.name}</h3>
                  <div className={`flex items-center gap-1 mt-1 ${statusColors[service.status]}`}>
                    <StatusIcon className="w-4 h-4" />
                    <span className="text-xs capitalize">{service.status}</span>
                  </div>
                </div>
                <Badge className={service.status === 'operational' ? 'badge-green' : service.status === 'degraded' ? 'badge-amber' : 'badge-red'}>
                  {service.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-text-muted">Response</p>
                  <p className="text-sm font-semibold text-text-primary">
                    {checking && service.responseTime === null ? '…' : service.responseTime !== null ? `${service.responseTime}ms` : 'N/A'}
                  </p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-text-muted">Trend</p>
                  <MiniChart data={service.history.length > 0 ? service.history : [0]} />
                </div>
              </div>
              <p className="text-xs text-text-muted">{service.endpoint}</p>
            </Card>
          )
        })}
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h3">Incident History</h2>
          <Badge variant="gray">Last 30 days</Badge>
        </div>
        <p className="text-sm text-text-muted text-center py-6">No incidents recorded in the last 30 days.</p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="text-h3 mb-4">Live Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className={`text-3xl font-bold ${downCount === 0 ? 'text-status-success' : 'text-status-danger'}`}>
                {services.length - downCount - degradedCount}/{services.length}
              </p>
              <p className="text-xs text-text-muted mt-1">Services Online</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className={`text-3xl font-bold ${downCount > 0 ? 'text-status-danger' : degradedCount > 0 ? 'text-status-warning' : 'text-status-success'}`}>
                {downCount + degradedCount}
              </p>
              <p className="text-xs text-text-muted mt-1">Issues Detected</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-text-primary">{checking ? '…' : `${avgResponse}ms`}</p>
              <p className="text-xs text-text-muted mt-1">Avg Response</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className={`text-3xl font-bold ${downCount === 0 ? 'text-status-success' : 'text-status-danger'}`}>
                {downCount}
              </p>
              <p className="text-xs text-text-muted mt-1">Down Services</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-h3 mb-4">System Resources</h2>
          <div className="space-y-4">
            {[
              { label: 'CPU Usage', value: 45, color: 'bg-brand-indigo' },
              { label: 'Memory', value: 62, color: 'bg-brand-cyan' },
              { label: 'Disk I/O', value: 28, color: 'bg-status-success' },
              { label: 'Network', value: 55, color: 'bg-status-warning' },
            ].map((resource) => (
              <div key={resource.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-text-secondary">{resource.label}</span>
                  <span className="text-sm font-medium text-text-primary">{resource.value}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${resource.color} rounded-full`} style={{ width: `${resource.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}