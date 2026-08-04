import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Business } from '@/lib/types/business';

// PostgreSQL error code: no rows returned from query
const NO_ROWS_ERROR_CODE = 'PGRST116';

/**
 * Creates a Supabase client for server-side operations
 * Uses environment variables for Supabase URL and service role key
 */
export async function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey);
}

/**
 * Retrieves the currently authenticated user's business.
 * Used in server components and server actions to access business context.
 * @returns The Business object for the current user, or null if no business found
 * @throws Error if auth fails or business query fails (other than "no rows")
 */
export async function getCurrentBusiness(): Promise<Business | null> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (error && error.code !== NO_ROWS_ERROR_CODE) {
    throw error;
  }

  return (business as Business) || null;
}

/**
 * Requires that the current user has an authenticated business.
 * Throws an error if user is not authenticated or has no business.
 * @returns The Business object for the current user
 * @throws Error if user is not authenticated or business not found
 */
export async function requireBusiness(): Promise<Business> {
  const business = await getCurrentBusiness();

  if (!business) {
    throw new Error('No business found for current user');
  }

  return business;
}
