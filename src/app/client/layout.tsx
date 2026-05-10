'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Palette,
  Image,
  Menu,
  ShoppingBag,
  Tag,
  ShoppingCart,
  Users,
  TicketPercent,
  FileInput,
  Calendar,
  Inbox,
  Settings,
  User,
  HelpCircle,
  Bell,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Layers,
  Eye,
  LogOut,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navigationItems = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/client/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Content',
    items: [
      { name: 'Pages', href: '/client/pages', icon: FileText },
      { name: 'Blog Posts', href: '/client/blog', icon: FileText },
      { name: 'Media Library', href: '/client/media', icon: Image },
      { name: 'Navigation', href: '/client/navigation', icon: Menu },
    ],
  },
  {
    title: 'Store',
    items: [
      { name: 'Products', href: '/client/products', icon: ShoppingBag },
      { name: 'Categories', href: '/client/categories', icon: Tag },
      { name: 'Orders', href: '/client/orders', icon: ShoppingCart },
      { name: 'Customers', href: '/client/customers', icon: Users },
      { name: 'Discounts', href: '/client/discounts', icon: TicketPercent },
    ],
  },
  {
    title: 'Forms',
    items: [
      { name: 'Contact Forms', href: '/client/forms', icon: FileInput },
      { name: 'Booking Forms', href: '/client/bookings', icon: Calendar },
      { name: 'Submissions', href: '/client/submissions', icon: Inbox },
    ],
  },
  {
    title: 'Settings',
    items: [
      { name: 'Site Settings', href: '/client/settings', icon: Settings },
      { name: 'My Profile', href: '/client/profile', icon: User },
    ],
  },
]

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [expandedSections, setExpandedSections] = useState<string[]>(['Overview', 'Content', 'Store', 'Forms', 'Settings'])
  const [clientData, setClientData] = useState<Record<string, string> | null>(null)
  const [counts, setCounts] = useState({ products: 0, orders: 0, submissions: 0 })

  useEffect(() => {
    fetch('/api/client/me').then(r => r.ok ? r.json() : null).then(setClientData)
    Promise.all([
      fetch('/api/client/products').then(r => r.ok ? r.json() : []),
      fetch('/api/client/orders').then(r => r.ok ? r.json() : []),
      fetch('/api/client/submissions').then(r => r.ok ? r.json() : []),
    ]).then(([products, orders, submissions]) => {
      setCounts({
        products: (products as unknown[]).length,
        orders: (orders as Record<string,unknown>[]).filter((o) => o.fulfillment_status === 'pending').length,
        submissions: (submissions as Record<string,unknown>[]).filter((s) => s.status === 'new').length,
      })
    })
  }, [])

  const initials = clientData?.name
    ? clientData.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const handleLogout = async () => {
    await fetch('/api/auth/client/logout', { method: 'POST' })
    router.push('/client')
  }

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    )
  }

  return (
    <div className="min-h-screen bg-page-bg flex">
      <aside className="w-[260px] bg-sidebar border-r border-sidebar-border flex flex-col fixed h-screen">
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="850" className="w-10 h-10 object-contain" />
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-semibold text-sm truncate">{clientData?.name ?? 'My Website'}</h2>
              <p className="text-sidebar-muted text-xs">CMS Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navigationItems.map((section) => (
            <div key={section.title} className="mb-4">
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-sidebar-muted uppercase tracking-wider hover:text-white transition-colors"
              >
                {section.title}
                {expandedSections.includes(section.title) ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
              {expandedSections.includes(section.title) && (
                <div className="mt-1 space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all',
                          isActive
                            ? 'bg-brand-indigo text-white'
                            : 'text-gray-400 hover:bg-sidebar-border hover:text-white'
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <item.icon className="w-4 h-4" />
                          {item.name}
                        </span>
                        {item.href === '/client/products' && counts.products > 0 && (
                          <span className={cn('text-xs px-1.5 py-0.5 rounded-full', isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-300')}>{counts.products}</span>
                        )}
                        {item.href === '/client/orders' && counts.orders > 0 && (
                          <span className={cn('text-xs px-1.5 py-0.5 rounded-full', isActive ? 'bg-white/20 text-white' : 'bg-status-danger/20 text-status-danger')}>{counts.orders}</span>
                        )}
                        {item.href === '/client/submissions' && counts.submissions > 0 && (
                          <span className={cn('text-xs px-1.5 py-0.5 rounded-full', isActive ? 'bg-white/20 text-white' : 'bg-status-danger/20 text-status-danger')}>{counts.submissions}</span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-sidebar-border hover:text-white transition-all"
          >
            <HelpCircle className="w-4 h-4" />
            Help & Support
          </Link>
        </div>

        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{clientData?.name ?? 'My Account'}</p>
              <p className="text-sidebar-muted text-xs truncate">{clientData?.email ?? 'Signed in'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full mt-2 flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-sidebar-border hover:text-white transition-all">
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 ml-[260px]">
        <header className="h-16 bg-card border-b border-card-border flex items-center justify-between px-6 sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-semibold text-text-primary">
              {navigationItems.flatMap(s => s.items).find(i => pathname?.startsWith(i.href))?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="w-4 h-4" />
              Preview Site
              <ExternalLink className="w-3 h-3" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Bell className="w-5 h-5 text-text-secondary" />
                  {counts.submissions > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-status-danger rounded-full" />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {counts.submissions === 0 ? (
                  <DropdownMenuItem disabled className="text-text-muted justify-center text-sm py-4">
                    No new notifications
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <a href="/client/submissions" className="text-sm">
                      <Inbox className="w-4 h-4 mr-2" />
                      {counts.submissions} new form submission{counts.submissions > 1 ? 's' : ''}
                    </a>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-brand-indigo text-white">{initials}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{clientData?.name ?? 'My Account'}</p>
                    <p className="text-xs text-text-muted font-normal">{clientData?.email ?? ''}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-status-danger" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}