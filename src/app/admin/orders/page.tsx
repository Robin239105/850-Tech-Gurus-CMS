'use client'

import { useState, useEffect, useCallback } from 'react'
import { ShoppingCart, Search, Filter, Loader2, Eye } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'

export default function AllOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders?status=${filter}`)
      if (res.ok) setOrders(await res.json())
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">All Orders</h1>
          <p className="text-sm text-text-secondary mt-1">View orders placed across all client stores</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input placeholder="Search orders..." className="pl-9" />
          </div>
          <select 
            className="h-10 px-3 rounded-md border border-card-border bg-white text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Client Store</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Fulfillment</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-text-muted" /></td></tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 text-text-muted mx-auto mb-4" />
                    <p className="text-text-muted">No orders found</p>
                  </td>
                </tr>
              ) : orders.map((order) => (
                <tr key={order.id}>
                  <td className="font-mono text-xs font-bold">{order.order_number}</td>
                  <td>{order.client_name}</td>
                  <td>
                    <p className="text-sm font-medium">{order.customer_name}</p>
                    <p className="text-xs text-text-muted">{order.customer_email}</p>
                  </td>
                  <td className="font-bold">{formatCurrency(Number(order.total))}</td>
                  <td>
                    <Badge className={order.payment_status === 'paid' ? 'badge-green' : 'badge-amber'}>
                      {order.payment_status}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant="gray">{order.fulfillment_status}</Badge>
                  </td>
                  <td className="text-xs text-text-secondary">{formatRelativeTime(order.created_at)}</td>
                  <td>
                    <Button variant="ghost" size="icon-sm"><Eye className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
