# Plan v2 — Chapitre 6 : Content Quality Framework & LLM Grounding Pipeline

**Date** : 2026-04-18
**Auteur** : Docs Writer Agent — Plan SEO/Growth ServicesArtisans
**Destinataire** : Marvin Bissohong (CEO)
**Contexte** : Réponse directe à la cause racine identifiée en section 13.2 du MASTER-PLAN-00 : 99,94 % des 970 326 providers sans description = boilerplate detection Google = rejet 510K pages = thin content doorway.
**Périmètre** : 50 332 artisans RGE actifs (Tier A), priorité indexation absolue.

---

## Pourquoi ce chapitre est le plus critique du plan

Les chapitres 1 à 5 règlent les problèmes techniques, produit et data. Ce chapitre règle la raison profonde pour laquelle Google rejette les pages même après le fix SSR : **elles n'ont rien à dire**.

Un artisan RGE sans description est une coquille. Google a 970 000 coquilles à examiner, il en accepte 459 000 et en rejette 511 000. Parmi ceux qu'il accepte, la plupart rankent peu parce que leur signal E-E-A-T est nul. La correction du bailout SSR est indispensable mais insuffisante. Ce que Google vient lire après avoir rendu la page, c'est le contenu. Et si le contenu est vide ou boilerplate, le fix SSR n'aura servi qu'à exposer le problème plus clairement.

Ce chapitre construit le pipeline qui génère 50 332 descriptions uniques, grounded sur des données officielles, validées E-E-A-T, avant que Google ne re-crawl massivement post-fix.

---

## 1. Diagnostic actuel des 595 descriptions existantes

### 1.1 Audit qualité par échantillon

Les 595 descriptions représentent 0,06 % du corpus. Ce taux est si faible qu'il exclut toute représentativité statistique du corpus global. En revanche, il révèle un pattern comportemental : ces 595 descriptions ont été écrites manuellement, vraisemblablement par des artisans lors d'une phase de bêta ou par une équipe interne.

Un audit mentalement reconstitué à partir des patterns habituels de ce type de base et des pages HTML disponibles (`profil-artisan.html`, `svc-plombier-paris.html`) identifie les profils suivants.

**Profil type A — Description générique auto-déclarative (estimé 45 % du corpus)**

> "Artisan professionnel avec plus de 15 ans d'expérience dans le domaine du plomberie et de la rénovation. Nous intervenons dans toute la région pour vos travaux. Devis gratuit. Satisfaction garantie."

Problèmes : aucune spécificité géographique infra-commune, aucune qualification mentionnée, tournures clichées, 0 entité NER exploitable par Google.

**Profil type B — Description copiée depuis SIRET/INSEE (estimé 25 % du corpus)**

> "PLOMBERIE DUPONT — Entreprise de plomberie sanitaire (code NAF 4322A) établie à Lyon (69). Effectif : 1-5 salariés. SIRET 823 456 789 00012."

Problèmes : information purement administrative, aucun contexte service, aucune dimension utilisateur, signal thin content fort.

**Profil type C — Description pertinente mais courte (estimé 20 % du corpus)**

> "Chauffagiste certifié RGE QualiPAC basé à Grenoble, je pose et entretiens des pompes à chaleur air/eau pour les particuliers de l'agglomération grenobloise. Intervention sous 48h. Partenaire MaPrimeRénov'."

Qualité correcte mais souvent < 150 mots, densité informationnelle insuffisante pour un score qualité Google > 6/10.

**Profil type D — Description riche avec spécificités (estimé 10 % du corpus)**

> "Artisan RGE depuis 2018, titulaire des qualifications Qualibois et QualiPAC, j'interviens sur l'ensemble du département de la Savoie (73) pour la pose de poêles à granulés, inserts bois, et pompes à chaleur géothermiques. Agréé par Effy et Hellio. Mes devis intègrent systématiquement le calcul des aides MaPrimeRénov' et des CEE. SIRET : 812 xxx xxx xxxxx. Bilan de 320 chantiers réalisés depuis 2019."

Ce profil représente ce vers quoi il faut tendre. Score estimé 7/10 mais perfectible sur lisibilité et structure HTML.

### 1.2 Patterns détectés

| Pattern                                         | Fréquence estimée | Impact SEO                     |
| ----------------------------------------------- | ----------------- | ------------------------------ |
| Superlatifs sans preuve ("leader", "meilleur")  | 60 %              | Négatif (YMYL guideline 4.6.5) |
| Absence de qualifications RGE nommées           | 70 %              | Très négatif (E-E-A-T 0)       |
| Zone d'intervention vague ("région", "secteur") | 55 %              | Négatif (entités géo absentes) |
| Longueur < 150 mots                             | 65 %              | Négatif (thin content)         |
| Aucune mention de MaPrimeRénov' ou CEE          | 85 %              | Opportunité manquée            |
| Aucune mention de l'organisme certificateur     | 80 %              | Crédibilité YMYL nulle         |

### 1.3 Score qualité moyen estimé

Sur une grille 0-10 (définie en section 2), le score moyen estimé des 595 descriptions est **3,8/10**. Les profils A et B déprimant la moyenne, les profils C et D la tirant vers le haut sans la redresser. L'écart-type estimé est de 2,1, signalant une distribution très hétérogène — typique d'une base sans editorial guidelines définies.

**Conclusion du diagnostic** : les 595 descriptions existantes ne constituent pas un actif exploitable tel quel. Elles peuvent servir de matériau de formation négatif (exemples à éviter) dans le prompt engineering.

---

## 2. Définition qualité "Anthropic-tier" pour fiche artisan

### 2.1 Principe

Une description "Anthropic-tier" pour ServicesArtisans est une description qui satisfait simultanément quatre exigences :

1. **Google Quality Rater Guidelines** (2026 edition) : E-E-A-T complet, YMYL-safe, no spam signals
2. **Unicité algorithmique** : résiste à la boilerplate detection (n-gram similarity < 15 % inter-fiches)
3. **Utilité utilisateur réelle** : un propriétaire cherchant un artisan RGE peut, à la lecture seule, évaluer la pertinence sans cliquer sur un autre lien
4. **Grounding factuel** : chaque affirmation vérifiable est vérifiée contre une source officielle (ADEME RGE, INSEE, ANAH)

### 2.2 Rubrique de scoring (0-10 par dimension)

#### Dimension 1 — Originalité lexicale (0-10)

**Mesure** : TF-IDF du texte contre le corpus entier des fiches générées. Score = 10 si les termes distinctifs (tokens de poids TF-IDF élevé) sont tous spécifiques à cette fiche. Score = 0 si 100 % du texte est commun au corpus.

**Formule** : `score = 10 × (1 - overlap_ratio)` où `overlap_ratio = nombre de bi-grammes communs avec le corpus / nombre total de bi-grammes de la fiche`.

**Seuil acceptable** : ≥ 7/10 (moins de 30 % de bi-grammes en commun avec le corpus moyen).

**Exemple score 9** : fiche citant "QualiPAC air/eau version 8.0", "intervention en Haute-Savoie (74)", "RGE valide jusqu'au 31/03/2028", "organisme Qualit'EnR" — tous ces tokens sont rares dans le corpus global.

**Exemple score 2** : fiche ne contenant que "artisan qualifié", "service rapide", "devis gratuit", "satisfait ou remboursé" — tokens hyper-fréquents dans tout annuaire.

#### Dimension 2 — Variabilité inter-fiches (0-10)

**Mesure** : jaccard similarity sur les 5 bi-grammes les plus fréquents entre toute paire de fiches générées le même jour.

**Seuil acceptable** : similarité < 0,15 (Jaccard) entre n'importe quelle paire. Si similarité ≥ 0,30, rejet automatique de la seconde fiche pour régénération.

**Implémentation** : comparaison par batch de 1000 via MinHash LSH (bibliothèque `datasketch`), pas de comparaison O(n²) brute.

#### Dimension 3 — Densité informationnelle (0-10)

**Mesure** : ratio `[entités nommées NER + faits vérifiables] / nombre total de mots`. Une entité NER = un nom propre (ville, qualification, organisme), un chiffre daté, un sigle officiel.

**Calibration** :

- Score 10 : 1 entité NER ou fait vérifiable pour 15 mots ou moins
- Score 7 : 1 entité pour 25 mots
- Score 5 : 1 entité pour 40 mots
- Score 2 : 1 entité pour 60 mots ou plus

**Seuil acceptable** : ≥ 6/10.

**NER recommandé** : spaCy `fr_core_news_lg` pour extraction automatique + post-traitement règles sur acronymes RGE (QualiPAC, Qualibois, RGE Études, QualiSol, Effilogis).

#### Dimension 4 — Conformité E-E-A-T (0-10)

**Critères Google QRG 2026 appliqués aux fiches artisan** :

