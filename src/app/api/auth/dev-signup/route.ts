import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'This endpoint is only available in development' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { email, password, firstName, lastName, phone, gender } = body

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:4000'}/auth/callback`
      }
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'User creation failed' }, { status: 400 })
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        gender: gender || null
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Don't fail the request if profile creation fails
    }

    // In development, try to sign in the user immediately
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (signInError) {
      return NextResponse.json({
        success: true,
        message: 'User created but could not sign in automatically. Please try logging in manually.',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          email_confirmed_at: authData.user.email_confirmed_at
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'User created and signed in successfully',
      user: {
        id: signInData.user?.id,
        email: signInData.user?.email,
        email_confirmed_at: signInData.user?.email_confirmed_at
      },
      session: signInData.session
    })

  } catch (err) {
    console.error('Dev signup error:', err)
    return NextResponse.json({
      error: 'Failed to create user',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
