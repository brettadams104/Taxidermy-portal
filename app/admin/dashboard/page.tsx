import { createClient } from '@/lib/supabase/server'
import { requireBusiness } from '@/lib/supabase/server'
import Link from 'next/link'
import { SkullCard } from '@/components/skull-card'
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

        {/* Completed Skulls */}
        <Link href="/admin/skulls/finished" className="group">
          <div className="rounded-xl p-6 h-full border-2 hover:shadow-xl transition-all" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Completed</p>
            <p className="text-4xl font-black mb-2" style={{ color: 'var(--accent)' }}>{completedCount}</p>
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
        <StagesDropdown statuses={stages} counts={statusCounts} />
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
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--primary)' }}>Ready for Pickup</h2>
        {!readyForPickupSkulls?.length && (
          <div className="rounded-xl p-12 text-center border-2" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p style={{ color: 'var(--text-muted)' }}>No skulls ready for pickup</p>
          </div>
        )}
        <div className="space-y-4">
          {readyForPickupSkulls?.map(skull => {
            const profile = skull.profiles as { name: string | null } | null
            return (
              <div key={skull.id} className="rounded-xl p-6 border-2" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="mb-4">
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
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--primary)' }}>{finalStage}</h2>
          {!completedSkulls?.length && (
            <div className="rounded-xl p-12 text-center border-2" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
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
                <div key={skull.id} className="rounded-xl p-6 border-2" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <div className="mb-4">
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
