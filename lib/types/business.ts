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

// Helper to get final stage index
export function getFinalStageIndex(stages: string[]): number {
  return stages.length - 1;
}

// Helper to check if skull is completed
export function isSkullCompleted(status: string, stages: string[]): boolean {
  return status === stages[getFinalStageIndex(stages)];
}

// Helper to get in-progress status
export function getInProgressStatuses(stages: string[]): string[] {
  return stages.slice(0, -1);
}
