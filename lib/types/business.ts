// lib/types/business.ts
export interface Business {
  id: string;
  owner_id: string;
  business_name: string | null;
  stages: string[]; // e.g., ["Received", "Processing", "Complete"]
  created_at: string;
  updated_at: string;
}

export interface CreateBusinessInput {
  business_name?: string;
  stages?: string[];
}

// Default stages for new businesses
export const DEFAULT_STAGES = ["Received", "In Progress", "Completed"];

/**
 * Gets the index of the final stage in the workflow
 * @param stages - Array of stage names
 * @returns Index of the final stage
 * @throws Error if stages array is empty
 */
export function getFinalStageIndex(stages: string[]): number {
  if (!stages || stages.length === 0) {
    throw new Error("Stages array cannot be empty");
  }
  return stages.length - 1;
}

/**
 * Checks if a skull has been completed (at final stage)
 * @param status - Current status of the skull
 * @param stages - Array of all stage names
 * @returns true if status matches the final stage, false otherwise
 * @throws Error if stages array is empty
 */
export function isSkullCompleted(status: string, stages: string[]): boolean {
  if (!stages || stages.length === 0) {
    throw new Error("Stages array cannot be empty");
  }
  return status === stages[getFinalStageIndex(stages)];
}

/**
 * Gets all in-progress statuses (all stages except the final one)
 * @param stages - Array of all stage names
 * @returns Array of in-progress stage names
 * @throws Error if stages array is empty
 */
export function getInProgressStatuses(stages: string[]): string[] {
  if (!stages || stages.length === 0) {
    throw new Error("Stages array cannot be empty");
  }
  return stages.slice(0, -1);
}
