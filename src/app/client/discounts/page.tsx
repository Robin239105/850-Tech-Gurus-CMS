'use client'

import { useState } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  X,
  RefreshCw,
} from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

const mockCoupons = [
  { id: '1', code: 'SUMMER25', type: 'percentage', amount: 25, minOrder: 50, used: 145, limit: 500, expiry: '2026-08-31', status: 'active', products: [], categories: [] },
  { id: '2', code: 'WELCOME10', type: 'fixed', amount: 10, minOrder: 0, used: 892, limit: null, expiry: null, status: 'active', products: [], categories: [] },
  { id: '3', code: 'FREESHIP', type: 'percentage', amount: 100, minOrder: 75, used: 324, limit: 1000, expiry: '2026-06-30', status: 'active', products: [], categories: [] },
  { id: '4', code: 'FLASH50', type: 'percentage', amount: 50, minOrder: 100, used: 50, limit: 50, expiry: '2026-05-15', status: 'expired', products: [], categories: [] },
  { id: '5', code: 'BFCM20', type: 'percentage', amount: 20, minOrder: 0, used: 1200, limit: 2000, expiry: '2025-11-30', status: 'expired', products: [], categories: [] },
]

const filterTabs = ['All', 'Active', 'Expired']

const statusColors = {
  active: 'bg-status-success/10 text-status-success',
  expired: 'bg-gray-100 text-gray-500',
}

const typeColors = {
  percentage: 'bg-brand-indigo/10 text-brand-indigo',
  fixed: 'bg-brand-cyan/10 text-brand-cyan',
}

