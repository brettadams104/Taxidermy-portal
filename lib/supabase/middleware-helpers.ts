import type { UserRole } from '@/lib/types'

export function getRedirectPath(role: UserRole | null, pathname: string): string | null {
  const publicPaths = ['/login', '/signup', '/reset-password', '/accept-invite']
  const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/auth')

  if (!role) {
    return isPublicPath ? null : '/login'
  }

  if (pathname === '/' || isPublicPath) {
    return role === 'admin' ? '/admin/dashboard' : '/portal'
  }

  if (pathname.startsWith('/admin') && role !== 'admin') {
    return '/portal'
  }

  if (pathname.startsWith('/portal') && role !== 'client') {
    return '/admin/dashboard'
  }

  return null
}
