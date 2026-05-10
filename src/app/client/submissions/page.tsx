'use client'

import { useState } from 'react'
import {
  Search,
  Download,
  Eye,
  Mail,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Filter,
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'

const mockSubmissions = [
  { 
    id: '1', 
    form: 'Contact Us Form',
    date: '2026-05-10 14:32',
    name: 'John Smith',
    email: 'john@email.com',
    preview: 'Hi, I am interested in your products and would like to know more about...',
    status: 'new',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    page: '/contact',
    fields: [
      { label: 'Name', value: 'John Smith' },
      { label: 'Email', value: 'john@email.com' },
      { label: 'Phone', value: '+1 (555) 123-4567' },
      { label: 'Message', value: 'Hi, I am interested in your products and would like to know more about your pricing options. Could you please send me a quote for 50 units of your wireless headphones?' },
      { label: 'Interest', value: 'Wireless Headphones' },
    ]
  },
  { 
    id: '2', 
    form: 'Newsletter Signup',
    date: '2026-05-10 12:15',
    name: 'Sarah Johnson',
    email: 'sarah@email.com',
    preview: 'I would like to subscribe to your newsletter...',
    status: 'read',
    ip: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
    page: '/',
    fields: [
      { label: 'Email', value: 'sarah@email.com' },
      { label: 'Interests', value: 'New Products, Promotions, Blog Updates' },
      { label: 'Consent', value: 'Yes, I agree to receive emails' },
    ]
  },
  { 
    id: '3', 
    form: 'Quote Request',
    date: '2026-05-09 09:45',
    name: 'Mike Chen',
    email: 'mike@company.com',
    preview: 'We are looking for a bulk order of your smart watch...',
    status: 'replied',
    ip: '10.0.0.50',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    page: '/quote',
    fields: [
      { label: 'Name', value: 'Mike Chen' },
      { label: 'Email', value: 'mike@company.com' },
      { label: 'Company', value: 'Tech Solutions Inc' },
      { label: 'Phone', value: '+1 (555) 987-6543' },
      { label: 'Product Interest', value: 'Smart Watch Pro' },
      { label: 'Quantity', value: '100' },
      { label: 'Message', value: 'We are looking for a bulk order of your smart watch products for our corporate gift program. Could you provide a quote for 100 units?' },
    ]
  },
  { 
    id: '4', 
    form: 'Contact Us Form',
    date: '2026-05-08 16:20',
    name: 'Emily Brown',
    email: 'emily@email.com',
    preview: 'I have a question about my recent order...',
    status: 'spam',
    ip: '192.168.1.102',
    userAgent: 'Mozilla/5.0',
    page: '/contact',
    fields: [
      { label: 'Name', value: 'Emily Brown' },
      { label: 'Email', value: 'emily@email.com' },
      { label: 'Message', value: 'Click here for free prizes: http://suspicious-link.com' },
    ]
  },
  { 
    id: '5', 
    form: 'Support Request',
    date: '2026-05-08 11:10',
    name: 'David Lee',
    email: 'david@email.com',
    preview: 'I need help with setting up my account...',
    status: 'new',
    ip: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Linux; Android 11)',
    page: '/support',
    fields: [
      { label: 'Name', value: 'David Lee' },
      { label: 'Email', value: 'david@email.com' },
      { label: 'Subject', value: 'Account setup help' },
      { label: 'Message', value: 'I need help with setting up my account. I tried following the instructions but got stuck at the verification step.' },
      { label: 'Priority', value: 'Medium' },
    ]
  },
  { 
    id: '6', 
    form: 'Event Registration',
    date: '2026-05-07 14:55',
    name: 'Lisa Wang',
    email: 'lisa@email.com',
    preview: 'I would like to register for the upcoming webinar...',
    status: 'read',
    ip: '192.168.1.104',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    page: '/events/webinar-2026',
    fields: [
      { label: 'Name', value: 'Lisa Wang' },
      { label: 'Email', value: 'lisa@email.com' },
      { label: 'Company', value: 'Freelance' },
      { label: 'Event', value: 'Tech Webinar 2026' },
      { label: 'Attendees', value: '1' },
    ]
  },
]

const filterTabs = ['All', 'Unread', 'Read', 'Replied', 'Spam']

const statusColors = {
  new: 'bg-brand-indigo/10 text-brand-indigo',
  read: 'bg-gray-100 text-gray-600',
  replied: 'bg-status-success/10 text-status-success',
  spam: 'bg-status-danger/10 text-status-danger',
}

