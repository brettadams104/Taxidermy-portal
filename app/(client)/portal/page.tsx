import { createClient } from '@/lib/supabase/server'
import { SkullCard } from '@/components/skull-card'

export default async function ClientPortalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: skulls } = await supabase
    .from('skulls')
    .select('*')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Projects</h1>

      {!skulls?.length && (
        <p className="text-gray-700 text-center py-8">
          No projects yet — your skulls will appear here once checked in.
        </p>
      )}

      <div className="space-y-3">
        {skulls?.map(skull => <SkullCard key={skull.id} skull={skull} />)}
      </div>
    </div>
  )
}
