#!/bin/bash
cd "$(dirname "$0")/.."
for dept in 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95; do
  echo "=== BATCH5: dept $dept ==="
  npx tsx scripts/rematch-pj.ts --dept "$dept"
done
echo "=== BATCH5 COMPLETE ==="
