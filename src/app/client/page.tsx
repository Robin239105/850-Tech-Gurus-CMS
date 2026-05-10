'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Check, ChevronRight, Globe, Zap, Shield, Layers, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

export default function ClientLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const [loginError, setLoginError] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setLoginError('')
    try {
      const res = await fetch('/api/auth/client/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      })
      const data = await res.json()
      if (!res.ok) {
        setLoginError(data.message ?? 'Invalid email or password.')
      } else {
        router.push('/client/dashboard')
      }
    } catch {
      setLoginError('Unable to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setForgotSuccess('')
    try {
      await fetch('/api/auth/client/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      })
      setForgotSuccess('If that email exists, a reset link has been sent.')
      setForgotEmail('')
    } catch {
      setForgotSuccess('If that email exists, a reset link has been sent.')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: Layers, text: 'Unlimited pages & posts' },
    { icon: Zap, text: 'Real-time content editing' },
    { icon: Globe, text: 'SEO optimized outputs' },
    { icon: Shield, text: 'Enterprise security' },
  ]

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo.png" alt="850" className="w-12 h-12 object-contain" />
            <div>
              <h1 className="text-white text-xl font-bold">Tech Gurus</h1>
              <p className="text-sidebar-muted text-sm">CMS Platform</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Your website,<br />your way.
          </h2>
          <p className="text-gray-400 text-lg mb-12">
            Everything you need to build, manage, and grow your online presence.
          </p>
          <div className="space-y-4 mb-12">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-indigo/20 flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-brand-indigo" />
                </div>
                <span className="text-gray-300">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-sidebar-border/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-indigo to-brand-cyan flex items-center justify-center">
              <span className="text-white font-semibold text-sm">AC</span>
            </div>
            <div>
              <p className="text-white font-medium">Acme Corporation</p>
              <p className="text-sidebar-muted text-sm">Business Plan</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm italic">
            "This platform saved us 20+ hours per week on content management. Highly recommend!"
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-page-bg">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-brand-indigo flex items-center justify-center">
              <span className="text-white font-bold text-lg">850</span>
            </div>
            <span className="text-text-primary font-bold text-lg">Tech Gurus</span>
          </div>

          {!showForgotPassword ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome back</h2>
                <p className="text-text-secondary">Sign in to manage your website</p>
              </div>

              {loginError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs text-brand-indigo hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1.5 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-card-border text-brand-indigo focus:ring-brand-indigo/20"
                    />
                    <span className="text-sm text-text-secondary">Remember me</span>
                  </label>
                </div>

                <Button type="submit" className="w-full" loading={loading}>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-8">
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="text-sm text-text-secondary hover:text-brand-indigo mb-4 flex items-center gap-1"
                >
                  Back to sign in
                </button>
                <h2 className="text-2xl font-bold text-text-primary mb-2">Reset password</h2>
                <p className="text-text-secondary">Enter your email and we'll send you a reset link</p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <Label htmlFor="forgot-email">Email address</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="you@company.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="mt-1.5"
                    required
                  />
                </div>

                {forgotSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                    {forgotSuccess}
                  </div>
                )}

                <Button type="submit" className="w-full" loading={loading}>
                  Send reset link
                </Button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-text-secondary mt-8">
            Don't have an account?{' '}
            <a href="#" className="text-brand-indigo hover:underline font-medium">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  )
}