#!/bin/bash
# Hook: Ensure admin route files contain verifyAdmin()
# Fires on: Write, Edit (PostToolUse) — checks the file AFTER modification
# Exit 2 = block, Exit 0 = allow
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only check admin route files
if [[ ! "$FILE_PATH" =~ /api/admin/ ]] || [[ ! "$FILE_PATH" =~ route\.ts$ ]]; then
  exit 0
fi

# After Write/Edit, verify the file on disk contains verifyAdmin
if [ -f "$FILE_PATH" ]; then
  if ! grep -q "verifyAdmin" "$FILE_PATH"; then
    echo "BLOCKED: Admin route $FILE_PATH is missing verifyAdmin() guard." >&2
    echo "" >&2
    echo "Every /api/admin/* route MUST call verifyAdmin() before data access:" >&2
    echo "  const authResult = await verifyAdmin()" >&2
    echo "  if (!authResult.success || !authResult.admin) {" >&2
    echo "    return authResult.error" >&2
    echo "  }" >&2
    exit 2
  fi
fi

exit 0
