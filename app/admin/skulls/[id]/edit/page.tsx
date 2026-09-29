import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { EditSkullForm } from './edit-skull-form'

export default async function EditSkullPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: skull } = await supabase.from('skulls').select('*').eq('id', id).single()
  if (!skull) notFound()

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <Link
        href={`/admin/clients/${skull.client_id}`}
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors group"
      >
        <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Client
      </Link>

      {/* Header */}
      <div className="pb-6 border-b" style={{ borderBottomColor: 'var(--border)' }}>
        <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">Edit Skull</h1>
        <p className="text-sm text-gray-600 mt-2">Update skull details or delete this entry</p>
      </div>

      {/* Form */}
      <EditSkullForm skull={skull} />
    </div>
  )
}
