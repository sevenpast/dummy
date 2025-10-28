import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'This endpoint is only available in development' }, { status: 403 })
  }

  try {
    const supabase = await createClient()
    
    // Try to create a SQL function that bypasses RLS
    const { data: functionResult, error: functionError } = await supabase
      .rpc('create_dummy_user_profile', {
        p_user_id: '00000000-0000-0000-0000-000000000001',
        p_email: 'dummy@example.com',
        p_first_name: 'Dummy',
        p_last_name: 'User',
        p_phone: '+41 44 123 45 67',
        p_postal_code: '8001',
        p_municipality: 'Zürich',
        p_canton: 'Zürich',
        p_country_of_origin: 'Deutschland'
      })

    if (functionError) {
      // If the function doesn't exist, try a different approach
      // Let's try to disable RLS temporarily or use a different method
      
      // Try to create a simple profile with minimal data
      const { data: simpleProfile, error: simpleError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000001',
          email: 'dummy@example.com',
          first_name: 'Dummy',
          last_name: 'User'
        })
        .select()

      if (simpleError) {
        return NextResponse.json({
          success: false,
          error: 'Cannot create dummy user due to RLS',
          details: simpleError.message,
          code: simpleError.code,
          suggestion: 'RLS is blocking all profile creation. Need to authenticate first or modify RLS policies.'
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Dummy user created with minimal data!',
        dummyUser: simpleProfile,
        note: 'Created with minimal required fields only'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Dummy user created via SQL function!',
      dummyUser: functionResult
    })

  } catch (err) {
    console.error('Create dummy user error:', err)
    return NextResponse.json({
      error: 'Failed to create dummy user',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
