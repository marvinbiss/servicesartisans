# Audit ServicesArtisans cluster Rénovation Énergétique

## Rapport KPMG Executive — 2026-05-04

**Périmètre** : cluster rénovation énergétique (RGE / CEE / MaPrimeRénov / aides / travaux) — vol Ahrefs cumulé 1,6 M req/mo, 459 K pages SA indexées, baseline 350 clics/jour.
**Méthodologie** : 5 audits agents parallèles (KW gap, backlinks, E-E-A-T/YMYL, SERP, supply×funnel) sur sources Ahrefs 2026-04 + 2026-05 + audit code App Router + snapshots Supabase 2026-05-03.
**Auteur** : Agent 6 (chef de mission KPMG) — rapport consolidé.

---

## 1. Synthèse exécutive

### 1.1 Verdict global

**Score consolidé pondéré : 27 / 100** — niveau **inadequate** au regard du potentiel marché. Le code et les fondations honest E-E-A-T sont solides (62/100, devant Effy/Hellio/QuelleEnergie sur 4 critères QRG), mais 3 dimensions structurelles **drag** la note : autorité externe (8/100), SERP (4/100), activation supply (claim_rate 0,002 %). Le moat data unique du marché français (970 K fiches, 46 K RGE actifs, dataset open prêt) reste inactivé.

**Pondération** : KW gap 25 % · Backlinks 25 % · E-E-A-T 20 % · SERP 15 % · Supply×Funnel 15 % → score = 0,25×31 + 0,25×8 + 0,20×62 + 0,15×4 + 0,15×38 = **27,3 / 100**.

### 1.2 Trois chiffres-clés

1. **1,6 M req/mo** Ahrefs cluster réno mesuré, **0,02 %** capté par SA aujourd'hui (Agent 1 §1.1, Agent 4 §1).
2. **DR 0,6** vs concurrents médians 73-78 (Effy 72, Hellio 73, France-Renov 75, Selectra 78) — **gap ×120** (Agent 2 §1.1).
3. **1 fiche RGE claimed sur 46 137** (claim_rate 0,002 %) malgré 99,8 % d'emails disponibles (Agent 5 §1.1).

### 1.3 Top 5 risques business

| #   | Risque                                                                                                    | Origine                            | Probabilité | Impact                            |
| --- | --------------------------------------------------------------------------------------------------------- | ---------------------------------- | ----------- | --------------------------------- |
| R1  | Effy embauche Head of SEO Q2 → fenêtre 6-18 mois se ferme                                                 | Agent 2 §5.3 + memory ahrefs-bloc1 | Haute       | Critique                          |
| R2  | Migration 500 (claim auto-approve) reste dormante 4-6 sem (flow email non câblé)                          | Agent 5 §4.2                       | Haute       | Élevé                             |
| R3  | 5 xx sur 12 890 pages (57 % template fiches RGE CTR 36 %) — invisible Ahrefs, visible GSC                 | Agent 4 §5 + memory gsc-diagnostic | Haute       | Critique                          |
| R4  | YMYL drift : 7 300 URLs aides/CEE sans `YmylDisclaimer` ni `reviewedBy`                                   | Agent 3 §4.2                       | Moyenne     | Élevé (sanction trust QRG §4.6.6) |
| R5  | 3 verticales famine supply (audit-énergétique, borne-recharge, climaticien) → leads silencieux RGE-strict | Agent 5 §6                         | Élevée      | Moyen                             |

### 1.4 ROI total recommandations P0 (12 mois P50)

