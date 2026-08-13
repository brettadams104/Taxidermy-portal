import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { validateInvitationToken, markInvitationUsed } from '@/lib/auth/invitations'

export async function POST(request: Request) {
  try {
    const { token, userId } = await request.json()

    if (!token || !userId) {
      return Response.json({ error: 'Missing token or userId' }, { status: 400 })
    }

    // Validate the invitation token
    const invitation = await validateInvitationToken(token)

    // Use service role to set up the profile
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return Response.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey)

    // Create profile linked to the business from the invitation
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        business_id: invitation.business_id,
        role: 'client',
      })

    if (profileError && profileError.code !== 'PGRST103') { // Ignore duplicate key errors
      throw new Error(profileError.message)
    }

    // Mark invitation as used
    await markInvitationUsed(token)

    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return Response.json(
      { error: (error as Error).message || 'Failed to accept invitation' },
      { status: 400 }
    )
  }
}
