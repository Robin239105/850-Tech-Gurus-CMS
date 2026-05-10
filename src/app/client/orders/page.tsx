'use client'

import { useState, useEffect } from 'react'
import {
  Search, Eye, ChevronDown, ChevronUp,
  Package, Check, X, Clock, User,
} from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

type OrderItem = { name: string; qty: number; price: number }
type ShippingAddress = { line1?: string; city?: string; state?: string; zip?: string; country?: string }

type Order = {
  id: string
  order_number: string
  customer_name: string | null
  customer_email: string | null
  items: OrderItem[]
  total: number
  payment_status: string
  fulfillment_status: string
  shipping_address: ShippingAddress | null
  notes: string | null
  created_at: string
}

const filterTabs = ['All', 'Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled']

const paymentColors: Record<string, string> = {
  paid: 'bg-status-success/10 text-status-success',
  pending: 'bg-status-warning/10 text-status-warning',
  failed: 'bg-status-danger/10 text-status-danger',
  refunded: 'bg-gray-100 text-gray-500',
}

const fulfillmentColors: Record<string, string> = {
  pending: 'bg-status-warning/10 text-status-warning',
  processing: 'bg-blue-100 text-blue-600',
  shipped: 'bg-brand-indigo/10 text-brand-indigo',
  delivered: 'bg-status-success/10 text-status-success',
  cancelled: 'bg-status-danger/10 text-status-danger',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedOrders, setExpandedOrders] = useState<string[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetch('/api/client/orders')
      .then(r => r.ok ? r.json() : [])
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [])

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'All' ||
      (activeTab === 'Pending' && order.fulfillment_status === 'pending') ||
      (activeTab === 'Processing' && order.fulfillment_status === 'processing') ||
      (activeTab === 'Shipped' && order.fulfillment_status === 'shipped') ||
      (activeTab === 'Completed' && order.fulfillment_status === 'delivered') ||
      (activeTab === 'Cancelled' && order.fulfillment_status === 'cancelled')
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer_name ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const totalRevenue = orders
    .filter(o => o.payment_status === 'paid')
    .reduce((s, o) => s + Number(o.total), 0)
  const pendingCount = orders.filter(
    o => o.fulfillment_status === 'pending' || o.fulfillment_status === 'processing'
  ).length
  const todayOrders = orders.filter(
    o => new Date(o.created_at).toDateString() === new Date().toDateString()
  ).length

  const toggleExpand = (id: string) =>
    setExpandedOrders(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-text-secondary mt-1">Track and manage customer orders</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">New Today</p>
                <p className="text-2xl font-bold mt-1">{todayOrders}</p>
              </div>
              <div className="p-3 bg-brand-indigo/10 rounded-full">
                <Package className="w-5 h-5 text-brand-indigo" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Pending Fulfillment</p>
                <p className="text-2xl font-bold mt-1">{pendingCount}</p>
              </div>
              <div className="p-3 bg-status-warning/10 rounded-full">
                <Clock className="w-5 h-5 text-status-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Revenue</p>
                <p className="text-2xl font-bold mt-1 text-status-success">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <div className="p-3 bg-status-success/10 rounded-full">
                <Check className="w-5 h-5 text-status-success" />
              </div>
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            placeholder="Search order # or customer"
            className="w-64 pl-10"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border border-card-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-card-border">
            <tr>
              <th className="p-3 w-8" />
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Order #</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Customer</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Date</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Total</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Payment</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Fulfillment</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-text-muted">Loading…</td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-text-muted">
                  {orders.length === 0
                    ? 'No orders yet. Orders will appear here once customers place them.'
                    : 'No orders match this filter.'}
                </td>
              </tr>
            ) : filteredOrders.map(order => (
              <>
                <tr key={order.id} className="border-b border-card-border hover:bg-gray-50">
                  <td className="p-3">
                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {expandedOrders.includes(order.id)
                        ? <ChevronUp className="w-4 h-4" />
                        : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="p-3 text-sm font-bold text-brand-indigo">{order.order_number}</td>
                  <td className="p-3">
                    <p className="text-sm font-medium">{order.customer_name ?? '—'}</p>
                    <p className="text-xs text-text-muted">{order.customer_email ?? ''}</p>
                  </td>
                  <td className="p-3 text-sm text-text-secondary">{formatDate(order.created_at)}</td>
                  <td className="p-3 text-sm font-bold">{formatCurrency(Number(order.total))}</td>
                  <td className="p-3">
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      paymentColors[order.payment_status] ?? 'bg-gray-100 text-gray-600'
                    )}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      fulfillmentColors[order.fulfillment_status] ?? 'bg-gray-100 text-gray-600'
                    )}>
                      {order.fulfillment_status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-1.5 hover:bg-gray-100 rounded"
                    >
                      <Eye className="w-4 h-4 text-text-muted" />
                    </button>
                  </td>
                </tr>
                {expandedOrders.includes(order.id) && (
                  <tr key={`${order.id}-exp`} className="border-b border-card-border bg-gray-50">
                    <td colSpan={8} className="p-4">
                      <div className="flex gap-8">
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-2">Order Items</p>
                          {(order.items ?? []).length > 0 ? (
                            <table className="w-full text-sm">
                              <tbody>
                                {(order.items as OrderItem[]).map((item, i) => (
                                  <tr key={i}>
                                    <td className="py-1">{item.name}</td>
                                    <td className="py-1 text-text-muted">×{item.qty}</td>
                                    <td className="py-1 text-right">
                                      {formatCurrency(item.price * item.qty)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p className="text-text-muted text-sm">No items recorded</p>
                          )}
                          <div className="mt-3 pt-3 border-t flex justify-between font-bold text-sm">
                            <span>Total</span>
                            <span>{formatCurrency(Number(order.total))}</span>
                          </div>
                        </div>
                        {order.shipping_address && (
                          <div className="w-56">
                            <p className="text-sm font-medium mb-2">Shipping Address</p>
                            <p className="text-sm">{order.shipping_address.line1}</p>
                            <p className="text-sm">
                              {order.shipping_address.city}, {order.shipping_address.state}{' '}
                              {order.shipping_address.zip}
                            </p>
                            <p className="text-sm">{order.shipping_address.country}</p>
                          </div>
                        )}
                        {order.notes && (
                          <div className="w-56 p-3 bg-yellow-50 rounded-lg border border-yellow-100 self-start">
                            <p className="text-xs font-medium text-yellow-800">Customer Note</p>
                            <p className="text-sm mt-1">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-text-muted">
        Showing {filteredOrders.length} of {orders.length} orders
      </p>

      {selectedOrder && (
        <div className="fixed inset-y-0 right-0 w-[500px] bg-white shadow-modal border-l border-card-border z-50 overflow-y-auto">
          <div className="p-5 border-b flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{selectedOrder.order_number}</h3>
              <p className="text-sm text-text-muted">{formatDate(selectedOrder.created_at)}</p>
            </div>
            <button
              onClick={() => setSelectedOrder(null)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Customer</p>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-9 h-9 bg-brand-indigo/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-brand-indigo" />
                </div>
                <div>
                  <p className="font-medium text-sm">{selectedOrder.customer_name ?? '—'}</p>
                  <p className="text-xs text-text-muted">{selectedOrder.customer_email ?? ''}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Items</p>
              {(selectedOrder.items ?? []).length > 0 ? (
                <div className="space-y-1">
                  {(selectedOrder.items as OrderItem[]).map((item, i) => (
                    <div key={i} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                      <span>{item.name} ×{item.qty}</span>
                      <span className="font-medium">
                        {formatCurrency(item.price * item.qty)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted">No items recorded</p>
              )}
              <div className="flex justify-between font-bold text-sm mt-3 pt-3 border-t">
                <span>Total</span>
                <span>{formatCurrency(Number(selectedOrder.total))}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-text-muted mb-1">Payment</p>
                <span className={cn(
                  'px-2 py-0.5 text-xs rounded-full',
                  paymentColors[selectedOrder.payment_status] ?? 'bg-gray-100'
                )}>
                  {selectedOrder.payment_status}
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-text-muted mb-1">Fulfillment</p>
                <span className={cn(
                  'px-2 py-0.5 text-xs rounded-full',
                  fulfillmentColors[selectedOrder.fulfillment_status] ?? 'bg-gray-100'
                )}>
                  {selectedOrder.fulfillment_status}
                </span>
              </div>
            </div>
            {selectedOrder.shipping_address && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-text-muted mb-1">Shipping Address</p>
                <p className="text-sm">{selectedOrder.shipping_address.line1}</p>
                <p className="text-sm">
                  {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}{' '}
                  {selectedOrder.shipping_address.zip}
                </p>
                <p className="text-sm">{selectedOrder.shipping_address.country}</p>
              </div>
            )}
            {selectedOrder.notes && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <p className="text-xs font-medium text-yellow-800">Customer Note</p>
                <p className="text-sm mt-1">{selectedOrder.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
