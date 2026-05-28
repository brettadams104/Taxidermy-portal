'use client'

import { useState } from 'react'
import { updateClientProfile } from '@/lib/actions/clients'
import type { Profile } from '@/lib/types'

export function ProfileForm({ profile }: { profile: Profile }) {
  const [name, setName] = useState(profile.name ?? '')
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [address, setAddress] = useState(profile.address ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await updateClientProfile(profile.id, { name, phone, address })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white border rounded-xl p-4 shadow-sm">
      {[
        { label: 'Name', value: name, setter: setName },
        { label: 'Phone', value: phone, setter: setPhone },
        { label: 'Address', value: address, setter: setAddress },
      ].map(field => (
        <div key={field.label}>
          <label className="block text-sm font-medium mb-1">{field.label} (optional)</label>
          <input
            value={field.value}
            onChange={e => field.setter(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ))}
      <button
        type="submit"
        disabled={saving}
        className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
      </button>
    </form>
  )
}
