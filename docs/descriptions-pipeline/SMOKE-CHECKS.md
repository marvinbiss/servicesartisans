# SMOKE-CHECKS — Migration noindex RGE-only

**Contexte** : après exécution de `scripts/noindex-non-rge.ts` qui passe ~919 544 providers en
`noindex=true` et conserve ~50 347 en `noindex=false` (RGE actifs ou revendiqués).

**Baseline attendue** (issue du diagnostic SQL pré-migration) :

- Total providers actifs : 970 326
- `noindex=false` post-migration : ~50 347 (tolérance ±100 rows)
- `noindex=true` post-migration : ~919 979 (tolérance ±100 rows)
- Tier A — `rge_valid_until > now()` : ~50 332
- Tier B — `claimed_at IS NOT NULL` : ~16 (croissant)

---

## Section 1 — Checks immédiats T+0 à T+5 min

Automatisables via curl/bash. À lancer immédiatement après la fin du script.

**Variables à substituer avant d'exécuter** :

- `{PROVIDER_ID_RGE_SAMPLE}` : stable_id ou slug d'un artisan confirmé RGE actif en prod
  (ex. obtenu via : `SELECT slug, stable_id FROM providers WHERE rge_valid_until > now() LIMIT 5`)
- `{PROVIDER_ID_NOINDEX_SAMPLE}` : stable_id ou slug d'un provider non-RGE non-revendiqué
  (ex. : `SELECT slug, stable_id FROM providers WHERE noindex=true AND rge_valid_until IS NULL LIMIT 5`)
- `{SERVICE_RGE}` : slug de service, ex. `pompe-a-chaleur` ou `isolation-thermique`
- `{VILLE_RGE}` : slug de ville correspondant à l'artisan RGE sample, ex. `paris`

---

### CHECK-01 — Fiche RGE retourne HTTP 200 avec meta index

**Intent** : la fiche d'un artisan RGE (noindex=false) est accessible et porte `robots: index`.

```bash
curl -s -o /tmp/check01.html -w "%{http_code}" \
  "https://servicesartisans.fr/services/{SERVICE_RGE}/{VILLE_RGE}/{PROVIDER_ID_RGE_SAMPLE}"
```

**Output attendu** : code `200`

```bash
grep -o 'name="robots" content="[^"]*"' /tmp/check01.html
```

**Contenu attendu** : `name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"`

**Seuil d'echec** : code != 200 OU absence de `content="index` dans le body.

---

### CHECK-02 — Fiche non-RGE retourne HTTP 200 avec meta noindex

**Intent** : la fiche d'un provider Tier C est toujours accessible (pas de 404) mais porte `noindex`.

```bash
curl -s -o /tmp/check02.html -w "%{http_code}" \
  "https://servicesartisans.fr/services/{SERVICE_QUELCONQUE}/{VILLE_QUELCONQUE}/{PROVIDER_ID_NOINDEX_SAMPLE}"
```

**Output attendu** : code `200`

```bash
grep -o 'name="robots" content="[^"]*"' /tmp/check02.html
```

**Contenu attendu** : `name="robots" content="noindex, follow"`

**Seuil d'echec** : code != 200 OU presence de `content="index` (sans "no") dans le body.

Note : la page doit rester accessible (HTTP 200) — Google ne la crawle plus via sitemap,
mais les liens directs existants restent valides. Ne pas retourner 404.

---

### CHECK-03 — Sitemap providers-0 retourne < 50 000 URLs

**Intent** : le filtre `noindex=false` dans `/api/sitemap-providers` fonctionne.
Le batch 0 (offset 0..24999) doit contenir des fiches RGE uniquement.

```bash
curl -s "https://servicesartisans.fr/sitemap/providers-0.xml" | grep -c "<url>"
```

**Output attendu** : un nombre entre `1` et `25000`

**Valeur typique** : ~25 000 (premier batch plein si ~50 347 fiches indexables)

**Seuil d'echec** : valeur == 0 (filtre cassé ou DB inaccessible) OU valeur > 25000 (PROVIDER_BATCH_SIZE dépassé).