export default function DiscountsPage() {
  const [activeTab, setActiveTab] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<typeof mockCoupons[0] | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    amount: '',
    minOrder: '',
    limit: '',
    perCustomerLimit: '',
    expiry: '',
    active: true,
    products: [] as string[],
    categories: [] as string[],
  })

  const filteredCoupons = mockCoupons.filter(coupon => {
    if (activeTab === 'All') return true
    if (activeTab === 'Active') return coupon.status === 'active'
    if (activeTab === 'Expired') return coupon.status === 'expired'
    return true
  })

  const openModal = (coupon?: typeof mockCoupons[0]) => {
    if (coupon) {
      setEditingCoupon(coupon)
      setFormData({
        code: coupon.code,
        type: coupon.type as 'percentage' | 'fixed',
        amount: coupon.amount.toString(),
        minOrder: coupon.minOrder.toString(),
        limit: coupon.limit?.toString() || '',
        perCustomerLimit: '',
        expiry: coupon.expiry || '',
        active: coupon.status === 'active',
        products: coupon.products,
        categories: coupon.categories,
      })
    } else {
      setEditingCoupon(null)
      setFormData({
        code: '',
        type: 'percentage',
        amount: '',
        minOrder: '',
        limit: '',
        perCustomerLimit: '',
        expiry: '',
        active: true,
        products: [],
        categories: [],
      })
    }
    setShowModal(true)
  }

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, code })
  }

  const [deletingId, setDeletingId] = useState<string | null>(null)

  const saveCoupon = () => {
    setShowModal(false)
  }

  const deleteCoupon = (id: string) => {
    setDeletingId(id)
  }

  const confirmDelete = () => {
    if (deletingId) setDeletingId(null)
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
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add coupon
        </Button>
      </div>

      <div className="border border-card-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-card-border">
            <tr>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Code</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Type</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Amount</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Min order</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Usage</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Expiry</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Status</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCoupons.map(coupon => (
              <tr key={coupon.id} className="border-b border-card-border hover:bg-gray-50">
                <td className="p-3">
                  <span className="font-mono font-bold text-brand-indigo">{coupon.code}</span>
                </td>
                <td className="p-3">
                  <span className={cn('px-2 py-1 text-xs font-medium rounded-full', typeColors[coupon.type as keyof typeof typeColors])}>
                    {coupon.type === 'percentage' ? 'Percentage' : 'Fixed amount'}
                  </span>
                </td>
                <td className="p-3">
                  <span className="font-medium">
                    {coupon.type === 'percentage' ? `${coupon.amount}%` : formatCurrency(coupon.amount)}
                  </span>
                </td>
                <td className="p-3 text-sm text-text-secondary">
                  {coupon.minOrder > 0 ? formatCurrency(coupon.minOrder) : '—'}
                </td>
                <td className="p-3 text-sm">
                  <span>{coupon.used}</span>
                  <span className="text-text-muted">/</span>
                  <span className="text-text-muted">{coupon.limit || '∞'}</span>
                </td>
                <td className="p-3 text-sm text-text-secondary">
                  {coupon.expiry ? formatDate(coupon.expiry) : '—'}
                </td>
                <td className="p-3">
                  <span className={cn('px-2 py-1 text-xs font-medium rounded-full', statusColors[coupon.status as keyof typeof statusColors])}>
                    {coupon.status.charAt(0).toUpperCase() + coupon.status.slice(1)}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => openModal(coupon)}
                      className="p-1.5 hover:bg-gray-100 rounded"
                    >
                      <Edit className="w-4 h-4 text-text-muted" />
                    </button>
                    <button 
                      onClick={() => deleteCoupon(coupon.id)}
                      className="p-1.5 hover:bg-gray-100 rounded text-status-danger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCoupons.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-text-muted mb-2">No coupons found</p>
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Create your first coupon
          </Button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[500px] max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="p-5 border-b border-card-border flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingCoupon ? 'Edit coupon' : 'Add new coupon'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium">Coupon code *</label>
                <div className="mt-1.5 flex gap-2">
                  <Input 
                    placeholder="e.g. SUMMER20"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="font-mono"
                  />
                  <Button variant="outline" onClick={generateCode}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Discount type</label>
                <div className="mt-1.5 flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="type" 
                      checked={formData.type === 'percentage'}
                      onChange={() => setFormData({ ...formData, type: 'percentage' })}
                      className="text-brand-indigo"
                    />
                    <span className="text-sm">Percentage</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="type" 
                      checked={formData.type === 'fixed'}
                      onChange={() => setFormData({ ...formData, type: 'fixed' })}
                      className="text-brand-indigo"
                    />
                    <span className="text-sm">Fixed amount</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Discount value</label>
                <div className="mt-1.5 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                    {formData.type === 'percentage' ? '%' : '$'}
                  </span>
                  <Input 
                    type="number"
                    placeholder="0"
                    className={cn('pl-7', formData.type === 'percentage' && 'pl-7')}
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Minimum order amount</label>
                <div className="mt-1.5 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">$</span>
                  <Input 
                    type="number"
                    placeholder="0"
                    className="pl-7"
                    value={formData.minOrder}
                    onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Usage limit</label>
                  <Input 
                    type="number"
                    placeholder="Unlimited"
                    className="mt-1.5"
                    value={formData.limit}
                    onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                  />
                  <p className="text-xs text-text-muted mt-1">Leave empty for unlimited</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Per customer limit</label>
                  <Input 
                    type="number"
                    placeholder="Unlimited"
                    className="mt-1.5"
                    value={formData.perCustomerLimit}
                    onChange={(e) => setFormData({ ...formData, perCustomerLimit: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Expiry date</label>
                <Input 
                  type="date"
                  className="mt-1.5"
                  value={formData.expiry}
                  onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Applicable products</label>
                <div className="mt-1.5 space-y-2">
                  <label className="flex items-center gap-2 text-sm text-text-secondary">
                    <input type="checkbox" className="rounded text-brand-indigo" />
                    <span>All products</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-text-secondary">
                    <input type="checkbox" className="rounded text-brand-indigo" />
                    <span>Specific products</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-text-secondary">
                    <input type="checkbox" className="rounded text-brand-indigo" />
                    <span>Specific categories</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                  <span className="text-sm">Active</span>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-card-border flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={saveCoupon}>
                {editingCoupon ? 'Update coupon' : 'Save coupon'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[400px] p-6 animate-fade-in">
            <h3 className="text-lg font-semibold mb-2">Delete coupon?</h3>
            <p className="text-sm text-text-secondary mb-6">This action cannot be undone.</p>
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