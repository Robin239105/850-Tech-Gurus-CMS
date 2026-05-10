'use client'

import { FileText } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function AllFormsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1">All Form Submissions</h1>
        <p className="text-sm text-text-secondary mt-1">View form submissions across all client sites</p>
      </div>
      <Card className="p-12 text-center">
        <FileText className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <h2 className="text-h3 mb-2">No form submissions yet</h2>
        <p className="text-text-muted text-sm">Form submissions from client sites will appear here.</p>
      </Card>
    </div>
  )
}
