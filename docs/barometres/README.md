# Baromètre RGE mensuel

Données publiques mensuelles sur les artisans RGE actifs en France. Source : répertoire ADEME (annuaire-entreprises.data.gouv.fr), synchronisation hebdomadaire.

## Déploiement prod (ordre obligatoire)

1. **Appliquer migration 464** via le SQL editor Supabase :

   ```
   supabase/migrations/464_barometre_rge_snapshots.sql
   ```

   Le script respecte les règles "Supabase SQL editor quirks" (pas de tags `$$`,
   multi-statements split par des points-virgules standards, pas de préfixe `refresh_*`).

2. **Vérifier les crons Vercel** : `/api/cron/barometre-rge` doit apparaître
   dans la liste (schedule `0 3 1 * *`, maxDuration 300s — Vercel Pro requis).

3. **Premier run manuel** (backfill du mois courant) :

   ```bash
   curl -H "Authorization: Bearer $CRON_SECRET" \
        https://servicesartisans.fr/api/cron/barometre-rge
   ```

   Réponse attendue : `{"ok":true,"yearmonth":"2026-04",…}`.
   La page `/barometre/rge` est auto-revalidée après upsert.

4. **Smoke-test API publique** :
   ```bash
   curl "https://servicesartisans.fr/api/v1/rge/lookup?siret=<un_siret_rge_connu>"
   curl "https://servicesartisans.fr/api/v1/rge/search?qualification=QualiPAC&limit=5"
   curl "https://servicesartisans.fr/api/v1/rge/search?city=lyon&limit=5"
   ```
   Headers attendus : `Cache-Control: public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800`.

## Pipeline

1. **Sync ADEME** — hebdomadaire, peuple `providers.rge_qualifications`, `rge_valid_until`, `rge_organismes`
2. **Snapshot mensuel** — cron `/api/cron/barometre-rge` (1er du mois 03:00 UTC)
   - Agrège depuis `providers` actifs (pagination ordonnée stable)
   - Upsert dans `barometre_rge_snapshots` (migration 464)
   - `revalidatePath('/barometre/rge')` après upsert
   - Écrit `docs/barometres/barometre-rge-YYYY-MM.md`
3. **Publication** — page ISR `/barometre/rge` (revalidate 24h)
   - Schema.org `Dataset` + `Article` + `BreadcrumbList`
   - Licence CC-BY 4.0, attribution obligatoire
4. **Diffusion** — API publique `/api/v1/rge/search` + `/api/v1/rge/lookup`

## Usage manuel

```bash
npx tsx scripts/generate-barometre-rge.ts            # mois courant
npx tsx scripts/generate-barometre-rge.ts 2026-04    # mois explicite
npx tsx scripts/generate-barometre-rge.ts --dry-run  # no DB write
```

## Template communiqué de presse

Chaque snapshot peut être relayé sous la forme :

> **[Mois AAAA]** — ServicesArtisans publie son Baromètre RGE mensuel. Au 1er [mois],
> **[N] artisans RGE sont actifs en France** (source : ADEME), dont **[N]** en [Région #1]
> et **[N]** en [Région #2]. La qualification la plus portée reste **[Top #1]** ([N] artisans).
>
> Chiffres consultables sur https://servicesartisans.fr/barometre/rge et librement réutilisables sous licence CC-BY 4.0.
>
> **À propos** — ServicesArtisans référence 940 000+ artisans du bâtiment français, dont
> [N] certifiés RGE. Source RGE : répertoire ADEME mis à jour chaque semaine.
> **Contact presse** : contact@servicesartisans.fr

Les placeholders `[N]`, `[Région #X]`, `[Top #1]` sont directement lisibles dans le fichier
`barometre-rge-YYYY-MM.md` du mois.

## Attribution (obligatoire)

Toute reprise des chiffres doit inclure :

> Source : ServicesArtisans — Baromètre RGE [mois AAAA] (https://servicesartisans.fr/barometre/rge)
