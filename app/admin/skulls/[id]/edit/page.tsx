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
      <div className="pb-6 border-b" style={{ borderBottomColor: 'var(--border)' }}>
        <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">Edit Skull</h1>
        <p className="text-sm text-gray-600 mt-2">Update skull details or delete this entry</p>
      </div>
      <EditSkullForm skull={skull} />
    </div>
  )
}
