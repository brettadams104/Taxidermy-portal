import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Suspense } from 'react'
import { YearSelector } from './year-selector'
import { DropOffChart } from './drop-off-chart'
import { RevenueChart } from './revenue-chart'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface Props {
  searchParams: Promise<{ year?: string }>
}

export default async function StatsPage({ searchParams }: Props) {
  const { year: yearParam } = await searchParams
  const supabase = await createClient()

  const { data: allSkulls } = await supabase
    .from('skulls')
    .select('date_received, price, amount_paid, status, created_at')
    .order('date_received', { ascending: true })

  const availableYears = Array.from(
    new Set((allSkulls ?? []).map(s => new Date(s.date_received).getFullYear()))
  ).sort((a, b) => b - a)

  const currentYear = new Date().getFullYear()
  if (!availableYears.includes(currentYear)) availableYears.unshift(currentYear)

  const selectedYear = yearParam ? parseInt(yearParam) : (availableYears[0] ?? currentYear)

  const yearSkulls = (allSkulls ?? []).filter(
    s => new Date(s.date_received).getFullYear() === selectedYear
  )

  const dropOffData = MONTHS.map((month, i) => ({
    month,
    count: yearSkulls.filter(s => new Date(s.date_received).getMonth() === i).length,
  }))

  const revenueData = MONTHS.map((month, i) => {
    const monthSkulls = yearSkulls.filter(s => new Date(s.date_received).getMonth() === i)
    return {
      month,
      revenue: monthSkulls.reduce((sum, s) => sum + (s.price ?? 0), 0),
      collected: monthSkulls.reduce((sum, s) => sum + s.amount_paid, 0),
    }
  })

  const totalBilled = yearSkulls.reduce((sum, s) => sum + (s.price ?? 0), 0)
  const totalCollected = yearSkulls.reduce((sum, s) => sum + s.amount_paid, 0)
  const totalOutstanding = Math.max(0, totalBilled - totalCollected)
  const totalDropOffs = yearSkulls.length
  const finished = yearSkulls.filter(s => s.status === 'Finished').length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/dashboard" className="text-blue-600 hover:underline text-sm">← Dashboard</Link>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Business Stats</h1>
      </div>

      <Suspense>
        <YearSelector years={availableYears} selected={selectedYear} />
      </Suspense>

      {/* Drop-off section */}
      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold">Deer Head Drop-offs — {selectedYear}</h2>
          <p className="text-sm text-gray-500">{totalDropOffs} total this year</p>
        </div>
        <div className="p-4">
          <DropOffChart data={dropOffData} />
        </div>
        {totalDropOffs > 0 && (
          <div className="px-4 pb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Month by Month</h3>
            <ul className="space-y-1">
              {dropOffData.filter(d => d.count > 0).map(d => (
                <li key={d.month} className="flex justify-between text-sm">
                  <span>{d.month}</span>
                  <span className="font-medium">{d.count} {d.count === 1 ? 'skull' : 'skulls'}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Financial section */}
      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold">Financials — {selectedYear}</h2>
        </div>
        <div className="grid grid-cols-3 divide-x border-b">
          <div className="px-4 py-3 text-center">
            <p className="text-xs text-gray-500">Billed</p>
            <p className="font-bold text-lg">${totalBilled.toFixed(2)}</p>
          </div>
          <div className="px-4 py-3 text-center">
            <p className="text-xs text-gray-500">Collected</p>
            <p className="font-bold text-lg text-green-600">${totalCollected.toFixed(2)}</p>
          </div>
          <div className="px-4 py-3 text-center">
            <p className="text-xs text-gray-500">Outstanding</p>
            <p className="font-bold text-lg text-orange-500">${totalOutstanding.toFixed(2)}</p>
          </div>
        </div>
        <div className="p-4">
          <RevenueChart data={revenueData} />
        </div>
      </div>

      {/* Year summary */}
      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold">Year Summary — {selectedYear}</h2>
        </div>
        <ul>
          {[
            { label: 'Total Drop-offs', value: totalDropOffs },
            { label: 'Completed', value: finished },
            { label: 'Still In Progress', value: totalDropOffs - finished },
          ].map(row => (
            <li key={row.label} className="flex justify-between px-4 py-3 border-b last:border-0 text-sm">
              <span className="text-gray-700">{row.label}</span>
              <span className="font-semibold">{row.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
