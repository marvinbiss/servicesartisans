#!/bin/bash
cd "$(dirname "$0")/.."
for dept in 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59; do
  echo "=== BATCH3: dept $dept ==="
  npx tsx scripts/rematch-pj.ts --dept "$dept"
done
echo "=== BATCH3 COMPLETE ==="
