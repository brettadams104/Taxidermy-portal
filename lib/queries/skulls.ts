// lib/queries/skulls.ts
import { createServerClient } from '@/lib/supabase/server';

/**
 * Skull record from the database with multi-tenancy support
 */
export interface SkullRecord {
  id: string;
  business_id: string;
  client_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  [key: string]: any; // Allow additional fields from database
}

/**
 * Retrieves all skulls for a specific business.
 * Results are filtered by business_id to enforce multi-tenancy.
 * @param businessId - The business ID to filter by
 * @returns Array of skull records for the business
 * @throws Error if query fails
 */
export async function getAllSkullsByBusiness(businessId: string): Promise<SkullRecord[]> {
  if (!businessId?.trim()) {
    throw new Error('businessId must be a non-empty string');
  }

  const supabase = await createServerClient();

  const { data: skulls, error } = await supabase
    .from('skulls')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (skulls as SkullRecord[]) || [];
}

/**
 * Retrieves a single skull by ID for a specific business.
 * Enforces business_id filter to prevent cross-business access.
 * @param skullId - The skull ID to retrieve
 * @param businessId - The business ID to verify ownership
 * @returns The skull record or null if not found
 * @throws Error if query fails
 */
export async function getSkullById(skullId: string, businessId: string): Promise<SkullRecord | null> {
  if (!skullId?.trim()) {
    throw new Error('skullId must be a non-empty string');
  }
  if (!businessId?.trim()) {
    throw new Error('businessId must be a non-empty string');
  }

  const supabase = await createServerClient();

  const { data: skull, error } = await supabase
    .from('skulls')
    .select('*')
    .eq('id', skullId)
    .eq('business_id', businessId)
    .single();

  // Handle "no rows" case gracefully
  if (error && error.code === 'PGRST116') {
    return null;
  }

  if (error) throw error;

  return (skull as SkullRecord) || null;
}

/**
 * Retrieves all skulls with a specific status for a business.
 * Used for filtering skulls by workflow stage.
 * @param businessId - The business ID to filter by
 * @param status - The status/stage to filter by
 * @returns Array of skull records with the specified status
 * @throws Error if query fails
 */
export async function getSkullsByStatus(businessId: string, status: string): Promise<SkullRecord[]> {
  if (!businessId?.trim()) {
    throw new Error('businessId must be a non-empty string');
  }
  if (!status?.trim()) {
    throw new Error('status must be a non-empty string');
  }

  const supabase = await createServerClient();

  const { data: skulls, error } = await supabase
    .from('skulls')
    .select('*')
    .eq('business_id', businessId)
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (skulls as SkullRecord[]) || [];
}

/**
 * Retrieves all skulls in progress (not at final stage) for a business.
 * @param businessId - The business ID to filter by
 * @param inProgressStatuses - Array of statuses that are considered "in progress"
 * @returns Array of in-progress skull records
 * @throws Error if query fails
 */
export async function getSkullsInProgress(
  businessId: string,
  inProgressStatuses: string[]
): Promise<SkullRecord[]> {
  if (!businessId?.trim()) {
    throw new Error('businessId must be a non-empty string');
  }
  if (!Array.isArray(inProgressStatuses) || inProgressStatuses.length === 0) {
    throw new Error('inProgressStatuses must be a non-empty array');
  }

  const supabase = await createServerClient();

  const { data: skulls, error } = await supabase
    .from('skulls')
    .select('*')
    .eq('business_id', businessId)
    .in('status', inProgressStatuses)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (skulls as SkullRecord[]) || [];
}

/**
 * Retrieves all completed skulls (at final stage) for a business.
 * @param businessId - The business ID to filter by
 * @param finalStatus - The final status/stage name
 * @returns Array of completed skull records
 * @throws Error if query fails
 */
export async function getCompletedSkulls(businessId: string, finalStatus: string): Promise<SkullRecord[]> {
  if (!businessId?.trim()) {
    throw new Error('businessId must be a non-empty string');
  }
  if (!finalStatus?.trim()) {
    throw new Error('finalStatus must be a non-empty string');
  }

  const supabase = await createServerClient();

  const { data: skulls, error } = await supabase
    .from('skulls')
    .select('*')
    .eq('business_id', businessId)
    .eq('status', finalStatus)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (skulls as SkullRecord[]) || [];
}

/**
 * Retrieves skulls for a specific client within a business.
 * Enforces both business_id and client_id filtering.
 * @param businessId - The business ID to filter by
 * @param clientId - The client ID to filter by
 * @returns Array of skull records for the client
 * @throws Error if query fails
 */
export async function getSkullsByClient(businessId: string, clientId: string): Promise<SkullRecord[]> {
  if (!businessId?.trim()) {
    throw new Error('businessId must be a non-empty string');
  }
  if (!clientId?.trim()) {
    throw new Error('clientId must be a non-empty string');
  }

  const supabase = await createServerClient();

  const { data: skulls, error } = await supabase
    .from('skulls')
    .select('*')
    .eq('business_id', businessId)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (skulls as SkullRecord[]) || [];
}

/**
 * Counts total skulls for a business.
 * @param businessId - The business ID to filter by
 * @returns Number of skulls in the business
 * @throws Error if query fails
 */
export async function countSkullsByBusiness(businessId: string): Promise<number> {
  if (!businessId?.trim()) {
    throw new Error('businessId must be a non-empty string');
  }

  const supabase = await createServerClient();

  const { count, error } = await supabase
    .from('skulls')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId);

  if (error) throw error;

  return count || 0;
}
