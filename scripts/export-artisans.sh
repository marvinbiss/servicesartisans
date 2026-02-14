#!/bin/bash
# Export all artisans from Supabase to local JSONL cache
# Uses curl (fast, reliable) instead of Node.js fetch

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CACHE_FILE="$SCRIPT_DIR/.enrich-data/artisans-cache.jsonl"
TEMP_FILE="$SCRIPT_DIR/.enrich-data/artisans-raw.json"

# Read env
source "$SCRIPT_DIR/../.env.local" 2>/dev/null || true
URL="${NEXT_PUBLIC_SUPABASE_URL}"
KEY="${SUPABASE_SERVICE_ROLE_KEY}"

if [ -z "$URL" ] || [ -z "$KEY" ]; then
  echo "ERROR: Missing SUPABASE env vars"
  exit 1
fi

echo ""
echo "============================================================"
echo "  EXPORT ARTISANS → CACHE LOCAL (curl)"
echo "============================================================"

# Clear output
> "$CACHE_FILE"

LAST_ID=""
TOTAL=0
PAGE_SIZE=500

while true; do
  # Build URL with cursor pagination
  if [ -z "$LAST_ID" ]; then
    QUERY="${URL}/rest/v1/providers?select=id,name,phone,address_postal_code,address_city,address_department,is_active&order=id.asc&limit=${PAGE_SIZE}"
  else
    QUERY="${URL}/rest/v1/providers?select=id,name,phone,address_postal_code,address_city,address_department,is_active&order=id.asc&limit=${PAGE_SIZE}&id=gt.${LAST_ID}"
  fi

  # Fetch with retry
  RETRY=0
  while true; do
    HTTP_CODE=$(curl -sS --max-time 60 -o "$TEMP_FILE" -w "%{http_code}" "$QUERY" \
      -H "apikey: $KEY" \
      -H "Authorization: Bearer $KEY" 2>/dev/null)

    if [ "$HTTP_CODE" = "200" ]; then
      break
    fi

    RETRY=$((RETRY + 1))
    if [ $RETRY -gt 10 ]; then
      echo "  ABANDON: 10 retries échoués à $TOTAL lignes (HTTP $HTTP_CODE)"
      exit 1
    fi
    echo "  Retry $RETRY (HTTP $HTTP_CODE) à $TOTAL..."
    sleep $((3 + RETRY * 2))
  done

  # Parse JSON array → JSONL (one object per line)
  # Convert MSYS paths to Windows paths for Node.js
  TEMP_WIN=$(cygpath -w "$TEMP_FILE" 2>/dev/null || echo "$TEMP_FILE")
  CACHE_WIN=$(cygpath -w "$CACHE_FILE" 2>/dev/null || echo "$CACHE_FILE")
  COUNT=$(node -e "
    const data = JSON.parse(require('fs').readFileSync(process.argv[1], 'utf-8'));
    let active = 0;
    const lines = [];
    for (const a of data) {
      if (!a.is_active) continue;
      active++;
      lines.push(JSON.stringify({
        id: a.id, name: a.name, phone: a.phone,
        cp: a.address_postal_code, city: a.address_city, dept: a.address_department
      }));
    }
    if (lines.length > 0) {
      require('fs').appendFileSync(process.argv[2], lines.join('\n') + '\n');
    }
    console.log(active + '|' + data.length + '|' + (data.length > 0 ? data[data.length-1].id : ''));
  " "$TEMP_WIN" "$CACHE_WIN")

  ACTIVE=$(echo "$COUNT" | cut -d'|' -f1)
  RAW=$(echo "$COUNT" | cut -d'|' -f2)
  LAST_ID=$(echo "$COUNT" | cut -d'|' -f3)

  TOTAL=$((TOTAL + RAW))

  # Progress every 10k
  if [ $((TOTAL % 10000)) -lt $PAGE_SIZE ]; then
    ACTIVE_TOTAL=$(wc -l < "$CACHE_FILE")
    echo "  ${TOTAL} lus, ${ACTIVE_TOTAL} actifs"
  fi

  # End when less than full page
  if [ "$RAW" -lt "$PAGE_SIZE" ]; then
    break
  fi
done

ACTIVE_TOTAL=$(wc -l < "$CACHE_FILE")
echo ""
echo "  ✓ ${ACTIVE_TOTAL} artisans actifs exportés (${TOTAL} total)"
echo "  → $CACHE_FILE"
echo "============================================================"

# Cleanup
rm -f "$TEMP_FILE"
