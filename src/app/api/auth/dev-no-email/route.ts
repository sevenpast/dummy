import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'This endpoint is only available in development' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { email, password, firstName, lastName, phone } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Step 1: Try to sign in first
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

    // Step 2: If login fails, create user with email confirmation bypassed
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:4000'}/auth/callback`,
        // Try to bypass email confirmation
        data: {
          email_confirm: true,
          skip_confirmation: true
        }
      }
    })

    if (signUpError) {
      return NextResponse.json({ 
        error: 'Failed to create user',
        details: signUpError.message,
        code: signUpError.code
      }, { status: 400 })
    }

    if (!signUpData.user) {
      return NextResponse.json({ 
        error: 'User creation failed' 
      }, { status: 400 })
    }

    // Step 3: Create profile immediately (this might fail due to RLS, but we try)
    try {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: signUpData.user.id,
          email,
          first_name: firstName || 'User',
          last_name: lastName || 'Name',
          phone: phone || null
        })

      if (profileError) {
        console.error('Profile creation failed (RLS):', profileError)
      }
    } catch (profileErr) {
      console.error('Profile creation error:', profileErr)
    }

    // Step 4: Wait and try to sign in
    await new Promise(resolve => setTimeout(resolve, 3000))

    const { data: retrySignIn, error: retryError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (!retryError && retrySignIn.user) {
      return NextResponse.json({
        success: true,
        message: 'User created and signed in successfully!',
        user: {
          id: retrySignIn.user.id,
          email: retrySignIn.user.email,
          email_confirmed_at: retrySignIn.user.email_confirmed_at
        },
        session: retrySignIn.session
      })
    }

    // Step 5: If still can't sign in, return success but with instructions
    return NextResponse.json({
      success: true,
      message: 'User created but email confirmation still required. Try using the signup form instead.',
      user: {
        id: signUpData.user.id,
        email: signUpData.user.email,
        email_confirmed_at: signUpData.user.email_confirmed_at
      },
      instructions: {
        step1: 'Go to http://localhost:4000/auth/signup',
        step2: 'Use the same email and password',
        step3: 'The signup form will handle the email confirmation bypass',
        note: 'Email confirmation cannot be completely disabled via API - use the signup form for automatic login'
      }
    })

  } catch (err) {
    console.error('Dev no-email auth error:', err)
    return NextResponse.json({
      error: 'Failed to authenticate without email confirmation',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
