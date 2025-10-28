import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user to check auth status
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // Get auth settings (this might not be available via client, but we can try)
    const { data: settings, error: settingsError } = await supabase
      .from('auth.config')
      .select('*')
      .single()

    return NextResponse.json({
      success: true,
      user: user ? {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at
      } : null,
      userError: userError?.message,
      settings: settings || 'Settings not accessible via client',
      settingsError: settingsError?.message,
      environment: process.env.NODE_ENV,
      message: 'Auth settings retrieved'
    })
  } catch (err) {
    return NextResponse.json({
      error: 'Failed to retrieve auth settings',
      details: err instanceof Error ? err.message : 'Unknown error',
      environment: process.env.NODE_ENV
    }, { status: 500 })
  }
}
