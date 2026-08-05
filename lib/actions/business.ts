'use server';

import { createClient } from '@/lib/supabase/server';
import { requireBusiness } from '@/lib/supabase/server';
import type { Business } from '@/lib/types/business';

/**
 * Update the stages for the current business.
 * If there are in-progress skulls, resets them to the first stage.
 *
 * @param newStages - Array of stage names
 * @param hasInProgressSkulls - Whether there are skulls not in the final stage
 * @throws Error if validation fails or database operations fail
 */
export async function updateBusinessStages(
  newStages: string[],
  hasInProgressSkulls: boolean
): Promise<void> {
  // Validation
  if (!Array.isArray(newStages) || newStages.length === 0) {
    throw new Error('At least one stage is required');
  }

  if (newStages.some((stage) => !stage || stage.trim().length === 0)) {
    throw new Error('Stage names cannot be empty');
  }

  const supabase = await createClient();
  const business = await requireBusiness();

  // Update business stages
  const { error: updateError } = await supabase
    .from('businesses')
    .update({
      stages: newStages,
      updated_at: new Date().toISOString(),
    })
    .eq('id', business.id);

  if (updateError) {
    throw new Error(`Failed to update stages: ${updateError.message}`);
  }

  // If in-progress skulls exist, reset them to first stage
  if (hasInProgressSkulls && newStages.length > 0) {
    const firstStage = newStages[0];
    const finalStage = newStages[newStages.length - 1];

    // Reset all non-completed skulls to first stage
    const { error: resetError } = await supabase
      .from('skulls')
      .update({ status: firstStage })
      .eq('business_id', business.id)
      .neq('status', finalStage);

    if (resetError) {
      throw new Error(`Failed to reset skulls: ${resetError.message}`);
    }
  }
}

/**
 * Get the business settings for the current user, including
 * whether there are any in-progress skulls.
 *
 * @returns Object containing business data and hasInProgressSkulls flag
 * @throws Error if no business is found or database operations fail
 */
export async function getBusinessSettings(): Promise<{
  business: Business;
  hasInProgressSkulls: boolean;
}> {
  const business = await requireBusiness();
  const supabase = await createClient();

  if (!business.stages || business.stages.length === 0) {
    throw new Error('Business has no stages configured');
  }

  const finalStage = business.stages[business.stages.length - 1];

  // Count skulls that are not in the final stage
  const { count, error } = await supabase
    .from('skulls')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', business.id)
    .neq('status', finalStage);

  if (error) {
    throw new Error(`Failed to check for in-progress skulls: ${error.message}`);
  }

  return {
    business,
    hasInProgressSkulls: (count || 0) > 0,
  };
}
