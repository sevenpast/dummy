import { NextRequest, NextResponse } from 'next/server'
import { getPDFCoClient } from '@/lib/pdfco'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileUrl, password } = body

    if (!fileUrl) {
      return NextResponse.json({ 
        error: 'File URL is required' 
      }, { status: 400 })
    }

    const apiKey = process.env.PDFCO_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'PDF.co API key not configured' 
      }, { status: 500 })
    }

    const pdfCo = getPDFCoClient(apiKey)

    const result = await pdfCo.getPDFInfo(fileUrl, { password })

    if (!result.success) {
      return NextResponse.json({ 
        error: 'Failed to get PDF info',
        details: result.error 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'PDF info retrieved successfully'
    })

  } catch (err) {
    console.error('PDF info error:', err)
    return NextResponse.json({
      error: 'Failed to get PDF info',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