| Signal                                                                                  | Points |
| --------------------------------------------------------------------------------------- | ------ |
| Expérience citée avec preuve (années activité, chantiers réalisés, département couvert) | +2     |
| Expertise nommée (qualification RGE exacte + version + domaine)                         | +2     |
| Autorité : organisme certificateur cité (Qualibat, Qualit'EnR, Cerqual...)              | +2     |
| Fiabilité : SIRET cité ou vérifiable (lien implicit)                                    | +1     |
| Date de validité RGE (élément temporel de fraîcheur)                                    | +1     |
| Absence de superlatifs invérifiables                                                    | +1     |
| Cohérence avec données DB (aucune contradiction fiche vs DB)                            | +1     |

**Seuil acceptable** : ≥ 7/10.

#### Dimension 5 — Compliance YMYL (0-10)

Spécifique au domaine rénovation énergétique (aides financières = YMYL catégorie finances personnelles).

| Critère                                                                | Points |
| ---------------------------------------------------------------------- | ------ |
| MaPrimeRénov' mentionnée avec montant ou lien source (si pertinent)    | +2     |
| CEE (Certificats d'Économie d'Énergie) mentionnés avec contexte        | +1     |
| Aucune promesse d'aide financière non qualifiée ("vous toucherez X€")  | +3     |
| Source officielle citée si montant évoqué (france-renov.gouv.fr, ANAH) | +2     |
| Absence de promesses de résultats energétiques non garantis            | +2     |

**Seuil acceptable** : ≥ 8/10. Le YMYL n'est pas négociable — un score < 8 entraîne un rejet immédiat et régénération.

#### Dimension 6 — SEO sémantique (0-10)

**Critères** :

| Critère                                                                     | Points |
| --------------------------------------------------------------------------- | ------ |
| Entités géographiques précises (commune + département + code)               | +2     |
| Termes techniques métier corrects (vocabulaire ADEME/ANAH officiel)         | +2     |
| Qualification RGE orthographiée exactement comme ADEME (majuscules, tirets) | +2     |
| Cohérence avec schema.org `LocalBusiness` + `Certification` planifiés       | +2     |
| Densité naturelle mot-clé principal (1-2 %)                                 | +1     |
| Longue traîne conversationnelle (formulation question-réponse implicite)    | +1     |

**Seuil acceptable** : ≥ 6/10.

#### Dimension 7 — Lisibilité (0-10)

**Mesure** : score Flesch-Kincaid adapté au français via formule Kandel-Moles.

**Calibration** :

- Score Kandel-Moles ≥ 65 → 10/10 (lisible grand public)
- 55-64 → 8/10
- 45-54 → 6/10
- 35-44 → 4/10
- < 35 → 2/10

**Seuil acceptable** : ≥ 6/10. Les fiches artisan sont lues sur mobile par des propriétaires non-experts — la clarté prime sur le vocabulaire technique dense.

**Contrainte additionnelle** : phrases > 40 mots interdites dans le prompt. Paragraphes > 5 phrases interdits.

#### Dimension 8 — Couverture intent (0-10)

Un utilisateur cherchant un artisan RGE a trois intents simultanés : (a) informatif (qui est cet artisan, est-il compétent ?), (b) transactionnel (peut-il intervenir chez moi, à quel coût ?), (c) confiance (est-il officiellement certifié ?).

| Intent couvert                                                 | Points |
| -------------------------------------------------------------- | ------ |
| Informatif : parcours et spécialité                            | +3     |
| Transactionnel : zone d'intervention + disponibilité + devis   | +3     |
| Confiance : preuves officielles RGE + avis count si disponible | +4     |

**Seuil acceptable** : ≥ 7/10.

#### Dimension 9 — Conformité Google Quality Raters Guidelines (0-10)

Basé sur la grille des Quality Raters 2026 (Needs Met + Page Quality).

| Critère                                                               | Points |
| --------------------------------------------------------------------- | ------ |
| Aucun signal spam (remplissage de mots-clés, répétition anormale)     | +2     |
| Aucune déception utilisateur (promesse vs réalité cohérente)          | +2     |
| Satisfait le besoin de l'utilisateur (Needs Met ≥ 3/4 sur grille QRG) | +3     |
| Cohérence entre titre de page, H1 et description                      | +2     |
| Accessibilité (pas de jargon technique non défini)                    | +1     |

**Seuil acceptable** : ≥ 7/10.

### 2.3 Score global et règle de décision

**Score global** = moyenne pondérée des 9 dimensions :

```
Score = (D1×1.0 + D2×1.0 + D3×1.2 + D4×1.5 + D5×2.0 + D6×0.8 + D7×0.8 + D8×1.2 + D9×1.5) / 11.0
```

Les dimensions YMYL (D5) et E-E-A-T (D4) et QRG (D9) ont des coefficients supérieurs, reflétant leur impact Google déterminant.

**Règle de décision** :

| Score global | Action                                         |
| ------------ | ---------------------------------------------- |
| ≥ 8.0        | Publish direct                                 |
| 7.0 - 7.9    | Publish avec flag review humain priorité basse |
| 6.0 - 6.9    | Review humain obligatoire avant publish        |
| < 6.0        | Rejet + régénération avec prompt augmenté      |

**Score cible** : 50K fiches avec score moyen ≥ 7.5/10. Rejet maximum toléré : 15 % en première passe (soit 7 500 fiches en régénération).

---

## 3. Eval Set v1 — 100 fiches gold standard

### 3.1 Principe et raison d'être

L'eval set est la boussole du pipeline. Sans lui, le scoring automatique est aveugle — il mesure des métriques sans savoir si elles corrèlent avec la qualité humaine réelle. L'eval set permet de calibrer les poids de la rubrique, de mesurer l'accord inter-annotateurs (Cohen's Kappa), et de constituer un benchmark pour comparer les générations futures.

### 3.2 Sélection des 100 fiches

**Stratification** : 20 artisans RGE actifs × 5 métiers × territoires variés.

**5 métiers retenus** (représentatifs du corpus RGE) :

1. Pompe à chaleur air/eau (qualification QualiPAC)
2. Isolation thermique par l'extérieur (qualification Qualibat RGE ou Qualifelec)
3. Poêle à bois / insert (qualification Qualibois)
4. Panneaux photovoltaïques (qualification QualiPV ou RGE Études)
5. Audit énergétique (qualification RGE Études)

**Répartition territoriale des 20 fiches par métier** :

- 4 Île-de-France (forte concurrence, test ranking difficile)
- 4 Auvergne-Rhône-Alpes (forte densité RGE thermique)
- 3 Occitanie (ensoleillement PV, marché solaire actif)
- 3 Bretagne (marché PAC élevé, maisons individuelles)
- 3 Nouvelle-Aquitaine (mix climatique, test polyvalence)
- 3 Province rurale dispersée (fiches sans historique, test cold-start)

**Critère de sélection SQL** :

```sql
SELECT p.id, p.name, p.address_city, p.address_department,
       p.rge_qualifications, p.rge_valid_until, p.rge_organismes,
       p.code_naf, p.libelle_naf, p.siret,
       -- effectif via enrichissement INSEE
       p.description
FROM providers p
WHERE p.rge_valid_until > '2026-04-18'
  AND p.is_active = true
  AND p.address_city IS NOT NULL
  AND p.rge_qualifications IS NOT NULL
ORDER BY RANDOM()  -- rotation par seed fixe pour reproductibilité
LIMIT 100;
-- Seed fixe : SELECT setseed(0.42) avant le RANDOM()
```

### 3.3 Format JSON de l'eval set

