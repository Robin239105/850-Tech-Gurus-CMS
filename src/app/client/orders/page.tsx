'use client'

import { useState } from 'react'
import {
  Search,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  Package,
  Truck,
  Check,
  X,
  Clock,
  AlertCircle,
  Mail,
  CreditCard,
  MapPin,
  User,
  RefreshCw,
} from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

const mockOrders = [
  { 
    id: 'ORD-001', 
    customer: { name: 'John Smith', email: 'john@email.com' },
    date: '2026-05-10',
    items: 3,
    total: 299.99,
    payment: 'paid',
    fulfillment: 'pending',
    shippingAddress: { line1: '123 Main St', city: 'New York', state: 'NY', zip: '10001', country: 'USA' },
    billingAddress: { line1: '123 Main St', city: 'New York', state: 'NY', zip: '10001', country: 'USA' },
    note: 'Please gift wrap',
    itemsList: [
      { name: 'Wireless Headphones', qty: 1, price: 129.99 },
      { name: 'Smart Watch Pro', qty: 1, price: 149.99 },
      { name: 'USB Cable', qty: 1, price: 19.99 },
    ]
  },
  { 
    id: 'ORD-002', 
    customer: { name: 'Sarah Johnson', email: 'sarah@email.com' },
    date: '2026-05-09',
    items: 1,
    total: 89.99,
    payment: 'paid',
    fulfillment: 'processing',
    shippingAddress: { line1: '456 Oak Ave', city: 'Los Angeles', state: 'CA', zip: '90001', country: 'USA' },
    billingAddress: { line1: '456 Oak Ave', city: 'Los Angeles', state: 'CA', zip: '90001', country: 'USA' },
    note: '',
    itemsList: [
      { name: 'Bluetooth Speaker', qty: 1, price: 89.99 },
    ]
  },
  { 
    id: 'ORD-003', 
    customer: { name: 'Mike Chen', email: 'mike@email.com' },
    date: '2026-05-08',
    items: 5,
    total: 549.50,
    payment: 'paid',
    fulfillment: 'shipped',
    tracking: '1Z999AA10123456784',
    shippingAddress: { line1: '789 Pine Rd', city: 'Chicago', state: 'IL', zip: '60601', country: 'USA' },
    billingAddress: { line1: '789 Pine Rd', city: 'Chicago', state: 'IL', zip: '60601', country: 'USA' },
    note: '',
    itemsList: [
      { name: 'Yoga Mat Premium', qty: 2, price: 49.99 },
      { name: 'Water Bottle', qty: 3, price: 29.99 },
    ]
  },
  { 
    id: 'ORD-004', 
    customer: { name: 'Emily Brown', email: 'emily@email.com' },
    date: '2026-05-07',
    items: 2,
    total: 179.98,
    payment: 'pending',
    fulfillment: 'pending',
    shippingAddress: { line1: '321 Elm St', city: 'Houston', state: 'TX', zip: '77001', country: 'USA' },
    billingAddress: { line1: '321 Elm St', city: 'Houston', state: 'TX', zip: '77001', country: 'USA' },
    note: 'Call before delivery',
    itemsList: [
      { name: 'Running Shoes', qty: 1, price: 99.99 },
      { name: 'Sports Socks', qty: 1, price: 14.99 },
    ]
  },
  { 
    id: 'ORD-005', 
    customer: { name: 'David Lee', email: 'david@email.com' },
    date: '2026-05-06',
    items: 1,
    total: 299.99,
    payment: 'paid',
    fulfillment: 'delivered',
    shippingAddress: { line1: '555 Market St', city: 'San Francisco', state: 'CA', zip: '94102', country: 'USA' },
    billingAddress: { line1: '555 Market St', city: 'San Francisco', state: 'CA', zip: '94102', country: 'USA' },
    note: '',
    itemsList: [
      { name: 'Laptop Stand', qty: 1, price: 299.99 },
    ]
  },
  { 
    id: 'ORD-006', 
    customer: { name: 'Lisa Wang', email: 'lisa@email.com' },
    date: '2026-05-05',
    items: 4,
    total: 199.96,
    payment: 'refunded',
    fulfillment: 'cancelled',
    shippingAddress: { line1: '777 Broadway', city: 'Seattle', state: 'WA', zip: '98101', country: 'USA' },
    billingAddress: { line1: '777 Broadway', city: 'Seattle', state: 'WA', zip: '98101', country: 'USA' },
    note: 'Customer requested cancellation',
    itemsList: [
      { name: 'Phone Case', qty: 2, price: 24.99 },
      { name: 'Screen Protector', qty: 2, price: 19.99 },
    ]
  },
]

