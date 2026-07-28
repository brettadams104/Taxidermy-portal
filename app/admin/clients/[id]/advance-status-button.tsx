'use client'

import { useState } from 'react'
import { advanceSkullStatus } from '@/lib/actions/skulls'
import { getNextStatus } from '@/lib/actions/skull-helpers'
import type { SkullStatus } from '@/lib/types'

interface Props {
  skullId: string
  currentStatus: SkullStatus
}

export function AdvanceStatusButton({ skullId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nextStatus = getNextStatus(currentStatus)

  if (!nextStatus) return null

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      await advanceSkullStatus(skullId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to advance status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full text-sm rounded-lg py-2 font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Updating...' : `Advance → ${nextStatus}`}
      </button>
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </>
  )
}