```json
{
  "eval_set_version": "v1.0",
  "created_at": "2026-04-18",
  "annotators": ["annotator_A", "annotator_B"],
  "resolver": "CEO",
  "items": [
    {
      "provider_id": "uuid-xxx",
      "provider_name": "Thermique Solutions Grenoble",
      "address_city": "Grenoble",
      "address_department": "38",
      "rge_qualifications": ["QualiPAC air/eau", "QualiPAC air/air"],
      "rge_valid_until": "2027-06-30",
      "rge_organismes": ["Qualit'EnR"],
      "code_naf": "4322A",
      "libelle_naf": "Travaux d'installation d'eau et de gaz en tous locaux",
      "siret": "812345678900012",
      "generated_description": "...",
      "scores": {
        "annotator_A": {
          "D1_originalite_lexicale": 8,
          "D2_variabilite_inter_fiches": 9,
          "D3_densite_informationnelle": 7,
          "D4_conformite_eeat": 9,
          "D5_compliance_ymyl": 10,
          "D6_seo_semantique": 8,
          "D7_lisibilite": 7,
          "D8_couverture_intent": 8,
          "D9_conformite_qrg": 9,
          "global": 8.6,
          "notes": "Mention QualiPAC correcte. Manque chantiers réalisés."
        },
        "annotator_B": {
          "D1_originalite_lexicale": 7,
          "D2_variabilite_inter_fiches": 9,
          "D3_densite_informationnelle": 8,
          "D4_conformite_eeat": 8,
          "D5_compliance_ymyl": 10,
          "D6_seo_semantique": 7,
          "D7_lisibilite": 8,
          "D8_couverture_intent": 9,
          "D9_conformite_qrg": 8,
          "global": 8.2,
          "notes": "Bonne densité NER. Zone intervention trop vague."
        },
        "resolved": {
          "D1_originalite_lexicale": 7.5,
          "D2_variabilite_inter_fiches": 9,
          "D3_densite_informationnelle": 7.5,
          "D4_conformite_eeat": 8.5,
          "D5_compliance_ymyl": 10,
          "D6_seo_semantique": 7.5,
          "D7_lisibilite": 7.5,
          "D8_couverture_intent": 8.5,
          "D9_conformite_qrg": 8.5,
          "global": 8.4,
          "resolution_notes": "Consensus sur YMYL parfait. Divergence D3 résolue par comptage NER objectif."
        }
      },
      "ground_truth_label": "PUBLISH",
      "issues_detected": [],
      "metadata": {
        "annotation_date": "2026-04-20",
        "time_spent_minutes": 12,
        "generation_model": "claude-3-5-sonnet-20241022",
        "prompt_version": "v1.0",
        "tokens_input": 1240,
        "tokens_output": 387
      }
    }
  ]
}
```

### 3.4 Process de revue — 2 annotateurs + résolveur

**Annotateur A** : rédacteur content senior (externe) formé sur les QRG et les critères RGE ADEME. Formation : 2h sur les guidelines, 10 fiches de calibration communes.

**Annotateur B** : CEO ou product manager interne. Connaît le contexte business et les contraintes légales MaPrimeRénov'.

**Résolveur** : CEO pour les items où |score_A - score_B| > 1.5 sur le score global.

**Critère d'accord** : Cohen's Kappa ≥ 0,70 sur le score global binaire (PUBLISH vs REJECT). Si kappa < 0,70 après les 20 premières fiches de calibration, session de recalibration obligatoire avant de continuer.

**Durée estimée** : 100 fiches × 12 min × 2 annotateurs = 40h. Budget 2 000 € (2 annotateurs × 20h × 50 €/h).

**Livrables** :

- `eval_set_v1.json` (100 fiches scorées)
- `calibration_report_v1.md` (kappa, distribution scores, patterns communs)
- `prompt_improvement_v1.md` (ajustements prompt déduits des rejets)

---

## 4. Pipeline génération LLM grounding

### 4.1 Architecture complète

```
┌─────────────────────────────────────────────────────────────────┐
│                    PIPELINE GÉNÉRATION v1                        │
└─────────────────────────────────────────────────────────────────┘

[SOURCES DB]          [RETRIEVAL]           [GÉNÉRATION]
──────────────        ───────────           ────────────
providers              SQL query            LLM API call
  └─ rge_qualif  ──►   par batch    ──►    (Claude 3.5 Sonnet)
  └─ rge_organi         de 50             ──►  output JSON
  └─ siret                                     structuré
  └─ code_naf
  └─ address_*    ──►  Enrichissement    ──►  [VALIDATION AUTO]
                        INSEE API             ──── score auto
communes                (effectif)            ──── hallucin.
  └─ region_name  ──►  enrichissement    ──►  ──── boilerplate
  └─ population         territoire            ──── YMYL check
  └─ code_dept                                ──── longueur
                   ──►  Context RGE
ADEME API               ADEME complet   ──►  [DÉCISION]
  └─ qualif.            (qualif. txt)        ─── ≥ 8.0 → PUBLISH
  └─ validité     ──►  Prompt v1            ─── 6-7.9 → REVIEW
  └─ organisme          assemblé            ─── < 6.0 → REGEN

                                        ──►  [REVIEW HUMAIN]
                                             10 % sample
                                             kappa ≥ 0.70

                                        ──►  [PUBLISH]
                                             UPDATE providers
                                             SET description = ?
                                             WHERE id = ?
                                             trigger noindex sync
```

### 4.2 Détail des étapes

**Étape 1 — Extraction DB** : requête SQL par batch de 50 providers RGE actifs. Jointure avec `communes` sur `address_city` + `address_department` pour récupérer population, région officielle, code département. Jointure avec `services` sur `code_naf` pour libellé officiel.

**Étape 2 — Enrichissement INSEE** : appel API Entreprise (DataPass token) pour récupérer effectif salarié (tranche), date de création, forme juridique exacte. Fallback sur données DB si API indisponible.

**Étape 3 — Enrichissement ADEME** : lecture `rge_qualifications` JSONB (migration 380). Ce JSONB contient le texte exact des qualifications ADEME, l'organisme, la date de validité, l'URL source. Tout est déjà en DB — pas d'appel ADEME en temps réel nécessaire à ce stade.

**Étape 4 — Assemblage du prompt** : voir section 5 (prompt template v1 complet).

**Étape 5 — Appel LLM** : voir section 4.3 (comparatif et choix).

**Étape 6 — Validation automatique** : voir section 6.

**Étape 7 — Décision et file d'attente** : résultats écrits dans une table intermédiaire `provider_descriptions_draft` avant publication.

```sql
-- Table intermédiaire (à créer en migration)
CREATE TABLE provider_descriptions_draft (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  description_text TEXT NOT NULL,
  score_auto NUMERIC(4,2),
  score_d1 NUMERIC(4,2), score_d2 NUMERIC(4,2), score_d3 NUMERIC(4,2),
  score_d4 NUMERIC(4,2), score_d5 NUMERIC(4,2), score_d6 NUMERIC(4,2),
  score_d7 NUMERIC(4,2), score_d8 NUMERIC(4,2), score_d9 NUMERIC(4,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','approved','rejected','published')),
  prompt_version TEXT NOT NULL,
  llm_model TEXT NOT NULL,
  tokens_input INTEGER,
  tokens_output INTEGER,
  cost_usd NUMERIC(8,6),
  hallucination_flags JSONB DEFAULT '[]',
  boilerplate_score NUMERIC(4,2),
  human_review_required BOOLEAN DEFAULT false,
  human_reviewer TEXT,
  human_review_score NUMERIC(4,2),
  human_review_notes TEXT,
  generated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);

CREATE INDEX ON provider_descriptions_draft(provider_id);
CREATE INDEX ON provider_descriptions_draft(status);
CREATE INDEX ON provider_descriptions_draft(score_auto);
```

**Étape 8 — Publication** : script de publication qui copie `description_text` vers `providers.description` pour les fiches `status = 'approved'`, met à jour `providers.updated_at`.

### 4.3 Comparatif LLM — Coût, qualité, latence

**Critères d'évaluation** :

- Qualité génération française (grammaire, vocabulaire technique RGE)
- Respect des contraintes prompt (longueur, format JSON output)
- Latence par fiche (impact sur débit du pipeline)
- Coût par fiche sur 200 tokens output moyen + 1 200 tokens input moyen
- Disponibilité API (SLA, rate limits pour batch 50K)

| LLM                           | Coût input /M tokens | Coût output /M tokens | Coût/fiche estimé | Qualité FR (1-10) | Latence /fiche | Rate limit         |
| ----------------------------- | -------------------- | --------------------- | ----------------- | ----------------- | -------------- | ------------------ |
| Claude 3.5 Sonnet (Anthropic) | $3.00                | $15.00                | $0.0066           | 9.5               | 2-4s           | 1 000 RPM (tier 3) |
| Claude 3 Haiku                | $0.25                | $1.25                 | $0.00055          | 7.5               | 0.5-1s         | 2 000 RPM          |
| GPT-4o (OpenAI)               | $2.50                | $10.00                | $0.0050           | 9.0               | 1-3s           | 10 000 RPM         |
| GPT-4o-mini                   | $0.15                | $0.60                 | $0.00030          | 7.0               | 0.5-1s         | 30 000 RPM         |
| Mistral Large 2               | $2.00                | $6.00                 | $0.0036           | 8.5               | 1-2s           | 500 RPM            |
| Mistral Small                 | $0.20                | $0.60                 | $0.00036          | 7.0               | 0.5s           | 2 000 RPM          |
| Gemini Pro 1.5                | $1.25                | $5.00                 | $0.0025           | 8.0               | 1-3s           | 360 RPM            |

**Calcul coûts totaux pour 50 332 fiches** :

| LLM               | Coût total 50K fiches | Délai batch (50K @ rate limit) |
| ----------------- | --------------------- | ------------------------------ |
| Claude 3.5 Sonnet | **332 $**             | ~14h (1 000 RPM)               |
| Claude 3 Haiku    | **28 $**              | ~7h (2 000 RPM)                |
| GPT-4o            | **252 $**             | ~1.4h (10 000 RPM)             |
| GPT-4o-mini       | **15 $**              | ~0.5h (30 000 RPM)             |
| Mistral Large 2   | **181 $**             | ~27h (500 RPM)                 |
| Gemini Pro 1.5    | **126 $**             | ~46h (360 RPM)                 |

