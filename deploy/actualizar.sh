#!/usr/bin/env bash
# Publica la versión más reciente de GitHub: respalda, descarga, compila y reinicia.
#
#   sudo /opt/monifit/deploy/actualizar.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/monifit}"
USUARIO="${USUARIO_APP:-monifit}"
CLAVE="/etc/monifit/deploy_key"
como_app() { sudo -u "$USUARIO" -H env GIT_SSH_COMMAND="ssh -i $CLAVE -o IdentitiesOnly=yes" "$@"; }

echo "1/4 Respaldo previo…"
sudo -u "$USUARIO" bash -c "set -a; . /etc/monifit/monifit.env; [ -f /etc/monifit/respaldo.env ] && . /etc/monifit/respaldo.env; $APP_DIR/deploy/respaldar.sh" || {
  echo "El respaldo falló; no se actualiza." >&2
  exit 1
}

echo "2/4 Descargando cambios…"
como_app git -C "$APP_DIR" pull --ff-only

echo "3/4 Instalando dependencias y compilando…"
como_app bash -c "cd $APP_DIR && npm ci --no-audit --no-fund --fetch-retries=5 --fetch-retry-mintimeout=5000 && NEXT_TELEMETRY_DISABLED=1 npm run build && mkdir -p .next/cache"
# Por si cambió algún servicio en la nueva versión.
cp "$APP_DIR"/deploy/monifit*.service "$APP_DIR"/deploy/monifit*.timer /etc/systemd/system/ && systemctl daemon-reload
systemctl enable --now monifit-respaldo.timer monifit-recordatorio.timer >/dev/null

echo "4/4 Reiniciando…"
systemctl restart monifit
for _ in $(seq 1 30); do
  curl -fsS http://127.0.0.1:3000/salud >/dev/null 2>&1 && { echo "✓ MoniFit actualizada y en línea."; exit 0; }
  sleep 1
done
echo "La app no respondió en /salud; revisa: journalctl -u monifit -n 50" >&2
exit 1
