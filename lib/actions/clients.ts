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

    // Email provided — create profile only (no auto-invitation)
    // Admin can send invitation manually via "Invite to Portal" button
    const clientId = randomUUID()

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

    revalidatePath('/admin/clients')
    return { userId: clientId }
  } catch (err: any) {
    const message = err?.message || String(err)
    console.error('[createClientAccount] Error:', message)
    throw new Error(message)
  }
}

export async function inviteClientToPortal(clientId: string, clientEmail: string): Promise<void> {
  const supabase = await createClient()

  // Generate secure random token
  const token = require('crypto').randomBytes(32).toString('hex')

  // Get the client's business_id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', clientId)
    .single()

  if (profileError || !profile) {
    throw new Error('Client not found')
  }

  // Store invitation
  const { error: inviteError } = await supabase
    .from('invitations')
    .insert({
      token,
      email: clientEmail,
      client_id: clientId,
      business_id: profile.business_id,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    })

  if (inviteError) {
    throw new Error(`Failed to create invitation: ${inviteError.message}`)
  }

  // Note: Email sending would happen here
  // For now, just log the invite link for testing
  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/accept-invite?token=${token}`
  console.log(`Invitation link: ${inviteLink}`)

  revalidatePath('/admin/clients')
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
  updates: { name?: string; phone?: string; address?: string; email?: string }
) {
  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({
    name: updates.name,
    phone: updates.phone,
    address: updates.address,
    email: updates.email,
  }).eq('id', clientId)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/clients/${clientId}`)
  revalidatePath('/portal/profile')
}
