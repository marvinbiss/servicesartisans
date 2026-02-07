#!/bin/bash
# Hook: Block fallback URL patterns (stable_id || slug, stable_id || id, slug || id)
# Fires on: Write, Edit (PreToolUse)
# Scope: Only public-facing routes and public API — never private/admin/auth
# Exit 2 = block, Exit 0 = allow
set -euo pipefail

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only check public-facing code paths:
#   (public) route group — SEO-indexed pages
#   api/providers — public search endpoints
#   sitemap — URL generation
# Everything else (admin, auth, private, components) is allowed
case "$FILE_PATH" in
  *\(public\)*|*/api/providers/*|*/sitemap*) ;;
  *) exit 0 ;;
esac

# Skip non-TS files
case "$FILE_PATH" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac

# Get the content being written/edited
if [ "$TOOL_NAME" = "Write" ]; then
  CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // empty')
elif [ "$TOOL_NAME" = "Edit" ]; then
  CONTENT=$(echo "$INPUT" | jq -r '.tool_input.new_string // empty')
else
  exit 0
fi

# Check for fallback URL patterns
# stable_id || slug, stable_id || id, slug || id (and reverse)
if echo "$CONTENT" | grep -qE 'stable_id\s*\|\|'; then
  echo "BLOCKED: Fallback URL pattern detected (stable_id || ...)." >&2
  echo "stable_id is the sole publicId. No fallback to slug or id." >&2
  echo "See CLAUDE.md 'stable_id' invariant." >&2
  exit 2
fi

if echo "$CONTENT" | grep -qE '\|\|\s*stable_id'; then
  echo "BLOCKED: Fallback URL pattern detected (... || stable_id)." >&2
  echo "stable_id must be the primary identifier, not a fallback." >&2
  exit 2
fi

if echo "$CONTENT" | grep -qE '(slug|\.id)\s*\|\|\s*(slug|\.id|stable_id)'; then
  echo "BLOCKED: Fallback URL pattern detected (slug || id variant)." >&2
  echo "Use stable_id as the sole publicId." >&2
  exit 2
fi

exit 0
