'use client'

import { useState, useEffect } from 'react'
import { Plus, Eye, Edit, Trash2, Code, GripVertical, Settings, X, Check } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

type Form = { id: string; name: string; fields: FormField[]; created_at: string }
type FormField = { id: string; type: string; label: string; required: boolean; placeholder?: string; options?: string[] }

const fieldTypes = [
  { type: 'text', label: 'Text', icon: 'Aa' }, { type: 'email', label: 'Email', icon: '@' },
  { type: 'phone', label: 'Phone', icon: '#' }, { type: 'textarea', label: 'Textarea', icon: '¶' },
  { type: 'select', label: 'Select', icon: '▼' }, { type: 'radio', label: 'Radio', icon: '○' },
  { type: 'checkbox', label: 'Checkboxes', icon: '☑' }, { type: 'date', label: 'Date', icon: '📅' },
  { type: 'file', label: 'File', icon: '📎' }, { type: 'number', label: 'Number', icon: '##' },
]

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingForm, setEditingForm] = useState<Form | null>(null)
  const [formName, setFormName] = useState('')
  const [fields, setFields] = useState<FormField[]>([])
  const [showFieldSettings, setShowFieldSettings] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null)

  const load = () => {
    fetch('/api/client/forms')
      .then(r => r.ok ? r.json() : [])
      .then(setForms)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const createNew = () => {
    setEditingForm(null)
    setFormName('New Form')
    setFields([
      { id: '1', type: 'text', label: 'Name', required: true },
      { id: '2', type: 'email', label: 'Email', required: true },
      { id: '3', type: 'textarea', label: 'Message', required: false },
    ])
    setShowBuilder(true)
  }

  const editForm = (form: Form) => {
    setEditingForm(form)
    setFormName(form.name)
    setFields(Array.isArray(form.fields) ? form.fields : [])
    setShowBuilder(true)
  }

  const addField = (type: string) => {
    setFields(f => [...f, {
      id: `${Date.now()}`, type, label: `New ${type} field`, required: false, placeholder: '',
      options: ['select','radio','checkbox'].includes(type) ? ['Option 1','Option 2','Option 3'] : undefined,
    }])
  }

  const updateField = (id: string, updates: Partial<FormField>) =>
    setFields(fs => fs.map(f => f.id === id ? { ...f, ...updates } : f))

  const handleSave = async () => {
    setSaving(true)
    const payload = { name: formName, fields }
    if (editingForm) {
      await fetch('/api/client/forms', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingForm.id, ...payload }) })
    } else {
      await fetch('/api/client/forms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    }
    setSaving(false)
    setShowBuilder(false)
    load()
  }

  const confirmDeleteForm = async () => {
    if (!deletingFormId) return
    await fetch('/api/client/forms', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: deletingFormId }) })
    setDeletingFormId(null)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contact Forms</h1>
          <p className="text-text-secondary mt-1">Build and manage forms for your website</p>
        </div>
        {!showBuilder && <Button onClick={createNew}><Plus className="w-4 h-4 mr-2" />Create new form</Button>}
      </div>

      {!showBuilder ? (
        loading ? (
          <p className="text-center text-text-muted py-8">Loading…</p>
        ) : forms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-text-muted mb-2">No forms yet</p>
            <p className="text-sm text-text-muted mb-4">Create your first form to start collecting submissions</p>
            <Button onClick={createNew}><Plus className="w-4 h-4 mr-2" />Create new form</Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {forms.map(form => (
              <Card key={form.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg">{form.name}</h3>
                    <Badge className="bg-brand-indigo/10 text-brand-indigo">{Array.isArray(form.fields) ? form.fields.length : 0} fields</Badge>
                  </div>
                  <p className="text-sm text-text-muted mb-4">Created {formatDate(form.created_at)}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => editForm(form)}><Edit className="w-4 h-4 mr-1" />Edit</Button>
                    <button onClick={() => setDeletingFormId(form.id)} className="p-1.5 hover:bg-gray-100 rounded text-status-danger ml-auto"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3 space-y-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setShowBuilder(false)}>← Back</Button>
              <Input value={formName} onChange={e => setFormName(e.target.value)} className="text-xl font-semibold border-0 px-0 focus:ring-0" />
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : editingForm ? 'Update form' : 'Save form'}</Button>
            </div>
            <Card>
              <CardContent className="p-5 space-y-3">
                {fields.map(field => (
                  <div key={field.id} className="flex items-center gap-3 p-4 border border-card-border rounded-lg hover:border-brand-indigo/50">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{field.label}</span>
                        <Badge variant="gray" className="text-xs">{field.type}</Badge>
                        {field.required && <span className="text-status-danger text-xs">*</span>}
                      </div>
                    </div>
                    <button onClick={() => updateField(field.id, { required: !field.required })}
                      className={cn('text-xs px-2 py-1 rounded', field.required ? 'bg-brand-indigo text-white' : 'bg-gray-100 text-text-muted')}>
                      Required
                    </button>
                    <button onClick={() => setShowFieldSettings(field.id)} className="p-1.5 hover:bg-gray-100 rounded">
                      <Settings className="w-4 h-4 text-text-muted" />
                    </button>
                    <button onClick={() => setFields(fs => fs.filter(f => f.id !== field.id))} className="p-1.5 hover:bg-gray-100 rounded text-status-danger">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <Button variant="outline" className="w-full py-8 border-dashed" onClick={() => setShowFieldSettings('add')}>
                  <Plus className="w-4 h-4 mr-2" />Add field
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-2">
            <Card>
              <CardHeader><CardTitle>Field Types</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {fieldTypes.map(ft => (
                    <button key={ft.type} onClick={() => addField(ft.type)}
                      className="flex items-center gap-2 p-3 border border-card-border rounded-lg hover:bg-gray-50 hover:border-brand-indigo text-left">
                      <span className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-sm font-mono">{ft.icon}</span>
                      <span className="text-sm">{ft.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {showFieldSettings && showFieldSettings !== 'add' && (() => {
        const field = fields.find(f => f.id === showFieldSettings)
        if (!field) return null
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-[400px]">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">Field Settings</h3>
                <button onClick={() => setShowFieldSettings(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 space-y-4">
                <div><label className="text-sm font-medium">Label</label><Input value={field.label} onChange={e => updateField(field.id, { label: e.target.value })} className="mt-1.5" /></div>
                <div><label className="text-sm font-medium">Placeholder</label><Input value={field.placeholder || ''} onChange={e => updateField(field.id, { placeholder: e.target.value })} className="mt-1.5" /></div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={field.required} onChange={e => updateField(field.id, { required: e.target.checked })} className="rounded" />
                  <span className="text-sm">Required field</span>
                </div>
                {['select','radio','checkbox'].includes(field.type) && (
                  <div><label className="text-sm font-medium">Options (one per line)</label>
                    <Textarea value={field.options?.join('\n') || ''} onChange={e => updateField(field.id, { options: e.target.value.split('\n') })} className="mt-1.5 h-24" placeholder="Option 1&#10;Option 2&#10;Option 3" />
                  </div>
                )}
                <Button className="w-full" onClick={() => setShowFieldSettings(null)}><Check className="w-4 h-4 mr-2" />Save</Button>
              </div>
            </div>
          </div>
        )
      })()}

      {deletingFormId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[400px] p-6">
            <h3 className="text-lg font-semibold mb-2">Delete form?</h3>
            <p className="text-sm text-text-secondary mb-6">All submissions for this form will also be removed. This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeletingFormId(null)}>Cancel</Button>
              <Button variant="danger" onClick={confirmDeleteForm}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
