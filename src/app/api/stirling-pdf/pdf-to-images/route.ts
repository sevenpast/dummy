import { NextRequest, NextResponse } from 'next/server'
import { getStirlingPDFClient } from '@/lib/stirling-pdf'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileUrl = formData.get('fileUrl') as string
    const format = formData.get('format') as string || 'png'
    const quality = parseInt(formData.get('quality') as string) || 100
    const dpi = parseInt(formData.get('dpi') as string) || 150

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

    // Convert PDF to images
    const result = await stirlingPDF.pdfToImages(file || fileUrl, {
      format: format as 'png' | 'jpg' | 'jpeg',
      quality,
      dpi
    })

    if (!result.success) {
      return NextResponse.json({ 
        error: 'Failed to convert PDF to images',
        details: result.error 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'PDF converted to images successfully'
    })

  } catch (err) {
    console.error('Stirling PDF image conversion error:', err)
    return NextResponse.json({
      error: 'Failed to convert PDF to images',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
