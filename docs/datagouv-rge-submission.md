# Dataset Artisans RGE — Soumission data.gouv.fr

**Action #4 (Sprint B 2026-05-03)** — pivot autorité : publication officielle du dataset RGE sur data.gouv.fr pour récupérer un backlink Tier 1 (DR ~85, gov.fr).

## Pré-requis

| Étape                                          | Statut                                                                                | Action                                                                                                     |
| ---------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1. Page hub `/datasets/rge`                    | ✅ Live (HTTP 200)                                                                    | Activée 2026-05-03 (fetch real-time meta)                                                                  |
| 2. Schema.org `Dataset` JSON-LD                | ✅ Présent (page.tsx:208-227)                                                         | Citation, distributions, license CC-BY                                                                     |
| 3. Fichiers téléchargeables CSV/JSON/Parquet   | ✅ Présents                                                                           | `public/datasets/rge/rge-{2026-04,latest}.{csv,json,parquet}`                                              |
| 4. Cron mensuel `/api/cron/export-rge-dataset` | ⏳ Désactivé (`RGE_DATASET_EXPORT_ENABLED=false`)                                     | **À activer Vercel env** : `RGE_DATASET_EXPORT_ENABLED=true`                                               |
| 5. Soumission data.gouv.fr                     | ⏸️ **Bloqué jusqu'à ~2026-05-07** : KBIS attendu sous 4 jours (J+4 depuis 2026-05-03) | Soumission impossible sans organisation officielle data.gouv.fr (KBIS requis pour validation organisation) |

## Soumission data.gouv.fr (manuel)

URL admin : https://www.data.gouv.fr/fr/admin/datasets/new/

### Champs à remplir

| Champ data.gouv.fr           | Valeur                                                                                                                |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Titre**                    | Annuaire des artisans RGE de France — données enrichies                                                               |
| **Description**              | Voir bloc ci-dessous                                                                                                  |
| **Tags**                     | rge, artisans, renovation-energetique, ademe, maprimerenov, batiment, artisan-rge, qualibat, qualipac, photovoltaique |
| **Licence**                  | Licence Ouverte / Open Licence v2.0 (équivalent CC-BY 4.0)                                                            |
| **Granularité géographique** | France (national)                                                                                                     |
| **Couverture temporelle**    | 2026-01-01 → en cours                                                                                                 |
| **Fréquence de mise à jour** | Mensuelle (1er du mois)                                                                                               |
| **Organisation**             | ServicesArtisans SAS (à créer si pas existant)                                                                        |
| **Producteur**               | ServicesArtisans (croisement ADEME + INSEE + enrichissement géocodage)                                                |

### Description (à coller dans le champ markdown)

```markdown
# Annuaire des artisans RGE de France — données enrichies

Liste exhaustive des entreprises certifiées **RGE** (Reconnu Garant de l'Environnement) en France, croisée avec les bases publiques INSEE et enrichie de métadonnées techniques.

## Source primaire

- **ADEME / France Rénov'** : référentiel officiel des qualifications RGE (Qualibat, Qualit'EnR, Qualifelec, Certibat, OPQIBI). Sync hebdomadaire automatisée depuis https://france-renov.gouv.fr/.

## Enrichissements ServicesArtisans

- **SIRET** vérifié contre l'API INSEE Sirene (entité active uniquement)
- **Géolocalisation** : latitude/longitude WGS84 (géocodage adresse postale)
- **Code département / région** ISO normalisé
- **Spécialité métier** dérivée du code NAF + qualifications
- **rge_valid_until** : date max de validité parmi toutes les qualifs actives
- **rge_organismes** : liste des organismes certificateurs distincts par entreprise

## Volume

- ~49 000 fiches actives au 2026-04 (toutes qualifs RGE en cours de validité)
- Mise à jour mensuelle (1er du mois) — versions historisées disponibles

## Format

3 formats équivalents pour faciliter l'usage :

- **CSV** (UTF-8, séparateur virgule, RFC 4180) — `rge-2026-04.csv`
- **JSON** (NDJSON, 1 entreprise par ligne) — `rge-2026-04.json`
- **Parquet** (Apache Parquet, columnar) — `rge-2026-04.parquet`

Pointeurs `rge-latest.{csv,json,parquet}` mis à jour à chaque export.

## Schéma

| Champ               | Type          | Exemple                                                                      |
| ------------------- | ------------- | ---------------------------------------------------------------------------- |
| siret               | string(14)    | 83001931100026                                                               |
| name                | string        | Chauffage Lyon SARL                                                          |
| address_city        | string?       | Lyon                                                                         |
| address_postal_code | string?       | 69003                                                                        |
| address_department  | string?       | 69                                                                           |
| address_region      | string?       | Auvergne-Rhône-Alpes                                                         |
| latitude            | number?       | 45.7485                                                                      |
| longitude           | number?       | 4.8467                                                                       |
| specialty           | string?       | chauffagiste                                                                 |
| rge_qualifications  | array<object> | `[{code: "QualiPAC", organisme: "Qualit'EnR", date_fin: "2027-03-14", ...}]` |
| rge_valid_until     | date?         | 2027-03-14                                                                   |
| rge_organismes      | array<string> | `["Qualit'EnR", "Qualibat"]`                                                 |
| rge_last_synced_at  | datetime?     | 2026-04-29T03:14:00Z                                                         |

Schéma complet et exemples : https://servicesartisans.fr/datasets/rge

## Licence

**CC-BY 4.0** (équivalent Licence Ouverte v2.0). Réutilisation libre avec attribution : "Source : ADEME / France Rénov' enrichi par ServicesArtisans, https://servicesartisans.fr/datasets/rge".

## Cas d'usage

- Outils de comparaison artisans RGE (carto, recherche par métier/zone)
- Études de marché rénovation énergétique
- Vérification artisan-RGE pour particuliers (intent MaPrimeRénov')
- Recherche académique (transition énergétique, économie verte)
- Croisement avec datasets ADEME complémentaires (DPE, MaPrimeRénov')

## Contact

- **Mainteneur** : ServicesArtisans — contact@servicesartisans.fr
- **Issue tracker** : https://servicesartisans.fr/datasets/rge#contact
- **Code de génération** : https://github.com/servicesartisans (à venir)

## Historique

- 2026-04 : version initiale (49 228 fiches actives)
- 2026-05+ : updates mensuelles automatisées via cron
```

