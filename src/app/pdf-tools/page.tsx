export default function PDFToolsPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#333', textAlign: 'center' }}>
        🚀 PDF Tools Hub
      </h1>
      
      <p style={{ color: '#666', marginBottom: '40px', textAlign: 'center', fontSize: '18px' }}>
        Alle PDF-Verarbeitungstools an einem Ort
      </p>

      {/* Main Tools Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px', marginBottom: '40px' }}>
        
        {/* PDF Form Builder */}
        <div style={{ 
          border: '2px solid #4CAF50', 
          borderRadius: '12px', 
          padding: '25px', 
          backgroundColor: '#f8fff8',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 15px 0', color: '#2E7D32', fontSize: '24px' }}>
            🏗️ PDF zu Formular Builder
          </h2>
          <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '16px', lineHeight: '1.5' }}>
            Lade eine PDF hoch, lass sie übersetzen und erstelle ein dynamisches Formular zum Ausfüllen.
          </p>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '18px' }}>Features:</h3>
            <ul style={{ margin: '0', paddingLeft: '20px', color: '#666', fontSize: '14px' }}>
              <li>PDF hochladen und analysieren</li>
              <li>Automatische Übersetzung</li>
              <li>Dynamische Formularfelder generieren</li>
              <li>Formular ausfüllen und PDF generieren</li>
              <li>Intelligente Feldtyp-Erkennung</li>
            </ul>
          </div>
          <a 
            href="/pdf-form-builder"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#4CAF50',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '16px',
              textAlign: 'center',
              width: '100%'
            }}
          >
            🚀 PDF Form Builder starten
          </a>
        </div>

        {/* PDF Demo Center */}
        <div style={{ 
          border: '2px solid #2196F3', 
          borderRadius: '12px', 
          padding: '25px', 
          backgroundColor: '#f3f8ff',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 15px 0', color: '#1565C0', fontSize: '24px' }}>
            🧪 PDF Demo Center
          </h2>
          <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '16px', lineHeight: '1.5' }}>
            Teste alle verfügbaren PDF-APIs mit verschiedenen Funktionen und Beispielen.
          </p>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '18px' }}>Features:</h3>
            <ul style={{ margin: '0', paddingLeft: '20px', color: '#666', fontSize: '14px' }}>
              <li>API-Status prüfen</li>
              <li>Text extrahieren (mit/ohne OCR)</li>
              <li>PDF-Informationen abrufen</li>
              <li>PDF zu Bilder konvertieren</li>
              <li>PDF teilen und zusammenführen</li>
              <li>Wasserzeichen hinzufügen</li>
            </ul>
          </div>
          <a 
            href="/pdf-demo"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#2196F3',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '16px',
              textAlign: 'center',
              width: '100%'
            }}
          >
            🧪 Demo Center öffnen
          </a>
        </div>

        {/* Interactive Test Page */}
        <div style={{ 
          border: '2px solid #FF9800', 
          borderRadius: '12px', 
          padding: '25px', 
          backgroundColor: '#fff8f0',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 15px 0', color: '#E65100', fontSize: '24px' }}>
            🎮 Interaktive Testseite
          </h2>
          <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '16px', lineHeight: '1.5' }}>
            Interaktive Benutzeroberfläche zum Testen aller PDF-Funktionen mit Datei-Upload.
          </p>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '18px' }}>Features:</h3>
            <ul style={{ margin: '0', paddingLeft: '20px', color: '#666', fontSize: '14px' }}>
              <li>Datei-Upload und URL-Eingabe</li>
              <li>Live-Ergebnisse anzeigen</li>
              <li>API-Status-Check</li>
              <li>Interaktive Buttons</li>
              <li>Echtzeit-Feedback</li>
            </ul>
          </div>
          <a 
            href="/pdf-simple"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#FF9800',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '16px',
              textAlign: 'center',
              width: '100%'
            }}
          >
            🎮 Interaktiv testen
          </a>
        </div>

        {/* Advanced Test Page */}
        <div style={{ 
          border: '2px solid #9C27B0', 
          borderRadius: '12px', 
          padding: '25px', 
          backgroundColor: '#faf5ff',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 15px 0', color: '#6A1B9A', fontSize: '24px' }}>
            🛠️ Erweiterte Testseite
          </h2>
          <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '16px', lineHeight: '1.5' }}>
            Professionelle UI mit allen verfügbaren Optionen und erweiterten Einstellungen.
          </p>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '18px' }}>Features:</h3>
            <ul style={{ margin: '0', paddingLeft: '20px', color: '#666', fontSize: '14px' }}>
              <li>Vollständige UI-Komponenten</li>
              <li>Tabs für verschiedene Funktionen</li>
              <li>Erweiterte Optionen</li>
              <li>Professionelles Design</li>
              <li>Alle PDF-Funktionen</li>
            </ul>
          </div>
          <a 
            href="/pdf-test"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#9C27B0',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '16px',
              textAlign: 'center',
              width: '100%'
            }}
          >
            🛠️ Erweitert testen
          </a>
        </div>
      </div>

      {/* API Status */}
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '30px', backgroundColor: '#fff' }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#333', textAlign: 'center' }}>📊 API-Status</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <div style={{ 
              display: 'inline-block', 
              width: '20px', 
              height: '20px', 
              borderRadius: '50%', 
              backgroundColor: '#4CAF50',
              marginBottom: '10px'
            }}></div>
            <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>aPDF API</h3>
            <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>✅ Online</p>
          </div>

          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <div style={{ 
              display: 'inline-block', 
              width: '20px', 
              height: '20px', 
              borderRadius: '50%', 
              backgroundColor: '#f44336',
              marginBottom: '10px'
            }}></div>
            <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>PDF.co API</h3>
            <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>⚠️ API-Key benötigt</p>
          </div>

          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <div style={{ 
              display: 'inline-block', 
              width: '20px', 
              height: '20px', 
              borderRadius: '50%', 
              backgroundColor: '#f44336',
              marginBottom: '10px'
            }}></div>
            <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>Stirling PDF</h3>
            <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>⚠️ Docker benötigt</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '30px', backgroundColor: '#fff' }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#333', textAlign: 'center' }}>⚡ Schnelle Aktionen</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <a 
            href="/api/apdf/test" 
            target="_blank"
            style={{
              display: 'block',
              padding: '15px',
              backgroundColor: '#4CAF50',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
            🔥 aPDF API Test
          </a>
          
          <a 
            href="/api/pdfco/test" 
            target="_blank"
            style={{
              display: 'block',
              padding: '15px',
              backgroundColor: '#2196f3',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
            📄 PDF.co API Test
          </a>
          
          <a 
            href="/api/stirling-pdf/test" 
            target="_blank"
            style={{
              display: 'block',
              padding: '15px',
              backgroundColor: '#ff9800',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
            🏠 Stirling PDF Test
          </a>
        </div>
      </div>

      {/* Documentation */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f0f8ff', border: '1px solid #2196f3', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📚 Dokumentation</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <a 
            href="/docs/ALL_PDF_APIS_OVERVIEW.md" 
            style={{ 
              display: 'block', 
              padding: '10px', 
              backgroundColor: 'white', 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              textDecoration: 'none', 
              color: '#333' 
            }}
          >
            📋 Alle PDF-APIs Übersicht
          </a>
          <a 
            href="/docs/PDF_TEST_PAGES.md" 
            style={{ 
              display: 'block', 
              padding: '10px', 
              backgroundColor: 'white', 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              textDecoration: 'none', 
              color: '#333' 
            }}
          >
            🧪 Testseiten Dokumentation
          </a>
          <a 
            href="/docs/STIRLING_PDF_SETUP.md" 
            style={{ 
              display: 'block', 
              padding: '10px', 
              backgroundColor: 'white', 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              textDecoration: 'none', 
              color: '#333' 
            }}
          >
            🏠 Stirling PDF Setup
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '40px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
        <p>🚀 PDF Tools Hub - Alle PDF-Verarbeitungstools an einem Ort!</p>
        <p>Entwickelt mit Next.js, aPDF API, PDF.co API und Stirling PDF</p>
      </div>
    </div>
  )
}
