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

  const { data, error: createError } = await adminClient.auth.admin.createUser({
    email: input.email,
    email_confirm: true,
    user_metadata: { role: 'client' },
  })
  if (createError) throw new Error(createError.message)

  if (input.name || input.phone || input.address) {
    await adminClient
      .from('profiles')
      .update({ name: input.name, phone: input.phone, address: input.address })
      .eq('id', data.user.id)
  }

  // Send a password setup link to the new client
  await adminClient.auth.admin.generateLink({ type: 'recovery', email: input.email })

  revalidatePath('/admin/clients')
  return { userId: data.user.id }
}

export async function updateClientProfile(
  clientId: string,
  updates: { name?: string; phone?: string; address?: string }
) {
  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update(updates).eq('id', clientId)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/clients/${clientId}`)
  revalidatePath('/portal/profile')
}
