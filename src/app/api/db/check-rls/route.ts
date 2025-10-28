import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Try to check RLS policies
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'user_profiles')

    if (policiesError) {
      console.error('Policies error:', policiesError)
    }

    // Try to check if we can disable RLS temporarily
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('check_rls_status', { table_name: 'user_profiles' })

    if (rlsError) {
      console.error('RLS status error:', rlsError)
    }

    // Try a different approach - check if we can insert with a different user context
    const { data: currentUser, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('User error:', userError)
    }

    return NextResponse.json({
      success: true,
      message: 'RLS check completed',
      policies: policies || 'Not accessible',
      rlsStatus: rlsStatus || 'Not accessible',
      currentUser: currentUser?.user || 'Not authenticated',
      userError: userError?.message
    })

  } catch (err) {
    console.error('Check RLS error:', err)
    return NextResponse.json({
      error: 'Failed to check RLS',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
