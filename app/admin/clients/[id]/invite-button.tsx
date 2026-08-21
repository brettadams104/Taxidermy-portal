'use client'

import { useState } from 'react'
import { inviteClientToPortal } from '@/lib/actions/clients'

interface Props {
  clientId: string
  clientEmail: string | null
}

export function InviteButton({ clientId, clientEmail }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!clientEmail) {
    return null
  }

  async function handleInvite() {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await inviteClientToPortal(clientId, clientEmail as string)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleInvite}
        disabled={loading}
        className="w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
      >
        {loading ? 'Sending...' : '📧 Invite to Portal'}
      </button>
      {error && (
        <p className="text-red-600 text-sm font-medium">{error}</p>
      )}
      {success && (
        <p className="text-green-600 text-sm font-medium">✓ Invitation sent to {clientEmail}</p>
      )}
    </div>
  )
}
