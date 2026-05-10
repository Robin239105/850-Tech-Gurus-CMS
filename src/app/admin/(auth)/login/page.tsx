'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [show2FA, setShow2FA] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message ?? 'Invalid credentials. Please try again.')
      } else {
        setShow2FA(true)
      }
    } catch {
      setError('Unable to connect. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0]
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleVerify = async () => {
    setIsVerifying(true)
    setError('')
    try {
      const res = await fetch('/api/auth/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otp.join('') }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message ?? 'Invalid code. Please try again.')
      } else {
        router.push('/admin/dashboard')
      }
    } catch {
      setError('Verification failed. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="min-h-screen bg-sidebar flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl shadow-modal p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-brand-indigo text-white text-2xl font-bold mb-4">
              850
            </div>
            <h1 className="text-2xl font-semibold text-text-primary">Tech Gurus</h1>
            <h2 className="text-h3 text-text-secondary mt-1">Admin Portal</h2>
            <div className="flex items-center justify-center gap-2 mt-3 text-status-danger">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">Protected with 2FA</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-status-danger flex-shrink-0" />
              <p className="text-sm text-status-danger">{error}</p>
            </div>
          )}

          {!show2FA ? (
            <form onSubmit={handleLogin}>
              <div className="space-y-5">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label htmlFor="remember" className="text-sm text-text-secondary cursor-pointer">
                      Remember me
                    </Label>
                  </div>
                  <a href="#" className="text-sm text-brand-indigo hover:underline">
                    Forgot password?
                  </a>
                </div>

                <Button type="submit" className="w-full h-12" loading={isLoading}>
                  Sign in to Admin Panel
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <h3 className="text-h3 text-text-primary mb-2">Two-Factor Authentication</h3>
              <p className="text-sm text-text-secondary mb-6">Enter the 6-digit code from your authenticator app</p>

              <div className="flex justify-center gap-2 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-semibold border border-card-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-indigo/20 focus:border-brand-indigo"
                  />
                ))}
              </div>

              <Button onClick={handleVerify} className="w-full h-12" loading={isVerifying}>
                Verify & Sign In
              </Button>

              <button
                onClick={() => setShow2FA(false)}
                className="mt-4 text-sm text-text-secondary hover:text-text-primary"
              >
                Back to login
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-sidebar-muted mt-6">
          © 2026 850 Tech Gurus. All rights reserved.
        </p>
      </div>
    </div>
  )
}