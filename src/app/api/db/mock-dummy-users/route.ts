import { NextResponse } from 'next/server'

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'This endpoint is only available in development' }, { status: 403 })
  }

  try {
    // Create mock dummy users without database interaction
    const dummyUsers = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        user_id: '00000000-0000-0000-0000-000000000001',
        email: 'dummy@example.com',
        first_name: 'Dummy',
        last_name: 'User',
        phone: '+41 44 123 45 67',
        postal_code: '8001',
        municipality: 'Zürich',
        canton: 'Zürich',
        country_of_origin: 'Deutschland',
        has_children: false,
        family_status: 'single',
        arrival_date: '2024-01-15',
        work_permit_type: 'EU/EFTA',
        language_preference: 'de',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        user_id: '00000000-0000-0000-0000-000000000002',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        phone: '+41 44 987 65 43',
        postal_code: '3000',
        municipality: 'Bern',
        canton: 'Bern',
        country_of_origin: 'Österreich',
        has_children: true,
        family_status: 'married',
        arrival_date: '2023-06-01',
        work_permit_type: 'EU/EFTA',
        language_preference: 'de',
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updated_at: new Date().toISOString()
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        user_id: '00000000-0000-0000-0000-000000000003',
        email: 'demo@example.com',
        first_name: 'Demo',
        last_name: 'Person',
        phone: '+41 44 555 12 34',
        postal_code: '1200',
        municipality: 'Genf',
        canton: 'Genf',
        country_of_origin: 'Frankreich',
        has_children: false,
        family_status: 'single',
        arrival_date: '2024-03-10',
        work_permit_type: 'Visum erforderlich',
        language_preference: 'fr',
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updated_at: new Date().toISOString()
      }
    ]

    return NextResponse.json({
      success: true,
      message: 'Mock dummy users created successfully!',
      userCount: dummyUsers.length,
      users: dummyUsers,
      note: 'These are mock users for testing - no database interaction required!',
      usage: {
        description: 'Use these dummy users for testing your application',
        example: 'You can use dummy@example.com, test@example.com, or demo@example.com',
        noAuth: 'No authentication required - these are just mock data'
      }
    })

  } catch (err) {
    console.error('Create mock dummy users error:', err)
    return NextResponse.json({
      error: 'Failed to create mock dummy users',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
