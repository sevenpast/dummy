import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'This endpoint is only available in development' }, { status: 403 })
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      'https://ajffjhkwtbyzlggskiuo.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqZmZqaGt3dGJ5emxnZ3NraXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTkwOTM5NiwiZXhwIjoyMDc1NDg1Mzk2fQ.woctSgtwxDZLA4nZczDcMWwRCk7HGpz4u4YDJe4bmUQ'
    )

    const newPassword = 'neuespasswort123'
    const email = 'hublaizel@icloud.com'

    // Get the user first
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (usersError) {
      return NextResponse.json({
        error: 'Failed to get users',
        details: usersError.message
      }, { status: 500 })
    }

    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      return NextResponse.json({
        error: 'User not found',
        email: email
      }, { status: 404 })
    }

    // Update the user's password
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        password: newPassword
      }
    )

    if (updateError) {
      return NextResponse.json({
        error: 'Failed to reset password',
        details: updateError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully!',
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at
      },
      newPassword: newPassword,
      instructions: {
        step1: 'Go to http://localhost:4000/auth/login',
        step2: `Email: ${email}`,
        step3: `Password: ${newPassword}`,
        step4: 'You should now be able to login successfully!'
      }
    })

  } catch (err) {
    console.error('Reset password error:', err)
    return NextResponse.json({
      error: 'Failed to reset password',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
