import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { requireBusiness } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

export async function generateInvitationLink(email?: string): Promise<string> {
  const business = await requireBusiness()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration')
  }

  const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey)
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const { error } = await supabase.from('invitations').insert({
    business_id: business.id,
    email: email || null,
    token,
    expires_at: expiresAt.toISOString(),
  })

  if (error) throw new Error(error.message)

  return `${supabaseUrl.replace('https://', '')}/accept-invite?token=${token}`
}

export async function validateInvitationToken(token: string) {
  const supabase = await createClient()

  const { data: invitation, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .single()

  if (error || !invitation) {
    throw new Error('Invalid or expired invitation')
  }

  if (invitation.used_at) {
    throw new Error('Invitation already used')
  }

  if (new Date(invitation.expires_at) < new Date()) {
    throw new Error('Invitation expired')
  }

  return invitation
}

export async function markInvitationUsed(token: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('invitations')
    .update({ used_at: new Date().toISOString() })
    .eq('token', token)

  if (error) throw new Error(error.message)
}
