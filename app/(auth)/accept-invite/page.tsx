import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SignupForm } from './signup-form'

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">
            This invitation link is invalid or missing. Please check your email for a valid invitation link.
          </p>
          <Link href="/login" className="text-blue-600 hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    )
  }

  const supabase = await createClient()

  // Verify invitation token
  const { data: invitation, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .single()

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold mb-4">Invitation Expired</h1>
          <p className="text-gray-600 mb-6">
            This invitation has expired or is no longer valid. Please contact the admin to request a new invitation.
          </p>
          <Link href="/login" className="text-blue-600 hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    )
  }

  // Check if invitation has expired
  if (new Date(invitation.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold mb-4">Invitation Expired</h1>
          <p className="text-gray-600 mb-6">
            This invitation expired on {new Date(invitation.expires_at).toLocaleDateString()}. Please contact the admin to request a new invitation.
          </p>
          <Link href="/login" className="text-blue-600 hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-2 text-center">Create Your Account</h1>
        <p className="text-gray-600 text-sm text-center mb-6">
          You've been invited to access the Skull Studio portal. Create your account to get started.
        </p>
        <SignupForm 
          email={invitation.email}
          clientId={invitation.client_id}
          businessId={invitation.business_id}
          token={token}
        />
      </div>
    </div>
  )
}
