import { Resend } from 'resend'

interface SendEmailParams {
  to: string
  subject: string
  body: string
}

export async function sendEmail({ to, subject, body }: SendEmailParams): Promise<{ success: boolean }> {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME ?? 'Skull Studio'
  const fromDomain = process.env.RESEND_FROM_DOMAIN ?? 'resend.dev'

  const { error } = await resend.emails.send({
    from: `${businessName} <notifications@${fromDomain}>`,
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
