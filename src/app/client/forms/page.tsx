'use client'

import { useState } from 'react'
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Code,
  GripVertical,
  Settings,
  X,
  Check,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

const mockForms = [
  { id: '1', name: 'Contact Us Form', submissions: 245, createdAt: '2025-01-15' },
  { id: '2', name: 'Newsletter Signup', submissions: 1892, createdAt: '2025-02-20' },
  { id: '3', name: 'Quote Request', submissions: 56, createdAt: '2025-04-10' },
  { id: '4', name: 'Support Request', submissions: 134, createdAt: '2025-05-05' },
  { id: '5', name: 'Event Registration', submissions: 78, createdAt: '2026-01-20' },
]

const fieldTypes = [
  { type: 'text', label: 'Text', icon: 'Aa' },
  { type: 'email', label: 'Email', icon: '@' },
  { type: 'phone', label: 'Phone', icon: '#' },
  { type: 'textarea', label: 'Textarea', icon: '¶' },
  { type: 'select', label: 'Select', icon: '▼' },
  { type: 'radio', label: 'Radio', icon: '○' },
  { type: 'checkbox', label: 'Checkboxes', icon: '☑' },
  { type: 'date', label: 'Date', icon: '📅' },
  { type: 'time', label: 'Time', icon: '🕐' },
  { type: 'file', label: 'File', icon: '📎' },
  { type: 'number', label: 'Number', icon: '#' },
  { type: 'rating', label: 'Rating', icon: '★' },
  { type: 'divider', label: 'Divider', icon: '—' },
  { type: 'heading', label: 'Heading', icon: 'H' },
  { type: 'hidden', label: 'Hidden', icon: '◎' },
]

interface FormField {
  id: string
  type: string
  label: string
  required: boolean
  placeholder?: string
  helpText?: string
  options?: string[]
}

