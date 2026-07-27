import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { SKULL_STATUSES } from '@/lib/constants'
import { SkullCard } from '@/components/skull-card'
import { AdvanceStatusButton } from '@/app/admin/clients/[id]/advance-status-button'
import { StagesDropdown } from './stages-dropdown'
import type { Skull, SkullStatus } from '@/lib/types'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data: skulls } = await supabase.from('skulls').select('status, price, amount_paid')
  const { data: profiles } = await supabase.from('profiles').select('id').eq('role', 'client')
  const { data: activeProjects } = await supabase
    .from('skulls')
    .select('*, profiles(name)')
    .neq('status', 'Finished')
    .neq('status', 'Pending Pickup')
    .order('created_at', { ascending: false })

  const { data: pendingPickupSkulls } = await supabase
    .from('skulls')
    .select('*, profiles(name)')
    .eq('status', 'Pending Pickup')
    .order('created_at', { ascending: false })

  const totalClients = profiles?.length ?? 0
  const finishedCount = skulls?.filter(sk => sk.status === 'Finished').length ?? 0
  const pendingPickupCount = skulls?.filter(sk => sk.status === 'Pending Pickup').length ?? 0
  const inProgressCount = skulls?.filter(sk => sk.status !== 'Finished' && sk.status !== 'Pending Pickup').length ?? 0
  const statusCounts = SKULL_STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = skulls?.filter(sk => sk.status === s).length ?? 0
    return acc
  }, {})
  const totalOutstanding = skulls?.reduce((sum, sk) => {
    if (sk.price == null) return sum
    return sum + Math.max(0, sk.price - (sk.amount_paid ?? 0))
  }, 0) ?? 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black" style={{ color: 'var(--primary)' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage your European mount projects</p>
        </div>
        <Link href="/admin/clients/new" className="text-white font-semibold px-6 py-3 rounded-lg transition-all hover:shadow-lg" style={{ backgroundColor: 'var(--primary)' }}>
          + New Client
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Clients */}
        <Link href="/admin/clients" className="group">
          <div className="rounded-xl p-6 h-full border-2 hover:shadow-xl transition-all" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Total Clients</p>
            <p className="text-4xl font-black mb-2" style={{ color: 'var(--primary)' }}>{totalClients}</p>
            <p className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>View all</p>
          </div>
        </Link>

        {/* In Progress */}
        <div className="rounded-xl p-6 border-2" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>In Progress</p>
          <p className="text-4xl font-black mb-2" style={{ color: 'var(--accent)' }}>{inProgressCount}</p>
          <div className="h-1 rounded-full" style={{ backgroundColor: 'var(--accent)' }}></div>
        </div>

        {/* Finished Skulls */}
        <Link href="/admin/skulls/finished" className="group">
          <div className="rounded-xl p-6 h-full border-2 hover:shadow-xl transition-all" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Finished</p>
            <p className="text-4xl font-black mb-2" style={{ color: 'var(--accent)' }}>{finishedCount}</p>
            <p className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>View all</p>
          </div>
        </Link>

        {/* Pending Pickup */}
        <Link href="/admin/skulls/pending-pickup" className="group">
          <div className="rounded-xl p-6 h-full border-2 hover:shadow-xl transition-all" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Pending Pickup</p>
            <p className="text-4xl font-black mb-2" style={{ color: 'var(--accent)' }}>{pendingPickupCount}</p>
            <p className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>View all</p>
          </div>
        </Link>

        {/* Outstanding Balance */}
        <div className="rounded-xl p-6 border-2" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Outstanding</p>
          <p className="text-3xl font-black" style={{ color: totalOutstanding > 0 ? 'var(--danger)' : 'var(--success)' }}>${totalOutstanding.toFixed(0)}</p>
        </div>
      </div>

      {/* Analytics Section */}
      <Link href="/admin/stats" className="group">
        <div className="rounded-xl p-6 border-2 hover:shadow-xl transition-all" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-lg" style={{ color: 'var(--text)' }}>Business Stats & Trends</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Revenue, completion rates, and more</p>
            </div>
            <span className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>→</span>
          </div>
        </div>
      </Link>

      {/* Project Stages */}
      <div>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--primary)' }}>Project Stages</h2>
        <StagesDropdown statuses={SKULL_STATUSES} counts={statusCounts} />
      </div>

      {/* Active Projects */}
      <div>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--primary)' }}>Active Projects</h2>
        {!activeProjects?.length && (
          <div className="rounded-xl p-12 text-center border-2" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p style={{ color: 'var(--text-muted)' }}>No active projects</p>
          </div>
        )}
        <div className="space-y-4">
          {activeProjects?.map(project => {
            const profile = project.profiles as { name: string | null } | null
            const skull = project as unknown as Skull
            return (
              <div key={project.id} className="rounded-xl p-6 border-2" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="mb-4">
                  <p className="font-bold text-lg" style={{ color: 'var(--text)' }}>
                    {profile?.name ?? 'Unnamed Client'}
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Mount preparation in progress</p>
                </div>
                <SkullCard skull={skull} />
                <div className="flex gap-2 mt-4">
                  <AdvanceStatusButton skullId={project.id} currentStatus={project.status as SkullStatus} />
                  <Link
                    href={`/admin/skulls/${project.id}/edit`}
                    className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                    style={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/admin/skulls/${project.id}`}
                    className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                    style={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}
                  >
                    Manage
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pending Pickup Projects */}
      <div>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--primary)' }}>Ready for Pickup</h2>
        {!pendingPickupSkulls?.length && (
          <div className="rounded-xl p-12 text-center border-2" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p style={{ color: 'var(--text-muted)' }}>No skulls pending pickup</p>
          </div>
        )}
        <div className="space-y-4">
          {pendingPickupSkulls?.map(skull => {
            const profile = skull.profiles as { name: string | null } | null
            return (
              <div key={skull.id} className="rounded-xl p-6 border-2" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="mb-4">
                  <p className="font-bold text-lg" style={{ color: 'var(--text)' }}>
                    {profile?.name ?? 'Unnamed Client'} - Ready for Pickup
                  </p>
                </div>
                <Link
                  href={`/admin/skulls/${skull.id}`}
                  className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors inline-block"
                  style={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}
                >
                  View Details
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