```bash
# Verifier aussi que le sitemap est XML valide (pas d'erreur 500 silencieuse)
curl -s -o /dev/null -w "%{http_code}" "https://servicesartisans.fr/sitemap/providers-0.xml"
```

**Output attendu** : `200`

**Seuil d'echec** : code != 200.

---

### CHECK-04 — Une URL RGE sample est presente dans sitemap providers-0

**Intent** : l'URL canonique d'un artisan RGE apparait bien dans le sitemap.

```bash
curl -s "https://servicesartisans.fr/sitemap/providers-0.xml" | \
  grep "{PROVIDER_ID_RGE_SAMPLE}"
```

**Output attendu** : au moins une ligne contenant l'ID sample.

**Seuil d'echec** : aucune correspondance (provider RGE exclu a tort du sitemap).

---

### CHECK-05 — Une URL noindex sample est absente du sitemap providers-0 ET providers-1

**Intent** : un provider Tier C n'apparait dans aucun batch sitemap.

```bash
for batch in 0 1 2; do
  count=$(curl -s "https://servicesartisans.fr/sitemap/providers-${batch}.xml" | \
    grep -c "{PROVIDER_ID_NOINDEX_SAMPLE}" || true)
  echo "batch-${batch}: ${count} occurrences"
done
```

**Output attendu** : `0 occurrences` sur chaque batch.

**Seuil d'echec** : >= 1 occurrence dans n'importe quel batch.

---

### CHECK-06 — Sitemap providers-2 retourne un XML vide (post-migration : ~50K fiches = 2 batchs)

**Intent** : valider que le total indexable est bien ~50 347 (< 2 × 25 000 = 50 000 + reste dans batch-1).
Le batch 2 (offset 50000..) doit etre vide apres migration.

```bash
curl -s "https://servicesartisans.fr/sitemap/providers-2.xml" | grep -c "<url>"
```

**Output attendu** : `0`

**Seuil d'echec** : > 100 (signe que le filtre noindex ne s'applique pas et que ~970K sont encore servis).

Note : une petite valeur (1–100) peut indiquer des providers en doublon ou race condition a ignorer.

---

### CHECK-07 — Page listing service x ville : HTTP 200 sans erreur 500

**Intent** : les pages listing (`/services/{service}/{ville}`) ne sont pas cassees par la migration.

```bash
for url in \
  "https://servicesartisans.fr/services/plombier/paris" \
  "https://servicesartisans.fr/services/electricien/lyon" \
  "https://servicesartisans.fr/services/isolation-thermique/marseille" \
  "https://servicesartisans.fr/services/pompe-a-chaleur/bordeaux" \
  "https://servicesartisans.fr/services/chauffagiste/toulouse"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  echo "${code} ${url}"
done
```

**Output attendu** : `200` pour chaque URL.

**Seuil d'echec** : n'importe quel code 5xx.

---

### CHECK-08 — Header Cache-Control sur sitemap providers

**Intent** : le CDN cache bien les sitemaps (s-maxage=3600), sinon chaque ping Google re-hit la DB.

```bash
curl -sI "https://servicesartisans.fr/sitemap/providers-0.xml" | \
  grep -i "cache-control"
```

**Output attendu** : `cache-control: public, s-maxage=3600, stale-while-revalidate=86400`

**Seuil d'echec** : absence du header OU `no-store` / `private` (signe que la route a change).

---

### CHECK-09 — Sitemap index (/sitemap.xml) retourne HTTP 200

**Intent** : l'index racine n'est pas casse apres la migration.

```bash
curl -s -o /dev/null -w "%{http_code}" "https://servicesartisans.fr/sitemap.xml"
```

**Output attendu** : `200`

```bash
curl -s "https://servicesartisans.fr/sitemap.xml" | grep -c "providers"
```

**Output attendu** : `0` (les sitemaps providers sont dans `/api/sitemap-index`, pas dans le sitemap Next.js)
ou un nombre fixe correspondant aux references existantes — verifier coherence avec etat pre-migration.

**Seuil d'echec** : code != 200 sur le sitemap index.

---

### CHECK-10 — Pas d'erreur 500 sur 5 fiches RGE differentes

