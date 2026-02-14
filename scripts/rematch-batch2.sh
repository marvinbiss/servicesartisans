#!/bin/bash
cd "$(dirname "$0")/.."
for dept in 2A 2B 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39; do
  echo "=== BATCH2: dept $dept ==="
  npx tsx scripts/rematch-pj.ts --dept "$dept"
done
echo "=== BATCH2 COMPLETE ==="
