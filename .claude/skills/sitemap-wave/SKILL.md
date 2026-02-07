# /sitemap-wave

## But
Verifier l'integrite du sitemap dynamique: seules les pages autorisees sont presentes,
aucun fallback, aucune URL avec slug/id brut, et echec si la DB est inaccessible.

## Entrees
- Connexion Supabase (variables `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`)
- Code source: `src/app/sitemap.ts`

## Sorties
- Rapport texte: liste des URL du sitemap, validation ok/ko par categorie
- Exit code 0 si conforme, 1 si anomalie

## Etapes

### 1. Verifier le code source du sitemap
```bash
# Le sitemap doit echouer loud si DB inaccessible (throw, pas fallback)
grep -n "throw" src/app/sitemap.ts || { echo "FAIL: sitemap.ts ne throw pas sur erreur DB"; exit 1; }

# Pas de fallback statique pour les providers
grep -n "fallback\|catch.*\[\]\|catch.*static" src/app/sitemap.ts && { echo "FAIL: sitemap.ts contient un fallback"; exit 1; } || echo "OK: pas de fallback detecte"

# Les URL fiche utilisent stable_id, pas slug ni id
grep -n "stable_id" src/app/sitemap.ts || { echo "FAIL: sitemap.ts n'utilise pas stable_id"; exit 1; }

# Pas de pattern slug||id ou stable_id||slug
grep -En "stable_id\s*\|\||\|\|\s*slug|\|\|\s*\.id" src/app/sitemap.ts && { echo "FAIL: fallback URL detecte dans sitemap.ts"; exit 1; } || echo "OK: pas de fallback URL"
```

### 2. Verifier les filtres du sitemap
```bash
# Le sitemap doit filtrer sur noindex=false
grep -n "noindex.*false\|eq.*noindex.*false" src/app/sitemap.ts || { echo "FAIL: sitemap.ts ne filtre pas sur noindex=false"; exit 1; }
echo "OK: filtre noindex=false present"

# Le sitemap doit filtrer sur is_active=true
grep -n "is_active.*true\|eq.*is_active.*true" src/app/sitemap.ts || { echo "FAIL: sitemap.ts ne filtre pas sur is_active=true"; exit 1; }
echo "OK: filtre is_active=true present"
```

### 3. Verifier les pages statiques autorisees
```bash
# Extraire les URL statiques du sitemap
grep -oP "url:\s*['\"\`].*?['\"\`]" src/app/sitemap.ts | grep -oP "(?<=[\`'\"]).*?(?=[\`'\"])"

# Pages statiques autorisees:
ALLOWED="/ /services /faq /a-propos /contact /comment-ca-marche /tarifs-artisans /blog /mentions-legales /confidentialite /cgv /accessibilite"
echo "Pages statiques autorisees: $ALLOWED"
echo "OK: verifier manuellement que les pages statiques correspondent"
```

### 4. Valider avec la DB (obligatoire — FAIL si inaccessible)
```bash
# Prerequis env
test -n "$NEXT_PUBLIC_SUPABASE_URL" || { echo "FAIL: NEXT_PUBLIC_SUPABASE_URL manquant"; exit 1; }
test -n "$SUPABASE_SERVICE_ROLE_KEY" || { echo "FAIL: SUPABASE_SERVICE_ROLE_KEY manquant"; exit 1; }

npx tsx -e "
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Recuperer les providers indexables
const { data: providers, error } = await sb.from('providers')
  .select('stable_id, specialty, address_city, is_active, noindex')
  .eq('is_active', true)
  .eq('noindex', false);

if (error) { console.error('FAIL: DB inaccessible —', error.message); process.exit(1); }

console.log('Providers indexables: ' + providers.length);

// Verifier que chaque provider a un stable_id
const missing = providers.filter(p => !p.stable_id);
if (missing.length > 0) {
  console.error('FAIL: ' + missing.length + ' providers indexables sans stable_id');
  process.exit(1);
}

// Verifier que chaque provider a specialty et address_city (requis pour URL)
const incomplete = providers.filter(p => !p.specialty || !p.address_city);
if (incomplete.length > 0) {
  console.error('FAIL: ' + incomplete.length + ' providers indexables sans specialty ou address_city');
  process.exit(1);
}

// Verifier qu'aucun provider noindex=true n'est inclus
const { count: noindexCount, error: e2 } = await sb.from('providers')
  .select('id', { count: 'exact', head: true })
  .eq('is_active', true)
  .eq('noindex', true);
if (e2) { console.error('FAIL:', e2.message); process.exit(1); }

console.log('Providers noindex=true (exclus du sitemap): ' + noindexCount);
console.log('OK: sitemap ne contiendra que les ' + providers.length + ' providers indexables');

// Lister les hubs deduits
const hubs = new Set();
providers.forEach(p => {
  const slugify = t => t.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  hubs.add(slugify(p.specialty) + '/' + slugify(p.address_city));
});
console.log('Hubs deduits: ' + hubs.size);
hubs.forEach(h => console.log('  /services/' + h));
"
```

## Interdictions
- Ne JAMAIS generer de sitemap avec des URL de fallback (slug, UUID, id au lieu de stable_id)
- Ne JAMAIS inclure des providers avec noindex=true dans le sitemap
- Ne JAMAIS inclure des routes admin, auth, ou API dans le sitemap
- Ne JAMAIS catch silencieusement une erreur DB — le sitemap DOIT echouer loud
- Ne JAMAIS inclure des providers inactifs (is_active=false)
- Ne JAMAIS ajouter de pages statiques non autorisees

## Criteres d'acceptation
| Critere | Attendu |
|---------|---------|
| sitemap.ts throw sur erreur DB | `throw` present, pas de catch silencieux |
| Pas de fallback URL | Aucun pattern `stable_id \|\| slug` ou `slug \|\| id` |
| Filtre noindex=false | Query inclut `.eq('noindex', false)` |
| Filtre is_active=true | Query inclut `.eq('is_active', true)` |
| URL fiche utilise stable_id | Pattern `/${stable_id}` dans la construction d'URL |
| Hubs deduits des providers | Pas de hubs hardcodes |
| Pages statiques conformes | Uniquement les pages de la whitelist |
| DB inaccessible = echec | Pas de fallback vers un sitemap statique |