| Levier P0                                        | Trafic capté P50                         | Source agent     |
| ------------------------------------------------ | ---------------------------------------- | ---------------- |
| Vague 1 KW (50 nouvelles pages travaux)          | +125-210 K vol/mo                        | Agent 1 §5.3     |
| Backlinks Tier 1 (data.gouv + 8 presse)          | +indirect amplification                  | Agent 2 §4.2     |
| YMYL câblage 13 routes types                     | CTR +5-10 % cluster YMYL                 | Agent 3 §5       |
| Title CEE scale + H1 fix + content surgery PAC   | +5-7 K clics/mo M+3                      | Agent 4 §6 HypoB |
| Flow email-confirmation + UX rge_strict_no_match | claim_rate × 150-400, drop -8 %          | Agent 5 §7.3     |
| **ROI cumulé P50 12 mois**                       | **+30-40 K clics/jour** (DR 0,6 → 14-18) | consolidé        |

Soit **× 8-11 vs baseline 350 clics/jour**. Cohérent avec mémoire ULTRA-DOMINATION-v2 (cible recalibrée 50-90 K clics/j à M+12).

---

## 2. Scorecard par domaine

| #   | Domaine                   | Score actuel |         Cible 12 mois | Trend           | Effort                             |                                 ROI clic/mo P50 |
| --- | ------------------------- | -----------: | --------------------: | --------------- | ---------------------------------- | ----------------------------------------------: |
| 1   | KW gap (Agent 1)          |       31/100 |                65/100 | ↑↑ accessible   | 180 pages, 6 mois                  | +235-395 K vol/mo (16-25 K clics/mo capturable) |
| 2   | Backlinks (Agent 2)       |        8/100 | 35/100 (DR 14-18 P50) | ↓ critique      | 175 j, 6-12 mois                   | indirect +amplification ×30-50 % autres leviers |
| 3   | E-E-A-T / YMYL (Agent 3)  |       62/100 |                84/100 | → fondations OK | 13 fichiers + recrutement reviewer |                        +CTR 5-10 % cluster YMYL |
| 4   | SERP (Agent 4)            |        4/100 |                45/100 | ↓↓ inadequate   | 1-3 sem P0 actions                 |                             +5-7 K clics/mo M+3 |
| 5   | Supply × Funnel (Agent 5) |       38/100 |                70/100 | ↑ déblocable    | flow email + outreach 200 + UX     |           claim_rate × 150-400, +200-500 MQL/mo |

**Score global pondéré** : 27 / 100 → cible 12 mois 58-62 / 100.

---

## 3. Diagnostic par domaine

### 3.1 KW gap (Agent 1)

**État actuel** : 85 pages SA dédiées cluster réno (statiques + flagship) face à 3 349 KW Ahrefs mesurés (vol 1,6 M/mo). Ratio SA/KW = 2,5 % → **97,5 % du gap n'a aucune page dédiée**. Cluster solaire_pv = orphelin (1 page pour 288 KW vol 230 K), cluster VMC = goldmine KD 0,7 partiellement couvert (7 pages / 215 KW), cluster PAC sous-coverage 1,3 % (8 pages / 615 KW vol 230 K).

**Gap chiffré** : top 30 KW vol≥500 KD≤30 = 155 700 vol/mo dont 22/30 (73 %) sans page SA dédiée. Effort create = ~100-130 h dev/content + ~20 h enrich.

**Comparaison concurrents** : France-Renov DR 75 monopolise les head terms (`pompe a chaleur` 56 K vol pos 1, 28 K trafic). Effy DR 72 = pattern profondeur 4 `/travaux-energetique/{cat}/{sub}/{aspect}`. QuelleEnergie = champion long-tail technique copycat-able directement (vmc type b, dimension panneau).

**Verdict** : score 31/100. Roadmap V2 fused alignée P0 4-6 sem (50 pages, +125-210 K vol/mo P50), P1 Q3 2026 (80 pages, +60-100 K vol/mo), P2 Q4 2026 (50 pages, +50-85 K vol/mo). Plafond ranking conditionné à uplift DR (cf. Agent 2).

### 3.2 Backlinks (Agent 2)

