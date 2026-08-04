// lib/auth/business-setup.ts
import { createServerClient } from '@/lib/supabase/server';
import { DEFAULT_STAGES } from '@/lib/types/business';
import type { Business } from '@/lib/types/business';

// PostgreSQL error code: no rows returned from query
const NO_ROWS_ERROR_CODE = 'PGRST116';

/**
 * Creates a new business for a user and links it to their profile.
 * Called during user signup to initialize a business workspace.
 * @param userId - The unique ID of the user who owns the business
 * @param businessName - Optional business name; defaults to 'My Taxidermy Studio'
 * @returns The created Business record with default stages
 * @throws Error if business creation or profile linking fails
 */
export async function createBusinessForUser(
  userId: string,
  businessName?: string
): Promise<Business> {
  if (!userId?.trim()) {
    throw new Error('userId must be a non-empty string');
  }

  const supabase = await createServerClient();
  const sanitizedName = businessName?.trim() || 'My Taxidermy Studio';

  // Create business record
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .insert({
      owner_id: userId,
      business_name: sanitizedName,
      stages: DEFAULT_STAGES,
    })
    .select()
    .single();

  if (businessError) {
    throw new Error(`Failed to create business for user ${userId}: ${businessError.message}`);
  }

  if (!business) {
    throw new Error(`Business creation returned no data for user ${userId}`);
  }

  // Link profile to business
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ business_id: business.id })
    .eq('id', userId);

  if (profileError) {
    throw new Error(`Failed to link profile to business for user ${userId}: ${profileError.message}`);
  }

  return business as Business;
}

/**
 * Retrieves the business record for a given user.
 * @param userId - The unique ID of the user who owns the business
 * @returns The user's Business record, or null if no business exists
 * @throws Error if the database query fails (other than "no rows" error)
 */
export async function getBusinessForUser(userId: string): Promise<Business | null> {
  if (!userId?.trim()) {
    throw new Error('userId must be a non-empty string');
  }

  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', userId)
    .single();

  // Handle "no rows" case gracefully
  if (error && error.code === NO_ROWS_ERROR_CODE) {
    return null;
  }

  if (error) {
    throw new Error(`Failed to retrieve business for user ${userId}: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return data as Business;
}
