# Stirling PDF API Integration

## 🚀 Overview

Stirling PDF ist eine leistungsstarke, Open-Source PDF-API, die lokal läuft und keine externen API-Keys benötigt. Sie bietet umfangreiche PDF-Verarbeitungsfunktionen.

## ✨ Features

- **PDF zu Text** (mit/ohne OCR)
- **PDF zu Bilder** konvertieren
- **PDF-Informationen** abrufen
- **PDF teilen** in einzelne Seiten
- **PDFs zusammenführen**
- **PDF komprimieren**
- **PDF konvertieren** zu DOCX/XLSX/PPTX/HTML/TXT
- **Wasserzeichen** hinzufügen
- **OCR** mit mehreren Engines (Tesseract, EasyOCR)
- **Passwort-geschützte PDFs** unterstützen

## 🛠️ Installation

### Option 1: Automatisches Setup (Empfohlen)

```bash
# Führe das Setup-Script aus
./scripts/setup-stirling-pdf.sh
```

### Option 2: Manuelles Setup

```bash
# 1. Docker Image herunterladen
docker pull frooodle/s-pdf:latest

# 2. Server starten
docker run -d \
  --name stirling-pdf \
  -p 8080:8080 \
  -v "$(pwd)/stirling-pdf-data:/tmp/stirling-pdf" \
  frooodle/s-pdf:latest

# 3. Warten bis Server läuft (ca. 10 Sekunden)
sleep 10

# 4. Testen
curl http://localhost:8080/api/v1/status
```

## ⚙️ Konfiguration

### 1. Umgebungsvariablen setzen

Erstelle oder bearbeite deine `.env.local` Datei:

```env
# Stirling PDF Configuration
STIRLING_PDF_URL=http://localhost:8080
STIRLING_PDF_API_KEY=optional_api_key_if_using_auth
```

### 2. Server neu starten

```bash
npm run dev
```

## 🧪 Testing

### API-Verbindung testen

```bash
curl http://localhost:4000/api/stirling-pdf/test
```

### Verfügbare Endpunkte

- `GET /api/stirling-pdf/test` - API-Verbindung testen
- `POST /api/stirling-pdf/extract-text` - Text aus PDF extrahieren
- `POST /api/stirling-pdf/pdf-info` - PDF-Informationen abrufen
- `POST /api/stirling-pdf/pdf-to-images` - PDF zu Bilder konvertieren

## 📝 Verwendung

### Text aus PDF extrahieren

```javascript
const formData = new FormData()
formData.append('file', pdfFile)
formData.append('language', 'eng') // Optional: OCR-Sprache
formData.append('ocrEngine', 'tesseract') // Optional: OCR-Engine

const response = await fetch('/api/stirling-pdf/extract-text', {
  method: 'POST',
  body: formData
})

const result = await response.json()
console.log(result.data.text) // Extrahierter Text
```

### PDF-Informationen abrufen

```javascript
const formData = new FormData()
formData.append('file', pdfFile)

const response = await fetch('/api/stirling-pdf/pdf-info', {
  method: 'POST',
  body: formData
})

const result = await response.json()
console.log(result.data) // PDF-Informationen
```

### PDF zu Bilder konvertieren

```javascript
const formData = new FormData()
formData.append('file', pdfFile)
formData.append('format', 'png') // png, jpg, jpeg
formData.append('quality', '100') // 1-100
formData.append('dpi', '150') // DPI

const response = await fetch('/api/stirling-pdf/pdf-to-images', {
  method: 'POST',
  body: formData
})

const result = await response.json()
console.log(result.data.images) // Array von Bildern
```

## 🔧 Server-Management

### Server stoppen

```bash
docker stop stirling-pdf
```

### Server starten

```bash
docker start stirling-pdf
```

### Server entfernen

```bash
docker stop stirling-pdf
docker rm stirling-pdf
```

### Logs anzeigen

```bash
docker logs stirling-pdf
```

### Server-Status prüfen

```bash
curl http://localhost:8080/api/v1/status
```

## 🌐 Web-Interface

Stirling PDF bietet auch ein Web-Interface:

- **URL:** http://localhost:8080
- **Features:** Alle PDF-Operationen über eine benutzerfreundliche Oberfläche
- **Upload:** Drag & Drop PDF-Dateien
- **Download:** Verarbeitete Dateien herunterladen

## 🔒 Sicherheit

- **Lokal:** Läuft nur auf deinem Rechner
- **Keine API-Keys:** Keine externen Dienste erforderlich
- **Daten:** Alle PDFs werden lokal verarbeitet
- **Netzwerk:** Nur lokale Verbindungen (localhost)

## 🆚 Vergleich: Stirling PDF vs. PDF.co

| Feature | Stirling PDF | PDF.co |
|---------|--------------|---------|
| **Kosten** | Kostenlos | Pay-per-use |
| **Lokal** | ✅ Ja | ❌ Nein |
| **API-Keys** | ❌ Nein | ✅ Ja |
| **Setup** | Docker | API-Key |
| **Geschwindigkeit** | Schnell | Abhängig von Netzwerk |
| **Datenschutz** | ✅ Vollständig | ❌ Externe Verarbeitung |
| **Features** | Umfangreich | Sehr umfangreich |
| **Support** | Community | Professionell |

## 🚨 Troubleshooting

### Server startet nicht

```bash
# Prüfe Docker-Status
docker ps -a

# Prüfe Logs
docker logs stirling-pdf

# Port bereits belegt?
lsof -i :8080
```

### API nicht erreichbar

```bash
# Prüfe Server-Status
curl http://localhost:8080/api/v1/status

# Prüfe Umgebungsvariablen
echo $STIRLING_PDF_URL

# Server neu starten
docker restart stirling-pdf
```

### Fehler bei PDF-Verarbeitung

```bash
# Prüfe verfügbaren Speicher
df -h

# Prüfe Docker-Logs
docker logs stirling-pdf

# Server neu starten
docker restart stirling-pdf
```

## 📚 Weitere Informationen

- **GitHub:** https://github.com/Stirling-Tools/Stirling-PDF
- **Docker Hub:** https://hub.docker.com/r/frooodle/s-pdf
- **Dokumentation:** https://github.com/Stirling-Tools/Stirling-PDF/wiki

## 🎯 Nächste Schritte

1. **Stirling PDF Server starten** (siehe Installation)
2. **Umgebungsvariablen setzen** (siehe Konfiguration)
3. **API testen** (siehe Testing)
4. **In deine App integrieren** (siehe Verwendung)

**Stirling PDF ist bereit für den Einsatz!** 🚀
