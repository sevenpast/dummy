import { NextRequest, NextResponse } from 'next/server'
import { getStirlingPDFClient } from '@/lib/stirling-pdf'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileUrl = formData.get('fileUrl') as string

    if (!file && !fileUrl) {
      return NextResponse.json({ 
        error: 'File or fileUrl is required' 
      }, { status: 400 })
    }

    const baseUrl = process.env.STIRLING_PDF_URL
    const apiKey = process.env.STIRLING_PDF_API_KEY
    
    if (!baseUrl) {
      return NextResponse.json({ 
        error: 'Stirling PDF URL not configured' 
      }, { status: 500 })
    }

    const stirlingPDF = getStirlingPDFClient(baseUrl, apiKey)

    // Get PDF information
    const result = await stirlingPDF.getPDFInfo(file || fileUrl)

    if (!result.success) {
      return NextResponse.json({ 
        error: 'Failed to get PDF information',
        details: result.error 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'PDF information retrieved successfully'
    })

  } catch (err) {
    console.error('Stirling PDF info error:', err)
    return NextResponse.json({
      error: 'Failed to get PDF information',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
