import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Count users in user_profiles table
    const { count: profileCount, error: profileError } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })

    if (profileError) {
      console.error('Profile count error:', profileError)
    }

    // Try to get some sample user data
    const { data: sampleUsers, error: sampleError } = await supabase
      .from('user_profiles')
      .select('id, email, first_name, last_name, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (sampleError) {
      console.error('Sample users error:', sampleError)
    }

    // Try to get auth users count (this might not work due to RLS)
    let authUserCount = null
    try {
      const { count: authCount, error: authError } = await supabase
        .from('auth.users')
        .select('*', { count: 'exact', head: true })
      
      if (!authError) {
        authUserCount = authCount
      }
    } catch (err) {
      console.log('Cannot access auth.users table directly')
    }

    return NextResponse.json({
      success: true,
      userCounts: {
        userProfiles: profileCount || 0,
        authUsers: authUserCount || 'Not accessible',
        sampleUsers: sampleUsers || []
      },
      message: 'User count retrieved successfully'
    })

  } catch (err) {
    console.error('User count error:', err)
    return NextResponse.json({
      error: 'Failed to retrieve user count',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
