# /security-admin-audit

## But
Verifier que toutes les routes admin sont protegees par `verifyAdmin()` et
qu'aucun champ toxique interdit n'apparait dans le code public.

## Entrees
- Codebase: `src/app/api/admin/` et `src/`
- Aucune connexion DB requise (audit statique)

## Sorties
- Rapport texte:
  - Liste des routes admin avec statut auth (ok/ko)
  - Liste des fichiers contenant des champs interdits
- Exit code 0 si conforme, 1 si anomalie

## Etapes

### 1. Scanner toutes les routes admin pour verifyAdmin()
```bash
echo "=== AUDIT ROUTES ADMIN ==="
echo ""
FAIL=0

# Trouver toutes les routes admin
for route in $(find src/app/api/admin -name "route.ts" -type f); do
  if grep -q "verifyAdmin" "$route"; then
    echo "OK: $route"
  else
    echo "FAIL: $route — MANQUE verifyAdmin()"
    FAIL=1
  fi
done

echo ""
if [ $FAIL -eq 1 ]; then
  echo "ECHEC: Des routes admin ne sont pas protegees"
  exit 1
else
  echo "SUCCES: Toutes les routes admin ont verifyAdmin()"
fi
```

### 2. Verifier le pattern complet (guard + early return)
```bash
echo "=== VERIFICATION PATTERN AUTH COMPLET ==="
echo ""
FAIL=0

for route in $(find src/app/api/admin -name "route.ts" -type f); do
  # Verifier que verifyAdmin est importe ou appele
  HAS_VERIFY=$(grep -c "verifyAdmin" "$route")
  # Verifier le guard pattern (success check + return error)
  HAS_GUARD=$(grep -c "authResult.success\|authResult.error\|!authResult" "$route")

  if [ "$HAS_VERIFY" -gt 0 ] && [ "$HAS_GUARD" -gt 0 ]; then
    echo "OK: $route (verifyAdmin + guard)"
  elif [ "$HAS_VERIFY" -gt 0 ]; then
    echo "WARN: $route (verifyAdmin present mais guard pattern non standard)"
  else
    echo "FAIL: $route (pas de verifyAdmin)"
    FAIL=1
  fi
done

echo ""
if [ $FAIL -eq 1 ]; then
  echo "ECHEC: Des routes admin manquent la garde auth"
  exit 1
fi
```

### 3. Scanner les champs toxiques interdits dans le code
```bash
echo "=== SCAN CHAMPS INTERDITS ==="
echo ""
FAIL=0

# Mots interdits: trust_score, trust_badge, is_premium (dans ranking/search/sort)
# Exclure: node_modules, .next, .claude, supabase/migrations (legacy), types/legacy
EXCLUDE="--exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.claude --exclude-dir=.git"

for TERM in "trust_score" "trust_badge"; do
  HITS=$(grep -rn $EXCLUDE "$TERM" src/ --include="*.ts" --include="*.tsx" | grep -v "src/types/legacy" | grep -v "// removed" | grep -v "// REMOVED" || true)
  if [ -n "$HITS" ]; then
    echo "FAIL: '$TERM' trouve dans le code:"
    echo "$HITS"
    FAIL=1
  else
    echo "OK: '$TERM' absent du code source"
  fi
done

# is_premium: autorise dans les types/definitions mais pas dans search/sort/filter
PREMIUM_HITS=$(grep -rn $EXCLUDE "is_premium" src/ --include="*.ts" --include="*.tsx" | grep -v "src/types/legacy" | grep -v "interface\|type " | grep -vi "// removed\|// legacy\|// deprecated" || true)
if [ -n "$PREMIUM_HITS" ]; then
  echo ""
  echo "WARN: 'is_premium' trouve hors type definitions:"
  echo "$PREMIUM_HITS"
  # Verifier si c'est dans un contexte search/sort/filter
  SEARCH_HITS=$(echo "$PREMIUM_HITS" | grep -i "search\|sort\|filter\|rank\|order" || true)
  if [ -n "$SEARCH_HITS" ]; then
    echo ""
    echo "FAIL: 'is_premium' utilise dans search/sort/filter:"
    echo "$SEARCH_HITS"
    FAIL=1
  fi
else
  echo "OK: 'is_premium' absent du code applicatif"
fi

echo ""
if [ $FAIL -eq 1 ]; then
  echo "ECHEC: Champs interdits detectes dans le code"
  exit 1
else
  echo "SUCCES: Aucun champ interdit dans le code public"
fi
```

### 4. Verifier que createAdminClient n'est jamais utilise sans verifyAdmin
```bash
echo "=== SCAN createAdminClient SANS GUARD ==="
echo ""
FAIL=0

# Trouver tous les fichiers qui importent createAdminClient
FILES=$(grep -rln "createAdminClient" src/app/api/ --include="*.ts" || true)

for f in $FILES; do
  # Exclure le fichier de definition lui-meme
  if echo "$f" | grep -q "supabase/admin"; then continue; fi

  HAS_ADMIN=$(grep -c "createAdminClient" "$f")
  HAS_VERIFY=$(grep -c "verifyAdmin" "$f")

  # Exceptions: sitemap.ts, cron jobs (uses CRON_SECRET)
  if echo "$f" | grep -q "sitemap\|cron"; then
    echo "SKIP: $f (exception: sitemap/cron)"
    continue
  fi

  if [ "$HAS_ADMIN" -gt 0 ] && [ "$HAS_VERIFY" -eq 0 ]; then
    echo "FAIL: $f — utilise createAdminClient() sans verifyAdmin()"
    FAIL=1
  else
    echo "OK: $f"
  fi
done

echo ""
if [ $FAIL -eq 1 ]; then
  echo "ECHEC: createAdminClient utilise sans guard auth"
  exit 1
else
  echo "SUCCES: tous les usages de createAdminClient sont gardes"
fi
```

### 5. Resume final
```bash
echo ""
echo "=========================================="
echo "  RESUME AUDIT SECURITE ADMIN"
echo "=========================================="
echo ""
echo "Executer les 4 etapes ci-dessus."
echo "Si TOUTES passent: audit OK."
echo "Si une seule echoue: CORRIGER AVANT MERGE."
```

## Interdictions
- Ne JAMAIS modifier les routes pendant l'audit — ce skill est read-only
- Ne JAMAIS ignorer une route admin trouvee sans verifyAdmin
- Ne JAMAIS accepter un champ toxique (trust_score, trust_badge) dans le code actif
- Ne JAMAIS considerer `is_premium` comme acceptable dans un contexte search/sort/filter

## Criteres d'acceptation
| Critere | Attendu |
|---------|---------|
| Toutes les routes admin ont verifyAdmin() | 100% coverage |
| Pattern auth complet (guard + return) | Chaque route a le check + early return |
| trust_score absent du code | 0 occurrences hors legacy |
| trust_badge absent du code | 0 occurrences hors legacy |
| is_premium absent de search/sort/filter | 0 occurrences dans le contexte ranking |
| createAdminClient toujours garde | Pas d'usage sans verifyAdmin (sauf sitemap/cron) |
