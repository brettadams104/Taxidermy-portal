'use client'

import { useState } from 'react'

interface Props {
  statuses: string[]
  counts: Record<string, number>
}

export function StagesDropdown({ statuses, counts }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <h2 className="font-semibold">Projects by Stage</h2>
        <span className="text-gray-400 text-lg">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <ul className="border-t">
          {statuses.map(status => (
            <li key={status} className="flex items-center justify-between px-4 py-3 border-b last:border-0">
              <span className="text-sm">{status}</span>
              <span className="font-semibold">{counts[status]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
