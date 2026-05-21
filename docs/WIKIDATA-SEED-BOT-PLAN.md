# Wikidata RGE Seed Bot — Architecture & exécution

**Statut** : v0.1 plan — 2026-05-21  
**Pilier RGE-OS** : #12  
**Effort estimé** : 1 sem solo Marvin · maintenance auto cron weekly

## 1. Objectif

Créer ~49 228 entités Wikidata Q (1 par fiche RGE active SA) + ~200 entités barème CEE + ~96 fiches MaPrimeRénov' + 2 280 communes (si pas déjà existantes) + 4 000 aides locales.

Effet : SA devient source primaire knowledge graph mondial RGE FR. Ingéré par Wikipedia (15 langues) puis Common Crawl puis training data LLMs (GPT/Claude/Mistral/Gemini/Llama).

## 2. Pré-requis légaux & opérationnels

- Création **bot account dédié** : `User:ServicesArtisansBot` sur Wikidata
- **Bot policy compliance** : déposer demande approbation `Wikidata:Requests for permissions/Bot` avec scope précis + dataset upstream + rate-limit respectueux (≤1 edit/sec)
- **CC0 license** sur tous triplets uploadés
- **Verifiability** : chaque claim sourcé via `P248` (stated in) → `Q_ADEME_dataset_RGE` (créer ou réutiliser entité dataset)
- **Pas de promotion commerciale** : entités factuelles uniquement, pas de "SA reviewed" subjectif

## 3. Architecture technique

### Stack

- Python 3.12 + `pywikibot` (lib officielle Wikimedia)
- OAuth 2.0 via `wikibase-cli` ou pywikibot built-in
- Source data : Postgres SA `providers` table + `rge_qualifications` JSONB
- Orchestration : GitHub Actions cron weekly OR cron Vercel edge → Modal Labs task

### Pipeline

1. **Extract** : SQL query `providers` WHERE `rge_qualifications IS NOT NULL AND date_fin > now()` → JSON export
2. **Match** : pour chaque SIRET, search Wikidata existing entity (`haswbstatement:P3215=<SIRET>`)
3. **Decision** :
   - Si entité existe → ADD/UPDATE claims (RGE qualifs, dates, organisme)
   - Si entité absente → CREATE new Q-item avec labels FR+EN+DE+ES+IT, descriptions, claims
4. **Properties à set** :
   - `P31` (instance of) → `Q4830453` (business enterprise) ou sous-classe artisan
   - `P3215` (SIRET) → SIRET 14 chiffres
   - `P1320` (SIREN) → SIREN 9 chiffres
   - `P17` (country) → `Q142` (France)
   - `P131` (located in admin entity) → commune Q-item via code INSEE
   - `P625` (coordinates) → lat/lng
   - **Custom property RGE qualifications** : créer property `P_RGE_qualification` ou utiliser `P1454` (legal form) en attendant
   - `P580` (start time) + `P582` (end time) sur chaque qualif RGE
   - `P_organism` (RGE-attesting organism Qualibat/Qualifelec/Qualit'EnR)
   - `P_source_url` → URL fiche data.gouv.fr ADEME
   - `P_described_at_URL` → URL fiche SA (driver trafic backlink)

### Rate-limiting & idempotence

- Max 60 edits/min (politesse Wikimedia)
- Checkpointing : `wikidata_seed_progress` table Postgres avec `siret → wikidata_qid + last_synced_at`
- Re-runs idempotents : compare hash claims avant write

### Monitoring

- Sentry events `wikidata.seed.success` / `wikidata.seed.error`
- Métrique : entités créées, entités updated, entités skipped (déjà à jour), erreurs API
- Alert Slack si error rate >5% sur batch 1000

## 4. Roll-out progressif

| Phase             | Volume                                                   | Délai                                       |
| ----------------- | -------------------------------------------------------- | ------------------------------------------- |
| **Dry-run**       | 100 entités test sur sandbox Wikidata test.wikidata.org  | J0-J3                                       |
| **Pilote**        | 1 000 entités RGE Île-de-France                          | J3-J10 (approbation bot policy entre temps) |
| **Scale phase 1** | 10 000 entités RGE                                       | J10-J30                                     |
| **Scale phase 2** | 49 000+ entités RGE complets                             | J30-J60                                     |
| **Maintenance**   | Cron weekly sync delta (nouvelles qualifs + expirations) | J60+                                        |

## 5. Risques & mitigations

| Risque                                                   | Probabilité                    | Mitigation                                                                                          |
| -------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------- |
| Refus bot policy Wikidata (promotion commerciale perçue) | Moyenne                        | Présenter en dataset enrichment public CC0, mentionner Etalab source ADEME                          |
| Spam flag par éditeurs Wikidata                          | Faible si bot policy respectée | Edit rate doux ≤60/min + delta-only                                                                 |
| Property RGE non standardisée                            | Élevée                         | Créer property proposal `Wikidata:Property proposal/RGE qualification` puis utiliser P1454 fallback |
| Dépendance API Wikimedia downtime                        | Faible                         | Retry exponential backoff + queue Postgres                                                          |
| Anti-pattern duplicates si SIRET déjà entity             | Moyenne                        | Search-first via `haswbstatement` avant create                                                      |

## 6. Effet attendu

### Court terme (M+0-3)

- 49K entités Wikidata SA sourcées seedées
- Première vague backlinks Wikipedia FR (références "annuaire RGE") via éditeurs
- Indexation Google Knowledge Graph "ServicesArtisans" entity

### Moyen terme (M+3-12)

- Ingestion Common Crawl → corpus training LLMs
- Citation passive dans réponses LLM "trouve plombier RGE Paris"

### Long terme (M+12-36)

- SA cité dans technical cards de fine-tunes spécialisés FR (Mistral, Hugging Face leaderboard)
- Position autorité knowledge graph RGE FR permanente

## 7. Effort détaillé (1 sem solo)

| Jour | Tâche                                                      |
| ---- | ---------------------------------------------------------- |
| J1   | Pywikibot setup + OAuth bot account + test sandbox         |
| J2   | SQL extract `providers` + match search Wikidata existing   |
| J3   | Property mapping + claim builder + dry-run 100             |
| J4   | Bot policy demande approbation Wikidata FR + EN            |
| J5   | Checkpointing Postgres + idempotence + Sentry              |
| J6   | Dry-run 1 000 sandbox + review éditeurs Wikidata FR        |
| J7   | Documentation interne + handoff doc + monitoring dashboard |

Approbation bot policy = ~7-14j externe (en parallèle).

## 8. Code skeleton à créer (référence, pas dans ce commit)

```
scripts/
  wikidata-seed/
    pyproject.toml          # uv project Python
    src/
      sa_wikidata/
        __init__.py
        main.py             # CLI entry
        extract.py          # SQL → JSON
        matcher.py          # haswbstatement search
        builder.py          # ClaimBuilder
        bot.py              # pywikibot wrapper
        checkpoint.py       # Postgres state
        monitor.py          # Sentry events
    tests/
      test_builder.py
      test_matcher.py
    Makefile                # uv sync + ruff + pytest
```

## 9. Référence croisée

- Manifesto RGE-OS : `docs/RGE-OS-MANIFESTO.md` (pilier 12)
- Pivot RGE 49K : memory `servicesartisans-pivot-rge-2026-05-03`
- Glossaire RGE canonical : memory `servicesartisans-glossaire-rge-canonical-2026-05-03`

— Fin v0.1
