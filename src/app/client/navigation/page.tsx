'use client'

import { useState } from 'react'
import {
  Plus, GripVertical, Pencil, X, Link2, ExternalLink, Home, FileText,
  Settings, HelpCircle, MessageSquare, Layout, ChevronRight, ChevronDown
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface MenuItem {
  id: string
  label: string
  type: 'page' | 'custom' | 'external'
  url?: string
  openInNewTab?: boolean
  children?: MenuItem[]
  icon?: string
}

const pageOptions = [
  { value: '/', label: 'Home' },
  { value: '/about', label: 'About' },
  { value: '/services', label: 'Services' },
  { value: '/contact', label: 'Contact' },
  { value: '/blog', label: 'Blog' },
  { value: '/gallery', label: 'Gallery' },
]

const initialMenuItems: MenuItem[] = [
  { id: '1', label: 'Home', type: 'page', url: '/', icon: 'Home' },
  { id: '2', label: 'About', type: 'page', url: '/about', icon: 'FileText' },
  { 
    id: '3', 
    label: 'Services', 
    type: 'page', 
    url: '/services',
    icon: 'Layout',
    children: [
      { id: '3a', label: 'Web Design', type: 'page', url: '/services/web-design' },
      { id: '3b', label: 'Mobile Apps', type: 'page', url: '/services/mobile-apps' },
    ]
  },
  { id: '4', label: 'Contact', type: 'page', url: '/contact', icon: 'MessageSquare' },
]

export default function NavigationPage() {
  const [activeMenu, setActiveMenu] = useState('main')
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState<{ label: string; type: 'page' | 'custom' | 'external'; url: string; openInNewTab: boolean }>({ label: '', type: 'page', url: '', openInNewTab: false })
  const [editingItem, setEditingItem] = useState<string | null>(null)

  const addMenuItem = () => {
    if (!newItem.label) return
    const newMenuItem: MenuItem = {
      id: Date.now().toString(),
      label: newItem.label,
      type: newItem.type,
      url: newItem.type === 'page' ? `/${newItem.label.toLowerCase().replace(/\s+/g, '-')}` : newItem.url,
      openInNewTab: newItem.openInNewTab,
    }
    setMenuItems([...menuItems, newMenuItem])
    setNewItem({ label: '', type: 'page', url: '', openInNewTab: false })
    setShowAddForm(false)
  }

  const deleteItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id))
  }

  const renderMenuPreview = (items: MenuItem[]) => {
    return (
      <div className="flex items-center gap-1">
        {items.map(item => (
          <div key={item.id} className="relative group">
            <button className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
              {item.label}
            </button>
            {item.children && item.children.length > 0 && (
              <div className="absolute left-0 top-full mt-1 min-w-[180px] bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {item.children.map(child => (
                  <button key={child.id} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
                    {child.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderMenuEditor = (items: MenuItem[], depth = 0) => {
    return items.map(item => (
      <div key={item.id} className={cn('space-y-2', depth > 0 && 'ml-6 border-l-2 border-gray-200 pl-4')}>
        <div className="flex items-center gap-2 p-2 bg-white rounded-lg border hover:border-brand-indigo transition-colors group">
          <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
          <span className="text-sm">{item.icon || 'Link'}</span>
          <span className="flex-1 font-medium text-sm">{item.label}</span>
          {item.type === 'external' && item.openInNewTab && (
            <ExternalLink className="w-3 h-3 text-text-muted" />
          )}
          <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded">
            <Pencil className="w-3 h-3 text-text-muted" />
          </button>
          <button 
            onClick={() => deleteItem(item.id)}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded"
          >
            <X className="w-3 h-3 text-status-danger" />
          </button>
        </div>
        {item.children && item.children.length > 0 && renderMenuEditor(item.children, depth + 1)}
      </div>
    ))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Navigation Menus</h1>
        <p className="text-text-secondary mt-1">Manage your site's menus and navigation structure.</p>
      </div>

      <div className="flex items-center gap-2 border-b">
        {['Main Menu', 'Footer Menu'].map(menu => (
          <button
            key={menu}
            onClick={() => setActiveMenu(menu.toLowerCase().replace(' ', '-'))}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeMenu === menu.toLowerCase().replace(' ', '-')
                ? 'border-brand-indigo text-brand-indigo'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            )}
          >
            {menu}
          </button>
        ))}
        <button className="px-4 py-2 text-sm font-medium text-brand-indigo hover:bg-brand-indigo-light rounded">
          <Plus className="w-4 h-4 inline mr-1" />
          Create new menu
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Menu editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {renderMenuEditor(menuItems)}
            </div>

            {showAddForm && (
              <div className="p-4 bg-gray-50 rounded-lg border border-dashed space-y-3">
                <Input
                  value={newItem.label}
                  onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                  placeholder="Label"
                  className="font-medium"
                />
                <select
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value as 'page' | 'custom' | 'external' })}
                  className="w-full h-10 rounded-md border border-card-border bg-white px-3 py-2 text-sm"
                >
                  <option value="page">Page</option>
                  <option value="custom">Custom URL</option>
                  <option value="external">External link</option>
                </select>
                {newItem.type === 'page' && (
                  <select className="w-full h-10 rounded-md border border-card-border bg-white px-3 py-2 text-sm">
                    <option value="">Select a page...</option>
                    {pageOptions.map(page => (
                      <option key={page.value} value={page.value}>{page.label}</option>
                    ))}
                  </select>
                )}
                {(newItem.type === 'custom' || newItem.type === 'external') && (
                  <Input
                    value={newItem.url}
                    onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                    placeholder="URL"
                  />
                )}
                {newItem.type === 'external' && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={newItem.openInNewTab}
                      onCheckedChange={(checked) => setNewItem({ ...newItem, openInNewTab: checked as boolean })}
                      id="newtab"
                    />
                    <label htmlFor="newtab" className="text-sm">Open in new tab</label>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" onClick={addMenuItem}>Add item</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {!showAddForm && (
              <Button variant="outline" className="w-full border-dashed" onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add menu item
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Menu preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg border p-4 min-h-[200px]">
              <div className="border-b pb-3 mb-3">
                <div className="text-xs text-text-muted mb-2">Header</div>
                {renderMenuPreview(menuItems)}
              </div>
              <div className="py-8 text-center text-text-muted text-sm">
                Page content would appear here
              </div>
            </div>
            <p className="text-xs text-text-muted text-center">Changes preview in real-time</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}