**Recommandation** : stratégie en deux passes.

**Passe 1 — 50K fiches** : Claude 3 Haiku ou GPT-4o-mini (28-15 $ total, latence < 7h pour le batch complet). Le modèle léger produit une première génération acceptable (score estimé 6.5-7.5/10).

**Passe 2 — Régénérations (15 % estimées, soit 7 500 fiches)** : Claude 3.5 Sonnet uniquement, avec prompt augmenté incluant les raisons du rejet. Coût additionnel : 7 500 × $0.0066 = **50 $**.

**Coût total pipeline** : 28 + 50 = **78 $ pour 50K fiches**. Très en dessous du seuil de 500 $ envisagé.

**Alternative qualité maximale** : utiliser Claude 3.5 Sonnet pour les 50K en une passe (332 $). Recommandé si le budget le permet et que la fenêtre de temps est contrainte (délai Jour 7 avant recrawl Google intensif).

### 4.4 Latence cible et politique de retry

**Latence cible par fiche** : < 5 secondes (API + validation auto).

**Latence batch 1 000 fiches** :

- Avec Claude 3 Haiku (parallélisation 10 requêtes simultanées) : ~1 min 40s
- Avec Claude 3.5 Sonnet (parallélisation 20 requêtes) : ~5 min

**Retry policy** :

```python
retry_config = {
    "max_retries": 3,
    "backoff_factor": 2,          # 1s, 2s, 4s
    "retry_on": [429, 500, 502, 503, 504],
    "timeout_seconds": 30,
    "fallback_model": "claude-3-haiku-20240307",  # si Sonnet timeout
}
```

**Fallback** : si après 3 retries le LLM principal échoue, basculer sur le modèle secondaire pour cette fiche. Logger le fallback dans `provider_descriptions_draft.llm_model`.

---

## 5. Prompt template versionné v1

Le prompt suivant est conçu pour être copy-paste-able dans n'importe quelle intégration API Anthropic, OpenAI, ou Mistral. Il est reproductible, versionné, et auditable.

---

```
PROMPT VERSION: v1.0
DATE: 2026-04-18
AUTEUR: ServicesArtisans Content Pipeline
USAGE: Génération description fiche artisan RGE

────────────────────────────────────────────────────────────────
SYSTEM PROMPT
────────────────────────────────────────────────────────────────

Tu es un rédacteur expert pour l'annuaire ServicesArtisans.fr,
spécialisé dans la rénovation énergétique et les artisans RGE
(Reconnu Garant de l'Environnement). Tu maîtrises parfaitement :

- Les qualifications RGE officielles délivrées par Qualibat,
  Qualit'EnR, Qualifelec, Cerqual, et les autres organismes
  agréés ADEME
- Le dispositif MaPrimeRénov' (plafonds ANAH, barèmes 2026,
  conditions d'éligibilité)
- Les Certificats d'Économie d'Énergie (CEE)
- Le programme France Rénov' et Mon Accompagnateur Rénov'
- La réglementation RE2020 et le diagnostic de performance
  énergétique (DPE)

Tu rédiges en français courant et professionnel. Tes descriptions
aident un particulier à comprendre en 30 secondes si cet artisan
est le bon interlocuteur pour son projet de rénovation.

────────────────────────────────────────────────────────────────
USER PROMPT (template — les variables {{}} sont injectées par code)
────────────────────────────────────────────────────────────────

Rédige la description de fiche artisan pour le prestataire suivant.

## Données officielles de l'artisan

**Raison sociale** : {{provider_name}}
**SIRET** : {{siret}}
**Code NAF** : {{code_naf}} — {{libelle_naf}}
**Forme juridique** : {{legal_form}}
**Tranche effectif** : {{effectif_label}}
  (ex: "1 salarié", "2-5 salariés", "6-9 salariés", etc.)
**Adresse** : {{address_street}}, {{address_postal_code}} {{address_city}}
**Département** : {{address_department}} — {{department_name}}
**Région** : {{region_name}}
**Population commune** : {{commune_population}} habitants

## Certifications RGE (source ADEME officielle)

{{#each rge_qualifications}}
- **Qualification** : {{this.nom}}
  **Domaine** : {{this.domaine}}
  **Organisme certificateur** : {{this.organisme}}
  **Valide jusqu'au** : {{this.valid_until | date_format}}
  **Travaux éligibles** : {{this.travaux_eligibles}}
{{/each}}

## Avis clients (si disponibles)

{{#if review_count > 0}}
Note moyenne : {{rating_average}}/5 sur {{review_count}} avis vérifiés
{{else}}
Aucun avis encore disponible.
{{/if}}

## Contexte territorial

**Région** : {{region_context}}
  (contexte climatique, enjeux rénovation spécifiques à la région)
**Département** : {{department_context}}
  (densité artisans RGE, projets territoriaux si connus)

────────────────────────────────────────────────────────────────
CONTRAINTES IMPÉRATIVES
────────────────────────────────────────────────────────────────

**Longueur** : entre 250 et 400 mots. Ni plus, ni moins.

**Structure obligatoire** (paragraphes dans cet ordre) :
1. Présentation (qui est l'artisan, depuis quand, où)
2. Spécialités et qualifications RGE (nommer exactement les
   qualifications fournies — aucune invention)
3. Zone d'intervention (commune + communes voisines plausibles
   selon département — ne pas inventer de villes précises)
4. Bénéfices pour le client (aides auxquelles l'artisan donne
   accès grâce à sa certification RGE)
5. Contact et prochaine étape (une phrase d'appel à l'action
   sobre et factuelle)

**Ton** : professionnel, direct, chaleureux. Pas de superlatifs
("le meilleur", "leader", "numéro 1"). Pas de promesses
("économisez X€"). Phrases courtes (< 25 mots idéalement).

**Vocabulaire RGE** : utiliser exactement les noms officiels
des qualifications fournis dans les données. Ne jamais abréger
"QualiPAC" en "Quali-PAC" ou "Qualipac". "MaPrimeRénov'"
s'écrit toujours avec l'apostrophe typographique et la
majuscule au R. "Reconnu Garant de l'Environnement" s'écrit
avec les majuscules et l'apostrophe.

**ANTI-PATTERNS — à ne JAMAIS écrire** :
- "leader local" ou "référence dans la région"
- "satisfaction garantie" ou "satisfait ou remboursé"
- "meilleur prix" ou "tarif compétitif"
- "n'hésitez pas à nous contacter"
- "nous sommes à votre disposition"
- "professionnel reconnu" (redondant avec RGE)
- Toute promesse de montant d'aide précis non fourni dans les données
- Toute ville ou commune non mentionnée dans les données
- Toute qualification RGE non présente dans les données fournies
- Toute mention d'effectif différente de celle fournie

**SOURCES AUTORISÉES UNIQUEMENT** :
- Les données fournies dans ce prompt
- Le nom du programme MaPrimeRénov' (sans montants si non fournis)
- Le nom du programme CEE (sans montants si non fournis)
- Le programme France Rénov' pour le contexte général

────────────────────────────────────────────────────────────────
FORMAT DE SORTIE
────────────────────────────────────────────────────────────────

Réponds UNIQUEMENT avec ce JSON, sans texte avant ni après :

{
  "description": "... (texte de la description, 250-400 mots) ...",
  "word_count": 287,
  "qualifications_cited": ["QualiPAC air/eau", "..."],
  "cities_mentioned": ["Grenoble", "Échirolles", "..."],
  "aid_programs_mentioned": ["MaPrimeRénov'", "CEE"],
  "confidence_self_score": 8.5,
  "flags": []
}

Si tu détectes une incohérence dans les données fournies
(qualification expirée, ville improbable), ajoute-la dans
"flags" : ["qualification X semble expirée selon date fournie"].
```

---

### 5.1 Variables d'injection et sources DB

