#!/usr/bin/env bash
# ==============================================================================
# LEVIX Zero-Downtime Deployment Script (Hostinger VPS)
# ==============================================================================

set -euo pipefail

APP_DIR="/var/www/thelevix.com"
cd "${APP_DIR}"

echo "=========================================================="
echo "🚀 LEVIX STREETWEAR - PRODUCTION DEPLOYMENT"
echo "=========================================================="
echo "Time: $(date)"

# 1. Fetch latest release from git
echo "📥 1/5 Pulling latest code from origin/main..."
git fetch origin main
git reset --hard origin/main

# 2. Install production dependencies
echo "📦 2/5 Installing dependencies..."
npm ci

# 3. Database migrations
echo "🗄️ 3/5 Running Prisma database migrations..."
npx prisma generate
npx prisma migrate deploy

# 4. Build optimized Next.js assets
echo "🔨 4/5 Building Next.js production bundle..."
npm run build

# 5. Reload PM2 cluster
echo "🔄 5/5 Reloading PM2 workers in zero-downtime cluster mode..."
pm2 reload ecosystem.config.cjs --update-env

# 6. Post-deploy healthcheck
echo "🏥 Probing healthcheck endpoint at http://127.0.0.1:3000/api/health..."
sleep 3
if curl -f http://127.0.0.1:3000/api/health; then
  echo -e "\n\n🎉 DEPLOYMENT SUCCESSFUL! Next.js cluster is serving live traffic."
else
  echo -e "\n\n❌ HEALTHCHECK FAILED! Triggering automated rollback..."
  ./scripts/rollback.sh
  exit 1
fi
