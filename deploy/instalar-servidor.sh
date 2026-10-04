#!/usr/bin/env bash
# Instala MoniFit en un servidor Ubuntu 24.04 (pensado para Oracle Cloud Always Free, ARM Ampere).
# Se puede volver a ejecutar sin riesgo: lo que ya existe se actualiza en lugar de duplicarse.
#
# Uso: copia este archivo al servidor (el repositorio es privado; ver README, "Publicar en la nube")
# y, como el usuario "ubuntu", ejecuta:
#
#   sudo bash instalar-servidor.sh
#   sudo CLOUDFLARE_TUNNEL_TOKEN=<token> bash instalar-servidor.sh   # para conectar el túnel
#
# Variables opcionales:
#   REPO                     repositorio (por defecto git@github.com:cj-developers-qro/monica-app.git)
#   RAMA                     rama a desplegar (por defecto main)
#   CLOUDFLARE_TUNNEL_TOKEN  token del túnel con nombre de Cloudflare
#   ORIGEN_LOCAL             (solo pruebas) carpeta local con el código en lugar de clonar de GitHub
set -euo pipefail

REPO="${REPO:-git@github.com:cj-developers-qro/monica-app.git}"
RAMA="${RAMA:-main}"
APP_DIR=/opt/monifit
DATA_DIR=/var/lib/monifit
RESPALDOS_DIR=/var/backups/monifit
CONF_DIR=/etc/monifit
USUARIO=monifit
CLAVE="$CONF_DIR/deploy_key"
NODE_MAYOR=24

paso() { printf '\n\033[1;35m▶ %s\033[0m\n' "$*"; }
aviso() { printf '\033[1;33m⚠ %s\033[0m\n' "$*"; }
hay_systemd() { [ -d /run/systemd/system ]; }
[ "$(id -u)" -eq 0 ] || { echo "Ejecuta con sudo: sudo bash $0" >&2; exit 1; }

paso "1. Paquetes del sistema"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq git curl ca-certificates gnupg sqlite3 rclone unattended-upgrades rsync >/dev/null
# Actualizaciones de seguridad automáticas.
echo 'APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";' > /etc/apt/apt.conf.d/20auto-upgrades

paso "2. Node.js $NODE_MAYOR"
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt "$NODE_MAYOR" ]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAYOR}.x" | bash - >/dev/null
  apt-get install -y -qq nodejs >/dev/null
fi
echo "Node $(node -v)"

paso "3. Memoria de intercambio (solo si el servidor tiene menos de 4 GB)"
MEM_MB=$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)
if [ "$MEM_MB" -lt 4000 ] && [ ! -f /swapfile ] && hay_systemd; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile >/dev/null && swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo "Se agregaron 2 GB de swap (RAM: ${MEM_MB} MB)."
else
  echo "RAM: ${MEM_MB} MB; no hace falta swap."
fi

paso "4. Usuario y carpetas"
id "$USUARIO" >/dev/null 2>&1 || useradd --system --create-home --home-dir /home/$USUARIO --shell /usr/sbin/nologin "$USUARIO"
install -d -o "$USUARIO" -g "$USUARIO" -m 700 "$DATA_DIR" "$DATA_DIR/imagenes"
install -d -o "$USUARIO" -g "$USUARIO" -m 700 "$RESPALDOS_DIR"
install -d -o root -g "$USUARIO" -m 750 "$CONF_DIR"
install -d -o "$USUARIO" -g "$USUARIO" -m 755 "$APP_DIR"

paso "5. Código de la aplicación"
if [ -n "${ORIGEN_LOCAL:-}" ]; then
  rsync -a --delete --exclude node_modules --exclude .next --exclude data --exclude .git "$ORIGEN_LOCAL/" "$APP_DIR/"
  chown -R "$USUARIO:$USUARIO" "$APP_DIR"
else
  if [ ! -f "$CLAVE" ]; then
    ssh-keygen -q -t ed25519 -N "" -C "monifit-servidor" -f "$CLAVE"
    chgrp "$USUARIO" "$CLAVE" && chmod 640 "$CLAVE"
  fi
  install -d -o "$USUARIO" -g "$USUARIO" -m 700 /home/$USUARIO/.ssh
  ssh-keyscan -t ed25519 github.com 2>/dev/null > /home/$USUARIO/.ssh/known_hosts
  chown "$USUARIO:$USUARIO" /home/$USUARIO/.ssh/known_hosts
  GIT_SSH="ssh -i $CLAVE -o IdentitiesOnly=yes"
  if ! sudo -u "$USUARIO" -H env GIT_SSH_COMMAND="$GIT_SSH" git ls-remote "$REPO" >/dev/null 2>&1; then
    aviso "El servidor todavía no tiene permiso para leer el repositorio privado."
    echo "Agrega esta clave como *Deploy key* (solo lectura) en GitHub:"
    echo "  https://github.com/cj-developers-qro/monica-app/settings/keys/new"
    echo
    cat "$CLAVE.pub"
    echo
    echo "Después vuelve a ejecutar: sudo bash $0"
    exit 2
  fi
  if [ -d "$APP_DIR/.git" ]; then
    sudo -u "$USUARIO" -H env GIT_SSH_COMMAND="$GIT_SSH" git -C "$APP_DIR" fetch -q origin "$RAMA"
    sudo -u "$USUARIO" -H git -C "$APP_DIR" checkout -q "$RAMA"
    sudo -u "$USUARIO" -H env GIT_SSH_COMMAND="$GIT_SSH" git -C "$APP_DIR" pull -q --ff-only
  else
    sudo -u "$USUARIO" -H env GIT_SSH_COMMAND="$GIT_SSH" git clone -q --branch "$RAMA" "$REPO" "$APP_DIR"
  fi
