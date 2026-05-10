'use client'

import { useState, useEffect } from 'react'
import { Search, Eye, Mail, Trash2, X, AlertTriangle } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type SubmissionField = { label: string; value: string }

type Submission = {
  id: string
  form_name: string | null
  submitted_at: string
  name: string | null
  email: string | null
  message: string | null
  status: string
  ip_address: string | null
  user_agent: string | null
  page_url: string | null
  fields: SubmissionField[] | null
}

const filterTabs = ['All', 'Unread', 'Read', 'Replied', 'Spam']

const statusColors: Record<string, string> = {
  new: 'bg-brand-indigo/10 text-brand-indigo',
  read: 'bg-gray-100 text-gray-600',
  replied: 'bg-status-success/10 text-status-success',
  spam: 'bg-status-danger/10 text-status-danger',
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/client/submissions')
      .then(r => r.ok ? r.json() : [])
      .then(setSubmissions)
      .finally(() => setLoading(false))
  }, [])

  const filteredSubmissions = submissions.filter(sub => {
    const matchesTab = activeTab === 'All' ||
      (activeTab === 'Unread' && sub.status === 'new') ||
      (activeTab === 'Read' && sub.status === 'read') ||
      (activeTab === 'Replied' && sub.status === 'replied') ||
      (activeTab === 'Spam' && sub.status === 'spam')
    const matchesSearch =
      (sub.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.email ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const handleUpdateStatus = async (id: string, status: string) => {
    await fetch('/api/client/submissions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    if (selectedSubmission?.id === id) setSelectedSubmission(prev => prev ? { ...prev, status } : null)
  }

  const confirmDelete = async () => {
    if (!deletingId) return
    await fetch('/api/client/submissions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deletingId }),
    })
    setSubmissions(prev => prev.filter(s => s.id !== deletingId))
    if (selectedSubmission?.id === deletingId) setSelectedSubmission(null)
    setDeletingId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Form Submissions</h1>
          <p className="text-text-secondary mt-1">View and manage form submissions from your website</p>
        </div>
      </div>

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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            placeholder="Search name or email"
            className="w-64 pl-10"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border border-card-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-card-border">
            <tr>
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
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-text-muted">Loading…</td>
              </tr>
            ) : filteredSubmissions.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-text-muted">
                  {submissions.length === 0
                    ? 'No form submissions yet. They will appear here once visitors submit forms on your website.'
                    : 'No submissions match this filter.'}
                </td>
              </tr>
            ) : filteredSubmissions.map(sub => (
              <tr key={sub.id} className={cn('border-b border-card-border hover:bg-gray-50', sub.status === 'new' && 'bg-brand-indigo/5')}>
                <td className="p-3 text-sm font-medium">{sub.form_name ?? 'Unnamed Form'}</td>
                <td className="p-3 text-sm text-text-secondary">{formatDate(sub.submitted_at)}</td>
                <td className="p-3 text-sm">{sub.name ?? '—'}</td>
                <td className="p-3 text-sm text-text-secondary">{sub.email ?? '—'}</td>
                <td className="p-3 text-sm text-text-muted italic max-w-xs truncate">
                  {sub.message ?? (sub.fields ? 'View details' : '—')}
                </td>
                <td className="p-3">
                  <span className={cn('px-2 py-1 text-xs font-medium rounded-full', statusColors[sub.status] ?? 'bg-gray-100 text-gray-600')}>
                    {sub.status === 'new' ? 'New' : sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setSelectedSubmission(sub); if (sub.status === 'new') handleUpdateStatus(sub.id, 'read') }}
                      className="p-1.5 hover:bg-gray-100 rounded"
                      title="View"
                    >
                      <Eye className="w-4 h-4 text-text-muted" />
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(sub.id, 'replied')}
                      className="p-1.5 hover:bg-gray-100 rounded"
                      title="Mark replied"
                    >
                      <Mail className="w-4 h-4 text-text-muted" />
                    </button>
                    <button
                      onClick={() => setDeletingId(sub.id)}
                      className="p-1.5 hover:bg-gray-100 rounded text-status-danger"
                      title="Delete"
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

      <p className="text-sm text-text-muted">
        Showing {filteredSubmissions.length} of {submissions.length} submissions
      </p>

      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[600px] max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-card-border flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{selectedSubmission.form_name ?? 'Submission'}</h3>
                <p className="text-sm text-text-muted">{formatDate(selectedSubmission.submitted_at)}</p>
              </div>
              <button onClick={() => setSelectedSubmission(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {selectedSubmission.name && (
                <div>
                  <label className="text-xs text-text-muted uppercase tracking-wider">Name</label>
                  <p className="text-sm mt-1">{selectedSubmission.name}</p>
                </div>
              )}
              {selectedSubmission.email && (
                <div>
                  <label className="text-xs text-text-muted uppercase tracking-wider">Email</label>
                  <p className="text-sm mt-1">{selectedSubmission.email}</p>
                </div>
              )}
              {selectedSubmission.message && (
                <div>
                  <label className="text-xs text-text-muted uppercase tracking-wider">Message</label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedSubmission.message}</p>
                </div>
              )}
              {(selectedSubmission.fields ?? []).map((field, i) => (
                <div key={i}>
                  <label className="text-xs text-text-muted uppercase tracking-wider">{field.label}</label>
                  <p className="text-sm mt-1">{field.value}</p>
                </div>
              ))}
              {(selectedSubmission.ip_address || selectedSubmission.page_url) && (
                <div className="border-t border-card-border pt-4">
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Metadata</p>
                  <div className="space-y-1 text-xs text-text-muted">
                    {selectedSubmission.ip_address && <p>IP: {selectedSubmission.ip_address}</p>}
                    {selectedSubmission.page_url && <p>Page: {selectedSubmission.page_url}</p>}
                    {selectedSubmission.user_agent && <p className="truncate">Agent: {selectedSubmission.user_agent}</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-card-border flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedSubmission.id, 'spam')}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Mark as spam
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-status-danger border-status-danger hover:bg-red-50"
                  onClick={() => { setDeletingId(selectedSubmission.id); setSelectedSubmission(null) }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
              <Button onClick={() => setSelectedSubmission(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[400px] p-6">
            <h3 className="text-lg font-semibold mb-2">Delete submission?</h3>
            <p className="text-sm text-text-secondary mb-6">This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
              <Button variant="danger" onClick={confirmDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
