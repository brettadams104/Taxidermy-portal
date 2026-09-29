import { createClient } from '@/lib/supabase/server'
import { requireBusiness } from '@/lib/supabase/server'
import Link from 'next/link'
import { SkullCard } from '@/components/skull-card'
import { StatCard } from '@/components/stat-card'
import { AdvanceStatusButton } from '@/app/admin/clients/[id]/advance-status-button'
import { StagesDropdown } from './stages-dropdown'
import { getAllSkullsByBusiness, getSkullsInProgressWithClients, getSkullsByStatus } from '@/lib/queries/skulls'
import { getFinalStage } from '@/lib/queries/stages'
import type { Skull, SkullStatus } from '@/lib/types'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const business = await requireBusiness()

  // Get business configuration
  const stages = business.stages || []
  const finalStage = stages.length > 0 ? stages[stages.length - 1] : 'Completed'

  // Fetch all skulls for this business
  const allSkulls = await getAllSkullsByBusiness(business.id)

  // Fetch active projects (not in final stage)
  const allNonFinalSkulls = await getSkullsInProgressWithClients(business.id, finalStage)

  // Separate Ready for Pickup from other active projects
  const readyForPickupSkulls = allNonFinalSkulls.filter(s => s.status === 'Ready for Pickup')
  const activeProjects = allNonFinalSkulls.filter(s => s.status !== 'Ready for Pickup')

  // Fetch skulls in final stage (completed)
  const completedSkulls = await getSkullsByStatus(finalStage, business.id)

  // Calculate stats
  const totalClients = allSkulls.length > 0
    ? (await supabase.from('profiles').select('id').eq('business_id', business.id).eq('role', 'client')).data?.length ?? 0
    : 0

  const completedCount = completedSkulls.length
  const inProgressCount = activeProjects.length

  // Calculate status distribution
  const statusCounts: Record<string, number> = {}
  stages.forEach(stage => {
    statusCounts[stage] = 0
  })
  allSkulls.forEach(skull => {
    statusCounts[skull.status] = (statusCounts[skull.status] || 0) + 1
  })

  const totalOutstanding = allSkulls.reduce((sum, sk) => {
    if (sk.price == null) return sum
    return sum + Math.max(0, sk.price - (sk.amount_paid ?? 0))
  }, 0) ?? 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b" style={{ borderBottomColor: 'var(--border)' }}>
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Manage your European mount projects and track progress</p>
        </div>
        <Link href="/admin/clients/new" className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all active:scale-95">
          <span>+</span>
          <span>New Client</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Clients */}
        <Link href="/admin/clients">
          <StatCard
            label="Total Clients"
            value={totalClients}
            variant="primary"
            icon={
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a6 6 0 0112 0v2H6v-2z" />
              </svg>
            }
          />
        </Link>

        {/* Completed Skulls */}
        <Link href="/admin/skulls/finished">
          <StatCard
            label="Completed Projects"
            value={completedCount}
            variant="success"
            icon={
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </Link>

        {/* Outstanding Balance */}
        <StatCard
          label="Outstanding"
          value={`$${totalOutstanding.toFixed(0)}`}
          variant={totalOutstanding > 0 ? 'danger' : 'success'}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{
              color: totalOutstanding > 0 ? '#dc2626' : '#059669'
            }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        {/* In Progress */}
        <StatCard
          label="In Progress"
          value={inProgressCount}
          variant="warning"
          icon={
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
      </div>

      {/* Analytics Section */}
      <Link href="/admin/stats" className="group">
        <div className="rounded-xl p-8 bg-white shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-102" style={{ backgroundColor: 'var(--surface)' }}>
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
        <StagesDropdown statuses={stages} counts={statusCounts} />
      </div>

      {/* Active Projects */}
      <div>
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--primary)' }}>Active Projects</h2>
        {!activeProjects?.length && (
          <div className="rounded-xl p-12 text-center bg-white shadow-sm" style={{ backgroundColor: 'var(--surface)' }}>
            <p style={{ color: 'var(--text-muted)' }}>No active projects</p>
          </div>
        )}
        <div className="space-y-4">
          {activeProjects?.map(project => {
            const profile = project.profiles as { name: string | null } | null
            const skull = project as unknown as Skull
            return (
              <div key={project.id} className="rounded-xl p-8 bg-white shadow-sm hover:shadow-md transition-shadow duration-300" style={{ backgroundColor: 'var(--surface)' }}>
                <div className="mb-6">
                  <p className="font-bold text-lg" style={{ color: 'var(--text)' }}>
                    {profile?.name ?? 'Unnamed Client'}
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Mount preparation in progress</p>
                </div>
                <SkullCard skull={skull} />

                {/* Progress Bar */}
                {stages.length > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                        {project.status}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {stages.indexOf(project.status as string) + 1} of {stages.length}
                      </p>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${((stages.indexOf(project.status as string) + 1) / stages.length) * 100}%`,
                          backgroundColor: 'var(--accent)'
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="col-span-1">
                    <AdvanceStatusButton
                      skullId={project.id}
                      currentStatus={project.status as SkullStatus}
                      stages={stages}
                      price={project.price}
                      amountPaid={project.amount_paid}
                    />
                  </div>
                  <Link
                    href={`/admin/skulls/${project.id}/edit`}
                    className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors text-center"
                    style={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/admin/skulls/${project.id}`}
                    className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors text-center"
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

      {/* Ready for Pickup */}
      <div>
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--primary)' }}>Ready for Pickup</h2>
        {!readyForPickupSkulls?.length && (
          <div className="rounded-xl p-12 text-center bg-white shadow-sm" style={{ backgroundColor: 'var(--surface)' }}>
            <p style={{ color: 'var(--text-muted)' }}>No skulls ready for pickup</p>
          </div>
        )}
        <div className="space-y-4">
          {readyForPickupSkulls?.map(skull => {
            const profile = skull.profiles as { name: string | null } | null
            return (
              <div key={skull.id} className="rounded-xl p-8 bg-white shadow-sm hover:shadow-md transition-shadow duration-300" style={{ backgroundColor: 'var(--surface)' }}>
                <div className="mb-6">
                  <p className="font-bold text-lg" style={{ color: 'var(--text)' }}>
                    {profile?.name ?? 'Unnamed Client'}
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Ready for customer pickup</p>
                </div>
                <SkullCard skull={skull as unknown as Skull} />
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="col-span-1">
                    <AdvanceStatusButton
                      skullId={skull.id}
                      currentStatus={skull.status as SkullStatus}
                      stages={stages}
                      price={skull.price}
                      amountPaid={skull.amount_paid}
                    />
                  </div>
                  <Link
                    href={`/admin/skulls/${skull.id}/edit`}
                    className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors text-center"
                    style={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/admin/skulls/${skull.id}`}
                    className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors text-center"
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

      {/* Final Stage Projects - Hidden if finalStage is "Picked Up" */}
      {finalStage !== 'Picked Up' && (
        <div>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--primary)' }}>{finalStage}</h2>
          {!completedSkulls?.length && (
            <div className="rounded-xl p-12 text-center bg-white shadow-sm" style={{ backgroundColor: 'var(--surface)' }}>
              <p style={{ color: 'var(--text-muted)' }}>No projects in {finalStage} stage</p>
            </div>
          )}
          <div className="space-y-4">
            {completedSkulls?.map(skull => {
              // Find the client profile for this skull
              const skullWithProfile = activeProjects.find(s => s.id === skull.id) ||
                                      (skull as any)
              const profile = (skullWithProfile as any)?.profiles as { name: string | null } | null
              return (
                <div key={skull.id} className="rounded-xl p-8 bg-white shadow-sm hover:shadow-md transition-shadow duration-300" style={{ backgroundColor: 'var(--surface)' }}>
                  <div className="mb-6">
                    <p className="font-bold text-lg" style={{ color: 'var(--text)' }}>
                      {profile?.name ?? 'Unnamed Client'} - {finalStage}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/skulls/${skull.id}`}
                      className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                      style={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
