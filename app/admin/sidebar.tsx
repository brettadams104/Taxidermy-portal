'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface Props {
  signOut: () => Promise<void>
}

export function AdminSidebar({ signOut }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/admin/clients', label: 'Clients', icon: '👥' },
    { href: '/admin/stats', label: 'Analytics', icon: '📈' },
    { href: '/admin/settings/stages', label: 'Workflow', icon: '⚙️' },
    { href: '/admin/settings/notifications', label: 'Templates', icon: '📝' },
    { href: '/admin/settings/account', label: 'Account', icon: '🔧' },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-20 left-6 z-30 p-2 rounded-lg hover:bg-gray-200"
        aria-label="Toggle menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 pt-20 lg:pt-8 px-4 py-6 overflow-y-auto transition-transform duration-300 transform lg:transform-none z-20 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } border-r bg-white shadow-sm lg:shadow-none`}
        style={{ borderRightColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
      >
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive(item.href)
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 pl-3'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="my-6 border-t" style={{ borderColor: 'var(--border)' }} />

        {/* Sign out */}
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
          >
            <span className="text-lg">🚪</span>
            Sign Out
          </button>
        </form>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