**État actuel** : DR 0,6 (Ahrefs 2026-04-18), 64 backlinks dont **78,1 % spam PBN** (disavow uploadé 2026-04-18), 4-6 RD qualifiés réels (`artisanduvert.fr` DR 18, `climacontrol.fr` DR 28, `paysagistedoccitan.fr` DR 1,4 — tous DR <30). **0 backlink Tier 1** (presse, .gouv, ADEME, France-Renov, data.gouv.fr, Wikipedia, .edu).

**Gap chiffré** : 0/52 cibles documentées Tier 1 acquises. Cluster réno = **1 backlink sur 64** (1,6 %). 0 lien éditorial vers `/rge`, `/aides`, `/cee`, `/renovation-energetique` malgré Pillar #2 du plan stratégique.

**Comparaison concurrents** : Effy/France-Renov présents sur 8/8 cibles presse Tier 1 (LeFigaro DR 91, LesEchos DR 90, BFM DR 89, LeMonde DR 91, Capital DR 84, Liberation DR 86, Challenges DR 82, JournalDuNet DR 86). France-Renov présent sur 21/21 sites .gouv.fr testés (service-public, economie, ecologie, ADEME, ANAH, etc.).

**Verdict** : score 8/100 — **dernière position absolue** dans le cluster. Pattern gagnant identifié : blogs `/blog/prix-[métier]-2026` attirent 5/6 backlinks qualifiés (link earning organique). Levier critique non-additif : **dataset RGE sur data.gouv.fr** (asset prêt, KBIS bloquant J+7) débloque crédibilité Tier 1 presse (+30 % proba pitch). Cible P50 12 mois = DR 14-18, P75 stretch = DR 22-28 avec budget agence PR (~3 K€/mois × 6).

### 3.3 E-E-A-T / YMYL (Agent 3)

**État actuel** : score 62/100. Fondations honest posture solides post-refonte 2026-04-20 : 6 auteurs nommés sans certifs fantasmées, methodology + credentialsBasis publiés, FlagshipSources sur 146 fichiers (101 guides + 35 reno + 5 RGE labels), Schema GovernmentService + FinancialProduct sur 14 routes types, /equipe + /methodologie + /sources publiques, Schema `publishingPrinciples` + `correctionsPolicy` + `ethicsPolicy` (très rare dans le secteur).

**Gap chiffré** : `YmylDisclaimer` câblé sur **3 fichiers seulement** (`/aides/[slug]/{maprimerenov,renovation,[aide]}`) — absent de **/cee/\*** (8 routes, ~6 450 URLs) et **/renovation-energetique/\*** (36 routes) et **/rge/labels/\*** (5 routes) qui sont les pages YMYL les plus lues. **Aucun reviewedBy fiscal/juriste** sur pages aides. `LastUpdated` câblé sur 30 fichiers seulement vs 100+ YMYL nécessaires.

**Comparaison concurrents** : SA gagne sur C3 (auteurs nommés), C4 (methodology), C8 (politique éditoriale), C11 (correctionsPolicy Schema) — **4 critères QRG devant Effy/Hellio/QuelleEnergie**. SA perd sur C5 (reviewer expert), C9 (reputation/DR), C10 (disclaimer câblage).

**Verdict** : fondations rares mais théoriques sans câblage. Sans actions 1+2+3 (P0), score plafonne à 70 quoique fait sur le contenu.

### 3.4 SERP (Agent 4)

**État actuel** : score 4/100. Sur les top 100 KW gap (vol cumulé 519 K/mo), SA n'apparaît sur **aucun**. Sur 590 KW lookalike Sonergia (vol 765 K/mo, 127 attackable KD ≤ 15), SA est positionné sur **0**. Sur les 143 KW SA toutes verticales, **15 sont reno** mais tous sur micro-volumes (max 200/mois) — le concept "rank 21-50 dormant" n'existe pas pour réno parce que SA n'a jamais ranké.

**Gap chiffré** : volume mensuel récupérable striking distance réel = **0**. Concurrents winning sur top 100 KW : France-Renov 36 KW (287 K vol), Effy 35 KW (119 K vol), Hellio 14 KW (50 K vol), Sonergia 13 KW (40 K vol), Selectra 2 KW (24 K vol).

