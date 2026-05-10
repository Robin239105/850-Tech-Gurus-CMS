'use client'

import { BookOpen, ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const docs = [
  { title: 'Getting Started', description: 'Learn how to set up and configure the platform', href: '#' },
  { title: 'Client Management', description: 'How to add, manage and configure client accounts', href: '#' },
  { title: 'API Reference', description: 'Full reference for all available API endpoints', href: '#' },
  { title: 'Billing & Plans', description: 'Understand plans, billing cycles and invoicing', href: '#' },
  { title: 'White Label Setup', description: 'Configure branding and white-label options', href: '#' },
  { title: 'Security & Access', description: 'Admin roles, permissions and 2FA setup', href: '#' },
]

export default function DocsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1">Documentation</h1>
        <p className="text-sm text-text-secondary mt-1">Platform guides and technical reference</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {docs.map((doc) => (
          <Card key={doc.title} className="p-5 hover:shadow-md transition-shadow">
            <BookOpen className="w-8 h-8 text-brand-indigo mb-3" />
            <h3 className="font-semibold text-text-primary mb-1">{doc.title}</h3>
            <p className="text-sm text-text-secondary mb-4">{doc.description}</p>
            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="w-3 h-3 mr-2" />
              Read Guide
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
