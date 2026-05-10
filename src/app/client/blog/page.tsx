'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search, Edit, Eye, MoreHorizontal, ChevronLeft, ChevronRight,
  Plus, ChevronDown
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

const blogPosts = [
  { id: '1', title: 'Getting Started with Next.js 14', category: 'Technology', status: 'published', views: 1250, publishedDate: '2024-01-15' },
  { id: '2', title: 'Building Modern Web Applications', category: 'Tutorial', status: 'published', views: 980, publishedDate: '2024-01-12' },
  { id: '3', title: 'The Future of AI in Web Development', category: 'News', status: 'published', views: 2100, publishedDate: '2024-01-10' },
  { id: '4', title: 'Mastering React Hooks', category: 'Tutorial', status: 'draft', views: 0, publishedDate: '' },
  { id: '5', title: 'Best Practices for API Design', category: 'Business', status: 'published', views: 850, publishedDate: '2024-01-08' },
  { id: '6', title: 'Introduction to TypeScript', category: 'Technology', status: 'scheduled', views: 0, publishedDate: '2024-01-25' },
  { id: '7', title: 'CSS Grid vs Flexbox', category: 'Tutorial', status: 'published', views: 1500, publishedDate: '2024-01-05' },
  { id: '8', title: 'Performance Optimization Tips', category: 'Technology', status: 'draft', views: 0, publishedDate: '' },
]

const filterTabs = ['All', 'Published', 'Draft', 'Scheduled'] as const
type FilterTab = typeof filterTabs[number]

const statusVariant = {
  published: 'green' as const,
  draft: 'gray' as const,
  scheduled: 'blue' as const,
}

export default function BlogPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = activeFilter === 'All' ||
      (activeFilter === 'Published' && post.status === 'published') ||
      (activeFilter === 'Draft' && post.status === 'draft') ||
      (activeFilter === 'Scheduled' && post.status === 'scheduled')
    return matchesSearch && matchesFilter
  })

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPosts.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredPosts.map(p => p.id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog & Posts</h1>
          <p className="text-text-secondary mt-1">Manage your blog posts and articles</p>
        </div>
        <Link href="/client/blog/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Write new post
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white rounded-lg border border-card-border p-1">
          {filterTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                activeFilter === tab
                  ? 'bg-brand-indigo text-white'
                  : 'text-text-secondary hover:bg-gray-50'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10"
            />
          </div>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 rounded-md border border-card-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/20 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%2364748B%22%20d%3D%22M6%208.5L1.5%204h9z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_12px_center] pr-8"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="views">Most views</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === filteredPosts.length && filteredPosts.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(post.id)}
                    onCheckedChange={() => toggleSelect(post.id)}
                  />
                </TableCell>
                <TableCell>
                  <Link href={`/client/blog/${post.id}`} className="font-medium hover:text-brand-indigo">
                    {post.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="indigo">{post.category}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[post.status as keyof typeof statusVariant]}>
                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-text-muted">{post.views.toLocaleString()}</TableCell>
                <TableCell className="text-text-muted text-sm">
                  {post.publishedDate ? new Date(post.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Link href={`/client/blog/${post.id}`}>
                      <Button variant="ghost" size="icon-sm" title="Edit">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon-sm" title="Preview">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-status-danger">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="px-4 py-3 border-t border-card-border flex items-center justify-between">
          <p className="text-xs text-text-secondary">Showing 1–{filteredPosts.length} of {filteredPosts.length} posts</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-sm" disabled>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="default" size="icon-sm">1</Button>
            <Button variant="outline" size="icon-sm">2</Button>
            <Button variant="outline" size="icon-sm">3</Button>
            <Button variant="outline" size="icon-sm">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}