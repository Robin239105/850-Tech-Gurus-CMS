'use client'

import { useState, useEffect } from 'react'
import {
  Code2, Copy, CheckCircle2, RefreshCw, ExternalLink, Zap,
  Shield, Globe, FileInput, ShoppingCart, ChevronDown, ChevronRight,
  AlertCircle, Wifi, WifiOff,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ClientInfo = {
  id: string
  name: string
  website: string
  api_key: string | null
}

type Tab = 'script' | 'react' | 'form' | 'order'

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
    >
      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : label}
    </button>
  )
}

function CodeBlock({ code, language = 'js' }: { code: string; language?: string }) {
  return (
    <div className="relative rounded-xl overflow-hidden border border-white/10">
      <div className="flex items-center justify-between bg-[#1a1a2e] px-4 py-2.5 border-b border-white/10">
        <span className="text-xs font-mono text-gray-400">{language}</span>
        <CopyButton text={code} />
      </div>
      <pre className="bg-[#0d0d1a] p-4 overflow-x-auto text-sm font-mono text-gray-200 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default function ConnectPage() {
  const [client, setClient] = useState<ClientInfo | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('script')
  const [generatingKey, setGeneratingKey] = useState(false)
  const [connected, setConnected] = useState<boolean | null>(null)
  const [openSection, setOpenSection] = useState<string[]>(['step1'])

  const cmsUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://cms.850techgurus.com'

  useEffect(() => {
    fetch('/api/client/me')
      .then(r => r.ok ? r.json() : null)
      .then(async (me: Record<string, string> | null) => {
        if (!me) return
        // Fetch API key from admin-style public endpoint
        const keyRes = await fetch(`/api/admin/clients/${me.id}/api-key`)
        const keyData = keyRes.ok ? await keyRes.json() : {}
        setClient({
          id: me.id,
          name: me.name,
          website: me.website,
          api_key: keyData.api_key ?? null,
        })

        // Check if site is connected
        fetch(`/api/v1/site/${me.id}`)
          .then(r => setConnected(r.ok))
          .catch(() => setConnected(false))
      })
  }, [])

  const handleGenerateKey = async () => {
    if (!client) return
    setGeneratingKey(true)
    const res = await fetch(`/api/admin/clients/${client.id}/api-key`, { method: 'POST' })
    const data = await res.json() as { api_key: string }
    setClient(prev => prev ? { ...prev, api_key: data.api_key } : prev)
    setGeneratingKey(false)
  }

  const toggleSection = (id: string) => {
    setOpenSection(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const tabs: { id: Tab; label: string; icon: typeof Code2 }[] = [
    { id: 'script', label: 'Script Tag', icon: Code2 },
    { id: 'react', label: 'React / Next.js', icon: Globe },
    { id: 'form', label: 'Form Submission', icon: FileInput },
    { id: 'order', label: 'Order Intake', icon: ShoppingCart },
  ]

  const scriptSnippet = client
    ? `<script
  src="${cmsUrl}/sdk/connect.js"
  data-client="${client.id}"
></script>`
    : '<!-- loading... -->'

  const htmlAutoInjectSnippet = `<!-- Add anywhere in your HTML after the script tag -->

<!-- Auto-fill phone -->
<span data-cms="phone"></span>

<!-- Auto-fill email -->
<a data-cms="email-link"></a>

<!-- Auto-fill logo -->
<img data-cms="logo" alt="Logo" />

<!-- Auto-fill navigation menu -->
<ul data-cms="navigation"></ul>

<!-- Social links -->
<a data-cms="social-facebook" target="_blank">Facebook</a>
<a data-cms="social-instagram" target="_blank">Instagram</a>

<!-- Use in JavaScript -->
<script>
  window.CMS.ready(function(site) {
    console.log(site.siteName)  // Your site name
    console.log(site.phone)     // Phone number
    console.log(site.email)     // Contact email
    console.log(site.navigation) // Nav menu array
    console.log(site.products)   // Active products
  })
</script>`

  const reactSnippet = `// 1. Create a simple hook: hooks/useCMS.js
import { useEffect, useState } from 'react'

const CMS_URL = '${cmsUrl}'

export function useCMSData(clientId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(\`\${CMS_URL}/api/v1/site/\${clientId}\`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [clientId])

  return { data, loading }
}

// 2. Use in any component
const CLIENT_ID = '${client?.id ?? 'YOUR_CLIENT_ID'}'

export function Header() {
  const { data: site } = useCMSData(CLIENT_ID)
  if (!site) return null

  return (
    <header>
      {site.logo && <img src={site.logo} alt={site.siteName} />}
      <a href={\`tel:\${site.phone}\`}>{site.phone}</a>
      <a href={\`mailto:\${site.email}\`}>{site.email}</a>
      <nav>
        {site.navigation.map(item => (
          <a key={item.url} href={item.url}>{item.label}</a>
        ))}
      </nav>
    </header>
  )
}`

  const formSnippet = `<!-- Option A: Auto-track with data-cms-form attribute -->
<!-- The SDK intercepts submit events automatically -->
<form data-cms-form="Contact Form" action="/your-handler" method="POST">
  <input name="name" placeholder="Your name" />
  <input name="email" type="email" placeholder="Email" />
  <textarea name="message" placeholder="Message"></textarea>
  <button type="submit">Send Message</button>
</form>

<!-- Option B: Manual programmatic submission -->
<script>
  // Use window.CMS.submitForm() from any JS framework
  async function handleSubmit(event) {
    event.preventDefault()
    const formData = {
      name: event.target.name.value,
      email: event.target.email.value,
      message: event.target.message.value,
    }
    const result = await window.CMS.submitForm('Contact Form', formData)
    console.log('Submission saved:', result.id)
  }
</script>

<!-- Option C: Direct fetch (React/Next.js) -->
<script>
  await fetch('${cmsUrl}/api/v1/submit/${client?.id ?? 'YOUR_CLIENT_ID'}', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      formName: 'Contact Form',
      fields: { name: 'John', email: 'john@example.com', message: 'Hello!' },
      page: window.location.href,
    }),
  })
</script>`

  const orderSnippet = client?.api_key
    ? `// Send an order to your CMS dashboard after checkout
await fetch('${cmsUrl}/api/v1/order/${client.id}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CMS-Key': '${client.api_key}', // Keep this secret!
  },
  body: JSON.stringify({
    customer: {
      name: 'Jane Smith',
      email: 'jane@example.com',
    },
    items: [
      { name: 'Product A', qty: 2, price: 29.99 },
      { name: 'Product B', qty: 1, price: 49.99 },
    ],
    total: 109.97,
    shippingAddress: {
      street: '123 Main St',
      city: 'Sydney',
      state: 'NSW',
      postcode: '2000',
    },
    paymentStatus: 'paid', // or 'pending'
  }),
})
// Response: { success: true, orderId: "...", orderNumber: "ORD-12345678" }`
    : `// Generate your API key first (click the button above)
// then your order intake code will appear here`

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Zap className="w-6 h-6 text-brand-indigo" />
            Connect Your Website
          </h1>
          <p className="text-text-secondary mt-1">
            Add one snippet to any website to connect it to your CMS dashboard
          </p>
        </div>
        {connected !== null && (
          <div className={cn(
            'flex items-center gap-2 text-sm px-3 py-1.5 rounded-full',
            connected
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-gray-50 text-gray-500 border border-gray-200'
          )}>
            {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {connected ? 'Connected' : 'Not connected yet'}
          </div>
        )}
      </div>

      {/* Client ID + API Key cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-indigo" />
              Your Client ID
            </CardTitle>
            <CardDescription className="text-xs">
              Public identifier — safe to use in your website HTML
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 truncate">
                {client?.id ?? '...'}
              </code>
              {client?.id && <CopyButton text={client.id} label="Copy ID" />}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-500" />
              API Key
              <span className="text-xs font-normal text-text-muted">(for order intake)</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Keep this secret — only use in server-side code
            </CardDescription>
          </CardHeader>
          <CardContent>
            {client?.api_key ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-800 truncate">
                    {client.api_key}
                  </code>
                  <CopyButton text={client.api_key} label="Copy" />
                </div>
                <button
                  onClick={handleGenerateKey}
                  disabled={generatingKey}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <RefreshCw className={cn('w-3 h-3', generatingKey && 'animate-spin')} />
                  Regenerate key
                </button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={handleGenerateKey}
                disabled={generatingKey}
                className="gap-2"
              >
                <RefreshCw className={cn('w-4 h-4', generatingKey && 'animate-spin')} />
                {generatingKey ? 'Generating...' : 'Generate API Key'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Integration tabs */}
      <div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center',
                activeTab === tab.id
                  ? 'bg-white text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Script Tag tab */}
        {activeTab === 'script' && (
          <div className="space-y-6">
            <Card className="border-brand-indigo/30 bg-brand-indigo/5">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-indigo flex items-center justify-center shrink-0 text-white font-bold text-sm">1</div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-text-primary">Add to your website &lt;head&gt;</p>
                    <p className="text-text-secondary text-xs mt-1 mb-3">Works with any website — HTML, PHP, WordPress, Shopify, etc.</p>
                    <CodeBlock code={scriptSnippet} language="html" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 text-gray-700 font-bold text-sm">2</div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-text-primary">Use data-cms attributes to auto-fill your content</p>
                    <p className="text-text-secondary text-xs mt-1 mb-3">These HTML attributes get filled automatically with your CMS settings</p>
                    <CodeBlock code={htmlAutoInjectSnippet} language="html" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Quick test</p>
                <p className="text-xs text-amber-700 mt-1">
                  After adding the script, open your browser console and type{' '}
                  <code className="bg-amber-100 px-1 rounded">window.CMS.getData()</code> — you should see your site data.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* React / Next.js tab */}
        {activeTab === 'react' && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              No npm package needed — just fetch from our public API. Works with React, Next.js, Vue, Svelte, or any framework.
            </p>
            <CodeBlock code={reactSnippet} language="jsx" />
            <div className="text-sm text-text-secondary bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="font-medium text-text-primary mb-1">💡 Pro tip for Next.js</p>
              <p>Use this in a Server Component with <code className="bg-gray-100 px-1 rounded text-xs">cache: 'no-store'</code> for always-fresh data, or <code className="bg-gray-100 px-1 rounded text-xs">revalidate: 60</code> for ISR.</p>
            </div>
          </div>
        )}

        {/* Form Submission tab */}
        {activeTab === 'form' && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              When a visitor submits a form, the data appears in your <strong>Submissions</strong> dashboard and you get an email notification.
            </p>
            <CodeBlock code={formSnippet} language="html" />
          </div>
        )}

        {/* Order Intake tab */}
        {activeTab === 'order' && (
          <div className="space-y-4">
            {!client?.api_key && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Generate your API key first</p>
                  <p className="text-xs text-amber-700 mt-1">Order intake requires authentication. Click "Generate API Key" at the top of this page.</p>
                </div>
              </div>
            )}
            <p className="text-sm text-text-secondary">
              Send orders from your checkout page to your CMS dashboard. Orders appear in real-time in your Orders section.
            </p>
            <CodeBlock code={orderSnippet} language="js" />
            <div className="text-sm text-text-secondary bg-red-50 rounded-xl p-4 border border-red-200">
              <p className="font-medium text-red-800 mb-1">⚠️ Keep your API key secret</p>
              <p className="text-red-700 text-xs">Never put your API key in client-side JavaScript. Only use it in server-side code (Next.js API routes, Node.js backends, etc.)</p>
            </div>
          </div>
        )}
      </div>

      {/* FAQ accordion */}
      <div className="space-y-2">
        <h2 className="text-base font-semibold text-text-primary mb-4">Frequently Asked Questions</h2>

        {[
          {
            id: 'step1',
            q: 'Do I need to rebuild my website to use this?',
            a: 'No. The script tag works with any existing website. Your developer just adds one line of HTML to the <head> section and uses data-cms attributes where they want content to appear.',
          },
          {
            id: 'step2',
            q: 'What happens when I update my phone number in the CMS?',
            a: 'The change appears on your website within seconds on the next page load. No rebuild needed — the SDK fetches live data from our API on every visit.',
          },
          {
            id: 'step3',
            q: 'Can I use this with WordPress?',
            a: 'Yes. You can add the script tag to your WordPress theme\'s header.php, or use a plugin like "Insert Headers and Footers" to add the script without editing code.',
          },
          {
            id: 'step4',
            q: 'Does this affect my website\'s speed?',
            a: 'The SDK (connect.js) is tiny (~4KB) and loads asynchronously. It fetches data after your page loads, so it doesn\'t block rendering.',
          },
        ].map(item => (
          <div key={item.id} className="border border-card-border rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection(item.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-text-primary">{item.q}</span>
              {openSection.includes(item.id)
                ? <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
                : <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
              }
            </button>
            {openSection.includes(item.id) && (
              <div className="px-4 pb-4 text-sm text-text-secondary">{item.a}</div>
            )}
          </div>
        ))}
      </div>

      {/* Need help */}
      <Card className="bg-gradient-to-r from-brand-indigo to-brand-cyan text-white">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="font-semibold text-lg">Need help integrating?</p>
            <p className="text-white/80 text-sm mt-1">Our team builds and connects websites every day. We can do this for you.</p>
          </div>
          <a
            href="mailto:hello@850techgurus.com"
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0"
          >
            Contact Support
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
