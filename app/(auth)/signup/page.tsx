'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Validation helpers
function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address'
  }
  return null
}

function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long'
  }
  return null
}

// Error message mapping for user-friendly messages
function getUserFriendlyError(error: string): string {
  if (error.includes('already registered')) {
    return 'This email is already registered. Try signing in instead.'
  }
  if (error.includes('invalid email')) {
    return 'Please enter a valid email address'
  }
  if (error.includes('password')) {
    return 'Password does not meet security requirements'
  }
  if (error.includes('network') || error.includes('failed to fetch')) {
    return 'Network error. Please check your connection and try again.'
  }
  return 'An error occurred. Please try again.'
}

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [businessCreationWarning, setBusinessCreationWarning] = useState<string | null>(null)
  const [showWarningModal, setShowWarningModal] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate inputs
    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      setLoading(false)
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })

      if (signupError) {
        setError(getUserFriendlyError(signupError.message))
        setLoading(false)
        return
      }

      if (!data.user?.id) {
        setError('Failed to create account. Please try again.')
        setLoading(false)
        return
      }

      const userId = data.user.id

      // Attempt to create business for user
      try {
        const response = await fetch('/auth/create-business', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            businessName: `${email.split('@')[0]}'s Studio`,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          // Show warning modal but don't block signup
          setBusinessCreationWarning(
            errorData.error || 'Failed to create business account'
          )
          setShowWarningModal(true)
          // Still show email confirmation message
          setSubmitted(true)
          return
        }

        // Business created successfully
        setSubmitted(true)
        // Small delay before redirecting to allow email confirmation
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } catch (businessError) {
        // Network or other error creating business, but don't block signup
        setBusinessCreationWarning(
          'Account created but business setup encountered an issue. Please contact support if needed.'
        )
        setShowWarningModal(true)
        setSubmitted(true)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(getUserFriendlyError(message))
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <h1 className="text-2xl font-bold mb-2">Check your email</h1>
          <p className="text-gray-600">We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.</p>

          {showWarningModal && businessCreationWarning && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> {businessCreationWarning}
              </p>
              <button
                onClick={() => setShowWarningModal(false)}
                className="mt-3 text-yellow-600 hover:text-yellow-700 font-medium text-sm"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
