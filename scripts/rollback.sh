#!/usr/bin/env bash
# ==============================================================================
# LEVIX Emergency Rollback Script
# ==============================================================================

set -euo pipefail

APP_DIR="/var/www/thelevix.com"
cd "${APP_DIR}"

echo "=========================================================="
echo "⚠️  LEVIX EMERGENCY ROLLBACK INITIATED"
echo "=========================================================="

echo "⏮️ Reverting git repository to previous release (HEAD@{1})..."
git reset --hard HEAD@{1}

echo "📦 Re-installing dependencies..."
npm ci

echo "🔨 Re-building previous stable Next.js bundle..."
npm run build

echo "🔄 Reloading PM2 workers..."
pm2 reload ecosystem.config.cjs

echo "🏥 Checking health..."
sleep 3
if curl -f http://127.0.0.1:3000/api/health; then
  echo "✅ Rollback verified! Application restored to previous stable state."
else
  echo "🚨 CRITICAL: Service still unhealthy. Immediate engineering intervention required."
  exit 1
fi
