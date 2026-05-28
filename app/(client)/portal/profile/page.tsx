import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from './profile-form'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Profile</h1>
      <p className="text-sm text-gray-500">{user.email}</p>
      {profile && <ProfileForm profile={profile} />}
    </div>
  )
}
