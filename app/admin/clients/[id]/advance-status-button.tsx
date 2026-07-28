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
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nextStatus = getNextStatus(currentStatus)

  if (!nextStatus) return null

  const isFinishing = nextStatus === 'Finished'

  async function handleClick() {
    if (isFinishing && !confirming) {
      setConfirming(true)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      await advanceSkullStatus(skullId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to advance status')
      setConfirming(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`w-full text-sm rounded-lg py-2 font-medium disabled:opacity-50 ${
          confirming
            ? 'bg-orange-500 text-white hover:bg-orange-600'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {loading ? 'Updating...' : confirming
          ? `Confirm Mark as Finished (sends notification)`
          : `Advance → ${nextStatus}`}
      </button>
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </>
  )
}
