import { NextRequest, NextResponse } from 'next/server'
import { getPDFFormBuilder } from '@/lib/pdf-form-builder'

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage = 'de' } = await request.json()

    if (!text) {
      return NextResponse.json({ 
        error: 'Text is required' 
      }, { status: 400 })
    }

    const pdfFormBuilder = getPDFFormBuilder()

    // Text übersetzen
    const translation = await pdfFormBuilder.translateText(text, targetLanguage)

    return NextResponse.json({
      success: true,
      data: translation,
      message: 'Text successfully translated'
    })

  } catch (err) {
    console.error('Text translation error:', err)
    return NextResponse.json({
      error: 'Failed to translate text',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
