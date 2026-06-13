#!/usr/bin/env bash
#
# Full export (dump) of the local PostgreSQL dev database `friends_journey_dev`.
#
# Postgres.app ships its own binaries that are NOT on PATH, so we call pg_dump
# by absolute path. The connection string mirrors apps/api/.env.
#
# Usage:
#   ./scripts/db-export.sh                # writes dumps/friends_journey_dev_<timestamp>.{sql,dump}
#   DB_URL=postgresql://user@host/db ./scripts/db-export.sh
#
set -euo pipefail

PG_BIN="/Applications/Postgres.app/Contents/Versions/latest/bin"
DB_URL="${DB_URL:-postgresql://grigoriyandreevich@localhost:5432/friends_journey_dev}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${OUT_DIR:-$ROOT_DIR/dumps}"
mkdir -p "$OUT_DIR"

STAMP="$(date +%Y%m%d_%H%M%S)"
BASENAME="friends_journey_dev_${STAMP}"

# 1) Plain-text SQL — human-readable, restore with psql.
"$PG_BIN/pg_dump" "$DB_URL" \
  --no-owner --no-privileges \
  --file "$OUT_DIR/${BASENAME}.sql"

# 2) Custom format — compressed, restore selectively with pg_restore.
"$PG_BIN/pg_dump" "$DB_URL" \
  --format=custom --no-owner --no-privileges \
  --file "$OUT_DIR/${BASENAME}.dump"

echo "Exported:"
echo "  $OUT_DIR/${BASENAME}.sql"
echo "  $OUT_DIR/${BASENAME}.dump"
echo
echo "Restore (plain SQL):   $PG_BIN/psql \"\$DB_URL\" -f $OUT_DIR/${BASENAME}.sql"
echo "Restore (custom):      $PG_BIN/pg_restore --no-owner --clean --if-exists -d \"\$DB_URL\" $OUT_DIR/${BASENAME}.dump"
