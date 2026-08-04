import type { FC } from 'react'

interface StatusProgressBarProps {
  currentStatus: string
  allStages: string[]
}

export const StatusProgressBar: FC<StatusProgressBarProps> = ({
  currentStatus,
  allStages,
}) => {
  const currentIndex = allStages.indexOf(currentStatus)
  const isComplete = currentIndex === allStages.length - 1

  return (
    <div className="flex items-center gap-2">
      {allStages.map((stage, index) => {
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
            {index < allStages.length - 1 && (
              <div className={`w-8 h-1 ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}`} />
            )}
          </div>
        );
      })}
      <span className="text-sm font-medium text-gray-700 ml-2">
        {currentStatus}
      </span>
    </div>
  )
}
