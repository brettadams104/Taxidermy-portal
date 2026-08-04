// lib/queries/stages.ts
import { createServerClient } from '@/lib/supabase/server';

/**
 * Retrieves all stage names for a specific business.
 * @param businessId - The business ID
 * @returns Array of stage names in order
 * @throws Error if query fails or business not found
 */
export async function getBusinessStages(businessId: string): Promise<string[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('businesses')
    .select('stages')
    .eq('id', businessId)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Business not found');

  return data.stages || [];
}

/**
 * Checks if a given status is valid for a business's workflow.
 * @param status - The status to validate
 * @param stages - Array of valid stages for the business
 * @returns true if status exists in stages array
 */
export function isValidStatus(status: string, stages: string[]): boolean {
  return stages.includes(status);
}

/**
 * Gets the final stage name (completion stage) for a workflow.
 * @param stages - Array of stage names
 * @returns The name of the final stage
 */
export function getFinalStage(stages: string[]): string {
  return stages[stages.length - 1];
}

/**
 * Checks if a skull has completed its workflow.
 * @param status - The skull's current status
 * @param stages - Array of stages for the business
 * @returns true if status equals the final stage
 */
export function isSkullCompleted(status: string, stages: string[]): boolean {
  return status === getFinalStage(stages);
}

/**
 * Gets all stages that are considered "in progress" (not the final stage).
 * @param stages - Array of all stage names
 * @returns Array of in-progress stage names
 */
export function getInProgressStages(stages: string[]): string[] {
  return stages.slice(0, -1);
}
