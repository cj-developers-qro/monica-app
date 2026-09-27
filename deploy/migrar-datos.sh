#!/usr/bin/env bash
# Lleva los datos de MoniFit de esta computadora al servidor: copia consistente de la base,
# imágenes, envío por SSH y restauración (el servidor guarda antes una copia de lo que tuviera).
#
#   ./deploy/migrar-datos.sh ubuntu@<IP-del-servidor> [carpeta-de-datos]   (por defecto ./data)
#
# Conviene detener la app local antes (o no usarla durante la migración).
set -euo pipefail

DESTINO="${1:?Uso: migrar-datos.sh ubuntu@IP [carpeta-de-datos]}"
DATOS="${2:-data}"
LLAVE_SSH="${LLAVE_SSH:-}"
BASE="$DATOS/app-deportiva.db"
[ -f "$BASE" ] || { echo "No encuentro $BASE" >&2; exit 1; }
SSH_OPC=(); [ -n "$LLAVE_SSH" ] && SSH_OPC=(-i "$LLAVE_SSH")

TRABAJO="$(mktemp -d)"
trap 'rm -rf "$TRABAJO"' EXIT

echo "1/3 Copia consistente de la base de datos…"
sqlite3 "$BASE" ".backup '$TRABAJO/app-deportiva.db'"
[ "$(sqlite3 "$TRABAJO/app-deportiva.db" 'PRAGMA integrity_check;')" = "ok" ] || { echo "La copia no pasó la verificación" >&2; exit 1; }
mkdir -p "$TRABAJO/imagenes"
[ -d "$DATOS/imagenes" ] && cp -R "$DATOS/imagenes/." "$TRABAJO/imagenes/"
ARCHIVO="monifit-migracion-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$TRABAJO/$ARCHIVO" -C "$TRABAJO" app-deportiva.db imagenes
echo "   $(sqlite3 "$TRABAJO/app-deportiva.db" 'SELECT COUNT(*) FROM clientes') clientes, $(sqlite3 "$TRABAJO/app-deportiva.db" 'SELECT COUNT(*) FROM usuarios') usuarios."

echo "2/3 Enviando al servidor…"
scp "${SSH_OPC[@]}" -q "$TRABAJO/$ARCHIVO" "$DESTINO:/tmp/$ARCHIVO"

echo "3/3 Restaurando en el servidor…"
ssh "${SSH_OPC[@]}" -t "$DESTINO" "sudo /opt/monifit/deploy/restaurar.sh /tmp/$ARCHIVO && rm -f /tmp/$ARCHIVO"
echo "✓ Migración terminada."
