resource "oci_identity_compartment" "monifit" {
  compartment_id = var.tenancy_ocid
  name           = "monifit"
  description    = "MoniFit"
  enable_delete  = true
}

resource "oci_core_vcn" "monifit" {
  compartment_id = oci_identity_compartment.monifit.id
  display_name   = "monifit"
  cidr_blocks    = ["10.20.0.0/16"]
  dns_label      = "monifit"
}

resource "oci_core_internet_gateway" "monifit" {
  compartment_id = oci_identity_compartment.monifit.id
  vcn_id         = oci_core_vcn.monifit.id
  display_name   = "salida-internet"
}

resource "oci_core_route_table" "monifit" {
  compartment_id = oci_identity_compartment.monifit.id
  vcn_id         = oci_core_vcn.monifit.id
  display_name   = "salida-internet"
  route_rules {
    destination       = "0.0.0.0/0"
    network_entity_id = oci_core_internet_gateway.monifit.id
  }
}

# Solo SSH desde tu IP; la web entra por el túnel de Cloudflare (conexión saliente)
resource "oci_core_security_list" "monifit" {
  compartment_id = oci_identity_compartment.monifit.id
  vcn_id         = oci_core_vcn.monifit.id
  display_name   = "solo-ssh"

  egress_security_rules {
    destination = "0.0.0.0/0"
    protocol    = "all"
  }

  ingress_security_rules {
    source   = var.ssh_cidr
    protocol = "6"
    tcp_options {
      min = 22
      max = 22
    }
  }

  ingress_security_rules {
    source   = "0.0.0.0/0"
    protocol = "1"
    icmp_options {
      type = 3
      code = 4
    }
  }
}

resource "oci_core_subnet" "monifit" {
  compartment_id    = oci_identity_compartment.monifit.id
  vcn_id            = oci_core_vcn.monifit.id
  display_name      = "servidores"
  cidr_block        = "10.20.1.0/24"
  dns_label         = "servidores"
  route_table_id    = oci_core_route_table.monifit.id
  security_list_ids = [oci_core_security_list.monifit.id]
}

data "oci_identity_availability_domains" "ad" {
  compartment_id = var.tenancy_ocid
}

data "oci_core_images" "ubuntu" {
  compartment_id           = var.tenancy_ocid
  operating_system         = "Canonical Ubuntu"
  operating_system_version = "24.04"
  shape                    = "VM.Standard.A1.Flex"
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}

resource "oci_core_instance" "monifit" {
  compartment_id      = oci_identity_compartment.monifit.id
  availability_domain = data.oci_identity_availability_domains.ad.availability_domains[0].name
  display_name        = "monifit"
  shape               = "VM.Standard.A1.Flex"

  shape_config {
    ocpus         = var.nucleos
    memory_in_gbs = var.memoria_gb
  }

  source_details {
    source_type             = "image"
    source_id               = data.oci_core_images.ubuntu.images[0].id
    boot_volume_size_in_gbs = var.disco_gb
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.monifit.id
    assign_public_ip = true
    hostname_label   = "monifit"
  }

  metadata = {
    ssh_authorized_keys = file(pathexpand(var.ssh_llave_publica))
  }

  lifecycle {
    ignore_changes = [source_details[0].source_id]
  }
}
