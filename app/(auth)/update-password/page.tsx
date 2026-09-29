'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        background: 'linear-gradient(135deg, var(--background) 0%, var(--background-alt) 100%)'
      }}>
        <div className="w-full max-w-sm text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Password Updated!</h1>
          <p className="text-gray-600 mb-4">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
          <p className="text-sm text-gray-500">Redirecting to sign in...</p>
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
          <p className="text-gray-600">Set your new password</p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-5 bg-white rounded-xl p-8 shadow-md border border-gray-200">
          <p className="text-sm text-gray-600">
            Enter your new password below. Make it strong and unique.
          </p>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="At least 8 characters"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter your password"
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
            disabled={loading || !password || !confirmPassword}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg py-3 font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            {loading ? 'Updating...' : 'Update Password'}
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
