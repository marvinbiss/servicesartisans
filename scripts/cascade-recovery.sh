#!/bin/bash
# Autonomous fail-recovery cascade :
#   sync-haiku (wait)  →  sync-sonnet  →  analyze  →  (opus|stop|fix)  →  publish
#
# Usage : ./scripts/cascade-recovery.sh <haiku_pid>
#   haiku_pid : PID of the currently running sync-generate-haiku.ts
#               (the cascade waits for this PID to exit before starting)
#
# Log    : /tmp/cascade.log (main) and per-stage logs (/tmp/cascade-*.log)
# Status : /tmp/cascade-status.json (updated at each transition)

set -u

HAIKU_PID="${1:-}"
LOG=/tmp/cascade.log
STATUS=/tmp/cascade-status.json
REPO="/c/Users/USER/Downloads/servicesartisans"

cd "$REPO" || exit 1

log() { echo "[$(date '+%H:%M:%S')] [cascade] $*" | tee -a "$LOG"; }

status() {
  local stage="$1"; local state="$2"; local extra="${3:-}"
  printf '{"stage":"%s","state":"%s","ts":"%s"%s}\n' \
    "$stage" "$state" "$(date -Iseconds)" \
    "${extra:+,$extra}" > "$STATUS"
}

: > "$LOG"
log "start pid=${HAIKU_PID:-none}"

# ---------- Stage 1 : wait for sync-haiku ----------
if [ -n "$HAIKU_PID" ]; then
  status "wait_haiku" "running"
  log "waiting for sync-haiku PID=$HAIKU_PID"
  while kill -0 "$HAIKU_PID" 2>/dev/null; do
    sleep 30
  done
  log "sync-haiku exited"
fi

# ---------- Stage 2 : sync-sonnet on judged_fail ----------
status "sonnet" "running"
log "launching sync-generate-sonnet.ts"
npx tsx scripts/sync-generate-sonnet.ts > /tmp/cascade-sonnet.log 2>&1
SONNET_EXIT=$?
if [ $SONNET_EXIT -ne 0 ]; then
  log "sonnet FAILED exit=$SONNET_EXIT — see /tmp/cascade-sonnet.log"
  status "sonnet" "failed" "\"exit\":$SONNET_EXIT"
  exit 1
fi
SONNET_SUMMARY=$(grep -E "^\[sync-sonnet\] done" /tmp/cascade-sonnet.log | tail -1)
log "sonnet done: $SONNET_SUMMARY"

# ---------- Stage 3 : analyze fail dimensions ----------
status "analyze" "running"
log "analyzing fail dimensions"
ANALYSIS=$(npx tsx scripts/analyze-fails.ts 2>/dev/null | tail -1)
if [ -z "$ANALYSIS" ]; then
  log "analyze returned empty — aborting"
  status "analyze" "failed"
  exit 1
fi
log "analysis: $ANALYSIS"
VERDICT=$(echo "$ANALYSIS" | node -e "let s='';process.stdin.on('data',c=>s+=c).on('end',()=>{try{console.log(JSON.parse(s).verdict)}catch{console.log('error')}})")
COUNT=$(echo "$ANALYSIS" | node -e "let s='';process.stdin.on('data',c=>s+=c).on('end',()=>{try{console.log(JSON.parse(s).count)}catch{console.log(0)}})")
log "verdict=$VERDICT residue_count=$COUNT"

# ---------- Stage 4 : conditional Opus ----------
case "$VERDICT" in
  opus)
    status "opus" "running"
    log "launching sync-generate-opus.ts (budget-cap \$10)"
    npx tsx scripts/sync-generate-opus.ts --budget-cap 10 > /tmp/cascade-opus.log 2>&1
    OPUS_EXIT=$?
    OPUS_SUMMARY=$(grep -E "^\[sync-opus\] done" /tmp/cascade-opus.log | tail -1)
    log "opus done exit=$OPUS_EXIT: $OPUS_SUMMARY"
    ;;
  stop)
    log "residue ($COUNT) below min threshold — skipping Opus, proceeding to publish"
    ;;
  fix)
    log "DOMINANT DIM DETECTED — likely validator bug, STOPPING before Opus. Human review required."
    status "fix" "needs_human" "\"analysis\":$ANALYSIS"
    exit 2
    ;;
  *)
    log "unknown verdict '$VERDICT' — aborting"
    status "analyze" "failed" "\"verdict\":\"$VERDICT\""
    exit 1
    ;;
esac

# ---------- Stage 5 : publish ----------
status "publish" "running"
log "launching publish-descriptions.ts"
npx tsx scripts/publish-descriptions.ts > /tmp/cascade-publish.log 2>&1
PUBLISH_EXIT=$?
PUBLISH_SUMMARY=$(grep -E "^\[publish-descriptions\] done" /tmp/cascade-publish.log | tail -1)
log "publish done exit=$PUBLISH_EXIT: $PUBLISH_SUMMARY"

# ---------- Done ----------
status "done" "success"
log "cascade complete"
echo "" | tee -a "$LOG"
echo "=== FINAL SUMMARY ===" | tee -a "$LOG"
echo "sonnet:  $SONNET_SUMMARY"   | tee -a "$LOG"
echo "analyze: $ANALYSIS"         | tee -a "$LOG"
echo "publish: $PUBLISH_SUMMARY"  | tee -a "$LOG"
