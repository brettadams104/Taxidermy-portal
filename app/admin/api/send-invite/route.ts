import { generateAndSendInvite } from '@/lib/auth/send-invite-email'
import { requireBusiness } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    // Verify admin is authenticated
    await requireBusiness()

    const { email } = await request.json()

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 })
    }

    const result = await generateAndSendInvite(email)

    return Response.json(result, { status: 200 })
  } catch (error) {
    console.error('Error sending invite:', error)
    return Response.json(
      { error: (error as Error).message || 'Failed to send invite' },
      { status: 400 }
    )
  }
}
