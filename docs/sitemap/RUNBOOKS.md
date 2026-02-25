# Runbooks opérationnels — Sitemaps ServicesArtisans

> Version: 1.0 | Date: 2026-02-24 | Owner: SRE

---

## RB-01: Impossible de récupérer le sitemap (GSC spike / 5xx)

### Symptômes
- Google Search Console signale une hausse d'erreurs "Impossible de récupérer le sitemap"
- `curl -I https://servicesartisans.fr/sitemap.xml` retourne 500, 502, 503 ou timeout
- Dashboard Vercel montre des erreurs sur `/api/sitemap-index`

### Diagnostic

```bash
# 1. Vérifier l'accès direct
curl -sI https://servicesartisans.fr/sitemap.xml | head -20

# 2. Vérifier la route API directement (bypass rewrite)
curl -sI https://servicesartisans.fr/api/sitemap-index | head -20

# 3. Vérifier Supabase (la route query providers count)
curl -s https://servicesartisans.fr/api/sitemap-index | head -5

# 4. Vérifier les logs Vercel
# Vercel Dashboard → Projet → Functions → Filter: "sitemap-index"

# 5. Audit rapide
node tools/audit-sitemaps.mjs --sample 5 --json
```

### Hypothèses
1. **Vercel edge down** → vérifier status.vercel.com
2. **Supabase down** → la route catch l'erreur DB et génère l'index sans providers, mais si l'import dynamique de `@/lib/supabase/admin` échoue au module level, le handler crash
3. **Rewrite cassé** → un changement dans `next.config.js` a supprimé `/sitemap.xml → /api/sitemap-index`
4. **Deploy en cours** → cold start temporaire

