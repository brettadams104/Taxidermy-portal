'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        background: 'linear-gradient(135deg, var(--background) 0%, var(--background-alt) 100%)'
      }}>
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-xl p-8 shadow-md border border-green-200 text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900">Check your email</h1>
            <p className="text-gray-600 mb-4">
              We sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Click the link in the email to reset your password. The link will expire in 1 hour for security.
            </p>
            <Link href="/login" className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg py-3 font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, var(--background) 0%, var(--background-alt) 100%)'
    }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
            Skull Studio
          </h1>
          <p className="text-gray-600">Reset your password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl p-8 shadow-md border border-gray-200">
          <p className="text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all text-sm"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg py-3 font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
