import { createClient } from '@/lib/supabase/server'
import type { Skull } from '@/lib/types'

/**
 * Get all skulls for a specific business
 */
export async function getAllSkullsByBusiness(businessId: string) {
  const supabase = await createClient()
  const { data: skulls, error } = await supabase
    .from('skulls')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return skulls || []
}

/**
 * Get a specific skull by ID, ensuring it belongs to the business
 */
export async function getSkullById(skullId: string, businessId: string) {
  const supabase = await createClient()
  const { data: skull, error } = await supabase
    .from('skulls')
    .select('*')
    .eq('id', skullId)
    .eq('business_id', businessId)
    .single()

  if (error) throw error
  return skull
}

/**
 * Get skulls with a specific status for a business
 */
export async function getSkullsByStatus(status: string, businessId: string) {
  const supabase = await createClient()
  const { data: skulls, error } = await supabase
    .from('skulls')
    .select('*')
    .eq('business_id', businessId)
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) throw error
  return skulls || []
}

/**
 * Get all skulls in progress (not in final stage) for a business
 */
export async function getSkullsInProgress(businessId: string, finalStage: string) {
  const supabase = await createClient()
  const { data: skulls, error } = await supabase
    .from('skulls')
    .select('*')
    .eq('business_id', businessId)
    .neq('status', finalStage)
    .order('created_at', { ascending: false })

  if (error) throw error
  return skulls || []
}

/**
 * Get all completed skulls (in final stage) for a business
 */
export async function getCompletedSkulls(businessId: string, finalStage: string) {
  const supabase = await createClient()
  const { data: skulls, error } = await supabase
    .from('skulls')
    .select('*')
    .eq('business_id', businessId)
    .eq('status', finalStage)
    .order('created_at', { ascending: false })

  if (error) throw error
  return skulls || []
}

/**
 * Get skulls with detailed client information for a business
 */
export async function getSkullsWithClients(businessId: string) {
  const supabase = await createClient()
  const { data: skulls, error } = await supabase
    .from('skulls')
    .select('*, profiles(id, name, phone)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return skulls || []
}

/**
 * Get skulls in progress with client details for a business
 */
export async function getSkullsInProgressWithClients(
  businessId: string,
  finalStage: string
) {
  const supabase = await createClient()
  const { data: skulls, error } = await supabase
    .from('skulls')
    .select('*, profiles(id, name, phone)')
    .eq('business_id', businessId)
    .neq('status', finalStage)
    .order('created_at', { ascending: false })

  if (error) throw error
  return skulls || []
}

/**
 * Get skull with client details
 */
export async function getSkullWithClient(skullId: string, businessId: string) {
  const supabase = await createClient()
  const { data: skull, error } = await supabase
    .from('skulls')
    .select('*, profiles(id, name, phone)')
    .eq('id', skullId)
    .eq('business_id', businessId)
    .single()

  if (error) throw error
  return skull
}

/**
 * Count skulls by status for a business
 */
export async function countSkullsByStatus(
  businessId: string
): Promise<Record<string, number>> {
  const supabase = await createClient()
  const { data: skulls, error } = await supabase
    .from('skulls')
    .select('status')
    .eq('business_id', businessId)

  if (error) throw error

  const counts: Record<string, number> = {}
  skulls?.forEach(skull => {
    counts[skull.status] = (counts[skull.status] || 0) + 1
  })
  return counts
}
