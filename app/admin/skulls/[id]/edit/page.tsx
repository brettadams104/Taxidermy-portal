import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { EditSkullForm } from './edit-skull-form'

export default async function EditSkullPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: skull } = await supabase.from('skulls').select('*').eq('id', id).single()
  if (!skull) notFound()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit Skull</h1>
      <EditSkullForm skull={skull} />
    </div>
  )
}
