'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Eye, Save, MoreHorizontal, Plus, Image, Bold, Italic,
  Underline, Strikethrough, Link2, Code, Quote, List, ListOrdered, Minus,
  Undo, Redo, Heading1, Heading2, Heading3, X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const categories = ['Technology', 'Business', 'Lifestyle', 'Tutorial', 'News']
const existingTags = ['Next.js', 'React', 'Tutorial', 'Web Dev']

export default function NewBlogPostPage() {
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('draft')
  const [scheduledDate, setScheduledDate] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>(existingTags)
  const [newTag, setNewTag] = useState('')

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/client/blog" className="flex items-center gap-2 text-text-secondary hover:text-text-primary">
              <ArrowLeft className="w-4 h-4" />
              Back to blog
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <h3 className="font-medium">Writing: {title || 'Untitled post'}</h3>
            <Badge variant={status === 'published' ? 'green' : status === 'scheduled' ? 'blue' : 'amber'}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
            <Button variant="outline" size="sm" className="gap-2">
              <Save className="w-4 h-4" />
              Save draft
            </Button>
            <Button size="sm" className="gap-2">
              <Eye className="w-4 h-4" />
              Publish now
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Preview</DropdownMenuItem>
                <DropdownMenuItem>Schedule</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">
        <div className="flex-1 space-y-6">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title..."
            className="text-4xl font-bold border-0 bg-transparent px-0 focus:ring-0 shadow-none"
          />
          <Input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Subtitle or excerpt..."
            className="text-lg text-text-secondary border-0 bg-transparent px-0 focus:ring-0 shadow-none"
          />

          <Card>
            <div className="border-b p-2 flex items-center gap-1 flex-wrap sticky top-0 bg-white z-10">
              <button className="p-2 hover:bg-gray-100 rounded" title="Heading 1"><Heading1 className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-gray-100 rounded" title="Heading 2"><Heading2 className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-gray-100 rounded" title="Heading 3"><Heading3 className="w-4 h-4" /></button>
              <div className="w-px h-6 bg-gray-200 mx-1" />
              <button className="p-2 hover:bg-gray-100 rounded" title="Bold"><Bold className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-gray-100 rounded" title="Italic"><Italic className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-gray-100 rounded" title="Underline"><Underline className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-gray-100 rounded" title="Strikethrough"><Strikethrough className="w-4 h-4" /></button>
              <div className="w-px h-6 bg-gray-200 mx-1" />
              <button className="p-2 hover:bg-gray-100 rounded" title="Link"><Link2 className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-gray-100 rounded" title="Image"><Image className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-gray-100 rounded" title="Code"><Code className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-gray-100 rounded" title="Blockquote"><Quote className="w-4 h-4" /></button>
              <div className="w-px h-6 bg-gray-200 mx-1" />
              <button className="p-2 hover:bg-gray-100 rounded" title="Bullet List"><List className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-gray-100 rounded" title="Numbered List"><ListOrdered className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-gray-100 rounded" title="Divider"><Minus className="w-4 h-4" /></button>
              <div className="w-px h-6 bg-gray-200 mx-1" />
              <button className="p-2 hover:bg-gray-100 rounded" title="Undo"><Undo className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-gray-100 rounded" title="Redo"><Redo className="w-4 h-4" /></button>
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your post..."
              className="min-h-[400px] border-0 focus:ring-0 rounded-none resize-none"
            />
          </Card>

          <Button variant="outline" className="w-full border-dashed border-2">
            <Plus className="w-4 h-4 mr-2" />
            Add cover image
          </Button>
        </div>

        <div className="w-[400px] space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Publish settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 rounded-md border border-card-border bg-white px-3 py-2 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              {status === 'scheduled' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Schedule</label>
                  <Input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">Publish now</Button>
                {status === 'scheduled' && <Button className="flex-1">Schedule</Button>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map(cat => (
                <div key={cat} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedCategories.includes(cat)}
                    onCheckedChange={() => toggleCategory(cat)}
                    id={cat}
                  />
                  <label htmlFor={cat} className="text-sm cursor-pointer">{cat}</label>
                </div>
              ))}
              <button className="text-sm text-brand-indigo hover:underline mt-2">+ Add new category</button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  placeholder="Add a tag..."
                  className="flex-1"
                />
                <Button size="sm" onClick={addTag}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Featured image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center text-text-muted">
                No image selected
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">Change image</Button>
                <Button variant="ghost" size="sm" className="flex-1">Remove</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Meta title</label>
                <Input placeholder="Enter meta title..." />
                <span className="text-xs text-text-muted">0/60 characters</span>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Meta description</label>
                <Textarea placeholder="Enter meta description..." className="min-h-[80px]" />
                <span className="text-xs text-text-muted">0/160 characters</span>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">URL slug</label>
                <Input placeholder={title ? title.toLowerCase().replace(/\s+/g, '-') : 'post-url'} />
              </div>
              <Button variant="outline" size="sm" className="w-full">Preview</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}