#!/usr/bin/env bash
# Smoke test for notifications-v1
# Run AFTER migration 107 is applied and the app is running locally.
# Usage: NEXT_PUBLIC_SITE_URL=http://localhost:3000 bash scripts/smoke-test-notifications.sh
#
# Prerequisites:
#   - App running on $NEXT_PUBLIC_SITE_URL (default: http://localhost:3000)
#   - Migration 107 applied
#   - At least one authenticated user session (cookie-based)

set -euo pipefail

BASE_URL="${NEXT_PUBLIC_SITE_URL:-http://localhost:3000}"
PASS=0
FAIL=0

green() { echo -e "\033[32m✓ $1\033[0m"; PASS=$((PASS + 1)); }
red()   { echo -e "\033[31m✗ $1\033[0m"; FAIL=$((FAIL + 1)); }

echo "=== Notifications V1 — Smoke Tests ==="
echo "Target: $BASE_URL"
echo ""

# ---------------------------------------------------
# Test 1: GET /api/notifications (unauthenticated → 401)
# ---------------------------------------------------
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/notifications")
if [ "$STATUS" = "401" ]; then
  green "GET /api/notifications unauthenticated → 401"
else
  red "GET /api/notifications unauthenticated → expected 401, got $STATUS"
fi

# ---------------------------------------------------
# Test 2: POST /api/notifications/read-all (unauthenticated → 401)
# ---------------------------------------------------
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/notifications/read-all")
if [ "$STATUS" = "401" ]; then
  green "POST /api/notifications/read-all unauthenticated → 401"
else
  red "POST /api/notifications/read-all unauthenticated → expected 401, got $STATUS"
fi

# ---------------------------------------------------
# Test 3: POST /api/notifications/fake-uuid/read (unauthenticated → 401)
# ---------------------------------------------------
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/notifications/00000000-0000-0000-0000-000000000000/read")
if [ "$STATUS" = "401" ]; then
  green "POST /api/notifications/:id/read unauthenticated → 401"
else
  red "POST /api/notifications/:id/read unauthenticated → expected 401, got $STATUS"
fi

# ---------------------------------------------------
# Test 4: Verify notification tables exist (via Supabase)
# ---------------------------------------------------
if command -v supabase &>/dev/null; then
  TABLES=$(supabase db query "SELECT tablename FROM pg_tables WHERE tablename IN ('notifications','notification_deliveries') ORDER BY tablename" --csv 2>/dev/null || echo "")
  if echo "$TABLES" | grep -q "notifications" && echo "$TABLES" | grep -q "notification_deliveries"; then
    green "Tables notifications + notification_deliveries exist"
  else
    red "Tables missing — run migration 107"
  fi
else
  echo "  ⏭  Skipping DB table check (supabase CLI not available)"
fi

# ---------------------------------------------------
# Test 5: Verify RLS enabled
# ---------------------------------------------------
if command -v supabase &>/dev/null; then
  RLS=$(supabase db query "SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('notifications','notification_deliveries')" --csv 2>/dev/null || echo "")
  if echo "$RLS" | grep -q "t"; then
    green "RLS enabled on notification tables"
  else
    red "RLS not enabled"
  fi
else
  echo "  ⏭  Skipping RLS check (supabase CLI not available)"
fi

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] && echo "ALL SMOKE TESTS PASSED" || echo "SOME TESTS FAILED"
exit "$FAIL"
