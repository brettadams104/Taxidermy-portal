'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { NotificationTemplate } from '@/lib/types'

interface Props {
  template: NotificationTemplate
  label: string
}

export function TemplateEditor({ template, label }: Props) {
  const [subject, setSubject] = useState(template.subject ?? '')
  const [body, setBody] = useState(template.body)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('notification_templates')
        .update({
          subject: template.type === 'email' ? subject : null,
          body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', template.id)
      if (error) {
        setError(error.message)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm space-y-3">
      <h2 className="font-semibold">{label}</h2>
      <form onSubmit={handleSave} className="space-y-3">
        {template.type === 'email' && (
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            required
            rows={template.type === 'email' ? 8 : 4}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Template'}
        </button>
      </form>
    </div>
  )
}
