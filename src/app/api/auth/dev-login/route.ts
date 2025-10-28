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

    // First, try normal login
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (!signInError && signInData.user) {
      return NextResponse.json({
        success: true,
        message: 'Login successful',
        user: {
          id: signInData.user.id,
          email: signInData.user.email,
          email_confirmed_at: signInData.user.email_confirmed_at
        },
        session: signInData.session
      })
    }

    // If login failed due to email not confirmed, provide helpful message
    if (signInError?.message?.includes('Email not confirmed')) {
      return NextResponse.json({ 
        error: 'Email not confirmed. In development, please sign up again with a different email or contact support to reset your account.',
        details: signInError.message,
        suggestion: 'Try signing up with a different email address or contact support.'
      }, { status: 400 })
    }

    // Return the original error
    return NextResponse.json({ 
      error: signInError?.message || 'Login failed' 
    }, { status: 400 })

  } catch (err) {
    console.error('Dev login error:', err)
    return NextResponse.json({
      error: 'Failed to login',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
