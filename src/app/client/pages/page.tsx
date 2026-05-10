'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  FileText, Plus, Search, Edit, Eye, Copy, MoreHorizontal,
  Trash2, ChevronDown, ChevronRight, ChevronLeft, GripVertical, Home, Archive,
  FileWarning, LayoutDashboard, Layout, Pencil, Image, Menu,
  Package, Tag, ShoppingCart, Users, TicketPercent, FileInput,
  Calendar as CalIcon, Inbox, Settings, Search as SearchIcon, User, HelpCircle,
  Bell, ExternalLink, Eye as EyeIcon, LogOut, ChevronUp, ArrowLeft,
  Monitor, Tablet, Smartphone, Undo, Redo, SlidersHorizontal,
  History, Save, Globe, Check, X, AlertTriangle, Code, Star,
  DollarSign, Package2, Truck, Weight, Layers, CopyIcon, Trash, PlusCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  DialogClose
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  Tabs, TabsList, TabsTrigger, TabsContent
} from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

const pages = [
  { id: '1', title: 'Home', slug: '/', status: 'published', lastEdited: '2 hours ago', editor: 'John Smith' },
  { id: '2', title: 'About Us', slug: '/about', status: 'published', lastEdited: '1 day ago', editor: 'John Smith' },
  { id: '3', title: 'Services', slug: '/services', status: 'published', lastEdited: '3 days ago', editor: 'Jane Doe' },
  { id: '4', title: 'Contact', slug: '/contact', status: 'draft', lastEdited: '5 days ago', editor: 'John Smith' },
  { id: '5', title: 'Our Menu', slug: '/menu', status: 'published', lastEdited: '1 week ago', editor: 'Jane Doe' },
  { id: '6', title: 'Gallery', slug: '/gallery', status: 'published', lastEdited: '2 weeks ago', editor: 'John Smith' },
]

const filterTabs = ['All', 'Published', 'Draft', 'Archived'] as const
type FilterTab = typeof filterTabs[number]

export default function PagesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [pageToDelete, setPageToDelete] = useState<string | null>(null)

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = activeFilter === 'All' ||
      (activeFilter === 'Published' && page.status === 'published') ||
      (activeFilter === 'Draft' && page.status === 'draft') ||
      (activeFilter === 'Archived' && page.status === 'archived')
    return matchesSearch && matchesFilter
  })

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPages.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredPages.map(p => p.id))
    }
  }

  const confirmDelete = (id: string) => {
    setPageToDelete(id)
    setDeleteModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pages</h1>
          <p className="text-text-secondary mt-1">Manage your website pages and content</p>
        </div>
        <Link href="/client/pages/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add new page
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Tabs defaultValue="All" onValueChange={(v) => setActiveFilter(v as FilterTab)}>
          <TabsList>
            {filterTabs.map(tab => (
              <TabsTrigger key={tab} value={tab}>
                {tab} {tab === 'All' ? `(${pages.length})` : tab === 'Published' ? `(${pages.filter(p => p.status === 'published').length})` : tab === 'Draft' ? `(${pages.filter(p => p.status === 'draft').length})` : '(0)'}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10"
            />
          </div>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-brand-indigo-light rounded-lg">
          <span className="text-sm font-medium text-brand-indigo">{selectedIds.length} selected</span>
          <Button size="sm" variant="outline">Publish all</Button>
          <Button size="sm" variant="outline">Archive all</Button>
          <Button size="sm" variant="danger" onClick={() => setSelectedIds([])} className="ml-auto">
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === filteredPages.length && filteredPages.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="w-10"></TableHead>
              <TableHead>Page title</TableHead>
              <TableHead>URL slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last edited</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPages.map((page) => (
              <TableRow key={page.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(page.id)}
                    onCheckedChange={() => toggleSelect(page.id)}
                  />
                </TableCell>
                <TableCell>
                  <GripVertical className="w-4 h-4 text-text-muted cursor-grab" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{page.title}</span>
                    {page.slug === '/' && (
                      <Home className="w-3.5 h-3.5 text-text-muted" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs text-text-muted font-mono">{page.slug}</code>
                </TableCell>
                <TableCell>
                  <Badge variant={page.status === 'published' ? 'green' : 'gray'}>
                    {page.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-text-muted text-xs">{page.lastEdited}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Link href={`/client/pages/${page.id}`}>
                      <Button variant="ghost" size="icon-sm" title="Edit">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon-sm" title="Preview">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" title="Copy link" onClick={() => navigator.clipboard.writeText(page.slug)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        {page.slug !== '/' && (
                          <DropdownMenuItem>
                            <Home className="w-4 h-4 mr-2" />
                            Set as Homepage
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-status-danger" onClick={() => confirmDelete(page.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="px-4 py-3 border-t border-card-border flex items-center justify-between">
          <p className="text-xs text-text-secondary">Showing 1–{filteredPages.length} of {filteredPages.length} pages</p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon-sm" disabled>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="default" size="icon-sm">1</Button>
            <Button variant="outline" size="icon-sm" disabled>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-status-danger" />
            </div>
            <DialogTitle className="text-center">Delete "{pages.find(p => p.id === pageToDelete)?.title}"?</DialogTitle>
            <DialogDescription className="text-center">
              This action cannot be undone. This page will be permanently removed from your website.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => { setDeleteModalOpen(false); setPageToDelete(null); }}>
              <Trash2 className="w-4 h-4 mr-1" />
              Delete page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
