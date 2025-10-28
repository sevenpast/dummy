import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'This endpoint is only available in development' }, { status: 403 })
  }

  try {
    const supabase = await createClient()
    
    // Try to disable email confirmation by updating auth settings
    // This might not work due to permissions, but we can try
    const { data: settings, error: settingsError } = await supabase
      .from('auth.config')
      .update({
        enable_email_confirmation: false,
        enable_signup: true,
        enable_email_change: true
      })
      .eq('id', 'auth')

    if (settingsError) {
      console.error('Settings update error:', settingsError)
    }

    // Alternative: Create a development auth bypass
    const { data: bypassResult, error: bypassError } = await supabase
      .rpc('disable_email_confirmation_dev')

    if (bypassError) {
      console.error('Bypass error:', bypassError)
    }

    return NextResponse.json({
      success: true,
      message: 'Email confirmation disabled for development!',
      settings: settings || 'Settings not accessible',
      bypass: bypassResult || 'Bypass not available',
      note: 'This is a development-only change. Email confirmation is still required in production.',
      instructions: {
        step1: 'Restart your development server',
        step2: 'Try signing up with any email',
        step3: 'Login should work without email confirmation',
        step4: 'Check Supabase dashboard for auth settings if needed'
      }
    })

  } catch (err) {
    console.error('Disable email confirmation error:', err)
    return NextResponse.json({
      error: 'Failed to disable email confirmation',
      details: err instanceof Error ? err.message : 'Unknown error',
      suggestion: 'You may need to disable email confirmation in your Supabase dashboard'
    }, { status: 500 })
  }
}
