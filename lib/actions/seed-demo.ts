'use server'

import { createAdminClient } from '@/lib/supabase/admin'

const FIRST_NAMES = [
  'James', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas',
  'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Donald', 'Mark',
  'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George',
  'Edward', 'Ronald', 'Timothy', 'Jason', 'Jeffrey', 'Ryan', 'Jacob', 'Gary'
]

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Young'
]

const CITIES = [
  'Denver', 'Boulder', 'Fort Collins', 'Greeley', 'Longmont', 'Loveland',
  'Aspen', 'Vail', 'Breckenridge', 'Steamboat Springs', 'Grand Junction'
]

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generatePhoneNumber(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100
  const exchange = Math.floor(Math.random() * 900) + 100
  const subscriber = Math.floor(Math.random() * 9000) + 1000
  return `(${areaCode}) ${exchange}-${subscriber}`
}

export async function seedDemoData(businessId: string) {
  const adminClient = createAdminClient()

  try {
    // Create 200 clients
    const clients = []
    for (let i = 0; i < 200; i++) {
      const firstName = getRandomItem(FIRST_NAMES)
      const lastName = getRandomItem(LAST_NAMES)
      const city = getRandomItem(CITIES)

      clients.push({
        id: `client_${i + 1}`,
        business_id: businessId,
        name: `${firstName} ${lastName}`,
        email: null,
        phone: generatePhoneNumber(),
        address: `${Math.floor(Math.random() * 9000) + 1000} Main St, ${city}, CO`,
        role: 'client',
      })
    }

    // Insert clients in batches
    for (let i = 0; i < clients.length; i += 100) {
      const batch = clients.slice(i, i + 100)
      const { error } = await adminClient.from('profiles').insert(batch)
      if (error) throw error
    }

    console.log(`Created ${clients.length} clients`)

    // Create skulls
    const skulls = []
    let skullIndex = 0

    // 2025 Skulls (170 total - all completed and paid)
    const skull2025Dates = generateSkullDates2025()

    for (let i = 0; i < 170; i++) {
      const clientId = clients[i % clients.length].id
      const dateReceived = skull2025Dates[i]
      const price = Math.floor(Math.random() * 2700) + 800 // $800-$3500
      const points = Math.floor(Math.random() * 300) + 50

      skulls.push({
        id: `skull_2025_${i + 1}`,
        client_id: clientId,
        business_id: businessId,
        status: 'Picked Up',
        date_received: dateReceived,
        points: points,
        dnr_tag_number: Math.random() > 0.7 ? `DNR-${Math.floor(Math.random() * 1000000)}` : null,
        price: price,
        payment_option: 'full_upfront',
        amount_paid: price,
        notes: `Completed project from 2025 season`,
        finished_notified: true,
      })
    }

    // 2026 Skulls (40 total - some with outstanding balances)
    const skull2026Dates = generateSkullDates2026()

    for (let i = 0; i < 40; i++) {
      const clientId = clients[(170 + i) % clients.length].id
      const dateReceived = skull2026Dates[i]
      const price = Math.floor(Math.random() * 2700) + 800
      const points = Math.floor(Math.random() * 300) + 50
      const hasOutstandingBalance = i % 2 === 0 // Half have outstanding balances

      const amountPaid = hasOutstandingBalance
        ? Math.floor(price * 0.5) // Pay half
        : price // Full payment

      // Status: if fully paid, mark completed. If partial, mark in progress
      const status = hasOutstandingBalance ? 'Mounting' : 'Picked Up'

      skulls.push({
        id: `skull_2026_${i + 1}`,
        client_id: clientId,
        business_id: businessId,
        status: status,
        date_received: dateReceived,
        points: points,
        dnr_tag_number: Math.random() > 0.7 ? `DNR-${Math.floor(Math.random() * 1000000)}` : null,
        price: price,
        payment_option: hasOutstandingBalance ? 'half_upfront' : 'full_upfront',
        amount_paid: amountPaid,
        notes: `Project from 2026 season`,
        finished_notified: false,
      })
    }

    // Insert skulls in batches
    for (let i = 0; i < skulls.length; i += 100) {
      const batch = skulls.slice(i, i + 100)
      const { error } = await adminClient.from('skulls').insert(batch)
      if (error) throw error
    }

    console.log(`Created ${skulls.length} skulls`)
    return { success: true, message: `Created 200 clients and 210 skulls` }
  } catch (error) {
    console.error('Seed error:', error)
    throw error
  }
}

function generateSkullDates2025(): string[] {
  const dates: string[] = []
  const year = 2025

  // 20% in October (34 skulls)
  for (let i = 0; i < 34; i++) {
    const day = Math.floor(Math.random() * 31) + 1
    dates.push(`${year}-10-${String(day).padStart(2, '0')}`)
  }

  // 50% in November (85 skulls)
  for (let i = 0; i < 85; i++) {
    const day = Math.floor(Math.random() * 30) + 1
    dates.push(`${year}-11-${String(day).padStart(2, '0')}`)
  }

  // 20% in December (34 skulls)
  for (let i = 0; i < 34; i++) {
    const day = Math.floor(Math.random() * 31) + 1
    dates.push(`${year}-12-${String(day).padStart(2, '0')}`)
  }

  // 10% scattered through Jan-Aug (17 skulls)
  for (let i = 0; i < 17; i++) {
    const month = Math.floor(Math.random() * 8) + 1
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31][month - 1]
    const day = Math.floor(Math.random() * daysInMonth) + 1
    dates.push(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
  }

  return dates.sort(() => Math.random() - 0.5)
}

function generateSkullDates2026(): string[] {
  const dates: string[] = []
  const year = 2026
  const today = new Date(2026, 9, 28) // October 28, 2026

  // 20% in October (8 skulls) - up to today
  for (let i = 0; i < 8; i++) {
    const day = Math.floor(Math.random() * 28) + 1
    dates.push(`${year}-10-${String(day).padStart(2, '0')}`)
  }

  // 50% in November (20 skulls)
  for (let i = 0; i < 20; i++) {
    const day = Math.floor(Math.random() * 30) + 1
    dates.push(`${year}-11-${String(day).padStart(2, '0')}`)
  }

  // 20% in December (8 skulls)
  for (let i = 0; i < 8; i++) {
    const day = Math.floor(Math.random() * 31) + 1
    dates.push(`${year}-12-${String(day).padStart(2, '0')}`)
  }

  // 10% scattered through Jan-Aug (4 skulls)
  for (let i = 0; i < 4; i++) {
    const month = Math.floor(Math.random() * 8) + 1
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31][month - 1]
    const day = Math.floor(Math.random() * daysInMonth) + 1
    dates.push(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
  }

  return dates.sort(() => Math.random() - 0.5)
}