### Actions
1. **Si Vercel down** : attendre ou basculer sur un backup statique (voir Hotfix ci-dessous)
2. **Si Supabase down** : la route doit fallback gracieusement (vérifier les logs d'erreur). Si crash complet, redéployer avec un fallback hardcodé.
3. **Si rewrite cassé** :
   ```bash
   # Vérifier que next.config.js contient la rewrite
   grep -n "sitemap.xml" next.config.js
   # Si absent, restaurer et redéployer
   ```
4. **Si cold start** : attendre 30s et re-tester

### Hotfix — Sitemap statique d'urgence
```bash
# Générer un sitemap index statique depuis le manifest
node -e "
const m = require('./src/lib/seo/sitemap-manifest');
const urls = m.getSitemapIndexUrls({ activeProvidersCount: 0 });
const xml = '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<sitemapindex xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n' +
  urls.map(u => '  <sitemap><loc>' + u + '</loc></sitemap>').join('\n') +
  '\n</sitemapindex>';
require('fs').writeFileSync('public/sitemap-emergency.xml', xml);
console.log('Written public/sitemap-emergency.xml with', urls.length, 'entries (no providers)');
"
# Puis dans next.config.js, changer la rewrite temporairement
```

### Validation post-fix
```bash
curl -sI https://servicesartisans.fr/sitemap.xml
# Doit retourner: HTTP/2 200, Content-Type: application/xml
node tools/audit-sitemaps.mjs --sample 10 --strict --json
# Doit retourner: { "pass": true }
```

### Escalade
Si non résolu en 30 min → P0, escalade CTO + rollback Vercel au dernier deploy stable.

---

## RB-02: XML invalide détecté

### Symptômes
- Audit nightly/post-deploy échoue avec `"reason": "Contains unescaped & character"` ou `"Unbalanced tags"`
- GSC signale "Erreur d'analyse XML"

### Diagnostic

```bash
# 1. Identifier quel sitemap est invalide
node tools/audit-sitemaps.mjs --all --strict --json 2>/dev/null | \
  node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); d.stats.failures.forEach(f=>console.log(f.loc, '→', f.reason))"

# 2. Télécharger le sitemap fautif
curl -s "https://servicesartisans.fr/sitemap/providers-0.xml" > /tmp/bad-sitemap.xml

# 3. Chercher les caractères non échappés
grep -n '&[^a]' /tmp/bad-sitemap.xml | grep -v '&amp;\|&lt;\|&gt;\|&quot;\|&apos;'

# 4. Valider avec xmllint si disponible
xmllint --noout /tmp/bad-sitemap.xml
```

### Hypothèses
1. **Provider avec `&` dans le nom/ville** → `escapeXmlLoc()` non appliqué ou bypassé
2. **Régression** : quelqu'un a ajouté du contenu dynamique sans passer par `escapeXmlLoc()`
3. **Encoding double** : `&amp;amp;` au lieu de `&amp;`

### Actions
1. Vérifier que **tous** les contenus dynamiques passent par `escapeXmlLoc()` :
   ```bash
   grep -n 'escapeXmlLoc' src/app/api/sitemap-providers/route.ts
   grep -n 'escapeXmlLoc' src/app/api/sitemap-index/route.ts
   ```
2. Si un nouveau champ a été ajouté sans escaping → ajouter `escapeXmlLoc()`
3. Lancer les tests anti-régression :
   ```bash
   npx vitest run __tests__/lib/seo/sitemap-manifest.test.ts
   npx vitest run __tests__/lib/seo/sitemap-failure-modes.test.ts
   ```

### Rollback
```bash
# Trouver le dernier commit qui touchait les fichiers sitemap
git log --oneline -10 -- src/app/api/sitemap-providers/ src/app/api/sitemap-index/ src/lib/seo/
# Revert si nécessaire
git revert <commit-sha>
```

### Validation post-fix
```bash
node tools/audit-sitemaps.mjs --all --strict --json
# "pass": true, 0 failures
npx vitest run __tests__/lib/seo/
```

### Escalade
P2 si sitemaps statiques touchés (coverage SEO réduite). P1 si l'index lui-même est invalide.

---

## RB-03: Supabase dégradé / timeouts providers

### Symptômes
- Sitemaps providers retournent XML vide (0 URLs) alors que des providers existent
- Logs Vercel montrent `sitemap-providers failed, returning empty sitemap`
- Latence p95 > 5s sur les sitemaps providers
- `sitemap-index` log montre `activeProvidersCount: 0` alors que la DB a des providers

### Diagnostic

```bash
# 1. Vérifier Supabase status
curl -s https://status.supabase.com/api/v2/status.json | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));console.log(d.status?.description)"

# 2. Tester la requête providers directement
curl -s "https://$NEXT_PUBLIC_SUPABASE_URL/rest/v1/providers?select=id&is_active=eq.true&noindex=eq.false&limit=1" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"

# 3. Vérifier les providers sitemaps
for i in 0 1 2; do
  echo "--- providers-$i ---"
  curl -s "https://servicesartisans.fr/sitemap/providers-$i.xml" | grep -c '<url>'
done

# 4. Vérifier la latence
time curl -s "https://servicesartisans.fr/sitemap/providers-0.xml" > /dev/null

# 5. Checker les logs structurés
# Vercel Dashboard → Functions → Filter: "sitemap-providers"
# Chercher: durationMs > 5000, droppedProviders anormal
```

### Hypothèses
1. **Table pré-calculée vide** → la table `provider_sitemap_urls` n'a pas été peuplée (refresh pas encore exécuté). Le système utilise le legacy fallback (plus lent).
2. **Supabase incident global** → attendre la résolution
3. **Connection pool saturé** → trop de fonctions serverless simultanées
4. **RLS ou permissions** → le service_role key a expiré ou a été changé
5. **Legacy fallback activé** → les logs montrent `path: 'legacy'` au lieu de `path: 'fast'`

### Actions
1. **Si table pré-calculée vide** :
   ```bash
   # Exécuter le refresh manuellement
   npx tsx src/lib/seo/refresh-provider-sitemaps.ts
   # Ou vérifier la table directement
   # Supabase Dashboard → Table editor → provider_sitemap_urls → count
   ```
2. **Si Supabase down** : rien à faire côté code. Le fallback XML vide protège contre les 500. Les sitemaps CDN-cached (1h) servent la dernière version valide.
3. **Si timeout récurrent** :
   ```sql
   -- Vérifier les index
   SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'providers';
   SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'provider_sitemap_urls';
   ```
4. **Si service_role changé** : mettre à jour `SUPABASE_SERVICE_ROLE_KEY` dans Vercel env vars et redéployer
5. **Si legacy fallback actif** : vérifier dans les logs Vercel que `path` = `'fast'`. Si `'legacy'`, exécuter le refresh.

### Validation post-fix
```bash
# Vérifier que les providers reviennent
node tools/audit-sitemaps.mjs --url https://servicesartisans.fr/sitemap.xml --all --strict --json
# Vérifier les comptes d'URL
curl -s https://servicesartisans.fr/sitemap/providers-0.xml | grep -c '<url>'
# Doit être > 0
```

### Escalade
P2. Si dure > 4h et Google crawle pendant la panne → P1 (perte de couverture providers).

---

## RB-04: Index divergence (index référence enfant KO)

### Symptômes
- L'index `/sitemap.xml` liste un `<loc>` qui retourne 404
- Audit montre `"reason": "HTTP 404"` pour certains enfants
- Nombre de sitemaps dans l'index ne correspond pas au nombre réel

### Diagnostic

```bash
# 1. Lister tous les enfants de l'index
curl -s https://servicesartisans.fr/sitemap.xml | grep -oP '<loc>\K[^<]+' > /tmp/index-locs.txt
wc -l /tmp/index-locs.txt

# 2. Tester chaque enfant
while read url; do
  status=$(curl -sI "$url" | head -1 | awk '{print $2}')
  if [ "$status" != "200" ]; then
    echo "FAIL $status $url"
  fi
done < /tmp/index-locs.txt

# 3. Vérifier la cohérence manifest ↔ index
node -e "
const m = require('./src/lib/seo/sitemap-manifest');
const staticIds = m.getStaticSitemapIds();
console.log('Static IDs:', staticIds.length);
console.log('Sample:', staticIds.slice(0, 5));
"

# 4. Audit complet
node tools/audit-sitemaps.mjs --all --strict --json
```

### Hypothèses
1. **Providers batch count a changé** : le nombre de providers actifs a diminué → l'index référence des batch qui n'existent plus (ex: `providers-5` alors qu'il n'y a que 3 batches)
2. **Static sitemap build échoué** : un changement data (france.ts) a changé le nombre de sitemaps statiques
3. **Rewrite provider manquante** : la rewrite `/sitemap/providers-:id.xml → /api/sitemap-providers?id=:id` est cassée
4. **CDN stale** : l'index est cached avec l'ancien count mais les enfants ont changé

### Actions
1. **Providers batch** : le provider sitemap retourne XML vide (200) pour des batch inexistants, donc pas de 404. Si 404, vérifier la rewrite dans `next.config.js`.
2. **Static sitemap** : vérifier que le build Next.js a terminé sans erreur
   ```bash
   npm run build 2>&1 | grep -i "sitemap\|error"
   ```
3. **CDN stale** : forcer l'invalidation
   ```bash
   # Via Vercel CLI
   vercel --scope=servicesartisans --prod --force
   ```

### Validation post-fix
```bash
node tools/audit-sitemaps.mjs --all --strict --json
# 0 failures, tous les enfants en 200
```

### Escalade
P2 si < 5% enfants KO. P1 si > 5% ou si l'index lui-même est KO.

---

## RB-05: Cache mismatch / stale rollout

### Symptômes
- Après un deploy, les anciens sitemaps sont encore servis (contenu périmé)
- Les nouveaux sitemaps ajoutés ne sont pas accessibles (404 malgré le deploy)
- Le nombre de sitemaps dans l'index ne correspond pas aux attentes post-deploy

### Diagnostic

```bash
# 1. Vérifier les headers de cache
curl -sI https://servicesartisans.fr/sitemap.xml | grep -i "cache\|age\|x-vercel"
curl -sI https://servicesartisans.fr/sitemap/providers-0.xml | grep -i "cache\|age\|x-vercel"

# 2. Vérifier la date du deploy
# Vercel Dashboard → Deployments → dernier deploy

# 3. Comparer le contenu attendu vs servi
node -e "
const m = require('./src/lib/seo/sitemap-manifest');
console.log('Expected static IDs:', m.getStaticSitemapIds().length);
"
curl -s https://servicesartisans.fr/sitemap.xml | grep -c '<sitemap>'

# 4. Vérifier un sitemap statique vs dynamique
curl -sI "https://servicesartisans.fr/sitemap/static.xml" | grep -i age
curl -sI "https://servicesartisans.fr/sitemap/providers-0.xml" | grep -i age
```

### Hypothèses
1. **CDN TTL** : `s-maxage=3600` → jusqu'à 1h de stale. Normal.
2. **stale-while-revalidate** : jusqu'à 24h de stale si le backend est lent à répondre. Normal mais peut surprendre.
3. **Deploy partiel** : Vercel déploie mais le build a utilisé l'ancien code → vérifier les logs de build
4. **ISR stale** : les sitemaps statiques (build-time) ne sont pas re-générés tant qu'il n'y a pas de rebuild

### Actions
1. **Attendre le TTL** : les sitemaps dynamiques (index, providers) se rafraîchissent en 1h max. Les statiques nécessitent un rebuild.
2. **Forcer le redéploiement** :
   ```bash
   vercel --scope=servicesartisans --prod --force
   ```
3. **Si ISR stale** : les sitemaps statiques (générés par `generateSitemaps()`) sont figés au build. Un changement de données nécessite un rebuild complet.

### Validation post-fix
```bash
# Vérifier que le cache s'est rafraîchi
curl -sI https://servicesartisans.fr/sitemap.xml | grep -i "x-vercel-cache"
# Attendu: MISS ou HIT avec age < 3600
node tools/audit-sitemaps.mjs --sample 10 --strict --json
```

### Escalade
P3 sauf si Google crawle pendant la fenêtre stale → P2.

---

## RB-06: Drop ratio providers anormalement élevé

### Symptômes
- Les logs montrent `droppedProviders` > 10% de `providersQueried`
- L'audit montre des sitemaps providers avec très peu d'URLs vs le nombre attendu
- Le total d'URLs providers diminue significativement entre deux runs

### Diagnostic

```bash
# 1. Vérifier les logs de drop
# Vercel Dashboard → Functions → Filter: "sitemap-providers"
# Chercher: droppedProviders > X

# 2. Analyser un échantillon de providers droppés
# Requête Supabase pour les providers actifs sans mapping
node -e "
const { createAdminClient } = require('./src/lib/supabase/admin');
const s = createAdminClient();
s.from('providers').select('specialty, address_city').eq('is_active', true).eq('noindex', false).limit(20)
  .then(({data}) => {
    console.log('Sample specialties:', [...new Set(data.map(p => p.specialty))].slice(0, 10));
    console.log('Sample cities:', [...new Set(data.map(p => p.address_city))].slice(0, 10));
  });
"

# 3. Vérifier les mappings specialty → slug
# Inspecter src/app/api/sitemap-providers/route.ts pour les mappings manquants
grep -c "=>" src/app/api/sitemap-providers/route.ts

# 4. Comparer avec le run précédent
diff <(jq '.stats.urlsPerSitemap' baseline.json) <(jq '.stats.urlsPerSitemap' current.json)
```

### Hypothèses
1. **Nouvelles spécialités** : des providers ont été ajoutés avec des specialties non mappées dans `specialtyToSlug`
2. **Données corrompues** : `address_city` contient des codes INSEE non résolus par `inseeMap`
3. **Changement data** : `france.ts` a été modifié, des villes ont été supprimées → `villeMap` ne contient plus certaines villes
4. **NULL values** : providers avec `name`, `specialty` ou `address_city` NULL → filtrés par le `.filter()`

### Actions
1. **Ajouter les mappings manquants** :
   ```typescript
   // Dans src/app/api/sitemap-providers/route.ts → specialtyToSlug
   'nouvelle-specialite': 'slug-existant',
   ```
2. **Corriger les données** : mettre à jour les providers avec des specialties/villes invalides dans Supabase
3. **Élargir la résolution** : ajouter le code INSEE manquant dans `insee-communes.json`

### Validation post-fix
```bash
# Redéployer et vérifier le ratio
node tools/audit-sitemaps.mjs --all --strict --json
# Vérifier dans les logs que droppedProviders < 10%
```

### Escalade
P3 si drop ratio < 15%. P2 si > 15% (perte significative de couverture SEO providers).

---

## RB-07: Snapshot refresh — Échec ou données corrompues

### Symptômes
- Les logs montrent `Refresh failed` ou `Validation failed`
- La table `sitemap_snapshots` montre le dernier snapshot en `failed` ou `building` (zombie)
- Le fast path sert des données périmées (snapshot stale > 7 jours)
- Les logs route montrent `critically stale` ou `approaching staleness`

### Diagnostic

```bash
# 1. Vérifier l'état des snapshots
# Supabase Dashboard → Table editor → sitemap_snapshots → ORDER BY snapshot_id DESC

# 2. Vérifier le snapshot actif
# SELECT * FROM sitemap_snapshots WHERE status = 'active'

# 3. Vérifier les logs de refresh
# Chercher dans Vercel Functions les logs avec "Refresh complete" ou "Refresh failed"

# 4. Vérifier s'il y a un zombie (building depuis > 30 min)
# SELECT * FROM sitemap_snapshots WHERE status = 'building'

# 5. Tester le fast path
curl -s "https://servicesartisans.fr/sitemap/providers-0.xml" | head -5
# Vérifier dans les logs: path = 'fast' ou 'legacy'
```

### Hypothèses
1. **Refresh échoué** → la validation post-refresh a rejeté le nouveau snapshot (ratio d'insert < 90%, ratio résolu < 50%, delta batch count > 50%)
2. **Zombie snapshot** → un refresh précédent a crashé, laissant un snapshot en `building` qui bloque les suivants (DB-level lock via unique partial index `idx_snapshots_one_building`). Le cleanup automatique se fait après 30 min (ZOMBIE_TIMEOUT_MS).
3. **Concurrence bloquée** → deux refreshes tentés simultanément, le second est rejeté avec PostgreSQL error code `23505` (unique_violation). C'est le comportement normal du DB-level lock — aucune intervention nécessaire.
4. **Supabase down** → les requêtes INSERT échouent pendant le refresh
5. **Données source corrompues** → les providers ont changé massivement (nouvelle migration de spécialités)
6. **RPC indisponible** → la function `activate_sitemap_snapshot()` n'est pas déployée (migration 347 non appliquée). Le script utilise le fallback à deux UPDATEs séparés.
7. **Double active snapshot** → l'index unique `idx_snapshots_one_active` empêche > 1 active. Si violation détectée, la route prend le snapshot_id le plus élevé (ORDER BY snapshot_id DESC).

### Diagnostic avancé (DB-level invariants)

```sql
-- Vérifier les index de protection (migration 347)
SELECT indexname, indexdef FROM pg_indexes
WHERE indexname IN (
  'idx_snapshots_one_building',   -- DB-level lock (at most 1 building)
  'idx_snapshots_one_active',     -- single active invariant
  'idx_psm_provider_per_snapshot' -- UNIQUE(snapshot_id, provider_id)
);

-- Vérifier qu'il n'y a jamais > 1 active
SELECT count(*) FROM sitemap_snapshots WHERE status = 'active';
-- Attendu: 0 ou 1

-- Vérifier s'il y a un lock actif (building)
SELECT snapshot_id, created_at, now() - created_at AS age
FROM sitemap_snapshots WHERE status = 'building';

-- Vérifier la RPC function
SELECT proname, prosrc FROM pg_proc WHERE proname = 'activate_sitemap_snapshot';

-- Vérifier les validation checks du dernier échec
SELECT snapshot_id, status, validation_errors, error_message, created_at
FROM sitemap_snapshots WHERE status = 'failed'
ORDER BY snapshot_id DESC LIMIT 3;

-- Vérifier la rétention GC (doit garder active + 1 superseded)
SELECT snapshot_id, status, activated_at, superseded_at
FROM sitemap_snapshots
WHERE status IN ('active', 'superseded')
ORDER BY snapshot_id DESC;
```

### Actions
1. **Si snapshot zombie (building > 30 min)** : le prochain refresh nettoiera automatiquement (ZOMBIE_TIMEOUT_MS = 30 min). Pour forcer manuellement :
   ```sql
   -- Marquer le zombie comme failed (libère le DB-level lock)
   UPDATE sitemap_snapshots SET status = 'failed', error_message = 'Manual cleanup'
   WHERE status = 'building';
   -- Nettoyer les rows orphelines du zombie
   DELETE FROM provider_sitemap_urls
   WHERE snapshot_id IN (SELECT snapshot_id FROM sitemap_snapshots WHERE status = 'failed');
   ```
2. **Si validation hard-fail** : examiner `validation_errors` dans le snapshot record. Les checks sont :
   - `insert_ratio` (hard-fail si < 90%) : inserts DB échoués → vérifier connectivity Supabase
   - `resolved_ratio` (hard-fail si < 50%) : trop de providers non résolus → vérifier mappings dans provider-url-resolver.ts
   - `db_row_count` (hard-fail si != expected) : corruption → investiguer les rows partielles
   - `batch_count_delta` (warning si > 50%) : variation normale possible, mais investiguer si inattendu
3. **Si données stale** : relancer le refresh manuellement :
   ```bash
   npx tsx src/lib/seo/refresh-provider-sitemaps.ts
   ```
4. **Si le fast path doit être désactivé en urgence** (kill-switch) :
   ```bash
   # Dans Vercel Environment Variables
   SITEMAP_PROVIDERS_FORCE_LEGACY=true
   # Redéployer
   ```
5. **Si rollback nécessaire** : le GC conserve le dernier snapshot superseded. Pour rollback, utiliser la RPC `force_activate_sitemap_snapshot` (atomique, auditée, idempotente) :
   ```sql
   -- Identifier le dernier superseded
   SELECT snapshot_id, activated_at, resolved_urls, batch_count
   FROM sitemap_snapshots WHERE status = 'superseded'
   ORDER BY snapshot_id DESC LIMIT 1;

   -- Force-activate le snapshot superseded (atomique, audit trail)
   SELECT force_activate_sitemap_snapshot(<snapshot_id>, 'Rollback: <raison>');

   -- Vérifier le résultat
   SELECT snapshot_id, status FROM sitemap_snapshots WHERE status = 'active';
   ```
   Note: `force_activate` accepte les snapshots en état `superseded`, `failed`, ou `validating`. Il est idempotent (no-op si déjà active). La raison est stockée dans `error_message` pour audit.

### Validation post-fix
```bash
# Vérifier que le snapshot est actif
# SELECT status, activated_at, resolved_urls, batch_count FROM sitemap_snapshots WHERE status = 'active'

# Vérifier le fast path
curl -s "https://servicesartisans.fr/sitemap/providers-0.xml" | grep -c '<url>'
# Doit être > 0

# Vérifier les invariants DB
# SELECT count(*) FROM sitemap_snapshots WHERE status = 'active'; -- doit être 1
# SELECT count(*) FROM sitemap_snapshots WHERE status = 'building'; -- doit être 0

# Audit rapide
node tools/audit-sitemaps.mjs --sample 10 --strict --json
```

### Escalade
P3 si le legacy fallback fonctionne correctement. P2 si les sitemaps providers sont vides ou très lents (> 5s).

---

## RB-08: Kill-switch activé — forcer le retour au fast path

### Symptômes
- Les logs montrent `kill-switch active (SITEMAP_PROVIDERS_FORCE_LEGACY=true)` sur toutes les requêtes
- Performance dégradée (latence legacy > 2s vs fast path < 500ms)

### Actions
1. Vérifier que le problème qui a motivé le kill-switch est résolu
2. Relancer un refresh si nécessaire : `npx tsx src/lib/seo/refresh-provider-sitemaps.ts`
3. Retirer la variable d'environnement :
   ```bash
   # Vercel Dashboard → Settings → Environment Variables
   # Supprimer SITEMAP_PROVIDERS_FORCE_LEGACY
   # Redéployer
   ```
4. Vérifier dans les logs que `path: 'fast'` revient

### Escalade
P3 — le legacy fallback est fonctionnel, seule la performance est impactée.
