import { StatusProgressBar } from '@/components/status-progress-bar'
import { PAYMENT_OPTIONS } from '@/lib/constants'
import type { Skull } from '@/lib/types'

interface SkullCardProps {
  skull: Skull
}

export function SkullCard({ skull }: SkullCardProps) {
  const balance = skull.price != null ? skull.price - skull.amount_paid : null
  const paymentLabel = PAYMENT_OPTIONS.find(p => p.value === skull.payment_option)?.label
  const isPaidInFull = balance === 0

  return (
    <div className="rounded-lg p-6 space-y-4 bg-white border border-gray-200 card-elevated hover:shadow-lg">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-bold text-gray-900 text-lg">
              {skull.points ? `${skull.points}-Point Skull` : 'Skull'}
            </p>
            {isPaidInFull && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Paid
              </span>
            )}
          </div>
          <div className="space-y-1">
            {skull.dnr_tag_number && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">DNR Tag:</span> {skull.dnr_tag_number}
              </p>
            )}
            <p className="text-sm text-gray-600">
              <span className="font-medium">Received:</span> {new Date(skull.date_received).toLocaleDateString()}
            </p>
          </div>
        </div>

        {skull.price != null && (
          <div className="text-right flex-shrink-0 bg-gradient-to-br from-blue-50 to-blue-50/50 p-4 rounded-lg border border-blue-100">
            <p className="text-xs font-semibold text-gray-600 mb-1">Price</p>
            <p className="text-2xl font-bold text-blue-600 mb-3">${skull.price.toFixed(2)}</p>
            {balance != null && balance > 0 && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Outstanding</p>
                <p className="text-lg font-bold text-orange-600">${balance.toFixed(2)}</p>
              </div>
            )}
            {paymentLabel && <p className="text-xs text-gray-500 mt-2">{paymentLabel}</p>}
          </div>
        )}
      </div>

      <StatusProgressBar status={skull.status} />
    </div>
  )
}
