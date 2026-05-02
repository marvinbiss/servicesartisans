#!/usr/bin/env sh
# =============================================================================
# scripts/gitleaks-precommit.sh
# =============================================================================
# Pre-commit gitleaks gate — soft-skip si binaire absent.
#
# Stratégie :
#   - Si gitleaks installé : scan staged uniquement (rapide, < 1s)
#   - Sinon : warning unique (idempotent, pas spam) + skip 0
#
# CI .github/workflows/secrets-scan.yml reste le filet bulletproof côté serveur.
#
# Install local (recommandé) :
#   - macOS    : brew install gitleaks
#   - Windows  : choco install gitleaks  OU  scoop install gitleaks
#   - Linux    : apt install gitleaks    OU  https://github.com/gitleaks/gitleaks/releases
# =============================================================================

set -e

if ! command -v gitleaks >/dev/null 2>&1; then
  # Skip silencieux mais idempotent : warning unique par session shell
  if [ -z "$_GITLEAKS_WARNED" ]; then
    echo "ℹ️  gitleaks non installé — scan secrets local skip (CI bloquera de toute façon)."
    echo "   Install : brew install gitleaks  |  choco install gitleaks  |  apt install gitleaks"
    export _GITLEAKS_WARNED=1
  fi
  exit 0
fi

# Scan staged only — rapide (<1s) et matche les fichiers à committer
gitleaks protect --staged --redact --config .gitleaks.toml --no-banner --exit-code 1 || {
  echo ""
  echo "❌ gitleaks a détecté un secret dans les fichiers staged."
  echo "   Retire le secret, déplace-le dans .env.local (gitignored), puis re-stage."
  echo "   Faux positif ? Édite .gitleaks.toml [allowlist] avec justification."
  exit 1
}
