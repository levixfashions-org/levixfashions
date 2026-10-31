#!/usr/bin/env bash
# ==============================================================================
# LEVIX Automated Daily MySQL Backup Script
# Schedule via cron: 0 2 * * * /var/www/thelevix.com/scripts/backup-db.sh
# ==============================================================================

set -euo pipefail

BACKUP_DIR="/var/backups/mysql/levix"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/levix_db_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=14

# Load environment variables from .env if present
if [ -f "/var/www/thelevix.com/.env" ]; then
  export $(grep -v '^#' /var/www/thelevix.com/.env | xargs)
fi

DB_USER="${MYSQL_USER:-levix_prod_user}"
DB_PASSWORD="${MYSQL_PASSWORD:-}"
DB_NAME="${MYSQL_DATABASE:-levix_db}"
DB_HOST="${MYSQL_HOST:-localhost}"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting MySQL backup for database: ${DB_NAME}..."

# Execute atomic single-transaction dump with gzip compression
mysqldump \
  --host="${DB_HOST}" \
  --user="${DB_USER}" \
  --password="${DB_PASSWORD}" \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  "${DB_NAME}" | gzip -9 > "${BACKUP_FILE}"

echo "[$(date)] Backup successfully generated at: ${BACKUP_FILE}"
echo "[$(date)] Size: $(du -h "${BACKUP_FILE}" | cut -f1)"

# Prune local backups older than 14 days
echo "[$(date)] Purging backup archives older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "levix_db_*.sql.gz" -mtime +"${RETENTION_DAYS}" -delete

# (Optional) Off-site sync to secondary server or cloud storage
if [ -n "${BACKUP_REMOTE_DESTINATION:-}" ]; then
  echo "[$(date)] Syncing archive off-site to ${BACKUP_REMOTE_DESTINATION}..."
  rsync -avz -e ssh "${BACKUP_FILE}" "${BACKUP_REMOTE_DESTINATION}"
fi

echo "[$(date)] Backup maintenance routine finished successfully."
