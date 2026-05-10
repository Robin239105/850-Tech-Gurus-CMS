'use client'

import { useState, useEffect } from 'react'
import { Upload, Search, Grid3X3, List, Eye, Copy, Trash2, Download, Image, FileText, Film, File, X, Check, Loader2 } from 'lucide-react'
import { cn, formatBytes, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type MediaFile = {
  id: string
  name: string
  type: string
  size: number
  url: string
  dimensions: string | null
  created_at: string
}

const filterTabs = ['All', 'Images', 'Videos', 'Documents', 'Other']

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<{ name: string; progress: number; status: 'uploading' | 'complete' }[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = () => {
    fetch('/api/client/media')
      .then(r => r.ok ? r.json() : [])
      .then(setFiles)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filtered = files.filter(f => {
    const matchTab = activeTab === 'All' ||
      (activeTab === 'Images' && f.type === 'image') ||
      (activeTab === 'Videos' && f.type === 'video') ||
      (activeTab === 'Documents' && f.type === 'document') ||
      (activeTab === 'Other' && !['image','video','document'].includes(f.type))
    return matchTab && f.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    const newUploads = droppedFiles.map(f => ({ name: f.name, progress: 0, status: 'uploading' as const }))
    setUploadFiles(newUploads)
    newUploads.forEach((_, i) => {
      const interval = setInterval(() => {
        setUploadFiles(prev => {
          const updated = [...prev]
          if (updated[i] && updated[i].progress < 100) {
            updated[i] = { ...updated[i], progress: updated[i].progress + 10 }
            if (updated[i].progress >= 100) { updated[i] = { ...updated[i], status: 'complete' }; clearInterval(interval) }
          }
          return updated
        })
      }, 200)
    })
  }

  const handleDelete = async (id: string) => {
    await fetch('/api/client/media', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setFiles(prev => prev.filter(f => f.id !== id))
    if (selectedFile?.id === id) setSelectedFile(null)
    setDeletingId(null)
  }

  const getIcon = (type: string) => {
    if (type === 'image') return <Image className="w-8 h-8 text-brand-indigo" />
    if (type === 'video') return <Film className="w-8 h-8 text-purple-500" />
    if (type === 'document') return <FileText className="w-8 h-8 text-orange-500" />
    return <File className="w-8 h-8 text-gray-400" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1 bg-page-bg rounded-lg">
          {filterTabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn('px-4 py-2 text-sm font-medium rounded-md transition-all',
                activeTab === tab ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary')}>
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input placeholder="Search files…" className="w-64 pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex border border-card-border rounded-md">
            <button onClick={() => setViewMode('grid')} className={cn('p-2 transition-colors', viewMode === 'grid' ? 'bg-brand-indigo text-white' : 'text-text-secondary hover:bg-gray-50')}>
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={cn('p-2 transition-colors', viewMode === 'list' ? 'bg-brand-indigo text-white' : 'text-text-secondary hover:bg-gray-50')}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <Card className={cn('border-2 border-dashed transition-all', isDragging ? 'border-brand-indigo bg-brand-indigo/5' : '')}
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Upload className={cn('w-10 h-10 mb-3', isDragging ? 'text-brand-indigo' : 'text-text-muted')} />
          <p className="text-sm text-text-secondary mb-1">Drag & drop files here</p>
          <p className="text-xs text-text-muted">Supported: JPG, PNG, GIF, WebP, SVG, MP4, PDF, DOC — Max 10MB</p>
          {uploadFiles.length > 0 && (
            <div className="mt-4 w-full max-w-md space-y-2">
              {uploadFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                  {f.status === 'complete' ? <Check className="w-4 h-4 text-status-success" /> : <Loader2 className="w-4 h-4 text-brand-indigo animate-spin" />}
                  <span className="text-sm flex-1 truncate">{f.name}</span>
                  <span className="text-xs text-text-muted">{f.progress}%</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-center text-text-muted py-8">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Upload className="w-16 h-16 text-text-muted mb-4" />
          <h3 className="text-lg font-medium mb-2">{files.length === 0 ? 'No media files yet' : 'No files match this filter'}</h3>
          <p className="text-sm text-text-secondary">{files.length === 0 ? 'Drag & drop files above to get started' : 'Try a different filter or search'}</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map(file => (
            <div key={file.id} className="relative group rounded-lg overflow-hidden border border-card-border cursor-pointer" onClick={() => setSelectedFile(file)}>
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {file.type === 'image' ? <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" /> : getIcon(file.type)}
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button className="p-2 bg-white/90 rounded-full hover:bg-white" onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(file.url) }}>
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-2 bg-white/90 rounded-full hover:bg-white text-status-danger" onClick={e => { e.stopPropagation(); setDeletingId(file.id) }}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2"><p className="text-xs font-medium truncate">{file.name}</p><p className="text-xs text-text-muted">{formatBytes(file.size)}</p></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-card-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-card-border">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-text-secondary">File</th>
                <th className="p-3 text-left text-sm font-medium text-text-secondary">Type</th>
                <th className="p-3 text-left text-sm font-medium text-text-secondary">Size</th>
                <th className="p-3 text-left text-sm font-medium text-text-secondary">Date</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(file => (
                <tr key={file.id} className="border-b border-card-border hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedFile(file)}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                        {file.type === 'image' ? <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded" /> : getIcon(file.type)}
                      </div>
                      <span className="text-sm font-medium">{file.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-text-secondary capitalize">{file.type}</td>
                  <td className="p-3 text-sm text-text-secondary">{formatBytes(file.size)}</td>
                  <td className="p-3 text-sm text-text-secondary">{formatDate(file.created_at)}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 hover:bg-gray-100 rounded" onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(file.url) }}><Copy className="w-4 h-4 text-text-muted" /></button>
                      <button className="p-1.5 hover:bg-gray-100 rounded text-status-danger" onClick={e => { e.stopPropagation(); setDeletingId(file.id) }}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedFile && (
        <div className="fixed inset-y-0 right-0 w-[380px] bg-white shadow-modal border-l border-card-border z-50 overflow-y-auto">
          <div className="p-5 border-b flex items-center justify-between">
            <h3 className="font-semibold">File Details</h3>
            <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-5 space-y-4">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              {selectedFile.type === 'image' ? <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg" /> : getIcon(selectedFile.type)}
            </div>
            <div><label className="text-xs text-text-muted uppercase">Filename</label><p className="text-sm font-medium">{selectedFile.name}</p></div>
            <div><label className="text-xs text-text-muted uppercase">Type</label><Badge variant="gray" className="mt-1 capitalize block w-fit">{selectedFile.type}</Badge></div>
            <div><label className="text-xs text-text-muted uppercase">Size</label><p className="text-sm">{formatBytes(selectedFile.size)}</p></div>
            {selectedFile.dimensions && <div><label className="text-xs text-text-muted uppercase">Dimensions</label><p className="text-sm">{selectedFile.dimensions}</p></div>}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => navigator.clipboard.writeText(selectedFile.url)}><Copy className="w-4 h-4 mr-2" />Copy URL</Button>
            </div>
            <Button variant="danger" className="w-full" onClick={() => setDeletingId(selectedFile.id)}><Trash2 className="w-4 h-4 mr-2" />Delete file</Button>
          </div>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[400px] p-6">
            <h3 className="text-lg font-semibold mb-2">Delete file?</h3>
            <p className="text-sm text-text-secondary mb-6">This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => handleDelete(deletingId)}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
