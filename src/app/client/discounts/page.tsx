'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, X, RefreshCw } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

type Coupon = {
  id: string
  code: string
  type: string
  amount: number
  min_order: number
  usage_limit: number | null
  used_count: number
  expiry_date: string | null
  active: boolean
  created_at: string
}

const filterTabs = ['All', 'Active', 'Expired']

const statusColors: Record<string, string> = {
  active: 'bg-status-success/10 text-status-success',
  expired: 'bg-gray-100 text-gray-500',
}

const typeColors: Record<string, string> = {
  percentage: 'bg-brand-indigo/10 text-brand-indigo',
  fixed: 'bg-brand-cyan/10 text-brand-cyan',
}

const emptyForm = () => ({ code: '', type: 'percentage' as 'percentage' | 'fixed', amount: '', minOrder: '', limit: '', expiry: '', active: true })

export default function DiscountsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = () => {
    fetch('/api/client/discounts')
      .then(r => r.ok ? r.json() : [])
      .then(setCoupons)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const isExpired = (c: Coupon) => c.expiry_date && new Date(c.expiry_date) < new Date()
  const status = (c: Coupon) => (!c.active || isExpired(c)) ? 'expired' : 'active'

  const filtered = coupons.filter(c => {
    if (activeTab === 'Active') return status(c) === 'active'
    if (activeTab === 'Expired') return status(c) === 'expired'
    return true
  })

  const openModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon)
      setFormData({
        code: coupon.code,
        type: coupon.type as 'percentage' | 'fixed',
        amount: coupon.amount.toString(),
        minOrder: coupon.min_order.toString(),
        limit: coupon.usage_limit?.toString() || '',
        expiry: coupon.expiry_date || '',
        active: coupon.active,
      })
    } else {
      setEditingCoupon(null)
      setFormData(emptyForm())
    }
    setShowModal(true)
  }

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    setFormData(f => ({ ...f, code: Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('') }))
  }

  const handleSave = async () => {
    if (!formData.code || !formData.amount) return
    setSaving(true)
    const payload = {
      code: formData.code.toUpperCase(),
      type: formData.type,
      amount: parseFloat(formData.amount),
      min_order: parseFloat(formData.minOrder) || 0,
      usage_limit: formData.limit ? parseInt(formData.limit) : null,
      expiry_date: formData.expiry || null,
      active: formData.active,
    }
    if (editingCoupon) {
      await fetch('/api/client/discounts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingCoupon.id, ...payload }),
      })
    } else {
      await fetch('/api/client/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }
    setSaving(false)
    setShowModal(false)
    load()
  }

  const confirmDelete = async () => {
    if (!deletingId) return
    await fetch('/api/client/discounts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deletingId }),
    })
    setDeletingId(null)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Discounts & Coupons</h1>
          <p className="text-text-secondary mt-1">Create and manage discount codes</p>
        </div>
        <Button onClick={() => openModal()}><Plus className="w-4 h-4 mr-2" />Add coupon</Button>
      </div>

      <div className="flex gap-1 p-1 bg-page-bg rounded-lg w-fit">
        {filterTabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('px-4 py-2 text-sm font-medium rounded-md transition-all',
              activeTab === tab ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary')}>
            {tab}
          </button>
        ))}
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
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="p-8 text-center text-text-muted">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-text-muted">
                {coupons.length === 0 ? 'No coupons yet. Create your first discount code.' : 'No coupons match this filter.'}
              </td></tr>
            ) : filtered.map(coupon => (
              <tr key={coupon.id} className="border-b border-card-border hover:bg-gray-50">
                <td className="p-3"><span className="font-mono font-bold text-brand-indigo">{coupon.code}</span></td>
                <td className="p-3">
                  <span className={cn('px-2 py-1 text-xs font-medium rounded-full', typeColors[coupon.type] ?? 'bg-gray-100 text-gray-600')}>
                    {coupon.type === 'percentage' ? 'Percentage' : 'Fixed'}
                  </span>
                </td>
                <td className="p-3 font-medium text-sm">{coupon.type === 'percentage' ? `${coupon.amount}%` : formatCurrency(coupon.amount)}</td>
                <td className="p-3 text-sm text-text-secondary">{Number(coupon.min_order) > 0 ? formatCurrency(coupon.min_order) : '—'}</td>
                <td className="p-3 text-sm">{coupon.used_count}<span className="text-text-muted">/{coupon.usage_limit ?? '∞'}</span></td>
                <td className="p-3 text-sm text-text-secondary">{coupon.expiry_date ? formatDate(coupon.expiry_date) : '—'}</td>
                <td className="p-3">
                  <span className={cn('px-2 py-1 text-xs font-medium rounded-full', statusColors[status(coupon)])}>
                    {status(coupon).charAt(0).toUpperCase() + status(coupon).slice(1)}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <button onClick={() => openModal(coupon)} className="p-1.5 hover:bg-gray-100 rounded"><Edit className="w-4 h-4 text-text-muted" /></button>
                    <button onClick={() => setDeletingId(coupon.id)} className="p-1.5 hover:bg-gray-100 rounded text-status-danger"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">{editingCoupon ? 'Edit coupon' : 'Add new coupon'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium">Coupon code *</label>
                <div className="mt-1.5 flex gap-2">
                  <Input placeholder="e.g. SUMMER20" value={formData.code} onChange={e => setFormData(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="font-mono" />
                  <Button variant="outline" onClick={generateCode}><RefreshCw className="w-4 h-4" /></Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Discount type</label>
                <div className="mt-1.5 flex gap-4">
                  {(['percentage', 'fixed'] as const).map(t => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="type" checked={formData.type === t} onChange={() => setFormData(f => ({ ...f, type: t }))} />
                      <span className="text-sm">{t === 'percentage' ? 'Percentage' : 'Fixed amount'}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Discount value *</label>
                <div className="mt-1.5 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">{formData.type === 'percentage' ? '%' : '$'}</span>
                  <Input type="number" placeholder="0" className="pl-7" value={formData.amount} onChange={e => setFormData(f => ({ ...f, amount: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Min order amount</label>
                  <div className="mt-1.5 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">$</span>
                    <Input type="number" placeholder="0" className="pl-7" value={formData.minOrder} onChange={e => setFormData(f => ({ ...f, minOrder: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Usage limit</label>
                  <Input type="number" placeholder="Unlimited" className="mt-1.5" value={formData.limit} onChange={e => setFormData(f => ({ ...f, limit: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Expiry date</label>
                <Input type="date" className="mt-1.5" value={formData.expiry} onChange={e => setFormData(f => ({ ...f, expiry: e.target.value }))} />
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium">Active</span>
                <Switch checked={formData.active} onCheckedChange={checked => setFormData(f => ({ ...f, active: checked }))} />
              </div>
            </div>
            <div className="p-5 border-t flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !formData.code || !formData.amount}>
                {saving ? 'Saving…' : editingCoupon ? 'Update coupon' : 'Save coupon'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[400px] p-6">
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
