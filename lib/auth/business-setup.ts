import { createClient } from '@supabase/supabase-js'
import { DEFAULT_STAGES, type Business } from '@/lib/types/business'

/**
 * Create a new business record for a user during signup.
 * Uses service role key to bypass RLS policies.
 *
 * @param userId - The Supabase user ID (must be a non-empty string)
 * @param businessName - Optional business name (defaults to "My Taxidermy Studio")
 * @returns The created Business object
 * @throws Error if userId is empty or if database operations fail
 */
export async function createBusinessForUser(
  userId: string,
  businessName?: string
): Promise<Business> {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('userId must be a non-empty string')
  }

  // Use service role key to bypass RLS policies (needed for creating business records)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )

  const businessNameToUse = businessName || 'My Taxidermy Studio'

  // Create the business record
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .insert([
      {
        owner_id: userId,
        business_name: businessNameToUse,
        stages: DEFAULT_STAGES,
      },
    ])
    .select()
    .single()

  if (businessError) {
    throw new Error(
      `Failed to create business: ${businessError.message}`
    )
  }

  // Link the profile to the business
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ business_id: business.id })
    .eq('id', userId)

  if (profileError) {
    throw new Error(
      `Failed to link profile to business: ${profileError.message}`
    )
  }

  return business as Business
}

/**
 * Retrieve the business record for a user.
 *
 * @param userId - The Supabase user ID (must be a non-empty string)
 * @returns The Business object, or null if no business exists for this user
 * @throws Error if userId is empty or if database operations fail (except "no rows" case)
 */
export async function getBusinessForUser(
  userId: string
): Promise<Business | null> {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('userId must be a non-empty string')
  }

  const supabase = await createClient()

  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', userId)
    .single()

  // PGRST116 is the Postgres error code for "no rows found"
  if (error && error.code === 'PGRST116') {
    return null
  }

  if (error) {
    throw new Error(
      `Failed to retrieve business: ${error.message}`
    )
  }

  return business as Business
}
