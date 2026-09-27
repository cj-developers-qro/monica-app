#!/usr/bin/env bash
# Respaldo consistente de MoniFit: copia en caliente de la base SQLite (sin detener la app),
# verificación de integridad, imágenes subidas y, si está configurado, copia fuera del servidor
# en Cloudflare R2 (u otro destino de rclone).
#
# Variables (en /etc/monifit/monifit.env y /etc/monifit/respaldo.env):
#   DATA_DIR         carpeta de datos (por defecto /var/lib/monifit)
#   RESPALDOS_DIR    dónde guardar los respaldos locales (por defecto /var/backups/monifit)
#   RESPALDOS_LOCALES cuántos respaldos locales conservar (por defecto 14)
#   RCLONE_DESTINO   destino remoto, p. ej. "r2:monifit-respaldos" (opcional)
set -euo pipefail

DATA_DIR="${DATA_DIR:-/var/lib/monifit}"
RESPALDOS_DIR="${RESPALDOS_DIR:-/var/backups/monifit}"
CONSERVAR="${RESPALDOS_LOCALES:-14}"
BASE="$DATA_DIR/app-deportiva.db"
MARCA="$(date +%Y%m%d-%H%M%S)"
TRABAJO="$(mktemp -d)"
trap 'rm -rf "$TRABAJO"' EXIT

[ -f "$BASE" ] || { echo "No existe la base de datos en $BASE" >&2; exit 1; }
mkdir -p "$RESPALDOS_DIR"

# .backup usa la API de respaldo de SQLite: la copia es consistente aunque la app esté escribiendo.
sqlite3 "$BASE" ".backup '$TRABAJO/app-deportiva.db'"
RESULTADO="$(sqlite3 "$TRABAJO/app-deportiva.db" 'PRAGMA integrity_check;')"
[ "$RESULTADO" = "ok" ] || { echo "La copia no pasó la verificación de integridad: $RESULTADO" >&2; exit 1; }

mkdir -p "$TRABAJO/imagenes"
[ -d "$DATA_DIR/imagenes" ] && cp -a "$DATA_DIR/imagenes/." "$TRABAJO/imagenes/"

ARCHIVO="$RESPALDOS_DIR/monifit-$MARCA.tar.gz"
tar -czf "$ARCHIVO" -C "$TRABAJO" app-deportiva.db imagenes
echo "Respaldo local: $ARCHIVO ($(du -h "$ARCHIVO" | cut -f1))"

# Conserva solo los más recientes.
ls -1t "$RESPALDOS_DIR"/monifit-*.tar.gz 2>/dev/null | tail -n +"$((CONSERVAR + 1))" | xargs -r rm -f

if [ -n "${RCLONE_DESTINO:-}" ]; then
  rclone copyto "$ARCHIVO" "$RCLONE_DESTINO/$(basename "$ARCHIVO")"
  echo "Copia remota: $RCLONE_DESTINO/$(basename "$ARCHIVO")"
else
  echo "Aviso: RCLONE_DESTINO no está configurado; el respaldo solo quedó en este servidor." >&2
fi
