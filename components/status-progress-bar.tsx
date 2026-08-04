import { type FC } from 'react';

interface StatusProgressBarProps {
  currentStatus: string;
  allStages: string[]; // NEW: dynamic stages instead of hardcoded
}

/**
 * Visual progress bar showing skull's position in workflow.
 * Renders segments for each stage with status indicators.
 * @param currentStatus - Current status of the skull
 * @param allStages - Array of all possible stages for the business
 */
export const StatusProgressBar: FC<StatusProgressBarProps> = ({
  currentStatus,
  allStages,
}) => {
  const currentIndex = allStages.indexOf(currentStatus);
  const isValid = currentIndex !== -1;

  if (!isValid) {
    return (
      <div className="text-sm text-red-600">
        Invalid status: {currentStatus}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {allStages.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;

          return (
            <div key={`${stage}-${index}`} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isCompleted
                    ? 'bg-green-600 text-white'
                    : isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-700'
                }`}
              >
                {index + 1}
              </div>
              {index < allStages.length - 1 && (
                <div
                  className={`w-8 h-1 transition-colors ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-sm font-medium text-gray-700">
        {currentStatus}
      </p>
    </div>
  );
};
