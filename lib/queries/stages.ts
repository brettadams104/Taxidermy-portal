import { createClient } from '@/lib/supabase/server';

export async function getBusinessStages(businessId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('businesses')
    .select('stages')
    .eq('id', businessId)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Business not found');
  return data.stages || [];
}

export function isValidStatus(status: string, stages: string[]): boolean {
  return stages.includes(status);
}

export function getFinalStage(stages: string[]): string {
  if (stages.length === 0) throw new Error('Cannot get final stage from empty array');
  return stages[stages.length - 1];
}
