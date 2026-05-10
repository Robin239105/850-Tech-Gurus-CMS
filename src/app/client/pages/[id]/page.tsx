'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Save, Loader2, Monitor, Tablet, Smartphone,
  MoreHorizontal, ChevronDown, ChevronRight, Plus, X, GripVertical,
  Image, Trash2, Settings, AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { cn, slugify } from '@/lib/utils'

type DeviceType = 'desktop' | 'tablet' | 'mobile'
type SectionType = 'hero' | 'about' | 'services' | 'gallery' | 'testimonials' | 'contact' | 'cta' | 'pricing' | 'video' | 'map' | 'custom-html'

interface ServiceItem {
  id: string
  icon: string
  title: string
  description: string
  link: string
}

interface TestimonialItem {
  id: string
  quote: string
  name: string
  role: string
  photo: string
}

interface PricingItem {
  id: string
  name: string
  price: string
  period: string
  features: string
  buttonText: string
  buttonUrl: string
  highlighted: boolean
}

export default function PageEditorPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id

  const [pageTitle, setPageTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [status, setStatus] = useState('draft')
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [device, setDevice] = useState<DeviceType>('desktop')
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [showPageSettings, setShowPageSettings] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [showUnsavedModal, setShowUnsavedModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    fetch('/api/client/pages')
      .then(r => r.ok ? r.json() : [])
      .then((pages: any[]) => {
        const page = pages.find((p: any) => p.id === id)
        if (page) {
          setPageTitle(page.title)
          setSlug(page.slug)
          setStatus(page.status)
          const content = typeof page.content === 'string' ? JSON.parse(page.content) : page.content
          setSections(Array.isArray(content?.sections) ? content.sections : [])
          setExpandedSections(Array.isArray(content?.sections) ? content.sections.map((s: any) => s.type) : [])
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  const save = async (overrideStatus?: string) => {
    setError('')
    setSaving(true)
    try {
      const res = await fetch('/api/client/pages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id, title: pageTitle, slug,
          status: overrideStatus ?? status,
          content: { sections },
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message ?? 'Failed to save'); return }
      setStatus(data.status)
      setHasUnsavedChanges(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    await fetch('/api/client/pages', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    router.push('/client/pages')
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen text-text-muted">Loading page…</div>

  const toggleSection = (type: string) => {
    setExpandedSections(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const getDeviceWidth = () => {
    switch (device) {
      case 'mobile': return 'w-[375px]'
      case 'tablet': return 'w-[768px]'
      default: return 'w-full'
    }
  }

  const renderEditorSection = (section: any) => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Heading</label>
              <Input defaultValue={section.heading} placeholder="Hero heading..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subheading</label>
              <Input defaultValue={section.subheading} placeholder="Hero subheading..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Button 1 Text</label>
                <Input defaultValue={section.button1Text} placeholder="Button text" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Button 1 URL</label>
                <Input defaultValue={section.button1Url} placeholder="/url" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Button 2 Text</label>
                <Input defaultValue={section.button2Text} placeholder="Button text" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Button 2 URL</label>
                <Input defaultValue={section.button2Url} placeholder="/url" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Background Image</label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Image className="w-4 h-4" />
                  Choose from media
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Background Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" defaultValue={section.backgroundColor} className="w-10 h-10 rounded border" />
                  <Input defaultValue={section.backgroundColor} className="flex-1" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Text Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" defaultValue={section.textColor} className="w-10 h-10 rounded border" />
                  <Input defaultValue={section.textColor} className="flex-1" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Text Alignment</label>
              <div className="flex gap-2">
                {['Left', 'Center', 'Right'].map(align => (
                  <Button
                    key={align}
                    size="sm"
                    variant={section.textAlign === align.toLowerCase() ? 'default' : 'outline'}
                  >
                    {align}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )

      case 'about':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Section Title</label>
              <Input defaultValue={section.title} placeholder="About title..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Body Text</label>
              <Textarea defaultValue={section.body} placeholder="About description..." className="min-h-[120px]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Image</label>
              <Button variant="outline" size="sm" className="gap-2">
                <Image className="w-4 h-4" />
                Choose image
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Image Position</label>
              <div className="flex gap-2">
                {['Left', 'Right', 'Full width'].map(pos => (
                  <Button
                    key={pos}
                    size="sm"
                    variant={section.imagePosition === pos.toLowerCase().replace(' ', '') ? 'default' : 'outline'}
                  >
                    {pos}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Image Alt Text</label>
              <Input defaultValue={section.imageAlt} placeholder="Image description..." />
            </div>
          </div>
        )

      case 'services':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Section Title</label>
              <Input defaultValue={section.title} placeholder="Services title..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Layout</label>
              <div className="flex gap-2">
                {['2col', '3col', '4col'].map(layout => (
                  <Button
                    key={layout}
                    size="sm"
                    variant={section.layout === layout ? 'default' : 'outline'}
                  >
                    {layout}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium">Service Items</label>
              {section.items.map((item: ServiceItem, idx: number) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <GripVertical className="w-4 h-4 text-text-muted cursor-grab" />
                    <span className="text-sm font-medium">Item {idx + 1}</span>
                    <button className="ml-auto text-status-danger hover:bg-red-50 p-1 rounded">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input defaultValue={item.icon} placeholder="Icon (emoji)" />
                    <Input defaultValue={item.title} placeholder="Title" />
                  </div>
                  <Textarea defaultValue={item.description} placeholder="Description" className="min-h-[60px]" />
                  <Input defaultValue={item.link} placeholder="Link URL" />
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add service item
              </Button>
            </div>
          </div>
        )

      case 'gallery':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Section Title</label>
              <Input placeholder="Gallery title..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Images</label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center text-text-muted">
                Drag images here or click to upload
              </div>
              <p className="text-xs text-text-muted">0 images selected</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Layout</label>
              <div className="flex gap-2">
                {['2col', '3col', '4col', 'Masonry'].map(layout => (
                  <Button key={layout} size="sm" variant="outline">{layout}</Button>
                ))}
              </div>
            </div>
          </div>
        )

      case 'testimonials':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Section Title</label>
              <Input placeholder="Testimonials title..." />
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <GripVertical className="w-4 h-4 text-text-muted cursor-grab" />
                  <span className="text-sm font-medium">Testimonial 1</span>
                  <button className="ml-auto text-status-danger hover:bg-red-50 p-1 rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <Textarea placeholder="Quote" className="min-h-[60px]" />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Name" />
                  <Input placeholder="Role/Company" />
                </div>
                <Button variant="outline" size="sm">Upload Photo</Button>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add testimonial
              </Button>
            </div>
          </div>
        )

      case 'contact':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Linked Form</label>
              <select className="w-full h-10 rounded-md border border-card-border bg-white px-3 py-2 text-sm">
                <option>Select a form...</option>
                <option>Contact Form</option>
                <option>Quote Request</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Section Title</label>
              <Input placeholder="Contact title..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Section Subtitle</label>
              <Input placeholder="Contact subtitle..." />
            </div>
          </div>
        )

      case 'cta':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Heading</label>
              <Input placeholder="CTA heading..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subheading</label>
              <Input placeholder="CTA subheading..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Button Text</label>
                <Input placeholder="Button text" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Button URL</label>
                <Input placeholder="/url" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Background Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" className="w-10 h-10 rounded border" />
                  <Input placeholder="#000000" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Text Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" className="w-10 h-10 rounded border" />
                  <Input placeholder="#ffffff" />
                </div>
              </div>
            </div>
          </div>
        )

      case 'pricing':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Section Title</label>
              <Input placeholder="Pricing title..." />
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <GripVertical className="w-4 h-4 text-text-muted cursor-grab" />
                  <span className="text-sm font-medium">Plan 1</span>
                  <button className="ml-auto text-status-danger hover:bg-red-50 p-1 rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Plan name" />
                  <Input placeholder="Price" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Billing period" />
                  <div className="flex items-center gap-2">
                    <Switch id="highlight" />
                    <label htmlFor="highlight" className="text-sm">Highlight</label>
                  </div>
                </div>
                <Textarea placeholder="Features (one per line)" className="min-h-[60px]" />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Button text" />
                  <Input placeholder="Button URL" />
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add plan
              </Button>
            </div>
          </div>
        )

      case 'video':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Section Title</label>
              <Input placeholder="Video title..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Video URL (YouTube/Vimeo)</label>
              <Input placeholder="https://youtube.com/..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Caption</label>
              <Input placeholder="Video caption..." />
            </div>
          </div>
        )

      case 'map':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Section Title</label>
              <Input placeholder="Location title..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Textarea placeholder="Full address..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Hours of Operation</label>
              <Textarea placeholder="Monday - Friday: 9AM - 5PM" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input placeholder="+1 (555) 000-0000" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input placeholder="hello@example.com" />
              </div>
            </div>
          </div>
        )

      case 'custom-html':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-700">Advanced — use with caution</span>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Code</label>
              <Textarea
                placeholder="<!-- Add your custom HTML here -->"
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          </div>
        )

      default:
        return <div className="text-text-muted">Section configuration</div>
    }
  }

  const sectionTypes: { type: SectionType; name: string; icon: string }[] = [
    { type: 'hero', name: 'Hero Section', icon: '🖼️' },
    { type: 'about', name: 'About / Text', icon: '📝' },
    { type: 'services', name: 'Services / Features', icon: '⚡' },
    { type: 'gallery', name: 'Gallery', icon: '🖼️' },
    { type: 'testimonials', name: 'Testimonials', icon: '💬' },
    { type: 'contact', name: 'Contact Form', icon: '📧' },
    { type: 'cta', name: 'Call to Action', icon: '🎯' },
    { type: 'pricing', name: 'Pricing', icon: '💰' },
    { type: 'video', name: 'Video', icon: '🎬' },
    { type: 'map', name: 'Map / Location', icon: '📍' },
    { type: 'custom-html', name: 'Custom HTML', icon: '📄' },
  ]

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/client/pages" className="flex items-center gap-2 text-text-secondary hover:text-text-primary">
            <ArrowLeft className="w-4 h-4" />
            Back to pages
          </Link>
          <h3 className="font-medium">Editing: {pageTitle}</h3>
        </div>

        <div className="flex items-center gap-3">
          {saved && <span className="text-green-600 text-sm">Saved ✓</span>}
          {error && <span className="text-red-500 text-sm">{error}</span>}
          <Badge variant={status === 'published' ? 'green' : status === 'draft' ? 'amber' : 'indigo'}>
            {hasUnsavedChanges ? (
              <><span className="w-2 h-2 rounded-full bg-brand-indigo mr-1.5 animate-pulse" /> Unsaved</>
            ) : status === 'published' ? 'Published' : 'Draft'}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => save('draft')} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save draft
          </Button>
          <Button size="sm" onClick={() => save('published')} disabled={saving}>Publish</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowPageSettings(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Page settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-status-danger" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                {confirmDelete ? 'Click again to confirm' : 'Delete page'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-[45%] bg-white border-r overflow-y-auto">
          <div className="p-4 space-y-4">
            {sections.map((section, idx) => (
              <div key={idx} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(section.type)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{sectionTypes.find(s => s.type === section.type)?.icon}</span>
                    <span className="font-medium">{sectionTypes.find(s => s.type === section.type)?.name}</span>
                  </div>
                  {expandedSections.includes(section.type) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                {expandedSections.includes(section.type) && (
                  <div className="p-4 border-t">
                    {renderEditorSection(section)}
                  </div>
                )}
              </div>
            ))}

            <Button variant="outline" className="w-full border-dashed py-8">
              <Plus className="w-4 h-4 mr-2" />
              Add section
            </Button>
          </div>
        </div>

        <div className="w-[55%] bg-[#F8FAFC] flex flex-col">
          <div className="p-4 border-b flex items-center justify-center gap-2 bg-white">
            <Button
              variant={device === 'desktop' ? 'default' : 'ghost'}
              size="icon-sm"
              onClick={() => setDevice('desktop')}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant={device === 'tablet' ? 'default' : 'ghost'}
              size="icon-sm"
              onClick={() => setDevice('tablet')}
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              variant={device === 'mobile' ? 'default' : 'ghost'}
              size="icon-sm"
              onClick={() => setDevice('mobile')}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-8 flex justify-center">
            <div className={cn('bg-white border rounded-lg shadow-lg transition-all', getDeviceWidth())}>
              <div className="min-h-[600px] p-8 flex items-center justify-center text-text-muted">
                Live preview will appear here
              </div>
            </div>
          </div>

          <div className="p-4 text-center">
            <p className="text-xs text-text-muted">Changes preview in real-time</p>
          </div>
        </div>
      </div>

      <Dialog open={showPageSettings} onOpenChange={setShowPageSettings}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Page Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Page Title</label>
              <Input value={pageTitle} onChange={(e) => { setPageTitle(e.target.value); setHasUnsavedChanges(true) }} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL Slug</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">OG Image</label>
              <Button variant="outline" size="sm" className="gap-2">
                <Image className="w-4 h-4" />
                Choose image
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Show in navigation</label>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Parent Page</label>
              <select className="w-full h-10 rounded-md border border-card-border bg-white px-3 py-2 text-sm">
                <option value="">None (top level)</option>
                <option value="about">About</option>
                <option value="services">Services</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPageSettings(false)}>Cancel</Button>
            <Button onClick={() => setShowPageSettings(false)}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {[
              { time: 'Today, 2:30 PM', type: 'Auto-save', current: true },
              { time: 'Today, 12:00 PM', type: 'Manual save', current: false },
              { time: 'Yesterday, 5:00 PM', type: 'Auto-save', current: false },
              { time: 'Yesterday, 10:00 AM', type: 'Manual save', current: false },
            ].map((version, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{version.time}</p>
                  <p className="text-xs text-text-muted">{version.type}</p>
                </div>
                {version.current ? (
                  <Badge variant="green">Current</Badge>
                ) : (
                  <Button variant="outline" size="sm">Restore</Button>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showUnsavedModal} onOpenChange={setShowUnsavedModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>You have unsaved changes</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-text-secondary">Your changes have not been saved. What would you like to do?</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowUnsavedModal(false)}>Cancel</Button>
            <Button variant="outline">Discard changes</Button>
            <Button>Save & leave</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}