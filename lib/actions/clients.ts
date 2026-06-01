'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

export interface CreateClientInput {
  email: string | null
  name: string | null
  phone: string | null
  address: string | null
}

export async function createClientAccount(input: CreateClientInput) {
  const supabase = await createClient()

  // No email — create a profile-only client (no portal access)
  if (!input.email) {
    const id = randomUUID()
    const { error } = await supabase.from('profiles').insert({
      id,
      name: input.name,
      phone: input.phone,
      address: input.address,
      role: 'client',
    })
    if (error) throw new Error(error.message)
    revalidatePath('/admin/clients')
    return { userId: id }
  }

  // Email provided — invite via Supabase (gives portal access)
  const adminClient = createAdminClient()
  const { data, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    input.email,
    { data: { role: 'client' } }
  )
  if (inviteError) throw new Error(inviteError.message)

  if (input.name || input.phone || input.address) {
    await adminClient
      .from('profiles')
      .update({ name: input.name, phone: input.phone, address: input.address })
      .eq('id', data.user.id)
  }

  revalidatePath('/admin/clients')
  return { userId: data.user.id }
}

export async function deleteClient(clientId: string) {
  const adminClient = createAdminClient()
  const supabase = await createClient()

  // Delete profile (cascades to skulls)
  await supabase.from('profiles').delete().eq('id', clientId)

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
