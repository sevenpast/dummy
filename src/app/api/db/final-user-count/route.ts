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
      message: 'Final user count retrieved',
      userCounts: {
        userProfiles: profileCount || 0,
        profiles: allProfiles || []
      },
      summary: {
        totalUsers: profileCount || 0,
        hasUsers: (profileCount || 0) > 0,
        rlsIssue: 'RLS is blocking profile creation - need authentication to create profiles'
      }
    })

  } catch (err) {
    console.error('Final user count error:', err)
    return NextResponse.json({
      error: 'Failed to retrieve final user count',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
