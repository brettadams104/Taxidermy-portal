'use client'

import { useState } from 'react'
import { advanceSkullStatus, completeSkullPayment } from '@/lib/actions/skulls'
import type { SkullStatus } from '@/lib/types'

interface Props {
  skullId: string
  currentStatus: SkullStatus
  stages: string[]
  price?: number | null
  amountPaid?: number | null
}

export function AdvanceStatusButton({ skullId, currentStatus, stages, price, amountPaid }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const currentIndex = stages.indexOf(currentStatus)
  const nextStatus = currentIndex >= 0 && currentIndex < stages.length - 1
    ? stages[currentIndex + 1]
    : null

  const isFinalStage = nextStatus === stages[stages.length - 1]
  const hasPrice = price != null && price > 0

  if (!nextStatus) return null

  async function handleAdvance(markAsPaid: boolean = false) {
    setLoading(true)
    setError(null)
    try {
      if (markAsPaid && price) {
        await completeSkullPayment(skullId, price)
      }
      await advanceSkullStatus(skullId)
      setShowPaymentModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to advance status')
    } finally {
      setLoading(false)
    }
  }

  async function handleClick() {
    // Show payment modal when advancing to final stage if there's a price
    if (isFinalStage && hasPrice) {
      setShowPaymentModal(true)
    } else {
      handleAdvance()
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full text-sm rounded-lg py-3 font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
      >
        {loading ? 'Updating...' : `Advance → ${nextStatus}`}
      </button>
      {error && <p className="text-red-600 text-sm font-medium mt-2">{error}</p>}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl max-w-sm shadow-xl space-y-5">
            <h3 className="text-lg font-bold text-gray-900">Complete Payment?</h3>
            <div className="space-y-3 text-sm">
              <p className="text-gray-700">
                This skull is being moved to <strong>{nextStatus}</strong>.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-gray-700">Total: <span className="font-semibold text-gray-900">${price?.toFixed(2)}</span></p>
                <p className="text-gray-700">Paid: <span className="font-semibold text-gray-900">${amountPaid?.toFixed(2)}</span></p>
                <p className="text-red-600 font-semibold">Outstanding: ${((price ?? 0) - (amountPaid ?? 0)).toFixed(2)}</p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleAdvance(false)}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 disabled:opacity-50 text-sm font-semibold transition-all"
              >
                {loading ? '...' : 'No, Keep Balance'}
              </button>
              <button
                onClick={() => handleAdvance(true)}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-semibold transition-all"
              >
                {loading ? '...' : 'Yes, Mark Paid'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
