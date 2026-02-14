#!/bin/bash
# Crawl 15 bonus PJ trade keywords sequentially
cd "$(dirname "$0")/.."

TRADES="climatisation paysagistes terrassement vitriers renovation depannage sdb etancheite demolition assainissement domotique ramonage parquets stores portails"

for trade in $TRADES; do
  echo ""
  echo "========================================"
  echo "  CRAWLING BONUS: $trade"
  echo "========================================"
  npx tsx scripts/enrich-phone.ts --fetch --trade "$trade"
  echo "  Done: $trade"
done

echo ""
echo "========================================"
echo "  ALL 15 BONUS TRADES COMPLETE"
echo "========================================"
