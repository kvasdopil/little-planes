terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
  backend "gcs" {
    bucket = "little-planes-tf-state"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "services" {
  for_each = toset([
    "cloudbuild.googleapis.com",
    "storage.googleapis.com",
    "compute.googleapis.com",
    "dns.googleapis.com"
  ])
  service = each.key
  disable_on_destroy = false
}

# DNS zone for guskov.dev
data "google_dns_managed_zone" "guskov_dev" {
  name = var.dns_zone_name
}

# DNS record for planes.guskov.dev
resource "google_dns_record_set" "planes" {
  name         = "planes.${data.google_dns_managed_zone.guskov_dev.dns_name}"
  managed_zone = data.google_dns_managed_zone.guskov_dev.name
  type         = "A"
  ttl          = 300
  rrdatas      = [google_compute_global_address.default.address]

  depends_on = [google_compute_global_address.default]
}

# Create storage bucket for static website
resource "google_storage_bucket" "website" {
  name          = "planes-guskov-dev"
  location      = "EU"
  force_destroy = true

  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"
  }

  uniform_bucket_level_access = true
  
  cors {
    origin          = ["https://planes.guskov.dev"]
    method          = ["GET", "HEAD", "OPTIONS"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

# Make bucket public
resource "google_storage_bucket_iam_member" "public_read" {
  bucket = google_storage_bucket.website.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# Create HTTPS load balancer
resource "google_compute_global_address" "default" {
  name = "planes-guskov-dev-ip"
}

resource "google_compute_managed_ssl_certificate" "default" {
  name = "planes-guskov-dev-cert"
  managed {
    domains = ["planes.guskov.dev"]
  }
}

resource "google_compute_backend_bucket" "default" {
  name        = "planes-guskov-dev-backend"
  bucket_name = google_storage_bucket.website.name
  enable_cdn  = true
}

resource "google_compute_url_map" "default" {
  name            = "planes-guskov-dev-url-map"
  default_service = google_compute_backend_bucket.default.id
}

resource "google_compute_target_https_proxy" "default" {
  name             = "planes-guskov-dev-https-proxy"
  url_map          = google_compute_url_map.default.id
  ssl_certificates = [google_compute_managed_ssl_certificate.default.id]
}

resource "google_compute_global_forwarding_rule" "default" {
  name       = "planes-guskov-dev-forwarding-rule"
  target     = google_compute_target_https_proxy.default.id
  port_range = "443"
  ip_address = google_compute_global_address.default.address
}

# Output values
output "bucket_name" {
  value = google_storage_bucket.website.name
}

output "ip_address" {
  value = google_compute_global_address.default.address
}

output "dns_name" {
  value = google_dns_record_set.planes.name
} 