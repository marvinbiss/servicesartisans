# YMYL Factual Eval — Process équipe

## Pourquoi YMYL

YMYL = « Your Money or Your Life ». Pour SA cela couvre toute information
qui, si elle est fausse, peut causer un préjudice financier ou légal à
l'utilisateur final :

- Montants d'aides (MPR, CEE, éco-PTZ, TVA 5,5 %)
- Critères d'éligibilité
- Plafonds de revenus
- Délais réglementaires
- Règles de cumul

Une hallucination IA sur un de ces points = potentiel UCC trompeuse (L. 121-1
code conso), CNIL en cascade si décision automatisée, et perte de confiance
durable côté SEO E-E-A-T. Memory `feedback_legal_data_quality` : zéro
tolérance.

D'où la nécessité d'un eval CI **bloquant** qui détecte la régression avant
prod plutôt qu'après ticket utilisateur.

## Architecture

```
evals/
  factual-aides.yaml         # config Promptfoo (thresholds par catégorie)
  gold/
    mpr-bareme-2026.jsonl    # 50 cas gold MPR 2026
    sources.md               # sources officielles + politique versionnement
  prompts/
    aide-mpr-classify.txt    # prompt template figé (versionné dans Git)
  scripts/
    eval-runner.mjs          # wrapper npx promptfoo eval
    local-stub-provider.mjs  # stub provider (à remplacer par LLM réel)
    asserters/
      bareme-amount.mjs      # custom asserter par catégorie

.github/workflows/eval-ymyl.yml  # gate CI (PR + push master)
```

## Quand l'eval se déclenche

Trigger CI sur PR ou push touchant :

- `src/lib/llm/**` (couche provider — Ralph 4)
- `src/lib/critic/**` (couche évaluation hallucination — Ralph 5)
- `src/lib/seo/aides/**` (SEO factuel aides)
- `evals/**` (le gold lui-même)
- `.github/workflows/eval-ymyl.yml`

Si la PR ne touche aucun de ces chemins, le workflow ne tourne pas.
Économie crédit CI + concentration mentale sur ce qui compte.

## Ajouter un cas gold

1. Sourcer la valeur exacte sur source officielle (ANAH > France Rénov >
   Légifrance). Reporter URL exacte dans `source_url`.
2. Datez `source_version` au format `YYYY-MM-DD` (date à laquelle vous
   avez vu la valeur sur la source).
3. Ajouter une ligne JSONL à `evals/gold/mpr-bareme-2026.jsonl` en
   respectant le schéma :

   ```json
   {
     "id": "mpr-NNN",
     "category": "bareme_amount|eligibilite|cumul_aides|delai|plafond_revenus",
     "question": "Question utilisateur en français",
     "expected_answer": "valeur attendue brute (string)",
     "expected_currency": "EUR|EUR_PER_M2|BOOL|PERCENT|MONTHS|DAYS|WEEKS|M2|COUNT|CODE",
     "source_url": "https://...",
     "source_version": "YYYY-MM-DD",
     "tolerance_eur": 0,
     "metadata": { "verified": true, "...": "..." },
     "notes": "Contexte humain pour le futur reviewer"
   }
   ```

4. Si la valeur n'est pas vérifiable avec certitude, mettre
   `metadata.verified = false`. L'asserter saute alors le cas (pass=true,
   reason flagué). Mieux 35 cas vérifiés que 50 dont certains faux.
5. Lancer l'eval en local :
   ```
   node evals/scripts/eval-runner.mjs
   ```
6. Commit avec message `feat(evals): add mpr-NNN — <description>`.

## Interpréter une CI rouge

L'artifact `eval-results.json` (rétention 30 jours) liste pour chaque cas :

- `success` true/false
- `score`
- `reason` (texte de l'asserter — la raison exacte du fail est ici)
- `vars` (les variables du cas gold)

Échec typique :

- Score < threshold de la catégorie → l'eval a passé mais le système est
  sous le seuil de confiance acceptable. Ne pas merger sans investiguer.
- Asserter renvoie `INCONNU` pour un cas `verified: true` → le LLM a
  refusé de répondre une question dont on connaît la réponse. Souvent
  signe d'un changement de prompt ou de provider.

## Quand modifier le prompt

Le prompt `evals/prompts/aide-mpr-classify.txt` est **versionné dans Git**
sciemment : si vous changez le prompt, vous risquez d'invalider les
réponses gold parce que le format de sortie évolue.

Procédure de changement de prompt :

1. Brancher localement
2. Modifier le prompt
3. Faire tourner l'eval localement
4. Si des cas régressent : reprendre le diff prompt ou re-baseliner les
   cas concernés (mettre à jour `expected_answer`)
5. Commit prompt + gold ensemble dans la même PR pour traçabilité.

## Dépréciation d'un cas

Quand un décret modifie un barème, on ne supprime pas l'ancien cas — on
le marque déprécié et on ajoute le nouveau :

```json
{
  "id": "mpr-001",
  "metadata": { "verified": true, "deprecated": true, "deprecated_at": "2027-01-15" },
  ...
}
```

L'asserter saute les cas `deprecated: true`. L'historique reste pour
reconstituer les barèmes successifs (utile pour les contrôles a
posteriori côté Anah/DGCCRF).

## Roadmap

| Version       | Périmètre                                            | Cas       |
| ------------- | ---------------------------------------------------- | --------- |
| v1 (actuelle) | MaPrimeRénov 2026                                    | 50        |
| v2            | + CEE (Sonergia, Effy, EDF)                          | +50 = 100 |
| v3            | + Éco-PTZ + TVA 5,5 %                                | +50 = 150 |
| v4            | + Conseil rénovation (zone climatique × DPE)         | +50 = 200 |
| v5            | Multi-modèle eval (cross-LLM disagreement detection) | 200       |

## Références

- Memory `feedback_legal_data_quality` : zéro tolérance inexactitude
- Memory `servicesartisans-rge-ademe-cee-audit-2026-04-28` : E-E-A-T 72/100
- `docs/RGE-OS-MANIFESTO.md` pillar 7 (benchmark eval)
- `src/lib/llm/` : couche provider (Ralph 4)
- Promptfoo docs : https://www.promptfoo.dev/docs/intro/
