'use client'

import { useState } from 'react'
import {
  Upload,
  Search,
  Grid3X3,
  List,
  Eye,
  Copy,
  Trash2,
  Download,
  Image,
  FileText,
  Film,
  File,
  X,
  Check,
  Loader2,
} from 'lucide-react'
import { cn, formatBytes, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

const mockMedia = [
  { id: '1', name: 'hero-banner.jpg', type: 'image', size: 2456000, dimensions: '1920×1080', url: '/images/hero-banner.jpg', uploadedAt: '2026-05-08' },
  { id: '2', name: 'product-1.png', type: 'image', size: 845000, dimensions: '800×800', url: '/images/product-1.png', uploadedAt: '2026-05-07' },
  { id: '3', name: 'about-video.mp4', type: 'video', size: 45000000, dimensions: '1920×1080', url: '/videos/about-video.mp4', uploadedAt: '2026-05-06' },
  { id: '4', name: 'company-profile.pdf', type: 'document', size: 1250000, dimensions: null, url: '/docs/company-profile.pdf', uploadedAt: '2026-05-05' },
  { id: '5', name: 'logo.svg', type: 'image', size: 25000, dimensions: '512×512', url: '/images/logo.svg', uploadedAt: '2026-05-04' },
  { id: '6', name: 'team-photo.jpg', type: 'image', size: 3200000, dimensions: '3000×2000', url: '/images/team-photo.jpg', uploadedAt: '2026-05-03' },
  { id: '7', name: 'testimonial.mp3', type: 'audio', size: 5400000, dimensions: null, url: '/audio/testimonial.mp3', uploadedAt: '2026-05-02' },
  { id: '8', name: 'specs-sheet.docx', type: 'document', size: 156000, dimensions: null, url: '/docs/specs-sheet.docx', uploadedAt: '2026-05-01' },
  { id: '9', name: 'gallery-1.webp', type: 'image', size: 890000, dimensions: '1200×800', url: '/images/gallery-1.webp', uploadedAt: '2026-04-30' },
  { id: '10', name: 'icon-pack.zip', type: 'other', size: 15000000, dimensions: null, url: '/files/icon-pack.zip', uploadedAt: '2026-04-29' },
  { id: '11', name: 'promo-banner.png', type: 'image', size: 1200000, dimensions: '1200×628', url: '/images/promo-banner.png', uploadedAt: '2026-04-28' },
  { id: '12', name: 'documentation.html', type: 'other', size: 45000, dimensions: null, url: '/docs/documentation.html', uploadedAt: '2026-04-27' },
]

const filterTabs = ['All', 'Images', 'Videos', 'Documents', 'Other']

export default function MediaPage() {
  const [activeTab, setActiveTab] = useState('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<typeof mockMedia[0] | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<{ name: string; progress: number; status: 'uploading' | 'complete' }[]>([])

  const filteredMedia = mockMedia.filter(file => {
    const matchesTab = activeTab === 'All' || 
      (activeTab === 'Images' && file.type === 'image') ||
      (activeTab === 'Videos' && file.type === 'video') ||
      (activeTab === 'Documents' && file.type === 'document') ||
      (activeTab === 'Other' && file.type !== 'image' && file.type !== 'video' && file.type !== 'document')
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const handleFileSelect = (id: string) => {
    setSelectedFiles(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredMedia.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(filteredMedia.map(f => f.id))
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    const newFiles = files.map(f => ({ name: f.name, progress: 0, status: 'uploading' as const }))
    setUploadFiles(newFiles)
    newFiles.forEach((_, i) => {
      const interval = setInterval(() => {
        setUploadFiles(prev => {
          const updated = [...prev]
          if (updated[i].progress < 100) {
            updated[i].progress += 10
            if (updated[i].progress >= 100) {
              updated[i].status = 'complete'
              clearInterval(interval)
            }
          }
          return updated
        })
      }, 200)
    })
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-8 h-8 text-brand-indigo" />
      case 'video': return <Film className="w-8 h-8 text-purple-500" />
      case 'document': return <FileText className="w-8 h-8 text-orange-500" />
      default: return <File className="w-8 h-8 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1 bg-page-bg rounded-lg">
          {filterTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-all',
                activeTab === tab 
                  ? 'bg-white text-text-primary shadow-sm' 
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input 
              placeholder="Search files..." 
              className="w-64 pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select className="h-10 px-3 rounded-md border border-card-border bg-white text-sm">
            <option>Newest first</option>
            <option>Oldest first</option>
            <option>Name A-Z</option>
            <option>Name Z-A</option>
            <option>Size smallest</option>
            <option>Size largest</option>
          </select>
          <div className="flex border border-card-border rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'grid' ? 'bg-brand-indigo text-white' : 'text-text-secondary hover:bg-gray-50'
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'list' ? 'bg-brand-indigo text-white' : 'text-text-secondary hover:bg-gray-50'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button>
            <Upload className="w-4 h-4" />
            Upload files
          </Button>
        </div>
      </div>

      <Card 
        className={cn(
          'border-2 border-dashed transition-all',
          isDragging ? 'border-brand-indigo bg-brand-indigo/5' : 'border-dashed'
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Upload className={cn('w-10 h-10 mb-3', isDragging ? 'text-brand-indigo' : 'text-text-muted')} />
          <p className="text-sm text-text-secondary mb-1">Drag & drop files here or click to browse</p>
          <p className="text-xs text-text-muted">Supported: JPG, PNG, GIF, WebP, SVG, MP4, PDF, DOC, Max 10MB</p>
          {uploadFiles.length > 0 && (
            <div className="mt-4 w-full max-w-md space-y-2">
              {uploadFiles.map((file, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                  {file.status === 'complete' ? (
                    <Check className="w-4 h-4 text-status-success" />
                  ) : (
                    <Loader2 className="w-4 h-4 text-brand-indigo animate-spin" />
                  )}
                  <span className="text-sm flex-1 truncate">{file.name}</span>
                  <span className="text-xs text-text-muted">{file.progress}%</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedFiles.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-brand-indigo-light rounded-lg">
          <span className="text-sm font-medium text-brand-indigo">{selectedFiles.length} selected</span>
          <Button variant="outline" size="sm" className="ml-auto">
            <Download className="w-4 h-4 mr-1" />
            Download all
          </Button>
          <Button variant="danger" size="sm">
            <Trash2 className="w-4 h-4 mr-1" />
            Delete selected
          </Button>
        </div>
      )}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredMedia.map(file => (
            <div 
              key={file.id}
              className={cn(
                'relative group rounded-lg overflow-hidden border border-card-border cursor-pointer',
                selectedFiles.includes(file.id) && 'ring-2 ring-brand-indigo'
              )}
              onClick={() => setSelectedFile(file)}
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {file.type === 'image' ? (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                ) : (
                  getFileIcon(file.type)
                )}
              </div>
              <div className="absolute top-2 left-2">
                <Checkbox 
                  checked={selectedFiles.includes(file.id)}
                  onChange={() => handleFileSelect(file.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white/90 border-gray-300"
                />
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button className="p-2 bg-white/90 rounded-full hover:bg-white">
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  className="p-2 bg-white/90 rounded-full hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigator.clipboard.writeText(file.url)
                  }}
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button 
                  className="p-2 bg-white/90 rounded-full hover:bg-white text-status-danger"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2">
                <p className="text-xs font-medium truncate">{file.name}</p>
                <p className="text-xs text-text-muted">{formatBytes(file.size)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-card-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-card-border">
              <tr>
                <th className="p-3 text-left">
                  <Checkbox 
                    checked={selectedFiles.length === filteredMedia.length && filteredMedia.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="p-3 text-left text-sm font-medium text-text-secondary">File</th>
                <th className="p-3 text-left text-sm font-medium text-text-secondary">Type</th>
                <th className="p-3 text-left text-sm font-medium text-text-secondary">Size</th>
                <th className="p-3 text-left text-sm font-medium text-text-secondary">Dimensions</th>
                <th className="p-3 text-left text-sm font-medium text-text-secondary">Date</th>
                <th className="p-3 text-left text-sm font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedia.map(file => (
                <tr 
                  key={file.id} 
                  className="border-b border-card-border hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedFile(file)}
                >
                  <td className="p-3">
                    <Checkbox 
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => handleFileSelect(file.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                        {file.type === 'image' ? (
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-md" />
                        ) : (
                          getFileIcon(file.type)
                        )}
                      </div>
                      <span className="text-sm font-medium">{file.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-text-secondary capitalize">{file.type}</td>
                  <td className="p-3 text-sm text-text-secondary">{formatBytes(file.size)}</td>
                  <td className="p-3 text-sm text-text-secondary">{file.dimensions || '-'}</td>
                  <td className="p-3 text-sm text-text-secondary">{formatDate(file.uploadedAt)}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 hover:bg-gray-100 rounded">
                        <Eye className="w-4 h-4 text-text-muted" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded">
                        <Copy className="w-4 h-4 text-text-muted" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded text-status-danger">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredMedia.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <Upload className="w-16 h-16 text-text-muted mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No media files yet</h3>
          <p className="text-sm text-text-secondary mb-4">Upload files to get started</p>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Upload files
          </Button>
        </div>
      )}

      {selectedFile && (
        <div className="fixed inset-y-0 right-0 w-[400px] bg-white shadow-modal border-l border-card-border z-50 animate-slide-in overflow-y-auto">
          <div className="p-5 border-b border-card-border flex items-center justify-between">
            <h3 className="font-semibold">File Details</h3>
            <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              {selectedFile.type === 'image' ? (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg" />
              ) : (
                getFileIcon(selectedFile.type)
              )}
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase">Filename</label>
              <p className="text-sm font-medium">{selectedFile.name}</p>
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase">File type</label>
              <Badge variant="gray" className="mt-1 capitalize">{selectedFile.type}</Badge>
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase">Size</label>
              <p className="text-sm">{formatBytes(selectedFile.size)}</p>
            </div>
            {selectedFile.dimensions && (
              <div>
                <label className="text-xs text-text-muted uppercase">Dimensions</label>
                <p className="text-sm">{selectedFile.dimensions}px</p>
              </div>
            )}
            <div>
              <label className="text-xs text-text-muted uppercase">Alt text</label>
              <Input placeholder="Describe this image..." className="mt-1" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => navigator.clipboard.writeText(selectedFile.url)}>
                <Copy className="w-4 h-4 mr-2" />
                Copy URL
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
            <Button variant="danger" className="w-full">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete file
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
