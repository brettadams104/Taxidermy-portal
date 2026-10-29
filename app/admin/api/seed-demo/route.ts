import { createClient } from '@/lib/supabase/server'
import { seedDemoData } from '@/lib/actions/seed-demo'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Verify user is authenticated and is an admin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's business
    const { data: profile } = await supabase
      .from('profiles')
      .select('business_id, role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Must be admin' }, { status: 403 })
    }

    // Seed the demo data
    const result = await seedDemoData(profile.business_id)

    return NextResponse.json({
      success: true,
      message: result.message,
      url: '/admin/dashboard'
    })
  } catch (error) {
    console.error('Seed demo error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to seed demo data' },
      { status: 500 }
    )
  }
}
