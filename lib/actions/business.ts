'use server';

import { requireBusiness } from '@/lib/supabase/server';
import { createServerClient } from '@/lib/supabase/server';
import type { Business } from '@/lib/types/business';

/**
 * Updates a business's workflow stages and resets in-progress skulls if requested.
 * @param newStages - Array of new stage names
 * @param hasInProgressSkulls - Whether there are in-progress skulls to reset
 * @throws Error if business not found or update fails
 */
export async function updateBusinessStages(
  newStages: string[],
  hasInProgressSkulls: boolean
): Promise<void> {
  if (!newStages || newStages.length === 0) {
    throw new Error('At least one stage is required');
  }

  if (newStages.some(s => !s?.trim())) {
    throw new Error('All stages must have names');
  }

  const business = await requireBusiness();
  const supabase = await createServerClient();

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
      console.error('Failed to reset in-progress skulls:', resetError);
      // Don't throw - stages were updated successfully
      // Skulls reset is best-effort
    }
  }
}

/**
 * Retrieves business settings (stages and in-progress skull status).
 * @returns Business object and flag indicating if there are in-progress skulls
 * @throws Error if business not found
 */
export async function getBusinessSettings(): Promise<{
  business: Business;
  hasInProgressSkulls: boolean;
}> {
  const business = await requireBusiness();
  const supabase = await createServerClient();

  // Check if there are in-progress skulls
  const finalStage = business.stages[business.stages.length - 1];
  const { count, error } = await supabase
    .from('skulls')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', business.id)
    .neq('status', finalStage);

  if (error) {
    console.error('Failed to check in-progress skulls:', error);
    // Return safe default
    return {
      business,
      hasInProgressSkulls: false,
    };
  }

  return {
    business,
    hasInProgressSkulls: (count || 0) > 0,
  };
}
