'use client'

import { useState } from 'react'
import { Activity, AlertTriangle, CheckCircle, XCircle, AlertCircle, Pause } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { mockSystemServices } from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'

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

const incidents = [
  { id: 'inc_001', service: 'Email Service', status: 'resolved', severity: 'medium', start: '2026-05-10T07:30:00Z', end: '2026-05-10T09:15:00Z', description: 'Delayed email delivery due to high queue volume' },
  { id: 'inc_002', service: 'API Gateway', status: 'resolved', severity: 'low', start: '2026-05-08T14:00:00Z', end: '2026-05-08T14:30:00Z', description: 'Brief timeout issues during peak hours' },
]

function MiniChart({ data, color = 'bg-brand-indigo' }: { data: number[]; color?: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((value, index) => (
        <div
          key={index}
          className={`w-1.5 ${color} rounded-sm`}
          style={{ height: `${((value - min) / range) * 100}%` }}
        />
      ))}
    </div>
  )
}

export default function SystemHealthPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">System Health</h1>
          <p className="text-sm text-text-secondary mt-1">Monitor platform services and status</p>
        </div>
        <div className="flex items-center gap-3">
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
        {mockSystemServices.map((service) => {
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

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-text-muted">Uptime</p>
                  <p className="text-sm font-semibold text-text-primary">{service.uptime}%</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-text-muted">Response</p>
                  <p className="text-sm font-semibold text-text-primary">{service.responseTime}ms</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-text-muted">24h Trend</p>
                  <MiniChart data={service.sparkline} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h3">Incident History</h2>
          <Badge variant="gray">Last 30 days</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Status</th>
                <th>Severity</th>
                <th>Started</th>
                <th>Resolved</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr key={incident.id}>
                  <td className="font-medium text-text-primary">{incident.service}</td>
                  <td>
                    <Badge variant="green">Resolved</Badge>
                  </td>
                  <td>
                    <Badge className={incident.severity === 'medium' ? 'badge-amber' : 'badge-gray'}>
                      {incident.severity}
                    </Badge>
                  </td>
                  <td className="text-text-secondary text-xs">{formatDate(incident.start)}</td>
                  <td className="text-text-secondary text-xs">{formatDate(incident.end)}</td>
                  <td className="text-text-secondary">1h 45m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="text-h3 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-status-success">99.9%</p>
              <p className="text-xs text-text-muted mt-1">Overall Uptime</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-text-primary">2</p>
              <p className="text-xs text-text-muted mt-1">Active Incidents</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-text-primary">45ms</p>
              <p className="text-xs text-text-muted mt-1">Avg Response</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-status-success">0</p>
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