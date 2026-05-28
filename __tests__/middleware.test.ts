import { describe, it, expect } from 'vitest'
import { getRedirectPath } from '@/lib/supabase/middleware-helpers'
import type { UserRole } from '@/lib/types'

describe('getRedirectPath', () => {
  it('redirects unauthenticated users to /login', () => {
    expect(getRedirectPath(null, '/admin/dashboard')).toBe('/login')
  })

  it('allows unauthenticated users to access /login', () => {
    expect(getRedirectPath(null, '/login')).toBeNull()
  })

  it('redirects admin from / to /admin/dashboard', () => {
    expect(getRedirectPath('admin', '/')).toBe('/admin/dashboard')
  })

  it('redirects client from / to /portal', () => {
    expect(getRedirectPath('client', '/')).toBe('/portal')
  })

  it('blocks clients from /admin routes', () => {
    expect(getRedirectPath('client', '/admin/dashboard')).toBe('/portal')
  })

  it('allows admin to access /admin routes', () => {
    expect(getRedirectPath('admin', '/admin/dashboard')).toBeNull()
  })

  it('allows clients to access /portal routes', () => {
    expect(getRedirectPath('client', '/portal')).toBeNull()
  })
})
