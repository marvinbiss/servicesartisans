# Open Data ServicesArtisans — guide d'exploitation

Plan v2 ULTRA DOMINATION SEO — synthèse 10-agents 2026-04-28 #4 :
"Dataset data.gouv.fr (DR 92, +5-8 DR), 2j".

## Architecture

```
┌─────────────────────────────────┐
│  /open-data (page hub publique) │  ← Schema.org DataCatalog + 2 Dataset
│   - landing pour humains        │     (visible Google + crawlable)
│   - links CSV / NDJSON / DCAT   │
└──────────┬──────────────────────┘
           │
           ├── /datasets/rge/rge-latest.csv         (généré par cron mensuel)
           ├── /datasets/rge/rge-latest.json        (NDJSON streaming)
           ├── /datasets/rge/rge-latest.meta.json   (SHA256 + comptes)
           │
           ├── /api/open-data/local-stats.csv       (RPC live, cache 24h)
           ├── /api/open-data/local-stats.json      (NDJSON streaming)
           └── /api/open-data/manifest.json         (DCAT-AP catalogue)
```

## Datasets exposés

### 1. Annuaire artisans RGE certifiés

- **Source** : annuaire officiel ADEME (france-renov.gouv.fr, Licence Etalab 2.0)
- **Sync** : cron hebdo `/api/cron/rge-sync` → `providers.rge_qualifications`
- **Export** : cron mensuel `/api/cron/export-rge-dataset` → `public/datasets/rge/rge-YYYY-MM.{csv,json,meta.json}` + symlinks `rge-latest.*`
- **Activation** : variable env `RGE_DATASET_EXPORT_ENABLED=true` (sinon cron renvoie 503)
- **Schema.org** : `Dataset` + `accrualPeriodicity` monthly

### 2. Statistiques locales agrégées

- **Source** : RPC `public.export_open_data_local_stats()` (migration 484)
- **K-anonymat** : `provider_count >= 10` (jointure commune × spécialité)
- **Sync** : généré à la volée via Supabase RPC, cache CDN 24h
- **Schema.org** : `Dataset` + `accrualPeriodicity` daily

## Activation

### Étape 1 — appliquer migration 484

```sql
\i supabase/migrations/484_open_data_aggregates.sql
```

Smoke test post-migration :

```sql
SELECT count(*) FROM public.export_open_data_local_stats();
-- Doit retourner > 0 (sinon : aucun bucket ne passe k-anonymat=10).
```

### Étape 2 — activer le cron RGE export

Dans `vercel.json`, ajouter ou décommenter :

```json
{
  "path": "/api/cron/export-rge-dataset",
  "schedule": "0 5 1 * *"
}
```

Variable env Vercel :

```
RGE_DATASET_EXPORT_ENABLED=true
```

Premier export manuel local pour valider :

```bash
RGE_DATASET_EXPORT_ENABLED=true npx tsx scripts/cron/export-rge-dataset.ts
ls -lh public/datasets/rge/  # doit lister rge-YYYY-MM.csv + rge-latest.csv
```

### Étape 3 — soumettre à data.gouv.fr

1. Créer un compte organisation sur https://www.data.gouv.fr/ (mail `open-data@servicesartisans.fr`)
2. Demander la validation officielle de l'organisation (~48h)
3. Publier 2 datasets distincts :
   - **Annuaire artisans RGE certifiés** :
     - URL : `https://servicesartisans.fr/datasets/rge/rge-latest.csv` + `.json`
     - Manifest DCAT : `https://servicesartisans.fr/api/open-data/manifest.json`
     - Tags : `rge`, `rénovation-énergétique`, `artisans`, `ademe`
     - Licence : Etalab 2.0
     - Fréquence : mensuelle
   - **Statistiques locales artisanales** :
     - URL : `https://servicesartisans.fr/api/open-data/local-stats.csv` + `.json`
     - Tags : `artisans`, `statistiques-locales`, `commune`, `métier`
     - Licence : Etalab 2.0
     - Fréquence : quotidienne
4. Lier le hub `https://servicesartisans.fr/open-data` dans la description.
5. Une fois validé, soumettre à l'INSEE (https://www.observatoire-tpe-pme.fr/) pour double indexation.

### Étape 4 — IndexNow + sitemap

Ajouter `/open-data` au sitemap principal (déjà couvert par `pages/sitemap.xml` si la route est statique). Pinger IndexNow après publication :

```bash
curl -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json" \
  -d '{
    "host": "servicesartisans.fr",
    "key": "<INDEXNOW_KEY>",
    "urlList": [
      "https://servicesartisans.fr/open-data",
      "https://servicesartisans.fr/api/open-data/manifest.json"
    ]
  }'
```

## Sécurité & gouvernance

- **Aucune PII** : ni nom, ni SIRET, ni email, ni téléphone, ni adresse précise dans les agrégats.
- **K-anonymat ≥ 10** : enforcé au niveau du RPC (`WHERE provider_count >= 10`).
- **Source RGE** : ne publie que les champs déjà publics dans l'annuaire ADEME.
- **Rate-limit** : pas d'auth, mais cache CDN 24h absorbe le traffic.
- **CORS** : `Access-Control-Allow-Origin: *` pour réutilisation libre.
- **X-Robots-Tag** : `noindex, follow` sur les routes API (le hub `/open-data` est l'unique URL indexable).

## Mise à jour

- Le RPC migration 484 est `STABLE SECURITY DEFINER` avec `search_path` pinné (CVE-2018-1058).
- Permissions : `GRANT EXECUTE TO anon, authenticated`.
- Pour ajouter un nouveau dataset : créer un nouveau RPC + ajouter une distribution dans `buildManifest()` + un Dataset dans `buildCatalogSchema()` côté hub.

## Métriques attendues (T+90)

Selon le plan v2 SOLIDIFIÉ :

- **+5-8 DR** sur 3 mois post-soumission data.gouv (backlinks DR 92)
- **+200-500 sessions/mois** organiques sur `/open-data` + datasets indexés
- **Citations académiques** possibles via INSEE / observatoire-tpe-pme.fr (long terme)
