'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function logPayment(skullId: string, amount: number) {
  if (amount <= 0) throw new Error('Payment amount must be greater than zero')
  const supabase = await createClient()

  const { data: skull, error: fetchError } = await supabase
    .from('skulls')
    .select('amount_paid, client_id')
    .eq('id', skullId)
    .single()

  if (fetchError || !skull) throw new Error('Skull not found')

  const { error } = await supabase
    .from('skulls')
    .update({ amount_paid: (skull.amount_paid ?? 0) + amount })
    .eq('id', skullId)

  if (error) throw new Error(error.message)
  revalidatePath(`/admin/skulls/${skullId}`)
  revalidatePath(`/admin/clients/${skull.client_id}`)
}
