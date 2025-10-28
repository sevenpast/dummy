#!/bin/bash

# ============================================================================
# STIRLING PDF SETUP SCRIPT
# ============================================================================

echo "🚀 Setting up Stirling PDF API..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is installed and running"

# Create data directory
mkdir -p ./stirling-pdf-data

# Pull and run Stirling PDF container
echo "📦 Pulling Stirling PDF Docker image..."
docker pull frooodle/s-pdf:latest

echo "🚀 Starting Stirling PDF server..."
docker run -d \
  --name stirling-pdf \
  -p 8080:8080 \
  -v "$(pwd)/stirling-pdf-data:/tmp/stirling-pdf" \
  frooodle/s-pdf:latest

# Wait for server to start
echo "⏳ Waiting for Stirling PDF server to start..."
sleep 10

# Test if server is running
if curl -s http://localhost:8080/api/v1/status > /dev/null; then
    echo "✅ Stirling PDF server is running successfully!"
    echo ""
    echo "📋 Configuration:"
    echo "   Server URL: http://localhost:8080"
    echo "   API Base: http://localhost:8080/api/v1"
    echo "   Data Directory: $(pwd)/stirling-pdf-data"
    echo ""
    echo "🔧 Add to your .env.local file:"
    echo "   STIRLING_PDF_URL=http://localhost:8080"
    echo ""
    echo "🧪 Test the API:"
    echo "   curl http://localhost:4000/api/stirling-pdf/test"
    echo ""
    echo "📚 Available features:"
    echo "   • PDF to Text (with OCR)"
    echo "   • PDF to Images"
    echo "   • PDF Information"
    echo "   • Split PDF"
    echo "   • Merge PDFs"
    echo "   • Compress PDF"
    echo "   • Convert to DOCX/XLSX/PPTX/HTML/TXT"
    echo "   • Add Watermarks"
    echo "   • OCR with multiple engines"
    echo ""
    echo "🛑 To stop the server:"
    echo "   docker stop stirling-pdf"
    echo ""
    echo "🗑️  To remove the server:"
    echo "   docker rm stirling-pdf"
else
    echo "❌ Failed to start Stirling PDF server"
    echo "Check the logs with: docker logs stirling-pdf"
    exit 1
fi