### Ressources à attacher (3)

| Type               | Format        | URL                                                           | Usage                                  |
| ------------------ | ------------- | ------------------------------------------------------------- | -------------------------------------- |
| Données mensuelles | CSV           | https://servicesartisans.fr/datasets/rge/rge-latest.csv       | Tableurs, BI                           |
| Données mensuelles | JSON (NDJSON) | https://servicesartisans.fr/datasets/rge/rge-latest.json      | Scripts, ETL                           |
| Données mensuelles | Parquet       | https://servicesartisans.fr/datasets/rge/rge-latest.parquet   | Big data, columnar query               |
| Métadonnées        | JSON          | https://servicesartisans.fr/datasets/rge/rge-latest.meta.json | SHA256, count, license, schema_version |
| Page documentation | HTML          | https://servicesartisans.fr/datasets/rge                      | Schéma complet, exemples, citation     |

> Astuce : choisir "URL distante" plutôt que "Upload fichier" pour que data.gouv.fr suive la maj mensuelle automatiquement (pas de re-upload manuel).

## Backlink expected

- **DR data.gouv.fr** : ~85
- **Type** : do-follow editorial (page dataset officielle)
- **Anchor** : "ServicesArtisans" + URL canonical `/datasets/rge`
- **Impact estimé** : DR SA 0.6 → ~6-8 (single backlink Tier 1 gov.fr) sur 60-90j

## Checklist (ordonnée — bloqueurs prioritaires)

**🔴 Bloqueurs amont (avant soumission)**

- [ ] **Création société ServicesArtisans SAS** (KBIS requis pour validation organisation data.gouv.fr)
- [ ] Création organisation data.gouv.fr (https://www.data.gouv.fr/fr/admin/organization/new/) — KBIS + statuts à uploader
- [ ] Validation org par modérateurs data.gouv.fr (~5-10j)

**🟢 Activation cron (peut être fait en parallèle de la création société)**

- [ ] Activation Vercel env `RGE_DATASET_EXPORT_ENABLED=true`
- [ ] Run manuel cron 1× pour valider export (`npx tsx scripts/cron/export-rge-dataset.ts` ou GET `/api/cron/export-rge-dataset` avec `Authorization: Bearer ${CRON_SECRET}`)
- [ ] Vérif fichiers générés `public/datasets/rge/rge-{YYYY-MM,latest}.{csv,json,parquet}` + `.meta.json`

**🟢 Soumission (post-organisation validée)**

- [ ] Soumission dataset data.gouv.fr (manuel UI, ~10 min — manifest prêt ci-dessus)
- [ ] Wait modération dataset (~24-48h)
- [ ] Récupérer URL canonical du dataset publié
- [ ] Cross-link dans `/datasets/rge` page : "Aussi disponible sur data.gouv.fr/.../"
- [ ] Notifier `/api/sync-indexnow` pour recrawl rapide page enrichie
- [ ] Mesure DR Ahrefs J+30 et J+60 (target +5-8 points)

**📌 En attendant la création société**
La page `/datasets/rge` est déjà live et indexable avec tous les fichiers téléchargeables, Schema.org Dataset JSON-LD complet, citation académique et licence CC-BY 4.0. Elle peut déjà capter du trafic SEO direct sur "dataset rge", "annuaire rge open data", etc. — c'est un asset Tier 2 indépendant de data.gouv.fr.

## Reference Sonergia (concurrent benchmark)

Sonergia (DR 49) n'a pas publié de dataset open-data. C'est un différenciateur fort sur la verticale "data autorité" — premier acteur RGE à publier en open data sur data.gouv.fr = signal E-E-A-T fort + backlink unique.
