import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

export default async function ClientsPage() {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*, skulls(id, status)')
    .eq('role', 'client')
    .order('created_at', { ascending: false })

  const { data: { users } } = await adminClient.auth.admin.listUsers()
  const emailMap = Object.fromEntries(users.map(u => [u.id, u.email ?? '']))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Link href="/admin/clients/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + New Client
        </Link>
      </div>

      {!profiles?.length && (
        <p className="text-gray-500 text-center py-8">No clients yet.</p>
      )}

      <ul className="space-y-3">
        {profiles?.map(profile => {
          const activeCount = (profile.skulls as { status: string }[])
            ?.filter(s => s.status !== 'Finished').length ?? 0
          return (
            <li key={profile.id}>
              <Link
                href={`/admin/clients/${profile.id}`}
                className="block border rounded-xl p-4 bg-white shadow-sm hover:border-blue-400 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{profile.name ?? 'Unnamed Client'}</p>
                    <p className="text-sm text-gray-500">{emailMap[profile.id]}</p>
                    {profile.phone && <p className="text-sm text-gray-500">{profile.phone}</p>}
                  </div>
                  <span className="text-sm text-blue-600 font-medium">{activeCount} active</span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
