'use client'

import { Shield } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function PermissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1">Permissions & Roles</h1>
        <p className="text-sm text-text-secondary mt-1">Manage admin roles and access permissions</p>
      </div>
      <Card className="p-12 text-center">
        <Shield className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <h2 className="text-h3 mb-2">Role management coming soon</h2>
        <p className="text-text-muted text-sm">Configure admin roles and permissions here.</p>
      </Card>
    </div>
  )
}
