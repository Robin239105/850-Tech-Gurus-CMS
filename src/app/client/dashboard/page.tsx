'use client'

import Link from 'next/link'
import {
  FileText, Plus, TrendingUp, Users, FileInput, Inbox, Eye as EyeIcon, Settings, ExternalLink, Edit
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '@/components/ui/table'

export default function ClientDashboard() {
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
          <h1 className="text-2xl font-bold text-text-primary">Welcome to your dashboard</h1>
          <p className="text-text-secondary mt-1">Manage your website content and settings</p>
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
                <p className="text-2xl font-bold mt-1">—</p>
                <p className="text-xs text-text-muted mt-1">Add pages to get started</p>
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
                <p className="text-2xl font-bold mt-1">—</p>
                <p className="text-xs text-text-muted mt-1">Upload media to get started</p>
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
                <p className="text-2xl font-bold mt-1">—</p>
                <p className="text-xs text-text-muted mt-1">No submissions yet</p>
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
                <p className="text-2xl font-bold mt-1">—</p>
                <p className="text-xs text-text-muted mt-1">No products yet</p>
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
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-text-muted py-8">
                      No pages yet — <Link href="/client/pages/new" className="text-brand-indigo hover:underline">create your first page</Link>
                    </TableCell>
                  </TableRow>
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
                <p className="text-text-muted text-sm text-center py-4">No recent activity yet</p>
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
              <p className="text-text-muted text-sm text-center py-8">Analytics will appear once your site has traffic</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
