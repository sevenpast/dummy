// ============================================================================
// PDF.CO API INTEGRATION
// ============================================================================

import axios from 'axios'

interface PDFCoConfig {
  apiKey: string
  baseUrl?: string
}

interface PDFCoResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface OCRResult {
  text: string
  confidence: number
  pages: Array<{
    pageNumber: number
    text: string
    confidence: number
  }>
}

interface PDFToTextResult {
  text: string
  pageCount: number
  pages: Array<{
    pageNumber: number
    text: string
  }>
}

interface PDFToImageResult {
  images: Array<{
    pageNumber: number
    imageUrl: string
    imageData?: string
  }>
}

class PDFCoClient {
  private apiKey: string
  private baseUrl: string

  constructor(config: PDFCoConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl || 'https://api.pdf.co/v1'
  }

  private async makeRequest<T>(
    endpoint: string, 
    data: any, 
    method: 'GET' | 'POST' = 'POST'
  ): Promise<PDFCoResponse<T>> {
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        data: method === 'POST' ? data : undefined,
        params: method === 'GET' ? data : undefined
      })

      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Unknown error'
      }
    }
  }

  /**
   * Extract text from PDF using OCR
   */
  async extractTextFromPDF(fileUrl: string, options?: {
    language?: string
    ocrMode?: 'auto' | 'fast' | 'best'
    password?: string
  }): Promise<PDFCoResponse<OCRResult>> {
    return this.makeRequest<OCRResult>('/pdf/convert/to/text', {
      url: fileUrl,
      language: options?.language || 'eng',
      ocrMode: options?.ocrMode || 'auto',
      password: options?.password
    })
  }

  /**
   * Convert PDF to text (without OCR)
   */
  async pdfToText(fileUrl: string, options?: {
    password?: string
  }): Promise<PDFCoResponse<PDFToTextResult>> {
    return this.makeRequest<PDFToTextResult>('/pdf/convert/to/text', {
      url: fileUrl,
      password: options?.password
    })
  }

  /**
   * Convert PDF to images
   */
  async pdfToImages(fileUrl: string, options?: {
    password?: string
    format?: 'png' | 'jpg' | 'jpeg'
    quality?: number
  }): Promise<PDFCoResponse<PDFToImageResult>> {
    return this.makeRequest<PDFToImageResult>('/pdf/convert/to/png', {
      url: fileUrl,
      password: options?.password,
      format: options?.format || 'png',
      quality: options?.quality || 100
    })
  }

  /**
   * Extract text from image using OCR
   */
  async extractTextFromImage(imageUrl: string, options?: {
    language?: string
    ocrMode?: 'auto' | 'fast' | 'best'
  }): Promise<PDFCoResponse<OCRResult>> {
    return this.makeRequest<OCRResult>('/image/ocr', {
      url: imageUrl,
      language: options?.language || 'eng',
      ocrMode: options?.ocrMode || 'auto'
    })
  }

  /**
   * Get PDF information
   */
  async getPDFInfo(fileUrl: string, options?: {
    password?: string
  }): Promise<PDFCoResponse<{
    pageCount: number
    title?: string
    author?: string
    subject?: string
    creator?: string
    producer?: string
    creationDate?: string
    modificationDate?: string
  }>> {
    return this.makeRequest('/pdf/info', {
      url: fileUrl,
      password: options?.password
    })
  }

  /**
   * Split PDF into pages
   */
  async splitPDF(fileUrl: string, options?: {
    password?: string
    pages?: string // e.g., "1-3,5,7-9"
  }): Promise<PDFCoResponse<{
    urls: string[]
  }>> {
    return this.makeRequest('/pdf/split', {
      url: fileUrl,
      password: options?.password,
      pages: options?.pages
    })
  }

  /**
   * Merge PDFs
   */
  async mergePDFs(fileUrls: string[], options?: {
    password?: string
  }): Promise<PDFCoResponse<{
    url: string
  }>> {
    return this.makeRequest('/pdf/merge', {
      urls: fileUrls,
      password: options?.password
    })
  }

  /**
   * Compress PDF
   */
  async compressPDF(fileUrl: string, options?: {
    password?: string
    compressionLevel?: 'low' | 'medium' | 'high'
  }): Promise<PDFCoResponse<{
    url: string
  }>> {
    return this.makeRequest('/pdf/compress', {
      url: fileUrl,
      password: options?.password,
      compressionLevel: options?.compressionLevel || 'medium'
    })
  }
}

// Create singleton instance
let pdfCoClient: PDFCoClient | null = null

export function getPDFCoClient(apiKey?: string): PDFCoClient {
  if (!pdfCoClient) {
    if (!apiKey) {
      throw new Error('PDF.co API key is required. Set PDFCO_API_KEY environment variable or pass it as parameter.')
    }
    pdfCoClient = new PDFCoClient({ apiKey })
  }
  return pdfCoClient
}

export { PDFCoClient, type PDFCoConfig, type PDFCoResponse, type OCRResult, type PDFToTextResult, type PDFToImageResult }
