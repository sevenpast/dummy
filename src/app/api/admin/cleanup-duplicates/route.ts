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

    // Step 1: Get all users to identify duplicates
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (usersError) {
      return NextResponse.json({
        error: 'Failed to get users',
        details: usersError.message
      }, { status: 500 })
    }

    // Step 2: Find hublaizel@icloud.com duplicates
    const hublaizelUsers = users.users.filter(user => 
      user.email?.toLowerCase().includes('hublaizel@icloud.com') || 
      user.email?.toLowerCase().includes('hablaizel@icloud.com')
    )

    console.log('Found hublaizel users:', hublaizelUsers.map(u => ({ id: u.id, email: u.email, created: u.created_at })))

    // Step 3: Keep the oldest one (first created), delete the newer ones
    const sortedUsers = hublaizelUsers.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    const keepUser = sortedUsers[0] // Oldest
    const deleteUsers = sortedUsers.slice(1) // Newer ones

    const deletionResults = []

    // Step 4: Delete the newer duplicate users
    for (const user of deleteUsers) {
      try {
        // First delete the profile
        const { error: profileDeleteError } = await supabaseAdmin
          .from('user_profiles')
          .delete()
          .eq('user_id', user.id)

        if (profileDeleteError) {
          console.error('Profile delete error:', profileDeleteError)
        }

        // Then delete the auth user
        const { error: userDeleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
        
        if (userDeleteError) {
          deletionResults.push({ 
            userId: user.id, 
            email: user.email, 
            error: userDeleteError.message 
          })
        } else {
          deletionResults.push({ 
            userId: user.id, 
            email: user.email, 
            success: true 
          })
        }
      } catch (err) {
        deletionResults.push({ 
          userId: user.id, 
          email: user.email, 
          error: err instanceof Error ? err.message : 'Unknown error' 
        })
      }
    }

    // Step 5: Get final user list
    const { data: finalUsers, error: finalUsersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (finalUsersError) {
      console.error('Final users error:', finalUsersError)
    }

    // Step 6: Get final profile count
    const { count: finalProfileCount, error: countError } = await supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      success: true,
      message: 'Duplicate users cleaned up!',
      results: {
        foundDuplicates: hublaizelUsers.length,
        keptUser: keepUser ? {
          id: keepUser.id,
          email: keepUser.email,
          created_at: keepUser.created_at
        } : null,
        deletedUsers: deletionResults,
        finalUserCount: finalUsers?.users.length || 0,
        finalProfileCount: finalProfileCount || 0
      },
      allUsers: finalUsers?.users.map(user => ({
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at
      })) || []
    })

  } catch (err) {
    console.error('Cleanup duplicates error:', err)
    return NextResponse.json({
      error: 'Failed to cleanup duplicates',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
