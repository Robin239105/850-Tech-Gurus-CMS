'use client'

import { ShoppingCart } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function AllOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1">All Orders</h1>
        <p className="text-sm text-text-secondary mt-1">View orders placed across all client stores</p>
      </div>
      <Card className="p-12 text-center">
        <ShoppingCart className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <h2 className="text-h3 mb-2">No orders yet</h2>
        <p className="text-text-muted text-sm">Orders from client stores will appear here.</p>
      </Card>
    </div>
  )
}
