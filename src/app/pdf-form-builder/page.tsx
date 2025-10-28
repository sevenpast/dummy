'use client'

import React, { useState, useRef } from 'react'
import { PDFField } from '@/lib/pdf-form-builder'

interface AnalysisResult {
  text: string
  fields: PDFField[]
  pageCount: number
  translated: boolean
}

export default function PDFFormBuilderPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState('')
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<{ [fieldId: string]: any }>({})
  const [translate, setTranslate] = useState(true)
  const [targetLanguage, setTargetLanguage] = useState('de')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setFileUrl('')
      setAnalysis(null)
      setFormData({})
    }
  }

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileUrl(event.target.value)
    setSelectedFile(null)
    setAnalysis(null)
    setFormData({})
  }

  const analyzePDF = async () => {
    if (!selectedFile && !fileUrl) {
      setError('Bitte wählen Sie eine PDF-Datei oder geben Sie eine URL ein')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      if (selectedFile) {
        formData.append('file', selectedFile)
      } else {
        formData.append('fileUrl', fileUrl)
      }
      formData.append('translate', translate.toString())
      formData.append('targetLanguage', targetLanguage)

      const response = await fetch('/api/pdf-form/analyze', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Analyse fehlgeschlagen')
      }

      setAnalysis(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const generatePDF = async () => {
    if (!analysis) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/pdf-form/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          formData: {
            id: `form_${Date.now()}`,
            title: 'Generiertes Formular',
            fields: analysis.fields,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          userInputs: formData
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'PDF-Generierung fehlgeschlagen')
      }

      // PDF herunterladen
      window.open(result.data.url, '_blank')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setLoading(false)
    }
  }

  const renderField = (field: PDFField) => {
    const value = formData[field.id] || ''

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        )

      case 'select':
        return (
          <select
            id={field.id}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="">Bitte wählen...</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        )

      case 'checkbox':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id={field.id}
              checked={!!value}
              onChange={(e) => handleInputChange(field.id, e.target.checked)}
              style={{ transform: 'scale(1.2)' }}
            />
            <label htmlFor={field.id} style={{ fontSize: '14px' }}>
              {field.label}
            </label>
          </div>
        )

      case 'radio':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {field.options?.map((option, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="radio"
                  id={`${field.id}_${index}`}
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                />
                <label htmlFor={`${field.id}_${index}`} style={{ fontSize: '14px' }}>
                  {option}
                </label>
              </div>
            ))}
          </div>
        )

      default:
        return (
          <input
            type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
            id={field.id}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        )
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '20px', color: '#333' }}>
        🚀 PDF zu Formular Builder
      </h1>
      
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Lade eine PDF hoch, lass sie übersetzen und erstelle ein dynamisches Formular
      </p>

      {/* File Upload */}
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '30px', backgroundColor: '#fff' }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>📄 PDF-Datei auswählen</h2>
        
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
        
        <div style={{ marginBottom: '20px' }}>
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

        {/* Translation Options */}
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '16px' }}>🌍 Übersetzungsoptionen</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <input
              type="checkbox"
              id="translate"
              checked={translate}
              onChange={(e) => setTranslate(e.target.checked)}
            />
            <label htmlFor="translate" style={{ fontSize: '14px' }}>
              Text übersetzen
            </label>
          </div>

          <div>
            <label htmlFor="language" style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
              Zielsprache:
            </label>
            <select
              id="language"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              disabled={!translate}
              style={{
                padding: '5px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="de">Deutsch</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="it">Italiano</option>
            </select>
          </div>
        </div>

        <button
          onClick={analyzePDF}
          disabled={loading || (!selectedFile && !fileUrl)}
          style={{
            padding: '12px 24px',
            backgroundColor: loading || (!selectedFile && !fileUrl) ? '#ccc' : '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || (!selectedFile && !fileUrl) ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? '⏳ Analysiere PDF...' : '🔍 PDF analysieren und Formular erstellen'}
        </button>

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

      {/* Error Display */}
      {error && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          backgroundColor: '#ffebee', 
          border: '1px solid #f44336', 
          borderRadius: '4px',
          color: '#c62828'
        }}>
          ❌ {error}
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '30px', backgroundColor: '#fff' }}>
          <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>
            📋 Generiertes Formular ({analysis.fields.length} Felder)
          </h2>
          
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '16px' }}>📊 Analyse-Ergebnisse</h3>
            <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
              Seiten: {analysis.pageCount} | 
              Felder erkannt: {analysis.fields.length} | 
              Übersetzt: {analysis.translated ? 'Ja' : 'Nein'}
            </p>
          </div>

          {/* Form Fields */}
          <div style={{ display: 'grid', gap: '20px' }}>
            {analysis.fields.map((field) => (
              <div key={field.id} style={{ 
                border: '1px solid #e0e0e0', 
                borderRadius: '4px', 
                padding: '15px',
                backgroundColor: '#fafafa'
              }}>
                <label 
                  htmlFor={field.id}
                  style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 'bold',
                    fontSize: '14px',
                    color: '#333'
                  }}
                >
                  {field.label}
                  {field.required && <span style={{ color: '#f44336', marginLeft: '4px' }}>*</span>}
                </label>
                
                {field.originalText && field.translatedText && (
                  <div style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
                    <div><strong>Original:</strong> {field.originalText}</div>
                    <div><strong>Übersetzt:</strong> {field.translatedText}</div>
                  </div>
                )}
                
                {renderField(field)}
                
                {field.validation && (
                  <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                    {field.validation.message}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Generate PDF Button */}
          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <button
              onClick={generatePDF}
              disabled={loading}
              style={{
                padding: '15px 30px',
                backgroundColor: loading ? '#ccc' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {loading ? '⏳ Generiere PDF...' : '📄 PDF aus Formular generieren'}
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f0f8ff', border: '1px solid #2196f3', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📋 Anleitung</h3>
        <ol style={{ margin: '0', paddingLeft: '20px', color: '#666' }}>
          <li>Lade eine PDF-Datei hoch oder gib eine URL ein</li>
          <li>Wähle Übersetzungsoptionen (optional)</li>
          <li>Klicke auf "PDF analysieren" um Formularfelder zu generieren</li>
          <li>Fülle das generierte Formular aus</li>
          <li>Generiere eine neue PDF mit deinen Eingaben</li>
        </ol>
      </div>
    </div>
  )
}
