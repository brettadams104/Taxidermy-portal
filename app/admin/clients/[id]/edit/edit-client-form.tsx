'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateClientProfile, deleteClient } from '@/lib/actions/clients'
import type { Profile } from '@/lib/types'

interface Props {
  clientId: string
  profile: Profile
}

export function EditClientForm({ clientId, profile }: Props) {
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
      await updateClientProfile(clientId, {
        name: (form.get('name') as string) || undefined,
        phone: (form.get('phone') as string) || undefined,
        address: (form.get('address') as string) || undefined,
        email: (form.get('email') as string) || undefined,
      })
      router.push(`/admin/clients/${clientId}`)
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteClient(clientId)
      router.push('/admin/clients')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl p-8 shadow-md">
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-900">Email (optional)</label>
          <input
            name="email"
            type="email"
            defaultValue={profile.email ?? ''}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500 transition-all"
          />
        </div>
        {[
          { name: 'name', label: 'Name', type: 'text', value: profile.name },
          { name: 'phone', label: 'Phone', type: 'tel', value: profile.phone },
          { name: 'address', label: 'Address', type: 'text', value: profile.address },
        ].map(field => (
          <div key={field.name}>
            <label className="block text-sm font-semibold mb-2 text-gray-900">{field.label} (optional)</label>
            <input
              name={field.name}
              type={field.type}
              defaultValue={field.value ?? ''}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500 transition-all"
            />
          </div>
        ))}
        {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
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

      {/* Delete section */}
      <div className="bg-white rounded-xl p-8 shadow-md space-y-4 border border-red-100">
        <div>
          <p className="text-sm font-semibold text-red-600">Delete Client</p>
          <p className="text-sm text-gray-600 mt-1">This will permanently delete the client and all their skulls. This cannot be undone.</p>
        </div>
        {confirming ? (
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 bg-red-600 text-white rounded-lg py-3 text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
            >
              {deleting ? 'Deleting...' : 'Yes, Delete'}
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
            Delete Client
          </button>
        )}
      </div>
    </>
  )
}
