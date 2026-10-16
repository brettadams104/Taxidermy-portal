'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireBusiness } from '@/lib/supabase/server'

export async function resetUserPassword(userId: string, newPassword: string) {
  try {
    const business = await requireBusiness()
    const adminClient = createAdminClient()

    // Verify the user belongs to this business
    const supabase = adminClient
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .eq('business_id', business.id)
      .single()

    if (!profile) {
      throw new Error('User not found in your business')
    }

    // Use admin API to update password
    const { error } = await adminClient.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (error) {
      throw new Error(error.message)
    }

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to reset password'
    console.error('[resetUserPassword]', message)
    throw new Error(message)
  }
}

export async function getBusinessUsers() {
  try {
    const business = await requireBusiness()
    const supabase = createAdminClient()

    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, name, email, role')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return users || []
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch users'
    console.error('[getBusinessUsers]', message)
    throw new Error(message)
  }
}
