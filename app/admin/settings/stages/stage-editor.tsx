'use client';

import { useState } from 'react';
import { updateBusinessStages } from '@/lib/actions/business';

interface StageEditorProps {
  initialStages: string[];
  hasInProgressSkulls: boolean;
}

export function StageEditor({
  initialStages,
  hasInProgressSkulls,
}: StageEditorProps) {
  const [stages, setStages] = useState<string[]>(initialStages);
  const [isLoading, setIsLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const hasChanged =
    JSON.stringify(stages) !== JSON.stringify(initialStages);

  const isValid = stages.length > 0 && stages.every((s) => s.trim().length > 0);

  const handleAddStage = () => {
    setStages([...stages, `Stage ${stages.length + 1}`]);
    setError(null);
    setSuccess(false);
  };

  const handleUpdateStage = (index: number, value: string) => {
    const newStages = [...stages];
    newStages[index] = value;
    setStages(newStages);
    setError(null);
    setSuccess(false);
  };

  const handleRemoveStage = (index: number) => {
    if (stages.length <= 1) {
      setError('At least one stage is required');
      return;
    }
    setStages(stages.filter((_, i) => i !== index));
    setError(null);
    setSuccess(false);
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    const newStages = [...stages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < stages.length) {
      [newStages[index], newStages[targetIndex]] = [
        newStages[targetIndex],
        newStages[index],
      ];
      setStages(newStages);
      setError(null);
      setSuccess(false);
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(false);

    if (!isValid) {
      setError('All stages must have names');
      return;
    }

    if (!hasChanged) {
      setError('No changes to save');
      return;
    }

    if (hasInProgressSkulls && hasChanged) {
      setShowWarning(true);
    } else {
      await doSave();
    }
  };

  const doSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await updateBusinessStages(stages, hasInProgressSkulls);
      setSuccess(true);
      setShowWarning(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to save stages';
      setError(message);
      console.error('Error saving stages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setStages(initialStages);
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Project Stages</h2>

      {hasInProgressSkulls && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> You have skulls currently in progress. If you
            change the stages, these skulls will be reset to the first stage.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">Stages saved successfully!</p>
        </div>
      )}

      <div className="space-y-3 mb-6 border rounded-lg p-4 bg-gray-50">
        {stages.map((stage, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="font-bold text-gray-600 w-6">{index + 1}.</span>
            <input
              type="text"
              value={stage}
              onChange={(e) => handleUpdateStage(index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Stage ${index + 1}`}
            />
            <button
              onClick={() => handleMoveStage(index, 'up')}
              disabled={index === 0}
              title="Move up"
              className="px-2 py-1 text-sm bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ↑
            </button>
            <button
              onClick={() => handleMoveStage(index, 'down')}
              disabled={index === stages.length - 1}
              title="Move down"
              className="px-2 py-1 text-sm bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ↓
            </button>
            <button
              onClick={() => handleRemoveStage(index)}
              title="Delete stage"
              className="px-2 py-1 text-sm bg-red-300 hover:bg-red-400 rounded transition-colors"
              disabled={stages.length === 1}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleAddStage}
        className="px-4 py-2 bg-blue-600 text-white rounded mb-6 hover:bg-blue-700 transition-colors"
      >
        + Add Stage
      </button>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isLoading || !isValid || !hasChanged}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={handleCancel}
          className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
        >
          Cancel
        </button>
      </div>

      {showWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-red-600">
              ⚠️ Warning
            </h3>
            <p className="mb-6 text-gray-700 text-sm leading-relaxed">
              You have skulls currently in progress. Changing stages will reset
              all in-progress skulls to the first stage. This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWarning(false)}
                className="flex-1 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={doSave}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Resetting...' : 'Confirm & Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
