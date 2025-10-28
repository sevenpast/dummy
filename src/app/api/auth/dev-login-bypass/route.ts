import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'This endpoint is only available in development' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Try to sign in with the existing user
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (signInError) {
      return NextResponse.json({ 
        error: 'Login failed',
        details: signInError.message,
        suggestion: 'User might not exist or password is wrong'
      }, { status: 400 })
    }

    // If we get here, the user exists and can sign in
    // This means the email confirmation issue is resolved!
    return NextResponse.json({
      success: true,
      message: 'Login successful! Email confirmation issue resolved.',
      user: {
        id: signInData.user?.id,
        email: signInData.user?.email,
        email_confirmed_at: signInData.user?.email_confirmed_at,
        is_confirmed: !!signInData.user?.email_confirmed_at
      },
      session: signInData.session
    })

  } catch (err) {
    console.error('Dev login bypass error:', err)
    return NextResponse.json({
      error: 'Failed to login',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
