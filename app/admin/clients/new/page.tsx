'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientAccount } from '@/lib/actions/clients'

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    try {
      const result = await createClientAccount({
        email: (form.get('email') as string) || null,
        name: (form.get('name') as string) || null,
        phone: (form.get('phone') as string) || null,
        address: (form.get('address') as string) || null,
      })
      router.push(`/admin/clients/${result.userId}`)
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">New Client</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white border rounded-xl p-4 shadow-sm">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            name="name"
            type="text"
            required
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email (optional)</label>
          <input
            name="email"
            type="email"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Leave blank if client doesn't need portal access.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone (optional)</label>
          <input
            name="phone"
            type="tel"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address (optional)</label>
          <input
            name="address"
            type="text"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Client'}
        </button>
      </form>
    </div>
  )
}