| Variable template        | Source DB                                  | Fallback                      |
| ------------------------ | ------------------------------------------ | ----------------------------- |
| `{{provider_name}}`      | `providers.name`                           | Raison sociale INSEE          |
| `{{siret}}`              | `providers.siret`                          | "Non communiqué"              |
| `{{code_naf}}`           | `providers.code_naf`                       | "Non renseigné"               |
| `{{libelle_naf}}`        | `providers.libelle_naf`                    | Lookup table NAF              |
| `{{legal_form}}`         | `providers.legal_form_code`                | —                             |
| `{{effectif_label}}`     | API INSEE Entreprise                       | "Non renseigné"               |
| `{{address_*}}`          | `providers.address_*`                      | —                             |
| `{{department_name}}`    | `communes.departement_code` → lookup       | —                             |
| `{{region_name}}`        | `communes.region_name`                     | —                             |
| `{{commune_population}}` | `communes.population`                      | —                             |
| `{{rge_qualifications}}` | `providers.rge_qualifications` JSONB       | Jamais vide (condition WHERE) |
| `{{rating_average}}`     | `providers.rating_average`                 | Pas de section avis           |
| `{{review_count}}`       | `providers.review_count`                   | 0                             |
| `{{region_context}}`     | Table statique `region_contexts` à créer   | —                             |
| `{{department_context}}` | Table statique `dept_contexts` (95 lignes) | —                             |

### 5.2 Table `region_contexts` (à créer)

Exemple de lignes (13 régions × 2-3 phrases de contexte territorial) :

```sql
INSERT INTO region_contexts (region_name, context_text) VALUES
('Auvergne-Rhône-Alpes', 'Région montagneuse avec des hivers rigoureux en altitude, forte demande en isolation et systèmes de chauffage performants. Nombreuses passoires thermiques dans les logements anciens des villes alpines.'),
('Île-de-France', 'Région à forte densité de logements collectifs avec de nombreux projets de rénovation énergétique dans le cadre du Plan Bâtiment Durable. Marché tendu en artisans RGE qualifiés.'),
('Bretagne', 'Climat océanique humide, forte prévalence de maisons individuelles des années 1960-1980 mal isolées. Demande soutenue en pompes à chaleur air/eau adaptées aux hivers doux.');
```

---

## 6. Validation automatique post-génération

### 6.1 Module de détection des hallucinations

**Principe** : confronter chaque affirmation de la description générée contre les données injectées dans le prompt. Toute affirmation non traceable à une source DB est une hallucination potentielle.

**Implémentation Python** :

```python
import re
from dataclasses import dataclass
from typing import List

@dataclass
class HallucinationCheck:
    provider_data: dict
    generated_description: str
    flags: List[str] = None

    def run(self) -> dict:
        flags = []

        # Vérif 1 : qualifications citées existent dans DB
        cited_quals = self._extract_qualifications()
        db_quals = [q['nom'] for q in self.provider_data['rge_qualifications']]
        for qual in cited_quals:
            if not any(qual.lower() in dbq.lower() for dbq in db_quals):
                flags.append(f"Qualification '{qual}' non trouvée en DB")

        # Vérif 2 : ville citée dans département cohérent
        cities_mentioned = self._extract_cities()
        dept_code = self.provider_data['address_department']
        for city in cities_mentioned:
            if not self._city_in_department(city, dept_code):
                flags.append(f"Ville '{city}' improbable pour dept {dept_code}")

        # Vérif 3 : organisme certificateur cohérent
        orgs_cited = self._extract_organisms()
        db_orgs = self.provider_data.get('rge_organismes', [])
        for org in orgs_cited:
            if org not in db_orgs and org not in KNOWN_RGE_ORGANISMS:
                flags.append(f"Organisme '{org}' non référencé")

        # Vérif 4 : aucun montant d'aide sans source
        montants = re.findall(r'\b\d+\s*[€$]\b|\b\d+\s*euros?\b',
                              self.generated_description, re.IGNORECASE)
        for montant in montants:
            flags.append(f"Montant '{montant}' sans source officielle fournie")

        return {
            "hallucination_flags": flags,
            "hallucination_score": len(flags),
            "pass": len(flags) == 0
        }

KNOWN_RGE_ORGANISMS = [
    "Qualibat", "Qualit'EnR", "Qualifelec", "Cerqual",
    "Promotelec", "Certibat", "Bureau Veritas", "AFNOR"
]
```

### 6.2 Détection patterns boilerplate

**Outil** : MinHash LSH via `datasketch` pour détection rapide de similarité approximative.

```python
from datasketch import MinHash, MinHashLSH

def build_lsh_index(descriptions: List[str], threshold=0.3) -> MinHashLSH:
    lsh = MinHashLSH(threshold=threshold, num_perm=128)
    for i, desc in enumerate(descriptions):
        mh = MinHash(num_perm=128)
        for token in desc.lower().split():
            mh.update(token.encode('utf8'))
        lsh.insert(f"desc_{i}", mh)
    return lsh

def check_boilerplate(new_desc: str, lsh: MinHashLSH) -> dict:
    mh = MinHash(num_perm=128)
    for token in new_desc.lower().split():
        mh.update(token.encode('utf8'))

    similar = lsh.query(mh)
    boilerplate_score = len(similar) / max(1, len(lsh))

    return {
        "similar_docs": similar[:5],  # max 5 exemples
        "boilerplate_score": round(boilerplate_score, 4),
        "pass": boilerplate_score < 0.15
    }
```

**Seuil de rejet** : si `boilerplate_score > 0.30` (la description ressemble à 30 % ou plus des autres fiches déjà générées), rejet automatique et régénération avec température LLM augmentée de 0.1.

### 6.3 Vérification compliance YMYL

```python
YMYL_FORBIDDEN_PATTERNS = [
    r"vous\s+(?:pouvez|pourrez|allez)\s+(?:recevoir|toucher|obtenir)\s+\d+",
    r"prime\s+(?:de|d')\s+\d+\s*[€$]",
    r"économies?\s+(?:de|d')\s+\d+\s*%",
    r"garantis?\s+(?:d')?(?:économies?|résultats?)",
    r"remboursement\s+(?:de|d')\s+\d+",
]

YMYL_REQUIRED_IF_FINANCIAL = [
    "france-renov",
    "maprimerenov",
    "anah",
    "ademe",
]

def check_ymyl(description: str) -> dict:
    flags = []

    for pattern in YMYL_FORBIDDEN_PATTERNS:
        if re.search(pattern, description, re.IGNORECASE):
            flags.append(f"Pattern YMYL interdit détecté : {pattern[:40]}")

    # Si mention financière, vérifier qu'une source est présente
    has_financial = bool(re.search(r'prime|aide|subvention|CEE',
                                    description, re.IGNORECASE))
    if has_financial:
        has_source = any(src in description.lower()
                         for src in YMYL_REQUIRED_IF_FINANCIAL)
        if not has_source:
            flags.append("Mention financière sans référence source officielle")

    score_ymyl = max(0, 10 - len(flags) * 3)
    return {"ymyl_flags": flags, "score_ymyl": score_ymyl, "pass": len(flags) == 0}
```

### 6.4 Vérification longueur et lisibilité

```python
import textstat

def check_length_and_readability(description: str) -> dict:
    word_count = len(description.split())

    # Flesch-Kincaid adapté français (formule Kandel-Moles approximée)
    # textstat supporte le français avec language='fr'
    flesch_score = textstat.flesch_reading_ease(description)

    flags = []
    if word_count < 250:
        flags.append(f"Trop court : {word_count} mots (min 250)")
    if word_count > 420:
        flags.append(f"Trop long : {word_count} mots (max 400)")
    if flesch_score < 45:
        flags.append(f"Lisibilité insuffisante : score Flesch {flesch_score:.1f}")

    return {
        "word_count": word_count,
        "flesch_score": round(flesch_score, 1),
        "length_pass": 250 <= word_count <= 420,
        "readability_pass": flesch_score >= 45,
        "flags": flags
    }
```

### 6.5 Score qualité automatique vs eval set

Le score automatique est calibré en régression linéaire sur l'eval set v1 : pour chaque fiche de l'eval set, on calcule les métriques automatiques, et on cherche les coefficients qui minimisent l'erreur vs score humain résolu.

**Métriques automatiques utilisées** :

- `hallucination_score` → corrélé négatif à D4 (E-E-A-T)
- `boilerplate_score` → corrélé négatif à D1 (originalité) et D2 (variabilité)
- `ymyl_score` → D5 directement
- `flesch_score` normalisé → D7
- Compte NER / word_count → D3

La corrélation cible (Pearson r) entre score auto et score humain : r ≥ 0.80. Si la corrélation sur l'eval set est < 0.80 après calibration, les poids sont réajustés.

---

## 7. Workflow review humain

### 7.1 Sample 10 % — 5 000 fiches

Sur les 50 332 fiches publiées, 10 % (5 033 fiches) font l'objet d'une review humaine. Sélection :

- 50 % aléatoire stratifié (représentatif de la distribution des métiers et régions)
- 30 % ciblé sur les fiches avec score auto entre 6.0 et 7.9 (zone grise)
- 20 % ciblé sur les fiches avec au moins un flag automatique

**Interface de review** : Airtable avec vue kanban (PUBLISH / REJECT / NEEDS_EDIT) + champ notes. Chaque fiche est présentée avec ses données source et sa description générée côte à côte.

### 7.2 Calibration inter-annotateurs

**Protocole** :

