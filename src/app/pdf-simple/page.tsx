'use client'

import React, { useState, useRef, useEffect } from 'react'

interface ApiResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

export default function PDFSimpleTestPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState('')
  const [results, setResults] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<{[key: string]: boolean}>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Test all APIs on component mount
  useEffect(() => {
    testAllApis()
  }, [])

  const testAllApis = async () => {
    const apis = ['apdf', 'pdfco', 'stirling-pdf']
    const status: {[key: string]: boolean} = {}
    
    for (const api of apis) {
      try {
        const response = await fetch(`/api/${api}/test`)
        const data = await response.json()
        status[api] = data.success
      } catch (error) {
        status[api] = false
      }
    }
    
    setApiStatus(status)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setFileUrl('')
    }
  }

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileUrl(event.target.value)
    setSelectedFile(null)
  }

  const callApi = async (endpoint: string, formData: FormData) => {
    setLoading(true)
    setResults(null)
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      setResults(data)
    } catch (error) {
      setResults({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const extractText = async (useOCR: boolean = false) => {
    if (!selectedFile && !fileUrl) return

    const formData = new FormData()
    if (selectedFile) {
      formData.append('file', selectedFile)
    } else {
      formData.append('fileUrl', fileUrl)
    }
    formData.append('useOCR', useOCR.toString())
    formData.append('language', 'eng')

    await callApi('/api/apdf/extract-text', formData)
  }

  const getPdfInfo = async () => {
    if (!selectedFile && !fileUrl) return

    const formData = new FormData()
    if (selectedFile) {
      formData.append('file', selectedFile)
    } else {
      formData.append('fileUrl', fileUrl)
    }

    await callApi('/api/apdf/pdf-info', formData)
  }

  const convertToImages = async () => {
    if (!selectedFile && !fileUrl) return

    const formData = new FormData()
    if (selectedFile) {
      formData.append('file', selectedFile)
    } else {
      formData.append('fileUrl', fileUrl)
    }
    formData.append('format', 'png')
    formData.append('quality', '100')
    formData.append('dpi', '150')

    await callApi('/api/apdf/pdf-to-images', formData)
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '20px', color: '#333' }}>
        PDF APIs Test Center
      </h1>
      
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Teste alle verfügbaren PDF-APIs: aPDF, PDF.co und Stirling PDF
      </p>

      {/* API Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#f9f9f9' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
            <span style={{ 
              display: 'inline-block', 
              width: '10px', 
              height: '10px', 
              borderRadius: '50%', 
              backgroundColor: apiStatus.apdf ? '#4CAF50' : '#f44336',
              marginRight: '8px'
            }}></span>
            aPDF API
          </h3>
          <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
            {apiStatus.apdf ? 'Bereit und konfiguriert' : 'Nicht verfügbar'}
          </p>
        </div>

        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#f9f9f9' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
            <span style={{ 
              display: 'inline-block', 
              width: '10px', 
              height: '10px', 
              borderRadius: '50%', 
              backgroundColor: apiStatus.pdfco ? '#4CAF50' : '#f44336',
              marginRight: '8px'
            }}></span>
            PDF.co API
          </h3>
          <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
            {apiStatus.pdfco ? 'Bereit' : 'API-Key benötigt'}
          </p>
        </div>

        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#f9f9f9' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
            <span style={{ 
              display: 'inline-block', 
              width: '10px', 
              height: '10px', 
              borderRadius: '50%', 
              backgroundColor: apiStatus['stirling-pdf'] ? '#4CAF50' : '#f44336',
              marginRight: '8px'
            }}></span>
            Stirling PDF
          </h3>
          <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
            {apiStatus['stirling-pdf'] ? 'Bereit' : 'Docker benötigt'}
          </p>
        </div>
      </div>

      {/* File Upload */}
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '30px', backgroundColor: '#fff' }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>PDF-Datei auswählen</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            PDF-Datei hochladen:
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            ref={fileInputRef}
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
        
        <div style={{ textAlign: 'center', margin: '20px 0', color: '#666' }}>oder</div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            PDF-URL eingeben:
          </label>
          <input
            type="url"
            placeholder="https://example.com/document.pdf"
            value={fileUrl}
            onChange={handleUrlChange}
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        {selectedFile && (
          <div style={{ 
            marginTop: '15px', 
            padding: '10px', 
            backgroundColor: '#e3f2fd', 
            border: '1px solid #2196f3', 
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            📄 Ausgewählte Datei: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}

        {fileUrl && (
          <div style={{ 
            marginTop: '15px', 
            padding: '10px', 
            backgroundColor: '#e3f2fd', 
            border: '1px solid #2196f3', 
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            📄 URL: {fileUrl}
          </div>
        )}
      </div>

      {/* API Functions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📄 Text extrahieren</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => extractText(false)}
              disabled={loading || (!selectedFile && !fileUrl)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading || (!selectedFile && !fileUrl) ? 'not-allowed' : 'pointer',
                opacity: loading || (!selectedFile && !fileUrl) ? 0.6 : 1
              }}
            >
              {loading ? '⏳' : '📄'} Text extrahieren
            </button>
            
            <button
              onClick={() => extractText(true)}
              disabled={loading || (!selectedFile && !fileUrl)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading || (!selectedFile && !fileUrl) ? 'not-allowed' : 'pointer',
                opacity: loading || (!selectedFile && !fileUrl) ? 0.6 : 1
              }}
            >
              {loading ? '⏳' : '🔍'} Mit OCR extrahieren
            </button>
          </div>
        </div>

        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>ℹ️ PDF-Informationen</h3>
          <button
            onClick={getPdfInfo}
            disabled={loading || (!selectedFile && !fileUrl)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading || (!selectedFile && !fileUrl) ? 'not-allowed' : 'pointer',
              opacity: loading || (!selectedFile && !fileUrl) ? 0.6 : 1
            }}
          >
            {loading ? '⏳' : 'ℹ️'} PDF-Info abrufen
          </button>
        </div>

        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🖼️ Zu Bildern konvertieren</h3>
          <button
            onClick={convertToImages}
            disabled={loading || (!selectedFile && !fileUrl)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#9c27b0',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading || (!selectedFile && !fileUrl) ? 'not-allowed' : 'pointer',
              opacity: loading || (!selectedFile && !fileUrl) ? 0.6 : 1
            }}
          >
            {loading ? '⏳' : '🖼️'} Zu Bildern konvertieren
          </button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>
            {results.success ? (
              <span style={{ color: '#4CAF50' }}>✅ Erfolgreich</span>
            ) : (
              <span style={{ color: '#f44336' }}>❌ Fehler</span>
            )}
            {' '}Ergebnis
          </h3>
          <textarea
            value={JSON.stringify(results, null, 2)}
            readOnly
            style={{
              width: '100%',
              height: '300px',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px',
              backgroundColor: '#f5f5f5'
            }}
          />
        </div>
      )}

      {/* Instructions */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f0f8ff', border: '1px solid #2196f3', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📋 Anleitung</h3>
        <ol style={{ margin: '0', paddingLeft: '20px', color: '#666' }}>
          <li>Wähle eine PDF-Datei oder gib eine URL ein</li>
          <li>Klicke auf eine der Funktionen, um sie zu testen</li>
          <li>Das Ergebnis wird unten angezeigt</li>
          <li>Verwende die einfache Testseite: <a href="/pdf-simple" style={{ color: '#2196f3' }}>/pdf-simple</a></li>
        </ol>
      </div>
    </div>
  )
}
