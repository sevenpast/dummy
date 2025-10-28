import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Search specifically for hublaizel@icloud.com in user_profiles
    const { data: specificProfile, error: specificError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', 'hublaizel@icloud.com')

    if (specificError) {
      console.error('Specific profile error:', specificError)
    }

    // Also search for any profiles with icloud.com
    const { data: icloudProfiles, error: icloudError } = await supabase
      .from('user_profiles')
      .select('*')
      .ilike('email', '%icloud.com%')

    if (icloudError) {
      console.error('iCloud profiles error:', icloudError)
    }

    // Get all profiles to see what's actually there
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
      message: 'Specific email search completed',
      results: {
        hublaizelProfile: specificProfile || [],
        icloudProfiles: icloudProfiles || [],
        allProfiles: allProfiles || [],
        totalCount: totalCount || 0
      },
      found: {
        hublaizel: (specificProfile && specificProfile.length > 0),
        anyIcloud: (icloudProfiles && icloudProfiles.length > 0),
        anyProfiles: (allProfiles && allProfiles.length > 0)
      }
    })

  } catch (err) {
    console.error('Specific email search error:', err)
    return NextResponse.json({
      error: 'Failed to search for specific email',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
