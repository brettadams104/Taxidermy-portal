'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface Props {
  signOut: () => Promise<void>
}

export function AdminNav({ signOut }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Menu"
      >
        <span className="block w-5 h-0.5 bg-gray-700 mb-1" />
        <span className="block w-5 h-0.5 bg-gray-700 mb-1" />
        <span className="block w-5 h-0.5 bg-gray-700" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white border rounded-xl shadow-lg overflow-hidden z-20">
          <Link
            href="/admin/clients"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-sm hover:bg-gray-50 border-b"
          >
            Clients
          </Link>
          <Link
            href="/admin/stats"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-sm hover:bg-gray-50 border-b"
          >
            Business Stats
          </Link>
          <Link
            href="/admin/settings/notifications"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-sm hover:bg-gray-50 border-b"
          >
            Templates
          </Link>
          <form action={signOut}>
            <button type="submit" className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-50">
              Sign Out
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
