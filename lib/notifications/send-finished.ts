import { sendEmail } from '@/lib/notifications/email'
import { sendSms } from '@/lib/notifications/sms'
import { renderTemplate, buildTemplateVars } from '@/lib/notifications/templates'
import { BUSINESS_NAME } from '@/lib/constants'

interface SendFinishedParams {
  clientEmail: string
  clientPhone: string | null
  clientName: string | null
  points: number | null
  dnrTag: string | null
  emailTemplate: { subject: string; body: string }
  smsTemplate: { body: string }
}

export async function sendFinishedNotification(params: SendFinishedParams): Promise<void> {
  const vars = buildTemplateVars(params.clientName, params.points, params.dnrTag, BUSINESS_NAME)

  const emailResult = await sendEmail({
    to: params.clientEmail,
    subject: renderTemplate(params.emailTemplate.subject, vars),
    body: renderTemplate(params.emailTemplate.body, vars),
  })

  if (!emailResult.success) {
    console.error('[send-finished] email notification failed for:', params.clientEmail)
  }

  if (params.clientPhone) {
    const smsResult = await sendSms({
      to: params.clientPhone,
      body: renderTemplate(params.smsTemplate.body, vars),
    })
    if (!smsResult.success) {
      console.error('[send-finished] SMS notification failed for:', params.clientPhone)
    }
  }
}
