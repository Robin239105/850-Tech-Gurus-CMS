'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileText, Search, Loader2, Eye, Mail } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/utils'

export default function AllFormsPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">All Form Submissions</h1>
          <p className="text-sm text-text-secondary mt-1">View leads generated across all client sites</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input placeholder="Search submissions..." className="pl-9" />
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
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Mail className="w-12 h-12 text-text-muted mx-auto mb-4" />
                    <p className="text-text-muted">No submissions found</p>
                  </td>
                </tr>
              ) : submissions.map((sub) => (
                <tr key={sub.id}>
                  <td className="font-medium">{sub.form_name}</td>
                  <td>{sub.client_name}</td>
                  <td>
                    <Badge variant={sub.status === 'new' ? 'default' : 'gray'}>
                      {sub.status}
                    </Badge>
                  </td>
                  <td className="text-xs font-mono text-text-secondary">{sub.page}</td>
                  <td className="text-xs text-text-secondary">{formatRelativeTime(sub.created_at)}</td>
                  <td>
                    <Button variant="ghost" size="icon-sm"><Eye className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
