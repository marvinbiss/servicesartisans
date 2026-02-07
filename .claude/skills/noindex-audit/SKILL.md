# /noindex-audit

## But
Auditer la coherence du flag noindex dans la base de donnees et verifier
qu'aucun provider noindex=true ne fuit dans le sitemap ou les meta robots.

## Entrees
- Connexion Supabase (variables `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`)
- Code source: `src/app/sitemap.ts`, pages fiche artisan

## Sorties
- Rapport texte structuré:
  - Counts indexables vs noindex par service x location
  - Anomalies detectees (ok/ko + liste)
- Exit code 0 si conforme, 1 si anomalie

## Etapes

### 0. Verifier les prerequis environnement
```bash
test -n "$NEXT_PUBLIC_SUPABASE_URL" || { echo "FAIL: NEXT_PUBLIC_SUPABASE_URL manquant"; exit 1; }
test -n "$SUPABASE_SERVICE_ROLE_KEY" || { echo "FAIL: SUPABASE_SERVICE_ROLE_KEY manquant"; exit 1; }
```

### 1. Rapport de distribution noindex par service x location
```bash
npx tsx -e "
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data, error } = await sb.from('providers')
  .select('specialty, address_city, noindex, is_active')
  .eq('is_active', true);

if (error) { console.error('FAIL: DB inaccessible —', error.message); process.exit(1); }

// Grouper par service x location
const groups = {};
data.forEach(p => {
  const key = (p.specialty || 'UNKNOWN') + ' x ' + (p.address_city || 'UNKNOWN');
  if (!groups[key]) groups[key] = { indexable: 0, noindex: 0 };
  if (p.noindex === false) groups[key].indexable++;
  else groups[key].noindex++;
});

console.log('=== DISTRIBUTION noindex PAR SERVICE x LOCATION ===');
console.log('');
Object.entries(groups)
  .sort((a, b) => b[1].indexable - a[1].indexable)
  .forEach(([key, counts]) => {
    console.log(key + ': ' + counts.indexable + ' indexables, ' + counts.noindex + ' noindex');
  });
console.log('');
console.log('Total groupes: ' + Object.keys(groups).length);
"
```

### 2. Verifier que le sitemap exclut les providers noindex=true
```bash
# Verification statique: le code filtre sur noindex=false
grep -n "noindex.*false" src/app/sitemap.ts || { echo "FAIL: sitemap.ts ne filtre pas noindex"; exit 1; }
echo "OK: sitemap.ts filtre sur noindex=false"
```

### 3. Verifier les meta robots dans les pages fiche
```bash
# Chercher la logique meta robots dans les pages fiche provider
# Le fichier fiche est: src/app/(public)/services/[service]/[location]/[publicId]/page.tsx
FICHE="src/app/(public)/services/[service]/[location]/[publicId]/page.tsx"

if [ -f "$FICHE" ]; then
  # Verifier que la page gere le cas noindex
  grep -n "noindex\|robots\|metadata" "$FICHE" || echo "WARN: pas de gestion noindex dans la page fiche"

  # Verifier qu'il n'y a pas de fallback URL
  grep -En "stable_id\s*\|\||\|\|\s*slug|\|\|\s*\.id" "$FICHE" && { echo "FAIL: fallback URL dans la page fiche"; exit 1; } || echo "OK: pas de fallback URL dans la page fiche"
else
  echo "WARN: fichier fiche non trouve a $FICHE"
fi
```

### 4. Verifier la coherence DB: providers indexables ont stable_id
```bash
npx tsx -e "
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Providers indexables sans stable_id = anomalie
const { data: broken, error } = await sb.from('providers')
  .select('id, name, address_city, specialty')
  .eq('is_active', true)
  .eq('noindex', false)
  .is('stable_id', null);

if (error) { console.error('FAIL:', error.message); process.exit(1); }

if (broken && broken.length > 0) {
  console.error('FAIL: ' + broken.length + ' providers indexables sans stable_id:');
  broken.forEach(p => console.error('  ' + p.name + ' (' + p.specialty + ', ' + p.address_city + ')'));
  process.exit(1);
}
console.log('OK: tous les providers indexables ont un stable_id');
"
```

### 5. Verifier qu'aucun provider noindex=true n'a de URL dans le sitemap
```bash
npx tsx -e "
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Recuperer les stable_id des providers noindex=true
const { data: hidden, error } = await sb.from('providers')
  .select('stable_id')
  .eq('is_active', true)
  .eq('noindex', true)
  .not('stable_id', 'is', null);

if (error) { console.error('FAIL:', error.message); process.exit(1); }

const hiddenIds = new Set(hidden.map(p => p.stable_id));
console.log('Providers noindex avec stable_id: ' + hiddenIds.size);

// Recuperer les providers dans le sitemap (noindex=false)
const { data: visible, error: e2 } = await sb.from('providers')
  .select('stable_id')
  .eq('is_active', true)
  .eq('noindex', false)
  .not('stable_id', 'is', null);

if (e2) { console.error('FAIL:', e2.message); process.exit(1); }

// Verifier qu'aucun hidden n'est dans visible
const leaks = visible.filter(p => hiddenIds.has(p.stable_id));
if (leaks.length > 0) {
  console.error('FAIL: ' + leaks.length + ' providers noindex=true trouves dans le set indexable');
  process.exit(1);
}
console.log('OK: aucune fuite — ' + visible.length + ' providers indexables, ' + hiddenIds.size + ' hidden');
"
```

## Interdictions
- Ne JAMAIS modifier le flag noindex d'un provider
- Ne JAMAIS passer noindex=false en masse sans approbation de vague
- Ne JAMAIS considerer un provider sans stable_id comme indexable
- Ne JAMAIS ignorer une erreur DB — echouer loud

## Criteres d'acceptation
| Critere | Attendu |
|---------|---------|
| Rapport distribution genere | Counts par service x location |
| Sitemap filtre noindex | Code source verifie |
| Meta robots coherent | Pages fiche gerent le cas noindex |
| Indexables ont stable_id | Aucun provider indexable sans stable_id |
| Pas de fuite noindex | Aucun provider noindex=true dans le set indexable |
| Pas de fallback URL | Aucun pattern `stable_id \|\| slug` |
