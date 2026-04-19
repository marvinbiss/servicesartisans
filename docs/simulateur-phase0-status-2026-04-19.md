# Simulateur aides rénovation — Phase 0 · État 2026-04-19

> Ce document remplace `docs/HANDOFF-simulateur-session-2026-04-14.md` (obsolète depuis la livraison P3→P7 des 14-19 avril). Il sert de source de vérité pour : "peut-on passer en prod client ?" et "quel est le prochain geste à faire ?".

## 1. Statut global

| Composant           | État         | Fichier(s)                                                     |
| ------------------- | ------------ | -------------------------------------------------------------- |
| Stepper 5 étapes UI | ✅ En prod   | `src/components/simulateur/StepperV2.tsx` + `steps/`           |
| Barèmes 2026-01     | ✅ Versionné | `src/lib/simulateur/baremes/2026-01.ts` (1 065 lignes)         |
| Moteur de calcul    | ✅ En prod   | `src/lib/simulateur/engine/pipeline.ts`                        |
| Routes API          | ✅ En prod   | `/api/simulateur/{estimate,submit,result/[publicId],callback}` |
| Pipedrive           | ✅ En prod   | `src/lib/simulateur/pipedrive.ts` + cron retry 6h              |
| Admin traçabilité   | ✅ En prod   | `src/app/admin/(dashboard)/simulateur/` + detail `[publicId]`  |
| RGPD anonymisation  | ✅ En prod   | `src/app/api/cron/rgpd-anonymize/route.ts`                     |
| IndexNow lastmod    | ✅           | Inclus dans sitemap shard aides                                |
| Schemas YMYL (Rich) | ✅           | `WebApplication` + `GovernmentService` + `FinancialProduct`    |

**Doc source de vérité** :

- `docs/simulateur-architecture.md` (473 l.) — spec figée
- `docs/rgpd-simulateur-aides.md` (327 l.) — conformité V1
- `docs/baremes-sources/07-valeurs-officielles-confirmees-2026-04-14.md` — chiffres opposables

## 2. Couverture des gestes (parcours MPR geste)

| Geste ID               | Forfait 2026-01 | Statut calc-mpr                                  | Notes                                        |
| ---------------------- | --------------- | ------------------------------------------------ | -------------------------------------------- |
| `PAC_AIREAU`           | ✅              | ✅                                               | Confirmé arrêté                              |
| `PAC_GEOTHERMIE`       | ✅              | ✅                                               | Confirmé arrêté                              |
| `CET`                  | ✅              | ✅                                               | Chauffe-eau thermodynamique                  |
| `CESI`                 | ✅              | ⚠️ `.UNCONFIRMED.2026-01`                        | Valeur à confirmer par arrêté                |
| `POELE_GRANULES`       | ✅              | ✅                                               |                                              |
| `POELE_BUCHES`         | ✅              | ⚠️ `.UNCONFIRMED.2026-01`                        |                                              |
| `VMC_2FLUX`            | ✅              | ✅                                               |                                              |
| `AUDIT_ENERGETIQUE`    | ✅              | ✅                                               |                                              |
| `BIOMASSE`             | ❌ Supprimé     | ❌ `.SUPPRIME.2026-01`                           | Depuis 01/01/2026 — CEE seul actif           |
| `ITE`                  | ❌ Supprimé     | ❌ `.SUPPRIME.2026-01`                           | Supprimé parcours geste 01/01/2026           |
| `ITI`                  | ❌ Supprimé     | ❌ `.SUPPRIME.2026-01`                           | Supprimé parcours geste 01/01/2026           |
| `ISOLATION_MURS`       | ❌ Supprimé     | ❌ `.SUPPRIME.2026-01`                           | Supprimé parcours geste 01/01/2026           |
| `ISO_TOITURE_RAMPANTS` | 🟡              | ⚠️ `.NEEDS_SURFACE.` / `.NEEDS_OFFICIAL_BAREME.` | Infra prête, valeurs €/m² à sourcer PDF ANAH |
| `ISO_TOITURE_TERRASSE` | 🟡              | ⚠️ `.NEEDS_SURFACE.` / `.NEEDS_OFFICIAL_BAREME.` | Infra prête, valeurs €/m² à sourcer PDF ANAH |
| `ISO_PLANCHERS_BAS`    | 🟡              | ⚠️ `.NEEDS_SURFACE.` / `.NEEDS_OFFICIAL_BAREME.` | Infra prête, valeurs €/m² à sourcer PDF ANAH |
| `SSC`                  | ❌ inconnu      | ⚠️ `.STUB.2026-01`                               | À spécifier ou désactiver en UI              |
| `MENUISERIES`          | ❌ inconnu      | ⚠️ `.STUB.2026-01`                               | À spécifier ou désactiver en UI              |
| `VMC_SF`               | ❌ inconnu      | ⚠️ `.STUB.2026-01`                               | Legacy — probablement à désactiver           |

