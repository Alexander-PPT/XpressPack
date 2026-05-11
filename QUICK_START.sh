#!/bin/bash
# Script de Inicio Rápido para RutaSync Backend

echo "======================================"
echo "🚀 RutaSync Backend - Quick Start"
echo "======================================"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+"
    exit 1
fi

echo "✓ Node.js $(node --version)"
echo ""

# Navegar al directorio del backend
cd backend

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

echo ""
echo "⚙️  Configurando variables de entorno..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ Archivo .env creado. Actualiza con valores reales."
else
    echo "✓ Archivo .env ya existe."
fi

echo ""
echo "======================================"
echo "✅ Instalación Completada"
echo "======================================"
echo ""
echo "🔧 Próximos pasos:"
echo ""
echo "OPCIÓN 1: Con Docker (Recomendado)"
echo "  $ docker-compose up -d"
echo "  - MySQL disponible en: localhost:3306"
echo "  - Redis disponible en: localhost:6379"
echo "  - phpMyAdmin en: http://localhost:8080"
echo "  - Backend en: http://localhost:3001"
echo ""
echo "OPCIÓN 2: Desarrollo Local"
echo "  $ npm run migrate    # Crear tablas"
echo "  $ npm run seed       # Llenar datos iniciales"
echo "  $ npm run dev        # Iniciar con nodemon"
echo ""
echo "📝 Credenciales de Prueba:"
echo "  Admin: admin@rutasync.com / Admin123!"
echo "  Operario: operario@rutasync.com / Operario123!"
echo ""
echo "🧪 Verificar Salud del Sistema:"
echo "  $ curl http://localhost:3001/health"
echo ""
echo "📚 Documentación:"
echo "  - README: backend/README.md"
echo "  - Resumen: BACKEND_IMPLEMENTATION_SUMMARY.md"
echo "  - Fases: PHASE_1_COMPLETE.md, PHASE_2_COMPLETE.md, PHASE_3_COMPLETE.md"
echo ""