**Intent** : la mutation DB n'a pas corrompu les donnees utilisees par generateMetadata().

```bash
for id in \
  "{PROVIDER_ID_RGE_SAMPLE_1}" \
  "{PROVIDER_ID_RGE_SAMPLE_2}" \
  "{PROVIDER_ID_RGE_SAMPLE_3}" \
  "{PROVIDER_ID_RGE_SAMPLE_4}" \
  "{PROVIDER_ID_RGE_SAMPLE_5}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" \
    "https://servicesartisans.fr/services/{SERVICE_RGE}/{VILLE_RGE}/${id}")
  echo "${code} /services/{SERVICE_RGE}/{VILLE_RGE}/${id}"
done
```

**Output attendu** : `200` pour chaque URL.

**Seuil d'echec** : n'importe quel 500/503.

---

## Section 2 — Checks T+5 a T+30 min (DB-level)

A executer via Supabase SQL Editor (attention : split en statements separes, pas de $$ tags).

---

### CHECK-DB-01 — Baselines noindex conformes

**Intent** : le total des providers actifs dans chaque categorie correspond aux cibles.

```sql
SELECT
  count(*) FILTER (WHERE noindex = false)                             AS indexables,
  count(*) FILTER (WHERE noindex = true)                              AS noindexed,
  count(*) FILTER (WHERE noindex = false AND rge_valid_until > now()) AS index_rge_actif,
  count(*) FILTER (WHERE noindex = false AND claimed_at IS NOT NULL)  AS index_claim,
  count(*) AS total
FROM providers
WHERE is_active = true;
```

**Valeurs attendues** (tolérance ±100 rows) :
| Colonne | Valeur cible |
|---|---|
| `indexables` | 50 347 |
| `noindexed` | ~919 979 |
| `index_rge_actif` | ~50 332 |
| `index_claim` | ~16 |
| `total` | 970 326 |

**Seuil d'echec** : `indexables` > 50 447 OU `indexables` < 50 247 (hors tolérance ±100).

---

### CHECK-DB-02 — Zero violation claimed+noindex (BUG CRITIQUE)

**Intent** : aucun artisan revendiqué n'est en noindex. C'est la violation la plus grave possible —
un artisan qui a claim sa fiche se retrouve deindex.

```sql
SELECT count(*) AS violations
FROM providers
WHERE is_active = true
  AND noindex = true
  AND claimed_at IS NOT NULL;
```

**Valeur attendue** : `0`

**Seuil d'echec** : toute valeur > 0. Si > 0 : ROLLBACK immediat (voir Section 5).

---

### CHECK-DB-03 — Zero violation non-RGE non-claim encore en index (BUG LOGIQUE)

**Intent** : aucun provider non-RGE et non-revendiqué ne reste en noindex=false.
Indique que la Phase 2 du script ne s'est pas terminée.

```sql
SELECT count(*) AS violations
FROM providers
WHERE is_active = true
  AND noindex = false
  AND claimed_at IS NULL
  AND (rge_valid_until IS NULL OR rge_valid_until <= now());
```

**Valeur attendue** : `0`

**Seuil d'echec** : > 500 (une petite valeur peut etre une race condition sur RGE expirant exactement
a l'heure du run — inspecter manuellement avant de décider du rollback).

---

### CHECK-DB-04 — Trigger trigger_providers_updated_at bien déclenché

**Intent** : les rows modifiées par le script ont un `updated_at` frais (< 30 minutes).

```sql
SELECT
  count(*) FILTER (WHERE updated_at > now() - interval '30 minutes') AS fresh_rows,
  max(updated_at) AS most_recent,
  min(updated_at) AS oldest_modified
FROM providers
WHERE is_active = true
  AND noindex = true
  AND updated_at > now() - interval '2 hours';
```

**Valeur attendue** :

- `fresh_rows` : entre 500 000 et 920 000 (la majorité des rows modifiées)
- `most_recent` : timestamp dans les 30 dernières minutes

**Seuil d'echec** : `fresh_rows` < 1000 (trigger n'a pas tourné ou script a avorté très tôt).

---

### CHECK-DB-05 — Aucune erreur Sentry dans les 15 min post-exec

