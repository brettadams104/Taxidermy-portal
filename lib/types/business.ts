// lib/types/business.ts
export interface Business {
  id: string;
  owner_id: string;
  business_name: string | null;
  stages: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateBusinessInput {
  business_name?: string;
  stages?: string[];
}

export const DEFAULT_STAGES = ["Received", "In Progress", "Completed"];

/**
 * Get the index of the final stage in a workflow.
 * @param stages - Array of stage names (must not be empty)
 * @returns Index of the final stage (length - 1)
 * @throws Error if stages array is empty
 */
export function getFinalStageIndex(stages: string[]): number {
  if (stages.length === 0) {
    throw new Error('Cannot get final stage index of empty stages array');
  }
  return stages.length - 1;
}

/**
 * Check if a skull has reached the final stage (completed).
 * @param status - Current status of the skull
 * @param stages - Array of possible stages
 * @returns true if status equals the final stage, false otherwise
 */
export function isSkullCompleted(status: string, stages: string[]): boolean {
  if (stages.length === 0) return false;
  return status === stages[getFinalStageIndex(stages)];
}

/**
 * Get all non-final stages (in-progress stages).
 * @param stages - Array of all stages
 * @returns All stages except the final one
 */
export function getInProgressStatuses(stages: string[]): string[] {
  return stages.slice(0, -1);
}