fi

paso "6. Configuración"
if [ ! -f "$CONF_DIR/monifit.env" ]; then
  cat > "$CONF_DIR/monifit.env" <<EOF_ENV
NODE_ENV=production
DATA_DIR=$DATA_DIR
RESPALDOS_DIR=$RESPALDOS_DIR
NEXT_TELEMETRY_DISABLED=1
EOF_ENV
fi
if [ ! -f "$CONF_DIR/respaldo.env" ]; then
  cat > "$CONF_DIR/respaldo.env" <<'EOF_R2'
# Copia de los respaldos fuera del servidor (Cloudflare R2). Completa y descomenta las 6 líneas;
# ver README, sección "Publicar en la nube → Respaldos en Cloudflare R2".
# RCLONE_DESTINO=r2:monifit-respaldos
# RCLONE_CONFIG_R2_TYPE=s3
# RCLONE_CONFIG_R2_PROVIDER=Cloudflare
# RCLONE_CONFIG_R2_ACCESS_KEY_ID=
# RCLONE_CONFIG_R2_SECRET_ACCESS_KEY=
# RCLONE_CONFIG_R2_ENDPOINT=https://<ID-de-cuenta>.r2.cloudflarestorage.com
EOF_R2
fi
chown root:"$USUARIO" "$CONF_DIR"/*.env && chmod 640 "$CONF_DIR"/*.env

paso "7. Dependencias y compilación (tarda unos minutos)"
sudo -u "$USUARIO" -H bash -c "cd $APP_DIR && npm ci --no-audit --no-fund --loglevel=error --fetch-retries=5 --fetch-retry-mintimeout=5000 && NEXT_TELEMETRY_DISABLED=1 npm run build >/dev/null"
install -d -o "$USUARIO" -g "$USUARIO" "$APP_DIR/.next/cache"
chmod +x "$APP_DIR"/deploy/*.sh
echo "Compilación lista."

paso "8. Servicios"
if hay_systemd; then
  cp "$APP_DIR"/deploy/monifit*.service "$APP_DIR"/deploy/monifit*.timer /etc/systemd/system/
  systemctl daemon-reload
  systemctl enable --now monifit monifit-respaldo.timer monifit-recordatorio.timer >/dev/null
  systemctl restart monifit
else
  aviso "Este sistema no usa systemd (¿contenedor de pruebas?); se omite la instalación de servicios."
fi

paso "9. Túnel de Cloudflare"
if ! command -v cloudflared >/dev/null; then
  install -d -m 0755 /usr/share/keyrings
  curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg -o /usr/share/keyrings/cloudflare-main.gpg
  echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main" \
    > /etc/apt/sources.list.d/cloudflared.list
  apt-get update -qq && apt-get install -y -qq cloudflared >/dev/null
fi
echo "cloudflared $(cloudflared --version 2>/dev/null | awk '{print $3}')"
if [ -n "${CLOUDFLARE_TUNNEL_TOKEN:-}" ]; then
  if hay_systemd && systemctl list-unit-files cloudflared.service >/dev/null 2>&1 && systemctl is-enabled cloudflared >/dev/null 2>&1; then
    echo "El túnel ya estaba instalado como servicio."
  elif hay_systemd; then
    cloudflared service install "$CLOUDFLARE_TUNNEL_TOKEN"
    echo "Túnel instalado como servicio."
  fi
elif hay_systemd && systemctl is-active --quiet cloudflared; then
  echo "✓ El túnel ya está instalado y activo."
else
  aviso "Falta CLOUDFLARE_TUNNEL_TOKEN: el túnel no se conectó todavía (ver README)."
fi

paso "10. Verificación"
if hay_systemd; then
  for _ in $(seq 1 30); do curl -fsS http://127.0.0.1:3000/salud >/dev/null 2>&1 && break; sleep 1; done
  if curl -fsS http://127.0.0.1:3000/salud >/dev/null 2>&1; then
    echo "✓ MoniFit responde en el servidor (http://127.0.0.1:3000/salud)."
  else
    aviso "MoniFit no respondió; revisa: journalctl -u monifit -n 50"
  fi
fi

cat <<FIN

Siguiente paso:
  • Si es un servidor nuevo, crea la cuenta de Moni o migra tus datos (ver README):
      sudo -u $USUARIO bash -c 'set -a; . $CONF_DIR/monifit.env; cd $APP_DIR && npm run admin -- correo@ejemplo.com Moni'
  • Configura los respaldos en R2 editando $CONF_DIR/respaldo.env
FIN
