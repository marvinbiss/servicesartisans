# Pipeline Descriptions RGE — SPEC v1.0

**Date** : 2026-04-19
**Owner** : Marvin Bissohong (CEO)
**Statut** : Decisions locked, implementation authorized
**Budget** : ~€300 (vs €2 200 plan humain original)
**Cible** : 50 332 descriptions RGE uniques, YMYL-safe, score moyen ≥ 7.5/10

---

## 1. Contexte & décision

### 1.1 Problème racine

Sur 970 326 providers en DB, **99,94 % sans description** (595 fiches rédigées manuellement, score moyen estimé 3,8/10). Google rejette 511 K pages comme "thin content doorway" malgré un fix SSR déployé le 2026-04-18.

Après le fix SSR, Google voit les pages, mais ne trouve **rien à dire** dessus. Sans contenu unique E-E-A-T, les 459 K pages déjà indexées ne rankeront pas et les 511 K rejetées resteront rejetées.

### 1.2 Périmètre v1

**Cible Tier A** : 50 332 artisans **RGE actifs** uniquement (`rge_valid_until > now()` dans la DB, cf. migration 380).

**Hors périmètre v1** :

- Les 920 K providers non-RGE (passent en `noindex` via `scripts/noindex-non-rge.ts`)
- Les artisans RGE expirés (traitement ultérieur si rattrapage ADEME)
- La traduction multi-langue (FR only)

### 1.3 Décision de méthode

Trois options étaient possibles :

| Option                                             | Coût     | Délai        | Décision                                                                           |
| -------------------------------------------------- | -------- | ------------ | ---------------------------------------------------------------------------------- |
| A — MVP Haiku brut sans grounding                  | €15      | 3 jours      | **REJETÉ** — risque boilerplate élevé                                              |
| B — Plan humain (2 annotateurs eval set)           | €2 200   | 4 semaines   | **REJETÉ** — les €2 000 humains achètent de la défense juridique pas de la qualité |
| **C — Full IA + LLM-as-judge + skill cross-check** | **€300** | **10 jours** | **RETENU**                                                                         |

Option C sélectionnée le 2026-04-19 après analyse contradictoire (cf. chat du jour). Inspiré directement des méthodes Anthropic internes (Constitutional AI, RLAIF, LLM-as-judge).

### 1.4 Principes non-négociables

1. **Eval-first** : rien ne part en prod sans score ≥ 7.5 sur eval set de 100 fiches gold (générées + Opus-judgées + 20 spot-check humain).
2. **Grounding strict** : le LLM ne peut citer que des faits présents dans le context DB injecté. Tout fait non-groundé = hallucination = rejet auto.
3. **YMYL non-négociable** : aucun montant MaPrimeRénov' sans source `france-renov.gouv.fr`. Aucune promesse d'aide financière individualisée. Score D5 < 8 = rejet immédiat.
4. **Versioning reproductible** : `prompt_version`, `rubric_version`, `model`, `tokens_in`, `tokens_out`, `cost_usd` stockés par fiche. Toute génération doit être rejouable.
5. **Cross-validation indépendante** : au moins 2 modèles différents (Haiku génère, Opus juge) + 1 skill externe (GPT-5 via zai-mcp ou Gemini) pour détecter les biais systémiques.
6. **Pas d'emoji dans les descriptions générées** (cf. préférence utilisateur globale).

---

## 2. Architecture pipeline

### 2.1 Vue d'ensemble

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  RETRIEVAL   │─→│  GENERATION  │─→│  VALIDATION  │─→│   PUBLISH    │
│  (DB → JSON) │  │ (Haiku 2-pass)│  │  (3 layers)  │  │ (incrémental)│
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
       ↑                 ↑                 ↓                 ↓
   providers        prompt v1.0       draft table      providers.description
   communes         + context         + scores         updated_at bump
   services         + constraints     + flags          noindex trigger
   rge_qualif.                        + cost/tokens    indexnow ping
