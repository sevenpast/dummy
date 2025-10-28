# PDF APIs Overview

## 🚀 Verfügbare PDF-APIs

Deine App hat jetzt **zwei leistungsstarke PDF-APIs** integriert:

### 1. 📄 PDF.co API (Cloud-basiert)
- **Typ:** Externe Cloud-API
- **Kosten:** Pay-per-use
- **Setup:** API-Key erforderlich
- **Vorteile:** Sehr umfangreich, professioneller Support
- **Nachteile:** Kosten, externe Verarbeitung

### 2. 🏠 Stirling PDF API (Lokal)
- **Typ:** Lokale Docker-Container
- **Kosten:** Kostenlos
- **Setup:** Docker erforderlich
- **Vorteile:** Kostenlos, lokal, datenschutzfreundlich
- **Nachteile:** Lokale Ressourcen, Setup erforderlich

## 🔧 Setup-Status

### ✅ PDF.co API
- **Status:** Installiert und konfiguriert
- **API-Key:** Benötigt (siehe `.env.local`)
- **Test:** `curl http://localhost:4000/api/pdfco/test`

### ⚠️ Stirling PDF API
- **Status:** Installiert, aber Server nicht gestartet
- **Docker:** Benötigt
- **Setup:** `./scripts/setup-stirling-pdf.sh`
- **Test:** `curl http://localhost:4000/api/stirling-pdf/test`

## 📊 Feature-Vergleich

| Feature | PDF.co | Stirling PDF |
|---------|--------|--------------|
| **Text extrahieren** | ✅ | ✅ |
| **OCR** | ✅ | ✅ |
| **PDF zu Bilder** | ✅ | ✅ |
| **PDF-Informationen** | ✅ | ✅ |
| **PDF teilen** | ✅ | ✅ |
| **PDFs zusammenführen** | ✅ | ✅ |
| **PDF komprimieren** | ✅ | ✅ |
| **Konvertieren** | ✅ | ✅ |
| **Wasserzeichen** | ❌ | ✅ |
| **Passwort-geschützt** | ✅ | ✅ |
| **Batch-Verarbeitung** | ✅ | ✅ |
| **Web-Interface** | ❌ | ✅ |

## 🎯 Empfohlene Verwendung

### Für Entwicklung & Testing
- **Stirling PDF** (kostenlos, lokal)
- Schnelle Iteration ohne API-Kosten
- Vollständige Kontrolle über Daten

### Für Produktion
- **PDF.co** (professionell, skalierbar)
- Zuverlässige Cloud-Infrastruktur
- Professioneller Support

### Hybrid-Ansatz
- **Stirling PDF** als Fallback
- **PDF.co** als primäre API
- Automatisches Failover

## 🚀 Nächste Schritte

### 1. Stirling PDF starten
```bash
cd /Users/andy/Documents/ExpatVillage/Final\ 2.0/village
./scripts/setup-stirling-pdf.sh
```

### 2. PDF.co API-Key setzen
```bash
# In .env.local hinzufügen:
PDFCO_API_KEY=dein_api_key_hier
```

### 3. Beide APIs testen
```bash
# PDF.co testen
curl http://localhost:4000/api/pdfco/test

# Stirling PDF testen
curl http://localhost:4000/api/stirling-pdf/test
```

### 4. In deiner App verwenden
```javascript
// PDF.co verwenden
const pdfCoResult = await fetch('/api/pdfco/extract-text', {
  method: 'POST',
  body: formData
})

// Stirling PDF verwenden
const stirlingResult = await fetch('/api/stirling-pdf/extract-text', {
  method: 'POST',
  body: formData
})
```

## 🔄 API-Fallback-System

Du kannst ein intelligentes Fallback-System implementieren:

```javascript
async function extractTextFromPDF(file) {
  try {
    // Versuche zuerst PDF.co
    const response = await fetch('/api/pdfco/extract-text', {
      method: 'POST',
      body: formData
    })
    
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.log('PDF.co failed, trying Stirling PDF...')
  }
  
  try {
    // Fallback zu Stirling PDF
    const response = await fetch('/api/stirling-pdf/extract-text', {
      method: 'POST',
      body: formData
    })
    
    return await response.json()
  } catch (error) {
    throw new Error('Both PDF APIs failed')
  }
}
```

## 📚 Dokumentation

- **PDF.co:** Siehe `/docs/PDFCO_SETUP.md`
- **Stirling PDF:** Siehe `/docs/STIRLING_PDF_SETUP.md`
- **API-Endpunkte:** Siehe `/src/app/api/`

## 🎉 Fazit

Du hast jetzt **zwei leistungsstarke PDF-APIs** zur Verfügung:

1. **PDF.co** - Professionell, cloud-basiert, skalierbar
2. **Stirling PDF** - Kostenlos, lokal, datenschutzfreundlich

**Wähle die API, die am besten zu deinen Bedürfnissen passt!** 🚀
