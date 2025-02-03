variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region to deploy to"
  type        = string
  default     = "europe-west1"
}

variable "dns_zone_name" {
  description = "The name of the DNS zone in Cloud DNS that manages guskov.dev"
  type        = string
} 