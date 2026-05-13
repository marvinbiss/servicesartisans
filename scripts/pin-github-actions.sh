#!/usr/bin/env bash
# F-16 supply chain hardening : pin GitHub Actions par SHA full-length.
#
# Pourquoi : un tag `@v4` est mutable. Si le mainteneur de actions/checkout
# se fait compromettre (cf. tj-actions/changed-files mars 2025), un tag peut
# être réécrit et exécuter du code malveillant dans nos runners. Le pin SHA
# rend l'attaque non triviale (il faudrait que GitHub.com lui-même soit
# compromis ou qu'on accepte un Dependabot PR malicieux).
#
# Usage : bash scripts/pin-github-actions.sh
# Requiert : gh CLI authenticated.

set -euo pipefail

declare -A PIN_MAP=(
  ["actions/checkout@v4"]="actions/checkout"
  ["actions/setup-node@v4"]="actions/setup-node"
  ["actions/cache@v4"]="actions/cache"
  ["actions/upload-artifact@v4"]="actions/upload-artifact"
  ["actions/download-artifact@v4"]="actions/download-artifact"
)

# Tags cibles (à mettre à jour quand on bump une dépendance)
declare -A TAG_MAP=(
  ["actions/checkout"]="v4.2.2"
  ["actions/setup-node"]="v4.1.0"
  ["actions/cache"]="v4.2.0"
  ["actions/upload-artifact"]="v4.4.3"
  ["actions/download-artifact"]="v4.1.8"
)

for key in "${!PIN_MAP[@]}"; do
  repo="${PIN_MAP[$key]}"
  tag="${TAG_MAP[$repo]}"
  sha=$(gh api "repos/${repo}/git/refs/tags/${tag}" --jq '.object.sha')
  if [[ -z "$sha" || ${#sha} -ne 40 ]]; then
    echo "ERROR: unable to resolve $repo@$tag" >&2
    exit 1
  fi
  replacement="${repo}@${sha} # ${tag}"
  echo "Pinning $key -> $replacement"

  # Replace `uses: actions/checkout@v4` (with or without trailing whitespace/comment)
  # by the SHA-pinned form. Preserves indentation.
  find .github/workflows -type f \( -name '*.yml' -o -name '*.yaml' \) -print0 \
    | xargs -0 sed -i -E "s|uses: ${repo}@v[0-9]+(\s*#.*)?$|uses: ${replacement}|g"
done

echo "Done. Verify with: grep -rE 'uses: actions/' .github/workflows"
