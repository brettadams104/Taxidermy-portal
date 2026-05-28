import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('resend')
vi.mock('twilio')
vi.mock('@/lib/notifications/email')
vi.mock('@/lib/notifications/sms')

import { sendFinishedNotification } from '@/lib/notifications/send-finished'
import { sendEmail } from '@/lib/notifications/email'
import { sendSms } from '@/lib/notifications/sms'

const mockSendEmail = vi.mocked(sendEmail)
const mockSendSms = vi.mocked(sendSms)

mockSendEmail.mockResolvedValue({ success: true })
mockSendSms.mockResolvedValue({ success: true })

const baseParams = {
  clientEmail: 'john@example.com',
  clientPhone: null as string | null,
  clientName: 'John',
  points: 8,
  dnrTag: 'MI-123',
  emailTemplate: { subject: 'Ready!', body: 'Hi {name}' },
  smsTemplate: { body: 'Hi {name}' },
}

describe('sendFinishedNotification', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('always sends email', async () => {
    await sendFinishedNotification(baseParams)
    expect(mockSendEmail).toHaveBeenCalledOnce()
  })

  it('sends sms when client has phone', async () => {
    await sendFinishedNotification({ ...baseParams, clientPhone: '+15551234567' })
    expect(mockSendSms).toHaveBeenCalledOnce()
  })

  it('skips sms when client has no phone', async () => {
    await sendFinishedNotification({ ...baseParams, clientPhone: null })
    expect(mockSendSms).not.toHaveBeenCalled()
  })

  it('renders template variables into email body', async () => {
    await sendFinishedNotification(baseParams)
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ body: 'Hi John' })
    )
  })
})
