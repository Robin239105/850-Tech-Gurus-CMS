'use client'

import React, { useState, useEffect } from 'react'
import { Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { slugify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  description: string | null
  children?: Category[]
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', slug: '' })
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', parent_id: '', description: '' })
  const [expandedParents, setExpandedParents] = useState<string[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    fetch('/api/client/categories')
      .then(r => r.ok ? r.json() : [])
      .then((rows: Category[]) => {
        const parents = rows.filter(c => !c.parent_id)
        const nested = parents.map(p => ({ ...p, children: rows.filter(c => c.parent_id === p.id) }))
        setCategories(nested)
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const topLevel = categories.filter(c => !c.parent_id)

  const handleAdd = async () => {
    if (!newCategory.name) return
    setSaving(true)
    await fetch('/api/client/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newCategory.name,
        slug: newCategory.slug || slugify(newCategory.name),
        parent_id: newCategory.parent_id || null,
        description: newCategory.description || null,
      }),
    })
    setNewCategory({ name: '', slug: '', parent_id: '', description: '' })
    setSaving(false)
    load()
  }

  const handleSaveEdit = async (id: string) => {
    await fetch('/api/client/categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name: editForm.name, slug: editForm.slug }),
    })
    setEditingId(null)
    load()
  }

  const confirmDelete = async () => {
    if (!deletingId) return
    await fetch('/api/client/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deletingId }),
    })
    setDeletingId(null)
    load()
  }

  const toggleExpand = (id: string) =>
    setExpandedParents(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])

  const renderRow = (cat: Category, isChild = false): React.ReactElement => (
    <>
      <tr key={cat.id} className="border-b border-card-border hover:bg-gray-50">
        <td className={`p-3 ${isChild ? 'pl-10' : ''}`}>
          {editingId === cat.id ? (
            <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="h-8" />
          ) : (
            <div className="flex items-center gap-2">
              {!isChild && (cat.children?.length ?? 0) > 0 && (
                <button onClick={() => toggleExpand(cat.id)} className="p-0.5 hover:bg-gray-100 rounded">
                  {expandedParents.includes(cat.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              )}
              <span className={isChild ? 'text-sm' : 'font-medium'}>{cat.name}</span>
            </div>
          )}
        </td>
        <td className="p-3">
          {editingId === cat.id ? (
            <Input value={editForm.slug} onChange={e => setEditForm({ ...editForm, slug: e.target.value })} className="h-8" />
          ) : (
            <span className="text-sm text-text-secondary font-mono">{cat.slug}</span>
          )}
        </td>
        <td className="p-3 text-sm text-text-muted">{isChild ? categories.find(c => c.id === cat.parent_id)?.name ?? '—' : '—'}</td>
        <td className="p-3">
          {editingId === cat.id ? (
            <div className="flex gap-1">
              <Button size="sm" onClick={() => handleSaveEdit(cat.id)}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
            </div>
          ) : (
            <div className="flex gap-1">
              <button onClick={() => { setEditingId(cat.id); setEditForm({ name: cat.name, slug: cat.slug }) }} className="p-1.5 hover:bg-gray-100 rounded">
                <Edit className="w-4 h-4 text-text-muted" />
              </button>
              <button onClick={() => setDeletingId(cat.id)} className="p-1.5 hover:bg-gray-100 rounded text-status-danger">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </td>
      </tr>
      {!isChild && expandedParents.includes(cat.id) && (cat.children ?? []).map(child => <>{renderRow(child, true)}</>)}
    </>
  )

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-1">
        <Card>
          <CardHeader><CardTitle>Add new category</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input placeholder="Category name" className="mt-1.5" value={newCategory.name}
                onChange={e => setNewCategory({ ...newCategory, name: e.target.value, slug: slugify(e.target.value) })} />
            </div>
            <div>
              <label className="text-sm font-medium">Slug</label>
              <Input placeholder="category-slug" className="mt-1.5" value={newCategory.slug}
                onChange={e => setNewCategory({ ...newCategory, slug: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Parent category</label>
              <select className="mt-1.5 w-full h-10 px-3 rounded-md border border-card-border bg-white text-sm"
                value={newCategory.parent_id} onChange={e => setNewCategory({ ...newCategory, parent_id: e.target.value })}>
                <option value="">None (top level)</option>
                {categories.filter(c => !c.parent_id).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea placeholder="Category description" className="mt-1.5 h-20" value={newCategory.description}
                onChange={e => setNewCategory({ ...newCategory, description: e.target.value })} />
            </div>
            <Button className="w-full" onClick={handleAdd} disabled={!newCategory.name || saving}>
              {saving ? 'Adding…' : 'Add category'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-2">
        <Card>
          <CardHeader><CardTitle>Categories</CardTitle></CardHeader>
          <CardContent>
            <div className="border border-card-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-card-border">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium text-text-secondary">Name</th>
                    <th className="p-3 text-left text-sm font-medium text-text-secondary">Slug</th>
                    <th className="p-3 text-left text-sm font-medium text-text-secondary">Parent</th>
                    <th className="p-3 text-left text-sm font-medium text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} className="p-8 text-center text-text-muted">Loading…</td></tr>
                  ) : categories.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-text-muted">No categories yet. Add your first category to get started.</td></tr>
                  ) : categories.map(cat => renderRow(cat))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {deletingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[400px] p-6">
            <h3 className="text-lg font-semibold mb-2">Delete category?</h3>
            <p className="text-sm text-text-secondary mb-6">All products in this category will be uncategorised. This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
              <Button variant="danger" onClick={confirmDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
