import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { SKULL_STATUSES } from '@/lib/constants'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data: skulls } = await supabase.from('skulls').select('status, price, amount_paid')
  const { data: profiles } = await supabase.from('profiles').select('id').eq('role', 'client')

  const totalClients = profiles?.length ?? 0
  const statusCounts = SKULL_STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = skulls?.filter(sk => sk.status === s).length ?? 0
    return acc
  }, {})
  const totalOutstanding = skulls?.reduce((sum, sk) => {
    if (sk.price == null) return sum
    return sum + Math.max(0, sk.price - (sk.amount_paid ?? 0))
  }, 0) ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/admin/clients/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + New Client
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-xl p-4 bg-white shadow-sm">
          <p className="text-gray-700 text-sm">Total Clients</p>
          <p className="text-3xl font-bold">{totalClients}</p>
        </div>
        <div className="border rounded-xl p-4 bg-white shadow-sm">
          <p className="text-gray-700 text-sm">Outstanding Balance</p>
          <p className="text-3xl font-bold">${totalOutstanding.toFixed(2)}</p>
        </div>
      </div>

      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold">Projects by Stage</h2>
        </div>
        <ul>
          {SKULL_STATUSES.map(status => (
            <li key={status} className="flex items-center justify-between px-4 py-3 border-b last:border-0">
              <span className="text-sm">{status}</span>
              <span className="font-semibold">{statusCounts[status]}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link href="/admin/clients" className="block text-center text-blue-600 hover:underline text-sm">
        View all clients →
      </Link>
    </div>
  )
}
