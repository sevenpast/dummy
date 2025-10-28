import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Try to get the user profile we just created
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', 'testuser@gmail.com')

    if (profileError) {
      return NextResponse.json({
        success: false,
        error: 'Profile query failed',
        details: profileError.message,
        code: profileError.code
      })
    }

    // Try to insert a test profile to see what happens
    const testProfile = {
      user_id: 'c70f12a2-e5ca-426f-ac84-d1d45a30fed4', // The user ID from the previous response
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
        hint: insertError.hint,
        existingProfiles: profiles
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Profile created successfully',
      profile: insertData,
      existingProfiles: profiles
    })

  } catch (err) {
    console.error('Debug profile error:', err)
    return NextResponse.json({
      error: 'Failed to debug profile',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
