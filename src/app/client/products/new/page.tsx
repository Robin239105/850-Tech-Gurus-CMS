'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronRight,
  Upload,
  Plus,
  X,
  Save,
  Send,
  Loader2,
} from 'lucide-react'
import { cn, slugify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

const categories = ['Electronics', 'Fitness', 'Food & Beverage', 'Accessories', 'Sports', 'Clothing', 'Home & Garden']
const shippingClasses = ['Standard', 'Express', 'Pickup only', 'Digital']

export default function NewProductPage() {
  const router = useRouter()
  const [productType, setProductType] = useState<'simple' | 'variable'>('simple')
  const [attributes, setAttributes] = useState<{ name: string; values: string[] }[]>([])
  const [trackInventory, setTrackInventory] = useState(true)
  const [allowBackorders, setAllowBackorders] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [sku, setSku] = useState('')
  const [stock, setStock] = useState('0')
  const [lowStockThreshold, setLowStockThreshold] = useState('5')
  const [status, setStatus] = useState('draft')

  const save = async (overrideStatus?: string) => {
    if (!name.trim()) { setError('Product name is required'); return }
    setError('')
    setSaving(true)
    try {
      const res = await fetch('/api/client/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, sku: sku || null,
          description: description || null,
          category: category || null,
          price: parseFloat(price) || 0,
          sale_price: salePrice ? parseFloat(salePrice) : null,
          stock: parseInt(stock) || 0,
          low_stock_threshold: parseInt(lowStockThreshold) || 5,
          status: overrideStatus ?? status,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message ?? 'Failed to save'); return }
      router.push(`/client/products/${data.id}`)
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  const addAttribute = () => {
    setAttributes([...attributes, { name: '', values: [] }])
  }

  const updateAttribute = (index: number, field: 'name' | 'values', value: string | string[]) => {
    const updated = [...attributes]
    if (field === 'values' && typeof value === 'string') {
      updated[index].values = value.split(',').map(v => v.trim())
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }
    setAttributes(updated)
  }

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index))
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <Link href="/client/products" className="hover:text-text-primary">Products</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-text-primary">Add new product</span>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-md">{error}</div>}

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Product name *</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Enter product name" className="mt-1.5" />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your product..." className="mt-1.5 h-32" />
              </div>
              <div>
                <label className="text-sm font-medium">Short description</label>
                <Textarea value={shortDescription} onChange={e => setShortDescription(e.target.value)} placeholder="Brief summary for product cards" className="mt-1.5 h-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Primary image</label>
                <div className="mt-1.5 border-2 border-dashed border-card-border rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-brand-indigo transition-colors">
                  <Upload className="w-8 h-8 text-text-muted mb-2" />
                  <p className="text-sm text-text-secondary">Click to upload or drag and drop</p>
                  <p className="text-xs text-text-muted mt-1">SVG, PNG, JPG or GIF (max. 10MB)</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Additional images</label>
                <div className="mt-1.5 grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                    <div key={i} className="aspect-square border border-dashed border-card-border rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50">
                      <Plus className="w-5 h-5 text-text-muted" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Regular price *</label>
                  <div className="mt-1.5 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">$</span>
                    <Input value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className="pl-7" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Sale price</label>
                  <div className="mt-1.5 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">$</span>
                    <Input value={salePrice} onChange={e => setSalePrice(e.target.value)} placeholder="0.00" className="pl-7" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="date" className="px-3 py-2 rounded-md border border-card-border text-sm" />
                <span className="text-text-muted">to</span>
                <input type="date" className="px-3 py-2 rounded-md border border-card-border text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium">Cost per item</label>
                <p className="text-xs text-text-muted mb-1.5">Internal use only</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">$</span>
                  <Input placeholder="0.00" className="pl-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">SKU</label>
                  <div className="mt-1.5 flex gap-2">
                    <Input value={sku} onChange={e => setSku(e.target.value)} placeholder="Enter SKU" />
                    <Button variant="outline" onClick={() => setSku(`SKU-${slugify(name)}-${Date.now().toString(36).slice(-4).toUpperCase()}`)}>Auto-generate</Button>
                  </div>
                </div>
                <div className="flex items-center pt-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={trackInventory} onCheckedChange={setTrackInventory} />
                    <span className="text-sm">Track inventory</span>
                  </div>
                </div>
              </div>
              {trackInventory && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Stock quantity</label>
                      <Input type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="0" className="mt-1.5" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Low stock threshold</label>
                      <Input type="number" value={lowStockThreshold} onChange={e => setLowStockThreshold(e.target.value)} placeholder="5" className="mt-1.5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={allowBackorders} onCheckedChange={setAllowBackorders} />
                    <span className="text-sm">Allow backorders</span>
                  </div>
                </>
              )}
              <div>
                <label className="text-sm font-medium">Stock status</label>
                <select className="mt-1.5 w-full h-10 px-3 rounded-md border border-card-border bg-white text-sm">
                  <option>In stock</option>
                  <option>Out of stock</option>
                  <option>On backorder</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Weight</label>
                  <Input type="number" placeholder="0" className="mt-1.5" />
                </div>
                <div>
                  <label className="text-sm font-medium">Unit</label>
                  <select className="mt-1.5 w-full h-10 px-3 rounded-md border border-card-border bg-white text-sm">
                    <option>kg</option>
                    <option>g</option>
                    <option>lb</option>
                    <option>oz</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Length</label>
                  <Input type="number" placeholder="0" className="mt-1.5" />
                </div>
                <div>
                  <label className="text-sm font-medium">Width</label>
                  <Input type="number" placeholder="0" className="mt-1.5" />
                </div>
                <div>
                  <label className="text-sm font-medium">Height</label>
                  <Input type="number" placeholder="0" className="mt-1.5" />
                </div>
                <div>
                  <label className="text-sm font-medium">Unit</label>
                  <select className="mt-1.5 w-full h-10 px-3 rounded-md border border-card-border bg-white text-sm">
                    <option>cm</option>
                    <option>in</option>
                    <option>mm</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Shipping class</label>
                <select className="mt-1.5 w-full h-10 px-3 rounded-md border border-card-border bg-white text-sm">
                  {shippingClasses.map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Variations</CardTitle>
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setProductType('simple')}
                    className={cn(
                      'px-3 py-1 text-sm rounded-md transition-all',
                      productType === 'simple' ? 'bg-white shadow-sm' : 'text-text-secondary'
                    )}
                  >
                    Simple
                  </button>
                  <button
                    onClick={() => setProductType('variable')}
                    className={cn(
                      'px-3 py-1 text-sm rounded-md transition-all',
                      productType === 'variable' ? 'bg-white shadow-sm' : 'text-text-secondary'
                    )}
                  >
                    Variable
                  </button>
                </div>
              </div>
            </CardHeader>
            {productType === 'variable' && (
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Attributes</p>
                  <Button variant="outline" size="sm" onClick={addAttribute}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add attribute
                  </Button>
                </div>
                {attributes.map((attr, i) => (
                  <div key={i} className="p-4 border border-card-border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Input 
                        placeholder="Attribute name (e.g. Size, Color)"
                        value={attr.name}
                        onChange={(e) => updateAttribute(i, 'name', e.target.value)}
                        className="w-64"
                      />
                      <button onClick={() => removeAttribute(i)} className="text-status-danger hover:bg-red-50 p-1 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <Input 
                      placeholder="Values separated by comma (e.g. Small, Medium, Large)"
                      value={attr.values.join(', ')}
                      onChange={(e) => updateAttribute(i, 'values', e.target.value)}
                    />
                  </div>
                ))}
                {attributes.length === 0 && (
                  <p className="text-sm text-text-muted text-center py-4">No attributes added yet</p>
                )}
              </CardContent>
            )}
          </Card>
        </div>

        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="mt-1.5 w-full h-10 px-3 rounded-md border border-card-border bg-white text-sm">
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="mt-1.5 w-full h-10 px-3 rounded-md border border-card-border bg-white text-sm">
                  <option value="">— None —</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => save('draft')} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save draft
                </Button>
                <Button className="flex-1" onClick={() => save('active')} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Publish
                </Button>
              </div>
            </CardContent>
          </Card>


          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-brand-indigo-light text-brand-indigo text-sm rounded-full">
                    {tag}
                    <button onClick={() => removeTag(tag)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Add tag" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag}>Add</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Meta title</label>
                <Input placeholder="Enter meta title" className="mt-1.5" />
                <p className="text-xs text-text-muted mt-1">0/60 characters</p>
              </div>
              <div>
                <label className="text-sm font-medium">Meta description</label>
                <Textarea placeholder="Enter meta description" className="mt-1.5 h-20" />
                <p className="text-xs text-text-muted mt-1">0/160 characters</p>
              </div>
              <div>
                <label className="text-sm font-medium">URL slug</label>
                <Input placeholder="product-url-slug" className="mt-1.5" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}