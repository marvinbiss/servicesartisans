# MaPrimeRénov' Barème 2026 — Sources Officielles

Toute valeur du fichier `mpr-bareme-2026.jsonl` doit être traçable jusqu'à une
de ces sources. Memory `feedback_legal_data_quality` : zéro tolérance pour les
données fabriquées. Quand une valeur n'est pas vérifiable, le cas porte
`metadata.verified = false` et l'assertion est sautée — ce qui est strictement
préférable à fabriquer un faux référentiel.

## Sources officielles primaires

| Source                               | URL                                                                 | Rôle                                                                              |
| ------------------------------------ | ------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| ANAH (Agence nationale de l'habitat) | https://www.anah.gouv.fr/proprietaires/aides-de-l-anah/maprimerenov | Autorité de référence sur les barèmes MPR, plafonds RFR, conditions d'éligibilité |
| France Rénov' (service public)       | https://france-renov.gouv.fr/aides/maprimerenov                     | Vulgarisation officielle + simulateur public + matrices de cumul d'aides          |
| Service-Public.fr                    | https://www.service-public.fr/particuliers/vosdroits/F35083         | Fiche aide légalement opposable                                                   |
| Légifrance                           | https://www.legifrance.gouv.fr                                      | Source de l'arrêté de référence du barème (à citer décret par décret)             |
| Chèque Énergie                       | https://www.chequeenergie.gouv.fr                                   | Pour les cas `cumul_aides` impliquant le chèque énergie                           |
| Sonergia (opérateur CEE)             | https://www.sonergia.fr                                             | Pour les questions de cumul MPR + CEE (partenaire SA)                             |

## Versionnement

Chaque cas gold porte deux champs critiques :

- `source_url` : URL officielle pointant la valeur référencée
- `source_version` : date `YYYY-MM-DD` à laquelle la valeur a été constatée

Quand un arrêté modifie un barème, on procède comme suit :

1. Ajouter un nouveau cas `mpr-XXX` portant la nouvelle valeur + nouvelle `source_version`
2. Tagger l'ancien cas avec `"deprecated": true` dans `metadata`
3. Documenter le changement dans `docs/EVAL-YMYL-PROCESS.md` (changelog)

## Cas non vérifiés (`verified: false`)

11 cas sur 50 actuellement portent `metadata.verified = false`. Raisons :

- VMC double flux (`mpr-017`) : statut MPR par geste évolue (sortie/réintroduction 2024-2026)
- Chaudière biomasse (`mpr-018`) : barème soumis à des révisions annuelles, valeur 2026 à reconfirmer publication décret
- Plafond annuel cumul (`mpr-022`) : libellé interne SA "plafond 5 ans" — confirmer avec arrêté
- Bonus sortie de passoire (`mpr-023`) : Parcours Accompagné — valeur exacte 2026 à publier
- Délais Anah (`mpr-041` à `mpr-044`) : valeurs « moyennes » non-normatives ; à sourcer via rapport activité Anah
- Plafonds RFR détaillés (`mpr-046` à `mpr-048`) : revalorisation annuelle, arrêté 2026 à intégrer

Ces cas restent dans le fichier pour matérialiser l'intention (gestes/profils que
le système IA SA doit savoir traiter), mais l'asserter sait les sauter — la CI ne
échouera donc pas pour leur cause. Quand quelqu'un dispose des sources, il
remplit `expected_answer`, bascule `verified` à `true`, et la couverture monte
mécaniquement.

## Politique d'évolution

- Toute évolution réglementaire (PLF, LFSS, arrêté CEE) ouvre une issue
  étiquetée `eval-ymyl` documentant le changement gold à effectuer.
- Une dérive sans mise à jour de gold trahit un défaut de veille — escalade
  vers le pilier 4 du Manifeste RGE-OS (« Truth ladder »).
- Cumul d'aides : toujours vérifier via simulateur France Rénov'
  (https://france-renov.gouv.fr/simulateur) avant de coder une réponse
  attendue.

## Roadmap d'élargissement

- v1 (actuelle) : 50 cas MaPrimeRénov' 2026
- v2 : ajouter 50 cas CEE (Certificats d'Économies d'Énergie) — primes
  Sonergia/Effy/EDF par geste × profil
- v3 : ajouter 30 cas Éco-PTZ + 20 cas TVA 5,5 %
- v4 : ajouter 50 cas zone climatique × DPE (logique conseil rénovation)