## 3. TODOs bloquants go-live client

### P0 — Indispensable avant 1er lead payant généré

1. **Input `surfacesIsolation_m2`** — ✅ Infra livrée 2026-04-19
   - `Projet.surfacesIsolation_m2?: Partial<Record<GesteId, number>>` dans `types.ts`
   - Zod validation 1-1000 m² par geste dans `schemas.ts`
   - UI legacy Step3Projet.tsx équipé ; StepperV2 (live funnel) non équipé (funnel de lead capture par déduction auto — pas de surface collectée côté utilisateur)
   - `calc-mpr.ts` retourne 3 états explicites : `.NEEDS_SURFACE.` / `.NEEDS_OFFICIAL_BAREME.` / `.PAR_M2.`
   - **Reste à faire** : valeurs `MPR_ISOLATION_EUROS_PAR_M2` (cf. P0 #2 ci-dessous)

2. **Valeurs officielles €/m² MaPrimeRénov' 2026** — ✅ **Intégrées 2026-04-19**
   - Source : PDF ANAH "Les aides financières en 2026" (février 2026, pp.13-17) — `https://www.anah.gouv.fr/sites/default/files/2026-02/Anah-FR-Guide_des_aides_Fev2026_WEB_20260224.pdf`
   - Valeurs confirmées parcours par geste :
     - Rampants de toiture / plafonds de combles : 25 / 20 / 15 / non éligible €/m²
     - Toitures-terrasses : 75 / 60 / 40 / non éligible €/m²
   - Plafonds dépenses éligibles : 75 €/m² rampants, 180 €/m² terrasse
   - Gestes supprimés parcours geste 2026 (consolidé) : ITE, ITI, ISOLATION_MURS, ISO_PLANCHERS_BAS, ISOLATION_PLANCHER, BIOMASSE
   - Tests référentiels ajoutés dans `__tests__/simulateur/engine/calc-mpr.test.ts`

3. **Formule exacte BAR-TH-171 CEE** (PAC air/eau)
   - Fichier : `src/lib/simulateur/engine/calc-cee.ts` fonction `computeBarTh171`
   - Aujourd'hui : placeholder `base × facteur_surface × facteur_etas`
   - Cible : table exacte PDF DGEC vA78.4 (zone climatique × efficacité saisonnière × surface chauffée)
   - Ticket amont : scraping/parse du PDF DGEC puis génération d'une `const MATRICE_BAR_TH_171` versionnée
4. **Confirmer CESI + POELE_BUCHES** (retirer `.UNCONFIRMED.`)
   - Attendre arrêté 2026 officiel ou dégrader UX avec mention "estimation sous réserve"
5. **Désactiver gestes STUB en UI** plutôt que les laisser remonter 0 €
   - StepperV2 / Step3Projet : retirer SSC, MENUISERIES, VMC_SF des options cochables tant que les baremes ne sont pas renseignés

### P1 — Qualité conversion (1-2 semaines après P0)

5. **Parcours accompagné (non-geste)** : plafond + % écrêtement selon saut DPE
   - Aujourd'hui : module `MPR_ACCOMPAGNE` présent dans baremes mais non exposé dans le stepper
   - Dérouler un 2e mode sur Step 1 : "1 geste" vs "parcours accompagné"
6. **Éco-PTZ** — calcul simple (plafond 50 000 € par logement selon nombre de gestes)
   - Dans la doc architecture §2.3 mais pas dans le moteur actuel
7. **Affichage reste à charge après aides**
   - `src/lib/simulateur/engine/reste-a-charge.ts` calcule, la step 5 résultat doit l'afficher gros + comparer "coût projet TTC" vs "après aides"

### P2 — Conversion avancée (mois 2-3)

8. **Simulateur revenus négatifs** (RFR < seuil) → flag "précarité énergétique" + redirection ciblée
9. **Bouton "Je veux être rappelé"** sur Step 5 → pipeline callback déjà en place (`callback-pipedrive.ts`)
10. **Partage résultat par lien public** (`/simulateur-aides-renovation/resultat/[publicId]`) — déjà en prod mais sans SSO/email gating, à auditer pour RGPD leak

## 4. TODOs RGPD

- ✅ Hash IP 6 mois puis purge
- ✅ Coords 3 ans max si pas de `pipedrive_deal_id`
- ✅ RFR tranché à 10k après 90 j
- 🟡 Endpoint `/api/rgpd/delete/[publicId]` — confirmation email manquante (flag `deleted_at` OK, email TODO)
- 🟡 Endpoint `/api/rgpd/export/[publicId]` — JSON complet à auditer pour exhaustivité

## 5. Tests

**Cumul actuel** : ~138 tests verts (zones 16, schemas 23, hash-ip 7, public-id 5, engine 67, baremes 20).

**Manquants** pour couvrir P0 TODOs :

- [ ] `calc-mpr.test.ts` : branche NEEDS_SURFACE avec surface fournie (après ajout input)
- [ ] `calc-cee.test.ts` : 10-15 cas exacts PDF DGEC pour BAR-TH-171 (après implémentation matrice)
- [ ] Test E2E Playwright complet Step 1→5 avec snapshot résultat

## 6. Mesures & SLA (rappel spec §11)

| Métrique                                 | Cible        | Source                                                 |
| ---------------------------------------- | ------------ | ------------------------------------------------------ |
| Step 1 → Step 5 complétion               | ≥ 40 %       | tracking GA4 `simulateur_step_complete`                |
| Latence `/api/simulateur/estimate`       | P95 < 300 ms | logs Vercel + Sentry perf                              |
| Reconstruction estimation < 30 s (admin) | 100 %        | admin detail `[publicId]` UI render                    |
| Pipedrive Deal créé dans les 5 min       | ≥ 95 %       | cron retry DLQ + table `simulateur_pipedrive_failures` |
| Cron RGPD purge à 03:00 UTC              | 100 %        | vercel cron logs                                       |

## 7. Décisions architecture restées fermes

1. **Zod v4** partout (pas v3, malgré CLAUDE.md racine)
2. **Une version de barème = un fichier TS** (`2026-01-14`). Pas de DB-first pour les valeurs : reconstructibilité > DRY.
3. **IDs stables** : `MPR.{GESTE}.{CATEGORIE}.{SUFFIX}.{VERSION}` — suffix indique la qualité (`STUB`, `UNCONFIRMED`, `NEEDS_SURFACE`, `SUPPRIME`, absent = confirmé)
4. **Fire-and-forget Pipedrive** avec DLQ 6 h et max 5 retries — jamais bloquer l'affichage résultat sur un appel externe
5. **IP hash (salt tournant 90 j)** — pas d'IP en clair en base

## 8. Questions ouvertes (à trancher hors code)

- [ ] Est-ce qu'on met en ligne `/simulateur-aides-renovation` pour le grand public **avant** avoir résolu P0 #1 et #2 ?
  - Option A — oui, afficher "estimation indicative" + masquer les gestes STUB (quick)
  - Option B — non, attendre que l'iso soit calculable (bloque 2-3 semaines)
  - **Recommandation** : A si on peut afficher un fallback honnête "contacter un conseiller" pour les gestes non calculables
- ✅ Redirect 301 `/simulateur-prime-cee` → `/simulateur-aides-renovation` en place (`next.config.js:457`)
- [ ] Quelle est la stratégie de refresh des barèmes après le prochain arrêté (Q3 2026) ? Process owner ? CI check ?

## 9. Références internes

- Mémoire : `servicesartisans-simulateur-aides-plan.md`
- Tracking events : `src/lib/analytics/tracking.ts` (chercher `simulateur_*`)
- Dashboard KPIs : `/admin/(dashboard)/simulateur` (à compléter KPI funnel après reaim tracking)
- Master plan mandataire : `docs/master-plan-mandataire-cee-2026-04-19.md` (simulateur = brique de qualification lead → dispatch CEE)

---

**Prochain geste recommandé** : livrer P0 #1 (input surface isolation dans Step 2) — ~1 j de code + test, débloque 80 % du volume DGEC résidentiel et rend le simulateur honnête en prod.
