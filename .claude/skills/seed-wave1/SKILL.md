# /seed-wave1

## But
Verifier et preparer la base de donnees pour la wave 1 du sitemap:
service=plombier, location=paris, 200 providers dont 5 indexables.

## Entrees
- Connexion Supabase (variables `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`)
- Aucun parametre utilisateur requis

## Sorties
- Rapport texte: counts par table, status ok/ko
- Aucune modification si les donnees sont deja conformes

## Etapes

### 1. Verifier les prerequis environnement
```bash
# Verifier que les variables sont presentes
test -n "$NEXT_PUBLIC_SUPABASE_URL" || { echo "FAIL: NEXT_PUBLIC_SUPABASE_URL manquant"; exit 1; }
test -n "$SUPABASE_SERVICE_ROLE_KEY" || { echo "FAIL: SUPABASE_SERVICE_ROLE_KEY manquant"; exit 1; }
```

### 2. Verifier le service plombier
```bash
# Verifier que le service plombier existe dans la table services
npx tsx -e "
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data, error } = await sb.from('services').select('id, slug').eq('slug', 'plombier').single();
if (error || !data) { console.error('FAIL: service plombier absent —', error?.message); process.exit(1); }
console.log('OK: service plombier existe, id=' + data.id);
"
```
Si absent: executer `npx tsx scripts/seed.ts` pour creer les services de base.

### 3. Verifier la location paris
```bash
# Verifier locations table pour paris
npx tsx -e "
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data, error } = await sb.from('locations').select('id, name, postal_code').ilike('name', '%paris%').limit(1);
if (error) { console.error('FAIL: erreur locations —', error.message); process.exit(1); }
if (!data || data.length === 0) { console.error('FAIL: location paris absente'); process.exit(1); }
console.log('OK: location paris existe —', JSON.stringify(data[0]));
"
```

### 4. Compter les providers paris x plombier
```bash
npx tsx -e "
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { count, error } = await sb.from('providers')
  .select('id', { count: 'exact', head: true })
  .ilike('address_city', '%paris%')
  .ilike('specialty', '%plombier%')
  .eq('is_active', true);
if (error) { console.error('FAIL: erreur count providers —', error.message); process.exit(1); }
console.log('Providers paris x plombier: ' + count);
if (count !== 200) { console.error('FAIL: attendu 200, trouve ' + count); process.exit(1); }
console.log('OK: 200 providers');
"
```

### 5. Verifier les 5 indexables (noindex=false)
```bash
npx tsx -e "
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Count indexable
const { count: indexable, error: e1 } = await sb.from('providers')
  .select('id', { count: 'exact', head: true })
  .ilike('address_city', '%paris%')
  .ilike('specialty', '%plombier%')
  .eq('is_active', true)
  .eq('noindex', false);
if (e1) { console.error('FAIL:', e1.message); process.exit(1); }

// Count noindex
const { count: hidden, error: e2 } = await sb.from('providers')
  .select('id', { count: 'exact', head: true })
  .ilike('address_city', '%paris%')
  .ilike('specialty', '%plombier%')
  .eq('is_active', true)
  .eq('noindex', true);
if (e2) { console.error('FAIL:', e2.message); process.exit(1); }

console.log('Indexables (noindex=false): ' + indexable);
console.log('Hidden (noindex=true): ' + hidden);

if (indexable !== 5) { console.error('FAIL: attendu 5 indexables, trouve ' + indexable); process.exit(1); }
if (hidden !== 195) { console.error('FAIL: attendu 195 hidden, trouve ' + hidden); process.exit(1); }
console.log('OK: 5 indexables, 195 hidden');
"
```

### 6. Verifier que les 5 indexables ont stable_id et is_verified
```bash
npx tsx -e "
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data, error } = await sb.from('providers')
  .select('id, stable_id, name, is_verified')
  .ilike('address_city', '%paris%')
  .ilike('specialty', '%plombier%')
  .eq('is_active', true)
  .eq('noindex', false);
if (error) { console.error('FAIL:', error.message); process.exit(1); }
const missing = data.filter(p => !p.stable_id);
if (missing.length > 0) { console.error('FAIL: providers indexables sans stable_id:', missing.map(p=>p.name)); process.exit(1); }
const unverified = data.filter(p => !p.is_verified);
if (unverified.length > 0) { console.warn('WARN: providers indexables non verifies:', unverified.map(p=>p.name)); }
data.forEach(p => console.log('  ' + p.stable_id + ' — ' + p.name + ' (verified=' + p.is_verified + ')'));
console.log('OK: tous les indexables ont un stable_id');
"
```

## Interdictions
- Ne JAMAIS modifier des providers hors du scope paris x plombier
- Ne JAMAIS passer noindex=false sur plus de 5 providers
- Ne JAMAIS creer de providers avec `is_premium=true`, `trust_badge`, ou `trust_score`
- Ne JAMAIS generer de stable_id cote client — utiliser la fonction DB ou le script serveur
- Ne JAMAIS supprimer des providers existants

## Criteres d'acceptation
| Critere | Attendu |
|---------|---------|
| Service plombier existe | slug=plombier dans services |
| Location paris existe | name contient paris dans locations |
| Total providers paris x plombier | exactement 200 |
| Providers indexables (noindex=false) | exactement 5 |
| Providers hidden (noindex=true) | exactement 195 |
| Tous les indexables ont stable_id | aucun null |
| Aucun champ toxique present | pas de trust_badge, trust_score, is_premium dans les inserts |
