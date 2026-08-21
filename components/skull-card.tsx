import { StatusProgressBar } from '@/components/status-progress-bar'
import { PAYMENT_OPTIONS } from '@/lib/constants'
import type { Skull } from '@/lib/types'

interface SkullCardProps {
  skull: Skull
}

export function SkullCard({ skull }: SkullCardProps) {
  const balance = skull.price != null ? skull.price - skull.amount_paid : null
  const paymentLabel = PAYMENT_OPTIONS.find(p => p.value === skull.payment_option)?.label

  return (
    <div className="rounded-lg p-5 space-y-3 bg-gray-50 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-gray-900">
            {skull.points ? `${skull.points}-Point Skull` : 'Skull'}
          </p>
          {skull.dnr_tag_number && (
            <p className="text-sm text-gray-600">DNR Tag: {skull.dnr_tag_number}</p>
          )}
          <p className="text-sm text-gray-600">
            Received: {new Date(skull.date_received).toLocaleDateString()}
          </p>
        </div>
        {skull.price != null && (
          <div className="text-right text-sm">
            <p className="font-semibold text-gray-900">${skull.price.toFixed(2)}</p>
            {balance != null && balance > 0 && (
              <p className="text-orange-600 font-medium">Balance: ${balance.toFixed(2)}</p>
            )}
            {balance === 0 && <p className="text-green-600 font-medium">Paid in Full</p>}
            {paymentLabel && <p className="text-gray-600 text-xs">{paymentLabel}</p>}
          </div>
        )}
      </div>
      <StatusProgressBar status={skull.status} />
    </div>
  )
}
