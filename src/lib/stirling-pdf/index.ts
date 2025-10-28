// ============================================================================
// STIRLING PDF API INTEGRATION
// ============================================================================

import axios from 'axios'

interface StirlingPDFConfig {
  baseUrl: string
  apiKey?: string
}

interface StirlingPDFResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface PDFInfo {
  pageCount: number
  title?: string
  author?: string
  subject?: string
  creator?: string
  producer?: string
  creationDate?: string
  modificationDate?: string
  fileSize: number
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

interface PDFToImageResult {
  images: Array<{
    pageNumber: number
    imageUrl: string
    imageData?: string
  }>
}

class StirlingPDFClient {
  private baseUrl: string
  private apiKey?: string

  constructor(config: StirlingPDFConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '') // Remove trailing slash
    this.apiKey = config.apiKey
  }

  private async makeRequest<T>(
    endpoint: string, 
    data: any, 
    method: 'GET' | 'POST' = 'POST',
    isFileUpload: boolean = false
  ): Promise<StirlingPDFResponse<T>> {
    try {
      const headers: any = {
        'Content-Type': isFileUpload ? 'multipart/form-data' : 'application/json'
      }

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`
      }

      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers,
        data: method === 'POST' ? data : undefined,
        params: method === 'GET' ? data : undefined,
        timeout: 300000 // 5 minutes timeout for large operations
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
   * Get PDF information
   */
  async getPDFInfo(file: File | string): Promise<StirlingPDFResponse<PDFInfo>> {
    const formData = new FormData()
    
    if (typeof file === 'string') {
      // If it's a URL, we need to download it first
      const response = await fetch(file)
      const blob = await response.blob()
      formData.append('fileInput', blob, 'document.pdf')
    } else {
      formData.append('fileInput', file)
    }

    return this.makeRequest<PDFInfo>('/api/v1/info', formData, 'POST', true)
  }

  /**
   * Extract text from PDF using OCR
   */
  async extractTextFromPDF(file: File | string, options?: {
    language?: string
    ocrEngine?: 'tesseract' | 'easyocr'
  }): Promise<StirlingPDFResponse<OCRResult>> {
    const formData = new FormData()
    
    if (typeof file === 'string') {
      const response = await fetch(file)
      const blob = await response.blob()
      formData.append('fileInput', blob, 'document.pdf')
    } else {
      formData.append('fileInput', file)
    }

    formData.append('language', options?.language || 'eng')
    formData.append('ocrEngine', options?.ocrEngine || 'tesseract')

    return this.makeRequest<OCRResult>('/api/v1/ocr', formData, 'POST', true)
  }

  /**
   * Convert PDF to text (without OCR)
   */
  async pdfToText(file: File | string): Promise<StirlingPDFResponse<{ text: string }>> {
    const formData = new FormData()
    
    if (typeof file === 'string') {
      const response = await fetch(file)
      const blob = await response.blob()
      formData.append('fileInput', blob, 'document.pdf')
    } else {
      formData.append('fileInput', file)
    }

    return this.makeRequest<{ text: string }>('/api/v1/pdf-to-text', formData, 'POST', true)
  }

  /**
   * Convert PDF to images
   */
  async pdfToImages(file: File | string, options?: {
    format?: 'png' | 'jpg' | 'jpeg'
    quality?: number
    dpi?: number
  }): Promise<StirlingPDFResponse<PDFToImageResult>> {
    const formData = new FormData()
    
    if (typeof file === 'string') {
      const response = await fetch(file)
      const blob = await response.blob()
      formData.append('fileInput', blob, 'document.pdf')
    } else {
      formData.append('fileInput', file)
    }

    formData.append('format', options?.format || 'png')
    formData.append('quality', (options?.quality || 100).toString())
    formData.append('dpi', (options?.dpi || 150).toString())

    return this.makeRequest<PDFToImageResult>('/api/v1/pdf-to-images', formData, 'POST', true)
  }

  /**
   * Split PDF into pages
   */
  async splitPDF(file: File | string, options?: {
    pages?: string // e.g., "1-3,5,7-9"
    password?: string
  }): Promise<StirlingPDFResponse<{ urls: string[] }>> {
    const formData = new FormData()
    
    if (typeof file === 'string') {
      const response = await fetch(file)
      const blob = await response.blob()
      formData.append('fileInput', blob, 'document.pdf')
    } else {
      formData.append('fileInput', file)
    }

    if (options?.pages) {
      formData.append('pages', options.pages)
    }
    if (options?.password) {
      formData.append('password', options.password)
    }

    return this.makeRequest<{ urls: string[] }>('/api/v1/split-pdf', formData, 'POST', true)
  }

  /**
   * Merge PDFs
   */
  async mergePDFs(files: (File | string)[], options?: {
    password?: string
  }): Promise<StirlingPDFResponse<{ url: string }>> {
    const formData = new FormData()
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (typeof file === 'string') {
        const response = await fetch(file)
        const blob = await response.blob()
        formData.append(`fileInput${i}`, blob, `document${i}.pdf`)
      } else {
        formData.append(`fileInput${i}`, file)
      }
    }

    if (options?.password) {
      formData.append('password', options.password)
    }

    return this.makeRequest<{ url: string }>('/api/v1/merge-pdf', formData, 'POST', true)
  }

  /**
   * Compress PDF
   */
  async compressPDF(file: File | string, options?: {
    compressionLevel?: 'low' | 'medium' | 'high'
    password?: string
  }): Promise<StirlingPDFResponse<{ url: string }>> {
    const formData = new FormData()
    
    if (typeof file === 'string') {
      const response = await fetch(file)
      const blob = await response.blob()
      formData.append('fileInput', blob, 'document.pdf')
    } else {
      formData.append('fileInput', file)
    }

    formData.append('compressionLevel', options?.compressionLevel || 'medium')
    if (options?.password) {
      formData.append('password', options.password)
    }

    return this.makeRequest<{ url: string }>('/api/v1/compress-pdf', formData, 'POST', true)
  }

  /**
   * Convert PDF to different formats
   */
  async convertPDF(file: File | string, options?: {
    format: 'docx' | 'xlsx' | 'pptx' | 'html' | 'txt'
    password?: string
  }): Promise<StirlingPDFResponse<{ url: string }>> {
    const formData = new FormData()
    
    if (typeof file === 'string') {
      const response = await fetch(file)
      const blob = await response.blob()
      formData.append('fileInput', blob, 'document.pdf')
    } else {
      formData.append('fileInput', file)
    }

    formData.append('format', options?.format)
    if (options?.password) {
      formData.append('password', options.password)
    }

    return this.makeRequest<{ url: string }>(`/api/v1/pdf-to-${options?.format}`, formData, 'POST', true)
  }

  /**
   * Add watermark to PDF
   */
  async addWatermark(file: File | string, options?: {
    text: string
    position?: 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right'
    opacity?: number
    fontSize?: number
    color?: string
  }): Promise<StirlingPDFResponse<{ url: string }>> {
    const formData = new FormData()
    
    if (typeof file === 'string') {
      const response = await fetch(file)
      const blob = await response.blob()
      formData.append('fileInput', blob, 'document.pdf')
    } else {
      formData.append('fileInput', file)
    }

    formData.append('text', options?.text || '')
    formData.append('position', options?.position || 'center')
    formData.append('opacity', (options?.opacity || 0.5).toString())
    formData.append('fontSize', (options?.fontSize || 12).toString())
    formData.append('color', options?.color || '#000000')

    return this.makeRequest<{ url: string }>('/api/v1/add-watermark', formData, 'POST', true)
  }

  /**
   * Get server status
   */
  async getStatus(): Promise<StirlingPDFResponse<{
    status: string
    version: string
    uptime: number
  }>> {
    return this.makeRequest<{
      status: string
      version: string
      uptime: number
    }>('/api/v1/status', {}, 'GET')
  }
}

// Create singleton instance
let stirlingPDFClient: StirlingPDFClient | null = null

export function getStirlingPDFClient(baseUrl?: string, apiKey?: string): StirlingPDFClient {
  if (!stirlingPDFClient) {
    if (!baseUrl) {
      throw new Error('Stirling PDF base URL is required. Set STIRLING_PDF_URL environment variable or pass it as parameter.')
    }
    stirlingPDFClient = new StirlingPDFClient({ baseUrl, apiKey })
  }
  return stirlingPDFClient
}

export { 
  StirlingPDFClient, 
  type StirlingPDFConfig, 
  type StirlingPDFResponse, 
  type PDFInfo, 
  type OCRResult, 
  type PDFToImageResult 
}
