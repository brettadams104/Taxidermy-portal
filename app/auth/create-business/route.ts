import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { createBusinessForUser } from '@/lib/auth/business-setup'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, businessName } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    // Create the business for the user
    const business = await createBusinessForUser(userId, businessName)

    return NextResponse.json({ success: true, business })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create business'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
