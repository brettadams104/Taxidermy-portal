import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { EditClientForm } from './edit-client-form'

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single()

  if (!profile) {
    return <div>Client not found</div>
  }

  return (
    <div className="space-y-4">
      <Link href={`/admin/clients/${id}`} className="text-blue-600 hover:underline text-sm">
        ← Back
      </Link>
      <h1 className="text-2xl font-bold">Edit Client</h1>
      <EditClientForm clientId={id} profile={profile} />
    </div>
  )
}
