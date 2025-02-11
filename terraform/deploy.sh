#!/bin/bash
set -e

# Get project ID from gcloud config
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
  echo "Error: No project ID configured. Please run: gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

# Hardcoded DNS zone name for guskov.dev
DNS_ZONE_NAME="guskov-dev"

# Build the React application
echo "Building React application..."
npm run build

# Initialize and apply Terraform
echo "Initializing Terraform..."
terraform init

echo "Applying Terraform configuration..."
terraform apply -auto-approve \
  -var="project_id=$PROJECT_ID" \
  -var="dns_zone_name=$DNS_ZONE_NAME"

# Get the bucket name from Terraform output
BUCKET_NAME=$(terraform output -raw bucket_name)

# Upload the built files to the bucket
echo "Uploading files to GCS bucket..."
gsutil -m cp -r ../dist/* gs://$BUCKET_NAME/

echo "Deployment complete!"
echo "DNS record has been created automatically in your Cloud DNS zone."
echo "The website will be available at: $(terraform output -raw dns_name)"
echo "Note: It may take up to 24 hours for the SSL certificate to be provisioned." 