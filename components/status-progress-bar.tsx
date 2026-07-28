import { SKULL_STATUSES } from '@/lib/constants'
import type { SkullStatus } from '@/lib/types'

interface StatusProgressBarProps {
  status: SkullStatus
}

export function StatusProgressBar({ status }: StatusProgressBarProps) {
  const currentIndex = SKULL_STATUSES.indexOf(status)
  const isValid = currentIndex !== -1

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">{status}</p>
      {isValid ? (
        <ol className="flex gap-1">
          {SKULL_STATUSES.map((step, i) => {
            const isComplete = i < currentIndex
            const isCurrent = i === currentIndex
            return (
              <li
                key={step}
                role="listitem"
                title={step}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  isComplete ? 'bg-green-500' :
                  isCurrent ? 'bg-blue-600' :
                  'bg-gray-200'
                }`}
              />
            )
          })}
        </ol>
      ) : (
        <p className="text-xs text-red-600">Status not found: {status}</p>
      )}
    </div>
  )
}
