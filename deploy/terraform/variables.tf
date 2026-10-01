variable "tenancy_ocid" {
  type = string
}

variable "region" {
  type    = string
  default = "mx-queretaro-1"
}

variable "ssh_cidr" {
  description = "Única red desde la que se acepta SSH (tu IP pública /32)."
  type        = string
  validation {
    condition     = can(cidrhost(var.ssh_cidr, 0)) && var.ssh_cidr != "0.0.0.0/0"
    error_message = "Indica una red concreta; SSH abierto a todo Internet no se permite."
  }
}

variable "ssh_llave_publica" {
  type    = string
  default = "~/.oci/ssh/monifit.pub"
}

# Servidor de MoniFit dentro de la capa gratuita de la cuenta (los topes de la cuenta los fija
# integracentro-core/infra/terraform/oracle: 4 núcleos, 24 GB y 200 GB en total).
variable "nucleos" {
  type    = number
  default = 1
}

variable "memoria_gb" {
  type    = number
  default = 6
}

variable "disco_gb" {
  type    = number
  default = 50
}

# Cloudflare: cuenta y zona moni-fit.com
variable "cloudflare_account_id" {
  type    = string
  default = "b6fa2d91767198d468c70b72fab87910"
}

variable "zona_id" {
  description = "Zona moni-fit.com"
  type        = string
  default     = "52ca86702187d93b3f4f2a89d4fa9579"
}

variable "dominio" {
  type    = string
  default = "moni-fit.com"
}

# false: el túnel existe pero el DNS sigue apuntando al sitio anterior. true: moni-fit.com y www
# apuntan al túnel (antes hay que quitar los registros web anteriores; ver README.md).
variable "publicar_dns" {
  type    = bool
  default = false
}
