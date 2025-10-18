#!/bin/bash

# Setup automated pricing updates
# This script sets up a cron job to run the pricing scraper daily

echo "Setting up automated pricing updates..."

# Get the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Create the cron job entry
CRON_ENTRY="0 2 * * * cd $PROJECT_DIR && npx tsx scripts/update-pricing.ts >> /var/log/pricing-update.log 2>&1"

# Add to crontab
(crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -

echo "✅ Cron job added successfully!"
echo "📅 Pricing will be updated daily at 2:00 AM"
echo "📝 Logs will be saved to /var/log/pricing-update.log"
echo ""
echo "To view current cron jobs: crontab -l"
echo "To remove this cron job: crontab -e"
