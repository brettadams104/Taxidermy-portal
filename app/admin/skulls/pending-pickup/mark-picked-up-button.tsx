'use client'

import { useState } from 'react'
import { updateSkullStatusDirect } from '@/lib/actions/skulls'

export function MarkPickedUpButton({ skullId }: { skullId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleMarkPickedUp = async () => {
    try {
      setLoading(true)
      setError(null)
      await updateSkullStatusDirect(skullId, 'Picked Up')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as picked up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleMarkPickedUp}
        disabled={loading}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
      >
        {loading ? 'Marking...' : 'Mark as Picked Up'}
      </button>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </>
  )
}