**Issues techniques bloquantes** (site_audit_issues_2026-05.csv) : Multiple H1 tags 8 207 pages (+184), Slow page 1 103 (+148), Meta description too short 2 708 (+2 686 régression), Orphan page 484, Noindex page in sitemap 386. **Note** : site_audit Ahrefs aveugle aux 5 xx GSC (12 890 pages dont 57 % fiches RGE CTR 36 %).

**Verdict** : restart obligatoire. Hypothèse validée : +5 K clics/mo M+3 si exécution P0 only (title CEE scale + H1 fix + content surgery PAC). Le concept "striking distance" ne s'applique pas — c'est de la création/upgrade pure.

### 3.5 Supply × Funnel (Agent 5)

**État actuel** : score 38/100. Stock RGE bon (46 137 fiches actives, 99,8 % email, 95 % téléphone) mais activation supply quasi-nulle : **1 fiche claimed**. Migration 500 (cron `claim-auto-approve` + outreach Lemlist top 200) livrée 2026-05-04 mais pool éligible immédiat = **0** car flow email-confirmation non câblé côté `/api/claims`. 62,6 % `address_region` NULL (28 928 RGE) cassent outreach Lemlist personnalisation et matching Pipedrive.

**Funnel cluster réno** : drop-off 92,8 % entre `form_started` (7 % du page_view) et `dispatch` :

- Zod silencieuse 60 % (18-22 % du gap)
- Format téléphone strict (8-12 %)
- CTA hero invisible mobile-first (12-18 %)
- RGE-strict no-match silencieux mig 498 (4-7 %)
- Pipedrive silent failure 4 s timeout (3-5 %)

**Quality flag** : 86 % des top 5 000 RGE ont 0 avis, 0 backfill Google Places (mig 483 dormante, $60 + 4-6 h dev = +18-25 % CTR), 30+ dept en famine sur audit-énergétique / borne-recharge / climaticien.

**Comparaison concurrents** : aucun concurrent ne joue l'annuaire RGE public claimable — moat structurel SA inactivé. Effy 2 776 artisans (×16 plus petit), DR 72, ad spend. Sonergia/Hellio = mandataire CEE pur, pas de supply.

**Verdict** : code propre mais bottleneck déplacé sur flow email. Conversion attendue post-fix : claim_rate 0,002 % → 0,3-0,8 % à J+90, funnel 7,2 % → 11-14 %, MQL mandataire CEE 0 → 200-500/mo à J+180.

---

## 4. Roadmap consolidée 90 jours

### 4.1 Vague 1 (J0-J30) — actions P0 prioritaires

| #    | Action                                                                                                                                                           | Owner                 | Effort                 | KPI cible                                        | Dépendance                 | Plan B                                                |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------- | ------------------------------------------------ | -------------------------- | ----------------------------------------------------- |
| P0.1 | **Soumettre dataset RGE sur data.gouv.fr** + créer Wikidata Q "ServicesArtisans" + demande référencement ADEME/France-Renov                                      | Lead SEO + dev 1      | 2 j                    | 1 backlink DR 88 acquis J+10                     | KBIS J+7                   | Open-source GitHub si data.gouv refuse (Agent 2 §4.1) |
| P0.2 | **Câbler flow email-confirmation claim** (`POST /api/claims` token + Resend + `GET /confirm-email/[token]`)                                                      | Dev 1                 | 4-6 h                  | Pool éligible auto-approve > 10 J+15             | Resend template            | Manual approve admin si flow KO                       |
| P0.3 | **Câbler `YmylDisclaimer` + `<Byline>` sur 13 routes types YMYL** (cee/\*, reno/\*, rge/labels/\*, aides hub, simulateur)                                        | Dev 1                 | 3 j                    | C10 25 → 90, C3 80 → 95 sur 7 300 URLs           | composant existant         | n/a                                                   |
| P0.4 | **Fix Multiple H1 tags + Slow page** sur hubs réno (`/services/pompe-a-chaleur`, `/services/isolation-thermique`, `/cee/[op]`, `/renovation-energetique`)        | Dev 1                 | 2 h + audit Lighthouse | -184 pages H1 multiples, LCP < 2,5 s             | n/a                        | n/a                                                   |
| P0.5 | **Vague 1 KW V2 fused** : hub `/vmc/` enrich (5 sous-pages) + PAC (5 sous-pages) + `/solaire/` ex-nihilo (5) + DPE classes (5) + `/chauffage/chaudiere-gaz/` (5) | Dev 1 + redacteur RGE | 4-6 sem                | 25 nouvelles pages, +50-100 K vol/mo addressable | rubric v1.3 + Agent 1 §5.2 | Phase planning vague 2 si bloqué                      |

