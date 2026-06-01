'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { updateClientProfile, deleteClient } from '@/lib/actions/clients'

interface Props {
  searchParams: Promise<{ name?: string; phone?: string; address?: string }>
}

export default function EditClientPage({ searchParams: _ }: Props) {
  const router = useRouter()
  const params = useParams<{ id: string }>()
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
      await updateClientProfile(params.id, {
        name: (form.get('name') as string) || undefined,
        phone: (form.get('phone') as string) || undefined,
        address: (form.get('address') as string) || undefined,
      })
      router.push(`/admin/clients/${params.id}`)
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteClient(params.id)
      router.push('/admin/clients')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit Client</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white border rounded-xl p-4 shadow-sm">
        {[
          { name: 'name', label: 'Name', type: 'text' },
          { name: 'phone', label: 'Phone', type: 'tel' },
          { name: 'address', label: 'Address', type: 'text' },
        ].map(field => (
          <div key={field.name}>
            <label className="block text-sm font-medium mb-1">{field.label} (optional)</label>
            <input
              name={field.name}
              type={field.type}
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
    </div>
  )
}
