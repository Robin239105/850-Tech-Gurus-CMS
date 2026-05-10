'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileText, Search, Loader2, Edit, ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/utils'

export default function AllPagesPage() {
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/pages')
      if (res.ok) setPages(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">All Pages & Posts</h1>
          <p className="text-sm text-text-secondary mt-1">Manage content across all client websites</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input placeholder="Search content..." className="pl-9" />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Client</th>
                <th>Author</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-text-muted" /></td></tr>
              ) : pages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <FileText className="w-12 h-12 text-text-muted mx-auto mb-4" />
                    <p className="text-text-muted">No pages or posts found</p>
                  </td>
                </tr>
              ) : pages.map((page) => (
                <tr key={page.id}>
                  <td>
                    <p className="text-sm font-medium">{page.title}</p>
                    <p className="text-xs text-text-muted">/{page.slug}</p>
                  </td>
                  <td>{page.client_name}</td>
                  <td>{page.author}</td>
                  <td>
                    <Badge variant={page.published ? 'default' : 'gray'}>
                      {page.published ? 'Published' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="text-xs text-text-secondary">{formatRelativeTime(page.created_at)}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon-sm"><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon-sm"><ExternalLink className="w-4 h-4" /></Button>
                    </div>
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
