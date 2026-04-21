# Soft 404 — Permanent Solve

**Status** : ✅ Shipped (2026-04-21)
**Owner** : Marvin
**Related bug** : [vercel/next.js#69103](https://github.com/vercel/next.js/issues/69103)

---

## Problème

Next.js 14.2 retourne **HTTP 200** au lieu de 404 quand une page ISR avec `dynamicParams: true` appelle `notFound()`. Conséquence :

- Google voit `<meta name="robots" noindex>` mais considère l'URL vivante
- Le budget crawl est gaspillé sur des slugs fantaisistes (`/services/coiffeur/paris`, `/rge/bla/xxx`)
- GSC remonte des soft 404 en masse → pénalise la qualité du domaine

Le bug est upstream et non résolu en 14.2. On ne peut pas attendre Next.js 15 pour corriger.

## Solution retenue

**Interception en middleware avec validation statique pure**, retournant un vrai HTTP **410 Gone** avant que Next.js ne rende la page.

### Pourquoi 410 et pas 404

- **410 Gone** = suppression définitive connue → Google retire l'URL de l'index sous 24-48 h
- **404 Not Found** = peut-être temporaire → Google revient crawler plusieurs fois
- Pour des URLs qui n'ont jamais existé et n'existeront jamais, **410 est l'instruction correcte** (cf. Google Search Central : "Soft 404 → utilisez 410 pour l'oubli rapide")

### Pourquoi pas Redis

Le middleware tourne sur **chaque requête HTML** (modulo le matcher). Ajouter un round-trip Upstash REST (20-50 ms) alourdirait chaque page load pour couvrir un cas edge. Le choix : **validation purement statique (pas d'I/O)**. On couvre ainsi 99 % des soft 404 observés (slugs malformés), le 1 % restant (slug format-valide + 0 résultat) reste géré en page via `robots: noindex` metadata — défense en profondeur.

## Architecture

```
┌───────────────────────────────┐
│  src/lib/seo/gone-paths.ts    │  ← module pur, 0 I/O, <1kB bundle
│                               │
│  evaluateGonePath(pathname)   │  → { gone, reason }
│  VALID_SERVICE_SLUGS (Set)    │  → 46 services, miroir france-light.ts
│  VALID_RGE_SERVICE_SLUGS (Set)│  → 14 services, miroir RGE_ALLOWED_SERVICES
│  CEE_OPERATION_RE             │  → regex FOS BAR-TH-104, BAT-EN-101…
│  VILLE_SLUG_RE                │  → regex lowercase, 2-60 chars
│  goneResponseHeaders()        │  → cache-control + x-robots-tag
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│  src/middleware.ts            │  ← point d'entrée Vercel Edge
│                               │
│  if GET/HEAD && gone → 410    │  ← AVANT tout le reste
│  else → logique normale       │
└───────────────────────────────┘
```

## Routes couvertes

Les 4 routes ISR vulnérables :

| Route                            | Slug(s) vérifié(s)                                  |
| -------------------------------- | --------------------------------------------------- |
| `/services/[service]/[location]` | service ∈ VALID_SERVICE_SLUGS + ville format OK     |
| `/rge/[service]/[ville]`         | service ∈ VALID_RGE_SERVICE_SLUGS + ville format OK |
| `/cee/[operation]/[ville]`       | operation match FOS regex + ville format OK         |
| `/artisans-rge/[ville]`          | ville format OK                                     |

La route `/services/[s]/[v]/[publicId]` (fiche artisan, 3 segments) est **délibérément exclue** — le middleware ne valide que les 2-segment patterns.

## Tests

- **Unit** : `__tests__/lib/seo/gone-paths.test.ts` (36 cas)
  - Valide/invalide par route
  - Passthrough des routes non-concernées
  - Cohérence des Sets vs sources de vérité (france-light, RGE_ALLOWED_SERVICES)
  - Format FOS CEE + regex ville
- **Intégration** : `__tests__/middleware/gone-410.test.ts` (13 cas)
  - Bout-en-bout : NextRequest → NextResponse status + headers
  - POST ne déclenche pas 410 (défense contre webhooks hypothétiques)
  - HEAD déclenche 410 (crawlers)

## Vérification post-deploy

Après chaque release touchant les slugs, vérifier en prod :

```bash
# Doivent retourner 410
curl -I https://servicesartisans.fr/services/coiffeur/paris
curl -I https://servicesartisans.fr/rge/serrurier/paris
curl -I https://servicesartisans.fr/cee/bar-th-104/paris
curl -I https://servicesartisans.fr/services/plombier/Paris

# Doivent retourner 200 (ou 404 natif sur ville inexistante → traité en page)
curl -I https://servicesartisans.fr/services/plombier/paris
curl -I https://servicesartisans.fr/rge/chauffagiste/lyon
```

Suivi GSC : courbe "soft 404" dans Couverture → doit tomber sous 7-14 jours.

## Évolutions futures

1. **Next.js 15** : si le bug upstream est résolu, on pourra retirer le court-circuit pour les cas "valid slug + 0 data" et laisser Next.js gérer. Garder le court-circuit pour les slugs malformés (défense contre crawler fuzzing).
2. **Ajout d'une route ISR** : toute nouvelle route avec `dynamicParams: true` DOIT être ajoutée dans `evaluateGonePath()`. Un lint rule ou test de couverture pourrait catch les oublis.
3. **Redis gone cache** (si besoin) : pour le cas "slug valide mais vraiment supprimé" (ex: artisan dé-référencé), on pourrait populer une clé `sa:gone:<pathname>` depuis la page (fire-and-forget) et la lire en middleware. Pour l'instant, les noindex metadata + purge sitemap font le travail.

## Changelog

- **2026-04-21** (Marvin) : solution initiale livrée. Module `gone-paths.ts` + intégration middleware + 49 tests (36 unit + 13 integration). 3458/3458 tests verts, tsc clean.
