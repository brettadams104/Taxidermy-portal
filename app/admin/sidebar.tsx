'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  DashboardIcon,
  ClientsIcon,
  AnalyticsIcon,
  WorkflowIcon,
  TemplatesIcon,
  AccountIcon,
  SignOutIcon,
} from './icons'

interface Props {
  signOut: () => Promise<void>
}

export function AdminSidebar({ signOut }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', Icon: DashboardIcon },
    { href: '/admin/clients', label: 'Clients', Icon: ClientsIcon },
    { href: '/admin/stats', label: 'Analytics', Icon: AnalyticsIcon },
    { href: '/admin/settings/stages', label: 'Workflow', Icon: WorkflowIcon },
    { href: '/admin/settings/notifications', label: 'Templates', Icon: TemplatesIcon },
    { href: '/admin/settings/account', label: 'Account', Icon: AccountIcon },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-20 left-6 z-30 p-2 rounded-lg hover:bg-slate-700 text-slate-700 hover:text-white transition-all"
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
        } border-r`}
        style={{
          borderRightColor: 'var(--border)',
          backgroundColor: 'var(--surface)',
          boxShadow: '4px 0 12px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Logo */}
        <div className="mb-8 px-4 py-3 rounded-lg" style={{ backgroundColor: 'var(--background)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Navigation</p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.Icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-blue-50 to-blue-50 text-blue-600 shadow-sm border-l-2 border-blue-600 pl-3.5'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="my-6" style={{ borderTop: `1px solid var(--border)` }} />

        {/* Sign out */}
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
          >
            <SignOutIcon />
            Sign Out
          </button>
        </form>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-10 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
