'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { requireBusiness } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

export interface CreateClientInput {
  email: string | null
  name: string | null
  phone: string | null
  address: string | null
}

export async function createClientAccount(input: CreateClientInput) {
  const business = await requireBusiness()
  const supabase = await createClient()

  // No email — create a profile-only client (no portal access)
  if (!input.email) {
    const id = randomUUID()
    const { error } = await supabase.from('profiles').insert({
      id,
      business_id: business.id,
      name: input.name,
      phone: input.phone,
      address: input.address,
      role: 'client',
    })
    if (error) throw new Error(error.message)
    revalidatePath('/admin/clients')
    return { userId: id }
  }

  // Email provided — create profile for portal access
  // Then send invitation email separately to avoid auth issues
  const clientId = randomUUID()
  const adminClient = createAdminClient()

  // First, create the profile (same as no-email case, just with email)
  const { error: profileError } = await supabase.from('profiles').insert({
    id: clientId,
    business_id: business.id,
    name: input.name,
    phone: input.phone,
    address: input.address,
    role: 'client',
    email: input.email,
  })
  if (profileError) throw new Error(profileError.message)

  // Then invite the user via auth
  const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    input.email,
    { data: { role: 'client', profile_id: clientId } }
  )
  if (inviteError) throw new Error(inviteError.message)
  revalidatePath('/admin/clients')
  return { userId: data.user.id }
}

export async function deleteClient(clientId: string) {
  const adminClient = createAdminClient()

  // Use service role to bypass RLS — delete profile (cascades to skulls)
  const { error } = await adminClient.from('profiles').delete().eq('id', clientId)
  if (error) throw new Error(error.message)

  // Also delete the auth user if one exists (ignore error if no auth user)
  await adminClient.auth.admin.deleteUser(clientId).catch(() => {})

  revalidatePath('/admin/clients')
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
