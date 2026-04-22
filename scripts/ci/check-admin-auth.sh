#!/usr/bin/env bash
# Guardrail 1: Every admin API route must authenticate via one of:
#   - verifyAdmin() / requirePermission() — admin session
#   - verify<Provider>Signature() — webhook signature (Twilio HMAC, Resend, etc.)
# Both mechanisms live in @/lib/admin-auth or @/lib/prospection/webhook-security.
# Scans src/app/api/admin/**/route.ts for a valid invocation.
set -euo pipefail

ADMIN_DIR="src/app/api/admin"
EXIT_CODE=0
CHECKED=0
FAILED_FILES=()

if [ ! -d "$ADMIN_DIR" ]; then
  echo "SKIP: $ADMIN_DIR does not exist"
  exit 0
fi

while IFS= read -r file; do
  CHECKED=$((CHECKED + 1))
  if ! grep -qE 'verifyAdmin|requirePermission|verify[A-Z][A-Za-z]*Signature' "$file"; then
    FAILED_FILES+=("$file")
    EXIT_CODE=1
  fi
done < <(find "$ADMIN_DIR" -name 'route.ts' -type f)

echo "=== Admin Auth Guardrail ==="
echo "Checked: $CHECKED route files"

if [ ${#FAILED_FILES[@]} -gt 0 ]; then
  echo "FAIL: ${#FAILED_FILES[@]} route(s) missing verifyAdmin()/requirePermission():"
  for f in "${FAILED_FILES[@]}"; do
    echo "  - $f"
  done
else
  echo "PASS: All admin routes contain verifyAdmin() or requirePermission()"
fi

exit $EXIT_CODE
