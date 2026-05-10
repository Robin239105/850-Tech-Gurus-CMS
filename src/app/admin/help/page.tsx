'use client'

import { HelpCircle, Mail, MessageSquare, Phone } from 'lucide-react'
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
          <p className="text-sm text-text-secondary mb-4">Send us an email and we&apos;ll get back to you</p>
          <Button variant="outline" className="w-full">support@850techgurus.com</Button>
        </Card>
        <Card className="p-6 text-center">
          <MessageSquare className="w-10 h-10 text-brand-indigo mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Live Chat</h3>
          <p className="text-sm text-text-secondary mb-4">Chat with our support team in real time</p>
          <Button className="w-full">Start Chat</Button>
        </Card>
        <Card className="p-6 text-center">
          <Phone className="w-10 h-10 text-brand-indigo mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Phone Support</h3>
          <p className="text-sm text-text-secondary mb-4">Available Mon–Fri, 9am–6pm EST</p>
          <Button variant="outline" className="w-full">+1 (800) 850-TECH</Button>
        </Card>
      </div>
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="w-6 h-6 text-brand-indigo" />
          <h2 className="text-h3">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-4">
          {[
            { q: 'How do I add a new client?', a: 'Go to Clients → Add New Client and fill in the form.' },
            { q: 'How do I run the database migration?', a: 'POST to /api/admin/migrate while logged in as admin.' },
            { q: 'How do I reset a client password?', a: 'Go to the client detail page and use the Settings tab.' },
            { q: 'How do I change platform settings?', a: 'Go to Platform → Platform Settings and click Save Changes.' },
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
