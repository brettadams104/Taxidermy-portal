'use client';

import { useState } from 'react';
import { updateBusinessStages } from '@/lib/actions/business';

interface StageEditorProps {
  initialStages: string[];
  hasInProgressSkulls: boolean;
}

export function StageEditor({ initialStages, hasInProgressSkulls }: StageEditorProps) {
  const [stages, setStages] = useState<string[]>(initialStages);
  const [isLoading, setIsLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAddStage = () => {
    setStages([...stages, `Stage ${stages.length + 1}`]);
    setSuccess(false);
  };

  const handleUpdateStage = (index: number, value: string) => {
    const newStages = [...stages];
    newStages[index] = value;
    setStages(newStages);
    setSuccess(false);
  };

  const handleRemoveStage = (index: number) => {
    if (stages.length <= 1) {
      setError('You must have at least one stage');
      return;
    }
    setStages(stages.filter((_, i) => i !== index));
    setSuccess(false);
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    const newStages = [...stages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= stages.length) {
      return;
    }

    [newStages[index], newStages[targetIndex]] = [newStages[targetIndex], newStages[index]];
    setStages(newStages);
    setSuccess(false);
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(false);

    // Validate stages
    if (stages.length === 0) {
      setError('You must have at least one stage');
      return;
    }

    if (stages.some(s => !s.trim())) {
      setError('All stages must have a name');
      return;
    }

    // Check if stages changed
    const stagesChanged = JSON.stringify(stages) !== JSON.stringify(initialStages);

    if (!stagesChanged) {
      setSuccess(true);
      return;
    }

    // Show warning if there are in-progress skulls
    if (hasInProgressSkulls) {
      setShowWarning(true);
      return;
    }

    await doSave();
  };

  const doSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await updateBusinessStages(stages, hasInProgressSkulls);
      setSuccess(true);
      setShowWarning(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save stages');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Project Stages</h2>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-800 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-800 rounded">
          ✓ Stages saved successfully
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
              className="px-2 py-1 text-sm bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Move up"
            >
              ↑
            </button>
            <button
              onClick={() => handleMoveStage(index, 'down')}
              disabled={index === stages.length - 1}
              className="px-2 py-1 text-sm bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Move down"
            >
              ↓
            </button>
            <button
              onClick={() => handleRemoveStage(index)}
              className="px-2 py-1 text-sm bg-red-300 hover:bg-red-400 rounded text-white"
              aria-label="Delete stage"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleAddStage}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-6"
      >
        + Add Stage
      </button>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {showWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-red-600">⚠️ Warning</h3>
            <p className="mb-6 text-gray-700">
              You have {stages.length} skulls currently in progress. Changing stages will reset all in-progress skulls to the first stage.
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWarning(false)}
                className="flex-1 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={doSave}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Confirm & Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
