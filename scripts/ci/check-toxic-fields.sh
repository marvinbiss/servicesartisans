#!/usr/bin/env bash
# Guardrail 2: Toxic fields (trust_score, trust_badge, is_premium) must NOT
# appear in .ts/.tsx files outside src/types/legacy/** and known v1 legacy files.
# Legacy allowlist: scripts/ci/toxic-fields-allowlist.txt
set -euo pipefail

PATTERN='trust_score|trust_badge|is_premium'
EXIT_CODE=0
VIOLATIONS=()
ALLOWLIST_FILE="scripts/ci/toxic-fields-allowlist.txt"

# Load allowlist into an associative array for fast lookup
declare -A ALLOWED
if [ -f "$ALLOWLIST_FILE" ]; then
  while IFS= read -r entry; do
    # Skip empty lines and comments
    [[ -z "$entry" || "$entry" == \#* ]] && continue
    ALLOWED["$entry"]=1
  done < "$ALLOWLIST_FILE"
fi

while IFS= read -r file; do
  # Skip files inside the legacy types directory
  if [[ "$file" == src/types/legacy/* ]]; then
    continue
  fi
  # Skip node_modules, .next, dist
  if [[ "$file" == node_modules/* ]] || [[ "$file" == .next/* ]] || [[ "$file" == dist/* ]]; then
    continue
  fi
  # Skip test files (they may assert absence of toxic fields)
  if [[ "$file" == src/__tests__/* ]]; then
    continue
  fi
  # Skip allowlisted legacy files
  if [[ -n "${ALLOWED[$file]+x}" ]]; then
    continue
  fi

  matches=$(grep -nE "$PATTERN" "$file" 2>/dev/null || true)
  if [ -n "$matches" ]; then
    # Allow comments that explicitly guard against these fields
    while IFS= read -r line; do
      # Skip lines that are purely comments warning about toxic fields
      stripped=$(echo "$line" | sed 's/^[[:space:]]*[0-9]*://')
      if echo "$stripped" | grep -qE '^\s*(//|\*|/\*)'; then
        continue
      fi
      VIOLATIONS+=("$file:$line")
      EXIT_CODE=1
    done <<< "$matches"
  fi
done < <(find src -type f \( -name '*.ts' -o -name '*.tsx' \) ! -path 'src/types/legacy/*')

echo "=== Toxic Fields Guardrail ==="

if [ ${#VIOLATIONS[@]} -gt 0 ]; then
  echo "FAIL: ${#VIOLATIONS[@]} violation(s) found (trust_score/trust_badge/is_premium outside legacy):"
  for v in "${VIOLATIONS[@]}"; do
    echo "  - $v"
  done
else
  echo "PASS: No toxic fields found outside allowed legacy files"
fi

exit $EXIT_CODE
