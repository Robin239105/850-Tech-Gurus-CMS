'use client'

import { useState } from 'react'
import {
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react'
import { cn, slugify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

const mockCategories = [
  { id: '1', name: 'Electronics', slug: 'electronics', parent: null, productCount: 24, children: [
    { id: '1-1', name: 'Audio', slug: 'audio', parent: '1', productCount: 8 },
    { id: '1-2', name: 'Video', slug: 'video', parent: '1', productCount: 12 },
    { id: '1-3', name: 'Accessories', slug: 'accessories', parent: '1', productCount: 4 },
  ]},
  { id: '2', name: 'Fitness', slug: 'fitness', parent: null, productCount: 18, children: [
    { id: '2-1', name: 'Equipment', slug: 'equipment', parent: '2', productCount: 10 },
    { id: '2-2', name: 'Apparel', slug: 'apparel', parent: '2', productCount: 5 },
    { id: '2-3', name: 'Supplements', slug: 'supplements', parent: '2', productCount: 3 },
  ]},
  { id: '3', name: 'Home & Garden', slug: 'home-garden', parent: null, productCount: 32, children: [] },
  { id: '4', name: 'Sports', slug: 'sports', parent: null, productCount: 15, children: [] },
  { id: '5', name: 'Clothing', slug: 'clothing', parent: null, productCount: 45, children: [
    { id: '5-1', name: 'Men', slug: 'men', parent: '5', productCount: 20 },
    { id: '5-2', name: 'Women', slug: 'women', parent: '5', productCount: 22 },
    { id: '5-3', name: 'Kids', slug: 'kids', parent: '5', productCount: 3 },
  ]},
]

interface Category {
  id: string
  name: string
  slug: string
  parent: string | null
  productCount: number
  children?: Category[]
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', slug: '', parent: '' })
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    parent: '',
    description: '',
  })
  const [expandedParents, setExpandedParents] = useState<string[]>(['1', '2', '5'])

  const allCategories = categories.flatMap(c => [c, ...(c.children || [])])

  const generateSlug = (name: string) => {
    const slug = slugify(name)
    setNewCategory({ ...newCategory, name, slug })
  }

  const handleAddCategory = () => {
    if (!newCategory.name) return
    const newCat: Category = {
      id: `${Date.now()}`,
      name: newCategory.name,
      slug: newCategory.slug || slugify(newCategory.name),
      parent: newCategory.parent || null,
      productCount: 0,
      children: [],
    }
    if (newCategory.parent) {
      setCategories(categories.map(c => {
        if (c.id === newCategory.parent) {
          return { ...c, children: [...(c.children || []), newCat] }
        }
        return c
      }))
    } else {
      setCategories([...categories, newCat])
    }
    setNewCategory({ name: '', slug: '', parent: '', description: '' })
  }

  const toggleExpand = (id: string) => {
    setExpandedParents(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditForm({ name: cat.name, slug: cat.slug, parent: cat.parent || '' })
  }

  const saveEdit = (id: string) => {
    setCategories(categories.map(c => {
      if (c.id === id) {
        return { ...c, name: editForm.name, slug: editForm.slug || slugify(editForm.name) }
      }
      if (c.children) {
        return {
          ...c,
          children: c.children.map(child => 
            child.id === id ? { ...child, name: editForm.name, slug: editForm.slug || slugify(editForm.name) } : child
          )
        }
      }
      return c
    }))
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: '', slug: '', parent: '' })
  }

  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)

  const deleteCategory = (id: string) => {
    setDeletingCategoryId(id)
  }

  const confirmDeleteCategory = () => {
    if (deletingCategoryId) {
      setCategories(categories.filter(c => c.id !== deletingCategoryId))
      setDeletingCategoryId(null)
    }
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Add new category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input 
                placeholder="Category name"
                className="mt-1.5"
                value={newCategory.name}
                onChange={(e) => generateSlug(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Slug</label>
              <Input 
                placeholder="category-slug"
                className="mt-1.5"
                value={newCategory.slug}
                onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Parent category</label>
              <select 
                className="mt-1.5 w-full h-10 px-3 rounded-md border border-card-border bg-white text-sm"
                value={newCategory.parent}
                onChange={(e) => setNewCategory({ ...newCategory, parent: e.target.value })}
              >
                <option value="">None</option>
                {allCategories.filter(c => !c.parent).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                placeholder="Category description"
                className="mt-1.5 h-20"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Image</label>
              <div className="mt-1.5 border-2 border-dashed border-card-border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-brand-indigo transition-colors">
                <ImageIcon className="w-6 h-6 text-text-muted mb-1" />
                <p className="text-xs text-text-muted">Click to upload</p>
              </div>
            </div>
            <Button className="w-full" onClick={handleAddCategory} disabled={!newCategory.name}>
              Add category
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-card-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-card-border">
                  <tr>
                    <th className="p-3 text-left w-8">
                      <Checkbox />
                    </th>
                    <th className="p-3 text-left text-sm font-medium text-text-secondary">Name</th>
                    <th className="p-3 text-left text-sm font-medium text-text-secondary">Slug</th>
                    <th className="p-3 text-left text-sm font-medium text-text-secondary">Parent</th>
                    <th className="p-3 text-left text-sm font-medium text-text-secondary">Count</th>
                    <th className="p-3 text-left text-sm font-medium text-text-secondary">Actions</th>
                  </tr>
                </thead>
                {categories.map(cat => (
                    <tbody key={cat.id}>
                      <tr className="border-b border-card-border hover:bg-gray-50">
                        <td className="p-3">
                          <Checkbox />
                        </td>
                        <td className="p-3">
                          {editingId === cat.id ? (
                            <Input 
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="h-8"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              {cat.children && cat.children.length > 0 && (
                                <button 
                                  onClick={() => toggleExpand(cat.id)}
                                  className="p-0.5 hover:bg-gray-100 rounded"
                                >
                                  {expandedParents.includes(cat.id) ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                              <span className="font-medium">{cat.name}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          {editingId === cat.id ? (
                            <Input 
                              value={editForm.slug}
                              onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                              className="h-8"
                            />
                          ) : (
                            <span className="text-sm text-text-secondary font-mono">{cat.slug}</span>
                          )}
                        </td>
                        <td className="p-3 text-sm text-text-muted">—</td>
                        <td className="p-3 text-sm">{cat.productCount}</td>
                        <td className="p-3">
                          {editingId === cat.id ? (
                            <div className="flex items-center gap-1">
                              <Button size="sm" onClick={() => saveEdit(cat.id)}>Save</Button>
                              <Button size="sm" variant="ghost" onClick={cancelEdit}>Cancel</Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <button onClick={() => startEdit(cat)} className="p-1.5 hover:bg-gray-100 rounded">
                                <Edit className="w-4 h-4 text-text-muted" />
                              </button>
                              <button onClick={() => deleteCategory(cat.id)} className="p-1.5 hover:bg-gray-100 rounded text-status-danger">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                      {expandedParents.includes(cat.id) && cat.children?.map(child => (
                        <tr key={`child-${child.id}`} className="border-b border-card-border bg-gray-50/50 hover:bg-gray-50">
                          <td className="p-3 pl-10">
                            <Checkbox />
                          </td>
                          <td className="p-3">
                            {editingId === child.id ? (
                              <Input 
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="h-8"
                              />
                            ) : (
                              <span className="text-sm">{child.name}</span>
                            )}
                          </td>
                          <td className="p-3">
                            {editingId === child.id ? (
                              <Input 
                                value={editForm.slug}
                                onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                                className="h-8"
                              />
                            ) : (
                              <span className="text-sm text-text-secondary font-mono">{child.slug}</span>
                            )}
                          </td>
                          <td className="p-3 text-sm text-text-muted">{cat.name}</td>
                          <td className="p-3 text-sm">{child.productCount}</td>
                          <td className="p-3">
                            {editingId === child.id ? (
                              <div className="flex items-center gap-1">
                                <Button size="sm" onClick={() => saveEdit(child.id)}>Save</Button>
                                <Button size="sm" variant="ghost" onClick={cancelEdit}>Cancel</Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button onClick={() => startEdit(child)} className="p-1.5 hover:bg-gray-100 rounded">
                                  <Edit className="w-4 h-4 text-text-muted" />
                                </button>
                                <button onClick={() => deleteCategory(child.id)} className="p-1.5 hover:bg-gray-100 rounded text-status-danger">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  ))}
                </table>

                {categories.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-text-muted">No categories yet</p>
                    <p className="text-sm text-text-muted">Add your first category to get started</p>
                  </div>
                )}
              </div>
          </CardContent>
        </Card>
      </div>

      {deletingCategoryId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[400px] p-6 animate-fade-in">
            <h3 className="text-lg font-semibold mb-2">Delete category?</h3>
            <p className="text-sm text-text-secondary mb-6">All products in this category will be uncategorised. This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeletingCategoryId(null)}>Cancel</Button>
              <Button variant="danger" onClick={confirmDeleteCategory}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}