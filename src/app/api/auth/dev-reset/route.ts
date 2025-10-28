import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'This endpoint is only available in development' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Try to find and delete the user profile first
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('email', email)

    if (!profileError && profiles && profiles.length > 0) {
      // Delete the user profile
      const { error: deleteProfileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('email', email)

      if (deleteProfileError) {
        console.error('Error deleting profile:', deleteProfileError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User profile deleted. You can now sign up again with the same email.',
      email: email
    })

  } catch (err) {
    console.error('Dev reset error:', err)
    return NextResponse.json({
      error: 'Failed to reset user',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
