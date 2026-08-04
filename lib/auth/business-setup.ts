// lib/auth/business-setup.ts
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_STAGES } from '@/lib/types/business';
import type { Business } from '@/lib/types/business';

export async function createBusinessForUser(
  userId: string,
  businessName?: string
): Promise<Business> {
  const supabase = await createClient();

  // Create business record
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .insert({
      owner_id: userId,
      business_name: businessName || 'My Taxidermy Studio',
      stages: DEFAULT_STAGES,
    })
    .select()
    .single();

  if (businessError) throw businessError;
  if (!business) throw new Error('Failed to create business');

  // Link profile to business
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ business_id: business.id })
    .eq('id', userId);

  if (profileError) throw profileError;

  return business as Business;
}

export async function getBusinessForUser(userId: string): Promise<Business | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return (data as Business) || null;
}
