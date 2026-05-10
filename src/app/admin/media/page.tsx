'use client'

import { Image } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function AllMediaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1">All Media</h1>
        <p className="text-sm text-text-secondary mt-1">View media files uploaded across all client sites</p>
      </div>
      <Card className="p-12 text-center">
        <Image className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <h2 className="text-h3 mb-2">No media files yet</h2>
        <p className="text-text-muted text-sm">Media uploaded by clients will appear here.</p>
      </Card>
    </div>
  )
}
