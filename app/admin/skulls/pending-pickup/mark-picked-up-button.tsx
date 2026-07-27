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
        className="w-full text-sm rounded-lg py-2 font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Marking as picked up...' : 'Mark as Picked Up'}
      </button>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </>
  )
}