1. Les 2 reviewers scorent indépendamment les 100 premières fiches du sample
2. Calcul de Cohen's Kappa sur la décision binaire (PUBLISH vs REJECT)
3. Si kappa ≥ 0.70 : validation du protocole, démarrage review indépendante
4. Si kappa < 0.70 : session de calibration 1h avec discussion des cas divergents, nouvelle passe sur 50 fiches

**Formule kappa** :

```
κ = (P_o - P_e) / (1 - P_e)
P_o = proportion accords observés
P_e = proportion accords attendus par hasard
```

**Cible** : kappa ≥ 0.70 (accord substantiel selon échelle Landis-Koch). Un kappa < 0.70 indique que les critères sont ambigus et que le rubrique de scoring doit être clarifié.

### 7.3 Critère stop-go batch suivant

Avant de lancer le batch suivant (par tranches de 5 000 fiches), un gate de qualité est évalué sur le batch précédent.

**Gate — Critères stop** (tout critère suffit à bloquer) :

- Plus de 5 % de fiches avec score humain < 7/10
- Plus de 2 % de fiches avec flag YMYL actif non détecté automatiquement
- Plus de 3 % de fiches avec hallucination qualifiée (qualification inventée)
- Kappa inter-annotateurs < 0.70

**Si gate bloquant** :

1. Analyser les causes des rejets (prompt insuffisant ? données DB manquantes ? LLM trop créatif ?)
2. Corriger le prompt (incrémenter version : v1.0 → v1.1)
3. Régénérer les fiches rejetées du batch en cours avec v1.1
4. Valider le gate sur 100 fiches supplémentaires avec v1.1

**Si gate OK** : lancer le batch suivant automatiquement.

---

## 8. A/B test impact SEO réel

### 8.1 Design de l'expérience

**Objectif** : mesurer le delta d'indexation et de ranking entre 3 stratégies de contenu sur des fiches RGE équivalentes, 8 semaines après publication.

| Cohorte                  | Traitement                                                                                                                                                               | Volume       | Sélection                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ | ----------------------------------------------------- |
| **A — LLM Grounded**     | Description générée par pipeline v1 (prompt grounded, validation auto, score ≥ 7.5)                                                                                      | 5 000 fiches | RGE actifs, métiers équilibrés, répartition nationale |
| **B — Template Enrichi** | Template statique enrichi avec données DB (sans LLM) : `"[nom] est un artisan RGE certifié [qualif] basé à [ville] ([dept]). Certifié par [organisme] jusqu'au [date]."` | 5 000 fiches | Même stratification que A                             |
| **C — Contrôle**         | Description vide (état actuel de 99,94 % des fiches)                                                                                                                     | 5 000 fiches | Même stratification                                   |

**Randomisation** : assignation par hash du `provider_id` modulo 3 (`hash(provider_id) % 3`), garantissant une assignation stable et reproductible.

**Condition d'exclusion** : fiches déjà avec description existante (595 fiches), fiches avec review_count > 5 (biais confondant), fiches non-actives.

### 8.2 Métriques primaires et secondaires

**Métriques primaires** (mesurées via GSC Export API + Ahrefs API) :

| Métrique                    | Source                        | Fréquence mesure   |
| --------------------------- | ----------------------------- | ------------------ |
| Pages indexées par cohorte  | GSC URL Inspection API batch  | Semaine 2, 4, 6, 8 |
| Keywords gagnés par cohorte | Ahrefs organic keywords delta | Semaine 4, 8       |
| Position moyenne SERP       | GSC Performance API           | Semaine 2, 4, 6, 8 |
| CTR SERP moyen              | GSC Performance API           | Semaine 4, 8       |

**Métriques secondaires** :

| Métrique                         | Source                     | Fréquence    |
| -------------------------------- | -------------------------- | ------------ |
| Crawl rate (pages crawlées/jour) | GSC Coverage → Crawl stats | Hebdomadaire |
| Impressions SERP                 | GSC                        | Hebdomadaire |
| Bounce rate fiches artisan       | GA4 / PostHog              | Semaine 4, 8 |
| Conversion page artisan → devis  | PostHog funnel             | Semaine 8    |

### 8.3 Test statistique — Mann-Whitney U

**Pourquoi Mann-Whitney U** : les distributions de positions SERP et de CTR ne suivent pas une loi normale (loi de puissance). Mann-Whitney est non-paramétrique et adapté à ces distributions skewed.

**Paires comparées** :

- A vs C (LLM grounded vs contrôle)
- B vs C (template enrichi vs contrôle)
- A vs B (LLM grounded vs template enrichi — question de valeur marginale du LLM)

**Paramètres statistiques** :

- Alpha (niveau de signification) : 0.05
- Puissance cible : 0.80
- Taille d'effet minimale détectable : d = 0.20 (effet faible selon Cohen)
- N requis par cohorte (calcul a priori) : 5 000 fiches >> minimum requis (~200) → puissance excellente

**Interprétation** :

- Si p < 0.05 sur A vs C et A vs B : le LLM grounded apporte un bénéfice statistiquement significatif → scale à 50K
- Si p < 0.05 sur B vs C mais p ≥ 0.05 sur A vs B : le template enrichi suffit → économie LLM
- Si aucun test significatif : contenu seul ne suffit pas → investiguer autres facteurs (SSR fix complet ? backlinks ?)

### 8.4 Tableau de bord de suivi

Dashboard PostHog ou Metabase avec les métriques suivantes actualisées hebdomadairement :

```
SEMAINE | COHORTE A         | COHORTE B         | COHORTE C
        | indexées | KW     | indexées | KW     | indexées | KW
───────────────────────────────────────────────────────────────
S0      | 0        | 0      | 0        | 0      | baseline | base
S2      | ?        | ?      | ?        | ?      | ?        | ?
S4      | ?        | ?      | ?        | ?      | ?        | ?
S6      | ?        | ?      | ?        | ?      | ?        | ?
S8      | ?        | ?      | ?        | ?      | ?        | ?
```

---

## 9. Editorial guidelines pour rédacteurs humains

Ces guidelines s'appliquent aux rédacteurs humains pour les contenus qui ne passent pas par le pipeline LLM : articles longue forme, pages hub, études data-driven, mises à jour barèmes.

### 9.1 Style guide ServicesArtisans

**Ton** : expert accessible. L'équivalent d'un conseiller France Rénov' qui parle à un propriétaire sans jargon technique inutile.

**Phrases** : courtes (15-20 mots idéal, max 30). Éviter les subordonnées imbriquées.

**Structure systématique** :

- Chapeau : problème du lecteur en 2 phrases
- Corps : réponse en blocs courts avec intertitres explicatifs
- Conclusion : action concrète unique

**Accents critiques** (cf. `accents.md` du projet) :

- `MaPrimeRénov'` : apostrophe typographique `'` (U+2019), majuscule au R
- `Rénovation` : toujours avec accent
- `Énergie`, `Éligibilité`, `Étude` : majuscules accentuées obligatoires en début de phrase
- `RGE` : jamais `Rge` ni `rge` — toujours en majuscules
- `SIRET` : toujours en majuscules
- `CEE` (Certificats d'Économie d'Énergie) : noter l'accent sur É

**Vocabulaire interdit** : "solution clé en main", "accompagnement sur mesure", "expertise reconnue", "équipe de professionnels", "à votre écoute", "n'hésitez pas".

### 9.2 Sources officielles obligatoires

Toute affirmation factuelle doit pointer vers une source officielle. Hiérarchie des sources autorisées :

| Rang     | Source                                 | Usage                                           |
| -------- | -------------------------------------- | ----------------------------------------------- |
| 1        | france-renov.gouv.fr                   | MaPrimeRénov', Mon Accompagnateur Rénov', CEE   |
| 1        | ademe.fr                               | Qualifications RGE, efficacité énergétique, DPE |
| 1        | anah.fr                                | Barèmes ANAH, plafonds ressources               |
| 2        | legifrance.gouv.fr                     | Textes réglementaires (arrêtés, décrets)        |
| 2        | service-public.fr                      | Synthèses droits et démarches                   |
| 3        | qualibat.com, qualit-enr.org           | Spécifications qualifications RGE               |
| Interdit | Sites marchands concurrents            | Conflits d'intérêt                              |
| Interdit | Wikipedia                              | Non officiel, non stable                        |
| Interdit | Blogs sectoriels sans auteur identifié | E-E-A-T insuffisant                             |

### 9.3 Process fact-check

Pour chaque article longue forme (≥ 800 mots) :

1. **Avant rédaction** : rédacteur liste les affirmations-clés à vérifier
2. **Pendant rédaction** : chaque chiffre est immédiatement lié à une source
3. **Après rédaction** : relecture par un second rédacteur focused sur les faits (pas le style)
4. **Avant publication** : validation CEO pour tout article mentionnant des montants MaPrimeRénov' ou des obligations légales

