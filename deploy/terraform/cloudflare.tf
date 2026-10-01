# Túnel de Cloudflare: moni-fit.com y www.moni-fit.com -> MoniFit en el servidor (127.0.0.1:3000).
# cloudflared corre como servicio en el servidor con el token (deploy/instalar-servidor.sh).
resource "random_bytes" "secreto_tunel" {
  length = 32
}

resource "cloudflare_zero_trust_tunnel_cloudflared" "monifit" {
  account_id    = var.cloudflare_account_id
  name          = "monifit"
  config_src    = "cloudflare"
  tunnel_secret = random_bytes.secreto_tunel.base64
}

resource "cloudflare_zero_trust_tunnel_cloudflared_config" "monifit" {
  account_id = var.cloudflare_account_id
  tunnel_id  = cloudflare_zero_trust_tunnel_cloudflared.monifit.id
  config = {
    ingress = [
      { hostname = var.dominio, service = "http://127.0.0.1:3000" },
      { hostname = "www.${var.dominio}", service = "http://127.0.0.1:3000" },
      { service = "http_status:404" },
    ]
  }
}

# Solo los registros web. Los del correo de GoDaddy (MX, SPF, DMARC, DKIM, email, autodiscover) no se tocan.
resource "cloudflare_dns_record" "web" {
  for_each = var.publicar_dns ? toset([var.dominio, "www.${var.dominio}"]) : toset([])
  zone_id  = var.zona_id
  name     = each.value
  type     = "CNAME"
  content  = "${cloudflare_zero_trust_tunnel_cloudflared.monifit.id}.cfargotunnel.com"
  proxied  = true
  ttl      = 1
  comment  = "MoniFit · Cloudflare Tunnel, administrado con Terraform"
}

data "cloudflare_zero_trust_tunnel_cloudflared_token" "monifit" {
  account_id = var.cloudflare_account_id
  tunnel_id  = cloudflare_zero_trust_tunnel_cloudflared.monifit.id
}