```

### 2.2 Trois couches de validation

| Couche                     | Type            | Modèle                                                    | Rôle                                                                                                                | Coût/fiche          |
| -------------------------- | --------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------- |
| **L1 — Validator auto**    | Algorithmique   | 0 LLM                                                     | Checks objectifs (longueur, unicité MinHash, NER count, YMYL blacklist, hallucination detector par entity match DB) | €0                  |
| **L2 — Opus-as-judge**     | Rubrique LLM    | `claude-opus-4-1-20250805`                                | Score 9 dimensions subjectives (lisibilité, intent, QRG)                                                            | €0.003              |
| **L3 — Skill cross-check** | Fact-check live | GPT-5 via zai-mcp + web search MCP (france-renov.gouv.fr) | Vérif SIRET réel, qualification ADEME live, détection bias systémique Opus                                          | €0.15 (sample only) |

**Politique d'appel** :

- L1 : 100 % des fiches (gratuit, synchrone dans le script)
- L2 : 100 % des fiches (asynchrone post-génération)
- L3 : **5 % sample aléatoire** + 100 % des fiches en status `flagged` par L1 ou L2 (~300 fiches estimées)

### 2.3 Modèles retenus

| Rôle                              | Modèle Anthropic            | Alternative       | Choix final                                                         |
| --------------------------------- | --------------------------- | ----------------- | ------------------------------------------------------------------- |
| Génération bulk                   | `claude-haiku-4-5-20251001` | `gpt-4o-mini`     | **Haiku 4.5** (qualité FR > 4o-mini, rate limit 2000 RPM suffisant) |
| Régénération rescue (15 % estimé) | `claude-sonnet-4-6`         | `claude-opus-4-7` | **Sonnet 4.6** (meilleur coût/qualité pour rescue)                  |
| Juge (L2)                         | `claude-opus-4-7`           | —                 | **Opus 4.7** (rubrique sensible, modèle le + fort)                  |
| Cross-check (L3 skill)            | GPT-5 via `zai-mcp-server`  | Gemini via MCP    | **GPT-5.2** pour différence maximale avec Opus                      |

### 2.4 Versioning

- **Prompt** : fichier dans `src/lib/descriptions/prompts/v1.0.ts`. Toute modification → bump version (v1.1, v1.2...) + doc dans `docs/descriptions-pipeline/prompt-changelog.md`. Chaque fiche stocke `prompt_version` utilisé.
- **Rubric** : `src/lib/descriptions/rubric/v1.0.ts` avec les 9 dims + coefficients. Bump indépendant.
- **Model** : stocké par fiche (`llm_model` TEXT). Permet de re-scorer anciennes générations avec nouveau modèle.

---

## 3. Rubrique de scoring (9 dimensions)

Reprise intégrale du plan MASTER chap 6 §2.2, adaptée pour scoring automatique.

### 3.1 Dimensions

| #   | Nom                      | Méthode auto (L1)                        | Méthode LLM (L2)     | Seuil               | Coeff   |
| --- | ------------------------ | ---------------------------------------- | -------------------- | ------------------- | ------- |
| D1  | Originalité lexicale     | TF-IDF bi-grammes vs corpus              | Opus note 0-10       | ≥ 7                 | 1.0     |
| D2  | Variabilité inter-fiches | MinHash Jaccard LSH                      | —                    | Jaccard < 0.30      | 1.0     |
| D3  | Densité informationnelle | NER count / mots totaux                  | —                    | ≥ 1/25 mots         | 1.2     |
| D4  | Conformité E-E-A-T       | Entity match DB (RGE + SIRET + ville)    | Opus note            | ≥ 7                 | 1.5     |
| D5  | **Compliance YMYL**      | Blacklist regex + montants = 0           | Opus note stricte    | **≥ 8 obligatoire** | **2.0** |
| D6  | SEO sémantique           | Présence entités géo (commune+dept+code) | —                    | ≥ 6                 | 0.8     |
| D7  | Lisibilité               | Flesch-Kandel-Moles FR                   | —                    | ≥ 6 (K-M ≥ 55)      | 0.8     |
| D8  | Couverture intent        | 3 intents présents (info/trans/conf)     | Opus note            | ≥ 7                 | 1.2     |
| D9  | Conformité QRG           | —                                        | Opus note (QRG 2026) | ≥ 7                 | 1.5     |

### 3.2 Score global

```
Score = Σ(Dn × Coeff_n) / Σ(Coeff_n)
      = (D1×1.0 + D2×1.0 + D3×1.2 + D4×1.5 + D5×2.0 + D6×0.8 + D7×0.8 + D8×1.2 + D9×1.5) / 11.0
