'use client'

import { BookOpen, ExternalLink, Code, Users, CreditCard, Shield, Globe, FileText } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const docs = [
  {
    icon: BookOpen,
    title: 'Getting Started',
    description: 'Learn how to set up and configure the platform',
    items: [
      'Run the database migration at /api/admin/migrate (POST)',
      'Set your admin email and password in .env.local',
      'Add your first client from Clients → Add New Client',
    ]
  },
  {
    icon: Users,
    title: 'Client Management',
    description: 'How to add, manage and configure client accounts',
    items: [
      'Go to Clients → Add New Client',
      'Set their plan, website URL, and credentials',
      'They log in at /client with their email & password',
    ]
  },
  {
    icon: Code,
    title: 'Connect Snippet',
    description: 'Wire a client website into the CMS via a JS embed',
    items: [
      'Go to a client → Connect tab to get their API key',
      'Add the script tag to any website (HTML, React, Next.js)',
      'The snippet POSTs form submissions, orders etc. to /api/connect/[key]',
    ]
  },
  {
    icon: Globe,
    title: 'Pages & Content',
    description: 'Creating and publishing content for client sites',
    items: [
      'Clients manage pages, blog posts, and products themselves',
      'Admins can view all pages across clients from Admin → Pages',
      'Pages link to the client\'s configured website base URL',
    ]
  },
  {
    icon: Shield,
    title: 'Security & Access',
    description: 'Admin roles, session management and platform security',
    items: [
      'Admin sessions are cookie-based (admin_session)',
      'Client sessions are base64-encoded JSON (client_session)',
      'Toggle security features from Settings → Security tab',
    ]
  },
]

export default function DocsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1">Documentation</h1>
        <p className="text-sm text-text-secondary mt-1">Platform guides and technical reference</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {docs.map((doc) => {
          const Icon = doc.icon
          return (
            <Card key={doc.title} className="p-5 hover:shadow-md transition-shadow">
              <Icon className="w-8 h-8 text-brand-indigo mb-3" />
              <h3 className="font-semibold text-text-primary mb-1">{doc.title}</h3>
              <p className="text-sm text-text-secondary mb-4">{doc.description}</p>
              <ul className="space-y-2">
                {doc.items.map(item => (
                  <li key={item} className="text-xs text-text-muted flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-brand-indigo mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          )
        })}
      </div>
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-2">
          <Code className="w-5 h-5 text-brand-indigo" />
          <h2 className="font-semibold">API Reference</h2>
        </div>
        <p className="text-sm text-text-secondary mb-4">All admin and client API routes follow a consistent pattern:</p>
        <div className="space-y-2">
          {[
            { method: 'GET', path: '/api/admin/clients', desc: 'List all clients' },
            { method: 'POST', path: '/api/admin/clients', desc: 'Create a new client' },
            { method: 'PATCH', path: '/api/admin/clients/[id]', desc: 'Update a client' },
            { method: 'DELETE', path: '/api/admin/clients/[id]', desc: 'Delete a client' },
            { method: 'GET', path: '/api/client/pages', desc: 'Get client\'s pages (auth required)' },
            { method: 'POST', path: '/api/client/pages', desc: 'Create a page (auth required)' },
            { method: 'GET', path: '/api/connect/[key]/forms', desc: 'Public: receive form submissions' },
            { method: 'POST', path: '/api/admin/migrate', desc: 'Run database migrations' },
          ].map(row => (
            <div key={row.path} className="flex items-center gap-3 py-2 border-b border-card-border last:border-0">
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded flex-shrink-0 ${row.method === 'GET' ? 'bg-brand-indigo/10 text-brand-indigo' : row.method === 'POST' ? 'bg-status-success/10 text-status-success' : row.method === 'PATCH' ? 'bg-status-warning/10 text-status-warning' : 'bg-status-danger/10 text-status-danger'}`}>
                {row.method}
              </span>
              <code className="text-xs font-mono text-text-primary">{row.path}</code>
              <span className="text-xs text-text-muted ml-auto">{row.desc}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
