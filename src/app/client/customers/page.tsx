'use client'

import { useState, useEffect } from 'react'
import { Search, Eye, X, Mail, Phone, User, ShoppingBag, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

type Customer = {
  id: string
  name: string
  email: string
  phone: string | null
  orders_count: number
  total_spent: number
  created_at: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    fetch('/api/client/customers')
      .then(r => r.ok ? r.json() : [])
      .then(setCustomers)
      .finally(() => setLoading(false))
  }, [])

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalSpend = customers.reduce((s, c) => s + Number(c.total_spent), 0)
  const totalOrders = customers.reduce((s, c) => s + Number(c.orders_count), 0)
  const avgOrderValue = totalOrders > 0 ? totalSpend / totalOrders : 0
  const initials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-text-secondary mt-1">Manage your customer base</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-5 flex items-center justify-between">
          <div><p className="text-sm text-text-secondary">Total Customers</p><p className="text-2xl font-bold mt-1">{customers.length}</p></div>
          <div className="p-3 bg-brand-indigo/10 rounded-full"><User className="w-5 h-5 text-brand-indigo" /></div>
        </CardContent></Card>
        <Card><CardContent className="p-5 flex items-center justify-between">
          <div><p className="text-sm text-text-secondary">Total Orders</p><p className="text-2xl font-bold mt-1">{totalOrders}</p></div>
          <div className="p-3 bg-status-success/10 rounded-full"><ShoppingBag className="w-5 h-5 text-status-success" /></div>
        </CardContent></Card>
        <Card><CardContent className="p-5 flex items-center justify-between">
          <div><p className="text-sm text-text-secondary">Total Revenue</p><p className="text-2xl font-bold mt-1">{formatCurrency(totalSpend)}</p></div>
          <div className="p-3 bg-brand-cyan/10 rounded-full"><DollarSign className="w-5 h-5 text-brand-cyan" /></div>
        </CardContent></Card>
        <Card><CardContent className="p-5 flex items-center justify-between">
          <div><p className="text-sm text-text-secondary">Avg Order Value</p><p className="text-2xl font-bold mt-1">{formatCurrency(avgOrderValue)}</p></div>
          <div className="p-3 bg-status-warning/10 rounded-full"><DollarSign className="w-5 h-5 text-status-warning" /></div>
        </CardContent></Card>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input placeholder="Search customers…" className="w-64 pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <div className="border border-card-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-card-border">
            <tr>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Customer</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Phone</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Orders</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Total Spent</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Joined</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-text-muted">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-text-muted">
                {customers.length === 0 ? 'No customers yet. They will appear here once orders are placed.' : 'No customers match your search.'}
              </td></tr>
            ) : filtered.map(customer => (
              <tr key={customer.id} className="border-b border-card-border hover:bg-gray-50">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-brand-indigo rounded-full flex items-center justify-center text-white text-sm font-medium">{initials(customer.name)}</div>
                    <div>
                      <p className="text-sm font-medium">{customer.name}</p>
                      <p className="text-xs text-text-muted">{customer.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-sm text-text-secondary">{customer.phone ?? '—'}</td>
                <td className="p-3 text-sm">{customer.orders_count}</td>
                <td className="p-3 text-sm font-medium">{formatCurrency(Number(customer.total_spent))}</td>
                <td className="p-3 text-sm text-text-secondary">{formatDate(customer.created_at)}</td>
                <td className="p-3">
                  <button onClick={() => setSelectedCustomer(customer)} className="p-1.5 hover:bg-gray-100 rounded">
                    <Eye className="w-4 h-4 text-text-muted" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-text-muted">Showing {filtered.length} of {customers.length} customers</p>

      {selectedCustomer && (
        <div className="fixed inset-y-0 right-0 w-[420px] bg-white shadow-modal border-l border-card-border z-50 overflow-y-auto">
          <div className="p-5 border-b border-card-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-indigo rounded-full flex items-center justify-center text-white font-bold">{initials(selectedCustomer.name)}</div>
              <div>
                <h3 className="font-semibold">{selectedCustomer.name}</h3>
                <p className="text-sm text-text-muted">{selectedCustomer.email}</p>
              </div>
            </div>
            <button onClick={() => setSelectedCustomer(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-5 border-b border-card-border">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-text-muted">Orders</p>
                <p className="text-xl font-bold">{selectedCustomer.orders_count}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Total Spent</p>
                <p className="text-xl font-bold">{formatCurrency(Number(selectedCustomer.total_spent))}</p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-4 h-4 text-text-muted" />
              <span className="text-sm">{selectedCustomer.email}</span>
            </div>
            {selectedCustomer.phone && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-4 h-4 text-text-muted" />
                <span className="text-sm">{selectedCustomer.phone}</span>
              </div>
            )}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-text-muted">Customer since</p>
              <p className="text-sm mt-1">{formatDate(selectedCustomer.created_at)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
