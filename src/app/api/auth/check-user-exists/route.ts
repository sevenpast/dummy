import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Try to sign in with hublaizel@icloud.com to see if user exists
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (signInError) {
      // If sign in fails, try to create the user to see what happens
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:4000'}/auth/callback`
        }
      })

      if (signUpError) {
        return NextResponse.json({
          success: false,
          message: 'User does not exist and cannot be created',
          error: signUpError.message,
          code: signUpError.code,
          userExists: false
        })
      }

      return NextResponse.json({
        success: true,
        message: 'User did not exist, but was created successfully',
        user: {
          id: signUpData.user?.id,
          email: signUpData.user?.email,
          email_confirmed_at: signUpData.user?.email_confirmed_at
        },
        userExists: false,
        wasCreated: true
      })
    }

    // If we get here, the user exists and can sign in
    return NextResponse.json({
      success: true,
      message: 'User exists and can sign in',
      user: {
        id: signInData.user?.id,
        email: signInData.user?.email,
        email_confirmed_at: signInData.user?.email_confirmed_at,
        is_confirmed: !!signInData.user?.email_confirmed_at
      },
      userExists: true,
      canSignIn: true
    })

  } catch (err) {
    console.error('Check user existence error:', err)
    return NextResponse.json({
      error: 'Failed to check user existence',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
