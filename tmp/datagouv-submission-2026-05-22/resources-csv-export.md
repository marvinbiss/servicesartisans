# Génération du CSV stable — Indice Rénovation Énergétique 2026

**Endpoint canonique** : `https://servicesartisans.fr/api/v1/barometre/renovation/export.csv`

## Architecture

Le CSV est servi par une route Next.js **statique (force-static + revalidate 3600s)**
située dans `src/app/api/v1/barometre/renovation/export.csv/route.ts`. C'est le
"folder route" pattern Next.js 14 App Router — le nom de dossier `export.csv`
devient littéralement le segment d'URL, comme `embed.html/` à côté.

Les 6 KPIs sont des constantes TypeScript dans le fichier (single source of
truth). Pas de fetch DB, pas d'env var, déterministe. Le contenu reste
identique entre redéploiements sauf bump explicite de `LAST_UPDATED`.

## Schéma de sortie

| Colonne        | Type    | Exemple                                    |
| -------------- | ------- | ------------------------------------------ |
| `metric`       | string  | `logements_france`                         |
| `value`        | number  | `30400000`                                 |
| `unit`         | string  | `logements`                                |
| `source`       | string  | `INSEE — Parc résidences principales 2024` |
| `last_updated` | ISO8601 | `2026-05-06`                               |

Encodage : **UTF-8 BOM-less**, séparateur `,`, fin de ligne `\r\n` (RFC 4180),
échappement guillemets `""`. Headers HTTP enrichis :

- `Content-Type: text/csv; charset=utf-8`
- `Content-Disposition: inline; filename="indice-renovation-energetique-2026.csv"`
- `X-License: CC-BY-4.0`
- `X-Attribution: ServicesArtisans — Baromètre Rénovation Énergétique 2026`
- `X-Canonical-URL: https://servicesartisans.fr/barometre/renovation-energetique-2026`
- `Cache-Control: public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400`
- `Access-Control-Allow-Origin: *` (CORS open — autorise fetch cross-origin par data.gouv.fr + tiers)

## Sortie attendue (CSV exact)

```csv
metric,value,unit,source,last_updated
logements_france,30400000,logements,INSEE — Parc résidences principales 2024,2026-05-06
passoires_thermiques_F_G,5100000,logements,ADEME — Bilan rénovation énergétique 2024,2026-05-06
dossiers_maprimerenov_2024,700000,dossiers,ANAH — Bilan MaPrimeRénov 2024,2026-05-06
artisans_rge_actifs,62000,entreprises,France Rénov — Annuaire RGE (mai 2025),2026-05-06
marche_renovation_2026,87000000000,euros,BPI France / Xerfi — Étude marché rénovation 2024,2026-05-06
baisse_co2_residentiel_vs_2020,-7,pourcentage,Citepa — Inventaire émissions GES France,2026-05-06
```

(7 lignes = 1 header + 6 KPIs)

## Cycle de mise à jour

1. **Mensuel** : à chaque publication bilan ADEME / ANAH (1ère semaine du mois).
2. Édition manuelle de `src/app/api/v1/barometre/renovation/export.csv/route.ts` :
   - Bump du `LAST_UPDATED`
   - Ajustement valeurs si publication officielle nouvelle
3. Synchroniser EN PARALLÈLE :
   - `src/app/api/v1/barometre/renovation/embed.html/route.ts` (mêmes 6 KPIs)
   - `src/app/(public)/barometre/renovation-energetique-2026/page.tsx` (page canonique)
4. Re-build Vercel (revalidate cache statique).
5. Notifier data.gouv.fr **uniquement si schema change** (ajout/retrait métrique) :
   ```bash
   DATAGOUV_API_KEY=xxx npx tsx tmp/datagouv-submission-2026-05-22/script-submit-datagouv.ts \
     --action update --live
   ```
   Le CSV est servi en pull par data.gouv.fr (filetype: remote) — pas d'upload nécessaire.

## Vérification anti-régression

Avant chaque bump, vérifier que les 6 KPIs restent identiques entre les 3
surfaces (CSV / HTML embed / page canonique). Test manuel rapide :

```bash
curl -s https://servicesartisans.fr/api/v1/barometre/renovation/export.csv | head -10
curl -s https://servicesartisans.fr/api/v1/barometre/renovation/embed.html | grep -oE '(30,4 M|5,1 M|700 000|62 000|87 Md€|−7 %)' | sort -u
```

Les 6 valeurs doivent matcher entre les 2 surfaces (formatage différent OK,
chiffre identique obligatoire).

## Sources brutes (audit trail)

| KPI                        | Source primaire                                   | URL                                                            |
| -------------------------- | ------------------------------------------------- | -------------------------------------------------------------- |
| logements_france           | INSEE Recensement 2024                            | https://www.insee.fr/fr/statistiques/2382575                   |
| passoires_thermiques_F_G   | ADEME Bilan rénovation 2024                       | https://librairie.ademe.fr                                     |
| dossiers_maprimerenov_2024 | ANAH Bilan annuel                                 | https://www.anah.gouv.fr                                       |
| artisans_rge_actifs        | France Rénov' annuaire (dataset miroir data.gouv) | https://www.data.gouv.fr/fr/datasets/liste-des-entreprises-rge |
| marche_renovation_2026     | BPI France / Xerfi                                | https://www.bpifrance.fr                                       |
| baisse_co2_residentiel     | Citepa inventaire GES                             | https://www.citepa.org                                         |

Chaque mise à jour mensuelle doit re-vérifier au moins une de ces sources.
Si une source est obsolète (publication retirée), retirer ou notifier le KPI
plutôt que conserver une valeur datée.
