import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Try to get auth users using a different approach
    // We'll use the admin client if available
    const { data: { users }, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Cannot access auth users',
        details: error.message,
        suggestion: 'This might be due to insufficient permissions or RLS policies'
      })
    }

    // Process user data
    const userData = users.map(user => ({
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      is_confirmed: !!user.email_confirmed_at
    }))

    return NextResponse.json({
      success: true,
      userCount: users.length,
      users: userData,
      confirmedUsers: userData.filter(u => u.is_confirmed).length,
      unconfirmedUsers: userData.filter(u => !u.is_confirmed).length,
      message: 'Auth users retrieved successfully'
    })

  } catch (err) {
    console.error('Auth users error:', err)
    return NextResponse.json({
      error: 'Failed to retrieve auth users',
      details: err instanceof Error ? err.message : 'Unknown error',
      suggestion: 'Try using the service role key for admin access'
    }, { status: 500 })
  }
}
