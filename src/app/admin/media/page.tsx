'use client'

import { useState, useEffect, useCallback } from 'react'
import { Image as ImageIcon, Search, Loader2, Download, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatBytes, formatRelativeTime } from '@/lib/utils'

export default function AllMediaPage() {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/media')
      if (res.ok) setFiles(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">All Media</h1>
          <p className="text-sm text-text-secondary mt-1">Manage files uploaded across all client sites</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input placeholder="Search files..." className="pl-9" />
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-text-muted" /></div>
      ) : files.length === 0 ? (
        <Card className="p-12 text-center">
          <ImageIcon className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-muted">No media files found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {files.map((file) => (
            <Card key={file.id} className="overflow-hidden group">
              <div className="aspect-square bg-gray-100 relative">
                {file.file_type.startsWith('image/') ? (
                  <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-text-muted" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon-sm" variant="secondary"><Download className="w-4 h-4" /></Button>
                  <Button size="icon-sm" variant="danger"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs font-medium truncate" title={file.name}>{file.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-text-muted">{formatBytes(file.file_size)}</span>
                  <span className="text-[10px] text-text-muted">{file.client_name}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