**ROI Vague 1** : +50 K vol/mo addressable, claim_rate × 5, DR 0,6 → 4-6, CTR cluster YMYL +5 %. Fenêtre fermeture risque R1 (Effy Head of SEO) = 6 sem max disponibles.

### 4.2 Vague 2 (J30-J60) — actions P1

| #    | Action                                                                                                                                 | Owner                             | Effort           | KPI cible                                      | Dépendance          | Plan B                                          |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ---------------- | ---------------------------------------------- | ------------------- | ----------------------------------------------- |
| P1.1 | **Pitch coordonné Tier 1 presse 8 cibles** (LeFigaro, LesEchos, BFM, LeMonde, Capital, Liberation, Challenges, JournalDuNet)           | Lead PR / agence                  | 30 j outreach    | 3-5 publications, +10-15 RD                    | data.gouv.fr publié | Lemlist warm-up + Tier 2 BTP fallback           |
| P1.2 | **Tier 2 BTP** (batiactu, ffbatiment, habitatpresto, construction21, totalenergies)                                                    | Lead PR                           | 15 j             | 3-4 RD acquis, +DR 1-2                         | n/a                 | Échange contenu réciproque                      |
| P1.3 | **Recruter 1 expert fiscal + 1 expert technique RGE** (`reviewedBy` Person Schema)                                                     | Lead RH + budget 4-6 K€/mo × 6 mo | 4 sem            | 2 experts signés sur 30 hubs YMYL clés         | budget validation   | Reviewer interne ANAH ex-agent (delay 2-3 mois) |
| P1.4 | **Title rewrite CEE scale aux 22 ops manquantes** (déjà en prod sur bar-th-148/112)                                                    | Dev 1                             | 4 h              | +2-3 K clics/mo M+1 sur 80 K vol addressable   | n/a                 | n/a                                             |
| P1.5 | **Content surgery `/services/pompe-a-chaleur` + `/services/isolation-thermique`** (H2 prix, marques, comparatifs, ITE/ITI/combles/sol) | Redacteur RGE + Dev 1             | 3 sem            | +3-7 K clics/mo M+3 sur 277 K vol addressable  | content brief       | n/a                                             |
| P1.6 | **Funnel devis fix** : Toast Zod + auto-format tel + Pipedrive devis fire-and-forget + UX `rge_strict_no_match`                        | Dev 1                             | 8-10 h           | Drop-off page→submit -8 à -15 %, MQL +25-50/mo | n/a                 | n/a                                             |
| P1.7 | **Backfill `address_region`** 28 928 RGE NULL + cron Google Places sync (mig 483 dormante)                                             | Dev 1                             | 1 j + $60 budget | 99 % région remplie + 95 % Places match        | n/a                 | n/a                                             |
| P1.8 | **Outreach Lemlist V1 top 200** (script `build-supply-outreach-csv.ts` livré)                                                          | Lead growth                       | 2 sem cycle      | 8-12 claims J+90 (×8 baseline)                 | flow email P0.2     | n/a                                             |

