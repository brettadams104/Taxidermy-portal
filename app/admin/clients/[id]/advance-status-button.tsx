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
  const hasOutstandingBalance = price && amountPaid ? price > amountPaid : false

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
    if (isFinalStage && hasOutstandingBalance) {
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
        className="w-full text-sm rounded-lg py-2 font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Updating...' : `Advance → ${nextStatus}`}
      </button>
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm shadow-lg space-y-4">
            <h3 className="text-lg font-bold">Complete Payment?</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700">
                This skull is being moved to <strong>{nextStatus}</strong>.
              </p>
              <div className="bg-gray-50 p-3 rounded space-y-1">
                <p className="text-gray-600">Total: <span className="font-medium">${price?.toFixed(2)}</span></p>
                <p className="text-gray-600">Paid: <span className="font-medium">${amountPaid?.toFixed(2)}</span></p>
                <p className="text-red-600 font-medium">Outstanding: ${((price ?? 0) - (amountPaid ?? 0)).toFixed(2)}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleAdvance(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 disabled:opacity-50 text-sm font-medium"
              >
                {loading ? '...' : 'No, Keep Balance'}
              </button>
              <button
                onClick={() => handleAdvance(true)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
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
