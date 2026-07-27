export type UserRole = 'admin' | 'client'

export type SkullStatus =
  | 'Deer Head Received'
  | 'Skull Skinned'
  | 'Maceration Period'
  | 'Skull Cleaning'
  | 'Degreasing'
  | 'Whitening'
  | 'Finished'
  | 'Pending Pickup'
  | 'Picked Up'

export type PaymentOption = 'full_upfront' | 'half_upfront' | 'pay_at_completion'

export type NotificationType = 'email' | 'sms'

export interface Profile {
  id: string
  role: UserRole
  name: string | null
  phone: string | null
  address: string | null
  created_at: string
}

export interface ProfileWithEmail extends Profile {
  email: string
}

export interface Skull {
  id: string
  client_id: string
  points: number | null
  dnr_tag_number: string | null
  date_received: string
  status: SkullStatus
  price: number | null
  payment_option: PaymentOption | null
  amount_paid: number
  notes: string | null
  finished_notified: boolean
  created_at: string
}

export interface NotificationTemplate {
  id: string
  type: NotificationType
  subject: string | null
  body: string
  updated_at: string
}