```

### 3.3 Règle de décision

| Score global | Action auto                                                                                   |
| ------------ | --------------------------------------------------------------------------------------------- |
| ≥ 8.0        | `status = 'approved'` → publish direct (sauf D5 < 8 → override reject)                        |
| 7.0 – 7.9    | `status = 'approved'` + `human_review_required = true` (priorité basse)                       |
| 6.0 – 6.9    | `status = 'draft'` + `human_review_required = true`                                           |
| < 6.0        | `status = 'rejected'` + régénération avec Sonnet + prompt augmenté (raison du rejet injectée) |

### 3.4 Overrides absolus (rejet immédiat, bypass score global)

- **D5 YMYL < 8** : un montant MaPrimeRénov' évoqué sans source = fiche rejetée quel que soit le reste
- **Hallucination détectée** (qualification citée absente de `rge_qualifications` JSONB, SIRET cité différent de `providers.siret`) = rejet
- **Boilerplate MinHash** (Jaccard ≥ 0.30 vs autre fiche du même corpus) = régénération avec variance augmentée (temp 0.9)

---

## 4. Cost model détaillé

### 4.1 Hypothèses tokenisation

- Prompt système + instructions : ~1 500 tokens input
- Context DB par fiche : ~700 tokens input (7 champs × ~100 tokens)
- Output moyen : ~350 tokens (description 250 mots ≈ 340 tokens FR)
- **Total par fiche** : ~2 200 input + 350 output

### 4.2 Coûts par poste (tarifs Anthropic officiels avril 2026)

| Modèle     | Input $/M | Output $/M | Coût/fiche |
| ---------- | --------- | ---------- | ---------- |
| Haiku 4.5  | $0.25     | $1.25      | $0.0010    |
| Sonnet 4.6 | $3.00     | $15.00     | $0.0119    |
| Opus 4.7   | $15.00    | $75.00     | $0.0594    |

### 4.3 Budget pipeline complet

| Étape                                        | Volume                      | Modèle                                             | Coût unitaire | Total        |
| -------------------------------------------- | --------------------------- | -------------------------------------------------- | ------------- | ------------ |
| Gen passe 1 bulk                             | 50 332                      | Haiku 4.5                                          | $0.0010       | **$50**      |
| Rescue 15 %                                  | 7 550                       | Sonnet 4.6                                         | $0.0119       | **$90**      |
| L2 Opus-judge (100 % des approved + flagged) | ~45 000                     | Opus 4.7 (input only, ~500 tok input / 200 output) | $0.0225       | **$1 000** ⚠ |
| L3 Skill cross-check                         | 2 500 (5% sample + flagged) | GPT-5.2                                            | $0.0600       | **$150**     |
| Calibration gold set                         | 100 × 3 regen               | Sonnet + Opus                                      | $0.08         | **$8**       |
| **Total brut**                               |                             |                                                    |               | **~$1 300**  |

⚠ **Le coût Opus-judge explose** si on juge 45K fiches. Correction : on ne juge avec Opus que les fiches en zone grise (score auto 6.5–8.0), soit ~15 K fiches, pas 45 K. Les score ≥ 8.0 auto sont directement publish (avec D5 YMYL check absolu). Les < 6.0 sont régénérées.

### 4.4 Budget révisé réaliste

| Étape                                       | Volume | Modèle     | Total     |
| ------------------------------------------- | ------ | ---------- | --------- |
| Gen passe 1                                 | 50 332 | Haiku 4.5  | $50       |
| Rescue 15 %                                 | 7 550  | Sonnet 4.6 | $90       |
| L2 Opus-judge (zone grise uniquement, 15 K) | 15 000 | Opus 4.7   | **$330**  |
| L3 Skill cross-check                        | 2 500  | GPT-5.2    | $150      |
| Calibration + prompt iteration              | —      | —          | $30       |
| **Total**                                   |        |            | **~$650** |

Budget cible annoncé €300 était optimiste — la réalité avec Opus-judge rigoureux est **~$650**. À valider avec utilisateur avant lancement.

### 4.5 Arbitrage qualité vs coût

Si l'utilisateur confirme le budget élargi ($650), on garde Opus-judge sur zone grise.
Si budget serré ($300), on remplace Opus-judge par Sonnet-judge (qualité ~85 % d'Opus, coût divisé par 5 → ~$66 pour L2, total ~$380).

---

## 5. Schema DB `provider_descriptions_draft`

```sql
CREATE TABLE provider_descriptions_draft (
  id                     UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id            UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  description_text       TEXT NOT NULL,
  word_count             INTEGER GENERATED ALWAYS AS (array_length(regexp_split_to_array(trim(description_text), '\s+'), 1)) STORED,

  -- Scores L1 (validator auto)
  score_d1_originality   NUMERIC(4,2),
  score_d2_variability   NUMERIC(4,2),
  score_d3_density       NUMERIC(4,2),
  score_d4_eeat          NUMERIC(4,2),
  score_d5_ymyl          NUMERIC(4,2),
  score_d6_seo           NUMERIC(4,2),
  score_d7_readability   NUMERIC(4,2),
  score_d8_intent        NUMERIC(4,2),
  score_d9_qrg           NUMERIC(4,2),
  score_global_auto      NUMERIC(4,2),

  -- Scores L2 (Opus-judge, optionnel selon zone grise)
  score_l2_opus          NUMERIC(4,2),
  opus_notes             TEXT,

  -- Scores L3 (skill cross-check, sample uniquement)
  score_l3_crosscheck    NUMERIC(4,2),
  crosscheck_model       TEXT,
  crosscheck_notes       TEXT,
  crosscheck_factcheck_passed BOOLEAN,

  -- Versioning + traçabilité
  prompt_version         TEXT NOT NULL,
  rubric_version         TEXT NOT NULL,
  llm_model              TEXT NOT NULL,
  tokens_input           INTEGER NOT NULL,
  tokens_output          INTEGER NOT NULL,
  cost_usd               NUMERIC(8,6) NOT NULL,

  -- Status + flags
  status                 TEXT NOT NULL DEFAULT 'draft'
                           CHECK (status IN ('draft','approved','rejected','published','flagged')),
  hallucination_flags    JSONB DEFAULT '[]'::jsonb,
  boilerplate_score      NUMERIC(4,2),
  human_review_required  BOOLEAN DEFAULT false,
  human_reviewer         TEXT,
  human_review_score     NUMERIC(4,2),
  human_review_notes     TEXT,
  rejection_reason       TEXT,
  regeneration_count     INTEGER DEFAULT 0,

  -- Timestamps
  generated_at           TIMESTAMPTZ DEFAULT now(),
  validated_at           TIMESTAMPTZ,
  published_at           TIMESTAMPTZ
);

