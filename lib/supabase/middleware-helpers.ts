import type { UserRole } from '@/lib/types'

export function getRedirectPath(role: UserRole | null, pathname: string): string | null {
  const publicPaths = ['/login', '/signup', '/reset-password', '/auth/update-password']
  const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/auth')

  // If no user, allow public paths, redirect others to login
  if (!role) {
    return isPublicPath ? null : '/login'
  }

  // Only admins allowed - redirect to login if not admin
  if (role !== 'admin') {
    return '/login'
  }

  // Redirect admin users away from auth pages to dashboard
  if (pathname === '/' || isPublicPath) {
    return '/admin/dashboard'
  }

  return null
}
