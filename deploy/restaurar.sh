#!/usr/bin/env bash
# Restaura MoniFit desde un respaldo (.tar.gz creado por respaldar.sh o migrar-datos.sh).
# Antes de reemplazar, guarda una copia de los datos actuales.
#
#   sudo /opt/monifit/deploy/restaurar.sh /var/backups/monifit/monifit-AAAAMMDD-HHMMSS.tar.gz
#   (para bajar uno de R2: rclone copy r2:monifit-respaldos/<archivo> /tmp/)
set -euo pipefail

ARCHIVO="${1:?Uso: restaurar.sh <respaldo.tar.gz>}"
DATA_DIR="${DATA_DIR:-/var/lib/monifit}"
USUARIO="${USUARIO_APP:-monifit}"
[ -f "$ARCHIVO" ] || { echo "No existe $ARCHIVO" >&2; exit 1; }

TRABAJO="$(mktemp -d)"
trap 'rm -rf "$TRABAJO"' EXIT
tar -xzf "$ARCHIVO" -C "$TRABAJO"
[ -f "$TRABAJO/app-deportiva.db" ] || { echo "El respaldo no contiene app-deportiva.db" >&2; exit 1; }
RESULTADO="$(sqlite3 "$TRABAJO/app-deportiva.db" 'PRAGMA integrity_check;')"
[ "$RESULTADO" = "ok" ] || { echo "El respaldo está dañado: $RESULTADO" >&2; exit 1; }

hay_systemd() { [ -d /run/systemd/system ]; }
hay_systemd && systemctl stop monifit

if [ -f "$DATA_DIR/app-deportiva.db" ]; then
  ANTERIOR="$DATA_DIR.antes-de-restaurar-$(date +%Y%m%d-%H%M%S)"
  cp -a "$DATA_DIR" "$ANTERIOR"
  echo "Datos anteriores guardados en $ANTERIOR"
fi

mkdir -p "$DATA_DIR/imagenes"
rm -f "$DATA_DIR/app-deportiva.db" "$DATA_DIR/app-deportiva.db-wal" "$DATA_DIR/app-deportiva.db-shm"
cp "$TRABAJO/app-deportiva.db" "$DATA_DIR/app-deportiva.db"
[ -d "$TRABAJO/imagenes" ] && cp -a "$TRABAJO/imagenes/." "$DATA_DIR/imagenes/"
chown -R "$USUARIO:$USUARIO" "$DATA_DIR"
chmod 700 "$DATA_DIR"

hay_systemd && systemctl start monifit
echo "Restauración terminada desde $ARCHIVO"
