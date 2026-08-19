'use client'

import { useState } from 'react'
import { updateBusinessName } from '@/lib/actions/business'
import type { Business } from '@/lib/types/business'

interface Props {
  business: Business
  userEmail: string
}

export function AccountForm({ business, userEmail }: Props) {
  const [businessName, setBusinessName] = useState(business.business_name || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await updateBusinessName(businessName)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update business name')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Email Address (read-only)</label>
        <input
          type="email"
          value={userEmail}
          readOnly
          className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-600"
        />
        <p className="text-xs text-gray-500 mt-1">Your email cannot be changed</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Business Name</label>
        <input
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Enter your business name"
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">This will be displayed throughout your dashboard</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">Business name updated successfully!</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !businessName.trim()}
        className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}
