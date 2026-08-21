'use client'

import { useState } from 'react'
import { logPayment } from '@/lib/actions/payments'

export function LogPaymentForm({ skullId }: { skullId: string }) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await logPayment(skullId, Number(amount))
      setAmount('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="relative flex-1">
        <span className="absolute left-4 top-3 text-gray-600 text-sm font-medium">$</span>
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Amount received"
          required
          className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !amount}
        className="bg-green-600 text-white rounded-lg px-6 py-3 text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
      >
        {loading ? 'Processing...' : 'Log Payment'}
      </button>
    </form>
  )
}
