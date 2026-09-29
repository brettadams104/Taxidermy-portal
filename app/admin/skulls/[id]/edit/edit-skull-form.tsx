'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateSkull, deleteSkull } from '@/lib/actions/skulls'
import { PAYMENT_OPTIONS } from '@/lib/constants'
import type { PaymentOption } from '@/lib/types'

interface Skull {
  id: string
  date_received: string
  points: number | null
  dnr_tag_number: string | null
  price: number | null
  payment_option: string | null
  notes: string | null
  client_id: string
}

export function EditSkullForm({ skull }: { skull: Skull }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    try {
      await updateSkull(skull.id, {
        dateReceived: form.get('date_received') as string,
        points: form.get('points') ? Number(form.get('points')) : null,
        dnrTagNumber: (form.get('dnr_tag_number') as string) || null,
        price: form.get('price') ? Number(form.get('price')) : null,
        paymentOption: (form.get('payment_option') as PaymentOption) || null,
        notes: (form.get('notes') as string) || null,
      })
      router.back()
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteSkull(skull.id)
      router.push(`/admin/clients/${skull.client_id}`)
    } catch (err) {
      setError((err as Error).message)
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl p-8 shadow-md">
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-900">Date Received</label>
          <input
            name="date_received"
            type="date"
            required
            defaultValue={skull.date_received}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-900">Number of Points (optional)</label>
          <input
            name="points"
            type="number"
            min="0"
            defaultValue={skull.points ?? ''}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-900">DNR Tag Confirmation # (optional)</label>
          <input
            name="dnr_tag_number"
            type="text"
            defaultValue={skull.dnr_tag_number ?? ''}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-900">Price (optional)</label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-gray-600 font-medium">$</span>
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={skull.price ?? ''}
              className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-900">Payment Option (optional)</label>
          <select
            name="payment_option"
            defaultValue={skull.payment_option ?? ''}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500 transition-all"
          >
            <option value="">Select...</option>
            {PAYMENT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-900">Notes — admin only (optional)</label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={skull.notes ?? ''}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500 transition-all"
          />
        </div>
        {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg py-3 font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full border border-gray-300 rounded-lg py-3 font-semibold hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </form>

      {/* Delete Section */}
      <div className="bg-white rounded-xl p-8 shadow-md space-y-4 border border-red-100">
        <div>
          <p className="text-sm font-semibold text-red-600">Delete Skull</p>
          <p className="text-sm text-gray-600 mt-1">Permanently remove this skull and all associated data. This cannot be undone.</p>
        </div>
        {confirming ? (
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 bg-red-600 text-white rounded-lg py-3 text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
            >
              {deleting ? 'Deleting...' : 'Yes, Delete Skull'}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 border border-gray-300 rounded-lg py-3 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="w-full border border-red-300 text-red-600 rounded-lg py-3 text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            Delete Skull
          </button>
        )}
      </div>
    </div>
  )
}