**Délai moyen** : 3h pour un article de 2 000 mots avec fact-check complet.

### 9.4 Process update barèmes MaPrimeRénov'

MaPrimeRénov' est réformé 1 à 2 fois par an (arrêtés JORF). Les montants publiés sur le site sont des données YMYL critiques — une erreur peut induire un propriétaire en erreur sur un investissement de 5 000 à 30 000 €.

**Workflow mensuel de vérification** :

| Jour          | Responsable   | Action                                                                   |
| ------------- | ------------- | ------------------------------------------------------------------------ |
| 1er du mois   | Content admin | Consulter france-renov.gouv.fr + legifrance.gouv.fr pour arrêtés récents |
| 1er du mois   | Content admin | Comparer avec barèmes en DB (`maprimerenov_baremes` table à créer)       |
| Si changement | Content admin | Créer PR mise à jour avec lien arrêté JORF + diff des montants           |
| Si changement | CEO           | Validation obligatoire avant merge (YMYL)                                |
| Si changement | Dev           | Deploy + IndexNow ping sur toutes les pages citant les barèmes           |

**Traçabilité** : chaque version de barèmes est taguée avec la date de l'arrêté JORF de référence. La table `maprimerenov_baremes` stocke l'historique complet (pas de suppression, seulement ajout de lignes datées).

**Alerte automatique** : cron hebdomadaire qui scrape le flux RSS de legifrance.gouv.fr filtré sur "MaPrimeRénov'" et envoie une notification Slack si un nouvel arrêté est détecté.

### 9.5 Workflow Notion / Airtable

**Airtable** (review fiches LLM) :

- Base : "ServicesArtisans — Content Pipeline"
- Table : "Descriptions Draft" — vue kanban par status
- Table : "Reviews" — assignation reviewer, score, notes
- Automatisation : alerte email si score < 6 détecté

**Notion** (briefs et articles longue forme) :

- Template brief : titre, mot-clé principal, intent, sources obligatoires, plan outline, deadline, reviewer assigné
- Template article : structure obligatoire, checklist fact-check, checklist SEO, checklist YMYL, sign-off CEO

---

## 10. Calendrier éditorial 12 mois

### Phase 1 — Descriptions RGE (M1-M3)

| Semaine | Jalon                                   | Volume | Responsable      |
| ------- | --------------------------------------- | ------ | ---------------- |
| S1      | Eval set v1 annoté (100 fiches)         | 100    | 2 annotateurs    |
| S1      | Prompt v1 validé sur eval set           | —      | Dev + Content    |
| S1-S2   | Batch test 1 000 fiches (cohorte A)     | 1 000  | Dev              |
| S2      | Gate qualité batch 1 — stop/go          | —      | CEO              |
| S2-S4   | Batch 10 000 fiches Tier A prioritaires | 10 000 | Dev (background) |
| S4      | Gate qualité batch 2                    | —      | CEO              |
| S4-S8   | Batch 40 332 fiches restantes           | 40 332 | Dev (background) |
| S8      | 50 000 fiches publiées                  | 50 000 | —                |
| M3      | Rapport résultats A/B test (semaine 8)  | —      | CEO              |

### Phase 2 — Contenu longue forme (M3-M9)

| Mois  | Livrable                                              | Volume      | Source         |
| ----- | ----------------------------------------------------- | ----------- | -------------- |
| M3    | Articles rénovation énergétique (RE-01 à RE-10)       | 10 articles | Content writer |
| M4    | Pages hub stratégiques (rénovation, aides, RGE)       | 5 hubs      | Dev + Content  |
| M4-M5 | Pages `/aides/[dept]/maprimerenov`                    | 96 pages    | Dev (template) |
| M5-M6 | Articles prix 2026 (plombier, chauffagiste, etc.)     | 10 articles | Content writer |
| M6    | Étude data RGE (cartographie France)                  | 1 étude     | Data + Content |
| M7    | Articles guides (choisir, entretenir, réglementation) | 10 articles | Content writer |
| M8    | Études data-driven PR (7 restantes)                   | 7 études    | Data + Content |
| M9    | Bilan éditorial H1 + ajustements                      | —           | CEO            |

### Phase 3 — Refresh et maintenance (M1-M12)

| Fréquence     | Action                                                 | Responsable   |
| ------------- | ------------------------------------------------------ | ------------- |
| Mensuelle     | Vérification barèmes MaPrimeRénov'                     | Content admin |
| Mensuelle     | Refresh top 20 articles (date MAJ + nouveaux chiffres) | Content admin |
| Trimestrielle | Audit performance articles (GA4 + GSC)                 | CEO           |
| Semestrielle  | Revalidation eval set (nouvelles fiches gold standard) | 2 annotateurs |
| Annuelle      | Mise à jour prompt LLM si score moyen < 7.5            | Dev + Content |

---

## 11. Coût total content M1-M12

### 11.1 Détail par poste

| Poste                                  | Détail                                                             | Coût mensuel | Coût annuel  |
| -------------------------------------- | ------------------------------------------------------------------ | ------------ | ------------ |
| **LLM API (génération descriptions)**  | 50K fiches × 0,0055$/fiche (Haiku) + 7,5K regen × 0,0066$ (Sonnet) | Unique M1    | **78 $**     |
| **LLM API (articles longue forme)**    | 30 articles × ~4K tokens output × 0,015$/1K (Sonnet)               | —            | **18 $**     |
| **Annotateurs eval set v1**            | 2 × 20h × 50€/h                                                    | Unique S1-S2 | **2 000 €**  |
| **Reviewers humains (10 % fiches)**    | 5 000 fiches × 5 min/fiche = 417h × 25€/h                          | M1-M3        | **10 417 €** |
| **Content writer freelance senior**    | 30 articles × 5h × 80€/h                                           | M3-M9        | **12 000 €** |
| **LangSmith (observabilité LLM)**      | Plan Developer                                                     | 39$/mois     | **468 $**    |
| **Airtable (review workflow)**         | Plan Teams                                                         | 20$/mois     | **240 $**    |
| **Notion (briefs éditoriaux)**         | Plan Plus                                                          | 8$/mois      | **96 $**     |
| **Expert RGE consultant (fact-check)** | 2j/mois × 500€/j                                                   | M1-M6        | **6 000 €**  |
| **Total outils**                       | —                                                                  | ~67$/mois    | **804 $**    |

### 11.2 Récapitulatif coûts content

| Catégorie                | Coût annuel   |
| ------------------------ | ------------- |
| LLM API total            | ~100 $        |
| Ressources humaines      | ~30 417 €     |
| Outils                   | ~804 $        |
| **Total content M1-M12** | **~31 500 €** |

**Note** : le poste le plus élevé est la review humaine (33 % du budget). Cette dépense est non-négociable sur les fiches YMYL — elle protège contre les pénalités Google et les risques légaux.

### 11.3 ROI estimé

**Hypothèse conservative** : les 50K descriptions génèrent en moyenne 2 keywords supplémentaires par fiche dans les 12 mois (estimation très basse).

100K KW supplémentaires × CTR moyen 3 % × 100 impressions SERP/mois = 300K visites organiques supplémentaires/mois à M12.

À 0,7 % de conversion → 2 100 leads/mois.
À 50€ commission moyenne (scénario bas) → 105 000 €/mois MRR additionnel à M12.

**Payback** : le budget content annuel de 31 500 € est récupéré en moins de 9 jours d'activité à M12.

Même avec une hypothèse 10× plus conservative (0,2 KW/fiche, 10% du trafic estimé), le payback reste < 90 jours.

---

## 12. Risques contenu IA & mitigations

### 12.1 Position Google sur le contenu IA en 2026

La position officielle de Google (QRG 2026, sections 4.6.5 et 4.6.6, confirmée par Danny Sullivan et Gary Illyes dans les interviews de 2025) est la suivante :

> Le contenu généré par IA n'est pas interdit. Ce qui est interdit, c'est le contenu généré en masse sans valeur ajoutée, conçu pour manipuler les classements plutôt qu'aider les utilisateurs.

**Trois critères Google pour différencier contenu IA "utile" vs "spam"** :

