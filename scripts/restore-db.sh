#!/usr/bin/env bash
# ==============================================================================
# LEVIX Database Disaster Recovery / Restore Script
# Usage: ./scripts/restore-db.sh /var/backups/mysql/levix/levix_db_20261029_020000.sql.gz
# ==============================================================================

set -euo pipefail

BACKUP_FILE="${1:-}"

if [ -z "${BACKUP_FILE}" ] || [ ! -f "${BACKUP_FILE}" ]; then
  echo "❌ Error: Backup file not specified or does not exist."
  echo "Usage: $0 /path/to/backup.sql.gz"
  exit 1
fi

if [ -f "/var/www/thelevix.com/.env" ]; then
  export $(grep -v '^#' /var/www/thelevix.com/.env | xargs)
fi

DB_USER="${MYSQL_USER:-levix_prod_user}"
DB_PASSWORD="${MYSQL_PASSWORD:-}"
DB_NAME="${MYSQL_DATABASE:-levix_db}"
DB_HOST="${MYSQL_HOST:-localhost}"

echo "⚠️  WARNING: You are about to restore database '${DB_NAME}' from archive:"
echo "   ${BACKUP_FILE}"
read -p "Are you sure you want to overwrite the current database? (type 'RESTORE' to proceed): " CONFIRM

if [ "${CONFIRM}" != "RESTORE" ]; then
  echo "Restore aborted by user."
  exit 0
fi

echo "[$(date)] Restoring database from archive..."

# Decompress and stream into mysql
gunzip < "${BACKUP_FILE}" | mysql \
  --host="${DB_HOST}" \
  --user="${DB_USER}" \
  --password="${DB_PASSWORD}" \
  "${DB_NAME}"

echo "[$(date)] ✅ Database restore completed successfully!"

# Verification check
echo "[$(date)] Verifying table counts..."
mysql \
  --host="${DB_HOST}" \
  --user="${DB_USER}" \
  --password="${DB_PASSWORD}" \
  "${DB_NAME}" -e "SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema='${DB_NAME}';"