**Intent** : pas de spike d'erreurs applicatives causé par la migration.

Verification manuelle dans Sentry dashboard (https://sentry.io) :

- Projet : servicesartisans
- Filtre : `last seen: last 15 minutes`
- Rechercher des issues avec tags : `generateMetadata`, `sitemap-providers`, `noindex`

**Attendu** : zero nouvelles issues avec `level: error` non-existantes avant la migration.

**Seuil d'echec** : presence d'issues contenant `providers.noindex` ou `rge_valid_until` dans le stack trace.

SQL complementaire (si Sentry n'est pas accessible) :

```sql
-- Verifier qu'aucun provider RGE n'a de donnees manquantes qui casseraient generateMetadata
SELECT count(*) AS rge_sans_specialty
FROM providers
WHERE is_active = true
  AND noindex = false
  AND (specialty IS NULL OR specialty = '');
```

**Valeur attendue** : `0` (ou très faible — ces rows seront filtrées par le sitemap mais ne cassent pas la page).

---

## Section 3 — Checks T+1h a T+24h (monitoring + GSC)

---

### CHECK-MON-01 — GSC : pas de spike Soft 404 sur URLs claimed

**Intent** : les fiches revendiquées (Tier B) ne sont pas retournées en soft 404 par Google.

Verification via Google Search Console (coller manuellement la data — ne pas pull via MCP) :

- URL Inspection Tool sur 3–5 URLs de fiches claimed
- Coverage report > "Valid" : doit rester stable
- Coverage report > "Excluded - Crawled, not indexed" : ne doit pas augmenter sur les claimed

**Attendu** : zero fiche claimed dans "Soft 404" ou "Crawled, currently not indexed".

**Seuil d'echec** : presence d'URLs claimed dans le rapport d'erreurs GSC.

---

### CHECK-MON-02 — Sentry error rate stable (+/- 10% vs baseline 24h)

**Intent** : pas d'augmentation systémique d'erreurs liée à la migration.

Dans Sentry :

- Comparer `Error rate` (issues/heure) sur les 24h pre-migration vs les 24h post-migration
- Filtrer sur : project=servicesartisans, environment=production

**Attendu** : variation < +10% du taux d'erreurs horaire.

**Seuil d'echec** : augmentation > 10% persistant plus de 2h.

---

### CHECK-MON-03 — Analytics : trafic organique agregé stable (pas de chute > 30%)

**Intent** : la migration n'a pas cassé les pages indexées qui generaient du trafic.

Dans l'outil analytics (Plausible/GA) :

- Comparer sessions organiques J vs J-7 (même jour de semaine)
- Filtrer sur source = organic / google

**Attendu** : pas de chute > 30% en J+1.

Note : une chute de 5–15% est normale et attendue (pages Tier C qui rankeaient faiblement
sont desindexées). Une chute > 30% suggère que des pages Tier A/B ont été touchées par erreur.

**Seuil d'echec** : chute > 30% du trafic organique agregé, persistant > 48h.

---

### CHECK-MON-04 — Cron sitemap-health : passe vert

**Intent** : le cron quotidien de sante sitemap confirme que tous les sitemaps retournent 200.

Le cron `/api/cron/sitemap-health` (Sentry monitor : `cron-sitemap-health`) :

- Fetche `/sitemap.xml` (→ rewrite `/api/sitemap-index`)
- Parcourt tous les child sitemaps
- Log `[sitemap-health]` entries dans Vercel logs

Verification :

```bash
# Declencher manuellement (necessite CRON_SECRET)
curl -s -H "Authorization: Bearer ${CRON_SECRET}" \
  "https://servicesartisans.fr/api/cron/sitemap-health"
```

**Attendu** : reponse JSON sans `error`, status 200.

**Seuil d'echec** : reponse avec `status: 500` ou `error: "Sitemap index unhealthy"`.

---

### CHECK-MON-05 — Cron pruning-audit : baseline coherente

**Intent** : le rapport d'audit pruning (pages service×ville) reste coherent avec la realite
post-migration (les listings service×ville ne doivent pas etre impacts par la migration providers).

```bash
curl -s -H "Authorization: Bearer ${CRON_SECRET}" \
  "https://servicesartisans.fr/api/cron/pruning-audit"
```

**Attendu** :

- Le rapport JSON liste des candidats noindex (pages avec 0 providers) — c'est normal
- Le champ `total_candidates` ne doit pas avoir augmenté de plus de 10% vs baseline pré-migration
- Aucune page avec `provider_count > 0` ne doit apparaitre en candidat noindex pour cause erronée

**Seuil d'echec** : `total_candidates` augmenté de > 10% ET pages affectées avec `provider_count > 0`.

---

## Section 4 — Commandes copypaste (rapport PASS/FAIL agrégé)

Bloc bash complet a copier-coller dans git-bash Windows. Remplacer les variables en haut du bloc.

```bash
#!/usr/bin/env bash
# ============================================================
# SMOKE-CHECKS noindex RGE-only — rapport PASS/FAIL
# Usage : copier dans git-bash, remplacer les variables, executer
# ============================================================

PROD="https://servicesartisans.fr"

# --- Remplacer ces valeurs avec des IDs reels issus de la DB ---
SERVICE_RGE="isolation-thermique"
VILLE_RGE="paris"
PROVIDER_ID_RGE="prov-rge-sample-1"       # slug ou stable_id d'un RGE actif
SERVICE_NOINDEX="plombier"
VILLE_NOINDEX="roubaix"
PROVIDER_ID_NOINDEX="prov-noindex-sample"  # slug ou stable_id d'un non-RGE non-claim
# ---------------------------------------------------------------

PASS=0
FAIL=0

check() {
  local name="$1"
  local result="$2"  # "PASS" ou "FAIL"
  local detail="$3"
  if [ "$result" = "PASS" ]; then
    echo "[PASS] ${name}"
    PASS=$((PASS + 1))
  else
    echo "[FAIL] ${name} — ${detail}"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== SMOKE CHECKS noindex RGE-only ==="
echo "Timestamp: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo ""

# CHECK-01 : fiche RGE HTTP 200
code=$(curl -s -o /tmp/sa_check01.html -w "%{http_code}" \
  "${PROD}/services/${SERVICE_RGE}/${VILLE_RGE}/${PROVIDER_ID_RGE}")
if [ "$code" = "200" ]; then
  robots=$(grep -o 'name="robots" content="[^"]*"' /tmp/sa_check01.html 2>/dev/null || echo "")
  if echo "$robots" | grep -q '"index'; then
    check "CHECK-01 fiche RGE HTTP 200 + meta index" "PASS" ""
  else
    check "CHECK-01 fiche RGE HTTP 200 + meta index" "FAIL" "meta robots absent ou noindex: ${robots}"
  fi
else
  check "CHECK-01 fiche RGE HTTP 200 + meta index" "FAIL" "HTTP ${code}"
fi

# CHECK-02 : fiche noindex HTTP 200 + meta noindex
code=$(curl -s -o /tmp/sa_check02.html -w "%{http_code}" \
  "${PROD}/services/${SERVICE_NOINDEX}/${VILLE_NOINDEX}/${PROVIDER_ID_NOINDEX}")
if [ "$code" = "200" ]; then
  robots=$(grep -o 'name="robots" content="[^"]*"' /tmp/sa_check02.html 2>/dev/null || echo "")
  if echo "$robots" | grep -q '"noindex'; then
    check "CHECK-02 fiche noindex HTTP 200 + meta noindex" "PASS" ""
  else
    check "CHECK-02 fiche noindex HTTP 200 + meta noindex" "FAIL" "meta noindex absent: ${robots}"
  fi
else
  check "CHECK-02 fiche noindex HTTP 200 + meta noindex" "FAIL" "HTTP ${code}"
fi

# CHECK-03 : sitemap providers-0 HTTP 200
code=$(curl -s -o /dev/null -w "%{http_code}" "${PROD}/sitemap/providers-0.xml")
if [ "$code" = "200" ]; then
  check "CHECK-03 sitemap providers-0 HTTP 200" "PASS" ""
else
  check "CHECK-03 sitemap providers-0 HTTP 200" "FAIL" "HTTP ${code}"
fi

# CHECK-03b : nombre d'URLs dans providers-0 entre 1 et 25000
url_count=$(curl -s "${PROD}/sitemap/providers-0.xml" | grep -c "<url>" || echo "0")
if [ "$url_count" -ge 1 ] && [ "$url_count" -le 25000 ]; then
  check "CHECK-03b sitemap providers-0 url count [1..25000]" "PASS" "count=${url_count}"
else
  check "CHECK-03b sitemap providers-0 url count [1..25000]" "FAIL" "count=${url_count}"
fi

# CHECK-04 : fiche RGE presente dans sitemap providers-0
match=$(curl -s "${PROD}/sitemap/providers-0.xml" | grep -c "${PROVIDER_ID_RGE}" || echo "0")
if [ "$match" -ge 1 ]; then
  check "CHECK-04 fiche RGE dans sitemap" "PASS" ""
else
  check "CHECK-04 fiche RGE dans sitemap" "FAIL" "ID ${PROVIDER_ID_RGE} absent du batch 0"
fi

# CHECK-05 : fiche noindex absente du sitemap (batches 0,1)
found=0
for batch in 0 1; do
  c=$(curl -s "${PROD}/sitemap/providers-${batch}.xml" | \
    grep -c "${PROVIDER_ID_NOINDEX}" 2>/dev/null || echo "0")
  found=$((found + c))
done
if [ "$found" -eq 0 ]; then
  check "CHECK-05 fiche noindex absente du sitemap" "PASS" ""
else
  check "CHECK-05 fiche noindex absente du sitemap" "FAIL" "${found} occurrence(s) trouvees"
fi

# CHECK-06 : sitemap providers-2 vide (<= 100 URLs)
url_count_b2=$(curl -s "${PROD}/sitemap/providers-2.xml" | grep -c "<url>" || echo "0")
if [ "$url_count_b2" -le 100 ]; then
  check "CHECK-06 sitemap providers-2 quasi-vide" "PASS" "count=${url_count_b2}"
else
  check "CHECK-06 sitemap providers-2 quasi-vide" "FAIL" "count=${url_count_b2} (filtre noindex non appliqué?)"
fi

# CHECK-07 : listings service x ville HTTP 200
listings_fail=0
for url in \
  "${PROD}/services/plombier/paris" \
  "${PROD}/services/electricien/lyon" \
  "${PROD}/services/isolation-thermique/marseille"; do
  lcode=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [ "$lcode" != "200" ]; then
    echo "  listing FAIL: HTTP ${lcode} ${url}"
    listings_fail=$((listings_fail + 1))
  fi
done
if [ "$listings_fail" -eq 0 ]; then
  check "CHECK-07 listings service x ville HTTP 200" "PASS" ""
else
  check "CHECK-07 listings service x ville HTTP 200" "FAIL" "${listings_fail} listing(s) en erreur"
fi

# CHECK-08 : Cache-Control sur sitemap providers
cc=$(curl -sI "${PROD}/sitemap/providers-0.xml" | grep -i "cache-control" || echo "")
if echo "$cc" | grep -q "s-maxage=3600"; then
  check "CHECK-08 Cache-Control sitemap providers" "PASS" ""
else
  check "CHECK-08 Cache-Control sitemap providers" "FAIL" "header: ${cc}"
fi

# CHECK-09 : sitemap index HTTP 200
code=$(curl -s -o /dev/null -w "%{http_code}" "${PROD}/sitemap.xml")
if [ "$code" = "200" ]; then
  check "CHECK-09 sitemap index HTTP 200" "PASS" ""
else
  check "CHECK-09 sitemap index HTTP 200" "FAIL" "HTTP ${code}"
fi

# --- Rapport final ---
echo ""
echo "==========================="
echo "TOTAL : ${PASS} PASS / $((PASS + FAIL)) checks"
if [ "$FAIL" -gt 0 ]; then
  echo "ATTENTION : ${FAIL} FAIL(s) — voir details ci-dessus"
  echo "=> Consulter Section 5 ROLLBACK si CHECK-DB-02 ou CHECK-05 en FAIL"
else
  echo "OK — tous les checks HTTP passent"
fi
echo "==========================="
```

---

## Section 5 — Red flags = rollback trigger

Un seul de ces trois scenarios suffit a declencher le rollback.

---

### RED FLAG 1 — Artisans revendiqués passés en noindex (violation critique)

**Declencheur** : CHECK-DB-02 retourne `violations > 0`

Toute valeur > 0 sur :

```sql
SELECT count(*) FROM providers
WHERE is_active = true AND noindex = true AND claimed_at IS NOT NULL;
```

**Pourquoi c'est critique** : un artisan a payé ou investi du temps pour revendiquer sa fiche.
La passer en noindex est une faute contractuelle et une perte directe de conversion.

**Rollback** : executer immédiatement le script de rollback partiel :

```sql
UPDATE providers SET noindex = false
WHERE is_active = true AND noindex = true AND claimed_at IS NOT NULL;
```

Puis investiguer pourquoi la Phase 3 du script (`noindex=false` sur `claimed_at IS NOT NULL`)
n'a pas fonctionné. Referrer a `scripts/noindex-non-rge.ts` lignes 81-106.

---

### RED FLAG 2 — Trafic organique chute > 30% en 48h sur fiches indexées

**Declencheur** : CHECK-MON-03 — chute > 30% du trafic organique sur 48h consécutives,
CONJOINTEMENT avec des URLs claimed ou RGE actives visibles dans GSC > "Crawled, not indexed".

Note : une chute de 5-20% en J+1 est normale (pages Tier C désindexées qui avaient un trafic résiduel).
Le seuil de 30% + URLs claimed en erreur est le signal d'un problème structurel.

**Rollback complet** :

```sql
-- Restaurer noindex=false sur tous les providers actifs (retour état pré-migration)
UPDATE providers SET noindex = false WHERE is_active = true;
```

Puis soumettre un rapport d'urgence via IndexNow pour les fiches claimed.

---

### RED FLAG 3 — Spike d'erreurs 5xx sur les fiches fiche artisan > 5% des requetes

**Declencheur** : Sentry `error rate` > 5% des requetes vers `/services/*/*/` en erreur 500,
persistant > 30 minutes post-migration.

Cela indique que `generateMetadata` ou le composant page crash sur des données corrompues
par le batch UPDATE (ex. race condition avec un autre process).

**Rollback d'urgence** : la migration est idempotente — relancer `scripts/noindex-non-rge.ts`
n'empire pas la situation. Si les 500 persistent, appliquer :

```sql
-- Rollback partiel : repasser les fiches posant problème en noindex=false
-- (identifier via Sentry les provider IDs en erreur)
UPDATE providers SET noindex = false
WHERE id IN (/* IDs des providers en erreur Sentry */);
```

**Reference** : plan de rollback complet dans `docs/ahrefs-audit-2026-04/MASTER-PLAN-00-SYNTHESIS.md`
section 13.7 "Risques et mitigations".

---

## Annexe — SQL utiles pour obtenir les IDs samples

Executer dans Supabase SQL Editor **avant** de lancer le script, pour avoir des IDs concrets.

```sql
-- 5 artisans RGE actifs avec slug utilisable
SELECT id, name, slug, stable_id, specialty, address_city, rge_valid_until
FROM providers
WHERE is_active = true
  AND noindex = false
  AND rge_valid_until > now()
  AND slug IS NOT NULL
  AND specialty IS NOT NULL
  AND address_city IS NOT NULL
ORDER BY rge_valid_until DESC
LIMIT 5;
```

```sql
-- 5 providers non-RGE non-claim avec slug (futurs Tier C)
SELECT id, name, slug, stable_id, specialty, address_city
FROM providers
WHERE is_active = true
  AND noindex = false
  AND claimed_at IS NULL
  AND (rge_valid_until IS NULL OR rge_valid_until <= now())
  AND slug IS NOT NULL
  AND specialty IS NOT NULL
  AND address_city IS NOT NULL
LIMIT 5;
```

Ces requetes doivent etre lancées **avant** le script (sur des providers encore `noindex=false`)
pour capturer des IDs valides a utiliser comme samples dans les checks ci-dessus.
