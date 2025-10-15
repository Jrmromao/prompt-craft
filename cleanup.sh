#!/bin/bash

echo "🧹 Starting aggressive cleanup..."

# OLD PRODUCT - Prompt Library
echo "Removing old prompt library features..."
rm -rf app/prompts/
rm -rf app/templates/
rm -rf app/playground/
rm -rf app/community/
rm -rf app/community-prompts/
rm -rf app/hive/

# OVER-ENGINEERING
echo "Removing over-engineered features..."
rm -rf app/admin/
rm -rf app/support/
rm -rf app/blog/
rm -rf app/careers/
rm -rf app/about/
rm -rf app/contact/

# TEST/DEBUG PAGES
echo "Removing test pages..."
rm -rf app/test/
rm -rf app/account-test/
rm -rf app/auth-debug/
rm -rf app/complete-signup/
rm -rf app/unauthorized/

# UNUSED APIs
echo "Removing unused API routes..."
rm -rf app/api/prompts/
rm -rf app/api/templates/
rm -rf app/api/gamification/
rm -rf app/api/competitive/
rm -rf app/api/moderation/
rm -rf app/api/gdpr/
rm -rf app/api/credits/
rm -rf app/api/playground/
rm -rf app/api/forms/
rm -rf app/api/follow/
rm -rf app/api/community/
rm -rf app/api/moderated-words/
rm -rf app/api/jobs/
rm -rf app/api/cron/
rm -rf app/api/ai/
rm -rf app/api/admin/
rm -rf app/api/email-templates/
rm -rf app/api/plans/
rm -rf app/api/metrics/
rm -rf app/api/create-users/
rm -rf app/api/email-signup/
rm -rf app/api/audit/
rm -rf app/api/monitoring/
rm -rf app/api/runs/
rm -rf app/api/optimization/
rm -rf app/api/stripe/

# UNUSED DIRECTORIES
echo "Removing unused directories..."
rm -rf app/constants/
rm -rf app/components/profile/
rm -rf app/db/
rm -rf app/actions/
rm -rf app/services/
rm -rf app/onboarding/

# KEEP ONLY ANALYTICS ESSENTIALS
echo "✅ Cleanup complete!"
echo "Kept: dashboard, settings, pricing, auth, analytics APIs"
