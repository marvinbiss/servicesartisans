#!/usr/bin/env bash
# Run all CI guardrails. Exits with non-zero if any check fails.
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EXIT_CODE=0

echo "========================================"
echo "  ServicesArtisans CI Guardrails"
echo "========================================"
echo ""

for script in \
  "$SCRIPT_DIR/check-admin-auth.sh" \
  "$SCRIPT_DIR/check-toxic-fields.sh" \
  "$SCRIPT_DIR/check-fallback-urls.sh" \
  "$SCRIPT_DIR/check-build-artifacts.sh"
do
  if bash "$script"; then
    echo ""
  else
    EXIT_CODE=1
    echo ""
  fi
done

echo "========================================"
if [ $EXIT_CODE -eq 0 ]; then
  echo "  ALL GUARDRAILS PASSED"
else
  echo "  SOME GUARDRAILS FAILED"
fi
echo "========================================"

exit $EXIT_CODE
