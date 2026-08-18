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
      <form onSubmit={handleSubmit} className="space-y-4 bg-white border rounded-xl p-4 shadow-sm">
        <div>
          <label className="block text-sm font-medium mb-1">Email (read-only)</label>
          <input
            type="email"
            readOnly
            defaultValue={profile.email ?? ''}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-600"
          />
        </div>
        {[
          { name: 'name', label: 'Name', type: 'text', value: profile.name },
          { name: 'phone', label: 'Phone', type: 'tel', value: profile.phone },
          { name: 'address', label: 'Address', type: 'text', value: profile.address },
        ].map(field => (
          <div key={field.name}>
            <label className="block text-sm font-medium mb-1">{field.label} (optional)</label>
            <input
              name={field.name}
              type={field.type}
              defaultValue={field.value ?? ''}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full border rounded-lg py-2 font-medium hover:bg-gray-50"
        >
          Cancel
        </button>
      </form>

      {/* Delete section */}
      <div className="bg-white border border-red-200 rounded-xl p-4 shadow-sm space-y-3">
        <p className="text-sm font-medium text-red-600">Delete Client</p>
        <p className="text-xs text-gray-500">This will permanently delete the client and all their skulls. This cannot be undone.</p>
        {confirming ? (
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Yes, Delete'}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 border rounded-lg py-2 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="w-full border border-red-300 text-red-600 rounded-lg py-2 text-sm font-medium hover:bg-red-50"
          >
            Delete Client
          </button>
        )}
      </div>
    </>
  )
}
