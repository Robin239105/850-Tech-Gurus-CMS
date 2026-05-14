'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileText, Search, Loader2, Eye, Mail, X, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/utils'

type Submission = {
  id: string
  form_name: string
  client_name: string
  status: string
  page: string | null
  fields: string | Record<string, unknown>
  ip: string | null
  created_at: string
}

export default function AllFormsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Submission | null>(null)
  const [markingRead, setMarkingRead] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/forms')
      if (res.ok) setSubmissions(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = submissions.filter(s =>
    s.form_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.client_name?.toLowerCase().includes(search.toLowerCase())
  )

  const parsedFields = (sub: Submission): Record<string, unknown> => {
    if (typeof sub.fields === 'string') {
      try { return JSON.parse(sub.fields) } catch { return {} }
    }
    return sub.fields ?? {}
  }

  const markRead = async (sub: Submission) => {
    if (sub.status === 'read') return
    setMarkingRead(true)
    await fetch(`/api/admin/forms/${sub.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'read' }),
    }).catch(() => {})
    setSubmissions(prev => prev.map(s => s.id === sub.id ? { ...s, status: 'read' } : s))
    setSelected(prev => prev?.id === sub.id ? { ...prev, status: 'read' } : prev)
    setMarkingRead(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">All Form Submissions</h1>
          <p className="text-sm text-text-secondary mt-1">View leads generated across all client sites</p>
        </div>
        <Badge variant="gray">{submissions.filter(s => s.status === 'new').length} new</Badge>
      </div>

      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Search submissions..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Form Name</th>
                <th>Client</th>
                <th>Status</th>
                <th>Source Page</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-text-muted" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Mail className="w-12 h-12 text-text-muted mx-auto mb-4" />
                    <p className="text-text-muted">No submissions found</p>
                  </td>
                </tr>
              ) : filtered.map((sub) => (
                <tr
                  key={sub.id}
                  className={sub.status === 'new' ? 'bg-brand-indigo/5' : ''}
                >
                  <td className="font-medium">{sub.form_name}</td>
                  <td>{sub.client_name}</td>
                  <td>
                    <Badge variant={sub.status === 'new' ? 'default' : 'gray'}>
                      {sub.status}
                    </Badge>
                  </td>
                  <td className="text-xs font-mono text-text-secondary max-w-xs truncate">{sub.page ?? '—'}</td>
                  <td className="text-xs text-text-secondary">{formatRelativeTime(sub.created_at)}</td>
                  <td>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => { setSelected(sub); markRead(sub) }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail slide-out */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div
            className="w-full max-w-md bg-white h-full overflow-y-auto shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 border-b border-card-border flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-text-primary">{selected.form_name}</h3>
                <p className="text-xs text-text-muted mt-0.5">{selected.client_name}</p>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => setSelected(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-5 space-y-5">
              {/* Meta */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-text-muted">Status</p>
                  <Badge className="mt-1" variant={selected.status === 'new' ? 'default' : 'gray'}>{selected.status}</Badge>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-text-muted">Submitted</p>
                  <p className="text-sm font-medium mt-1">{formatRelativeTime(selected.created_at)}</p>
                </div>
                {selected.page && (
                  <div className="col-span-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-text-muted">Source page</p>
                    <a
                      href={selected.page}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-brand-indigo hover:underline break-all mt-1 block"
                    >
                      {selected.page}
                    </a>
                  </div>
                )}
                {selected.ip && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-text-muted">IP Address</p>
                    <p className="text-sm font-mono mt-1">{selected.ip}</p>
                  </div>
                )}
              </div>

              {/* Fields */}
              <div>
                <p className="text-sm font-semibold text-text-secondary mb-3">Form Fields</p>
                <div className="space-y-2">
                  {Object.entries(parsedFields(selected)).map(([key, val]) => (
                    <div key={key} className="p-3 border border-card-border rounded-lg">
                      <p className="text-xs text-text-muted capitalize">{key.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-text-primary mt-0.5 whitespace-pre-wrap">{String(val)}</p>
                    </div>
                  ))}
                  {Object.keys(parsedFields(selected)).length === 0 && (
                    <p className="text-sm text-text-muted italic">No field data recorded</p>
                  )}
                </div>
              </div>

              {selected.status === 'new' && (
                <Button
                  className="w-full gap-2"
                  variant="outline"
                  onClick={() => markRead(selected)}
                  disabled={markingRead}
                >
                  <CheckCircle className="w-4 h-4" />
                  {markingRead ? 'Marking…' : 'Mark as Read'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
