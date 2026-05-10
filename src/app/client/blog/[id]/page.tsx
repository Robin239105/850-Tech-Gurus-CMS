'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Send, Trash2, Loader2, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const categories = ['Technology', 'Business', 'Lifestyle', 'Tutorial', 'News']

type Post = {
  id: string; title: string; slug: string; excerpt: string | null
  content: string | null; category: string | null; status: string
  meta_title: string | null; meta_description: string | null
}

export default function BlogPostEditorPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('draft')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    fetch('/api/client/blog')
      .then(r => r.ok ? r.json() : [])
      .then((posts: Post[]) => {
        const post = posts.find((p: Post) => p.id === id)
        if (post) {
          setTitle(post.title)
          setSlug(post.slug)
          setExcerpt(post.excerpt ?? '')
          setContent(post.content ?? '')
          setCategory(post.category ?? '')
          setStatus(post.status)
          setMetaTitle(post.meta_title ?? '')
          setMetaDescription(post.meta_description ?? '')
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  const save = async (overrideStatus?: string) => {
    if (!title.trim()) { setError('Title is required'); return }
    setError('')
    setSaving(true)
    try {
      const res = await fetch('/api/client/blog', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id, title, slug, excerpt, content, category,
          status: overrideStatus ?? status,
          meta_title: metaTitle, meta_description: metaDescription,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message ?? 'Failed to save'); return }
      setStatus(data.status)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    await fetch('/api/client/blog', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    router.push('/client/blog')
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen text-text-muted">Loading post…</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/client/blog" className="flex items-center gap-2 text-text-secondary hover:text-text-primary">
            <ArrowLeft className="w-4 h-4" />
            Back to blog
          </Link>
          <div className="flex items-center gap-3">
            <h3 className="font-medium text-sm truncate max-w-xs">{title || 'Untitled post'}</h3>
            {saved && <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle className="w-4 h-4" />Saved</span>}
            <Badge variant={status === 'published' ? 'green' : status === 'scheduled' ? 'blue' : 'amber'}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => save('draft')} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save draft
            </Button>
            <Button size="sm" className="gap-2" onClick={() => save('published')} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Publish now
            </Button>
            <Button
              variant={confirmDelete ? 'danger' : 'ghost'}
              size="sm"
              onClick={handleDelete}
              onBlur={() => setConfirmDelete(false)}
              title="Delete post"
              className="gap-1"
            >
              <Trash2 className="w-4 h-4" />
              {confirmDelete ? 'Confirm?' : ''}
            </Button>
          </div>
        </div>
        {error && <div className="bg-red-50 border-t border-red-200 text-red-600 text-sm px-6 py-2">{error}</div>}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">
        <div className="flex-1 space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title..."
            className="text-2xl font-bold border-0 bg-transparent px-0 focus:ring-0 shadow-none"
          />
          <Input
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short excerpt / subtitle..."
            className="text-base text-text-secondary border-0 bg-transparent px-0 focus:ring-0 shadow-none"
          />
          <Card>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post here... (Markdown supported)"
              className="min-h-[500px] border-0 focus:ring-0 rounded-none resize-none font-mono text-sm"
            />
          </Card>
        </div>

        <div className="w-[320px] space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Publish settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 rounded-md border border-card-border bg-white px-3 py-2 text-sm">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 rounded-md border border-card-border bg-white px-3 py-2 text-sm">
                  <option value="">— None —</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => save('draft')} disabled={saving}>Save draft</Button>
                <Button className="flex-1" onClick={() => save('published')} disabled={saving}>Publish</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">URL slug</CardTitle></CardHeader>
            <CardContent>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="post-url-slug" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">SEO</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Meta title</label>
                <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="SEO title..." />
                <span className="text-xs text-text-muted">{metaTitle.length}/60</span>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Meta description</label>
                <Textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="SEO description..." className="min-h-[80px]" />
                <span className="text-xs text-text-muted">{metaDescription.length}/160</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}