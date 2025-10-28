import { NextRequest, NextResponse } from 'next/server'
import { getPDFCoClient } from '@/lib/pdfco'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileUrl, options } = body

    if (!fileUrl) {
      return NextResponse.json({ 
        error: 'File URL is required' 
      }, { status: 400 })
    }

    // Get PDF.co API key from environment
    const apiKey = process.env.PDFCO_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'PDF.co API key not configured. Please set PDFCO_API_KEY environment variable.' 
      }, { status: 500 })
    }

    // Initialize PDF.co client
    const pdfCo = getPDFCoClient(apiKey)

    // Extract text from PDF
    const result = await pdfCo.extractTextFromPDF(fileUrl, {
      language: options?.language || 'eng',
      ocrMode: options?.ocrMode || 'auto',
      password: options?.password
    })

    if (!result.success) {
      return NextResponse.json({ 
        error: 'Failed to extract text from PDF',
        details: result.error 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Text extracted successfully'
    })

  } catch (err) {
    console.error('PDF text extraction error:', err)
    return NextResponse.json({
      error: 'Failed to extract text from PDF',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
