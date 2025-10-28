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

    // Try to sign in first
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (!signInError && signInData.user) {
      return NextResponse.json({
        success: true,
        message: 'Login successful!',
        user: {
          id: signInData.user.id,
          email: signInData.user.email,
          email_confirmed_at: signInData.user.email_confirmed_at
        },
        session: signInData.session
      })
    }

    // If login fails, try to create user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:4000'}/auth/callback`
      }
    })

    if (signUpError) {
      return NextResponse.json({ 
        error: 'Failed to create user',
        details: signUpError.message,
        suggestion: 'Try using a different email address or check if the email is already registered'
      }, { status: 400 })
    }

    if (!signUpData.user) {
      return NextResponse.json({ 
        error: 'User creation failed' 
      }, { status: 400 })
    }

    // Return success with instructions
    return NextResponse.json({
      success: true,
      message: 'User created successfully! In development, you can now use the signup form to automatically sign in.',
      user: {
        id: signUpData.user.id,
        email: signUpData.user.email,
        email_confirmed_at: signUpData.user.email_confirmed_at
      },
      instructions: {
        step1: 'Go to http://localhost:4000/auth/signup',
        step2: 'Use the same email and password',
        step3: 'You will be automatically signed in (development mode)',
        alternative: 'Or wait for email confirmation and try login again'
      }
    })

  } catch (err) {
    console.error('Dev auth error:', err)
    return NextResponse.json({
      error: 'Failed to authenticate',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
