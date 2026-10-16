'use client'

import { useState, useEffect } from 'react'
import { resetUserPassword, getBusinessUsers } from '@/lib/actions/admin'

interface User {
  id: string
  name: string | null
  email: string | null
  role: string
}

export function ResetPasswordForm() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getBusinessUsers()
        setUsers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load users')
      } finally {
        setLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [])

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!selectedUserId) {
      setError('Please select a user')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      await resetUserPassword(selectedUserId, password)
      setSuccess(true)
      setPassword('')
      setConfirmPassword('')
      setSelectedUserId('')

      setTimeout(() => setSuccess(false), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const selectedUser = users.find(u => u.id === selectedUserId)

  return (
    <div className="space-y-6">
      <form onSubmit={handleResetPassword} className="space-y-6 bg-white rounded-xl p-8 shadow-md border border-gray-200">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Select User</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            disabled={loadingUsers}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all"
          >
            <option value="">
              {loadingUsers ? 'Loading users...' : 'Choose a user...'}
            </option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name || user.email || 'Unnamed User'} {user.role === 'admin' ? '(Admin)' : '(Client)'}
              </option>
            ))}
          </select>
        </div>

        {selectedUser && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">User:</span> {selectedUser.name || selectedUser.email}
            </p>
            {selectedUser.email && (
              <p className="text-sm text-blue-700 mt-1">
                {selectedUser.email}
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="At least 8 characters"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all"
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Re-enter password"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium">✓ Password reset successfully!</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !selectedUserId || !password || !confirmPassword}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg py-3 font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
        >
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </button>
      </form>
    </div>
  )
}
