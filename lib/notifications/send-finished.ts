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

  await sendEmail({
    to: params.clientEmail,
    subject: renderTemplate(params.emailTemplate.subject, vars),
    body: renderTemplate(params.emailTemplate.body, vars),
  })

  if (params.clientPhone) {
    await sendSms({
      to: params.clientPhone,
      body: renderTemplate(params.smsTemplate.body, vars),
    })
  }
}