export default function FormsPage() {
  const [forms, setForms] = useState(mockForms)
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingForm, setEditingForm] = useState<typeof mockForms[0] | null>(null)
  const [formName, setFormName] = useState('')
  const [fields, setFields] = useState<FormField[]>([])
  const [showFieldSettings, setShowFieldSettings] = useState<string | null>(null)
  const [showSettingsPanel, setShowSettingsPanel] = useState(false)

  const createNewForm = () => {
    setEditingForm(null)
    setFormName('New Form')
    setFields([
      { id: '1', type: 'text', label: 'Name', required: true },
      { id: '2', type: 'email', label: 'Email', required: true },
      { id: '3', type: 'textarea', label: 'Message', required: false },
    ])
    setShowBuilder(true)
  }

  const editForm = (form: typeof mockForms[0]) => {
    setEditingForm(form)
    setFormName(form.name)
    setFields([
      { id: '1', type: 'text', label: 'Name', required: true },
      { id: '2', type: 'email', label: 'Email', required: true },
      { id: '3', type: 'textarea', label: 'Message', required: false },
    ])
    setShowBuilder(true)
  }

  const addField = (type: string) => {
    const newField: FormField = {
      id: `${Date.now()}`,
      type,
      label: `New ${type} field`,
      required: false,
      placeholder: '',
      helpText: '',
      options: type === 'select' || type === 'radio' || type === 'checkbox' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
    }
    setFields([...fields, newField])
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  const deleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id))
  }

  const [deletingFormId, setDeletingFormId] = useState<string | null>(null)

  const deleteForm = (id: string) => {
    setDeletingFormId(id)
  }

  const confirmDeleteForm = () => {
    if (deletingFormId) {
      setForms(forms.filter(f => f.id !== deletingFormId))
      setDeletingFormId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Contact Forms</h2>
        <Button onClick={createNewForm}>
          <Plus className="w-4 h-4 mr-2" />
          Create new form
        </Button>
      </div>

      {!showBuilder ? (
        <div className="grid grid-cols-3 gap-4">
          {forms.map(form => (
            <Card key={form.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg">{form.name}</h3>
                  <Badge className="bg-brand-indigo/10 text-brand-indigo">{form.submissions} submissions</Badge>
                </div>
                <p className="text-sm text-text-muted mb-4">Created {formatDate(form.createdAt)}</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => editForm(form)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Code className="w-4 h-4 mr-1" />
                    Embed
                  </Button>
                  <button 
                    onClick={() => deleteForm(form.id)}
                    className="p-1.5 hover:bg-gray-100 rounded text-status-danger ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3 space-y-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setShowBuilder(false)}>← Back</Button>
              <Input 
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="text-xl font-semibold border-0 px-0 focus:ring-0"
              />
            </div>
            
            <Card>
              <CardContent className="p-5">
                <div className="space-y-3">
                  {fields.map(field => (
                    <div 
                      key={field.id}
                      className="flex items-start gap-3 p-4 border border-card-border rounded-lg hover:border-brand-indigo/50 transition-colors"
                    >
                      <div className="cursor-grab text-text-muted hover:text-text-primary">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{field.label}</span>
                          <Badge variant="gray" className="text-xs">{field.type}</Badge>
                          {field.required && <span className="text-status-danger">*</span>}
                        </div>
                        {field.placeholder && (
                          <p className="text-xs text-text-muted mt-1">{field.placeholder}</p>
                        )}
                      </div>
                      <button 
                        onClick={() => updateField(field.id, { required: !field.required })}
                        className={cn(
                          'text-xs px-2 py-1 rounded',
                          field.required ? 'bg-brand-indigo text-white' : 'bg-gray-100 text-text-muted'
                        )}
                      >
                        Required
                      </button>
                      <button 
                        onClick={() => setShowFieldSettings(field.id)}
                        className="p-1.5 hover:bg-gray-100 rounded"
                      >
                        <Settings className="w-4 h-4 text-text-muted" />
                      </button>
                      <button 
                        onClick={() => deleteField(field.id)}
                        className="p-1.5 hover:bg-gray-100 rounded text-status-danger"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full py-8 border-dashed"
                    onClick={() => setShowFieldSettings('add')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add field
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Field Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {fieldTypes.map(ft => (
                    <button
                      key={ft.type}
                      onClick={() => addField(ft.type)}
                      className="flex items-center gap-2 p-3 border border-card-border rounded-lg hover:bg-gray-50 hover:border-brand-indigo text-left"
                    >
                      <span className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-sm font-mono">
                        {ft.icon}
                      </span>
                      <span className="text-sm">{ft.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Form Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Submit button text</label>
                  <Input defaultValue="Send message" className="mt-1.5" />
                </div>
                <div>
                  <label className="text-sm font-medium">Success message</label>
                  <Textarea defaultValue="Thank you for your message!" className="mt-1.5 h-20" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email notification</span>
                  <Switch defaultChecked />
                </div>
                {true && (
                  <div className="space-y-3 pl-2 border-l-2 border-gray-100">
                    <div>
                      <label className="text-sm">Send to email</label>
                      <Input placeholder="admin@company.com" className="mt-1.5" />
                    </div>
                    <div>
                      <label className="text-sm">Subject line</label>
                      <Input placeholder="New form submission" className="mt-1.5" />
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Enable CAPTCHA</span>
                  <Switch />
                </div>
                <Button className="w-full">Save form settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Embed Options</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  readOnly
                  value={`[contact-form-7 id="${editingForm?.id || 'new'}" title="${formName}"]`}
                  className="font-mono text-sm h-24"
                />
                <Button variant="outline" className="w-full mt-3">
                  Copy embed code
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {forms.length === 0 && !showBuilder && (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-text-muted mb-2">No forms yet</p>
          <p className="text-sm text-text-muted mb-4">Create your first form to start collecting submissions</p>
          <Button onClick={createNewForm}>
            <Plus className="w-4 h-4 mr-2" />
            Create new form
          </Button>
        </div>
      )}

      {showFieldSettings && showFieldSettings !== 'add' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[400px] animate-fade-in">
            <div className="p-4 border-b border-card-border flex items-center justify-between">
              <h3 className="font-semibold">Field Settings</h3>
              <button onClick={() => setShowFieldSettings(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {(() => {
                const field = fields.find(f => f.id === showFieldSettings)
                if (!field) return null
                return (
                  <>
                    <div>
                      <label className="text-sm font-medium">Label</label>
                      <Input 
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Placeholder</label>
                      <Input 
                        value={field.placeholder || ''}
                        onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Help text</label>
                      <Input 
                        value={field.helpText || ''}
                        onChange={(e) => updateField(field.id, { helpText: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={field.required}
                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                        className="rounded text-brand-indigo"
                      />
                      <span className="text-sm">Required field</span>
                    </div>
                    {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                      <div>
                        <label className="text-sm font-medium">Options (one per line)</label>
                        <Textarea 
                          value={field.options?.join('\n') || ''}
                          onChange={(e) => updateField(field.id, { options: e.target.value.split('\n') })}
                          className="mt-1.5 h-24"
                          placeholder="Option 1&#10;Option 2&#10;Option 3"
                        />
                      </div>
                    )}
                    <Button className="w-full" onClick={() => setShowFieldSettings(null)}>
                      <Check className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {deletingFormId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[400px] p-6 animate-fade-in">
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