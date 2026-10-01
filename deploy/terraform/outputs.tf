output "ip_publica" {
  value = oci_core_instance.monifit.public_ip
}

output "ssh" {
  value = "ssh -i ~/.oci/ssh/monifit ubuntu@${oci_core_instance.monifit.public_ip}"
}

output "token_tunel" {
  value     = data.cloudflare_zero_trust_tunnel_cloudflared_token.monifit.token
  sensitive = true
}
