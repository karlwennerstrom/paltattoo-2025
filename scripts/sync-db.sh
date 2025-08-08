#!/bin/bash

# Script para sincronizar base de datos local con producción
# Exporta desde Railway y la importa a tu BD local

set -e  # Salir si hay error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración de BD de producción (Railway)
PROD_HOST="metro.proxy.rlwy.net"
PROD_PORT="58495"
PROD_USER="root"
PROD_PASS="zGJNQcdVXrMBYhybFIlWHRBsecadBorH"
PROD_DB="railway"

# Configuración de BD local
LOCAL_HOST="localhost"
LOCAL_PORT="3306"
LOCAL_USER="root"
LOCAL_PASS=""  # Cambia si tienes contraseña
LOCAL_DB="tattoo_connect"  # Tu BD local

# Archivo temporal para el dump
DUMP_FILE="production_dump_$(date +%Y%m%d_%H%M%S).sql"

echo -e "${BLUE}🚀 Iniciando sincronización de base de datos...${NC}"
echo -e "${YELLOW}⚠️  ADVERTENCIA: Esto eliminará TODOS los datos de tu BD local${NC}"
read -p "¿Continuar? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Operación cancelada${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Paso 1: Exportando datos de producción...${NC}"
mysqldump \
  --host="$PROD_HOST" \
  --port="$PROD_PORT" \
  --user="$PROD_USER" \
  --password="$PROD_PASS" \
  --single-transaction \
  --routines \
  --triggers \
  --all-databases \
  --add-drop-database \
  "$PROD_DB" > "$DUMP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Exportación exitosa: $DUMP_FILE${NC}"
else
    echo -e "${RED}❌ Error en la exportación${NC}"
    exit 1
fi

echo -e "${BLUE}🗑️  Paso 2: Limpiando base de datos local...${NC}"
mysql \
  --host="$LOCAL_HOST" \
  --port="$LOCAL_PORT" \
  --user="$LOCAL_USER" \
  ${LOCAL_PASS:+--password="$LOCAL_PASS"} \
  -e "DROP DATABASE IF EXISTS $LOCAL_DB; CREATE DATABASE $LOCAL_DB;"

echo -e "${BLUE}📥 Paso 3: Importando datos a local...${NC}"
mysql \
  --host="$LOCAL_HOST" \
  --port="$LOCAL_PORT" \
  --user="$LOCAL_USER" \
  ${LOCAL_PASS:+--password="$LOCAL_PASS"} \
  "$LOCAL_DB" < "$DUMP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Importación exitosa${NC}"
else
    echo -e "${RED}❌ Error en la importación${NC}"
    exit 1
fi

echo -e "${BLUE}🧹 Paso 4: Limpiando archivos temporales...${NC}"
rm "$DUMP_FILE"

echo -e "${GREEN}🎉 ¡Sincronización completada exitosamente!${NC}"
echo -e "${BLUE}📊 Tu base de datos local ahora es idéntica a producción${NC}"

# Verificar algunas tablas
echo -e "${BLUE}🔍 Verificación rápida:${NC}"
mysql \
  --host="$LOCAL_HOST" \
  --port="$LOCAL_PORT" \
  --user="$LOCAL_USER" \
  ${LOCAL_PASS:+--password="$LOCAL_PASS"} \
  "$LOCAL_DB" \
  -e "SELECT 'users' as tabla, COUNT(*) as registros FROM users 
      UNION ALL 
      SELECT 'tattoo_offers', COUNT(*) FROM tattoo_offers 
      UNION ALL 
      SELECT 'tattoo_artists', COUNT(*) FROM tattoo_artists;"