'use client'

import { HelpCircle, Mail, MessageSquare, Phone, ExternalLink, Book } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1">Help & Resources</h1>
        <p className="text-sm text-text-secondary mt-1">Get support and find answers</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 text-center">
          <Mail className="w-10 h-10 text-brand-indigo mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Email Support</h3>
          <p className="text-sm text-text-secondary mb-4">Send us an email and we&apos;ll get back to you within 1 business day</p>
          <a href="mailto:support@850techgurus.com">
            <Button variant="outline" className="w-full">
              support@850techgurus.com
            </Button>
          </a>
        </Card>
        <Card className="p-6 text-center">
          <MessageSquare className="w-10 h-10 text-brand-indigo mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Live Chat</h3>
          <p className="text-sm text-text-secondary mb-4">Chat with our support team. Available Mon–Fri, 9am–6pm EST</p>
          <a href="mailto:support@850techgurus.com?subject=Live%20Chat%20Request">
            <Button className="w-full">
              Contact Support
            </Button>
          </a>
        </Card>
        <Card className="p-6 text-center">
          <Phone className="w-10 h-10 text-brand-indigo mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Phone Support</h3>
          <p className="text-sm text-text-secondary mb-4">Available Mon–Fri, 9am–6pm EST</p>
          <a href="tel:+18008507324">
            <Button variant="outline" className="w-full">
              +1 (800) 850-TECH
            </Button>
          </a>
        </Card>
      </div>
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="w-6 h-6 text-brand-indigo" />
          <h2 className="text-h3">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-4">
          {[
            { q: 'How do I connect my website to the CMS?', a: 'Go to "Connect Website" in the sidebar. You\'ll find a script tag to add to your website and documentation for React/Next.js.' },
            { q: 'How do I add a new page?', a: 'Go to Pages → New Page. You can set the title, slug, content, and SEO metadata.' },
            { q: 'How do I manage products?', a: 'Go to Products in the sidebar. You can add, edit, delete, and set inventory/pricing there.' },
            { q: 'How do I view form submissions?', a: 'Go to Submissions in the sidebar. You can filter by status (new, read, replied, spam).' },
            { q: 'How do I reset my password?', a: 'Go to Profile in the sidebar → Security tab → Change Password section.' },
            { q: 'How do I manage bookings?', a: 'Go to Bookings in the sidebar. You have both a calendar view and a list view to manage appointments.' },
          ].map((faq) => (
            <div key={faq.q} className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-text-primary">{faq.q}</p>
              <p className="text-sm text-text-secondary mt-1">{faq.a}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
