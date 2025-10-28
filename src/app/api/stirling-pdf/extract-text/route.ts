import { NextRequest, NextResponse } from 'next/server'
import { getStirlingPDFClient } from '@/lib/stirling-pdf'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileUrl = formData.get('fileUrl') as string
    const language = formData.get('language') as string || 'eng'
    const ocrEngine = (formData.get('ocrEngine') as 'tesseract' | 'easyocr') || 'tesseract'

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

    // Extract text from PDF
    const result = await stirlingPDF.extractTextFromPDF(
      file || fileUrl, 
      { language, ocrEngine }
    )

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
    console.error('Stirling PDF text extraction error:', err)
    return NextResponse.json({
      error: 'Failed to extract text from PDF',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
