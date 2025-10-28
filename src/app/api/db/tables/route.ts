import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get all tables in the public schema
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public')
      .order('table_name')

    if (error) {
      // If information_schema doesn't work, try a different approach
      const { data: tables, error: tablesError } = await supabase
        .rpc('get_table_names')
        .select()

      if (tablesError) {
        // Fallback: try to query some known tables
        const knownTables = [
          'user_profiles',
          'document_vault', 
          'document_categories',
          'family_members',
          'modules',
          'tasks',
          'user_task_progress',
          'municipalities',
          'email_logs'
        ]

        const tableInfo = []
        
        for (const tableName of knownTables) {
          try {
            const { data, error } = await supabase
              .from(tableName)
              .select('*')
              .limit(0)
            
            if (!error) {
              tableInfo.push({
                table_name: tableName,
                table_type: 'BASE TABLE',
                exists: true
              })
            }
          } catch (err) {
            // Table doesn't exist or can't be accessed
          }
        }

        return NextResponse.json({
          success: true,
          tables: tableInfo,
          message: 'Tables retrieved using fallback method'
        })
      }

      return NextResponse.json({
        success: true,
        tables: tables,
        message: 'Tables retrieved via RPC'
      })
    }

    return NextResponse.json({
      success: true,
      tables: data,
      message: 'Tables retrieved from information_schema'
    })

  } catch (err) {
    console.error('Database tables error:', err)
    return NextResponse.json({
      error: 'Failed to retrieve tables',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
