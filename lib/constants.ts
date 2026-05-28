import type { SkullStatus } from '@/lib/types'

export const SKULL_STATUSES: SkullStatus[] = [
  'Deer Head Received',
  'Skull Skinned',
  'Maceration Period',
  'Skull Cleaning',
  'Degreasing',
  'Whitening',
  'Finished',
]

export const PAYMENT_OPTIONS = [
  { value: 'full_upfront', label: 'Full Up Front' },
  { value: 'half_upfront', label: 'Half Up Front (Deposit)' },
  { value: 'pay_at_completion', label: 'Pay at Completion' },
] as const

export const BUSINESS_NAME = process.env.NEXT_PUBLIC_BUSINESS_NAME ?? 'Skull Studio'