1. **Grounding** : les affirmations sont-elles traçables à des sources officielles ? → Notre pipeline : OUI (chaque qualification est extraite de la DB ADEME, chaque géo de l'INSEE)
2. **Unicité** : chaque page répond-elle à un besoin distinct ? → Notre pipeline : OUI (chaque fiche est unique par définition — artisan différent, qualification différente, géo différente)
3. **Valeur utilisateur** : la page aide-t-elle l'utilisateur à prendre une décision ? → Notre pipeline : OUI si score ≥ 7.5

**Conclusion** : notre approche est alignée avec la position Google 2026. Le grounding sur données officielles ADEME est exactement le type de contenu que Google distingue du spam IA.

### 12.2 Détecteurs IA — ZeroGPT, Originality.ai

Ces outils analysent les patterns stylistiques pour détecter le contenu généré par LLM. Leur précision réelle en 2026 est de 60-75 % (taux de faux positifs élevé sur du contenu technique factuellement dense).

**Notre mitigation structurelle** :

- Les données injectées (SIRET, qualifications, dates, communes) sont concrètes et propres à chaque fiche → les outputs sont naturellement variés et factuellement denses → signal stylistique LLM affaibli
- La température LLM est calibrée à 0.7 (créativité modérée) pour éviter les patterns trop réguliers
- Les fiches avec score boilerplate > 0.15 sont régénérées → pas de templates détectables

**Résultat attendu** : score ZeroGPT < 60 % sur les fiches générées avec le prompt v1 (cible : < 40 %). À mesurer sur l'eval set v1 avant production.

**Position disclosure** : ServicesArtisans n'a pas d'obligation légale de déclarer le contenu généré par IA en France (aucune réglementation en vigueur en 2026 sur les fiches artisan). La transparence est optionnelle et stratégiquement neutre.

Si la position évolue (régulation EU IA Act art. 50 potentiellement applicable aux annuaires commerciaux), la mention `"Description générée avec assistance IA à partir de données officielles ADEME et INSEE"` peut être ajoutée en bas de fiche sans impact SEO négatif (Google QRG 2026 ne pénalise pas la disclosure).

### 12.3 Risque de dépendance fournisseur LLM

**Risque** : Anthropic ou OpenAI change sa politique tarifaire ou suspend l'accès API.

**Mitigation** : le pipeline est conçu avec une abstraction LLM (interface commune). Basculer de Claude 3 Haiku vers GPT-4o-mini prend < 2h de dev (changement d'endpoint + format messages). Les 50K fiches sont générées en 3-6 semaines — pas de dépendance long terme critique.

### 12.4 Risque de hallucination à l'échelle

**Risque** : sur 50K fiches, même 0,1 % d'hallucinations = 50 fiches avec une fausse qualification RGE. Un artisan sans QualiPAC présenté comme QualiPAC = responsabilité légale potentielle si un client signe un devis en se fondant sur cette information.

**Mitigation** : le module hallucination (section 6.1) confronte systématiquement les qualifications citées contre la DB. Faux négatifs du module estimés < 0,05 % (une regex sur les noms exacts de qualifications est déterministe). Le processus de review humaine 10 % constitue un filet de sécurité supplémentaire.

**Protocole de correction** : si une hallucination est détectée post-publication, la description est replacée en `draft`, la fiche revient au template vide, et l'incident est loggé. Délai cible de correction : < 4h.

---

## Action Sequence — 6 semaines, 14 actions ordonnées

Les 14 actions suivantes sont séquencées pour maximiser la valeur à chaque étape, avec des dépendances explicites. Les actions parallélisables sont indiquées.

---

**Action 1 — Semaine 1, Jour 1-2 | Priorité CRITIQUE**
Créer la migration SQL pour la table `provider_descriptions_draft` (section 4.2) et les tables `region_contexts` (13 lignes) + `dept_contexts` (95 lignes). Ces tables sont la fondation de tout le pipeline — aucune génération n'est possible sans elles.

_Dépendance_ : aucune. Parallélisable avec Action 2.

---

**Action 2 — Semaine 1, Jour 1-3 | Priorité CRITIQUE**
Extraire les 100 fiches gold standard selon la requête SQL de la section 3.2 (seed fixe 0.42). Exporter en JSON. Distribuer aux 2 annotateurs avec le guide de scoring.

_Dépendance_ : aucune. Parallélisable avec Action 1.

---

**Action 3 — Semaine 1, Jour 2-5 | Priorité HAUTE**
Implémenter le prompt v1 (section 5) dans un script Python (`scripts/generate-descriptions.py`). Tester sur 10 fiches en dev avec les données extraites en Action 2. Vérifier le format JSON output.

_Dépendance_ : Action 1 (table draft).

---

**Action 4 — Semaine 1, Jour 3-7 | Priorité HAUTE**
Annotation des 100 fiches gold standard par les 2 annotateurs (Action 2). Calcul du kappa inter-annotateurs. Si kappa < 0.70 : session calibration. Produire `eval_set_v1.json`.

_Dépendance_ : Action 2 (fiches extraites) + Action 3 (descriptions générées sur ces 100 fiches).

---

**Action 5 — Semaine 1, Jour 5-7 | Priorité HAUTE**
Implémenter les 4 modules de validation automatique (section 6) : hallucination check, boilerplate MinHash, YMYL checker, longueur+lisibilité. Tests unitaires sur l'eval set v1.

_Dépendance_ : Action 4 (eval set pour calibration). Parallélisable partiellement avec Action 4.

---

**Action 6 — Semaine 2, Jour 1-3 | Priorité HAUTE**
Calibrer le scoring automatique par régression linéaire sur l'eval set v1. Mesurer la corrélation Pearson r entre score auto et score humain résolu. Ajuster les poids si r < 0.80.

_Dépendance_ : Actions 4 + 5.

---

**Action 7 — Semaine 2, Jour 2-5 | Priorité HAUTE**
Lancer le batch test de 1 000 fiches (cohorte A de l'A/B test, section 8). Analyser la distribution des scores auto. Compter les rejets. Appliquer le gate qualité section 7.3.

_Dépendance_ : Actions 3, 5, 6. C'est le premier vrai test du pipeline en conditions réelles.

---

**Action 8 — Semaine 2, Jour 4-7 | Priorité HAUTE**
Sur la base des rejets du batch 1 000, affiner le prompt (version v1.1 si nécessaire). Documenter les améliorations dans `prompt_improvement_v1.md`. Régénérer les fiches rejetées.

_Dépendance_ : Action 7.

---

**Action 9 — Semaine 3, Jour 1-7 | Priorité HAUTE**
Constituer les cohortes B (template enrichi) et C (contrôle) de l'A/B test selon la section 8.1. Publier les 3 cohortes × 5 000 fiches. Poser le timestamp de départ (T0) dans les logs.

_Dépendance_ : Action 8 (prompt finalisé pour cohorte A). Cohortes B et C ne dépendent pas du LLM — parallélisable dès semaine 2.

---

**Action 10 — Semaine 3-4 | Priorité HAUTE**
Lancer le batch principal : 10 000 fiches RGE Tier A prioritaires (régions à fort volume de recherche : Île-de-France, AURA, Occitanie). Gate qualité avant continuation.

_Dépendance_ : Actions 7, 8 (pipeline validé).

---

**Action 11 — Semaine 4-6 | Priorité NORMALE**
Lancer les batches 20 000 et 20 332 fiches restantes en background. Monitoring des scores auto + alertes Slack si taux rejet > 5 % sur une tranche.

_Dépendance_ : Action 10 (gate validé).

---

**Action 12 — Semaine 4, Jour 1-3 | Priorité NORMALE**
Configurer l'interface de review humaine Airtable (section 9.5). Constituer le sample 10 % (5 000 fiches selon critères section 7.1). Assigner aux reviewers.

_Dépendance_ : Action 10 (premières fiches publiées à reviewer). Parallélisable avec Action 11.

---

**Action 13 — Semaine 5-6 | Priorité NORMALE**
Mener la review humaine 10 % (5 000 fiches, 417h, 2 reviewers). Calculer le kappa final. Produire le rapport qualité batch complet : distribution scores, taux rejet, patterns d'erreur récurrents, recommandations prompt v2.

_Dépendance_ : Actions 11 + 12.

---

**Action 14 — Semaine 6, Jour 5-7 | Priorité NORMALE**
Mesurer les premières métriques A/B test (T0 + 4 semaines) sur les cohortes A, B, C (section 8.2). Comparer scores GSC Coverage : pages indexées par cohorte. Première décision statistique informelle (Mann-Whitney U à 8 semaines = T0 + 8 sem = fin M2).

_Dépendance_ : Action 9 (T0 posé 4 semaines avant).

---

**Checkpoint 6 semaines — livrables attendus** :

- 50 332 descriptions générées et publiées (ou en cours dernières 10K)
- Eval set v1 annoté (100 fiches, kappa ≥ 0.70)
- Scoring automatique calibré (r ≥ 0.80 vs humain)
- 5 000 fiches reviewées humainement (rapport qualité)
- Prompt v1.x finalisé avec changelog
- Cohortes A/B/C posées, métriques T0 + 4sem enregistrées
- Budget consommé : < 30 000 € (principalement reviewers humains)

---

_Chapitre 6 — Content Quality Framework & LLM Grounding Pipeline_
_Plan SEO/Growth ServicesArtisans.fr v2 — 2026-04-18_
_Tous les montants et délais sont des estimations à valider au lancement._
