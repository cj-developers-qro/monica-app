terraform {
  required_version = ">= 1.6"
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 7.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
  # Estado fuera del repositorio (identificadores de la cuenta y secreto del túnel):
  # terraform init -backend-config="path=$HOME/.monifit/terraform/monifit.tfstate"
  backend "local" {}
}

# Oracle: perfil DEFAULT de ~/.oci/config. Cloudflare: CLOUDFLARE_API_TOKEN (ver deploy/terraform/README.md).
provider "oci" {
  config_file_profile = "DEFAULT"
  region              = var.region
}

provider "cloudflare" {}
