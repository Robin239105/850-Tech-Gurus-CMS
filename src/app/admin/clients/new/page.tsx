'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Building, Mail, Globe, Phone, FolderOpen, FileText, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { plans } from '@/lib/mock-data'

const steps = [
  { id: 1, name: 'Client Information', icon: Building },
  { id: 2, name: 'Plan & Features', icon: FileText },
  { id: 3, name: 'Review & Create', icon: CheckCircle },
]

export default function NewClientPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    category: 'Technology',
    notes: '',
  })

  const [selectedPlan, setSelectedPlan] = useState('Pro')
  const [features, setFeatures] = useState({
    customDomain: true,
    sslCertificate: true,
    prioritySupport: false,
    whiteLabel: false,
    apiAccess: false,
    teamCollaboration: false,
  })

  const updateFormData = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const toggleFeature = (feature: string) => {
    setFeatures({ ...features, [feature]: !features[feature as keyof typeof features] })
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    setIsComplete(true)
    setTimeout(() => router.push('/admin/clients'), 2000)
  }

  const selectedPlanData = plans.find(p => p.name === selectedPlan)

  if (isComplete) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-status-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-status-success" />
          </div>
          <h2 className="text-h2 mb-2">Client Created!</h2>
          <p className="text-text-secondary">Redirecting to clients page...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/clients">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-h1">Add New Client</h1>
          <p className="text-sm text-text-secondary">Create a new client account</p>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="flex items-center gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-brand-indigo text-white'
                      : isCompleted
                      ? 'bg-status-success text-white'
                      : 'bg-gray-100 text-text-muted'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-white/20' : isCompleted ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-medium hidden md:inline">{step.name}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${isCompleted ? 'bg-status-success' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {currentStep === 1 && (
        <Card className="p-6 max-w-2xl mx-auto">
          <h2 className="text-h3 mb-6">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="company">Company Name *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => updateFormData('company', e.target.value)}
                placeholder="Enter company name"
                className="mt-1.5"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="name">Contact Person Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="Enter contact person name"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="contact@company.com"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="mt-1.5"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="website">Website URL</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => updateFormData('website', e.target.value)}
                placeholder="https://company.com"
                className="mt-1.5"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => updateFormData('category', e.target.value)}
                className="input mt-1.5"
              >
                <option>Technology</option>
                <option>E-commerce</option>
                <option>SaaS</option>
                <option>Finance</option>
                <option>Healthcare</option>
                <option>Education</option>
                <option>Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateFormData('notes', e.target.value)}
                placeholder="Additional notes about this client..."
                className="mt-1.5"
                rows={3}
              />
            </div>
          </div>
        </Card>
      )}

      {currentStep === 2 && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-h3 mb-6">Select a Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`p-5 cursor-pointer transition-all ${
                  selectedPlan === plan.name
                    ? 'border-brand-indigo border-2 shadow-md'
                    : 'hover:border-gray-300'
                }`}
                onClick={() => setSelectedPlan(plan.name)}
              >
                {plan.recommended && (
                  <Badge className="badge-green mb-3">Recommended</Badge>
                )}
                <h3 className="text-lg font-semibold text-text-primary">{plan.name}</h3>
                <p className="text-3xl font-bold text-brand-indigo mt-2">
                  ${plan.price}
                  <span className="text-sm font-normal text-text-muted">/mo</span>
                </p>
                <ul className="mt-4 space-y-2">
                  {plan.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="text-xs text-text-secondary flex items-center gap-2">
                      <Check className="w-3 h-3 text-status-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <Card className="p-6">
            <h3 className="text-h3 mb-4">Additional Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: 'customDomain', label: 'Custom Domain' },
                { key: 'sslCertificate', label: 'SSL Certificate' },
                { key: 'prioritySupport', label: 'Priority Support' },
                { key: 'whiteLabel', label: 'White Label' },
                { key: 'apiAccess', label: 'API Access' },
                { key: 'teamCollaboration', label: 'Team Collaboration' },
              ].map((feature) => (
                <div key={feature.key} className="flex items-center gap-3">
                  <Checkbox
                    id={feature.key}
                    checked={features[feature.key as keyof typeof features]}
                    onCheckedChange={() => toggleFeature(feature.key)}
                  />
                  <Label htmlFor={feature.key} className="cursor-pointer">
                    {feature.label}
                  </Label>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {currentStep === 3 && (
        <Card className="p-6 max-w-2xl mx-auto">
          <h2 className="text-h3 mb-6">Review & Create</h2>

          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Client Information</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-text-muted">Company:</span>
                  <span className="ml-2 text-text-primary">{formData.company || '-'}</span>
                </div>
                <div>
                  <span className="text-text-muted">Contact:</span>
                  <span className="ml-2 text-text-primary">{formData.name || '-'}</span>
                </div>
                <div>
                  <span className="text-text-muted">Email:</span>
                  <span className="ml-2 text-text-primary">{formData.email || '-'}</span>
                </div>
                <div>
                  <span className="text-text-muted">Phone:</span>
                  <span className="ml-2 text-text-primary">{formData.phone || '-'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-text-muted">Website:</span>
                  <span className="ml-2 text-text-primary">{formData.website || '-'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Plan & Features</h3>
              <div className="flex items-center gap-4 mb-3">
                <Badge className="badge-indigo">{selectedPlan}</Badge>
                <span className="text-lg font-bold text-brand-indigo">${selectedPlanData?.price}/mo</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(features).filter(([, value]) => value).map(([key]) => (
                  <Badge key={key} className="badge-gray">{key.replace(/([A-Z])/g, ' $1').trim()}</Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox id="confirm1" />
                <Label htmlFor="confirm1" className="text-sm">
                  I confirm that the client information is accurate
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox id="confirm2" />
                <Label htmlFor="confirm2" className="text-sm">
                  I agree to the terms of service and billing policy
                </Label>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {currentStep < 3 ? (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={isSubmitting}>
            <Check className="w-4 h-4 mr-2" />
            Create Client
          </Button>
        )}
      </div>
    </div>
  )
}