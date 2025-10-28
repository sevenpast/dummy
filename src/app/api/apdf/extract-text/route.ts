import { NextRequest, NextResponse } from 'next/server'
import { getAPDFClient } from '@/lib/apdf'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileUrl = formData.get('fileUrl') as string
    const useOCR = formData.get('useOCR') === 'true'
    const language = formData.get('language') as string || 'eng'
    const includePageNumbers = formData.get('includePageNumbers') === 'true'

    if (!file && !fileUrl) {
      return NextResponse.json({ 
        error: 'File or fileUrl is required' 
      }, { status: 400 })
    }

    const apiKey = process.env.APDF_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'APDF API Key not configured' 
      }, { status: 500 })
    }

    const apdf = getAPDFClient(apiKey)

    // Extract text from PDF
    const result = await apdf.extractTextFromPDF(
      file || fileUrl, 
      { useOCR, language, includePageNumbers }
    )

    if (!result.success) {
      return NextResponse.json({ 
        error: 'Failed to extract text from PDF',
        details: result.error,
        status: result.status
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Text extracted successfully'
    })

  } catch (err) {
    console.error('APDF text extraction error:', err)
    return NextResponse.json({
      error: 'Failed to extract text from PDF',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
