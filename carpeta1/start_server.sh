#!/bin/bash
# Script para iniciar servidor local del juego

echo "🚀 Iniciando servidor local para Sky Fighter..."
echo "📱 Abre tu navegador en: http://localhost:8000"
echo "⏹️  Presiona Ctrl+C para detener el servidor"
echo ""

# Cambiar al directorio del workspace y iniciar servidor
cd /workspace
python3 -m http.server 8000