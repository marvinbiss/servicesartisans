#!/bin/bash
cd "$(dirname "$0")/.."
for dept in 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77; do
  echo "=== BATCH4: dept $dept ==="
  npx tsx scripts/rematch-pj.ts --dept "$dept"
done
echo "=== BATCH4 COMPLETE ==="
