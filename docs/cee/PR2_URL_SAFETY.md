# PR2 — Contrainte de non-régression URL (PRIORITÉ MAX)

**Règle absolue du projet** : ne casser AUCUNE URL existante. ServicesArtisans sert 1.5M+ pages pSEO, le SEO est le coeur du business.

## Interdictions (hard rules)

1. **NE PAS modifier** :
   - `next.config.js` (rewrites, redirects, headers)
   - `src/middleware.ts`
   - `src/app/robots.ts`
   - `src/app/sitemap.ts` + `src/lib/seo/sitemap-config.ts`
   - `src/app/api/sitemap-index/route.ts`
   - `src/app/api/sitemap-providers/route.ts`
   - `src/app/image-sitemap.xml/route.ts`
   - `src/app/news-sitemap.xml/route.ts`

2. **NE PAS déplacer/renommer** un fichier dans `src/app/` (chaque déplacement casse une route publique).

3. **NE PAS toucher** aux routes existantes :
   - `src/app/(private)/espace-artisan/cee/page.tsx`
   - `src/app/(private)/espace-artisan/cee/[dossierId]/page.tsx`
   - Toutes les routes publiques existantes (annuaire, services, blog, FAQ, etc.)

4. **NE PAS supprimer** un export existant dans un fichier étendu (`src/lib/cee/emails.ts`, `src/types/admin.ts`, `.env.example`). Ajout-only.

5. **NE PAS ajouter** de pattern noindex/canonical conditionnel sur des pages existantes.

## Routes nouvelles (additives uniquement)

### API (nouvelles)

- `POST /api/cee/partners/invite-batch`
- `GET  /api/cee/partners/me`
- `POST /api/cee/partners/onboarding/iban`
- `POST /api/cee/partners/onboarding/convention`
- `POST /api/webhooks/yousign`
- `POST /api/cee/partners/training/quiz`
- `POST /api/cee/partners/activate`

### UI (nouvelles)

- `/espace-artisan/cee/onboarding` (wizard)
- Sous-pages wizard (client components dans le même dossier)

## Vérifications obligatoires après implémentation

```bash
# 1. Build doit passer
npm run build

# 2. Compter les routes — doit être >= nombre avant PR2
# Baseline à capturer AVANT toute modif :
#   npm run build 2>&1 | grep -E "^(λ|○|●)" | wc -l

# 3. Smoke test URLs critiques (localhost)
npm run dev &
for url in / /services /blog /espace-artisan/cee /sitemap.xml /robots.txt; do
  curl -s -o /dev/null -w "%{http_code} $url\n" "http://localhost:3000$url"
done
# Tout doit retourner 200 ou 3xx (auth redirect), JAMAIS 404 ni 500

# 4. Sitemap inchangé (diff)
curl -s http://localhost:3000/sitemap.xml | sha256sum
# Comparer avec baseline avant PR2

# 5. Vercel preview deploy avant prod (toujours)
```

## En cas de conflit

STOP. Remonter le conflit. Ne jamais overwriter un fichier existant avec un nouveau contenu sans validation humaine explicite.

## Zone additive tolérée (ADD-ONLY)

| Fichier                 | Action autorisée                                                             |
| ----------------------- | ---------------------------------------------------------------------------- |
| `src/types/admin.ts`    | Ajouter clé `cee_partners` dans `AdminPermissions`                           |
| `.env.example`          | Ajouter 3 vars (`CEE_IBAN_KEY`, `YOUSIGN_API_KEY`, `YOUSIGN_WEBHOOK_SECRET`) |
| `src/lib/cee/emails.ts` | Ajouter 3 nouveaux exports (`sendCeePartnerInvite`, etc.)                    |
| `package.json`          | Aucun changement requis (pas de SDK Yousign — HTTP direct via fetch)         |

## Baseline à capturer avant merge

- [ ] `npm run build` output sauvegardé (nombre de pages)
- [ ] `curl /sitemap.xml` hash SHA256 sauvegardé
- [ ] Liste des 39 sitemaps accessibles (200 OK)
