import twilio from 'twilio'

interface SendSmsParams {
  to: string
  body: string
}

export async function sendSms({ to, body }: SendSmsParams): Promise<{ success: boolean }> {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  try {
    await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to,
      body,
    })
    return { success: true }
  } catch (err) {
    console.error('SMS send failed:', err)
    return { success: false }
  }
}
