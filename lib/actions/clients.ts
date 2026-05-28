'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export interface CreateClientInput {
  email: string
  name: string | null
  phone: string | null
  address: string | null
}

export async function createClientAccount(input: CreateClientInput) {
  const adminClient = createAdminClient()

  // inviteUserByEmail creates the user AND sends a "Set up your account" email automatically
  const { data, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    input.email,
    { data: { role: 'client' } }
  )
  if (inviteError) throw new Error(inviteError.message)

  // Update profile with optional contact info (profile row auto-created by DB trigger)
  if (input.name || input.phone || input.address) {
    await adminClient
      .from('profiles')
      .update({ name: input.name, phone: input.phone, address: input.address })
      .eq('id', data.user.id)
  }

  revalidatePath('/admin/clients')
  return { userId: data.user.id }
}

export async function updateClientProfile(
  clientId: string,
  updates: { name?: string; phone?: string; address?: string }
) {
  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({
    name: updates.name,
    phone: updates.phone,
    address: updates.address,
  }).eq('id', clientId)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/clients/${clientId}`)
  revalidatePath('/portal/profile')
}