export default function SubmissionsPage() {
  const [activeTab, setActiveTab] = useState('All')
  const [selectedForm, setSelectedForm] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubmission, setSelectedSubmission] = useState<typeof mockSubmissions[0] | null>(null)

  const filteredSubmissions = mockSubmissions.filter(sub => {
    const matchesTab = activeTab === 'All' ||
      (activeTab === 'Unread' && sub.status === 'new') ||
      (activeTab === 'Read' && sub.status === 'read') ||
      (activeTab === 'Replied' && sub.status === 'replied') ||
      (activeTab === 'Spam' && sub.status === 'spam')
    const matchesForm = selectedForm === 'all' || sub.form === selectedForm
    const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesForm && matchesSearch
  })

  const viewSubmission = (sub: typeof mockSubmissions[0]) => {
    setSelectedSubmission(sub)
  }

  const [deletingSubmissionId, setDeletingSubmissionId] = useState<string | null>(null)

  const deleteSubmission = (id: string) => {
    setDeletingSubmissionId(id)
  }

  const confirmDeleteSubmission = () => {
    if (deletingSubmissionId) {
      setDeletingSubmissionId(null)
      if (selectedSubmission?.id === deletingSubmissionId) setSelectedSubmission(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1 bg-page-bg rounded-lg">
          {filterTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-all',
                activeTab === tab 
                  ? 'bg-white text-text-primary shadow-sm' 
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="h-10 px-3 rounded-md border border-card-border bg-white text-sm"
            value={selectedForm}
            onChange={(e) => setSelectedForm(e.target.value)}
          >
            <option value="all">All Forms</option>
            <option value="Contact Us Form">Contact Us Form</option>
            <option value="Newsletter Signup">Newsletter Signup</option>
            <option value="Quote Request">Quote Request</option>
            <option value="Support Request">Support Request</option>
            <option value="Event Registration">Event Registration</option>
          </select>
          <div className="flex items-center gap-2">
            <input type="date" className="px-3 py-2 rounded-md border border-card-border text-sm" />
            <span className="text-text-muted">to</span>
            <input type="date" className="px-3 py-2 rounded-md border border-card-border text-sm" />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input 
              placeholder="Search name or email" 
              className="w-64 pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="border border-card-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-card-border">
            <tr>
              <th className="p-3 text-left w-8">
                <Checkbox />
              </th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Form</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Date</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Name</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Email</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Preview</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Status</th>
              <th className="p-3 text-left text-sm font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.map(sub => (
              <tr key={sub.id} className="border-b border-card-border hover:bg-gray-50">
                <td className="p-3">
                  <Checkbox />
                </td>
                <td className="p-3 text-sm font-medium">{sub.form}</td>
                <td className="p-3 text-sm text-text-secondary">{sub.date}</td>
                <td className="p-3 text-sm">{sub.name}</td>
                <td className="p-3 text-sm text-text-secondary">{sub.email}</td>
                <td className="p-3 text-sm text-text-muted italic max-w-xs truncate">{sub.preview}</td>
                <td className="p-3">
                  <span className={cn('px-2 py-1 text-xs font-medium rounded-full', statusColors[sub.status as keyof typeof statusColors])}>
                    {sub.status === 'new' ? 'New' : sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => viewSubmission(sub)}
                      className="p-1.5 hover:bg-gray-100 rounded"
                    >
                      <Eye className="w-4 h-4 text-text-muted" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 rounded">
                      <Mail className="w-4 h-4 text-text-muted" />
                    </button>
                    <button 
                      onClick={() => deleteSubmission(sub.id)}
                      className="p-1.5 hover:bg-gray-100 rounded text-status-danger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Showing {filteredSubmissions.length} submissions</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[600px] max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="p-5 border-b border-card-border flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{selectedSubmission.form}</h3>
                <p className="text-sm text-text-muted">{selectedSubmission.date}</p>
              </div>
              <button onClick={() => setSelectedSubmission(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-6">
              {selectedSubmission.fields.map((field, i) => (
                <div key={i}>
                  <label className="text-xs text-text-muted uppercase tracking-wider">{field.label}</label>
                  <p className="text-sm mt-1">{field.value}</p>
                </div>
              ))}

              <div className="border-t border-card-border pt-4">
                <p className="text-xs text-text-muted">Submission metadata</p>
                <div className="mt-2 space-y-1 text-xs text-text-muted">
                  <p>IP: {selectedSubmission.ip}</p>
                  <p>User Agent: {selectedSubmission.userAgent}</p>
                  <p>Page: {selectedSubmission.page}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Internal Notes</label>
                <Textarea 
                  placeholder="Add notes about this submission..."
                  className="mt-2 h-24"
                />
              </div>
            </div>

            <div className="p-5 border-t border-card-border flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Mark as spam
                </Button>
                <Button variant="outline" size="sm" className="text-status-danger border-status-danger hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
              <Button onClick={() => setSelectedSubmission(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {deletingSubmissionId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[400px] p-6">
            <h3 className="text-lg font-semibold mb-2">Delete submission?</h3>
            <p className="text-sm text-text-secondary mb-6">This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeletingSubmissionId(null)}>Cancel</Button>
              <Button variant="danger" onClick={confirmDeleteSubmission}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}