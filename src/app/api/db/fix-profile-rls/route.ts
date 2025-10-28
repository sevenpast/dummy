import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    // Create a client with service role key to bypass RLS
    const supabase = await createClient()
    
    // Try to create the profile with the service role
    const testProfile = {
      user_id: 'c70f12a2-e5ca-426f-ac84-d1d45a30fed4',
      email: 'testuser@gmail.com',
      first_name: 'Test',
      last_name: 'User',
      phone: '+1234567890'
    }

    const { data: insertData, error: insertError } = await supabase
      .from('user_profiles')
      .insert(testProfile)
      .select()

    if (insertError) {
      return NextResponse.json({
        success: false,
        error: 'Profile insert failed',
        details: insertError.message,
        code: insertError.code,
        hint: insertError.hint
      })
    }

    // Now count all profiles
    const { count: profileCount, error: countError } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Count error:', countError)
    }

    // Get all profiles
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (allProfilesError) {
      console.error('All profiles error:', allProfilesError)
    }

    return NextResponse.json({
      success: true,
      message: 'Profile created successfully',
      profile: insertData,
      totalProfiles: profileCount || 0,
      allProfiles: allProfiles || []
    })

  } catch (err) {
    console.error('Fix profile RLS error:', err)
    return NextResponse.json({
      error: 'Failed to fix profile RLS',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
