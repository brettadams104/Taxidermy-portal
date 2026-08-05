'use client'

import { useState } from 'react'
import { updateSkullStatusDirect } from '@/lib/actions/skulls'
import { SKULL_STATUSES } from '@/lib/constants'
import type { SkullStatus } from '@/lib/types'

interface Props {
  skullId: string
  currentStatus: SkullStatus
}

export function StatusDropdown({ skullId, currentStatus }: Props) {
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
        className="w-full px-3 py-2 border rounded-lg text-sm font-medium disabled:opacity-50 cursor-pointer"
      >
        {SKULL_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {error && <p className="text-red-600 text-xs">{error}</p>}
    </div>
  )
}
