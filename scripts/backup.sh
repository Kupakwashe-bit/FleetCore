#!/bin/bash
# MotaLink Automated Encrypted Backup Script (Core Module 11)
# Schedule via crontab: 0 2 * * * /path/to/FleetCore/scripts/backup.sh

set -e

TIMESTAMP=$(date +"%Y-%m-%d_%H%M%S")
BACKUP_DIR="./backups"
BACKUP_FILE="${BACKUP_DIR}/motalink_backup_${TIMESTAMP}.sql.gz"
ENCRYPTED_FILE="${BACKUP_FILE}.gpg"
GPG_PASSPHRASE="motalink_secure_backup_key_2026"

mkdir -p ${BACKUP_DIR}

echo "[INFO] Starting PostgreSQL database dump for MotaLink..."
docker exec motalink_postgres pg_dump -U motalink -d motalink_db | gzip > ${BACKUP_FILE}

echo "[INFO] Encrypting database snapshot with GPG AES-256..."
gpg --batch --yes --symmetric --cipher-algo AES256 --passphrase "${GPG_PASSPHRASE}" --output ${ENCRYPTED_FILE} ${BACKUP_FILE}

# Remove unencrypted temporary file
rm -f ${BACKUP_FILE}

echo "[SUCCESS] Encrypted backup created successfully at: ${ENCRYPTED_FILE}"
