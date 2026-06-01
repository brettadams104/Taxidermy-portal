import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SkullCard } from '@/components/skull-card'
import { AdvanceStatusButton } from '../../clients/[id]/advance-status-button'
import { LogPaymentForm } from './log-payment-form'
import type { SkullStatus } from '@/lib/types'

export default async function SkullDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: skull } = await supabase.from('skulls').select('*').eq('id', id).single()
  if (!skull) notFound()

  const { data: profile } = await supabase.from('profiles').select('name').eq('id', skull.client_id).single()

  return (
    <div className="space-y-4">
      <Link href={`/admin/clients/${skull.client_id}`} className="text-blue-600 hover:underline text-sm">
        ← {profile?.name ?? 'Client'}
      </Link>

      <SkullCard skull={skull} />

      <div className="flex gap-2">
        <AdvanceStatusButton skullId={skull.id} currentStatus={skull.status as SkullStatus} />
        <Link
          href={`/admin/skulls/${id}/edit`}
          className="shrink-0 border rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Edit
        </Link>
      </div>

      {skull.price != null && (
        <div className="border rounded-xl p-4 bg-white shadow-sm space-y-3">
          <h2 className="font-semibold">Payment</h2>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Price</span>
              <span>${skull.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Paid</span>
              <span>${(skull.amount_paid ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Balance</span>
              <span>${Math.max(0, skull.price - (skull.amount_paid ?? 0)).toFixed(2)}</span>
            </div>
          </div>
          <LogPaymentForm skullId={skull.id} />
        </div>
      )}

      {skull.notes && (
        <div className="border rounded-xl p-4 bg-white shadow-sm">
          <h2 className="font-semibold mb-1">Notes</h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{skull.notes}</p>
        </div>
      )}
    </div>
  )
}
