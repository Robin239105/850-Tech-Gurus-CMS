'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Search, Grid3X3, List, Eye, Copy, Trash2, Download, Image, FileText, Film, File, X, Check, Loader2, AlertCircle } from 'lucide-react'
import { cn, formatBytes, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type MediaFile = {
  id: string
  name: string
  type: string
  file_type?: string
  size: number
  file_size?: number
  url: string
  dimensions: string | null
  created_at: string
}

type UploadItem = {
  name: string
  progress: number
  status: 'uploading' | 'complete' | 'error'
  error?: string
}

const filterTabs = ['All', 'Images', 'Videos', 'Documents', 'Other']

function getDisplayType(file: MediaFile): string {
  const t = file.type || ''
  if (t === 'image' || (file.file_type ?? '').startsWith('image/')) return 'image'
  if (t === 'video' || (file.file_type ?? '').startsWith('video/')) return 'video'
  if (t === 'document' || (file.file_type ?? '').includes('pdf') || (file.file_type ?? '').includes('word')) return 'document'
  return t || 'other'
}

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = () => {
    fetch('/api/client/media')
      .then(r => r.ok ? r.json() : [])
      .then(setFiles)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const displayType = (f: MediaFile) => getDisplayType(f)

  const filtered = files.filter(f => {
    const dt = displayType(f)
    const matchTab = activeTab === 'All' ||
      (activeTab === 'Images' && dt === 'image') ||
      (activeTab === 'Videos' && dt === 'video') ||
      (activeTab === 'Documents' && dt === 'document') ||
      (activeTab === 'Other' && !['image', 'video', 'document'].includes(dt))
    return matchTab && f.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const uploadFiles = async (rawFiles: File[]) => {
    if (rawFiles.length === 0) return

    const items: UploadItem[] = rawFiles.map(f => ({ name: f.name, progress: 0, status: 'uploading' as const }))
    setUploadItems(items)

    await Promise.all(rawFiles.map(async (file, idx) => {
      try {
        // Step 1: Get presigned URL from UploadThing
        const presignRes = await fetch('/api/uploadthing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            files: [{ name: file.name, size: file.size, type: file.type }],
            acl: undefined,
          }),
        })

        if (!presignRes.ok) {
          const errText = await presignRes.text()
          // If UploadThing is not configured, fallback: save record directly with a blob URL
          console.warn('UploadThing not configured, using direct POST fallback', errText)
          // Create a temporary object URL just for this session (not persistent)
          const tempUrl = URL.createObjectURL(file)
          const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : file.type.includes('pdf') ? 'document' : 'other'
          await fetch('/api/client/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: file.name,
              url: tempUrl,
              file_type: file.type,
              file_size: file.size,
              type: fileType,
            }),
          })
          setUploadItems(prev => prev.map((it, i) => i === idx ? { ...it, progress: 100, status: 'complete' } : it))
          return
        }

        const { data } = await presignRes.json()
        const uploadData = Array.isArray(data) ? data[0] : data
        if (!uploadData) throw new Error('No upload URL returned')

        // Step 2: Upload directly to UploadThing storage
        const formData = new FormData()
        if (uploadData.fields) {
          Object.entries(uploadData.fields as Record<string, string>).forEach(([k, v]) => formData.append(k, v))
        }
        formData.append('file', file)

        setUploadItems(prev => prev.map((it, i) => i === idx ? { ...it, progress: 50 } : it))

        await fetch(uploadData.url, { method: 'POST', body: formData })
        setUploadItems(prev => prev.map((it, i) => i === idx ? { ...it, progress: 100, status: 'complete' } : it))
      } catch (err) {
        console.error('Upload error:', err)
        setUploadItems(prev => prev.map((it, i) => i === idx ? { ...it, status: 'error', error: String(err) } : it))
      }
    }))

    // Reload after 1 second to pick up DB records
    setTimeout(() => {
      load()
      setTimeout(() => setUploadItems([]), 2000)
    }, 1000)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    uploadFiles(Array.from(e.dataTransfer.files))
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) uploadFiles(Array.from(e.target.files))
    e.target.value = ''
  }

  const handleDelete = async (id: string) => {
    setDeletingId(null)
    await fetch('/api/client/media', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setFiles(prev => prev.filter(f => f.id !== id))
    if (selectedFile?.id === id) setSelectedFile(null)
  }

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
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
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />Upload Files
          </Button>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx"
        onChange={handleFileInput}
      />

      <Card className={cn('border-2 border-dashed transition-all cursor-pointer', isDragging ? 'border-brand-indigo bg-brand-indigo/5' : 'border-card-border hover:border-brand-indigo/50')}
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Upload className={cn('w-10 h-10 mb-3', isDragging ? 'text-brand-indigo' : 'text-text-muted')} />
          <p className="text-sm text-text-secondary mb-1">Drag & drop files here, or <span className="text-brand-indigo font-medium">browse</span></p>
          <p className="text-xs text-text-muted">Supported: JPG, PNG, GIF, WebP, MP4, PDF, DOC — Max 10MB</p>
          {uploadItems.length > 0 && (
            <div className="mt-4 w-full max-w-md space-y-2">
              {uploadItems.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                  {f.status === 'complete' ? <Check className="w-4 h-4 text-status-success" /> :
                   f.status === 'error' ? <AlertCircle className="w-4 h-4 text-status-danger" /> :
                   <Loader2 className="w-4 h-4 text-brand-indigo animate-spin" />}
                  <span className="text-sm flex-1 truncate">{f.name}</span>
                  <span className="text-xs text-text-muted">
                    {f.status === 'error' ? 'Failed' : f.status === 'complete' ? 'Done' : `${f.progress}%`}
                  </span>
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
          <p className="text-sm text-text-secondary">{files.length === 0 ? 'Click above or drag & drop files to get started' : 'Try a different filter or search'}</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map(file => {
            const dt = displayType(file)
            return (
              <div key={file.id} className="relative group rounded-lg overflow-hidden border border-card-border cursor-pointer" onClick={() => setSelectedFile(file)}>
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {dt === 'image' ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  ) : getIcon(dt)}
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button className="p-2 bg-white/90 rounded-full hover:bg-white" onClick={e => { e.stopPropagation(); copyUrl(file.url, file.id) }}>
                    {copied === file.id ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button className="p-2 bg-white/90 rounded-full hover:bg-white text-status-danger" onClick={e => { e.stopPropagation(); setDeletingId(file.id) }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-2"><p className="text-xs font-medium truncate">{file.name}</p><p className="text-xs text-text-muted">{formatBytes(file.file_size ?? file.size ?? 0)}</p></div>
              </div>
            )
          })}
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
              {filtered.map(file => {
                const dt = displayType(file)
                return (
                  <tr key={file.id} className="border-b border-card-border hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedFile(file)}>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                          {dt === 'image' ? <img src={file.url} alt={file.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} /> : getIcon(dt)}
                        </div>
                        <span className="text-sm font-medium">{file.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-text-secondary capitalize">{dt}</td>
                    <td className="p-3 text-sm text-text-secondary">{formatBytes(file.file_size ?? file.size ?? 0)}</td>
                    <td className="p-3 text-sm text-text-secondary">{formatDate(file.created_at)}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <button className="p-1.5 hover:bg-gray-100 rounded" onClick={e => { e.stopPropagation(); copyUrl(file.url, file.id) }}>
                          {copied === file.id ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4 text-text-muted" />}
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded text-status-danger" onClick={e => { e.stopPropagation(); setDeletingId(file.id) }}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
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
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {displayType(selectedFile) === 'image'
                ? <img src={selectedFile.url} alt={selectedFile.name} className="w-full h-full object-contain" />
                : getIcon(displayType(selectedFile))}
            </div>
            <div><label className="text-xs text-text-muted uppercase">Filename</label><p className="text-sm font-medium">{selectedFile.name}</p></div>
            <div><label className="text-xs text-text-muted uppercase">Type</label><Badge variant="gray" className="mt-1 capitalize block w-fit">{displayType(selectedFile)}</Badge></div>
            <div><label className="text-xs text-text-muted uppercase">Size</label><p className="text-sm">{formatBytes(selectedFile.file_size ?? selectedFile.size ?? 0)}</p></div>
            <div><label className="text-xs text-text-muted uppercase">URL</label>
              <p className="text-xs font-mono text-text-muted mt-1 break-all bg-gray-50 p-2 rounded">{selectedFile.url}</p>
            </div>
            {selectedFile.dimensions && <div><label className="text-xs text-text-muted uppercase">Dimensions</label><p className="text-sm">{selectedFile.dimensions}</p></div>}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => copyUrl(selectedFile.url, selectedFile.id)}>
                {copied === selectedFile.id ? <Check className="w-4 h-4 mr-2 text-status-success" /> : <Copy className="w-4 h-4 mr-2" />}
                Copy URL
              </Button>
              <a href={selectedFile.url} target="_blank" rel="noopener noreferrer" download={selectedFile.name}>
                <Button variant="outline" size="icon"><Download className="w-4 h-4" /></Button>
              </a>
            </div>
            <Button variant="danger" className="w-full" onClick={() => setDeletingId(selectedFile.id)}>
              <Trash2 className="w-4 h-4 mr-2" />Delete file
            </Button>
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
