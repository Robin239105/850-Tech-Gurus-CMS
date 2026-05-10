'use client'

import { useState, useEffect } from 'react'
import { Save, CheckCircle, User, Mail, Globe, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

type ClientProfile = {
  name: string
  email: string
  website: string | null
  plan: string | null
  status: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ClientProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSaved, setPwSaved] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)

  useEffect(() => {
    fetch('/api/client/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setProfile(data)
          setName(data.name ?? '')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const handleSaveName = async () => {
    setSaving(true)
    await fetch('/api/client/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    setProfile(prev => prev ? { ...prev, name } : prev)
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleChangePassword = async () => {
    setPwError('')
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match'); return }
    if (newPassword.length < 8) { setPwError('Password must be at least 8 characters'); return }
    setPwSaving(true)
    const res = await fetch('/api/client/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    if (!res.ok) {
      const data = await res.json()
      setPwError(data.error ?? 'Failed to update password')
    } else {
      setPwSaved(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPwSaved(false), 3000)
    }
    setPwSaving(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-48 text-text-muted">Loading…</div>
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-text-secondary mt-1">Manage your account details and password</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-xl bg-brand-indigo text-white">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-lg">{profile?.name}</p>
              <p className="text-sm text-text-muted capitalize">{profile?.plan ?? 'Standard'} plan · {profile?.status}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Display Name</label>
            <div className="mt-1.5 flex gap-2">
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="flex-1"
              />
              <Button onClick={handleSaveName} disabled={saving || name === profile?.name}>
                {saved ? <CheckCircle className="w-4 h-4 mr-2 text-status-success" /> : <Save className="w-4 h-4 mr-2" />}
                {saved ? 'Saved' : saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Email Address</label>
            <div className="mt-1.5 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md border border-card-border">
              <Mail className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-secondary">{profile?.email}</span>
              <span className="ml-auto text-xs text-text-muted">Contact support to change</span>
            </div>
          </div>

          {profile?.website && (
            <div>
              <label className="text-sm font-medium">Website</label>
              <div className="mt-1.5 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md border border-card-border">
                <Globe className="w-4 h-4 text-text-muted" />
                <span className="text-sm text-text-secondary">{profile.website}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Current Password</label>
            <Input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="text-sm font-medium">New Password</label>
            <Input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Confirm New Password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="mt-1.5"
            />
          </div>
          {pwError && <p className="text-sm text-status-danger">{pwError}</p>}
          <Button
            onClick={handleChangePassword}
            disabled={pwSaving || !currentPassword || !newPassword || !confirmPassword}
            className="w-full"
          >
            {pwSaved ? <CheckCircle className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
            {pwSaved ? 'Password updated!' : pwSaving ? 'Updating…' : 'Update Password'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
