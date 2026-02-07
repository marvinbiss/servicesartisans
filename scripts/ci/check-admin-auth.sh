#!/usr/bin/env bash
# Guardrail 1: Every admin API route must call verifyAdmin() or requirePermission()
# Both functions live in @/lib/admin-auth and enforce authentication.
# Scans src/app/api/admin/**/route.ts for either invocation.
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
  if ! grep -qE 'verifyAdmin|requirePermission' "$file"; then
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
