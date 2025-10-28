import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'This endpoint is only available in development' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { email, password, firstName, lastName } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const supabase = await createClient()

    // First, try to delete any existing user with this email
    // (This is a workaround for development)
    try {
      await supabase.auth.admin.deleteUser(email)
    } catch (err) {
      // User might not exist, that's okay
      console.log('No existing user to delete')
    }

    // Wait a moment for deletion to process
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Create a new user with the exact credentials
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

    // Wait a moment for user creation to process
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Try to sign in immediately
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (signInError) {
      return NextResponse.json({
        success: true,
        message: 'User created but cannot sign in yet. Try again in a few seconds.',
        user: {
          id: signUpData.user.id,
          email: signUpData.user.email,
          email_confirmed_at: signUpData.user.email_confirmed_at
        },
        signInError: signInError.message,
        suggestion: 'Wait a few seconds and try logging in again'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'User created and signed in successfully!',
      user: {
        id: signInData.user?.id,
        email: signInData.user?.email,
        email_confirmed_at: signInData.user?.email_confirmed_at
      },
      session: signInData.session
    })

  } catch (err) {
    console.error('Create and login user error:', err)
    return NextResponse.json({
      error: 'Failed to create and login user',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
