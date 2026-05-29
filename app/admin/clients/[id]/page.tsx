import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SkullCard } from '@/components/skull-card'
import { AdvanceStatusButton } from './advance-status-button'
import type { SkullStatus } from '@/lib/types'

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single()
  if (!profile) notFound()

  const { data: { user } } = await adminClient.auth.admin.getUserById(id)
  const { data: skulls } = await supabase
    .from('skulls')
    .select('*')
    .eq('client_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <Link href="/admin/clients" className="text-blue-600 hover:underline text-sm">← All Clients</Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{profile.name ?? 'Unnamed Client'}</h1>
          <p className="text-sm text-gray-700">{user?.email}</p>
          {profile.phone && <p className="text-sm text-gray-700">{profile.phone}</p>}
          {profile.address && <p className="text-sm text-gray-700">{profile.address}</p>}
        </div>
        <Link
          href={`/admin/clients/${id}/skulls/new`}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shrink-0"
        >
          + Add Skull
        </Link>
      </div>

      {!skulls?.length && (
        <p className="text-gray-700 text-center py-8">No skulls yet.</p>
      )}

      <div className="space-y-4">
        {skulls?.map(skull => (
          <div key={skull.id} className="space-y-2">
            <SkullCard skull={skull} />
            <div className="flex gap-2">
              <AdvanceStatusButton skullId={skull.id} currentStatus={skull.status as SkullStatus} />
              <Link
                href={`/admin/skulls/${skull.id}`}
                className="shrink-0 text-sm border rounded-lg px-4 py-2 hover:bg-gray-50"
              >
                Manage
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
