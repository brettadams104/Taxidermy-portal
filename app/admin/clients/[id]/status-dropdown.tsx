'use client'

import { useState } from 'react'
import { updateSkullStatusDirect } from '@/lib/actions/skulls'
import type { SkullStatus } from '@/lib/types'

interface Props {
  skullId: string
  currentStatus: SkullStatus
  stages: string[]
}

export function StatusDropdown({ skullId, currentStatus, stages }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState(currentStatus)

  async function handleChange(newStatus: string) {
    setLoading(true)
    setError(null)
    try {
      await updateSkullStatusDirect(skullId, newStatus)
      setStatus(newStatus as SkullStatus)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
      setStatus(currentStatus)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value)}
        disabled={loading}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 disabled:opacity-50 cursor-pointer hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
      >
        {stages.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
    </div>
  )
}
