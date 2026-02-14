#!/bin/bash
cd "$(dirname "$0")/.."
for dept in 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19; do
  echo "=== BATCH1: dept $dept ==="
  npx tsx scripts/rematch-pj.ts --dept "$dept"
done
echo "=== BATCH1 COMPLETE ==="
