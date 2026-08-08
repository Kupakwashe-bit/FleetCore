#!/bin/bash
# MotaLink Disaster Recovery Restore Procedure (Core Module 11)
# Usage: ./scripts/restore.sh ./backups/motalink_backup_YYYY-MM-DD.sql.gz.gpg

set -e

ENCRYPTED_FILE=$1
GPG_PASSPHRASE="motalink_secure_backup_key_2026"
TEMP_RESTORE="./backups/temp_restore.sql.gz"

if [ -z "$ENCRYPTED_FILE" ]; then
  echo "[ERROR] Please provide path to encrypted backup file."
  echo "Usage: ./scripts/restore.sh <path_to_encrypted_file.gpg>"
  exit 1
fi

echo "[INFO] Decrypting backup file..."
gpg --batch --yes --decrypt --passphrase "${GPG_PASSPHRASE}" --output ${TEMP_RESTORE} ${ENCRYPTED_FILE}

echo "[INFO] Restoring database to PostgreSQL Docker container..."
gunzip -c ${TEMP_RESTORE} | docker exec -i motalink_postgres psql -U motalink -d motalink_db

# Clean up decrypted temporary file
rm -f ${TEMP_RESTORE}

echo "[SUCCESS] Disaster Recovery Restore completed successfully!"
