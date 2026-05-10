'use client'

import { CreditCard } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1">Billing & Plans</h1>
        <p className="text-sm text-text-secondary mt-1">Manage client subscriptions and billing</p>
      </div>
      <Card className="p-12 text-center">
        <CreditCard className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <h2 className="text-h3 mb-2">No billing data yet</h2>
        <p className="text-text-muted text-sm">Client billing and plan information will appear here.</p>
      </Card>
    </div>
  )
}
