'use client'

import { useState } from 'react'
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

const mockProducts = [
  { id: '1', name: 'Wireless Headphones', sku: 'WH-001', category: 'Electronics', price: 149.99, salePrice: 129.99, stock: 45, lowStock: 10, status: 'active', image: '/images/product-1.jpg', updatedAt: '2026-05-10' },
  { id: '2', name: 'Smart Watch Pro', sku: 'SW-002', category: 'Electronics', price: 299.99, salePrice: null, stock: 12, lowStock: 5, status: 'active', image: '/images/product-2.jpg', updatedAt: '2026-05-09' },
  { id: '3', name: 'Organic Coffee Beans', sku: 'OC-003', category: 'Food & Beverage', price: 24.99, salePrice: 19.99, stock: 0, lowStock: 20, status: 'out-of-stock', image: '/images/product-3.jpg', updatedAt: '2026-05-08' },
  { id: '4', name: 'Yoga Mat Premium', sku: 'YM-004', category: 'Fitness', price: 49.99, salePrice: null, stock: 78, lowStock: 10, status: 'active', image: '/images/product-4.jpg', updatedAt: '2026-05-07' },
  { id: '5', name: 'Bluetooth Speaker', sku: 'BS-005', category: 'Electronics', price: 89.99, salePrice: null, stock: 34, lowStock: 10, status: 'active', image: '/images/product-5.jpg', updatedAt: '2026-05-06' },
  { id: '6', name: 'Running Shoes', sku: 'RS-006', category: 'Sports', price: 129.99, salePrice: 99.99, stock: 23, lowStock: 15, status: 'active', image: '/images/product-6.jpg', updatedAt: '2026-05-05' },
  { id: '7', name: 'Water Bottle', sku: 'WB-007', category: 'Accessories', price: 29.99, salePrice: null, stock: 156, lowStock: 20, status: 'active', image: '/images/product-7.jpg', updatedAt: '2026-05-04' },
  { id: '8', name: 'Laptop Stand', sku: 'LS-008', category: 'Electronics', price: 59.99, salePrice: null, stock: 0, lowStock: 10, status: 'draft', image: '/images/product-8.jpg', updatedAt: '2026-05-03' },
]

const filterTabs = ['All', 'Active', 'Draft', 'Out of stock', 'Archived']

const statusColors = {
  active: 'bg-status-success/10 text-status-success',
  draft: 'bg-gray-100 text-gray-600',
  'out-of-stock': 'bg-status-danger/10 text-status-danger',
  archived: 'bg-gray-100 text-gray-400',
}

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState('All')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProducts = mockProducts.filter(product => {
    const matchesTab = activeTab === 'All' || 
      (activeTab === 'Active' && product.status === 'active') ||
      (activeTab === 'Draft' && product.status === 'draft') ||
      (activeTab === 'Out of stock' && (product.status === 'out-of-stock' || product.stock === 0)) ||
      (activeTab === 'Archived' && product.status === 'archived')
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

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
                <p className="text-2xl font-bold mt-1">48</p>
              </div>
              <div className="text-xs text-text-muted">2 out of stock</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">New This Week</p>
                <p className="text-2xl font-bold mt-1">5</p>
              </div>
              <div className="text-xs text-status-success">+12%</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Low Stock Alert</p>
                <p className="text-2xl font-bold mt-1">3</p>
              </div>
              <div className="text-xs text-status-danger">Needs attention</div>
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
            {filteredProducts.map(product => (
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
                    {product.salePrice ? (
                      <>
                        <span className="text-sm font-medium text-status-success">{formatCurrency(product.salePrice)}</span>
                        <span className="text-xs text-text-muted line-through ml-2">{formatCurrency(product.price)}</span>
                      </>
                    ) : (
                      <span className="text-sm font-medium">{formatCurrency(product.price)}</span>
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
                          product.stock === 0 ? 'bg-status-danger' : product.stock <= product.lowStock ? 'bg-status-warning' : 'bg-status-success'
                        )}
                        style={{ width: `${getStockPercentage(product.stock, product.lowStock)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <span className={cn('px-2 py-1 text-xs font-medium rounded-full', statusColors[product.status as keyof typeof statusColors])}>
                    {product.status === 'out-of-stock' ? 'Out of stock' : product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                  </span>
                </td>
                <td className="p-3 text-sm text-text-secondary">{formatDate(product.updatedAt)}</td>
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

      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Showing {filteredProducts.length} of {mockProducts.length} products</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  )
}