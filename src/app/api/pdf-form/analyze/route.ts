import { NextRequest, NextResponse } from 'next/server'
import { getPDFFormBuilder } from '@/lib/pdf-form-builder'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileUrl = formData.get('fileUrl') as string
    const translate = formData.get('translate') === 'true'
    const targetLanguage = formData.get('targetLanguage') as string || 'de'

    if (!file && !fileUrl) {
      return NextResponse.json({ 
        error: 'File or fileUrl is required' 
      }, { status: 400 })
    }

    const pdfFormBuilder = getPDFFormBuilder()

    // PDF analysieren
    const analysis = await pdfFormBuilder.analyzePDF(file || fileUrl)

    // Optional: Text übersetzen
    if (translate) {
      for (const field of analysis.fields) {
        if (field.originalText) {
          const translation = await pdfFormBuilder.translateText(field.originalText, targetLanguage)
          field.translatedText = translation.translatedText
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        text: analysis.text,
        fields: analysis.fields,
        pageCount: analysis.pageCount,
        translated: translate
      },
      message: 'PDF successfully analyzed and form fields generated'
    })

  } catch (err) {
    console.error('PDF form analysis error:', err)
    return NextResponse.json({
      error: 'Failed to analyze PDF and generate form fields',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
