import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireBusiness } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SkullCard } from '@/components/skull-card'
import { AdvanceStatusButton } from './advance-status-button'
import { StatusDropdown } from './status-dropdown'
import { LogPaymentForm } from '@/app/admin/skulls/[id]/log-payment-form'
import type { SkullStatus } from '@/lib/types'

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const adminClient = createAdminClient()
  const business = await requireBusiness()

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single()
  if (!profile) notFound()

  const stages = business.stages || []

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
        <div className="flex gap-2 shrink-0">
          <Link
            href={`/admin/clients/${id}/edit`}
            className="border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Edit
          </Link>
          <Link
            href={`/admin/clients/${id}/skulls/new`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + Add Skull
          </Link>
        </div>
      </div>

      {!skulls?.length && (
        <p className="text-gray-700 text-center py-8">No skulls yet.</p>
      )}

      <div className="space-y-4">
        {skulls?.map(skull => (
          <div key={skull.id} className="space-y-2">
            <SkullCard skull={skull} />

            {/* Progress Bar */}
            {stages.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-semibold text-gray-700">
                    {skull.status}
                  </p>
                  <p className="text-xs text-gray-600">
                    {stages.indexOf(skull.status) + 1} of {stages.length}
                  </p>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full transition-all bg-blue-600"
                    style={{
                      width: `${((stages.indexOf(skull.status) + 1) / stages.length) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}

            {/* Payment Section */}
            {skull.price != null && (
              <div className="border rounded-lg p-3 bg-gray-50 space-y-2">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price</span>
                    <span className="font-medium">${skull.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paid</span>
                    <span className="font-medium">${(skull.amount_paid ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Balance</span>
                    <span>${Math.max(0, skull.price - (skull.amount_paid ?? 0)).toFixed(2)}</span>
                  </div>
                </div>
                <LogPaymentForm skullId={skull.id} />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <StatusDropdown skullId={skull.id} currentStatus={skull.status as SkullStatus} stages={stages} />
              <AdvanceStatusButton skullId={skull.id} currentStatus={skull.status as SkullStatus} stages={stages} />
              <Link
                href={`/admin/skulls/${skull.id}/edit`}
                className="text-sm border rounded-lg px-4 py-2 hover:bg-gray-50 text-center"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
