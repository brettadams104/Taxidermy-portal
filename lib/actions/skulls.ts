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
  const { error } = await supabase.from('skulls').insert({
    client_id: input.clientId,
    points: input.points,
    dnr_tag_number: input.dnrTagNumber,
    date_received: input.dateReceived,
    price: input.price,
    payment_option: input.paymentOption,
    notes: input.notes,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/clients/${input.clientId}`)
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

  if (isFinished(nextStatus) && !skull.finished_notified) {
    const { data: { user } } = await adminClient.auth.admin.getUserById(skull.client_id)
    const email = user?.email

    const { data: templates } = await supabase.from('notification_templates').select('*').in('type', ['email', 'sms'])
    const emailTemplate = templates?.find(t => t.type === 'email')
    const smsTemplate = templates?.find(t => t.type === 'sms')

    if (!email || !emailTemplate || !smsTemplate) {
      console.warn('[advanceSkullStatus] finished notification skipped: missing email, email template, or SMS template for skull', skullId)
    } else {
      await sendFinishedNotification({
        clientEmail: email,
        clientPhone: skull.client?.phone ?? null,
        clientName: skull.client?.name ?? null,
        points: skull.points,
        dnrTag: skull.dnr_tag_number,
        emailTemplate: { subject: emailTemplate.subject ?? 'Your skull is ready!', body: emailTemplate.body },
        smsTemplate: { body: smsTemplate.body },
      })
      await supabase.from('skulls').update({ finished_notified: true }).eq('id', skullId)
    }
  }

  revalidatePath(`/admin/clients/${skull.client_id}`)
  revalidatePath(`/admin/skulls/${skullId}`)
}
