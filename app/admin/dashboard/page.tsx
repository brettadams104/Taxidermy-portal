import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { SKULL_STATUSES } from '@/lib/constants'
import { SkullCard } from '@/components/skull-card'
import { AdvanceStatusButton } from '@/app/admin/clients/[id]/advance-status-button'
import type { Skull, SkullStatus } from '@/lib/types'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data: skulls } = await supabase.from('skulls').select('status, price, amount_paid')
  const { data: profiles } = await supabase.from('profiles').select('id').eq('role', 'client')
  const { data: activeProjects } = await supabase
    .from('skulls')
    .select('*, profiles(name)')
    .neq('status', 'Finished')
    .order('created_at', { ascending: false })

  const totalClients = profiles?.length ?? 0
  const finishedCount = skulls?.filter(sk => sk.status === 'Finished').length ?? 0
  const inProgressCount = skulls?.filter(sk => sk.status !== 'Finished').length ?? 0
  const statusCounts = SKULL_STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = skulls?.filter(sk => sk.status === s).length ?? 0
    return acc
  }, {})
  const totalOutstanding = skulls?.reduce((sum, sk) => {
    if (sk.price == null) return sum
    return sum + Math.max(0, sk.price - (sk.amount_paid ?? 0))
  }, 0) ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/admin/clients/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + New Client
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/admin/clients" className="border rounded-xl p-4 bg-white shadow-sm hover:border-blue-400 transition-colors">
          <p className="text-gray-700 text-sm">Total Clients</p>
          <p className="text-3xl font-bold">{totalClients}</p>
          <p className="text-xs text-blue-600 mt-1">View all →</p>
        </Link>
        <div className="border rounded-xl p-4 bg-white shadow-sm">
          <p className="text-gray-700 text-sm">Outstanding Balance</p>
          <p className="text-3xl font-bold">${totalOutstanding.toFixed(2)}</p>
        </div>
        <div className="border rounded-xl p-4 bg-white shadow-sm">
          <p className="text-gray-700 text-sm">In Progress</p>
          <p className="text-3xl font-bold">{inProgressCount}</p>
        </div>
        <Link href="/admin/skulls/finished" className="border rounded-xl p-4 bg-white shadow-sm hover:border-blue-400 transition-colors">
          <p className="text-gray-700 text-sm">Finished Skulls</p>
          <p className="text-3xl font-bold">{finishedCount}</p>
          <p className="text-xs text-blue-600 mt-1">View all →</p>
        </Link>
      </div>

      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold">Projects by Stage</h2>
        </div>
        <ul>
          {SKULL_STATUSES.map(status => (
            <li key={status} className="flex items-center justify-between px-4 py-3 border-b last:border-0">
              <span className="text-sm">{status}</span>
              <span className="font-semibold">{statusCounts[status]}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/admin/stats"
        className="flex items-center justify-between border rounded-xl px-4 py-3 bg-white shadow-sm hover:border-blue-400 transition-colors text-sm"
      >
        <span className="font-medium">Business Stats & Trends</span>
        <span className="text-blue-600">View →</span>
      </Link>

      <div className="space-y-3">
        <h2 className="font-semibold text-lg">Current Projects</h2>
        {!activeProjects?.length && (
          <p className="text-gray-700 text-center py-8">No active projects.</p>
        )}
        {activeProjects?.map(project => {
          const profile = project.profiles as { name: string | null } | null
          const skull = project as unknown as Skull
          return (
            <div key={project.id} className="space-y-2">
              <p className="text-sm font-medium text-gray-700 px-1">
                {profile?.name ?? 'Unnamed Client'}
              </p>
              <SkullCard skull={skull} />
              <div className="flex gap-2">
                <AdvanceStatusButton skullId={project.id} currentStatus={project.status as SkullStatus} />
                <Link
                  href={`/admin/skulls/${project.id}`}
                  className="shrink-0 text-sm border rounded-lg px-4 py-2 bg-white hover:bg-gray-50"
                >
                  Manage
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
