# Wikidata — Checklist de soumission live (entité ServicesArtisans)

> **DRY-RUN — généré 2026-05-22.** Aucun appel API live. Soumission communautaire requise avant tout edit Wikidata.

## TL;DR

| Étape                                  | Owner       | Délai estimé | Bloqué par               |
| -------------------------------------- | ----------- | ------------ | ------------------------ |
| 1. Compte personnel Wikidata           | Marvin      | 10 min       | —                        |
| 2. Création manuelle entité corporate  | Marvin      | 30 min       | Étape 1                  |
| 3. Compte bot dédié + bot flag         | Marvin / SA | 7-14 j       | Étape 1, scope clarifié  |
| 4. Q-item « dataset RGE ADEME »        | Communauté  | 3-7 j        | Proposition CC-BY claire |
| 5. Lancement seed bot RGE (Pillier 12) | SA          | post étape 3 | Bot flag + Q-items prêts |

---

## 1. Compte personnel Wikidata (obligatoire avant tout edit)

- URL : <https://www.wikidata.org/wiki/Special:CreateAccount>
- Username suggéré : `Marvin_SA` ou similaire (compte humain, distinct du futur bot).
- Activer 2FA recommandé.
- Confirmer email (sinon limite 0.5 edits/min anonymisée).

## 2. Création manuelle de l'entité corporate ServicesArtisans

L'entité corporate doit être créée **manuellement** par Marvin (auto-création
par bot interdite par WD:N — notabilité « company » exige discussion humaine si
contesté).

### 2a. Pré-publication — compléter ces champs

Le payload `entity-servicesartisans.json` contient deux placeholders à résoudre
avant publication :

| Champ                                | Placeholder actuel                      | Source à utiliser                                                               |
| ------------------------------------ | --------------------------------------- | ------------------------------------------------------------------------------- |
| `P571 inception`                     | `+2026-02-21T00:00:00Z` (mise en ligne) | Date d'immatriculation SAS sur extrait Kbis / annuaire-entreprises.data.gouv.fr |
| `P159 headquarters location`         | `Q142` (France — placeholder)           | Commune INSEE du siège (Q-item commune existant)                                |
| `P1343 described by source` → object | `Q_PLACEHOLDER_DATAGOUV_RGE_DATASET`    | À créer après étape 4 ci-dessous                                                |

### 2b. Publication via interface Wikidata (recommandé pour la première entité)

1. Ouvrir <https://www.wikidata.org/wiki/Special:NewItem>
2. Coller le label FR : `ServicesArtisans`
3. Coller la description FR : `annuaire en ligne d'artisans français spécialisé dans la rénovation énergétique et les certifications RGE`
4. Sauvegarder → un Q-ID est attribué (noter `Q?????`)
5. Ajouter les statements un par un (P31, P17, P1454, P452, P856, P571, P407, P973), en collant les références (P854 + P813) depuis `references-sources.json`
6. Vérifier qu'aucun warning de notabilité n'apparaît

### 2c. Publication par script (alternative — pywikibot)

Si Marvin a déjà pywikibot configuré (OAuth) :

```bash
# Configuration utilisateur (sans bot flag — limite 0.5 edits/sec)
uv run python -m pywikibot.scripts.generate_user_files

# Test sur testwikidata.wikiba.se d'abord
python tools/wbeditentity_from_json.py \
  --target=test \
  --input=tmp/wikidata-submission-2026-05-22/entity-servicesartisans.json
```

> ⚠️ Le binaire `tools/wbeditentity_from_json.py` n'existe **pas** dans ce repo —
> il faudrait l'écrire (~50 LoC pywikibot) une fois bot flag obtenu. Hors-scope v0.

## 3. Compte bot dédié + bot flag (requis pour le seed 49K RGE — Pillier 12)

Ne **pas** confondre avec l'entité corporate : le bot flag est nécessaire pour
le bot Pillier 12 (`scripts/wikidata-seed/`) qui doit créer ~49 228 Q-items de
prestataires RGE. L'entité corporate ServicesArtisans elle-même n'a pas besoin
de bot flag pour être créée (un humain suffit).

### 3a. Création du compte bot

- URL : <https://www.wikidata.org/wiki/Special:CreateAccount>
- Username obligatoire : `ServicesArtisansBot` (ou similaire avec suffixe « Bot »)
- Lier au compte humain de l'opérateur dans la page utilisateur

### 3b. Configuration pywikibot (compte bot)

`user-config.py` minimal :

```python
mylang = 'wikidata'
family = 'wikidata'
usernames['wikidata']['wikidata'] = 'ServicesArtisansBot'
password_file = 'user-password.py'  # OAuth recommandé en alternative
maxlag = 5
put_throttle = 1  # 60 edits/min après flag
```

