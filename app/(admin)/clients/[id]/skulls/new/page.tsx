'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { addSkull } from '@/lib/actions/skulls'
import { PAYMENT_OPTIONS } from '@/lib/constants'
import type { PaymentOption } from '@/lib/types'

export default function NewSkullPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    try {
      await addSkull({
        clientId: params.id,
        points: form.get('points') ? Number(form.get('points')) : null,
        dnrTagNumber: (form.get('dnr_tag_number') as string) || null,
        dateReceived: form.get('date_received') as string,
        price: form.get('price') ? Number(form.get('price')) : null,
        paymentOption: (form.get('payment_option') as PaymentOption) || null,
        notes: (form.get('notes') as string) || null,
      })
      router.push(`/admin/clients/${params.id}`)
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Add Skull</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white border rounded-xl p-4 shadow-sm">
        <div>
          <label className="block text-sm font-medium mb-1">Date Received</label>
          <input
            name="date_received"
            type="date"
            required
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Number of Points (optional)</label>
          <input
            name="points"
            type="number"
            min="0"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">DNR Tag Confirmation # (optional)</label>
          <input
            name="dnr_tag_number"
            type="text"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price (optional)</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              className="w-full border rounded-lg pl-7 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Payment Option (optional)</label>
          <select
            name="payment_option"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            {PAYMENT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notes — admin only (optional)</label>
          <textarea
            name="notes"
            rows={3}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Skull'}
        </button>
      </form>
    </div>
  )
}
