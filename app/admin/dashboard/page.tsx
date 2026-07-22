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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black" style={{ color: 'var(--primary)' }}>Dashboard</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Manage your European mount projects</p>
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
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>TOTAL CLIENTS</p>
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-4xl font-black" style={{ color: 'var(--primary)' }}>{totalClients}</p>
            <p className="text-xs font-semibold mt-3" style={{ color: 'var(--gold)' }}>View all →</p>
          </div>
        </Link>

        {/* In Progress */}
        <div className="rounded-xl p-6 border-2" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>IN PROGRESS</p>
            <span className="text-2xl">⚙️</span>
          </div>
          <p className="text-4xl font-black" style={{ color: 'var(--accent)' }}>{inProgressCount}</p>
          <div className="mt-3 h-1 rounded-full" style={{ backgroundColor: 'var(--accent)' }}></div>
        </div>

        {/* Finished Skulls */}
        <Link href="/admin/skulls/finished" className="group">
          <div className="rounded-xl p-6 h-full border-2 hover:shadow-xl transition-all" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>FINISHED</p>
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-4xl font-black" style={{ color: 'var(--gold)' }}>{finishedCount}</p>
            <p className="text-xs font-semibold mt-3" style={{ color: 'var(--gold)' }}>View all →</p>
          </div>
        </Link>

        {/* Outstanding Balance */}
        <div className="rounded-xl p-6 border-2" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>OUTSTANDING</p>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-3xl font-black" style={{ color: totalOutstanding > 0 ? 'var(--danger)' : 'var(--success)' }}>${totalOutstanding.toFixed(0)}</p>
        </div>
      </div>

      {/* Analytics Section */}
      <Link href="/admin/stats" className="group">
        <div className="rounded-xl p-6 border-2 hover:shadow-xl transition-all" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📊</span>
              <div>
                <p className="font-semibold" style={{ color: 'var(--text)' }}>Business Stats & Trends</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Revenue, completion rates, and more</p>
              </div>
            </div>
            <span style={{ color: 'var(--gold)' }}>→</span>
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
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-semibold text-lg" style={{ color: 'var(--text)' }}>
                      {profile?.name ?? 'Unnamed Client'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Mount preparation in progress</p>
                  </div>
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
    </div>
  )
}