CREATE INDEX idx_pdd_provider_id ON provider_descriptions_draft(provider_id);
CREATE INDEX idx_pdd_status ON provider_descriptions_draft(status);
CREATE INDEX idx_pdd_score_global ON provider_descriptions_draft(score_global_auto DESC);
CREATE INDEX idx_pdd_flagged ON provider_descriptions_draft(status) WHERE status IN ('flagged','rejected');
CREATE UNIQUE INDEX idx_pdd_provider_version ON provider_descriptions_draft(provider_id, prompt_version) WHERE status != 'rejected';

COMMENT ON TABLE provider_descriptions_draft IS
  'Table intermédiaire pipeline descriptions RGE. Publications dans providers.description se font par copie explicite (status=published).';
```

---

## 6. Calendrier

### J1 (2026-04-19) — Fondations

- SPEC-V1 (ce document) ✓
- Skill `/sa-description-audit` (3 modes : quick / deep / factcheck)

### J2 — Calibration skill

- Run skill sur 50 fiches existantes échantillonnées
- Report calibration : distribution scores + détection profils A/B/C/D
- Ajustement prompt skill si nécessaire

### J3 — Infrastructure DB

- Migration `provider_descriptions_draft`
- Trigger `sync_provider_noindex`
- Module `src/lib/descriptions/retrieval.ts`

### J4 — Prompt + rubric

- `src/lib/descriptions/prompts/v1.0.ts`
- `src/lib/descriptions/rubric/v1.0.ts`
- Unit tests prompt injection + context safety (pas de leak PII)

### J5 — Validator

- `src/lib/descriptions/validator.ts` (9 dims algorithmiques)
- Hallucination detector (entity match DB)
- Unit tests vs eval set manuel 10 fiches

### J6 — Script batch

- `scripts/generate-rge-descriptions.ts`
- Checkpoint/resume, retry exponentiel, graceful shutdown
- Test dry-run 10 fiches

### J7 — Calibration Opus-judge

- Génération batch 100 fiches sur stratification du plan (5 métiers × 20 fiches)
- Opus score chaque fiche sur rubrique
- Kappa Opus-vs-skill ≥ 0.7 obligatoire
- Si kappa < 0.7 → itération prompt v1.0 → v1.1

### J8 — Génération 50K

- Batch complet Haiku (~7h)
- Validator auto (~1h)
- Zone grise → Opus-judge (~3h)
- Skill cross-check sur 2 500 samples (~1h)

### J9 — Review + rescue

- Rescue Sonnet sur rejected (~7 500 fiches, ~2h)
- Spot-check humain 20 fiches flagged (1h utilisateur)
- Publication progressive vagues 10K/jour

### J10 — Monitoring

- Dashboard GSC + Sentry
- Review prompt v1.1 si score moyen < 7.5
- Rapport final + prochaines étapes

---

## 7. Risques & mitigations

| Risque                                           | Probabilité               | Impact                           | Mitigation                                                           |
| ------------------------------------------------ | ------------------------- | -------------------------------- | -------------------------------------------------------------------- |
| Hallucinations YMYL non détectées                | Moyenne                   | **Haut** (procès CNIL/DGCCRF)    | D5 blacklist stricte + hallucination detector + skill factcheck live |
| Boilerplate inter-fiches                         | Haute                     | Moyen (Google pattern detection) | MinHash LSH obligatoire + temp 0.8 + seed variance par prompt        |
| Opus-judge biaisé (se valide lui-même)           | Moyenne                   | Moyen                            | Skill L3 avec GPT-5 = modèle différent = détection bias              |
| API rate limit dépassé                           | Faible                    | Faible                           | Backoff exponentiel + reprise sur checkpoint                         |
| DB UPDATE lock contention pendant publish        | Faible                    | Moyen                            | Publication batch 500 avec FOR UPDATE SKIP LOCKED                    |
| Coût dépasse budget                              | Moyenne                   | Faible                           | Kill switch sur cost_cumul > $800, human review                      |
| Qualité < 7.5 moyenne post-génération            | Moyenne                   | **Haut** (pipeline à refaire)    | Calibration J7 obligatoire, stop si kappa < 0.7                      |
| Données DB incomplètes (rge_qualifications vide) | Certaine (part du corpus) | Moyen                            | Fallback : skip fiches avec context < 200 tokens informatifs         |
| Descriptions trop similaires après rescue Sonnet | Faible                    | Faible                           | Prompt rescue inclut explicitement "diffère de la v1 précédente"     |

---

## 8. Critères de succès (go/no-go final)

Publication 50K autorisée seulement si **TOUS** ces critères sont remplis :

- [ ] Score global moyen ≥ 7.5/10 sur les 50 332 fiches
- [ ] Score D5 YMYL moyen ≥ 8.5 (obligatoire, YMYL non négociable)
- [ ] Taux de rejet passe 1 ≤ 20 % (au-delà, prompt à retravailler)
- [ ] Kappa Opus-skill ≥ 0.7 sur 100 fiches gold (ou ré-itération prompt)
- [ ] Distribution MinHash : < 5 % des fiches avec Jaccard ≥ 0.30 vs paire la plus proche
- [ ] Hallucination rate ≤ 0.3 % (150 fiches max sur 50K)
- [ ] Fact-check skill sur sample 2 500 : ≥ 98 % pass rate
- [ ] Budget réel ≤ $800 (headroom 25 % sur estimation $650)
- [ ] Spot-check humain 20 fiches : 0 erreur bloquante détectée par utilisateur

---

## 9. Décisions en attente de validation utilisateur

1. **Budget final** : €300 cible initiale, estimation réelle **~$650**. Aller jusqu'à $800 max ou réduire à Sonnet-judge pour rester sous $400 ?
2. **Sample rate skill L3** : 5 % (2 500 fiches, $150) ou 10 % (5 000 fiches, $300) pour sécurité accrue ?
3. **Publish policy** : vagues de 10K/jour (5 jours) ou tout d'un coup avec IndexNow ping (plus rapide mais pic crawl budget Google) ?
4. **Spot-check humain** : 20 fiches (1h) ou 50 fiches (3h) ?
5. **API Entreprise INSEE** : setup DataPass en parallèle (gratuit, 2 semaines) pour enrichir context = meilleure qualité, ou on skip pour v1 ?

---

## 10. Références

- Plan maître chapitre 6 : `docs/ahrefs-audit-2026-04/v2/PLAN-V2-06-CONTENT-QUALITY-LLM-EVAL.md`
- Plan synthèse : `docs/ahrefs-audit-2026-04/MASTER-PLAN-00-SYNTHESIS.md`
- Migration RGE ADEME : `supabase/migrations/380_rge_ademe_integration.sql`
- Google QRG 2026 : cité dans plan maître, pas re-dupliqué ici
- Script noindex RGE-only (prérequis) : `scripts/noindex-non-rge.ts`
- Anthropic Constitutional AI : méthode d'inspiration L2/L3 (LLM-as-judge)
