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

    // Try to sign in first to see if user exists
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (signInError) {
      // If sign in fails, try to create the user
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
          details: signUpError.message 
        }, { status: 400 })
      }

      if (!signUpData.user) {
        return NextResponse.json({ 
          error: 'User creation failed' 
        }, { status: 400 })
      }

      // Create profile for new user
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: signUpData.user.id,
          email,
          first_name: firstName || 'Test',
          last_name: lastName || 'User',
          phone: phone || null
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
      }

      // Try to sign in the new user
      const { data: newSignInData, error: newSignInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (newSignInError) {
        return NextResponse.json({
          success: true,
          message: 'User created but could not sign in automatically. Please try logging in manually.',
          user: {
            id: signUpData.user.id,
            email: signUpData.user.email,
            email_confirmed_at: signUpData.user.email_confirmed_at
          }
        })
      }

      return NextResponse.json({
        success: true,
        message: 'User created and signed in successfully',
        user: {
          id: newSignInData.user?.id,
          email: newSignInData.user?.email,
          email_confirmed_at: newSignInData.user?.email_confirmed_at
        },
        session: newSignInData.session
      })
    }

    // User exists and can sign in
    // Check if profile exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', signInData.user.id)
      .single()

    if (profileCheckError && profileCheckError.code === 'PGRST116') {
      // Profile doesn't exist, create it
      const { error: createProfileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: signInData.user.id,
          email,
          first_name: firstName || 'Test',
          last_name: lastName || 'User',
          phone: phone || null
        })

      if (createProfileError) {
        console.error('Profile creation error:', createProfileError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User signed in successfully',
      user: {
        id: signInData.user.id,
        email: signInData.user.email,
        email_confirmed_at: signInData.user.email_confirmed_at
      },
      session: signInData.session,
      profileExists: !profileCheckError
    })

  } catch (err) {
    console.error('Dev fix users error:', err)
    return NextResponse.json({
      error: 'Failed to fix user',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
