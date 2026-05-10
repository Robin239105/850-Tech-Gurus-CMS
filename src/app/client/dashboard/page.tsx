'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  FileText, Plus, Eye, Edit, Copy, MoreHorizontal, Trash2,
  LayoutDashboard, TrendingUp, Users, FileInput, Inbox, Eye as EyeIcon, Settings, ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

const recentPages = [
  { id: '1', title: 'Home', slug: '/', status: 'published', lastEdited: '2 hours ago', editor: 'John Smith' },
  { id: '2', title: 'About Us', slug: '/about', status: 'published', lastEdited: '1 day ago', editor: 'John Smith' },
  { id: '3', title: 'Services', slug: '/services', status: 'published', lastEdited: '3 days ago', editor: 'Jane Doe' },
  { id: '4', title: 'Contact', slug: '/contact', status: 'draft', lastEdited: '5 days ago', editor: 'John Smith' },
  { id: '5', title: 'Blog', slug: '/blog', status: 'published', lastEdited: '1 week ago', editor: 'Jane Doe' },
]

const activityFeed = [
  { action: 'You edited the Home page', time: '2 hours ago' },
  { action: 'New form submission: Contact Us', time: '5 hours ago' },
  { action: 'You uploaded hero-image.jpg', time: '1 day ago' },
  { action: 'New order received: #ORD-0042', time: '1 day ago' },
  { action: 'You published the About Us page', time: '2 days ago' },
]

const pageViewsData = [
  { day: 'Mon', views: 120 },
  { day: 'Tue', views: 150 },
  { day: 'Wed', views: 180 },
  { day: 'Thu', views: 200 },
  { day: 'Fri', views: 170 },
  { day: 'Sat', views: 90 },
  { day: 'Sun', views: 75 },
]

export default function ClientDashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const maxViews = Math.max(...pageViewsData.map(d => d.views))

  const quickActions = [
    { label: 'Add new page', icon: Plus, href: '/client/pages/new' },
    { label: 'Upload media', icon: FileInput, href: '/client/media' },
    { label: 'View analytics', icon: TrendingUp, href: '/client/analytics' },
    { label: 'Site settings', icon: Settings, href: '/client/settings' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Good morning, John 👋</h1>
          <p className="text-text-secondary mt-1">Your site is live · Last updated: 2 hours ago</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <EyeIcon className="w-4 h-4" />
            View Live Site
            <ExternalLink className="w-3 h-3" />
          </Button>
          <Button className="gap-2">
            <Edit className="w-4 h-4" />
            Edit Homepage
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-secondary">Total Pages</p>
                <p className="text-2xl font-bold mt-1">12</p>
                <p className="text-xs text-text-muted mt-1">9 published, 3 draft</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-brand-indigo/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-brand-indigo" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-secondary">Media Files</p>
                <p className="text-2xl font-bold mt-1">84</p>
                <p className="text-xs text-text-muted mt-1">3 uploaded this month</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-status-success/10 flex items-center justify-center">
                <FileInput className="w-6 h-6 text-status-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-secondary">Form Submissions</p>
                <p className="text-2xl font-bold mt-1">24</p>
                <p className="text-xs text-status-warning mt-1">5 new unread</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-status-warning/10 flex items-center justify-center">
                <Inbox className="w-6 h-6 text-status-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-secondary">Products</p>
                <p className="text-2xl font-bold mt-1">48</p>
                <p className="text-xs text-text-muted mt-1">2 out of stock</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-brand-cyan" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Pages</CardTitle>
                <CardDescription>Manage your website pages</CardDescription>
              </div>
              <div className="flex gap-2">
                <Link href="/client/pages">
                  <Button variant="ghost" size="sm">View all</Button>
                </Link>
                <Link href="/client/pages/new">
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add new page
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page title</TableHead>
                    <TableHead>URL slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last edited</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">{page.title}</TableCell>
                      <TableCell className="text-text-muted font-mono text-xs">{page.slug}</TableCell>
                      <TableCell>
                        <Badge variant={page.status === 'published' ? 'green' : 'gray'}>
                          {page.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-text-muted text-xs">{page.lastEdited}</TableCell>
                      <TableCell>
                        <Link href={`/client/pages/${page.id}`}>
                          <Button variant="ghost" size="icon-sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityFeed.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-brand-indigo" />
                    <span className="text-text-primary">{item.action}</span>
                    <span className="text-text-muted ml-auto text-xs">{item.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href}>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-gray-50 hover:text-text-primary transition-colors">
                    <action.icon className="w-4 h-4" />
                    {action.label}
                  </button>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Site Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-status-success" />
                <span>Your site is live</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-status-success" />
                <span>SSL active</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-status-success" />
                <span>Last backup: 8h ago</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-status-warning" />
                <span>SEO score: 68/100</span>
                <Link href="/client/settings" className="text-brand-indigo text-xs ml-auto">Improve →</Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Page Views (7 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1.5 h-24">
                {pageViewsData.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-brand-indigo/20 rounded-t-md transition-all hover:bg-brand-indigo/30"
                      style={{ height: `${(d.views / maxViews) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5 mt-2">
                {pageViewsData.map((d) => (
                  <span key={d.day} className="flex-1 text-center text-xs text-text-muted">{d.day}</span>
                ))}
              </div>
              <div className="flex justify-between mt-3 text-xs text-text-muted">
                <span>Total: 985 views</span>
                <span>Avg: 141/day</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
