'use client'

import { useState, useEffect } from 'react'
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


const filterTabs = ['All', 'Published', 'Draft', 'Scheduled'] as const
type FilterTab = typeof filterTabs[number]

const statusVariant = {
  published: 'green' as const,
  draft: 'gray' as const,
  scheduled: 'blue' as const,
}

type Post = { id: string; title: string; category: string | null; status: string; views: number; published_at: string | null; created_at: string }

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/client/blog').then(r => r.ok ? r.json() : []).then(setPosts).finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    await fetch('/api/client/blog', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = activeFilter === 'All' ||
      (activeFilter === 'Published' && post.status === 'published') ||
      (activeFilter === 'Draft' && post.status === 'draft') ||
      (activeFilter === 'Scheduled' && post.status === 'scheduled')
    return matchesSearch && matchesFilter
  })

  const toggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  const toggleSelectAll = () => selectedIds.length === filteredPosts.length ? setSelectedIds([]) : setSelectedIds(filteredPosts.map(p => p.id))

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
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-text-muted">Loading…</TableCell></TableRow>
            ) : filteredPosts.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-text-muted">
                {posts.length === 0 ? <span>No posts yet — <Link href="/client/blog/new" className="text-brand-indigo hover:underline">write your first post</Link></span> : 'No posts match this filter'}
              </TableCell></TableRow>
            ) : filteredPosts.map((post) => (
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
                <TableCell className="text-text-muted">{(post.views ?? 0).toLocaleString()}</TableCell>
                <TableCell className="text-text-muted text-sm">
                  {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
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
                        <DropdownMenuItem className="text-status-danger" onClick={() => handleDelete(post.id)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="px-4 py-3 border-t border-card-border flex items-center justify-between">
          <p className="text-xs text-text-secondary">Showing {filteredPosts.length} of {posts.length} posts</p>
        </div>
      </Card>
    </div>
  )
}