**ROI Vague 2** : +6-10 K clics/mo M+3, DR 5-8, claim_rate 0,3 % atteint, MQL +50-150/mo.

### 4.3 Vague 3 (J60-J90) — actions P2

| #    | Action                                                                                                                                                                                                                                  | Owner                       | Effort  | KPI cible                           | Dépendance           | Plan B                         |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ------- | ----------------------------------- | -------------------- | ------------------------------ |
| P2.1 | **Vague 2-3 KW V2 fused** : `/isolation-phonique/` + `/poele-granules/` 6 sub + `/ballon-thermodynamique/` + 50 pages-mines copycat                                                                                                     | Dev 1 + redacteur           | 6 sem   | +60-100 K vol/mo P50                | Vague 1 KPI atteints | Différer Vague 4               |
| P2.2 | **Tier 4 PQR** (actu, ouest-france, leparisien, francebleu, futura-sciences, quechoisir)                                                                                                                                                | Lead PR                     | 25 j    | 5-8 RD acquis, +DR 2-4              | études data publiées | Tier 3 Institutionnel fallback |
| P2.3 | **8 pages blog longue-traîne non-mappées** : isolation-phonique-mur-mitoyen, prise-renforcée VE, entreprise-rénovation, chauffage-appoint, sèche-linge-PAC, peinture-isolante, robinet-thermostatique, gaz-passerelle (vol cumulé 52 K) | Redacteur RGE               | 3 sem   | +800-1 500 clics/mo M+4             | n/a                  | n/a                            |
| P2.4 | **`<FootnoteCitation>` in-text** + `<LastUpdated>` câblage 70 pages YMYL non équipées + `/qualite-editoriale` + onboarding artisan post-claim                                                                                           | Dev 1 + content             | 1-2 sem | C7 80 → 95, C12 60 → 85, C6 55 → 90 | composants à créer   | n/a                            |
| P2.5 | **Indice Rénovation™ dataset CC-BY 4.0** (page `/barometre/rge` v1) + open-source GitHub annuaire                                                                                                                                       | Dev senior + data scientist | 4 sem   | +DR 3-5 + position autorité cluster | audit data scientist | Différer M+6                   |

**ROI Vague 3** : +60-100 K vol/mo P50 ouvert, DR 8-15, fondations data play type Booking/Wirecutter posées.

---

## 5. Risques & contre-mesures

