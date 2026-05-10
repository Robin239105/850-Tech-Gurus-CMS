'use client'

import { useState } from 'react'
import {
  Search,
  Eye,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  DollarSign,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

const mockCustomers = [
  { 
    id: '1', 
    name: 'John Smith', 
    email: 'john@email.com',
    phone: '+1 (555) 123-4567',
    avatar: 'JS',
    location: { city: 'New York', country: 'USA' },
    orders: 12,
    totalSpent: 2847.50,
    joinedAt: '2025-03-15',
    lastOrder: '2026-05-10',
    notes: 'Preferred customer, always orders during sales',
    addresses: [
      { type: 'shipping', line1: '123 Main St', city: 'New York', state: 'NY', zip: '10001' },
      { type: 'billing', line1: '123 Main St', city: 'New York', state: 'NY', zip: '10001' },
    ],
    orderHistory: [
      { id: 'ORD-001', date: '2026-05-10', total: 299.99, status: 'delivered' },
      { id: 'ORD-007', date: '2026-04-28', total: 149.99, status: 'delivered' },
      { id: 'ORD-012', date: '2026-03-15', total: 89.99, status: 'delivered' },
    ]
  },
  { 
    id: '2', 
    name: 'Sarah Johnson', 
    email: 'sarah@email.com',
    phone: '+1 (555) 234-5678',
    avatar: 'SJ',
    location: { city: 'Los Angeles', country: 'USA' },
    orders: 5,
    totalSpent: 1249.95,
    joinedAt: '2025-06-20',
    lastOrder: '2026-05-09',
    notes: '',
    addresses: [
      { type: 'shipping', line1: '456 Oak Ave', city: 'Los Angeles', state: 'CA', zip: '90001' },
    ],
    orderHistory: [
      { id: 'ORD-002', date: '2026-05-09', total: 89.99, status: 'processing' },
      { id: 'ORD-009', date: '2026-04-10', total: 459.99, status: 'delivered' },
    ]
  },
  { 
    id: '3', 
    name: 'Mike Chen', 
    email: 'mike@email.com',
    phone: '+1 (555) 345-6789',
    avatar: 'MC',
    location: { city: 'Chicago', country: 'USA' },
    orders: 8,
    totalSpent: 1923.45,
    joinedAt: '2025-01-10',
    lastOrder: '2026-05-08',
    notes: 'Business customer, orders in bulk',
    addresses: [
      { type: 'shipping', line1: '789 Pine Rd', city: 'Chicago', state: 'IL', zip: '60601' },
      { type: 'billing', line1: '789 Pine Rd', city: 'Chicago', state: 'IL', zip: '60601' },
    ],
    orderHistory: [
      { id: 'ORD-003', date: '2026-05-08', total: 549.50, status: 'shipped' },
      { id: 'ORD-005', date: '2026-03-22', total: 299.99, status: 'delivered' },
    ]
  },
  { 
    id: '4', 
    name: 'Emily Brown', 
    email: 'emily@email.com',
    phone: '+1 (555) 456-7890',
    avatar: 'EB',
    location: { city: 'Houston', country: 'USA' },
    orders: 3,
    totalSpent: 567.97,
    joinedAt: '2025-09-05',
    lastOrder: '2026-05-07',
    notes: '',
    addresses: [
      { type: 'shipping', line1: '321 Elm St', city: 'Houston', state: 'TX', zip: '77001' },
    ],
    orderHistory: [
      { id: 'ORD-004', date: '2026-05-07', total: 179.98, status: 'pending' },
    ]
  },
  { 
    id: '5', 
    name: 'David Lee', 
    email: 'david@email.com',
    phone: '+1 (555) 567-8901',
    avatar: 'DL',
    location: { city: 'San Francisco', country: 'USA' },
    orders: 15,
    totalSpent: 4892.30,
    joinedAt: '2024-11-20',
    lastOrder: '2026-05-06',
    notes: 'VIP customer, priority shipping',
    addresses: [
      { type: 'shipping', line1: '555 Market St', city: 'San Francisco', state: 'CA', zip: '94102' },
      { type: 'billing', line1: '555 Market St', city: 'San Francisco', state: 'CA', zip: '94102' },
    ],
    orderHistory: [
      { id: 'ORD-005', date: '2026-05-06', total: 299.99, status: 'delivered' },
      { id: 'ORD-011', date: '2026-04-15', total: 899.99, status: 'delivered' },
    ]
  },
  { 
    id: '6', 
    name: 'Lisa Wang', 
    email: 'lisa@email.com',
    phone: '+1 (555) 678-9012',
    avatar: 'LW',
    location: { city: 'Seattle', country: 'USA' },
    orders: 2,
    totalSpent: 399.98,
    joinedAt: '2026-01-15',
    lastOrder: '2026-05-05',
    notes: 'New customer',
    addresses: [
      { type: 'shipping', line1: '777 Broadway', city: 'Seattle', state: 'WA', zip: '98101' },
    ],
    orderHistory: [
      { id: 'ORD-006', date: '2026-05-05', total: 199.96, status: 'cancelled' },
    ]
  },
]

const statusColors = {
  pending: 'bg-status-warning/10 text-status-warning',
  processing: 'bg-status-info/10 text-status-info',
  shipped: 'bg-brand-indigo/10 text-brand-indigo',
  delivered: 'bg-status-success/10 text-status-success',
  cancelled: 'bg-status-danger/10 text-status-danger',
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<typeof mockCustomers[0] | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const filteredCustomers = mockCustomers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalCustomers = mockCustomers.length
  const newThisMonth = mockCustomers.filter(c => new Date(c.joinedAt) > new Date('2026-04-01')).length
  const repeatCustomers = mockCustomers.filter(c => c.orders > 1).length
  const avgOrderValue = mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / mockCustomers.reduce((sum, c) => sum + c.orders, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total customers</p>
                <p className="text-2xl font-bold mt-1">{totalCustomers}</p>
              </div>
              <div className="p-3 bg-brand-indigo/10 rounded-full">
                <User className="w-5 h-5 text-brand-indigo" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">New This Month</p>
                <p className="text-2xl font-bold mt-1">{newThisMonth}</p>
              </div>
              <div className="p-3 bg-status-success/10 rounded-full">
                <User className="w-5 h-5 text-status-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Repeat Customers</p>
                <p className="text-2xl font-bold mt-1">{repeatCustomers}</p>
              </div>
              <div className="p-3 bg-brand-cyan/10 rounded-full">
                <ShoppingBag className="w-5 h-5 text-brand-cyan" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Avg Order Value</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(avgOrderValue)}</p>
              </div>
              <div className="p-3 bg-status-warning/10 rounded-full">
                <DollarSign className="w-5 h-5 text-status-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input 
            placeholder="Search customers..." 
            className="w-64 pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <select className="h-10 px-3 rounded-md border border-card-border bg-white text-sm">
            <option>All locations</option>
            <option>New York</option>
            <option>Los Angeles</option>
            <option>Chicago</option>
          </select>
          <select className="h-10 px-3 rounded-md border border-card-border bg-white text-sm">
            <option>Newest first</option>
            <option>Most orders</option>
            <option>Highest spend</option>
          </select>
        </div>
      </div>

      <div className="border border-card-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-card-border">
            <tr>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Customer</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Phone</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Location</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Orders</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Total spent</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Joined</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => (
              <tr key={customer.id} className="border-b border-card-border hover:bg-gray-50">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-indigo rounded-full flex items-center justify-center text-white font-medium">
                      {customer.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{customer.name}</p>
                      <p className="text-xs text-text-muted">{customer.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-sm text-text-secondary">{customer.phone}</td>
                <td className="p-3 text-sm text-text-secondary">{customer.location.city}, {customer.location.country}</td>
                <td className="p-3 text-sm">{customer.orders}</td>
                <td className="p-3 text-sm font-medium">{formatCurrency(customer.totalSpent)}</td>
                <td className="p-3 text-sm text-text-secondary">{formatDate(customer.joinedAt)}</td>
                <td className="p-3">
                  <button 
                    onClick={() => setSelectedCustomer(customer)}
                    className="p-1.5 hover:bg-gray-100 rounded"
                  >
                    <Eye className="w-4 h-4 text-text-muted" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Showing {filteredCustomers.length} customers</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm">Page 1 of 1</span>
          <Button variant="outline" size="sm">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {selectedCustomer && (
        <div className="fixed inset-y-0 right-0 w-[500px] bg-white shadow-modal border-l border-card-border z-50 animate-slide-in overflow-y-auto">
          <div className="p-5 border-b border-card-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-indigo rounded-full flex items-center justify-center text-white font-bold text-lg">
                {selectedCustomer.avatar}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{selectedCustomer.name}</h3>
                <p className="text-sm text-text-muted">{selectedCustomer.email}</p>
              </div>
            </div>
            <button onClick={() => setSelectedCustomer(null)} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 border-b border-card-border">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-text-muted">Orders</p>
                <p className="text-xl font-bold">{selectedCustomer.orders}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Total Spent</p>
                <p className="text-xl font-bold">{formatCurrency(selectedCustomer.totalSpent)}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">First Order</p>
                <p className="text-xl font-bold">{formatDate(selectedCustomer.joinedAt)}</p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="flex gap-1 mb-4 p-1 bg-page-bg rounded-lg">
              <button
                onClick={() => setActiveTab('overview')}
                className={cn(
                  'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all',
                  activeTab === 'overview' ? 'bg-white shadow-sm' : 'text-text-secondary'
                )}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={cn(
                  'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all',
                  activeTab === 'orders' ? 'bg-white shadow-sm' : 'text-text-secondary'
                )}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={cn(
                  'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all',
                  activeTab === 'addresses' ? 'bg-white shadow-sm' : 'text-text-secondary'
                )}
              >
                Addresses
              </button>
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="w-4 h-4 text-text-muted" />
                    <span className="text-sm">{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-text-muted" />
                    <span className="text-sm">{selectedCustomer.phone}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Internal Notes</h4>
                  <textarea 
                    className="w-full p-3 rounded-md border border-card-border text-sm h-24 resize-none"
                    placeholder="Add notes about this customer..."
                    defaultValue={selectedCustomer.notes}
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Recent Orders</h4>
                  <div className="space-y-2">
                    {selectedCustomer.orderHistory.map(order => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{order.id}</p>
                          <p className="text-xs text-text-muted">{formatDate(order.date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatCurrency(order.total)}</p>
                          <span className={cn('text-xs px-2 py-0.5 rounded-full', statusColors[order.status as keyof typeof statusColors])}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-2">
                {selectedCustomer.orderHistory.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{order.id}</p>
                      <p className="text-xs text-text-muted">{formatDate(order.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(order.total)}</p>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', statusColors[order.status as keyof typeof statusColors])}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="space-y-3">
                {selectedCustomer.addresses.map((addr, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="gray" className="text-xs capitalize">{addr.type}</Badge>
                    </div>
                    <p className="text-sm">{addr.line1}</p>
                    <p className="text-sm">{addr.city}, {addr.state} {addr.zip}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}