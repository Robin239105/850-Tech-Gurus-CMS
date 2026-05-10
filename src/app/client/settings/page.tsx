'use client'

import { useState } from 'react'
import {
  Settings,
  Palette,
  Search,
  Share2,
  Code,
  AlertTriangle,
  Save,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

const tabs = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'social', label: 'Social', icon: Share2 },
  { id: 'advanced', label: 'Advanced', icon: Code },
]

const socialPlatforms = [
  { name: 'Facebook', icon: '📘' },
  { name: 'Instagram', icon: '📷' },
  { name: 'Twitter/X', icon: '𝕏' },
  { name: 'LinkedIn', icon: '💼' },
  { name: 'YouTube', icon: '▶️' },
  { name: 'TikTok', icon: '🎵' },
  { name: 'WhatsApp', icon: '💬' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [resetConfirm, setResetConfirm] = useState('')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-text-muted" />
        <h2 className="text-xl font-semibold">Site Settings</h2>
      </div>

      <div className="flex gap-6">
        <div className="w-48 shrink-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="flex gap-2">
            <TabsList className="flex flex-col w-full bg-transparent gap-1">
              {tabs.map(tab => (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    'justify-start px-3 py-2 text-sm font-medium rounded-lg transition-all',
                    activeTab === tab.id 
                      ? 'bg-brand-indigo text-white' 
                      : 'text-text-secondary hover:bg-gray-100'
                  )}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 space-y-6">
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Site title *</label>
                  <Input defaultValue="Acme Corporation" className="mt-1.5" />
                </div>
                <div>
                  <label className="text-sm font-medium">Tagline / Slogan</label>
                  <Input defaultValue="Building the future, today" className="mt-1.5" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Admin email</label>
                    <Input type="email" defaultValue="admin@acmecorp.com" className="mt-1.5" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input type="tel" defaultValue="+1 (555) 123-4567" className="mt-1.5" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Business address</label>
                  <Textarea defaultValue="123 Business Ave, Suite 100&#10;New York, NY 10001" className="mt-1.5 h-20" />
                </div>
                <div>
                  <label className="text-sm font-medium">Business hours</label>
                  <Input defaultValue="Mon-Fri: 9:00 AM - 6:00 PM" className="mt-1.5" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Timezone</label>
                    <select className="mt-1.5 w-full h-10 px-3 rounded-md border border-card-border bg-white text-sm">
                      <option>America/New_York (EST)</option>
                      <option>America/Los_Angeles (PST)</option>
                      <option>America/Chicago (CST)</option>
                      <option>Europe/London (GMT)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date format</label>
                    <select className="mt-1.5 w-full h-10 px-3 rounded-md border border-card-border bg-white text-sm">
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Language</label>
                  <select className="mt-1.5 w-full h-10 px-3 rounded-md border border-card-border bg-white text-sm">
                    <option>English (US)</option>
                    <option>English (UK)</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
                <Button className="mt-4">
                  <Save className="w-4 h-4 mr-2" />
                  Save changes
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'branding' && (
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Branding</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium">Logo</label>
                    <div className="mt-1.5 flex items-center gap-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl font-bold text-brand-indigo">850</span>
                      </div>
                      <Button variant="outline">Change logo</Button>
                    </div>
                    <button className="text-sm text-status-danger mt-2">Remove logo</button>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Favicon</label>
                    <div className="mt-1.5 flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-brand-indigo">850</span>
                      </div>
                      <Button variant="outline">Change favicon</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Primary color</label>
                      <div className="mt-1.5 flex items-center gap-2">
                        <input type="color" defaultValue="#4F46E5" className="w-10 h-10 rounded cursor-pointer" />
                        <Input defaultValue="#4F46E5" className="flex-1" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Secondary color</label>
                      <div className="mt-1.5 flex items-center gap-2">
                        <input type="color" defaultValue="#06B6D4" className="w-10 h-10 rounded cursor-pointer" />
                        <Input defaultValue="#06B6D4" className="flex-1" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Heading font</label>
                      <select className="mt-1.5 w-full h-10 px-3 rounded-md border border-card-border bg-white text-sm">
                        <option>Inter</option>
                        <option>Roboto</option>
                        <option>Open Sans</option>
                        <option>Montserrat</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Body font</label>
                      <select className="mt-1.5 w-full h-10 px-3 rounded-md border border-card-border bg-white text-sm">
                        <option>Inter</option>
                        <option>Roboto</option>
                        <option>Open Sans</option>
                        <option>Lato</option>
                      </select>
                    </div>
                  </div>
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Save branding
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Live Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border border-card-border rounded-lg p-4 bg-gray-50">
                    <div className="bg-white rounded shadow-sm p-3">
                      <div className="flex items-center gap-2 border-b pb-2 mb-2">
                        <div className="w-8 h-8 bg-brand-indigo rounded flex items-center justify-center text-white text-xs font-bold">850</div>
                        <span className="font-semibold text-sm">Acme Corporation</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-brand-indigo/20 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                        <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'seo' && (
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Default meta title</label>
                  <Input defaultValue="Acme Corporation - Building the Future" className="mt-1.5" />
                  <p className="text-xs text-text-muted mt-1">55/60 characters</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Default meta description</label>
                  <Textarea defaultValue="Discover premium products and services at Acme Corporation. We build the future with innovative solutions." className="mt-1.5 h-20" />
                  <p className="text-xs text-text-muted mt-1">145/160 characters</p>
                </div>
                <div>
                  <label className="text-sm font-medium">OG Image</label>
                  <div className="mt-1.5 border-2 border-dashed border-card-border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-brand-indigo">
                    <span className="text-sm text-text-muted">Click to upload OG image</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Google Analytics ID</label>
                    <Input placeholder="UA-XXXXX" className="mt-1.5" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Google Search Console</label>
                    <Input placeholder="Verification code" className="mt-1.5" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Auto-generate sitemap</p>
                    <p className="text-xs text-text-muted">Automatically generate and update sitemap.xml</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View sitemap
                </Button>
                <div>
                  <label className="text-sm font-medium">Robots.txt</label>
                  <Textarea 
                    defaultValue="User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /private/"
                    className="mt-1.5 font-mono text-sm h-32"
                  />
                </div>
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Save SEO settings
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'social' && (
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {socialPlatforms.map(platform => (
                  <div key={platform.name} className="flex items-center gap-4">
                    <span className="w-8 text-center text-lg">{platform.icon}</span>
                    <label className="w-24 text-sm font-medium">{platform.name}</label>
                    <Input placeholder={`https://${platform.name.toLowerCase()}.com/yourcompany`} className="flex-1" />
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mt-4">
                  <div>
                    <p className="text-sm font-medium">Show social icons on site</p>
                    <p className="text-xs text-text-muted">Display social media links in footer</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Save social links
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Custom CSS</label>
                    <Textarea 
                      placeholder=".my-class { color: red; }"
                      className="mt-1.5 font-mono text-sm h-40 bg-gray-900 text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Custom Header Scripts</label>
                    <Textarea 
                      placeholder="<script>console.log('header');</script>"
                      className="mt-1.5 font-mono text-sm h-32"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Custom Footer Scripts</label>
                    <Textarea 
                      placeholder="<script>console.log('footer');</script>"
                      className="mt-1.5 font-mono text-sm h-32"
                    />
                  </div>
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Save advanced settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Mode</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Enable maintenance mode</p>
                      <p className="text-xs text-text-muted">Show a maintenance page to visitors</p>
                    </div>
                    <Switch />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Maintenance message</label>
                    <Textarea 
                      defaultValue="We are currently performing scheduled maintenance. We will be back shortly."
                      className="mt-1.5 h-20"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-status-danger/50">
                <CardHeader>
                  <CardTitle className="text-status-danger">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-status-danger/5 rounded-lg border border-status-danger/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-status-danger mt-0.5" />
                      <div>
                        <p className="font-medium text-status-danger">Reset site content</p>
                        <p className="text-sm text-text-secondary mt-1">This will delete all pages, posts, products, and media files. This action cannot be undone.</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <Input 
                        placeholder='Type "RESET" to confirm'
                        value={resetConfirm}
                        onChange={(e) => setResetConfirm(e.target.value)}
                        className="w-64"
                      />
                      <Button 
                        variant="danger" 
                        disabled={resetConfirm !== 'RESET'}
                      >
                        Reset site
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}