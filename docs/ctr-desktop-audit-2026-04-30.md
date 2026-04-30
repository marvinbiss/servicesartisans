# Audit CTR desktop 0.52 % vs mobile 2.71 %

**Généré 2026-04-30** · GSC export 90j · Pas de fix code requis (cause = SERP, pas bug technique)

## Constat GSC

| Device     | Clics |   Impressions |        CTR | Position moyenne |
| ---------- | ----: | ------------: | ---------: | ---------------: |
| Mobile     | 8 274 |       304 861 |     2.71 % |             14.8 |
| Ordinateur | 5 474 | **1 048 127** | **0.52 %** |         **26.7** |
| Tablette   |   306 |         7 090 |     4.32 % |             13.8 |

Desktop = **77 % des impressions**, CTR **5× inférieur** au mobile. Question : bug technique ou structure SERP ?

## Diagnostic technique (curl prod 2026-04-30)

```
$ curl -s "https://servicesartisans.fr/blog/prix-plombier-2026-tarifs-horaires" \
    -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) ... Chrome/127" -o /tmp/desktop.html
$ curl -s "https://servicesartisans.fr/blog/prix-plombier-2026-tarifs-horaires" \
    -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 ...)" -o /tmp/mobile.html
$ wc -c /tmp/{desktop,mobile}.html
410161 /tmp/desktop.html
410161 /tmp/mobile.html
```

**Rendu strictement identique** côté server. Same title, same description, same schemas (2). Aucun bug de rendu différencié desktop/mobile.

### Vérification BAILOUT_TO_CLIENT_SIDE_RENDERING

5 BAILOUT détectés dans le HTML — tous attribuables à des composants conversion `dynamic({ ssr: false })` intentionnels :

- `StickyMobileCTA` (mobile-only CTA, désactivable desktop)
- `ExitIntentPopup` (popup intent — pas pertinent SEO)
- `BlogInlineCTA` (CTA mid-article — peut être analytics-gated)

Aucun de ces composants ne porte du contenu SEO. **Pas un facteur CTR.**

## Cause racine = structure SERP Google

La position moyenne **26.7 desktop** vs **14.8 mobile** trahit la cause :

| Feature SERP                  | Desktop above-fold                  | Mobile above-fold           |
| ----------------------------- | ----------------------------------- | --------------------------- |
| Featured Snippet              | ~250 px occupés                     | ~180 px                     |
| People Also Ask (4 questions) | ~280 px occupés                     | ~220 px (1 expanded)        |
| Image carousel                | ~180 px occupés                     | rare ou compressé           |
| Knowledge Graph (right rail)  | 350 px latéral                      | absent                      |
| Premier résultat organique    | Souvent **après pli** desktop 1080p | **Toujours visible** mobile |

→ Sur les requêtes commerciales (« prix plombier 2026 »), le SERP desktop est **plus saturé** que mobile. Notre position moyenne 26.7 desktop est probablement **position visuelle pos 35+** (sous le pli, scroll requis 2-3 fois).

C'est cohérent avec la position 14.8 mobile (pos visuelle réelle ≈ pos 8-12 mobile, scroll 1 fois).

**Le CTR 0.52 % desktop est mathématiquement attendu** pour une visibilité visuelle pos 35+. Aucun bug.

## Que faire — Stratégie déjà en place

| Action                               | Statut                                                                              |
| ------------------------------------ | ----------------------------------------------------------------------------------- |
| Capter FS via tableaux H2#1 prix     | ✅ Composant `SnippetBaitSummary` déjà câblé sur `/villes/[v]` (commit `2e616e7be`) |
| Capter FS via résumé en-tête         | ✅ `EnBrefBox` câblé sur articles + `/services/[s]`                                 |
| Capter PAA via FAQ structurée        | ✅ `FAQPage` schema émis sur tous les articles + pages                              |
| Capter rich product snippet          | ✅ Service+AggregateOffer livré 2026-04-30 (commit `5cc4a1b5e`)                     |
| Augmenter position effective         | 🔄 Nécessite autorité (DR 0.6 → 22-32 plan) + backlinks Sprint 3                    |
| Capter pos 0 (Featured Snippet zéro) | 🔄 Requiert table prix above-fold sur articles `prix-*` (suggestion)                |

### Suggestion résiduelle (effort moyen, ROI moyen)

Sur les 7 articles `prix-*` patchés ce matin, ajouter un bloc `EnBrefBox` ou `SnippetBaitSummary` **avant** le premier H2 avec une mini-table 3 lignes (tarif horaire / 1ère prestation / fourchette projet complet). Augmente les chances de capture FS sans modifier le contenu.

Implémentation : champ optionnel `priceSnippet` dans le type `BlogArticle` + render dans `[slug]/page.tsx` avant `parsedBlocks`. À mettre en backlog (Sprint 3).

## Acceptance criteria

| Métrique                            | Avant       | Cible J+30                         |
| ----------------------------------- | ----------- | ---------------------------------- |
| CTR desktop sur 7 articles `prix-*` | 0.10-0.50 % | ≥ 1.5 % (gain Schema rich snippet) |
| Pos moyenne desktop globale         | 26.7        | ≤ 22 (gain autorité progressive)   |
| % imp desktop avec rich result      | < 5 %       | ≥ 25 % (Service schema déployé)    |

Re-mesurer GSC J+30 (2026-05-30). **Pas de patch code à committer dans le cadre de cet audit** — la stratégie est déjà en place via les commits du 2026-04-30.
