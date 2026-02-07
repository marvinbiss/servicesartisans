#!/usr/bin/env bash
# Guardrail 3: Fallback URL patterns are forbidden in public routes and sitemap.
# Detects: stable_id || slug, stable_id || id, slug || id
# These patterns indicate unsafe URL generation fallbacks.
set -euo pipefail

EXIT_CODE=0
VIOLATIONS=()

# Patterns to detect (with flexible whitespace)
PATTERNS=(
  'stable_id\s*\|\|\s*slug'
  'stable_id\s*\|\|\s*id'
  'slug\s*\|\|\s*id'
)

# Directories/files to scan
SCAN_PATHS=()
[ -d "src/app/(public)" ] && SCAN_PATHS+=("src/app/(public)")
[ -f "src/app/sitemap.ts" ] && SCAN_PATHS+=("src/app/sitemap.ts")
[ -f "src/app/sitemap.tsx" ] && SCAN_PATHS+=("src/app/sitemap.tsx")

# Also scan any sitemap-related files
while IFS= read -r f; do
  SCAN_PATHS+=("$f")
done < <(find src/app -maxdepth 1 -name 'sitemap*' -type f 2>/dev/null || true)

if [ ${#SCAN_PATHS[@]} -eq 0 ]; then
  echo "=== Fallback URL Guardrail ==="
  echo "SKIP: No public routes or sitemap files found"
  exit 0
fi

for pattern in "${PATTERNS[@]}"; do
  while IFS= read -r match; do
    if [ -n "$match" ]; then
      VIOLATIONS+=("$match")
      EXIT_CODE=1
    fi
  done < <(grep -rnE "$pattern" "${SCAN_PATHS[@]}" 2>/dev/null || true)
done

echo "=== Fallback URL Guardrail ==="

if [ ${#VIOLATIONS[@]} -gt 0 ]; then
  echo "FAIL: ${#VIOLATIONS[@]} forbidden fallback pattern(s) in public/sitemap:"
  for v in "${VIOLATIONS[@]}"; do
    echo "  - $v"
  done
else
  echo "PASS: No fallback URL patterns found in public routes or sitemap"
fi

exit $EXIT_CODE
