import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { MarkPickedUpButton } from './mark-picked-up-button'

export default async function PendingPickupPage() {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const { data: skulls } = await supabase
    .from('skulls')
    .select('*, profiles(name)')
    .eq('status', 'Pending Pickup')
    .order('created_at', { ascending: false })

  const { data: { users } } = await adminClient.auth.admin.listUsers()
  const emailMap = Object.fromEntries(users.map(u => [u.id, u.email ?? '']))

  return (
    <div className="space-y-4">
      <Link href="/admin/dashboard" className="text-blue-600 hover:underline text-sm">← Dashboard</Link>
      <h1 className="text-2xl font-bold">Pending Pickup</h1>

      {!skulls?.length && (
        <p className="text-gray-700 text-center py-8">No skulls pending pickup.</p>
      )}

      <ul className="space-y-3">
        {skulls?.map(skull => {
          const profile = skull.profiles as { name: string | null } | null
          const clientName = profile?.name ?? emailMap[skull.client_id] ?? 'Unknown Client'
          return (
            <li key={skull.id}>
              <div className="border rounded-xl p-4 bg-white shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{clientName}</p>
                    {skull.points && (
                      <p className="text-sm text-gray-700">{skull.points}-point</p>
                    )}
                    <p className="text-sm text-gray-700">
                      Received {new Date(skull.date_received).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {skull.price != null && (
                      <p className="font-semibold">${skull.price.toFixed(2)}</p>
                    )}
                    {skull.price != null && (
                      <p className="text-sm text-gray-700">
                        {skull.amount_paid >= skull.price ? 'Paid' : `$${(skull.price - skull.amount_paid).toFixed(2)} owed`}
                      </p>
                    )}
                  </div>
                </div>
                <Link
                  href={`/admin/skulls/${skull.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View Details
                </Link>
                <MarkPickedUpButton skullId={skull.id} />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
