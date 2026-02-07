#!/bin/bash
# Hook: Block .tsbuildinfo files from being written/committed
# Fires on: Write (PreToolUse) and Bash git add (PreToolUse)
# Exit 2 = block, Exit 0 = allow
set -euo pipefail

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

if [ "$TOOL_NAME" = "Write" ] || [ "$TOOL_NAME" = "Edit" ]; then
  FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
  if [[ "$FILE_PATH" == *.tsbuildinfo ]]; then
    echo "BLOCKED: .tsbuildinfo files are build artifacts. Do not write or commit them." >&2
    echo "They are already in .gitignore." >&2
    exit 2
  fi
fi

if [ "$TOOL_NAME" = "Bash" ]; then
  COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
  # Check if git add is staging a tsbuildinfo file
  if echo "$COMMAND" | grep -qE 'git\s+add.*\.tsbuildinfo'; then
    echo "BLOCKED: Do not stage .tsbuildinfo files. They are build artifacts in .gitignore." >&2
    exit 2
  fi
fi

exit 0
