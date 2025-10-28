// ============================================================================
// APDF API INTEGRATION
// ============================================================================

import axios from 'axios'

interface APDFConfig {
  apiKey: string
  baseUrl?: string
}

interface APDFResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  status?: number
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
  isPasswordProtected: boolean
}

interface TextExtractionResult {
  text: string
  pageCount: number
  pages: Array<{
    pageNumber: number
    text: string
    confidence?: number
  }>
}

interface PDFToImageResult {
  images: Array<{
    pageNumber: number
    imageUrl: string
    imageData?: string
    format: string
    width: number
    height: number
  }>
}

interface ConversionResult {
  outputUrl: string
  outputFormat: string
  pageCount: number
  fileSize: number
}

class APDFClient {
  private apiKey: string
  private baseUrl: string

  constructor(config: APDFConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl || 'https://api.apdf.com/v1'
  }

  private async makeRequest<T>(
    endpoint: string, 
    data: any, 
    method: 'GET' | 'POST' = 'POST',
    isFileUpload: boolean = false
  ): Promise<APDFResponse<T>> {
    try {
      const headers: any = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': isFileUpload ? 'multipart/form-data' : 'application/json'
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
        data: response.data,
        status: response.status
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Unknown error',
        status: error.response?.status
      }
    }
  }

  /**
   * Get PDF information
   */
  async getPDFInfo(file: File | string): Promise<APDFResponse<PDFInfo>> {
    const formData = new FormData()
    
    if (typeof file === 'string') {
      // If it's a URL, we need to download it first
      const response = await fetch(file)
      const blob = await response.blob()
      formData.append('file', blob, 'document.pdf')
    } else {
      formData.append('file', file)
    }

    return this.makeRequest<PDFInfo>('/pdf/info', formData, 'POST', true)
  }

  /**
   * Extract text from PDF
   */
  async extractTextFromPDF(file: File | string, options?: {
    useOCR?: boolean
    language?: string
    includePageNumbers?: boolean
  }): Promise<APDFResponse<TextExtractionResult>> {
    const formData = new FormData()
    
    if (typeof file === 'string') {
      const response = await fetch(file)
      const blob = await response.blob()
      formData.append('file', blob, 'document.pdf')
    } else {
      formData.append('file', file)
    }

    if (options?.useOCR) {
      formData.append('useOCR', 'true')
    }
    if (options?.language) {
      formData.append('language', options.language)
    }
    if (options?.includePageNumbers) {
      formData.append('includePageNumbers', 'true')
    }

    return this.makeRequest<TextExtractionResult>('/pdf/extract-text', formData, 'POST', true)
  }

  /**
   * Convert PDF to images
   */
  async pdfToImages(file: File | string, options?: {
    format?: 'png' | 'jpg' | 'jpeg'
    quality?: number
    dpi?: number
    pages?: string // e.g., "1-3,5,7-9"
  }): Promise<APDFResponse<PDFToImageResult>> {
    const formData = new FormData()
    
    if (typeof file === 'string') {
      const response = await fetch(file)
      const blob = await response.blob()
      formData.append('file', blob, 'document.pdf')
    } else {
      formData.append('file', file)
    }

    formData.append('format', options?.format || 'png')
    formData.append('quality', (options?.quality || 100).toString())
    formData.append('dpi', (options?.dpi || 150).toString())
    
    if (options?.pages) {
      formData.append('pages', options.pages)
    }

    return this.makeRequest<PDFToImageResult>('/pdf/to-images', formData, 'POST', true)
  }

  /**
   * Split PDF into pages
   */
  async splitPDF(file: File | string, options?: {
    pages?: string // e.g., "1-3,5,7-9"
    password?: string
    outputFormat?: 'pdf' | 'images'
  }): Promise<APDFResponse<{ urls: string[] }>> {
    const formData = new FormData()
    
    if (typeof file === 'string') {
      const response = await fetch(file)
      const blob = await response.blob()
      formData.append('file', blob, 'document.pdf')
    } else {
      formData.append('file', file)
    }

    if (options?.pages) {
      formData.append('pages', options.pages)
    }
    if (options?.password) {
      formData.append('password', options.password)
    }
    if (options?.outputFormat) {
      formData.append('outputFormat', options.outputFormat)
    }

    return this.makeRequest<{ urls: string[] }>('/pdf/split', formData, 'POST', true)
  }

  /**
   * Merge PDFs
   */
  async mergePDFs(files: (File | string)[], options?: {
    password?: string
    order?: 'asc' | 'desc'
  }): Promise<APDFResponse<{ url: string }>> {
    const formData = new FormData()
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (typeof file === 'string') {
        const response = await fetch(file)
        const blob = await response.blob()
        formData.append(`file${i}`, blob, `document${i}.pdf`)
      } else {
        formData.append(`file${i}`, file)
      }
    }

    if (options?.password) {
      formData.append('password', options.password)
    }
    if (options?.order) {
      formData.append('order', options.order)
    }

    return this.makeRequest<{ url: string }>('/pdf/merge', formData, 'POST', true)
  }

  /**
   * Compress PDF
   */
  async compressPDF(file: File | string, options?: {
    compressionLevel?: 'low' | 'medium' | 'high' | 'maximum'
    password?: string
    removeMetadata?: boolean
  }): Promise<APDFResponse<{ url: string }>> {
    const formData = new FormData()
    
    if (typeof file === 'string') {
      const response = await fetch(file)
      const blob = await response.blob()
      formData.append('file', blob, 'document.pdf')
    } else {
      formData.append('file', file)
    }

    formData.append('compressionLevel', options?.compressionLevel || 'medium')
    if (options?.password) {
      formData.append('password', options.password)
    }
    if (options?.removeMetadata) {
      formData.append('removeMetadata', 'true')
    }

    return this.makeRequest<{ url: string }>('/pdf/compress', formData, 'POST', true)
  }

  /**
   * Convert PDF to different formats
   */
  async convertPDF(file: File | string, options?: {
    format: 'docx' | 'xlsx' | 'pptx' | 'html' | 'txt' | 'rtf'
    password?: string
    preserveFormatting?: boolean
  }): Promise<APDFResponse<ConversionResult>> {
    const formData = new FormData()
    
    if (typeof file === 'string') {
      const response = await fetch(file)
      const blob = await response.blob()
      formData.append('file', blob, 'document.pdf')
    } else {
      formData.append('file', file)
    }

    formData.append('format', options?.format)
    if (options?.password) {
      formData.append('password', options.password)
    }
    if (options?.preserveFormatting) {
      formData.append('preserveFormatting', 'true')
    }

    return this.makeRequest<ConversionResult>(`/pdf/to-${options?.format}`, formData, 'POST', true)
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
    rotation?: number
  }): Promise<APDFResponse<{ url: string }>> {
    const formData = new FormData()
    
    if (typeof file === 'string') {
      const response = await fetch(file)
      const blob = await response.blob()
      formData.append('file', blob, 'document.pdf')
    } else {
      formData.append('file', file)
    }

    formData.append('text', options?.text || '')
    formData.append('position', options?.position || 'center')
    formData.append('opacity', (options?.opacity || 0.5).toString())
    formData.append('fontSize', (options?.fontSize || 12).toString())
    formData.append('color', options?.color || '#000000')
    formData.append('rotation', (options?.rotation || 0).toString())

    return this.makeRequest<{ url: string }>('/pdf/watermark', formData, 'POST', true)
  }

  /**
   * Protect PDF with password
   */
  async protectPDF(file: File | string, options?: {
    password: string
    permissions?: string[] // e.g., ['print', 'copy', 'modify']
    encryptionLevel?: 'low' | 'medium' | 'high'
  }): Promise<APDFResponse<{ url: string }>> {
    const formData = new FormData()
    
    if (typeof file === 'string') {
      const response = await fetch(file)
      const blob = await response.blob()
      formData.append('file', blob, 'document.pdf')
    } else {
      formData.append('file', file)
    }

    formData.append('password', options?.password || '')
    if (options?.permissions) {
      formData.append('permissions', options.permissions.join(','))
    }
    formData.append('encryptionLevel', options?.encryptionLevel || 'medium')

    return this.makeRequest<{ url: string }>('/pdf/protect', formData, 'POST', true)
  }

  /**
   * Remove password from PDF
   */
  async unprotectPDF(file: File | string, password: string): Promise<APDFResponse<{ url: string }>> {
    const formData = new FormData()
    
    if (typeof file === 'string') {
      const response = await fetch(file)
      const blob = await response.blob()
      formData.append('file', blob, 'document.pdf')
    } else {
      formData.append('file', file)
    }

    formData.append('password', password)

    return this.makeRequest<{ url: string }>('/pdf/unprotect', formData, 'POST', true)
  }

  /**
   * Get API usage statistics
   */
  async getUsageStats(): Promise<APDFResponse<{
    requestsUsed: number
    requestsLimit: number
    requestsRemaining: number
    resetDate: string
    plan: string
  }>> {
    return this.makeRequest<{
      requestsUsed: number
      requestsLimit: number
      requestsRemaining: number
      resetDate: string
      plan: string
    }>('/usage', {}, 'GET')
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<APDFResponse<{
    status: string
    version: string
    timestamp: string
  }>> {
    return this.makeRequest<{
      status: string
      version: string
      timestamp: string
    }>('/status', {}, 'GET')
  }
}

// Create singleton instance
let apdfClient: APDFClient | null = null

export function getAPDFClient(apiKey?: string): APDFClient {
  if (!apdfClient) {
    if (!apiKey) {
      throw new Error('APDF API Key is required. Set APDF_API_KEY environment variable or pass it as parameter.')
    }
    apdfClient = new APDFClient({ apiKey })
  }
  return apdfClient
}

export { 
  APDFClient, 
  type APDFConfig, 
  type APDFResponse, 
  type PDFInfo, 
  type TextExtractionResult, 
  type PDFToImageResult,
  type ConversionResult
}