const filterTabs = ['All', 'Pending', 'Processing', 'Shipped', 'Completed', 'Refunded', 'Cancelled']

const paymentColors = {
  paid: 'bg-status-success/10 text-status-success',
  pending: 'bg-status-warning/10 text-status-warning',
  failed: 'bg-status-danger/10 text-status-danger',
  refunded: 'bg-gray-100 text-gray-500',
}

const fulfillmentColors = {
  pending: 'bg-status-warning/10 text-status-warning',
  processing: 'bg-status-info/10 text-status-info',
  shipped: 'bg-brand-indigo/10 text-brand-indigo',
  delivered: 'bg-status-success/10 text-status-success',
  cancelled: 'bg-status-danger/10 text-status-danger',
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null)
  const [expandedOrders, setExpandedOrders] = useState<string[]>([])
  const [trackingInput, setTrackingInput] = useState('')

  const filteredOrders = mockOrders.filter(order => {
    const matchesTab = activeTab === 'All' ||
      (activeTab === 'Pending' && order.payment === 'pending' && order.fulfillment === 'pending') ||
      (activeTab === 'Processing' && order.fulfillment === 'processing') ||
      (activeTab === 'Shipped' && order.fulfillment === 'shipped') ||
      (activeTab === 'Completed' && order.fulfillment === 'delivered') ||
      (activeTab === 'Refunded' && order.payment === 'refunded') ||
      (activeTab === 'Cancelled' && order.fulfillment === 'cancelled')
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const toggleOrderExpand = (id: string) => {
    setExpandedOrders(prev => 
      prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]
    )
  }

  const newOrdersToday = mockOrders.filter(o => o.date === '2026-05-10').length
  const pendingFulfillment = mockOrders.filter(o => o.fulfillment === 'pending' || o.fulfillment === 'processing').length
  const totalRevenue = mockOrders.filter(o => o.payment === 'paid').reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">New Orders Today</p>
                <p className="text-2xl font-bold mt-1">{newOrdersToday}</p>
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
                <p className="text-2xl font-bold mt-1">{pendingFulfillment}</p>
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
                <p className="text-sm text-text-secondary">Total Revenue This Month</p>
                <p className="text-2xl font-bold mt-1 text-status-success">{formatCurrency(totalRevenue)}</p>
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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input type="date" className="px-3 py-2 rounded-md border border-card-border text-sm" />
            <span className="text-text-muted">to</span>
            <input type="date" className="px-3 py-2 rounded-md border border-card-border text-sm" />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input 
              placeholder="Search order # or customer" 
              className="w-64 pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="border border-card-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-card-border">
            <tr>
              <th className="p-3 text-left"></th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Order #</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Customer</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Date</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Items</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Total</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Payment</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Fulfillment</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <>
                <tr key={order.id} className="border-b border-card-border hover:bg-gray-50">
                  <td className="p-3">
                    <button onClick={() => toggleOrderExpand(order.id)} className="p-1 hover:bg-gray-100 rounded">
                      {expandedOrders.includes(order.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="p-3">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="text-sm font-bold text-brand-indigo hover:underline"
                    >
                      {order.id}
                    </button>
                  </td>
                  <td className="p-3">
                    <div>
                      <p className="text-sm font-medium">{order.customer.name}</p>
                      <p className="text-xs text-text-muted">{order.customer.email}</p>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-text-secondary">{formatDate(order.date)}</td>
                  <td className="p-3 text-sm text-text-secondary">{order.items}</td>
                  <td className="p-3 text-sm font-bold">{formatCurrency(order.total)}</td>
                  <td className="p-3">
                    <span className={cn('px-2 py-1 text-xs font-medium rounded-full', paymentColors[order.payment as keyof typeof paymentColors])}>
                      {order.payment.charAt(0).toUpperCase() + order.payment.slice(1)}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={cn('px-2 py-1 text-xs font-medium rounded-full', fulfillmentColors[order.fulfillment as keyof typeof fulfillmentColors])}>
                      {order.fulfillment.charAt(0).toUpperCase() + order.fulfillment.slice(1)}
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
                  <tr key={`${order.id}-details`} className="border-b border-card-border bg-gray-50">
                    <td colSpan={9} className="p-4">
                      <div className="flex gap-8">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium mb-2">Order Items</h4>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-text-muted text-xs">
                                <th className="text-left pb-2">Product</th>
                                <th className="text-left pb-2">Qty</th>
                                <th className="text-left pb-2">Price</th>
                                <th className="text-right pb-2">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.itemsList.map((item, i) => (
                                <tr key={i}>
                                  <td className="py-1">{item.name}</td>
                                  <td className="py-1">{item.qty}</td>
                                  <td className="py-1">{formatCurrency(item.price)}</td>
                                  <td className="py-1 text-right">{formatCurrency(item.price * item.qty)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className="mt-3 space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Subtotal</span>
                              <span>{formatCurrency(order.total)}</span>
                            </div>
                            <div className="flex justify-between text-status-success">
                              <span>Discount</span>
                              <span>-$0.00</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Shipping</span>
                              <span>Free</span>
                            </div>
                            <div className="flex justify-between font-bold pt-2 border-t">
                              <span>Total</span>
                              <span>{formatCurrency(order.total)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="w-64 space-y-4">
                          {order.note && (
                            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                              <p className="text-xs text-yellow-800 font-medium">Customer Note</p>
                              <p className="text-sm mt-1">{order.note}</p>
                            </div>
                          )}
                          <div className="p-3 bg-white rounded-lg border border-card-border">
                            <p className="text-xs text-text-muted mb-2">Customer</p>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-brand-indigo/10 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-brand-indigo" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{order.customer.name}</p>
                                <p className="text-xs text-text-muted">{order.customer.email}</p>
                              </div>
                              <button className="ml-auto p-1 hover:bg-gray-100 rounded">
                                <Mail className="w-4 h-4 text-text-muted" />
                              </button>
                            </div>
                          </div>
                          <div className="p-3 bg-white rounded-lg border border-card-border">
                            <p className="text-xs text-text-muted mb-2">Shipping Address</p>
                            <p className="text-sm">{order.shippingAddress.line1}</p>
                            <p className="text-sm">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                            <p className="text-sm">{order.shippingAddress.country}</p>
                          </div>
                          <div className="p-3 bg-white rounded-lg border border-card-border">
                            <p className="text-xs text-text-muted mb-2">Payment Info</p>
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-text-muted" />
                              <span className="text-sm">Visa ending in 4242</span>
                            </div>
                            {order.tracking && (
                              <div className="mt-2">
                                <p className="text-xs text-text-muted">Tracking</p>
                                <p className="text-sm font-mono">{order.tracking}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">Print invoice</Button>
                            <Button variant="danger" size="sm" className="flex-1">Issue refund</Button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Showing {filteredOrders.length} of {mockOrders.length} orders</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-y-0 right-0 w-[600px] bg-white shadow-modal border-l border-card-border z-50 animate-slide-in overflow-y-auto">
          <div className="p-5 border-b border-card-border flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{selectedOrder.id}</h3>
              <p className="text-sm text-text-muted">{formatDate(selectedOrder.date)}</p>
            </div>
            <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5 space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-3">Order Items</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-text-muted text-xs">
                    <th className="text-left pb-2">Product</th>
                    <th className="text-left pb-2">Qty</th>
                    <th className="text-right pb-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.itemsList.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2">{item.name}</td>
                      <td className="py-2">{item.qty}</td>
                      <td className="py-2 text-right">{formatCurrency(item.price * item.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 space-y-2 text-sm border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Subtotal</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {selectedOrder.note && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <p className="text-xs text-yellow-800 font-medium">Customer Note</p>
                <p className="text-sm mt-1">{selectedOrder.note}</p>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium mb-3">Customer Information</h4>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-brand-indigo/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-brand-indigo" />
                </div>
                <div>
                  <p className="font-medium">{selectedOrder.customer.name}</p>
                  <p className="text-sm text-text-muted">{selectedOrder.customer.email}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Shipping Address</h4>
                <p className="text-sm">{selectedOrder.shippingAddress.line1}</p>
                <p className="text-sm">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}</p>
                <p className="text-sm">{selectedOrder.shippingAddress.country}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Billing Address</h4>
                <p className="text-sm">{selectedOrder.billingAddress.line1}</p>
                <p className="text-sm">{selectedOrder.billingAddress.city}, {selectedOrder.billingAddress.state} {selectedOrder.billingAddress.zip}</p>
                <p className="text-sm">{selectedOrder.billingAddress.country}</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Payment</h4>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm">Visa ending in 4242</span>
                <span className={cn('ml-auto px-2 py-0.5 text-xs rounded-full', paymentColors[selectedOrder.payment as keyof typeof paymentColors])}>
                  {selectedOrder.payment}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input 
                  placeholder="Enter tracking number"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                />
                <select className="w-32 h-10 px-3 rounded-md border border-card-border bg-white text-sm">
                  <option>UPS</option>
                  <option>FedEx</option>
                  <option>USPS</option>
                </select>
              </div>
              <Button className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                Send tracking email
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Print invoice
              </Button>
              <Button variant="danger" className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Issue refund
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}