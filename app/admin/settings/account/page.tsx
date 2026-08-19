import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireBusiness } from '@/lib/supabase/server'
import Link from 'next/link'
import { AccountForm } from './account-form'

export default async function AccountSettingsPage() {
  const business = await requireBusiness()
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Not authenticated</div>
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/dashboard" className="text-blue-600 hover:underline text-sm">
        ← Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-gray-600 text-sm mt-1">Manage your business information and account preferences</p>
      </div>

      {/* Business Information Section */}
      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">Business Information</h2>
        <AccountForm business={business} userEmail={user.email ?? ''} />
      </div>

      {/* Account Security Section */}
      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">Account Security</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600 mb-2">Email Address</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Password</p>
            <p className="text-sm text-gray-700 mb-3">You can reset your password using Supabase authentication.</p>
            <a
              href="https://supabase.com/docs/guides/auth/reset-password"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              Learn how to reset your password →
            </a>
          </div>
        </div>
      </div>

      {/* Business Identifier Section */}
      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">Business Details</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600 mb-2">Business ID</p>
            <p className="font-mono text-sm bg-gray-50 p-2 rounded">{business.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Business Identifier</p>
            <p className="font-mono text-sm bg-gray-50 p-2 rounded">{business.business_identifier}</p>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-blue-900">Need Help?</h2>
        <div className="space-y-2 text-sm text-blue-800">
          <p>If you have questions or need support:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Email: <a href="mailto:support@skullstudio.com" className="font-medium hover:underline">support@skullstudio.com</a></li>
            <li>Include your Business ID or Business Identifier in your message</li>
            <li>We typically respond within 24 hours</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
