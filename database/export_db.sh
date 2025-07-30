#!/bin/bash

# Script para exportar la base de datos tattoo_connect
echo "=== Exportando Base de Datos PalTattoo ==="
echo ""

# Crear directorio de backups si no existe
mkdir -p backups

# Fecha para el nombre del archivo
DATE=$(date +"%Y%m%d_%H%M%S")

# Opciones de exportación
OPTIONS="--single-transaction --routines --triggers --events --add-drop-table --add-locks --disable-keys --extended-insert"

# Exportar solo estructura
echo "1. Exportando estructura de la base de datos..."
mysqldump -u root -p $OPTIONS --no-data tattoo_connect > backups/tattoo_connect_structure_$DATE.sql

# Exportar datos
echo "2. Exportando datos de la base de datos..."
mysqldump -u root -p $OPTIONS --no-create-info tattoo_connect > backups/tattoo_connect_data_$DATE.sql

# Exportar todo completo
echo "3. Exportando base de datos completa..."
mysqldump -u root -p $OPTIONS tattoo_connect > backups/tattoo_connect_complete_$DATE.sql

# Crear copia para Railway
echo "4. Creando copia para Railway..."
cp backups/tattoo_connect_complete_$DATE.sql tattoo_connect_export.sql

echo ""
echo "=== Exportación Completa ==="
echo "Archivos creados:"
echo "- backups/tattoo_connect_structure_$DATE.sql (solo estructura)"
echo "- backups/tattoo_connect_data_$DATE.sql (solo datos)"
echo "- backups/tattoo_connect_complete_$DATE.sql (completo)"
echo "- tattoo_connect_export.sql (para Railway)"
echo ""
echo "Para importar en Railway, usa: tattoo_connect_export.sql"