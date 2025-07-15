#!/bin/bash

# ==============================================
# Export current database
# ==============================================

echo "🗄️  Exporting PalTattoo database..."

# Get MySQL credentials
echo -n "Enter MySQL username (default: root): "
read MYSQL_USER
MYSQL_USER=${MYSQL_USER:-root}

echo -n "Enter MySQL password: "
read -s MYSQL_PASSWORD
echo ""

# Export database
echo "Exporting database structure and data..."
mysqldump -u $MYSQL_USER -p$MYSQL_PASSWORD \
    --databases paltattoo \
    --add-drop-database \
    --routines \
    --triggers \
    --single-transaction \
    --lock-tables=false \
    --complete-insert \
    > paltattoo_complete_export.sql

if [ $? -eq 0 ]; then
    echo "✅ Database exported successfully to paltattoo_complete_export.sql"
else
    echo "❌ Database export failed"
    exit 1
fi

# Create a backup with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
cp paltattoo_complete_export.sql "paltattoo_backup_$TIMESTAMP.sql"
echo "✅ Backup created: paltattoo_backup_$TIMESTAMP.sql"

echo ""
echo "Files created:"
echo "  • paltattoo_complete_export.sql (latest export)"
echo "  • paltattoo_backup_$TIMESTAMP.sql (timestamped backup)"