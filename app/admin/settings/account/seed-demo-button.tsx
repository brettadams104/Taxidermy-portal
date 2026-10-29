'use client'

import { useState } from 'react'

export function SeedDemoButton() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSeedDemo() {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/admin/api/seed-demo', {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to seed demo data')
      }

      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/admin/dashboard'
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seed demo data')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        Populate your account with realistic demo data: 200 clients, 170 completed projects from 2025, and 40 projects from 2026 with various payment statuses.
      </p>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">✓ Demo data created! Redirecting...</p>
        </div>
      )}

      <button
        onClick={handleSeedDemo}
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg py-3 font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
      >
        {loading ? 'Creating Demo Data...' : 'Seed Demo Data (200 Clients, 210 Projects)'}
      </button>
    </div>
  )
}
