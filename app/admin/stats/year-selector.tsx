'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface Props {
  years: number[]
  selected: number
}

export function YearSelector({ years, selected }: Props) {
  const router = useRouter()
  const params = useSearchParams()

  function select(year: number) {
    const p = new URLSearchParams(params.toString())
    p.set('year', String(year))
    router.push(`/admin/stats?${p.toString()}`)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {years.map(year => (
        <button
          key={year}
          onClick={() => select(year)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            year === selected
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
          }`}
        >
          {year}
        </button>
      ))}
    </div>
  )
}