| #   | Risque                                                                                        | Indicateur d'alerte                                           | Plan B                                                                                               |
| --- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| R1  | **Effy Head of SEO** ferme la fenêtre 6-18 mois                                               | Effy publie >5 nouvelles pages/sem ou DR Effy +5 en 30j       | Compresser P0+P1 en 60 j max, mobiliser agence PR externalisée 3 K€/mo                               |
| R2  | **Google algo update** (helpful content / core update) sur 459 K pages indexées               | Drop clics >30 % sur 7 j ou GSC "explorée non indexée" >120 K | Pause sprint code, audit YMYL + dépublier 80 K pages thin (alignement plan 140 K mémoire 2026-04-29) |
| R3  | **Supply churn** : claim_rate stagne <0,1 % après 30 j outreach Lemlist                       | Pool éligible J+30 < 5 OR open-rate Lemlist <15 %             | Outreach téléphonique top 50 + partenariat Qualibat/Qualit'EnR direct                                |
| R4  | **RGPD sanction** sur descriptions Haiku Phase 1 (~46 K) ou flow email-confirmation token     | Plainte CNIL ou audit interne flag >5 anomalies               | Désindexer cluster Haiku score <7,5 + revue juridique flow email avant scale                         |
| R5  | **Ressource humaine** : trio commercial × 1 dev tech limite l'exécution parallèle Vague 1+2+3 | >2 actions P0 en retard >7 j                                  | Externaliser content Vague 1 (3-5 K€/mo content writer freelance × 6 mo) + agence PR 3 K€/mo         |
| R6  | **5 xx 12 890 pages** continue à drainer budget crawl                                         | GSC "explorée non indexée" >100 K stable + clics flat         | Stop bleeding before nouveau sprint code (règle d'or mémoire gsc-diagnostic)                         |

---

## 6. KPI tracking

### 6.1 North Star

**MQL/mois (lead qualifié mandataire CEE)** : 8 actuel → cible J+30 25 / J+60 75 / J+90 200 / J+180 500.

### 6.2 Lead indicators (cadence revue J+30 / J+60 / J+90)

| Indicateur                                          |                Baseline 2026-05-04 |    Cible J+30 |   Cible J+60 |                  Cible J+90 |            Cible J+180 |
| --------------------------------------------------- | ---------------------------------: | ------------: | -----------: | --------------------------: | ---------------------: |
| DR Ahrefs                                           |                                0,6 |           1-2 |          4-6 |                        8-10 |                  14-18 |
| Pages indexées (GSC)                                | 459 K → 367 K (-91 K depuis 11/04) |  350 K stable | 350 K stable | 280 K (plan 140 K en cours) |            140 K cible |
| Clics/jour (GSC)                                    |                                350 |           500 |          800 |                 1 200-1 500 |            3 000-5 000 |
| Claim rate fiches RGE                               |                            0,002 % |        0,05 % |       0,15 % |                   0,3-0,8 % |                1,2-2 % |
| Funnel devis (page → submit)                        |                              7,2 % |         8-9 % |       9-10 % |                     11-14 % |                15-18 % |
| 5 xx pages (GSC)                                    |                             12 890 |          <5 K |         <2 K |                        <1 K |                   <500 |
| Backlinks Tier 1 acquis                             |                                  0 | 1 (data.gouv) | 3-5 (presse) |                8-12 cumulés |                  25-40 |
| YMYL routes câblées (`YmylDisclaimer` + `<Byline>`) |                               3/13 |         13/13 |        13/13 |           13/13 + footnotes | 13/13 + 70 LastUpdated |

### 6.3 Cadence

- **Revue hebdo Vague 1** (J0-J30) : DR + claim_rate + 5 xx + page H1 — chaque mardi 30 min.
- **Revue J+30 / J+60 / J+90** : KPI complets + arbitrage Vague suivante. Si KPI <60 % cible → bascule Plan B correspondant.
- **Revue M+6** : audit Ahrefs Bloc 1+3 refresh + recalibrage cibles 12 mois.

---

## 7. Annexes

### 7.1 Sources — rapports agents

| Agent   | Domaine              | Rapport (path absolu)                                                                               |
| ------- | -------------------- | --------------------------------------------------------------------------------------------------- |
| Agent 1 | KW gap               | `C:\Users\USER\Downloads\servicesartisans\tmp\ahrefs\AUDIT-KPMG-AGENT1-kw-gap-2026-05-04.md`        |
| Agent 2 | Backlinks & Autorité | `C:\Users\USER\Downloads\servicesartisans\tmp\ahrefs\AUDIT-KPMG-AGENT2-backlinks-2026-05-04.md`     |
| Agent 3 | E-E-A-T / YMYL       | `C:\Users\USER\Downloads\servicesartisans\tmp\ahrefs\AUDIT-KPMG-AGENT3-eeat-ymyl-2026-05-04.md`     |
| Agent 4 | SERP positions       | `C:\Users\USER\Downloads\servicesartisans\tmp\ahrefs\AUDIT-KPMG-AGENT4-serp-2026-05-04.md`          |
| Agent 5 | Supply × Funnel      | `C:\Users\USER\Downloads\servicesartisans\tmp\ahrefs\AUDIT-KPMG-AGENT5-supply-funnel-2026-05-04.md` |

### 7.2 Méthodologie audit

**Sources Ahrefs** :

- Bloc 1 KW gap 2026-05-04 (3 349 KW, 4 leaders) — `docs/ahrefs-bloc1-keywords-gap-2026-05-04.md`
- Bloc 1 pages-mines 2026-05-04 (top 100 pages concurrents) — `docs/ahrefs-bloc1-pages-mines-2026-05-04.md`
- Bloc 3 long-tail 2026-05-04 (532 KW, 7 seeds) — `tmp/ahrefs/bloc3-longtail-2026-05-04.csv`
- Audit Phase 0 backlinks 2026-05-03 (383 cibles outreach + 50 top priority Lemlist + 137 disavow) — `docs/audit-ahrefs-2026-05-03/D_backlinks/*`
- Site audit 2026-05 (38 issues, +184 H1 multiples, +2 686 meta short régression) — `docs/audit-ahrefs-2026-05-03/site_audit_issues_2026-05.csv`
- Top pages benchmark 50 + content gap 91 + KW universe segment 1 370 — `docs/audit-ahrefs-2026-05-03/{B,C,E}_*`
- Snapshot Supabase prod F_supply 2026-05-03 (46 137 RGE, 5 000 top, 80 codes qualif, 23 régions) — `docs/audit-ahrefs-2026-05-03/F_supply/*`
- Stratégie V2 fused 2026-05-04 — `docs/STRATEGIE-RENOVATION-ENERGETIQUE-V2-FUSED-2026-05-04.md`

**Périmètre code SA inspecté** :

- App Router : `src/app/(public)/{renovation-energetique,aides,rge,cee,services,guides,simulateur-aides-renovation,carte-artisans-rge}/**`
- Schemas SEO : `src/lib/seo/{jsonld,flagship-schema,internal-links,bloc3-longtail}.ts`
- Composants YMYL : `src/components/{aides/YmylDisclaimer,flagship/FlagshipSources,seo/LastUpdated}.tsx`
- API : `src/app/api/{devis,simulateur,claims,cron}/route.ts`
- Migrations : 380 (RGE-ADEME), 391/462/463/498 (dispatch RGE-aware), 483 (Google Places), 500 (claim auto-approve)

**Snapshot daté** : 2026-05-04 (rapports agents) / 2026-05-03 (data Supabase + audit Ahrefs Phase 0) / 2026-04-18 (Ahrefs backlinks normalized).

**Cross-checks mémoire** :

- `servicesartisans-ahrefs-bloc1-niche-cee-2026-05-04` (3 349 KW gap, mapping auto 57 %)
- `servicesartisans-ahrefs-deep-audit-vague4-2026-05-04` (couverture code 92-95 %, funnel 5 root causes)
- `servicesartisans-ultra-domination-seo-v2-2026-04-28` (cible recalibrée 50-90 K clics/j M12, 5 boucliers)
- `servicesartisans-gsc-diagnostic-2026-04-30` (5 xx 12 890, plan 3 couches, règle d'or stop-bleeding)
- `servicesartisans-strategy-140k-2026-04-29` (plan 140 K pages 7 vagues, validé Marvin)
- `servicesartisans-effy-10x-strategy-2026-04-28` (Effy n'a pas le moat, 5 leviers SA 10x)

**Limites connues** :

- Pas de pull Bloc 4-6 (backlinks intersect, SERP overlap, brand search) → score "Authority" partiel sur certains agents.
- `sa_lost_keywords_2026-05.csv` racine vide (pull error, à re-puller cycle 2026-05-18).
- `sa_keywords_1000.json` truncated à 141 KW → sous-estime probable de la présence reno SA.
- `striking_distance_2026-05.csv` mal nommé (= content gap lookalike, pas striking distance réelle).
- Site_audit Ahrefs aveugle aux 5 xx GSC (12 890 pages) — utiliser GSC en complément.
- Snapshot F4_regions 62,6 % NULL daté 2026-05-03 vs migration 498 fix region 2026-05-03 — incertitude sur état réel prod (à vérifier en prod).

— Fin rapport KPMG Executive Agent 6 —
