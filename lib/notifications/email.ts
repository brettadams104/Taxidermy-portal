import { Resend } from 'resend'
import { BUSINESS_NAME } from '@/lib/constants'

interface SendEmailParams {
  to: string
  subject: string
  body: string
}

export async function sendEmail({ to, subject, body }: SendEmailParams): Promise<{ success: boolean }> {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const fromDomain = process.env.RESEND_FROM_DOMAIN ?? 'resend.dev'

  const { error } = await resend.emails.send({
    from: `${BUSINESS_NAME} <notifications@${fromDomain}>`,
    to,
    subject,
    text: body,
  })

  if (error) {
    console.error('Email send failed:', error)
    return { success: false }
  }
  return { success: true }
}
