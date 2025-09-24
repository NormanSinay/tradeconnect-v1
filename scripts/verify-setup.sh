#!/bin/bash
echo "🔍 Verificando configuración de TradeConnect..."
echo "================================================"

# Verificar Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js no encontrado"
    exit 1
fi

# Verificar npm
if command -v npm &> /dev/null; then
    echo "✅ npm: $(npm --version)"
else
    echo "❌ npm no encontrado"
    exit 1
fi

# Verificar TypeScript
if command -v tsc &> /dev/null; then
    echo "✅ TypeScript: $(tsc --version)"
else
    echo "❌ TypeScript no encontrado"
    exit 1
fi

# Verificar PostgreSQL
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL disponible"
    # Intentar conectar a la base de datos
    if PGPASSWORD=tu_password_seguro psql -h localhost -U tradeconnect_user -d tradeconnect_dev -c "SELECT 1;" &> /dev/null; then
        echo "✅ Conexión a base de datos exitosa"
    else
        echo "⚠️  PostgreSQL instalado pero no se puede conectar a tradeconnect_dev"
    fi
else
    echo "❌ PostgreSQL no encontrado"
fi

# Verificar Redis
if command -v redis-cli &> /dev/null; then
    echo "✅ Redis disponible"
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis funcionando correctamente"
    else
        echo "⚠️  Redis instalado pero no responde"
    fi
else
    echo "❌ Redis no encontrado"
fi

# Verificar Docker (opcional)
if command -v docker &> /dev/null; then
    echo "✅ Docker: $(docker --version | cut -d ',' -f1)"
else
    echo "⚠️  Docker no encontrado (opcional)"
fi

# Verificar dependencias de Node.js
cd backend 2>/dev/null || cd .
if [ -f "package.json" ]; then
    echo "✅ package.json encontrado"
    if [ -d "node_modules" ]; then
        echo "✅ Dependencias instaladas"
    else
        echo "⚠️  Ejecuta 'npm install' para instalar dependencias"
    fi
else
    echo "❌ package.json no encontrado"
fi

# Verificar archivos de configuración
config_files=("tsconfig.json" ".eslintrc.js" ".prettierrc" "jest.config.js" ".env.example")
for file in "${config_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file configurado"
    else
        echo "❌ $file no encontrado"
    fi
done

# Verificar estructura de carpetas
directories=("src" "src/config" "src/middleware" "src/models" "src/routes" "src/services" "src/controllers" "src/types" "src/utils")
echo ""
echo "📁 Verificando estructura de carpetas:"
for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ $dir/"
    else
        echo "❌ $dir/ no encontrada"
    fi
done

echo ""
echo "🎯 Resumen de verificación:"
if command -v node &> /dev/null && command -v npm &> /dev/null && command -v tsc &> /dev/null; then
    echo "✅ Herramientas básicas: OK"
else
    echo "❌ Faltan herramientas básicas"
fi

if [ -f ".env.example" ] && [ -f "tsconfig.json" ]; then
    echo "✅ Configuración: OK"
else
    echo "❌ Falta configuración"
fi

echo ""
echo "🚀 Para continuar:"
echo "1. Asegúrate de que todas las verificaciones sean exitosas"
echo "2. Copia .env.example a .env y configúralo: cp .env.example .env"
echo "3. Ejecuta: npm run lint"
echo "4. Ejecuta: npm run build"
echo "5. ¡Listo para desarrollar el Módulo 1!"
