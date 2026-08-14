'use client'

import { useState } from 'react'

export function InviteClientButton() {
  const [loading, setLoading] = useState(false)
  const [link, setLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState('')
  const [open, setOpen] = useState(false)

  async function handleGenerateLink() {
    setLoading(true)
    try {
      const response = await fetch('/admin/api/invite-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email || null }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate link')
      }

      const data = await response.json()
      setLink(data.link)
      setCopied(false)
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard() {
    if (link) {
      navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (link) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4">
          <h2 className="text-lg font-bold">Client Invitation Link</h2>
          <p className="text-sm text-gray-600">Share this link with your client. They can create an account anytime. It expires in 7 days.</p>
          <div className="bg-gray-50 border rounded-lg p-3 break-all text-sm font-mono">
            {link}
          </div>
          <button
            onClick={copyToClipboard}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            {copied ? '✓ Copied!' : 'Copy Link'}
          </button>
          <button
            onClick={() => {
              setLink(null)
              setEmail('')
              setOpen(false)
            }}
            className="w-full border rounded-lg py-2 font-medium hover:bg-gray-50"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  if (open) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4">
          <h2 className="text-lg font-bold">Generate Invite Link</h2>
          <p className="text-sm text-gray-600">Create an invitation link for a client. Send it to them whenever you're ready.</p>
          <div>
            <label className="block text-sm font-medium mb-1">Client Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="client@example.com"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Store for your records only</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 border rounded-lg py-2 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateLink}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Link'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setOpen(true)}
      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
    >
      + Generate Link
    </button>
  )
}
