import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'This endpoint is only available in development' }, { status: 403 })
  }

  try {
    const supabase = await createClient()
    
    // Create a dummy user profile directly in the database
    // We'll use a fake UUID that looks like a real Supabase user ID
    const dummyUserId = '00000000-0000-0000-0000-000000000001'
    
    const dummyProfile = {
      user_id: dummyUserId,
      email: 'dummy@example.com',
      first_name: 'Dummy',
      last_name: 'User',
      phone: '+41 44 123 45 67',
      postal_code: '8001',
      municipality: 'Zürich',
      canton: 'Zürich',
      country_of_origin: 'Deutschland',
      has_children: false,
      family_status: 'single',
      arrival_date: '2024-01-15',
      work_permit_type: 'EU/EFTA',
      language_preference: 'de',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Try to insert the dummy profile
    const { data: insertData, error: insertError } = await supabase
      .from('user_profiles')
      .insert(dummyProfile)
      .select()

    if (insertError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create dummy profile',
        details: insertError.message,
        code: insertError.code,
        hint: insertError.hint
      })
    }

    // Get all profiles to show the count
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (allProfilesError) {
      console.error('All profiles error:', allProfilesError)
    }

    // Count total profiles
    const { count: totalCount, error: countError } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Count error:', countError)
    }

    return NextResponse.json({
      success: true,
      message: 'Dummy user created successfully!',
      dummyUser: {
        id: dummyUserId,
        email: 'dummy@example.com',
        name: 'Dummy User',
        phone: '+41 44 123 45 67',
        location: 'Zürich, 8001',
        country: 'Deutschland'
      },
      database: {
        totalProfiles: totalCount || 0,
        allProfiles: allProfiles || []
      },
      note: 'This is a dummy user for testing - no authentication required!'
    })

  } catch (err) {
    console.error('Create dummy user error:', err)
    return NextResponse.json({
      error: 'Failed to create dummy user',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
