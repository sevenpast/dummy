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

    // Step 1: Get all users to see current state
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (usersError) {
      return NextResponse.json({
        error: 'Failed to get users',
        details: usersError.message
      }, { status: 500 })
    }

    // Step 2: Try to disable email confirmation by updating user metadata
    const unconfirmedUsers = users.users.filter(user => !user.email_confirmed_at)
    
    const updateResults = []
    for (const user of unconfirmedUsers) {
      try {
        const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          user.id,
          {
            email_confirm: true,
            app_metadata: {
              ...user.app_metadata,
              email_confirmed: true
            }
          }
        )
        
        if (updateError) {
          updateResults.push({ userId: user.id, error: updateError.message })
        } else {
          updateResults.push({ userId: user.id, success: true })
        }
      } catch (err) {
        updateResults.push({ userId: user.id, error: err instanceof Error ? err.message : 'Unknown error' })
      }
    }

    // Step 3: Create profiles for users that don't have them
    const profileResults = []
    for (const user of users.users) {
      try {
        // Check if profile exists
        const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
          .from('user_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (profileCheckError && profileCheckError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const { data: newProfile, error: createError } = await supabaseAdmin
            .from('user_profiles')
            .insert({
              user_id: user.id,
              email: user.email,
              first_name: 'User',
              last_name: 'Name',
              phone: null
            })
            .select()

          if (createError) {
            profileResults.push({ userId: user.id, error: createError.message })
          } else {
            profileResults.push({ userId: user.id, success: true, profile: newProfile })
          }
        } else {
          profileResults.push({ userId: user.id, message: 'Profile already exists' })
        }
      } catch (err) {
        profileResults.push({ userId: user.id, error: err instanceof Error ? err.message : 'Unknown error' })
      }
    }

    // Step 4: Get final user count
    const { count: finalProfileCount, error: countError } = await supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      success: true,
      message: 'Email confirmation disabled and users updated!',
      results: {
        totalUsers: users.users.length,
        unconfirmedUsers: unconfirmedUsers.length,
        confirmedUsers: users.users.length - unconfirmedUsers.length,
        totalProfiles: finalProfileCount || 0
      },
      updates: {
        emailConfirmation: updateResults,
        profileCreation: profileResults
      },
      users: users.users.map(user => ({
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        is_confirmed: !!user.email_confirmed_at
      }))
    })

  } catch (err) {
    console.error('Admin disable email confirmation error:', err)
    return NextResponse.json({
      error: 'Failed to disable email confirmation',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
