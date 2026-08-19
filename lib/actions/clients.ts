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
  try {
    const business = await requireBusiness()

    // CRITICAL: Ensure business_id is valid and non-null
    if (!business.id || typeof business.id !== 'string') {
      throw new Error('Invalid business context: business_id is required')
    }

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
      if (error) throw new Error(`Profile insert failed: ${error.message}`)
      revalidatePath('/admin/clients')
      return { userId: id }
    }

    // Email provided — create profile for portal access, then send invitation
    const clientId = randomUUID()

    // Step 1: Create the profile
    console.log('[createClientAccount] Creating profile for:', input.email)
    const { error: profileError } = await supabase.from('profiles').insert({
      id: clientId,
      business_id: business.id,
      name: input.name,
      phone: input.phone,
      address: input.address,
      role: 'client',
      email: input.email,
    })
    if (profileError) {
      throw new Error(`Profile insert failed: ${profileError.message}`)
    }
    console.log('[createClientAccount] Profile created:', clientId)

    // Step 2: Create admin client and send invitation
    console.log('[createClientAccount] Creating admin client')

    // Check if service role key exists
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in environment')
    }

    const adminClient = createAdminClient()
    console.log('[createClientAccount] Admin client created successfully')
    console.log('[createClientAccount] Attempting to send invitation for:', input.email)
    try {
      const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
        input.email,
        { data: { role: 'client', profile_id: clientId } }
      )

      if (inviteError) {
        const errorMsg = inviteError.message || JSON.stringify(inviteError)
        console.warn('[createClientAccount] Invitation failed (non-blocking):', errorMsg)
        // Don't throw — profile was created successfully, invitation can be sent later via button
      } else {
        console.log('[createClientAccount] Invitation sent successfully')
      }
    } catch (inviteException: any) {
      // If inviteUserByEmail throws (not returns error)
      const msg = inviteException?.message || String(inviteException)
      console.warn('[createClientAccount] Invitation exception (non-blocking):', msg)
      // Don't throw — profile was created successfully, invitation can be sent later via button
    }

    revalidatePath('/admin/clients')
    return { userId: clientId }
  } catch (err: any) {
    const message = err?.message || String(err)
    console.error('[createClientAccount] Error:', message)
    throw new Error(message)
  }
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
