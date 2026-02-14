#!/bin/bash
# Crawl the 6 missing PJ trades sequentially
# Each trade × 101 departments = 101 combos × ~5 pages × 5 credits = ~2.5k credits/trade
cd "$(dirname "$0")/.."

TRADES="electriciens chauffagistes menuisiers macons peintres carreleurs"

for trade in $TRADES; do
  echo ""
  echo "========================================"
  echo "  CRAWLING: $trade"
  echo "========================================"
  npx tsx scripts/enrich-phone.ts --fetch --trade "$trade"
  echo "  Done: $trade"
done

echo ""
echo "========================================"
echo "  ALL 6 TRADES COMPLETE"
echo "========================================"
