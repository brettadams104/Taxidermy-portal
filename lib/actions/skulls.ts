'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getNextStatus, isFinished } from '@/lib/actions/skull-helpers'
import { sendFinishedNotification } from '@/lib/notifications/send-finished'
import type { PaymentOption } from '@/lib/types'

export interface AddSkullInput {
  clientId: string
  points: number | null
  dnrTagNumber: string | null
  dateReceived: string
  price: number | null
  paymentOption: PaymentOption | null
  notes: string | null
}

export async function addSkull(input: AddSkullInput) {
  const supabase = await createClient()
  const amountPaid = input.price != null && input.paymentOption === 'full_upfront'
    ? input.price
    : input.price != null && input.paymentOption === 'half_upfront'
    ? Math.round(input.price / 2 * 100) / 100
    : 0
  const { error } = await supabase.from('skulls').insert({
    client_id: input.clientId,
    points: input.points,
    dnr_tag_number: input.dnrTagNumber,
    date_received: input.dateReceived,
    price: input.price,
    payment_option: input.paymentOption,
    notes: input.notes,
    amount_paid: amountPaid,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/clients/${input.clientId}`)
}

export async function updateSkull(skullId: string, input: {
  points: number | null
  dnrTagNumber: string | null
  dateReceived: string
  price: number | null
  paymentOption: PaymentOption | null
  notes: string | null
}) {
  const supabase = await createClient()
  const { data: skull } = await supabase.from('skulls').select('client_id').eq('id', skullId).single()

  // Auto-set amount_paid based on payment option
  const amountPaid = input.price != null && input.paymentOption === 'full_upfront'
    ? input.price
    : input.price != null && input.paymentOption === 'half_upfront'
    ? Math.round(input.price / 2 * 100) / 100
    : undefined

  const { error } = await supabase.from('skulls').update({
    points: input.points,
    dnr_tag_number: input.dnrTagNumber,
    date_received: input.dateReceived,
    price: input.price,
    payment_option: input.paymentOption,
    notes: input.notes,
    ...(amountPaid !== undefined ? { amount_paid: amountPaid } : {}),
  }).eq('id', skullId)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/skulls/${skullId}`)
  if (skull?.client_id) revalidatePath(`/admin/clients/${skull.client_id}`)
}

export async function advanceSkullStatus(skullId: string) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const { data: skull, error: fetchError } = await supabase
    .from('skulls')
    .select('*, client:profiles(id, name, phone)')
    .eq('id', skullId)
    .single()

  if (fetchError || !skull) throw new Error('Skull not found')

  const nextStatus = getNextStatus(skull.status)
  if (!nextStatus) throw new Error('Already at final status')

  const { error: updateError } = await supabase
    .from('skulls')
    .update({ status: nextStatus })
    .eq('id', skullId)

  if (updateError) throw new Error(updateError.message)

  if (isFinished(nextStatus)) {
    // Atomically flip finished_notified from false→true.
    // If another concurrent call already flipped it, this returns no rows and we skip.
    const { data: claimed } = await supabase
      .from('skulls')
      .update({ finished_notified: true })
      .eq('id', skullId)
      .eq('finished_notified', false)
      .select('id')

    if (claimed && claimed.length > 0) {
      const { data: { user } } = await adminClient.auth.admin.getUserById(skull.client_id)
      const email = user?.email

      const { data: templates } = await supabase
        .from('notification_templates')
        .select('*')
        .in('type', ['email', 'sms'])
      const emailTemplate = templates?.find(t => t.type === 'email')
      const smsTemplate = templates?.find(t => t.type === 'sms')

      if (email && emailTemplate && smsTemplate) {
        await sendFinishedNotification({
          clientEmail: email,
          clientPhone: skull.client?.phone ?? null,
          clientName: skull.client?.name ?? null,
          points: skull.points,
          dnrTag: skull.dnr_tag_number,
          emailTemplate: { subject: emailTemplate.subject ?? 'Your skull is ready!', body: emailTemplate.body },
          smsTemplate: { body: smsTemplate.body },
        })
      } else {
        console.warn('[advanceSkullStatus] finished notification skipped: missing email or templates for skull', skullId)
      }
    }
  }

  revalidatePath(`/admin/clients/${skull.client_id}`)
  revalidatePath(`/admin/skulls/${skullId}`)
}
