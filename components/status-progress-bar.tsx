import type { FC } from 'react'

interface StatusProgressBarProps {
  currentStatus?: string
  allStages?: string[]
  status?: string
}

export const StatusProgressBar: FC<StatusProgressBarProps> = ({
  currentStatus,
  allStages,
  status,
}) => {
  // Support both old and new prop names
  const displayStatus = currentStatus || status || ''
  const stages = allStages || []

  // If stages are not provided, just show the status text
  if (stages.length === 0) {
    return <div className="text-sm font-medium text-gray-700">{displayStatus}</div>
  }

  const currentIndex = stages.indexOf(displayStatus)
  const isComplete = currentIndex === stages.length - 1

  return (
    <div className="flex items-center gap-2">
      {stages.map((stage, index) => {
        const isCompleted = index < currentIndex
        const isCurrent = index === currentIndex
        const isFuture = index > currentIndex

        return (
          <div key={`${stage}-${index}`} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                isCompleted ? 'bg-green-600 text-white' :
                isCurrent ? 'bg-blue-600 text-white' :
                'bg-gray-300 text-gray-700'
              }`}
            >
              {index + 1}
            </div>
            {index < stages.length - 1 && (
              <div className={`w-8 h-1 ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}`} />
            )}
          </div>
        );
      })}
      <span className="text-sm font-medium text-gray-700 ml-2">
        {displayStatus}
      </span>
    </div>
  )
}
