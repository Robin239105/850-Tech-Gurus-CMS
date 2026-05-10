'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Activity,
  Bell,
  FileText,
  Image as ImageIcon,
  LucideIcon,
  ShoppingCart,
  BarChart3,
  Heart,
  HardDrive,
  Plug,
  Settings,
  HelpCircle,
  ChevronDown,
  Search,
  RefreshCw,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type NavItem = {
  name: string
  href: string
  icon: LucideIcon
  badge?: string
  pulse?: boolean
}

type NavSection = {
  section: string
  items: NavItem[]
}

const navItems: NavSection[] = [
  {
    section: 'Command Center',
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Clients', href: '/admin/clients', icon: Users },
      { name: 'Live Activity', href: '/admin/activity', icon: Activity, pulse: true },
      { name: 'Notifications', href: '/admin/notifications', icon: Bell },
    ],
  },
  {
    section: 'Client Management',
    items: [
      { name: 'All Clients', href: '/admin/clients', icon: Users },
      { name: 'Add New Client', href: '/admin/clients/new', icon: Users },
      { name: 'Billing & Plans', href: '/admin/settings', icon: Heart },
      { name: 'Permissions & Roles', href: '/admin/settings', icon: Settings },
    ],
  },
  {
    section: 'Content Oversight',
    items: [
      { name: 'All Pages', href: '/admin/clients', icon: FileText },
      { name: 'All Media', href: '/admin/clients', icon: ImageIcon },
      { name: 'All Form Submissions', href: '/admin/clients', icon: FileText },
      { name: 'All Orders', href: '/admin/clients', icon: ShoppingCart },
    ],
  },
  {
    section: 'Platform',
    items: [
      { name: 'Analytics & Reports', href: '/admin/analytics', icon: BarChart3 },
      { name: 'System Health', href: '/admin/system-health', icon: Heart },
      { name: 'Storage Monitor', href: '/admin/system-health', icon: HardDrive },
      { name: 'Integrations', href: '/admin/settings', icon: Plug },
      { name: 'Platform Settings', href: '/admin/settings', icon: Settings },
    ],
  },
  {
    section: 'Support',
    items: [
      { name: 'Support Tickets', href: '/admin/tickets', icon: HelpCircle },
      { name: 'Documentation', href: '#', icon: FileText },
      { name: 'Help & Resources', href: '#', icon: HelpCircle },
    ],
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [counts, setCounts] = useState({ clients: 0, notifications: 0, tickets: 0 })

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.ok ? r.json() : {})
      .then((d: Record<string, unknown>) => {
        setCounts({
          clients: Number(d.totalClients ?? 0),
          notifications: 0,
          tickets: Number(d.openTickets ?? 0),
        })
      })
    fetch('/api/admin/notifications')
      .then(r => r.ok ? r.json() : [])
      .then((n: Record<string, unknown>[]) => {
        setCounts(prev => ({ ...prev, notifications: n.filter(x => !x.read).length }))
      })
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const currentPageTitle =
    navItems
      .flatMap((s) => s.items)
      .find((item) => {
        if (item.href === '/admin/dashboard') return pathname === '/admin/dashboard'
        return pathname.startsWith(item.href)
      })?.name ?? 'Dashboard'

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') return pathname === '/admin/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen flex">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-sidebar-border">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <img src="/logo.png" alt="850" className="w-10 h-10 object-contain" />
              <div>
                <p className="text-white font-semibold text-sm">Tech Gurus</p>
                <p className="text-sidebar-muted text-xs">Admin Panel</p>
              </div>
            </Link>
          </div>

          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-brand-indigo text-white text-sm font-medium">AD</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white text-sm font-medium">Admin</p>
                <Badge className="mt-0.5" variant="indigo">Super Admin</Badge>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            {navItems.map((section) => (
              <div key={section.section} className="mb-4">
                <p className="nav-section-label">{section.section}</p>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`sidebar-item ${active ? 'active' : ''}`}
                      >
                        <Icon className="w-[18px] h-[18px]" />
                        <span className="flex-1">{item.name}</span>
                        {item.pulse && <span className="online-dot" />}
                        {item.href === '/admin/clients' && item.name === 'Clients' && counts.clients > 0 && (
                          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white">{counts.clients}</span>
                        )}
                        {item.href === '/admin/notifications' && counts.notifications > 0 && (
                          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-status-danger text-white">{counts.notifications}</span>
                        )}
                        {item.href === '/admin/tickets' && counts.tickets > 0 && (
                          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white">{counts.tickets}</span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center justify-between text-sidebar-muted text-xs">
              <span>v2.4.1</span>
              <Button variant="ghost" size="sm" className="text-sidebar-muted hover:text-white" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 lg:ml-[280px]">
        <header className="h-16 bg-white border-b border-card-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-text-primary">{currentPageTitle}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm w-48 ml-2"
              />
            </div>

            <Button variant="ghost" size="icon-sm">
              <RefreshCw className="w-4 h-4" />
            </Button>

            <Button variant="ghost" size="icon-sm" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-status-danger rounded-full" />
            </Button>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            <Button variant="ghost" size="icon" className="ml-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-brand-indigo text-white text-xs font-medium">AD</AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </header>

        <main className="p-4 lg:p-6 bg-page-bg min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}