### 3c. Demande de bot flag — Wikidata:Requests for permissions/Bot

- URL : <https://www.wikidata.org/wiki/Wikidata:Requests_for_permissions/Bot>
- Template à utiliser : `{{Bot request}}`
- Inclure :
  - **Operator** : compte humain + email confirmé
  - **Function** : « Seed RGE provider Q-items from ADEME open dataset (Etalab 2.0) »
  - **Source** : `https://www.data.gouv.fr/fr/datasets/liste-des-entreprises-rge-2/`
  - **Sample edits** : 10 entités créées manuellement à l'étape 2 avec les
    mêmes propriétés que ce que produira le bot
  - **Properties touched** : P31, P3215 (SIRET), P1320 (SIREN), P17, P131,
    P625, P973, P580, P582, P248, P854, P813, P2807 — voir
    `scripts/wikidata-seed/src/sa_wikidata/vocab.py`
  - **Rate limit** : ≤ 60 edits/min
  - **Scope** : ~49 228 créations + maintenance hebdo (snapshot ADEME)
  - **Rollback plan** : checkpoint table Postgres `wikidata_seed_progress`
    - script `revert-by-claim-hash.py` (à écrire v0.2)

Délai estimatif : 7-14 jours (parfois plus si la communauté demande des clarifications).

## 4. Création du Q-item « Liste des entreprises RGE » (dataset ADEME)

Le placeholder `Q_PLACEHOLDER_DATAGOUV_RGE_DATASET` doit être résolu pour que
`P248 stated in` fonctionne en référence.

- Préparer une **community proposal** sur <https://www.wikidata.org/wiki/Wikidata:Project_chat>
  - Label FR : `Liste des entreprises RGE`
  - Label EN : `RGE-certified companies dataset (France)`
  - Description FR : `jeu de données ouvert listant les entreprises françaises titulaires d'une qualification RGE`
  - P31 (instance of) : Q1172284 (data set) + Q5227290 (open data)
  - P275 (license) : Q188942 (Licence Ouverte 2.0)
  - P407 (language) : Q150 (French)
  - P123 (publisher) : Q3017632 (ADEME)
  - P856 (official URL) : `https://www.data.gouv.fr/fr/datasets/liste-des-entreprises-rge-2/`

- Délai estimatif : 3-7 jours.

## 5. Acceptance gates (avant push live)

- [ ] Compte humain Marvin créé, email confirmé, 2FA activé
- [ ] Date Kbis ServicesArtisans confirmée et substituée dans `P571`
- [ ] Q-item commune INSEE du siège substitué dans `P159`
- [ ] Entité corporate ServicesArtisans créée manuellement → Q-ID noté
- [ ] Smoke test : 1 SPARQL `SELECT ?p ?o WHERE { wd:Q?? ?p ?o }` retourne ≥ 8 statements
- [ ] Compte bot créé et lié
- [ ] Bot flag demandé sur RfPB
- [ ] Q-item dataset RGE créé via community proposal
- [ ] vocab.py mis à jour : `Q.ADEME_RGE_DATASET` ← Q-ID réel
- [ ] Bot flag accordé → 24h de test à 1 edit/min sur 50 entités
- [ ] OK : déclencher seed full 49 228 entités via cron Pillier 12

## 6. Risques connus

| Risque                                                | Mitigation                                                                             |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Notabilité contestée (WD:N entreprise privée récente) | Sources tiers (ADEME, data.gouv.fr) prouvent l'existence ; pas de claim notoriété      |
| Q-item dataset RGE refusé                             | Fallback : citer P854 (URL) seul, sans P248                                            |
| Conflict avec entité existante (homonyme)             | Vérifier <https://www.wikidata.org/w/index.php?search=ServicesArtisans> avant création |
| Bot flag refusé                                       | Seed limité à 50/jour sans flag (acceptable mais lent : 49 228 / 50 ≈ 3 ans)           |

## 7. Fichiers livrés (ce dossier)

```
tmp/wikidata-submission-2026-05-22/
├── entity-servicesartisans.json   # Payload wbeditentity prêt-à-coller
├── references-sources.json        # Reference snaks vérifiables (P854 + P813)
└── submission-checklist.md        # Ce fichier
```

## 8. Références

- WD:N (notabilité) : <https://www.wikidata.org/wiki/Wikidata:Notability>
- RfPB : <https://www.wikidata.org/wiki/Wikidata:Requests_for_permissions/Bot>
- Bot policy : <https://www.wikidata.org/wiki/Wikidata:Bots>
- Scaffold Pillier 12 : `scripts/wikidata-seed/README.md`
- Memory note : `servicesartisans-glossaire-rge-canonical-2026-05-03`
