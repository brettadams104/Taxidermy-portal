import { ResetPasswordForm } from './reset-password-form'

export default function PasswordResetPage() {
  return (
    <div className="space-y-6">
      <div className="pb-6 border-b" style={{ borderBottomColor: 'var(--border)' }}>
        <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">
          Reset User Password
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          Manually reset a user's password. They can log in with the new password immediately.
        </p>
      </div>

      <ResetPasswordForm />
    </div>
  )
}
