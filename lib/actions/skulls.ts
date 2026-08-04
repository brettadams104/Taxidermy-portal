// lib/actions/skulls.ts
'use server';

import { createServerClient, requireBusiness } from '@/lib/supabase/server';
import { getBusinessStages, getFinalStage, isValidStatus } from '@/lib/queries/stages';
import { getSkullById } from '@/lib/queries/skulls';
import type { SkullRecord } from '@/lib/queries/skulls';

/**
 * Server action to update a skull's status to the next stage in the workflow.
 * Enforces business_id multi-tenancy and validates status against business's stages.
 * When skull reaches final stage, sends notification instead of auto-transitioning.
 * @param skullId - The skull ID to update
 * @param newStatus - The new status/stage name
 * @returns Updated skull record
 * @throws Error if skull not found, status invalid, or update fails
 */
export async function updateSkullStatus(skullId: string, newStatus: string): Promise<SkullRecord> {
  if (!skullId?.trim()) {
    throw new Error('skullId must be a non-empty string');
  }
  if (!newStatus?.trim()) {
    throw new Error('newStatus must be a non-empty string');
  }

  // Require authentication and business context
  const business = await requireBusiness();

  // Retrieve the skull and verify it belongs to this business
  const skull = await getSkullById(skullId, business.id);
  if (!skull) {
    throw new Error(`Skull not found: ${skullId}`);
  }

  // Validate that the new status is valid for this business
  const stages = await getBusinessStages(business.id);
  if (!isValidStatus(newStatus, stages)) {
    throw new Error(`Invalid status "${newStatus}" for business workflow. Valid statuses: ${stages.join(', ')}`);
  }

  const supabase = await createServerClient();

  // Update the skull status
  const { data: updatedSkull, error } = await supabase
    .from('skulls')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', skullId)
    .eq('business_id', business.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update skull status: ${error.message}`);
  }

  if (!updatedSkull) {
    throw new Error(`Skull update returned no data for: ${skullId}`);
  }

  // If skull reached final stage, send notification
  const finalStage = getFinalStage(stages);
  if (newStatus === finalStage) {
    await notifySkullReachedFinalStage(skullId, business.id);
  }

  return updatedSkull as SkullRecord;
}

/**
 * Sends a notification when a skull reaches the final stage.
 * In multi-stage workflows, this replaces the old hardcoded "auto-transition" behavior.
 * Now skulls stay at the final stage and a notification alerts the business.
 * @param skullId - The skull ID that reached final stage
 * @param businessId - The business ID for multi-tenancy
 * @throws Error if notification creation fails
 */
async function notifySkullReachedFinalStage(skullId: string, businessId: string): Promise<void> {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from('notifications')
    .insert({
      business_id: businessId,
      skull_id: skullId,
      type: 'skull_completed',
      message: `Skull ${skullId} has reached the final stage`,
      read: false,
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error(`Failed to create notification for skull ${skullId}:`, error);
    // Don't throw - notification failure shouldn't block the status update
  }
}

/**
 * Creates a new skull record for a business and client.
 * Automatically sets the skull to the first stage of the business workflow.
 * @param clientId - The client this skull belongs to
 * @param metadata - Optional additional data to store with the skull
 * @returns Created skull record
 * @throws Error if skull creation fails
 */
export async function createSkull(clientId: string, metadata?: Record<string, any>): Promise<SkullRecord> {
  if (!clientId?.trim()) {
    throw new Error('clientId must be a non-empty string');
  }

  // Require authentication and business context
  const business = await requireBusiness();

  // Get the first stage for this business
  const stages = await getBusinessStages(business.id);
  if (!stages || stages.length === 0) {
    throw new Error('Business has no stages configured');
  }

  const initialStage = stages[0];

  const supabase = await createServerClient();

  // Create the skull at the initial stage
  const { data: skull, error } = await supabase
    .from('skulls')
    .insert({
      business_id: business.id,
      client_id: clientId,
      status: initialStage,
      ...metadata,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create skull: ${error.message}`);
  }

  if (!skull) {
    throw new Error('Skull creation returned no data');
  }

  return skull as SkullRecord;
}

/**
 * Deletes a skull record from the database.
 * Enforces business_id multi-tenancy to prevent cross-business deletion.
 * @param skullId - The skull ID to delete
 * @returns true if deletion was successful
 * @throws Error if skull not found or deletion fails
 */
export async function deleteSkull(skullId: string): Promise<boolean> {
  if (!skullId?.trim()) {
    throw new Error('skullId must be a non-empty string');
  }

  // Require authentication and business context
  const business = await requireBusiness();

  // Verify skull belongs to this business before deleting
  const skull = await getSkullById(skullId, business.id);
  if (!skull) {
    throw new Error(`Skull not found: ${skullId}`);
  }

  const supabase = await createServerClient();

  // Delete the skull (RLS policies will enforce business_id check)
  const { error } = await supabase
    .from('skulls')
    .delete()
    .eq('id', skullId)
    .eq('business_id', business.id);

  if (error) {
    throw new Error(`Failed to delete skull: ${error.message}`);
  }

  return true;
}

/**
 * Updates skull metadata while preserving status and other controlled fields.
 * Only allows updating custom metadata, not workflow-critical fields.
 * @param skullId - The skull ID to update
 * @param metadata - Key-value pairs to update (custom fields only)
 * @returns Updated skull record
 * @throws Error if skull not found or update fails
 */
export async function updateSkullMetadata(
  skullId: string,
  metadata: Record<string, any>
): Promise<SkullRecord> {
  if (!skullId?.trim()) {
    throw new Error('skullId must be a non-empty string');
  }
  if (!metadata || typeof metadata !== 'object' || Object.keys(metadata).length === 0) {
    throw new Error('metadata must be a non-empty object');
  }

  // Prevent updating protected fields
  const protectedFields = ['id', 'business_id', 'client_id', 'status', 'created_at'];
  const hasProtectedFields = Object.keys(metadata).some((key) => protectedFields.includes(key));
  if (hasProtectedFields) {
    throw new Error(`Cannot update protected fields: ${protectedFields.join(', ')}`);
  }

  // Require authentication and business context
  const business = await requireBusiness();

  // Verify skull belongs to this business
  const skull = await getSkullById(skullId, business.id);
  if (!skull) {
    throw new Error(`Skull not found: ${skullId}`);
  }

  const supabase = await createServerClient();

  // Update metadata
  const { data: updatedSkull, error } = await supabase
    .from('skulls')
    .update({
      ...metadata,
      updated_at: new Date().toISOString(),
    })
    .eq('id', skullId)
    .eq('business_id', business.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update skull metadata: ${error.message}`);
  }

  if (!updatedSkull) {
    throw new Error(`Skull metadata update returned no data for: ${skullId}`);
  }

  return updatedSkull as SkullRecord;
}
