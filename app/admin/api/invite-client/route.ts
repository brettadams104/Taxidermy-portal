import { generateInvitationLink } from '@/lib/auth/invitations'
import { requireBusiness } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    // Verify admin is authenticated
    await requireBusiness()

    const { email } = await request.json()

    const link = await generateInvitationLink(email || undefined)

    return Response.json({ link }, { status: 200 })
  } catch (error) {
    console.error('Error generating invite link:', error)
    return Response.json(
      { error: (error as Error).message || 'Failed to generate invite link' },
      { status: 400 }
    )
  }
}
