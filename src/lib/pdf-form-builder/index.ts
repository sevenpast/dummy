// ============================================================================
// PDF FORM BUILDER - PDF zu dynamisches Formular konvertieren
// ============================================================================

import { getAPDFClient } from '@/lib/apdf'

export interface PDFField {
  id: string
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number' | 'email'
  label: string
  placeholder?: string
  required: boolean
  options?: string[] // Für select, radio
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  originalText?: string
  translatedText?: string
}

export interface PDFFormData {
  id: string
  title: string
  description?: string
  fields: PDFField[]
  originalPdfUrl?: string
  translatedPdfUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface TranslationResult {
  originalText: string
  translatedText: string
  language: string
  confidence: number
}

export class PDFFormBuilder {
  private apdf: any

  constructor() {
    this.apdf = getAPDFClient(process.env.APDF_API_KEY)
  }

  /**
   * Analysiert eine PDF und extrahiert Text für Formularfelder
   */
  async analyzePDF(file: File | string): Promise<{
    text: string
    fields: PDFField[]
    pageCount: number
  }> {
    try {
      // Mock-Implementierung für Demo-Zwecke
      // In einer echten Anwendung würde hier die aPDF API aufgerufen werden
      const mockText = this.generateMockPDFText()
      const mockPageCount = 3

      // Formularfelder aus Text generieren
      const fields = this.generateFormFields(mockText, mockPageCount)

      return {
        text: mockText,
        fields,
        pageCount: mockPageCount
      }
    } catch (error) {
      throw new Error(`PDF analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generiert Mock-PDF-Text für Demo-Zwecke
   */
  private generateMockPDFText(): string {
    return `
APPLICATION FORM / ANTRAGSFORMULAR

Personal Information / Persönliche Angaben
Name: _____________________________
First Name / Vorname: ______________
Last Name / Nachname: ______________
Email Address / E-Mail-Adresse: ____
Phone Number / Telefonnummer: ______
Date of Birth / Geburtsdatum: ______

Address Information / Adressangaben
Street / Straße: ___________________
House Number / Hausnummer: _________
Postal Code / Postleitzahl: ________
City / Stadt: _____________________
Country / Land: ___________________

Employment Information / Beschäftigungsangaben
Current Position / Aktuelle Position: __
Company / Unternehmen: ______________
Start Date / Startdatum: ____________
Salary / Gehalt: ___________________

Additional Information / Zusätzliche Angaben
Please describe your experience / Bitte beschreiben Sie Ihre Erfahrung:
_________________________________
_________________________________

Skills / Fähigkeiten
☐ Programming / Programmierung
☐ Design / Design
☐ Management / Management
☐ Languages / Sprachen

Language Proficiency / Sprachkenntnisse
Native / Muttersprache: _____________
Fluent / Fließend: _________________
Intermediate / Mittel: ______________
Beginner / Anfänger: _______________

References / Referenzen
Reference 1 / Referenz 1: ___________
Contact / Kontakt: __________________
Reference 2 / Referenz 2: ___________
Contact / Kontakt: __________________

Terms and Conditions / Allgemeine Geschäftsbedingungen
☐ I agree to the terms and conditions / Ich stimme den AGB zu
☐ I consent to data processing / Ich stimme der Datenverarbeitung zu

Signature / Unterschrift: ________________
Date / Datum: ________________________

Please submit this form by / Bitte senden Sie dieses Formular bis:
Deadline / Frist: ____________________
    `.trim()
  }

  /**
   * Generiert Formularfelder basierend auf extrahiertem Text
   */
  private generateFormFields(text: string, pageCount: number): PDFField[] {
    const fields: PDFField[] = []
    const lines = text.split('\n').filter(line => line.trim().length > 0)
    
    let fieldId = 1
    let yPosition = 50

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Überspringe leere Zeilen oder sehr kurze Zeilen
      if (line.length < 3) continue

      // Erkenne verschiedene Feldtypen
      const fieldType = this.detectFieldType(line)
      
      if (fieldType) {
        const field: PDFField = {
          id: `field_${fieldId++}`,
          type: fieldType.type,
          label: this.cleanLabel(line),
          placeholder: this.generatePlaceholder(fieldType.type, line),
          required: this.isRequiredField(line),
          options: fieldType.options,
          position: {
            x: 20,
            y: yPosition,
            width: 300,
            height: fieldType.type === 'textarea' ? 80 : 40
          },
          originalText: line,
          validation: this.generateValidation(fieldType.type, line)
        }

        fields.push(field)
        yPosition += field.position.height + 20
      }
    }

    return fields
  }

  /**
   * Erkennt den Feldtyp basierend auf dem Text
   */
  private detectFieldType(text: string): { type: PDFField['type'], options?: string[] } | null {
    const lowerText = text.toLowerCase()

    // E-Mail Felder
    if (lowerText.includes('email') || lowerText.includes('e-mail') || lowerText.includes('@')) {
      return { type: 'email' }
    }

    // Datum Felder
    if (lowerText.includes('date') || lowerText.includes('datum') || lowerText.includes('birth') || lowerText.includes('geburt') || lowerText.includes('start date') || lowerText.includes('deadline')) {
      return { type: 'date' }
    }

    // Nummer Felder
    if (lowerText.includes('number') || lowerText.includes('nummer') || lowerText.includes('phone') || lowerText.includes('telefon') || lowerText.includes('salary') || lowerText.includes('gehalt')) {
      return { type: 'number' }
    }

    // Checkbox Felder
    if (lowerText.includes('check') || lowerText.includes('tick') || lowerText.includes('haken') || lowerText.includes('☐') || lowerText.includes('□') || lowerText.includes('agree') || lowerText.includes('consent')) {
      return { type: 'checkbox' }
    }

    // Radio Button Felder für Skills/Fähigkeiten
    if (lowerText.includes('skills') || lowerText.includes('fähigkeiten') || lowerText.includes('proficiency') || lowerText.includes('kenntnisse')) {
      return { type: 'radio', options: ['Programming / Programmierung', 'Design / Design', 'Management / Management', 'Languages / Sprachen'] }
    }

    // Select Felder für Language Proficiency
    if (lowerText.includes('language') || lowerText.includes('sprache') || lowerText.includes('native') || lowerText.includes('fluent')) {
      return { type: 'select', options: ['Native / Muttersprache', 'Fluent / Fließend', 'Intermediate / Mittel', 'Beginner / Anfänger'] }
    }

    // Textarea für längere Texte
    if (text.length > 50 || lowerText.includes('comment') || lowerText.includes('note') || lowerText.includes('bemerkung') || lowerText.includes('beschreibung') || lowerText.includes('describe') || lowerText.includes('experience')) {
      return { type: 'textarea' }
    }

    // Standard Textfeld
    return { type: 'text' }
  }

  /**
   * Bereinigt Labels für bessere Lesbarkeit
   */
  private cleanLabel(text: string): string {
    return text
      .replace(/[^\w\s]/g, '') // Entferne Sonderzeichen
      .replace(/\s+/g, ' ') // Normalisiere Leerzeichen
      .trim()
      .substring(0, 100) // Begrenze Länge
  }

  /**
   * Generiert Platzhalter basierend auf Feldtyp
   */
  private generatePlaceholder(type: PDFField['type'], text: string): string {
    const lowerText = text.toLowerCase()
    
    switch (type) {
      case 'email':
        return 'ihre.email@beispiel.de'
      case 'date':
        return 'DD.MM.YYYY'
      case 'number':
        return '123456789'
      case 'textarea':
        return 'Geben Sie hier Ihre Antwort ein...'
      default:
        return 'Bitte ausfüllen...'
    }
  }

  /**
   * Prüft ob ein Feld als erforderlich markiert ist
   */
  private isRequiredField(text: string): boolean {
    const lowerText = text.toLowerCase()
    return lowerText.includes('required') || 
           lowerText.includes('erforderlich') || 
           lowerText.includes('*') ||
           lowerText.includes('muss') ||
           lowerText.includes('notwendig')
  }

  /**
   * Generiert Validierungsregeln
   */
  private generateValidation(type: PDFField['type'], text: string): PDFField['validation'] {
    switch (type) {
      case 'email':
        return {
          pattern: '^[^@]+@[^@]+\\.[^@]+$',
          message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
        }
      case 'number':
        return {
          min: 0,
          message: 'Bitte geben Sie eine gültige Zahl ein'
        }
      case 'date':
        return {
          pattern: '^\\d{2}\\.\\d{2}\\.\\d{4}$',
          message: 'Bitte verwenden Sie das Format DD.MM.YYYY'
        }
      default:
        return undefined
    }
  }

  /**
   * Übersetzt Text mit aPDF API
   */
  async translateText(text: string, targetLanguage: string = 'de'): Promise<TranslationResult> {
    try {
      // Hier würde normalerweise eine Übersetzungs-API aufgerufen werden
      // Für jetzt simulieren wir eine Übersetzung
      const translatedText = await this.simulateTranslation(text, targetLanguage)
      
      return {
        originalText: text,
        translatedText,
        language: targetLanguage,
        confidence: 0.85
      }
    } catch (error) {
      throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Simuliert Übersetzung (ersetzt durch echte API)
   */
  private async simulateTranslation(text: string, targetLanguage: string): Promise<string> {
    // Einfache Übersetzungssimulation
    const translations: { [key: string]: string } = {
      'name': 'Name',
      'email': 'E-Mail',
      'phone': 'Telefon',
      'address': 'Adresse',
      'date': 'Datum',
      'signature': 'Unterschrift',
      'required': 'Erforderlich',
      'optional': 'Optional',
      'please fill': 'Bitte ausfüllen',
      'submit': 'Absenden',
      'cancel': 'Abbrechen',
      'save': 'Speichern',
      'print': 'Drucken',
      'download': 'Herunterladen'
    }

    let translated = text
    Object.entries(translations).forEach(([en, de]) => {
      translated = translated.replace(new RegExp(en, 'gi'), de)
    })

    return translated
  }

  /**
   * Generiert eine PDF aus ausgefüllten Formulardaten
   */
  async generatePDFFromForm(formData: PDFFormData, userInputs: { [fieldId: string]: any }): Promise<{ url: string }> {
    try {
      // Hier würde normalerweise eine PDF-Generierung stattfinden
      // Für jetzt simulieren wir das
      const pdfUrl = await this.simulatePDFGeneration(formData, userInputs)
      
      return { url: pdfUrl }
    } catch (error) {
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Simuliert PDF-Generierung
   */
  private async simulatePDFGeneration(formData: PDFFormData, userInputs: { [fieldId: string]: any }): Promise<string> {
    // Simuliere PDF-Generierung
    const timestamp = Date.now()
    return `https://example.com/generated-pdf-${timestamp}.pdf`
  }

  /**
   * Speichert Formulardaten
   */
  async saveForm(formData: PDFFormData): Promise<PDFFormData> {
    // Hier würde normalerweise in einer Datenbank gespeichert werden
    formData.id = `form_${Date.now()}`
    formData.createdAt = new Date()
    formData.updatedAt = new Date()
    
    return formData
  }

  /**
   * Lädt gespeicherte Formulardaten
   */
  async loadForm(formId: string): Promise<PDFFormData | null> {
    // Hier würde normalerweise aus einer Datenbank geladen werden
    // Für jetzt simulieren wir das
    return null
  }
}

// Singleton instance
let pdfFormBuilder: PDFFormBuilder | null = null

export function getPDFFormBuilder(): PDFFormBuilder {
  if (!pdfFormBuilder) {
    pdfFormBuilder = new PDFFormBuilder()
  }
  return pdfFormBuilder
}
