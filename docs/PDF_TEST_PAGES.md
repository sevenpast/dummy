# PDF Test Pages - Übersicht

## 🚀 Verfügbare Testseiten

Du hast jetzt **drei verschiedene Testseiten** für die PDF-APIs:

### 1. 📊 **PDF Demo Center** (Empfohlen)
- **URL:** http://localhost:4000/pdf-demo
- **Typ:** Statische Demo-Seite
- **Features:**
  - ✅ API-Status anzeigen
  - ✅ Schnelle API-Tests
  - ✅ Alle verfügbaren Endpunkte
  - ✅ Verwendungsbeispiele
  - ✅ curl-Befehle
  - ✅ Keine JavaScript-Abhängigkeiten

### 2. 🎮 **Interaktive Testseite**
- **URL:** http://localhost:4000/pdf-simple
- **Typ:** React-Komponente mit Hooks
- **Features:**
  - ✅ Datei-Upload
  - ✅ URL-Eingabe
  - ✅ Interaktive Buttons
  - ✅ Live-Ergebnisse
  - ✅ API-Status-Check

### 3. 🛠️ **Erweiterte Testseite**
- **URL:** http://localhost:4000/pdf-test
- **Typ:** Vollständige UI mit shadcn/ui
- **Features:**
  - ✅ Alle UI-Komponenten
  - ✅ Tabs für verschiedene Funktionen
  - ✅ Erweiterte Optionen
  - ✅ Professionelles Design

## 🧪 Schnelle Tests

### API-Status prüfen:
```bash
# aPDF API (bereit)
curl http://localhost:4000/api/apdf/test

# PDF.co API (benötigt API-Key)
curl http://localhost:4000/api/pdfco/test

# Stirling PDF API (benötigt Docker)
curl http://localhost:4000/api/stirling-pdf/test
```

### Text aus PDF extrahieren:
```bash
curl -X POST http://localhost:4000/api/apdf/extract-text \
  -F "file=@document.pdf" \
  -F "useOCR=true" \
  -F "language=eng"
```

### PDF-Informationen abrufen:
```bash
curl -X POST http://localhost:4000/api/apdf/pdf-info \
  -F "file=@document.pdf"
```

## 📋 Verfügbare aPDF Endpunkte

| Endpunkt | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/apdf/test` | GET | API-Verbindung testen |
| `/api/apdf/extract-text` | POST | Text extrahieren |
| `/api/apdf/pdf-info` | POST | PDF-Informationen |
| `/api/apdf/pdf-to-images` | POST | Zu Bildern konvertieren |
| `/api/apdf/split-pdf` | POST | PDF teilen |
| `/api/apdf/merge-pdf` | POST | PDFs zusammenführen |
| `/api/apdf/compress-pdf` | POST | PDF komprimieren |
| `/api/apdf/convert-pdf` | POST | PDF konvertieren |
| `/api/apdf/add-watermark` | POST | Wasserzeichen hinzufügen |
| `/api/apdf/protect-pdf` | POST | PDF schützen |
| `/api/apdf/unprotect-pdf` | POST | PDF entschlüsseln |

## 🎯 Empfohlene Verwendung

### Für schnelle Tests:
1. **Gehe zu:** http://localhost:4000/pdf-demo
2. **Klicke auf API-Test-Links**
3. **Verwende curl-Befehle**

### Für interaktive Tests:
1. **Gehe zu:** http://localhost:4000/pdf-simple
2. **Lade eine PDF-Datei hoch**
3. **Teste verschiedene Funktionen**

### Für Entwicklung:
1. **Gehe zu:** http://localhost:4000/pdf-test
2. **Verwende alle verfügbaren Optionen**
3. **Teste mit verschiedenen Einstellungen**

## 🔧 API-Konfiguration

### aPDF API (bereits konfiguriert):
- ✅ API-Key: `gjuS1ILo...5939`
- ✅ Status: Online
- ✅ Alle Endpunkte verfügbar

### PDF.co API (optional):
- ⚠️ API-Key benötigt
- ⚠️ In .env.local hinzufügen: `PDFCO_API_KEY=your_key`

### Stirling PDF API (optional):
- ⚠️ Docker benötigt
- ⚠️ Setup: `./scripts/setup-stirling-pdf.sh`

## 🚀 Nächste Schritte

1. **Teste die APIs:** Gehe zu http://localhost:4000/pdf-demo
2. **Lade eine PDF-Datei hoch** und teste die Funktionen
3. **Integriere die APIs** in deine App
4. **Verwende die curl-Befehle** für automatisierte Tests

## 📚 Weitere Informationen

- **API-Dokumentation:** Siehe `/docs/ALL_PDF_APIS_OVERVIEW.md`
- **Setup-Anleitungen:** Siehe `/docs/` Verzeichnis
- **Beispiel-Code:** Siehe `/src/app/api/` Verzeichnis

**Alle Testseiten sind bereit für den Einsatz!** 🎉
