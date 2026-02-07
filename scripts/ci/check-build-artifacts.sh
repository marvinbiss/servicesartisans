#!/usr/bin/env bash
# Guardrail 4: No *.tsbuildinfo files should be committed to git.
# Also verifies .gitignore contains the exclusion pattern.
set -euo pipefail

EXIT_CODE=0

echo "=== Build Artifacts Guardrail ==="

# Check 1: No committed .tsbuildinfo files
COMMITTED=$(git ls-files '*.tsbuildinfo' 2>/dev/null || true)
if [ -n "$COMMITTED" ]; then
  echo "FAIL: *.tsbuildinfo file(s) committed to git:"
  echo "$COMMITTED" | while IFS= read -r f; do echo "  - $f"; done
  EXIT_CODE=1
else
  echo "PASS: No *.tsbuildinfo files in git index"
fi

# Check 2: .gitignore contains the pattern
if [ -f ".gitignore" ]; then
  if grep -qE '^\*\.tsbuildinfo$' .gitignore; then
    echo "PASS: .gitignore contains *.tsbuildinfo"
  else
    echo "FAIL: .gitignore is missing *.tsbuildinfo pattern"
    EXIT_CODE=1
  fi
else
  echo "FAIL: .gitignore file not found"
  EXIT_CODE=1
fi

exit $EXIT_CODE
