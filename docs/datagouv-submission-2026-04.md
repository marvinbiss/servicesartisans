# Soumission data.gouv.fr — Dataset RGE ServicesArtisans

> Document copy-paste prêt pour le formulaire `data.gouv.fr/fr/admin/dataset/new/`.
> À soumettre **après validation Sprint 0.1** (cf. Phase 0 ULTRA DOMINATION SEO).
> Cible ROI : 1 backlink data.gouv.fr (DR 92) → +5-8 DR site sur 6-12 mois.

## Métadonnées principales

| Champ                         | Valeur                                                                                                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Producteur**                | ServicesArtisans SAS                                                                                                                                                                       |
| **Titre**                     | Annuaire des artisans RGE de France — Édition mensuelle ServicesArtisans                                                                                                                   |
| **Description courte**        | Liste exhaustive des entreprises certifiées RGE (Reconnu Garant de l'Environnement) en France, enrichie et mise à jour mensuellement à partir de la base officielle ADEME / France Rénov'. |
| **Licence**                   | Creative Commons Attribution 4.0 (CC-BY-4.0)                                                                                                                                               |
| **Fréquence de mise à jour**  | Mensuelle (1er de chaque mois, automatisée)                                                                                                                                                |
| **Couverture temporelle**     | 2026-04 → présent (rolling window mensuel)                                                                                                                                                 |
| **Couverture géographique**   | France métropolitaine + DOM-TOM                                                                                                                                                            |
| **Mots-clés**                 | `RGE`, `rénovation énergétique`, `artisans`, `ADEME`, `France Rénov'`, `MaPrimeRénov'`, `CEE`, `Qualibat`, `Qualifelec`, `transition énergétique`                                          |
| **Format(s)**                 | CSV (UTF-8 BOM, séparateur `,`), JSON (NDJSON streaming-friendly), Parquet (compressé Snappy)                                                                                              |
| **URL d'accès**               | `https://servicesartisans.fr/datasets/rge`                                                                                                                                                 |
| **URL téléchargement direct** | `https://servicesartisans.fr/datasets/rge/rge-latest.csv`                                                                                                                                  |
| **Spec API**                  | `https://servicesartisans.fr/api/v1/openapi.yaml`                                                                                                                                          |
| **Contact**                   | `api@servicesartisans.fr`                                                                                                                                                                  |
| **GitHub exemples**           | `https://github.com/marvinbiss/servicesartisans-api-examples` (à créer)                                                                                                                    |

## Description longue (champ `Description` data.gouv.fr)

```
Ce jeu de données fournit la liste exhaustive des entreprises artisanales certifiées
RGE (Reconnu Garant de l'Environnement) en activité en France, dans les 11 catégories
de qualifications éligibles aux aides publiques à la rénovation énergétique
(MaPrimeRénov', Certificats d'Économies d'Énergie, Éco-PTZ, TVA réduite à 5,5 %).

La source primaire est la base officielle "Liste des entreprises RGE" maintenue par
l'ADEME (data.gouv.fr/fr/datasets/liste-des-entreprises-rge-2/), enrichie par
ServicesArtisans des champs suivants :
- géolocalisation à la commune (latitude / longitude WGS84, code INSEE)
- normalisation des libellés de qualifications RGE et organismes certificateurs
- typologie des services proposés (mapping codes vers vocabulaire grand public)
- statut de validité (actif / expiré) recalculé à chaque export

Le pipeline d'export tourne le 1er de chaque mois à 04h00 UTC. Chaque snapshot mensuel
est conservé. Le fichier `rge-latest.{csv,json,parquet}` pointe toujours vers le
dernier export validé.

Les fichiers sont accompagnés d'un sidecar `*.meta.json` contenant le compte total,
la date d'export, le hash SHA-256 de chaque artefact, la version du schéma et la
licence applicable.

Ce dataset peut être interrogé en temps réel via l'API REST publique
(servicesartisans.fr/developpeurs), documentée OpenAPI 3.1.

Cas d'usage : observatoires territoriaux, journalisme de données, outils de
comparaison pour les particuliers, intégrations CRM pour les bureaux d'études,
recherche académique sur la transition énergétique.
```

## Schéma des données (champs CSV / JSON)

| Champ                | Type         | Cardinalité | Description                           | Exemple                        |
| -------------------- | ------------ | ----------- | ------------------------------------- | ------------------------------ |
| `siret`              | string(14)   | 1..1        | SIRET officiel de l'entreprise        | `12345678901234`               |
| `name`               | string       | 1..1        | Raison sociale (PAS company_name)     | `Chauffage Lyon SARL`          |
| `slug`               | string       | 1..1        | Slug URL ServicesArtisans             | `chauffage-lyon-sarl`          |
| `address_line`       | string       | 0..1        | Numéro + voie                         | `12 rue de la République`      |
| `address_city`       | string       | 1..1        | Commune                               | `Lyon`                         |
| `address_postcode`   | string(5)    | 1..1        | Code postal                           | `69002`                        |
| `address_region`     | string       | 0..1        | Région administrative                 | `Auvergne-Rhône-Alpes`         |
| `address_dept_code`  | string(2-3)  | 1..1        | Code département INSEE                | `69`                           |
| `address_insee`      | string(5)    | 0..1        | Code INSEE commune                    | `69123`                        |
| `lat`                | number       | 0..1        | Latitude WGS84                        | `45.7640`                      |
| `lng`                | number       | 0..1        | Longitude WGS84                       | `4.8357`                       |
| `rge_qualifications` | string[]     | 1..n        | Codes RGE actifs (séparés `;` en CSV) | `Qualibat-5911;RGE-PG-PAC`     |
| `rge_organismes`     | string[]     | 1..n        | Organismes certificateurs             | `Qualibat;Qualit'EnR`          |
| `rge_verified_at`    | datetime ISO | 1..1        | Date dernière vérif source ADEME      | `2026-04-01T04:00:00Z`         |
| `rge_expires_at`     | date ISO     | 0..1        | Date expiration la plus proche        | `2027-08-31`                   |
| `services`           | string[]     | 0..n        | Services dérivés (vocab grand public) | `pompe-a-chaleur;chauffagiste` |
| `phone_e164`         | string       | 0..1        | Téléphone format E.164                | `+33472123456`                 |
| `email`              | string       | 0..1        | Email professionnel publié            | —                              |
| `website`            | string       | 0..1        | URL site web                          | —                              |

**Note RGPD** : seuls les champs publiés volontairement par l'artisan ou présents dans la base ADEME publique sont exposés. Les données personnelles non professionnelles sont exclues.

## Mode de production

```
Source primaire (mensuelle) :
  data.gouv.fr/fr/datasets/liste-des-entreprises-rge-2/
  → CSV ADEME, ~165 000 lignes, ~60 000 SIRET uniques
  ↓
Enrichissement ServicesArtisans :
  - matching SIRET ↔ provider interne (revendications + scrapes terrain)
  - géocodage commune (BANO + IGN)
  - normalisation qualifications (mapping table interne)
  - statut validité (rge_verified_at vs rge_expires_at)
  ↓
Export multi-format :
  CSV (UTF-8 BOM), JSON (NDJSON), Parquet (Snappy)
  + sidecar meta.json (count, sha256, version, license)
  ↓
Publication :
  https://servicesartisans.fr/datasets/rge/rge-2026-MM.{csv,json,parquet}
  + symlink rge-latest.* → dernier export
```

## Étapes soumission (checklist opérateur)

- [ ] Connexion `data.gouv.fr/fr/admin/`
- [ ] Vérifier / créer organisation `ServicesArtisans` (siret rempli, logo SVG, page about)
- [ ] Cliquer "Nouveau jeu de données"
- [ ] Coller le **Titre**, **Description courte**, **Description longue** (cf. ci-dessus)
- [ ] Renseigner **Licence** = `Creative Commons Attribution 4.0`
- [ ] Renseigner **Fréquence** = `Mensuelle`
- [ ] Renseigner **Mots-clés** (cf. liste ci-dessus, séparés virgule)
- [ ] Renseigner **Couverture temporelle** + **Couverture géographique**
- [ ] Section "Ressources" → ajouter 4 ressources :
  - [ ] CSV → URL `https://servicesartisans.fr/datasets/rge/rge-latest.csv`
  - [ ] JSON → URL `https://servicesartisans.fr/datasets/rge/rge-latest.json`
  - [ ] Parquet → URL `https://servicesartisans.fr/datasets/rge/rge-latest.parquet`
  - [ ] OpenAPI YAML → URL `https://servicesartisans.fr/api/v1/openapi.yaml` (type "documentation")
- [ ] Section "Page d'accueil" → URL `https://servicesartisans.fr/datasets/rge`
- [ ] Section "Contact" → `api@servicesartisans.fr`
- [ ] Section "Schéma" → coller le tableau des champs (cf. ci-dessus)
- [ ] Soumettre → délai validation manuelle data.gouv.fr 3-7 jours ouvrés
- [ ] Suivi : email confirmation + page publique indexée par Google

## Pré-requis avant soumission

1. ✅ Page `/datasets/rge` en prod (Sprint 0.4 livré)
2. ✅ Spec OpenAPI publiée à `/api/v1/openapi.yaml` (à câbler depuis `docs/api/openapi-rge.yaml`)
3. ⏸ Premier export mensuel généré : `rge-2026-04.csv` + `rge-2026-04.json` + `rge-2026-04.parquet` + `rge-2026-04.meta.json`
4. ⏸ Test smoke : `curl -I https://servicesartisans.fr/datasets/rge/rge-latest.csv` retourne 200 + `Content-Type: text/csv`
5. ⏸ Test schéma : 1 ligne extraite valide vs spec (script `scripts/cron/export-rge-dataset.ts --validate-only`)
6. ⏸ License footer présent sur la page `/datasets/rge` (CC-BY 4.0 + lien)
7. ⏸ Compte data.gouv.fr opérationnel (organisation `ServicesArtisans` validée)

## Suivi post-soumission

| Délai       | Action                                                                                    |
| ----------- | ----------------------------------------------------------------------------------------- |
| J+0         | Soumission                                                                                |
| J+3 à J+7   | Réponse data.gouv.fr (validation manuelle)                                                |
| J+7 à J+14  | Page dataset indexée Google → backlink dofollow DR 92                                     |
| J+14 à J+30 | Mesure impact via Ahrefs : DR site, keywords gagnés                                       |
| M+1         | Premier export automatique (cron mensuel) → maintien fraîcheur                            |
| M+3         | Reach out 5 sites partenaires (observatoires, ANAH, ADEME) pour citations supplémentaires |
| M+6         | Mesure ROI Gate Phase 0 final : DR delta + clics organic                                  |

## Annexes — citations académiques

**Format APA** :

```
ServicesArtisans (2026). Annuaire des artisans RGE de France [Dataset]. CC-BY 4.0.
https://servicesartisans.fr/datasets/rge
```

**Format BibTeX** :

```bibtex
@dataset{servicesartisans_rge_2026,
  author       = {ServicesArtisans},
  title        = {Annuaire des artisans RGE de France},
  year         = {2026},
  publisher    = {ServicesArtisans SAS},
  version      = {2026-04},
  url          = {https://servicesartisans.fr/datasets/rge},
  license      = {CC-BY-4.0}
}
```

## Risques & mitigation

| Risque                                                                | Mitigation                                                                                    |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| data.gouv.fr rejette pour redondance avec liste-des-entreprises-rge-2 | Mettre en avant l'enrichissement (géoloc, mapping services, statut validité) — pas un mirroir |
| Cron export mensuel cassé silencieusement                             | Sentry alert sur `export-rge-dataset` + monitor `rge-latest.meta.json` âge > 35j              |
| Scraping abusif via API publique                                      | Rate-limit Upstash 1000 req/jour + watermarking 0,1 % entries trap trackable                  |
| Plainte CNIL champ exposé indu                                        | Audit DPO avant publication + champs personnels exclus du schéma public                       |

## Owner

- **Préparation** : Marvin (founder tech)
- **Soumission** : Marvin (compte data.gouv.fr)
- **Maintenance cron** : `scripts/cron/export-rge-dataset.ts` + `src/app/api/cron/export-rge-dataset/route.ts`
- **Contact public** : `api@servicesartisans.fr`
