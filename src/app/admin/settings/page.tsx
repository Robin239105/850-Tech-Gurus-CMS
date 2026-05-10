'use client'

import { useState, useEffect, useRef } from 'react'
import { Save, User, Mail, CreditCard, Shield, Plug, Palette, Database, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const tabs = [
  { id: 'general', label: 'General', icon: User },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'whitelabel', label: 'White Label', icon: Palette },
  { id: 'backups', label: 'Backups', icon: Database },
]

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.ok ? r.json() : {})
      .then((s: Record<string, string>) => {
        if (!formRef.current) return
        Object.entries(s).forEach(([key, value]) => {
          const el = formRef.current?.elements.namedItem(key) as HTMLInputElement | null
          if (el) el.value = value
        })
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const form = formRef.current
    if (!form) return
    const data: Record<string, string> = {}
    Array.from(form.elements).forEach((el) => {
      const input = el as HTMLInputElement
      if (input.id && input.value !== undefined && input.type !== 'submit') {
        data[input.id] = input.value
      }
    })
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">Platform Settings</h1>
          <p className="text-sm text-text-secondary mt-1">Configure platform-wide settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saved ? <CheckCircle className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>

      <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
      <Tabs defaultValue="general">
        <TabsList className="w-full justify-start overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-6">
          <Card className="p-6">
            <h2 className="text-h3 mb-6">General Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="platformName">Platform Name</Label>
                <Input id="platformName" defaultValue="850 Tech Gurus" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="America/New_York">
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select defaultValue="MM/DD/YYYY">
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="language">Default Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-card-border">
              <h3 className="text-h4 mb-4">Platform Features</h3>
              <div className="space-y-4">
                {[
                  { label: 'Enable client registration', description: 'Allow new clients to sign up', enabled: true },
                  { label: 'Enable trial plans', description: 'Allow 14-day free trials', enabled: true },
                  { label: 'Require email verification', description: 'Clients must verify email', enabled: false },
                  { label: 'Enable public marketplace', description: 'Show plans on landing page', enabled: true },
                ].map((feature) => (
                  <div key={feature.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-text-primary">{feature.label}</p>
                      <p className="text-sm text-text-muted">{feature.description}</p>
                    </div>
                    <Switch defaultChecked={feature.enabled} />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="mt-6 space-y-6">
          <Card className="p-6">
            <h2 className="text-h3 mb-6">Email Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input id="smtpHost" placeholder="smtp.example.com" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input id="smtpPort" placeholder="587" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="smtpUser">SMTP Username</Label>
                <Input id="smtpUser" placeholder="username" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="smtpPass">SMTP Password</Label>
                <Input id="smtpPass" type="password" placeholder="••••••••" className="mt-1.5" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="fromEmail">From Email</Label>
                <Input id="fromEmail" placeholder="noreply@850techgurus.com" className="mt-1.5" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="fromName">From Name</Label>
                <Input id="fromName" placeholder="850 Tech Gurus" className="mt-1.5" />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-6 space-y-6">
          <Card className="p-6">
            <h2 className="text-h3 mb-6">Billing Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select defaultValue="USD">
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="stripePublicKey">Stripe Public Key</Label>
                <Input id="stripePublicKey" placeholder="pk_live_..." className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                <Input id="stripeSecretKey" type="password" placeholder="sk_live_..." className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="stripeWebhookSecret">Stripe Webhook Secret</Label>
                <Input id="stripeWebhookSecret" type="password" placeholder="whsec_..." className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                <Input id="invoicePrefix" defaultValue="INV-" className="mt-1.5" />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <Card className="p-6">
            <h2 className="text-h3 mb-6">Security Settings</h2>
            <div className="space-y-4">
              {[
                { label: 'Two-factor authentication', description: 'Require 2FA for all admin accounts', enabled: true },
                { label: 'Session timeout', description: 'Auto logout after inactivity', enabled: true },
                { label: 'IP whitelist', description: 'Restrict admin access to specific IPs', enabled: false },
                { label: 'Audit logging', description: 'Log all admin actions', enabled: true },
              ].map((setting) => (
                <div key={setting.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-text-primary">{setting.label}</p>
                    <p className="text-sm text-text-muted">{setting.description}</p>
                  </div>
                  <Switch defaultChecked={setting.enabled} />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6 space-y-6">
          <Card className="p-6">
            <h2 className="text-h3 mb-6">Integrations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Stripe', description: 'Payment processing', connected: true },
                { name: 'SendGrid', description: 'Email delivery', connected: true },
                { name: 'AWS S3', description: 'Media storage', connected: false },
                { name: 'Slack', description: 'Team notifications', connected: false },
                { name: 'Zapier', description: 'Workflow automation', connected: false },
                { name: 'Google Analytics', description: 'Traffic analytics', connected: true },
              ].map((integration) => (
                <div key={integration.name} className="flex items-center justify-between p-4 border border-card-border rounded-lg">
                  <div>
                    <p className="font-medium text-text-primary">{integration.name}</p>
                    <p className="text-sm text-text-muted">{integration.description}</p>
                  </div>
                  <Button variant={integration.connected ? 'outline' : 'default'} size="sm">
                    {integration.connected ? 'Configure' : 'Connect'}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="whitelabel" className="mt-6 space-y-6">
          <Card className="p-6">
            <h2 className="text-h3 mb-6">White Label Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="brandName">Brand Name</Label>
                <Input id="brandName" placeholder="Your Company" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="brandUrl">Brand URL</Label>
                <Input id="brandUrl" placeholder="https://yourcompany.com" className="mt-1.5" />
              </div>
              <div className="md:col-span-2">
                <Label>Brand Logo</Label>
                <div className="mt-1.5 p-8 border-2 border-dashed border-card-border rounded-lg text-center cursor-pointer hover:bg-gray-50">
                  <p className="text-text-muted">Click to upload logo</p>
                  <p className="text-xs text-text-muted mt-1">PNG, JPG - Max 2MB</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="backups" className="mt-6 space-y-6">
          <Card className="p-6">
            <h2 className="text-h3 mb-6">Backup Settings</h2>
            <div className="space-y-4">
              {[
                { label: 'Automatic backups', description: 'Daily automated backups', enabled: true },
                { label: 'Backup retention', description: 'Keep backups for 30 days', enabled: true },
                { label: 'Off-site storage', description: 'Backup to cloud storage', enabled: false },
              ].map((setting) => (
                <div key={setting.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-text-primary">{setting.label}</p>
                    <p className="text-sm text-text-muted">{setting.description}</p>
                  </div>
                  <Switch defaultChecked={setting.enabled} />
                </div>
              ))}
              <div className="pt-4">
                <Button variant="outline">Run Manual Backup</Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      </form>
    </div>
  )
}