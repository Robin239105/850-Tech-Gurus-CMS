'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ChevronRight,
  Upload,
  Plus,
  X,
  Save,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'

const categories = ['Electronics', 'Fitness', 'Food & Beverage', 'Accessories', 'Sports', 'Clothing', 'Home & Garden']
const shippingClasses = ['Standard', 'Express', 'Pickup only', 'Digital']

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [productType, setProductType] = useState<'simple' | 'variable'>('simple')
  const [attributes, setAttributes] = useState<{ name: string; values: string[] }[]>([
    { name: 'Color', values: ['Black', 'White', 'Navy'] },
  ])
  const [trackInventory, setTrackInventory] = useState(true)
  const [allowBackorders, setAllowBackorders] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  React.useEffect(() => {
    fetch(`/api/client/products/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setProduct(data)
          if (data.tags) setTags(data.tags)
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-8 text-center">Loading product...</div>
  if (!product) return <div className="p-8 text-center text-status-danger">Product not found</div>

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
        <span className="text-text-primary">Edit {product.name}</span>
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Product name *</label>
                <Input defaultValue={product.name} placeholder="Enter product name" className="mt-1.5" />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea defaultValue={product.description} placeholder="Describe your product..." className="mt-1.5 h-32" />
              </div>
              <div>
                <label className="text-sm font-medium">Short description</label>
                <Textarea defaultValue={product.short_description} placeholder="Brief summary for product cards" className="mt-1.5 h-20" />
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
                  {product.image ? (
                    <img src={product.image} className="w-32 h-32 object-cover rounded-lg mb-2" alt={product.name} />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mb-2" />
                  )}
                  <p className="text-sm text-text-secondary">Click to replace or drag and drop</p>
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
                    <Input defaultValue={product.price} placeholder="0.00" className="pl-7" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Sale price</label>
                  <div className="mt-1.5 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">$</span>
                    <Input defaultValue={product.sale_price} placeholder="0.00" className="pl-7" />
                  </div>
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
                    <Input defaultValue={product.sku} placeholder="Enter SKU" />
                    <Button variant="outline">Auto-generate</Button>
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
                      <Input type="number" defaultValue={product.stock} placeholder="0" className="mt-1.5" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Low stock threshold</label>
                      <Input type="number" defaultValue={product.low_stock_threshold} placeholder="5" className="mt-1.5" />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
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
                <select defaultValue={product.status} className="mt-1.5 w-full h-10 px-3 rounded-md border border-card-border bg-white text-sm">
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save draft
                </Button>
                <Button className="flex-1">
                  <Check className="w-4 h-4 mr-2" />
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
               <Input defaultValue={product.category} placeholder="Category" />
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
                <Input defaultValue={product.meta_title} placeholder="Enter meta title" className="mt-1.5" />
              </div>
              <div>
                <label className="text-sm font-medium">Meta description</label>
                <Textarea defaultValue={product.meta_description} placeholder="Enter meta description" className="mt-1.5 h-20" />
              </div>
              <div>
                <label className="text-sm font-medium">URL slug</label>
                <Input defaultValue={product.slug} placeholder="product-url-slug" className="mt-1.5" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}