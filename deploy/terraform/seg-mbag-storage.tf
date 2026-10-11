data "oci_objectstorage_namespace" "current" {
  compartment_id = var.tenancy_ocid
}

resource "oci_objectstorage_bucket" "seg_mbag_documents" {
  compartment_id = oci_identity_compartment.monifit.id
  namespace      = data.oci_objectstorage_namespace.current.namespace
  name           = "seg-mbag-documents"
  access_type    = "NoPublicAccess"
  storage_tier   = "Standard"
  versioning     = "Enabled"

  lifecycle {
    prevent_destroy = true
  }
}

resource "oci_identity_dynamic_group" "seg_mbag_app" {
  compartment_id = var.tenancy_ocid
  name           = "seg-mbag-app"
  description    = "Oracle instance identity for the seg-mbag application"
  matching_rule  = "ALL {instance.id = '${oci_core_instance.monifit.id}'}"
}

resource "oci_identity_policy" "seg_mbag_documents" {
  compartment_id = var.tenancy_ocid
  name           = "seg-mbag-documents"
  description    = "Restrict seg-mbag to objects in its private document bucket"
  statements = [
    "Allow dynamic-group ${oci_identity_dynamic_group.seg_mbag_app.name} to manage objects in compartment id ${oci_identity_compartment.monifit.id} where target.bucket.name='${oci_objectstorage_bucket.seg_mbag_documents.name}'",
  ]
}
