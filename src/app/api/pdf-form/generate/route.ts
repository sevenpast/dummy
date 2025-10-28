import { NextRequest, NextResponse } from 'next/server'
import { getPDFFormBuilder } from '@/lib/pdf-form-builder'

export async function POST(request: NextRequest) {
  try {
    const { formData, userInputs } = await request.json()

    if (!formData || !userInputs) {
      return NextResponse.json({ 
        error: 'FormData and userInputs are required' 
      }, { status: 400 })
    }

    const pdfFormBuilder = getPDFFormBuilder()

    // PDF aus Formulardaten generieren
    const result = await pdfFormBuilder.generatePDFFromForm(formData, userInputs)

    return NextResponse.json({
      success: true,
      data: result,
      message: 'PDF successfully generated from form data'
    })

  } catch (err) {
    console.error('PDF generation error:', err)
    return NextResponse.json({
      error: 'Failed to generate PDF from form data',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
