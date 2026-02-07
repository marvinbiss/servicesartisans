#!/bin/bash
# Hook: Block reintroduction of toxic fields (trust_score, trust_badge, is_premium in ranking)
# Fires on: Write, Edit (PreToolUse)
# Exception: src/types/legacy/** (only place these words are tolerated in TS source)
# Exit 2 = block, Exit 0 = allow
set -euo pipefail

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Skip non-source files (docs, config, SQL migrations, styles)
case "$FILE_PATH" in
  *.md|*.json|*.sql|*.css|*.scss) exit 0 ;;
esac

# Only exception for toxic words in TS source: src/types/legacy/**
case "$FILE_PATH" in
  */types/legacy/*) exit 0 ;;
  */.claude/*) exit 0 ;;
  */node_modules/*) exit 0 ;;
esac

# Get the content being written/edited
if [ "$TOOL_NAME" = "Write" ]; then
  CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // empty')
elif [ "$TOOL_NAME" = "Edit" ]; then
  CONTENT=$(echo "$INPUT" | jq -r '.tool_input.new_string // empty')
else
  exit 0
fi

# Check for trust_score and trust_badge (always blocked in source)
if echo "$CONTENT" | grep -qiE '\btrust_score\b'; then
  echo "BLOCKED: trust_score has been removed in v2. Do not reintroduce." >&2
  echo "Only allowed in src/types/legacy/**. See CLAUDE.md 'Interdit' section." >&2
  exit 2
fi

if echo "$CONTENT" | grep -qiE '\btrust_badge\b'; then
  echo "BLOCKED: trust_badge has been removed in v2. Do not reintroduce." >&2
  echo "Only allowed in src/types/legacy/**. See CLAUDE.md 'Interdit' section." >&2
  exit 2
fi

# Check is_premium in search/sort/filter context (blocked in ranking logic)
if echo "$CONTENT" | grep -qiE '\bis_premium\b'; then
  # Check if it's in a search/sort/filter/ranking context
  if echo "$CONTENT" | grep -qiE '(search|sort|filter|rank|order|ORDER BY).*is_premium|is_premium.*(search|sort|filter|rank|order|ORDER BY)'; then
    echo "BLOCKED: is_premium must never affect search ranking or sorting." >&2
    echo "See CLAUDE.md 'Neutralite de recherche' invariant." >&2
    exit 2
  fi
fi

exit 0
