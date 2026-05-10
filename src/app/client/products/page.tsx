'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Copy,
  Eye,
  Archive,
  Trash2,
  ArrowUpDown,
} from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'


const filterTabs = ['All', 'Active', 'Draft', 'Out of stock', 'Archived']

const statusColors = {
  active: 'bg-status-success/10 text-status-success',
  draft: 'bg-gray-100 text-gray-600',
  'out-of-stock': 'bg-status-danger/10 text-status-danger',
  archived: 'bg-gray-100 text-gray-400',
}

type Product = { id: string; name: string; sku: string | null; category: string | null; price: number; sale_price: number | null; stock: number; low_stock_threshold: number; status: string; updated_at: string }

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetch('/api/client/products').then(r => r.ok ? r.json() : []).then(setProducts).finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    await fetch('/api/client/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const filteredProducts = products.filter(product => {
    const matchesTab = activeTab === 'All' || 
      (activeTab === 'Active' && product.status === 'active') ||
      (activeTab === 'Draft' && product.status === 'draft') ||
      (activeTab === 'Out of stock' && (product.status === 'out-of-stock' || product.stock === 0)) ||
      (activeTab === 'Archived' && product.status === 'archived')
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (product.sku ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const outOfStock = products.filter(p => p.stock === 0).length
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.low_stock_threshold).length

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id))
    }
  }

  const getStockPercentage = (stock: number, lowStock: number) => {
    const maxStock = lowStock * 3
    return Math.min((stock / maxStock) * 100, 100)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Products</p>
                <p className="text-2xl font-bold mt-1">{products.length}</p>
              </div>
              <div className="text-xs text-text-muted">{outOfStock} out of stock</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Active Products</p>
                <p className="text-2xl font-bold mt-1">{products.filter(p => p.status === 'active').length}</p>
              </div>
              <div className="text-xs text-text-muted">{products.filter(p => p.status === 'draft').length} draft</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Low Stock Alert</p>
                <p className="text-2xl font-bold mt-1">{lowStock}</p>
              </div>
              <div className={`text-xs ${lowStock > 0 ? 'text-status-danger' : 'text-status-success'}`}>{lowStock > 0 ? 'Needs attention' : 'All good'}</div>
            </div>
          </CardContent>
        </Card>
      </div>

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
              placeholder="Search products..." 
              className="w-64 pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select className="h-10 px-3 rounded-md border border-card-border bg-white text-sm">
            <option>All Categories</option>
            <option>Electronics</option>
            <option>Fitness</option>
            <option>Food & Beverage</option>
            <option>Accessories</option>
          </select>
          <select className="h-10 px-3 rounded-md border border-card-border bg-white text-sm">
            <option>Newest first</option>
            <option>Price low to high</option>
            <option>Price high to low</option>
            <option>Stock low to high</option>
          </select>
          <Link href="/client/products/new">
            <Button>
              <Plus className="w-4 h-4" />
              Add product
            </Button>
          </Link>
        </div>
      </div>

      {selectedProducts.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-brand-indigo-light rounded-lg">
          <span className="text-sm font-medium text-brand-indigo">{selectedProducts.length} selected</span>
          <Button variant="outline" size="sm">Archive</Button>
          <Button variant="outline" size="sm">Delete</Button>
          <select className="h-8 px-2 rounded-md border border-card-border bg-white text-sm ml-auto">
            <option>Update status</option>
            <option>Set to Active</option>
            <option>Set to Draft</option>
            <option>Set to Archived</option>
          </select>
          <Button variant="outline" size="sm">Export</Button>
        </div>
      )}

      <div className="border border-card-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-card-border">
            <tr>
              <th className="p-3 text-left">
                <Checkbox 
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Product</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Category</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Price</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Stock</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Status</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Last updated</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="p-8 text-center text-text-muted">Loading…</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-text-muted">
                {products.length === 0 ? <span>No products yet — <Link href="/client/products/new" className="text-brand-indigo hover:underline">add your first product</Link></span> : 'No products match this filter'}
              </td></tr>
            ) : filteredProducts.map(product => (
              <tr key={product.id} className="border-b border-card-border hover:bg-gray-50">
                <td className="p-3">
                  <Checkbox 
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => setSelectedProducts(prev => 
                      prev.includes(product.id) ? prev.filter(id => id !== product.id) : [...prev, product.id]
                    )}
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-md" />
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-text-muted">SKU: {product.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-sm text-text-secondary">{product.category}</td>
                <td className="p-3">
                  <div>
                    {product.sale_price ? (
                      <>
                        <span className="text-sm font-medium text-status-success">{formatCurrency(Number(product.sale_price))}</span>
                        <span className="text-xs text-text-muted line-through ml-2">{formatCurrency(Number(product.price))}</span>
                      </>
                    ) : (
                      <span className="text-sm font-medium">{formatCurrency(Number(product.price))}</span>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{product.stock}</span>
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          'h-full rounded-full',
                          product.stock === 0 ? 'bg-status-danger' : product.stock <= product.low_stock_threshold ? 'bg-status-warning' : 'bg-status-success'
                        )}
                        style={{ width: `${getStockPercentage(product.stock, product.low_stock_threshold)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <span className={cn('px-2 py-1 text-xs font-medium rounded-full', statusColors[product.status as keyof typeof statusColors])}>
                    {product.status === 'out-of-stock' ? 'Out of stock' : product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                  </span>
                </td>
                <td className="p-3 text-sm text-text-secondary">{product.updated_at ? formatDate(product.updated_at) : '—'}</td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <Link href={`/client/products/${product.id}`}>
                      <button className="p-1.5 hover:bg-gray-100 rounded">
                        <Edit className="w-4 h-4 text-text-muted" />
                      </button>
                    </Link>
                    <button className="p-1.5 hover:bg-gray-100 rounded">
                      <Copy className="w-4 h-4 text-text-muted" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 rounded">
                      <Eye className="w-4 h-4 text-text-muted" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 rounded">
                      <Archive className="w-4 h-4 text-text-muted" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 rounded text-status-danger" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Showing {filteredProducts.length} of {products.length} products</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  )
}