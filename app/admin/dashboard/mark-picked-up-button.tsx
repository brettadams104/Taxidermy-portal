'use client'

import { useState } from 'react'
import { markSkullAsPickedUp } from '@/lib/actions/skulls'

interface Props {
  skullId: string
}

export function MarkPickedUpButton({ skullId }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      await markSkullAsPickedUp(skullId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as picked up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Marking...' : 'Mark Picked Up'}
      </button>
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </>
  )
}
