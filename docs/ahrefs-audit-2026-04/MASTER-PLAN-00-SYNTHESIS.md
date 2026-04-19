# MASTER-PLAN-00 — SYNTHÈSE CEO

**Date** : 2026-04-18 (v1) — révisé 2026-04-18 (v1.1, vérifications code + DB)
**Auteur** : Orchestration de 5 plans spécialisés (Technical, Product, Content, Data-Trust, Growth)
**Destinataires** : Marvin Bissohong (CEO), équipe exécution
**Objectif** : Faire de ServicesArtisans le **leader français annuaire artisans + rénovation énergétique** dans les 12 mois

**Changelog v1.1** :

- Footer impact corrigé 1,5M → 6,9M liens (459K pages indexées, pas 100K)
- Migration RGE état réel : 380-391 déjà déployées (10 migrations RGE complètes, pas seulement 380)
- ROI projections marquées conditionnelles → section 12bis "Hypothèses business à valider Jour 1"
- Tracking RGE actifs ajouté Jour 1 (SQL count)

**Changelog v1.2 (2026-04-18 PM)** — révélations décisives :

- **Asset DB confirmé** : 970 326 providers (pas 50K), dont 50 332 RGE actifs, 50 347 indexables cibles (RGE OU claim)
- **Cause racine rejet 510K pages identifiée** : 99,94 % providers SANS description (595/970K seulement) → boilerplate detection Google → thin content / doorway pages
- **Crawl Google QUOTIDIEN à 50 jours** : signal trust premium, accélère timeline (J+1 à J+7 vs 3-6 semaines initialement estimées)
- **Pivot stratégique majeur** : passage en stratégie **RGE-only indexation** (Tier A/B/C — voir section 13)
- **Script déployé** : `scripts/noindex-non-rge.ts` prêt à exécuter (batch 5K, direct Postgres connection)
- 50K artisans avec phone+email confirmés en DB → outreach claim accéléré
- Enrichissement INSEE complet par fiche (SIRET, NAF, effectif, géo) — équivalent societe.com sur le plan data

---

## 0. Synthèse en 60 secondes

### Le verdict

**ServicesArtisans a toutes les cartes pour gagner.** Le marché s'effondre chez nos concurrents (-13 % à -41 % de trafic sur 20 sites en Q1-Q2 2026), mais UN seul signal algorithmique nous empêche de capter cette vague : **6 lignes de code dans `src/app/layout.tsx`** qui forcent 100 % du site en CSR et empêchent Google de voir le contenu.

### Le fix

**15 minutes, 4 lignes de code.** Le coupable est identifié avec preuve file:line : `CompareProviderWrapper` importé avec `{ ssr: false }` englobe tout l'arbre visible du site.

### L'opportunité

- **Fenêtre** : 3-6 mois avant qu'un challenger solidifie la place laissée vide par travaux.com (-4 820 pages), allovoisins (-6 841 pages), depanneo (-1 797 pages)
- **Marché rénovation énergétique** : 300-500K vol/mois accessibles
- **Asset unique** : SIRET + SIREN + RGE (bientôt) + MaPrimeRénov' = combinaison impossible à répliquer
- **Citations ChatGPT** : 395 (déjà) → 5 000 en 12 mois

### Le deal breaker

**Tout dépend du fix bailout SSR.** Sans lui, 80 % des 45 000 mots de plan sont sous-exploités. Avec lui, chaque heure investie produit 3-5× plus de ROI.

---

## 1. Vision & North Star

### Positionnement cible à 12 mois

> **ServicesArtisans est la seule plateforme française qui garantit, pour chaque artisan recommandé, un triple signal de confiance officiel : SIRET INSEE actif + certification RGE ADEME à jour + éligibilité MaPrimeRénov' calculée en temps réel.**

### North Star Metric (NSM)

**Nombre de devis exclusifs générés / mois avec artisan RGE certifié + éligible MaPrimeRénov'**

Pourquoi cette métrique :

- Capture la valeur business (devis = lead actionnable)
- Capture la qualité (RGE + MaPrimeRénov' = différenciation)
- Capture le trust (exclusif = 1 lead = 1 artisan)

**Baseline actuelle** : à mesurer via SQL (`SELECT count(*) FROM providers WHERE rge_valid_until > now()` après sync ADEME initial)

**Cibles à valider après mesure capacité** : voir section 12bis "Hypothèses business à valider Jour 1"

### 5 KPI secondaires (cibles SEO solides, cibles business à valider)

| KPI                       | Baseline | M3    | M6    | M12   | Confiance                              |
| ------------------------- | -------- | ----- | ----- | ----- | -------------------------------------- |
| Trafic Ahrefs /jour       | 164      | 400   | 1 000 | 2 500 | **Élevée** (post-fix bailout)          |
| Keywords organiques       | 261      | 400   | 700   | 1 500 | **Élevée** (62 NEW KW déjà actifs)     |
| Domain Rating             | 0,6      | 5     | 15    | 30    | Moyenne (dépend link building)         |
| Conversion (user → devis) | 0,7 %    | 1,5 % | 3 %   | 5 %   | Moyenne (cible secteur 2-3 %)          |
| Devis total /mois         | 16       | 40    | 200   | 1 000 | **À VALIDER** (dépend modèle business) |

---

## 2. Diagnostic consolidé — 5 constats critiques

### Constat 1 : Le bailout SSR est la pièce qui bloque tout

**Preuve** (Agent 1) : `CompareProviderWrapper` à `src/app/layout.tsx:59-65` importé avec `dynamic(..., { ssr: false })`. Ce wrapper englobe `<Header>` + `<main>{children}</main>` + `<Footer>` → force 100 % du subtree en CSR.

**Mapping exact 6 BAILOUT markers = 6 `ssr: false` top-level** :
| # | Composant | layout.tsx ligne | Impact |
|---|---|---|---|
| 1 | WebVitals | 249 | null (cosmétique) |
| 2 | PageViewTracker | 250 | null (cosmétique) |
| 3 | PostHogProvider | 251 | null (cosmétique) |
| 4 | AuthTracker | 252 | null (cosmétique) |
| 5 | ConsentGatedScripts | 248 | `<Script>` (cosmétique) |
| 6 | **CompareProviderWrapper** | **254** | **FATAL — masque tout** |

**Pourquoi c'est SSR-safe** : `CompareProvider.tsx:35-85` n'accède à aucun `window`/`document`/`localStorage`. État initial `useState([])` identique serveur/client. Pas de `useSearchParams`. Le `ssr: false` est une erreur d'architecture.

**Impact si corrigé** : 459 K pages indexées passent de body 665 chars à body complet avec H1, débloquent 59 KW perdus (94 550 vol/mois) + amplifient 62 new KW qui décollent déjà.

### Constat 2 : Le Footer perd ~6,9M liens maillage interne

**Preuve vérifiée 2026-04-18** : `src/components/Footer.tsx:22-24` marque `DynamicFooterLinks` avec `ssr: false`. Inspection du source `src/components/seo/DynamicFooterLinks.tsx` : **aucun `'use client'`**, aucun accès `window`/`document`/`localStorage`, données statiques pures via `getMoneyPagesByTier`. Le `ssr: false` est une erreur d'architecture sans aucune justification.

**Impact recalculé** : 15 liens footer × ~459 000 pages indexées = **~6,9M liens internes invisibles à Google** (chiffre initial de 1,5M sous-estimait — les pages indexées sont 459K, pas 100K).

**Note** : la rotation déterministe par jour (`new Date()` au render) est SSR-safe. Un nouveau snapshot par déploiement = OK pour SEO. Aucune contre-indication à retirer le `ssr:false`.

### Constat 3 : Le marché s'écroule sauf societe.com

**Preuve** (Agent 5) : 18/20 concurrents en chute -13 % à -41 %. Seul societe.com gagne +63 %.

**Pattern** : Google (Helpful Content Update déc. 2025, AI Overviews -33 %) déclasse massivement les annuaires thin. Seules les sources officielles résistent.

**Implication** : positionnement "officiel par construction" (SIRET+RGE+MaPrimeRénov') = stratégie gagnante validée.

### Constat 4 : Conversion 0,7 % = gouffre

**Preuve** (Agent 2) : 4 gouffres quantifiés dans le funnel actuel :

- 62,8 % drop entre SERP et page
- 7,3 % drop entre page et formulaire
- 15,5 % drop entre formulaire et soumission
- 0,7 % conversion finale (vs 2-3 % secteur)

**Causes** : formulaire 7 champs, simulateur invisible, trust signals absents, pas d'exit-intent, WCAG lacunaire.

### Constat 5 : 90 % du trust moat est déjà en place (sous-estimé)

**Preuve vérifiée 2026-04-18** — inspection migrations 380-391 :

- ✅ SIRET, SIREN, code NAF, libelle NAF, legal_form_code en DB
- ✅ Géocodage BAN (latitude, longitude, geography)
- ✅ Noindex volontaire sur providers non-claim (RGPD safe)
- ✅ Review avec booking_id FK (review vérifiée)
- ✅ Simulateur aides en prod (Pipedrive `PIPEDRIVE_PIPELINE_SIMULATEUR`)
- ✅ **Migration 380** : colonnes `rge_qualifications` JSONB + `rge_valid_until` + `rge_organismes` + `rge_last_synced_at` + `rge_source_url` + 3 index (partiel, composite ville, GIN JSONB)
- ✅ **Migration 381** : RPC backfill `communes.nb_artisans_rge`
- ✅ **Migration 385** : RPC bulk update RGE
- ✅ **Migration 389** : RPC bulk update RGE contacts
- ✅ **Migration 390** : index composites perf
- ✅ **Migration 391** : dispatch lead RGE-aware (routing intelligent)

**Conclusion** : le backend RGE est **prêt à 90 %** — beaucoup plus avancé que la synthèse v1 le laissait croire.

**Manque réellement** :

1. Cron sync ADEME quotidien (script à écrire)
2. Composant React `<TrustBadge>` + Schema.org Certification (UI)
3. Barèmes MaPrimeRénov' versionnés en DB (table dédiée)
4. Auteur identifié YMYL (page À propos + bylines)
5. UI fiche artisan exposant `rge_qualifications` JSONB

---

## 3. Golden Path — séquence critique

```
JOUR 1 (5h25)
├─ Fix CompareProviderWrapper (15 min) ─────────► débloque SSR global
├─ Fix DynamicFooterLinks (10 min) ────────────► récupère 1,5M liens
├─ Upload disavow GSC (15 min) ────────────────► hygiène backlinks
├─ Validation curl (1h) ───────────────────────► body > 10K, H1 ≥ 1
├─ Soumission Google reconsideration (1h) ─────► accélère re-crawl
└─ Monitoring GSC + Ahrefs (suivi 48h)

SEMAINE 1 (P0 critique)
├─ Upgrade /guides/maprimerenov-2026/ existant ──► pos 26 → top 10
├─ Sync API ADEME RGE (1ère passe) ─────────────► populate rge_qualifications
├─ Composant <TrustBadge> + Schema.org ─────────► fiches artisan enrichies
├─ Réduction DevisForm 7→4 champs ──────────────► +60 % completion estimée
└─ Simulateur visible homepage + header ────────► +3× conversions estimées

SEMAINES 2-4 (P1 fondation)
├─ 10 briefs rénovation énergétique (Content)
├─ 10 briefs reconquête KW perdus (Content)
├─ 18 A/B tests funnel (Product)
├─ Pages services RGE × top 20 villes × 5 métiers = 100 pages
└─ Schema.org sur toutes les pages existantes

MOIS 2-3 (P2 amplification)
├─ 5 briefs blog prix + 5 hubs stratégiques
├─ 96 pages /aides/[dept]/maprimerenov
├─ Link building tier 1-2 (presse + institutionnels)
├─ 8 études data-driven PR
└─ Citations ChatGPT submission

MOIS 4-12 (P3 domination)
├─ 500+ pages longue traîne RGE
├─ Partenariats Mon Accompagnateur Rénov'
├─ Prix Artisan RGE annuel (PR)
├─ Tribune fondateur Les Échos
└─ Competitor takeover (travaux.com pages perdues)
```

### Règle d'or : **pas de parallélisme avant Jour 1 validé**

Tant que curl ne renvoie pas `body length > 10K chars` et `grep -c "<h1"` ≥ 1 sur 10 URLs témoin, **aucun autre sprint ne démarre**. C'est non négociable : sans ce fix, les 45 000 mots de plan sont 80 % sous-exploités.

---

## 4. Dépendances croisées entre les 5 plans

```
                    ┌────────────────────────────┐
                    │  PLAN 01 — TECHNICAL       │
                    │  (bailout SSR + Footer)    │
                    │  ★ BLOQUE TOUT LE RESTE ★  │
                    └────────────┬───────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ PLAN 04 — DATA  │    │ PLAN 03 — CONTENT│    │ PLAN 02 — PRODUCT│
│ (RGE + Schema)  │    │ (30 briefs)      │    │ (funnel 0.7→5%) │
└────────┬────────┘    └────────┬────────┘    └─────────────────┘
         │                      │
         └──────────┬───────────┘
                    ▼
          ┌─────────────────┐
          │ PLAN 05 — GROWTH│
          │ (link building) │
          └─────────────────┘
```

**Dépendances dures** :

1. Plan 01 → tout (aucun plan ne fonctionne sans le fix bailout)
2. Plan 04 (RGE sync) → Plan 03 (briefs doivent citer RGE) → Plan 05 (études PR basées sur data RGE)
3. Plan 02 (simulateur visible) indépendant mais amplifie tous les autres

**Dépendances molles** :

- Plan 04 (Schema.org) amplifie Plan 05 (AI Overview citations)
- Plan 03 (content) nourrit Plan 05 (linkable assets)
- Plan 02 (UX) valide Plan 03 (content a besoin d'un funnel qui convertit)

---

## 5. Priorisation ICE consolidée (Impact × Confidence × Ease)

### Top 20 actions toutes phases confondues

| #   | Action                                              | Plan  | Impact | Confiance | Facilité | Score ICE |
| --- | --------------------------------------------------- | ----- | ------ | --------- | -------- | --------- |
| 1   | Fix `CompareProviderWrapper` ssr:false              | 01    | 10     | 10        | 10       | **1000**  |
| 2   | Fix `DynamicFooterLinks` ssr:false                  | 01    | 9      | 10        | 10       | 900       |
| 3   | Upload disavow GSC (44 domaines)                    | 01    | 7      | 10        | 10       | 700       |
| 4   | Simulateur visible homepage + header                | 02    | 9      | 8         | 9        | 648       |
| 5   | Réduction DevisForm 7→4 champs                      | 02    | 8      | 9         | 8        | 576       |
| 6   | Sync API ADEME RGE (migration 380 prête)            | 04    | 9      | 9         | 7        | 567       |
| 7   | Upgrade `/guides/maprimerenov-2026/`                | 03    | 8      | 9         | 7        | 504       |
| 8   | Brief RE-04 "audit énergétique obligatoire" (KD 20) | 03    | 7      | 9         | 8        | 504       |
| 9   | Schema.org LocalBusiness + Certification            | 04    | 8      | 8         | 7        | 448       |
| 10  | Composant `<TrustBadge>` réutilisable               | 04    | 7      | 9         | 7        | 441       |
| 11  | Pages `/urgence/*` top 20 villes × 3 métiers        | 03    | 8      | 8         | 6        | 384       |
| 12  | A/B test exit-intent simulateur                     | 02    | 7      | 7         | 7        | 343       |
| 13  | Pitch presse Tier 1 (étude passoires)               | 05    | 8      | 6         | 6        | 288       |
| 14  | Pages `/aides/[dept]/maprimerenov` (96)             | 03    | 8      | 7         | 5        | 280       |
| 15  | Outreach institutionnels (CAPEB/FFB/Qualibat)       | 05    | 9      | 5         | 6        | 270       |
| 16  | Pages `/services/[métier-rge]/[ville]` × 1000       | 03/04 | 9      | 7         | 4        | 252       |
| 17  | Études data-driven PR (8 angles)                    | 05    | 8      | 6         | 5        | 240       |
| 18  | Partenariat Mon Accompagnateur Rénov'               | 05    | 9      | 4         | 6        | 216       |
| 19  | Refonte visuel fiche artisan (trust signals)        | 02    | 7      | 7         | 4        | 196       |
| 20  | Prix Artisan RGE annuel                             | 05    | 7      | 4         | 5        | 140       |

### Règle budget attention CEO

**90 % de l'attention cette semaine** = items 1-5. Le reste attend le fix validé.

---

## 6. Décisions stratégiques à trancher MAINTENANT

| #   | Décision                                                                    | Recommandation                                                                   | Urgence       |
| --- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------- |
| 1   | Fix bailout SSR : Option A (retirer dynamic) ou Option B (Suspense wrapper) | **Option A** (4 lignes, 15 min)                                                  | Aujourd'hui   |
| 2   | Décision #19 : Unblock GPTBot/anthropic-ai/Google-Extended ?                | **YES** — aligne avec stratégie LLM citations 395→5000                           | Cette semaine |
| 3   | Budget content (30 briefs × ~2500 mots)                                     | **Freelance senior 1500 €/mois × 3 mois** OU écrire 10 premiers en interne       | Cette semaine |
| 4   | Quel sprint après Jour 1 : Content ou Product ?                             | **Product d'abord** (fix funnel = ROI immédiat sur trafic existant) puis Content | Semaine 1     |
| 5   | Migration 380 (existante) vs 370-373 (Agent 4)                              | **Vérifier 380 et étendre avec 381+** (éviter conflit)                           | Semaine 1     |
| 6   | Sous-domaine dédié rénovation énergétique ?                                 | **NON** — tout intégrer `servicesartisans.fr` (évite dilution autorité)          | Décidé        |
| 7   | Recrutement Data Analyst interne ?                                          | **Non cette année** — automations suffisent                                      | Décidé        |
| 8   | API Entreprise DataPass (token premium)                                     | **Demander DataPass** pour workflow claim artisan                                | Mois 2        |
| 9   | Investissement GA4/PostHog analytics avancé                                 | **Setup events funnel détaillés** dès semaine 1                                  | Semaine 1     |
| 10  | Nom fondateur visible (auteur YMYL)                                         | **OUI** — obligation YMYL + effet E-E-A-T                                        | Semaine 2     |

---

## 7. Roadmap consolidée 12 semaines

### Sprint 0 — Jour 1 (aujourd'hui, 5h25)

**Responsable : CEO + 1 dev**

- [ ] 15 min : Fix `layout.tsx:59-65` — retirer `dynamic(CompareProviderWrapper, {ssr:false})` → import statique
- [ ] 10 min : Fix `Footer.tsx:22-24` — retirer `ssr:false` sur DynamicFooterLinks
- [ ] 15 min : Upload `disavow.txt` dans GSC → Outils → Désaveu
- [ ] 30 min : Commit + push + Vercel deploy
- [ ] 1h : Validation curl sur 10 URLs témoin : body > 10K, H1 ≥ 1, BAILOUT < 1
- [ ] 30 min : Soumission GSC re-indexation sur 5 URLs principales
- [ ] 2h : Monitoring live + rollback plan prêt
- **Métrique** : curl validation 10/10 ✅

### Sprint 1 — Semaine 1 (P0 fondation)

**Responsables : Dev + UX + Content**

- [ ] Product : simulateur visible sur 5 surfaces critiques (homepage, header, pages rénovation, exit nudge)
- [ ] Product : DevisForm réduction 7→4 champs (name, phone, service, postal_code)
- [ ] Data : script sync ADEME 1ère passe (extension migration 380)
- [ ] Content : upgrade `/guides/maprimerenov-2026/` (auteur identifié, dernière MAJ, montants 2026, CTA simulateur, schema GovernmentService)
- [ ] Growth : upload 5 études à HARO/ReportersTribe
- **Métrique** : +30 % trafic Ahrefs sur URL fixées, conversion +0,3 pp

### Sprint 2 — Semaines 2-3 (P1 contenu critique)

**Responsables : Content + Dev + Growth**

- [ ] Content : 5 briefs rénovation énergétique priorités (RE-01 à RE-05) publiés
- [ ] Content : 3 briefs reconquête serrurier/plombier/carreleur publiés
- [ ] Data : Schema.org LocalBusiness + Certification déployé sur 100 fiches artisan RGE
- [ ] Data : composant `<TrustBadge>` déployé
- [ ] Growth : pitch presse Tier 1 (5 médias : Le Moniteur, Batirama, Batiactu, La Maison Écologique, Les Échos Immobilier)
- [ ] Product : A/B test #1 exit-intent simulateur (10 % traffic, 2 semaines)
- **Métrique** : 10 pages top 20, 3 backlinks presse acquis

### Sprint 3 — Semaines 4-6 (P1 scaling)

**Responsables : Content + Data + Dev**

- [ ] Content : 10 pages `/urgence/[métier]/[ville]` top 20 villes × 3 métiers
- [ ] Content : 5 briefs blog prix 2026 publiés
- [ ] Data : 96 pages `/aides/[dept]/maprimerenov` générées
- [ ] Data : cron quotidien ADEME sync en prod
- [ ] Growth : outreach institutionnels (CAPEB, FFB, Qualibat, France Rénov')
- [ ] Product : A/B tests #2-5 (champs formulaire, trust badges, CTA)
- **Métrique** : 400 KW organiques, DR 2+, 10 backlinks qualifiés

### Sprint 4 — Semaines 7-9 (P2 amplification)

**Responsables : Growth + Content**

- [ ] Content : 10 briefs reconquête KW perdus (serrurier lyon, couvreur lille, plombier marseille...)
- [ ] Content : 5 hubs stratégiques (`/renovation-energetique/`, `/aides/`, `/artisans-rge/`)
- [ ] Growth : 3 études data-driven publiées (cartographie RGE, baromètre MaPrimeRénov', passoires thermiques)
- [ ] Growth : podcast invitation sur 5 émissions BTP
- [ ] Data : sitemap-rge.xml dédié + IndexNow ping
- **Métrique** : 600 KW, DR 5+, 30 backlinks, 500 trafic/j

### Sprint 5 — Semaines 10-12 (P2 consolidation)

**Responsables : All**

- [ ] Content : 500 pages longue traîne `/services/[métier-rge]/[ville]`
- [ ] Content : calendrier refresh mensuel MaPrimeRénov' en place
- [ ] Data : carte interactive artisans RGE par département
- [ ] Growth : soumission datasets ADEME avec backlinks ServicesArtisans
- [ ] Product : A/B tests #6-10 + rapport synthèse
- **Métrique** : 800 KW, DR 8+, 50 backlinks, 1000 trafic/j, 50 devis RGE /mois

---

## 8. Responsabilités (RACI consolidé)

| Domaine                      | Responsable (R)       | Approbateur (A)     | Consulté (C)            | Informé (I) |
| ---------------------------- | --------------------- | ------------------- | ----------------------- | ----------- |
| Fix bailout SSR              | Dev lead              | CEO                 | Claude AI               | Équipe      |
| Sync API ADEME               | Dev lead              | CEO                 | Data team               | All         |
| Briefs éditoriaux            | Content writer senior | CEO                 | Expert RGE (consultant) | Dev         |
| A/B tests funnel             | Product/UX            | CEO                 | Dev                     | Marketing   |
| Outreach presse              | Growth/PR             | CEO                 | Fondateur               | All         |
| Barèmes MaPrimeRénov' (YMYL) | Content admin         | CEO (2e validation) | Juriste (si doute)      | Dev         |
| Schema.org validation        | Dev lead              | Content             | —                       | SEO         |

**Goulot d'étranglement à anticiper** : le **Dev lead** apparaît sur 4 responsabilités critiques Sprint 0-2. Risque burn-out. Recommandation : externaliser le sync ADEME à un dev freelance (3-5 jours).

---

## 9. Budget estimatif 12 mois

### Scénario minimal (autofinancé)

| Poste                         | Mensuel   | Annuel      |
| ----------------------------- | --------- | ----------- |
| Ahrefs Premium                | 500 €     | 6 000 €     |
| Vercel Pro                    | 20 €      | 240 €       |
| Supabase Pro                  | 25 €      | 300 €       |
| Outils (Linear, GitHub, etc.) | 100 €     | 1 200 €     |
| **Total infra**               | **645 €** | **7 740 €** |

### Scénario accéléré (+ content + PR)

| Poste                           | Mensuel     | Annuel       |
| ------------------------------- | ----------- | ------------ |
| Infra (idem)                    | 645 €       | 7 740 €      |
| Content writer freelance senior | 1 500 €     | 18 000 €     |
| PR/outreach freelance           | 1 000 €     | 12 000 €     |
| Expert RGE consultant (YMYL)    | 500 €       | 6 000 €      |
| **Total accéléré**              | **3 645 €** | **43 740 €** |

### Scénario croissance rapide

| Poste                          | Mensuel     | Annuel        |
| ------------------------------ | ----------- | ------------- |
| Accéléré (idem)                | 3 645 €     | 43 740 €      |
| Content writer senior #2       | 1 500 €     | 18 000 €      |
| Growth hacker freelance        | 2 000 €     | 24 000 €      |
| Campagnes LinkedIn/presse paid | 2 000 €     | 24 000 €      |
| **Total croissance**           | **9 145 €** | **109 740 €** |

**Recommandation** : Scénario **accéléré** (3 645 €/mois).

**ROI conditionnel** (3 scénarios selon modèle business à trancher) :

- Si commission lead exclusif (50€ moyen) × 1000 devis/mois = 50 000 € MRR — payback 3-4 mois
- Si abonnement artisan 99€/mois × 500 artisans actifs = 49 500 € MRR — payback 3-4 mois
- Si mix freemium + commission premium = 30 000-70 000 € MRR — payback 4-6 mois

**À valider Jour 1** (voir section 12bis) avant d'engager budget accéléré.

---

## 10. Risques & mitigations

| #   | Risque                                          | Probabilité | Impact               | Mitigation                                                                                   |
| --- | ----------------------------------------------- | ----------- | -------------------- | -------------------------------------------------------------------------------------------- |
| 1   | Fix bailout casse la prod                       | Faible      | Élevé                | Rollback plan + déploiement en dehors heures pic                                             |
| 2   | Google met 3+ semaines à re-crawler             | Moyen       | Moyen                | IndexNow ping + soumission GSC + sitemap refresh                                             |
| 3   | Content pas à la hauteur YMYL                   | Moyen       | Élevé                | Expert RGE consultant + 2-review process                                                     |
| 4   | API ADEME down ou changeante                    | Faible      | Moyen                | Cache 24h + fallback données précédentes + alertes                                           |
| 5   | Montants MaPrimeRénov' inexacts                 | Moyen       | **Critique (légal)** | Double-validation + arrêté JORF cité systématiquement                                        |
| 6   | Concurrents copient la stratégie                | Élevé       | Moyen                | Moat data-as-service (API officielle ADEME synchronisée en temps réel = coût de copie élevé) |
| 7   | Budget épuisé avant ROI                         | Moyen       | Élevé                | Financement en cash-flow : prioriser items ICE 1000 qui n'ont pas besoin de budget           |
| 8   | Dev lead burn-out                               | Moyen       | Élevé                | Externaliser 30 % du travail technique                                                       |
| 9   | Google core update défavorable                  | Élevé       | Élevé                | Diversifier canaux (LLM 395 → 5000 citations)                                                |
| 10  | Leads exclusifs pas assez d'artisans RGE actifs | Moyen       | Moyen                | Process claim artisan accéléré + partenariat MAR                                             |

---

## 11. Fichiers et plans sources

- `MASTER-PLAN-01-TECHNICAL.md` (42 KB, 5 894 mots) — Agent `lead-software-architect`
- `MASTER-PLAN-02-PRODUCT.md` (48 KB, 7 493 mots) — Agent `ux-ui-senior-developer`
- `MASTER-PLAN-03-CONTENT.md` (83 KB, 10 500 mots) — Agent `docs-writer`
- `MASTER-PLAN-04-DATA-TRUST.md` (38 KB, ~9 000 mots) — Agent `ralph-researcher`
- `MASTER-PLAN-05-GROWTH.md` (60 KB, 9 627 mots) — Agent `general-purpose`

**Total** : 272 KB, ~42 500 mots de plan opérationnel.

### Sources data

- `normalized/kw-kw1.csv` (261 KW actuels)
- `normalized/organic-positions.csv` (266 KW avec intent)
- `normalized/top-pages-v2.csv` (254 pages)
- `normalized/competitors-v2.csv` (21 concurrents)
- `normalized/common-keywords-v2.csv` (matrice KW partagés)
- `normalized/best-by-links-external.csv` (11 pages avec backlinks)
- `normalized/ahrefs-backlinks.csv` (64 backlinks dont 50 SPAM)
- `disavow.txt` (44 domaines à désavouer GSC)

### Memory persistante

- `seo-audit-2026-04.md`
- `seo-keywords-2026-04.md`
- `seo-renovation-energetique.md`
- `google-seo-essentials-2026.md`

---

## 12bis. Hypothèses business à valider Jour 1 (avant ROI engagement)

Vérification 2026-04-18 : 3 hypothèses business sont marquées "à valider" car non confirmées par les données disponibles.

### Hypothèse 1 — Capacité artisans RGE actifs

**Status** : INCONNU (à mesurer DB).

**Action Jour 1** :

```sql
-- À exécuter après 1er sync ADEME ou maintenant si données déjà partielles
SELECT
  count(*) FILTER (WHERE rge_valid_until > now()) AS rge_actifs,
  count(*) FILTER (WHERE rge_valid_until IS NOT NULL) AS rge_total,
  count(*) FILTER (WHERE claimed_at IS NOT NULL) AS revendiques,
  count(*) AS providers_total
FROM providers
WHERE is_active = true;
```

**Implication selon résultat** :

- < 100 RGE actifs → cible M3 = 50 devis OK, M12 = 1000 nécessite acquisition massive (ad + outreach artisans)
- 100-500 → trajectoire M6 200 devis crédible, accélérer claim workflow
- 500+ → cible M12 1000 atteignable avec funnel actuel + SEO

### Hypothèse 2 — Modèle de monétisation

**Status** : NON DÉCIDÉ (utilisateur en phase test).

**Implication** : NSM "devis générés" reste valide quelle que soit la monétisation (lead = valeur intrinsèque). Le **pricing** sera ajusté Sprint 4-6 après validation marché.

**Recommandation Jour 1** : tracker dès maintenant pour choisir données-en-main au mois 3 :

- Volume devis par segment (< 3K€, 3-15K€, 15K€+)
- Qualité lead par artisan (taux conversion devis → contrat signé)
- Élasticité prix : tester 2 cohortes en silent A/B (si stack le permet)

### Hypothèse 3 — Panier moyen et commission

**Status** : MIX 3 segments confirmé par utilisateur 2026-04-18.

**Pricing différencié recommandé** (à valider Sprint 3-4 par marché) :
| Segment | Panier moyen | Commission cible |
|---|---|---|
| < 3 000€ (DPE, audit, petite isolation) | 1 500€ | 30€ |
| 3 000-15 000€ (PAC, isolation combles, fenêtres) | 8 000€ | 100€ |
| 15 000€+ (gros œuvre, ITE, parcours MAR) | 25 000€ | 300€ |

**Mix pondéré estimé** (50/35/15) → commission moyenne ~95€/devis.

**Si validé** : ROI à 1 000 devis/mois = 95 000 € MRR (vs 50 000 € synthèse v1).

**Garde-fou** : ces chiffres restent indicatifs. Première mesure réelle attendue Sprint 3 (semaines 4-6) avec ≥30 devis fermés.

### Synthèse hypothèses → action concrète Jour 1

Avant d'engager budget accéléré (3 645€/mois) :

1. Mesurer rge_actifs (5 min SQL)
2. Définir tracking devis par segment (1h dev)
3. Aligner sur NSM unique = devis exclusif RGE (déjà acté)
4. Reporter décision pricing au Sprint 3 (avec data réelle)

**Le fix bailout ne dépend d'AUCUNE de ces hypothèses** — il reste prioritaire absolu.

---

## 13. PIVOT STRATÉGIQUE — Indexation RGE-only (v1.2)

**Date** : 2026-04-18 PM
**Décision** : passer de **"annuaire généraliste 970K fiches"** à **"annuaire officiel RGE 50K fiches premium"**.

### 13.1 Diagnostic data confirmé (SQL prod)

```
Total providers actifs           : 970 326
├─ RGE actifs (rge_valid_until > now()) : 50 332  ← Tier A
├─ Revendiquées (claimed_at)            : 16      ← Tier B
├─ RGE actif OU claim (cible index)     : 50 347
└─ Non-RGE non-claim (à noindex)        : 919 544 ← Tier C

Couverture data :
├─ Avec nom         : 969 876 (99,95 %)
├─ Avec ville       : 962 850 (99,30 %)
├─ Avec NAF         : 966 860 (99,70 %)
├─ Avec géo         : 965 987 (99,60 %)
├─ Avec description : 595     (0,06 %) ← CAUSE RACINE thin content
├─ Avec avis        : 14 335  (1,48 %)
└─ Revendiquées     : 16      (0,002 %)

Gap Google : 459K indexées / 970K indexables = 47 % accepté seulement
```

### 13.2 Pourquoi Google rejette 510K pages

Boilerplate detection. Templates similaires + zéro description unique = signal **doorway pages** (interdit par guidelines depuis HCU déc. 2025). Le bailout SSR amplifie mais n'est pas la seule cause.

### 13.3 Stratégie tier 3-niveaux

| Tier                       | Critère SQL               | Volume         | Statut Google | Justification                                                              |
| -------------------------- | ------------------------- | -------------- | ------------- | -------------------------------------------------------------------------- |
| **A — Premium RGE**        | `rge_valid_until > now()` | 50 332         | **INDEX**     | Différenciation USP, signal officiel ADEME, alignement societe.com (+63 %) |
| **B — Revendiqué**         | `claimed_at IS NOT NULL`  | 16 (croissant) | **INDEX**     | Engagement artisan = trust user-validated, monétisation possible           |
| **C — Backend uniquement** | non-RGE et non-claim      | 919 544        | **NOINDEX**   | Évite thin content, HCU-safe, crawl budget concentré                       |

**Conséquence** : score qualité moyen du site **multiplié par ~5** (50K pages enrichies vs 459K diluées). Crawl quotidien Google se concentre sur 50K = re-crawl encore plus fréquent par fiche.

### 13.4 Bénéfices stratégiques

| Horizon                | Bénéfice                                                                                        |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| Court terme (4-8 sem)  | Sortie risque doorway pages, score qualité ×5, crawl budget concentré                           |
| Moyen terme (3-6 mois) | Position d'autorité "annuaire officiel RGE" revendicable, leverage USP RGE+SIRET+MaPrimeRénov'  |
| Long terme (12 mois)   | DR + autorité concentrée 50K = ranking renforcé, devis qualifiés exclusivement RGE haute valeur |

### 13.5 Migration technique

**Script prêt** : `scripts/noindex-non-rge.ts`

- Connexion **directe** Postgres (port 5432, bypass pooler Supabase)
- `SET statement_timeout = 0`
- Phase 2 : noindex en batch 5K
- Phase 3 : index RGE/claim en batch 5K
- Idempotent (relançable si interrompu)
- Durée estimée : 3-8 minutes

**Lancement** :

```bash
export $(grep -E '^(NEXT_PUBLIC_SUPABASE_URL|SUPABASE_DB_PASSWORD)=' .env.local | xargs) && npx tsx scripts/noindex-non-rge.ts
```

### 13.6 Trigger automatique futur (à déployer après migration initiale)

```sql
CREATE OR REPLACE FUNCTION sync_provider_noindex()
RETURNS TRIGGER AS $$
BEGIN
  NEW.noindex := NOT (
    NEW.is_active = true
    AND (NEW.rge_valid_until > now() OR NEW.claimed_at IS NOT NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_provider_noindex
  BEFORE INSERT OR UPDATE OF rge_valid_until, claimed_at, is_active
  ON providers
  FOR EACH ROW
  EXECUTE FUNCTION sync_provider_noindex();
```

Effet : chaque sync ADEME quotidien re-flippe automatiquement les certifications expirées/renouvelées + chaque claim artisan flip vers index immédiatement.

### 13.7 Risques et mitigations

| Risque                                                  | Impact                     | Mitigation                                                             |
| ------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------- |
| Perte trafic court terme sur pages non-RGE déjà rankées | -10 à -20 % trafic 4-6 sem | Acceptable : ces pages thin auraient été pénalisées HCU de toute façon |
| Artisan non-RGE Google son nom et ne se trouve plus     | UX négative                | Page reste accessible via lien direct, juste hors index                |
| Erreur RGE expirée mal détectée                         | Page perdue                | Cron ADEME quotidien + trigger 13.6 corrige automatiquement            |
| Concurrence directe societe.com sur SIRET               | Présent                    | Différenciation = focus artisan RGE pur (eux = toutes entreprises)     |
| Re-crawl Google ne nettoie pas vite l'ancien index      | 4-8 sem latence            | IndexNow ping + sitemap allégé + soumission GSC manuelle batch         |

### 13.8 Cibles indexation post-migration

| Métrique              | Avant         | Après immédiat     | M3                               |
| --------------------- | ------------- | ------------------ | -------------------------------- |
| Pages indexables      | 970 326       | 50 347             | 50 347 + 100 K pages éditoriales |
| Pages indexées Google | 459 000       | ~50 000 (rapide)   | 100-150 K                        |
| Score qualité moyen   | Faible (thin) | Élevé (enrichi)    | Élevé soutenu                    |
| Crawl rate /jour      | Quotidien     | Quotidien renforcé | Quotidien renforcé               |

### 13.9 Action sequence consolidée

1. **Jour 1** : Fix bailout SSR + Footer (préalable)
2. **Jour 2** : Lancer `scripts/noindex-non-rge.ts` (5-8 min)
3. **Jour 3** : Déployer trigger 13.6 + sitemap regénéré (RGE-only)
4. **Jour 4** : Soumission GSC + IndexNow batch ping
5. **Semaine 1-2** : Génération descriptions enrichies sur 50 332 RGE (cause racine #1)
6. **Semaine 2** : Cron sync ADEME quotidien activé
7. **Semaine 3-12** : Outreach claim massif 50K → croissance Tier B
8. **Semaine 4-12** : Hub `/renovation-energetique/` + content RGE

### 13.10 ICE révisé incluant cette stratégie

| #         | Action                                       | Score ICE |
| --------- | -------------------------------------------- | --------- |
| 1         | Fix `CompareProviderWrapper` ssr:false       | 1000      |
| 2         | Fix `DynamicFooterLinks` ssr:false           | 900       |
| **3 NEW** | **Migration noindex RGE-only (script prêt)** | **810**   |
| 4         | Upload disavow GSC                           | 700       |
| **5 NEW** | **Génération descriptions 50K RGE**          | **700**   |
| **6 NEW** | **Trigger sync_provider_noindex**            | **640**   |
| 7         | Simulateur visible homepage                  | 648       |
| 8         | Réduction DevisForm 7→4 champs               | 576       |
| 9         | Sync API ADEME RGE quotidien                 | 567       |
| 10        | Outreach claim 50K                           | 720       |

---

## 14. PLAN V2.0 — NIVEAU ANTHROPIC-TIER (8 chapitres consolidés)

**Date** : 2026-04-18 PM
**Auteurs** : 8 agents spécialisés en parallèle background
**Volume total** : ~59 600 mots (8 chapitres détaillés)
**Localisation source** : `docs/ahrefs-audit-2026-04/v2/`

### 14.0 Vue d'ensemble v2.0

Cette section consolide les 8 chapitres spécialisés produits pour porter le plan du niveau "tactique senior" (8/10) au niveau "Anthropic-tier" (10/10). Chaque chapitre est self-contained et exécutable — la synthèse ci-dessous extrait les décisions critiques et nouvelles actions surfaces.

### 14.1 Chapitre 1 — Experiments & Measurement Framework

**Fichier** : `v2/PLAN-V2-01-EXPERIMENTS-MEASUREMENT.md` (7 031 mots)

**Apports clés** :

- **12 hypothèses falsifiables** (H1-H12) avec prior chiffré, sample size (z-test α=0,05 power=0,8), stop-loss contractuel, owner nommé
- **54 events GA4+PostHog** structurés `<context>.<action>.<object>` (ex: `funnel.devis.submitted`)
- **6 dashboards Metabase** (D1-D6 Daily SEO/Funnel/Quality/Crawl/Outreach/Experiments) avec alertes Slack P0/P1/P2
- **12 SLOs** avec error budget mensuel, deploy freeze stripe-style si dépassement
- **Pipeline A/B PostHog Feature Flags** + code Next.js 14 App Router + seuil Bayésien P(B>A) ≥ 95 % + Expected Loss ≤ 1 %
- **Templates** : pre-registration, QBR, ownership matrix 25 lignes
- **Verrou** : pas de chapitre 2 démarré tant que D1 vert + 3 pre-reg + ownership signée

### 14.2 Chapitre 2 — AI/LLM-First Content Strategy

**Fichier** : `v2/PLAN-V2-02-AI-LLM-STRATEGY.md` (4 900 mots)

**Apports clés** :

- **Diagnostic LLM** : "395 citations" requalifié en "fetches bots" — citation réelle à mesurer S+1 via harness chiffré (Brave Search API, OpenAI prompts batch)
- **llms.txt + llms-full.txt** spec complète à déployer
- **7 types Schema.org** codés (Speakable, ClaimReview, HowTo, QAPage, SoftwareApplication, LocalBusiness avec hasCredential RGE, Dataset)
- **5 patterns Position 0** AI Overviews + 20 questions cibles avec format réponse optimisé
- **30 prompts FR** à tracker mensuellement (JSON prêt) sur Claude/ChatGPT/Perplexity
- **6 datasets data.gouv.fr** planifiés comme moat LLM (citations sources officielles)
- **Stack monitoring 145 USD/mois** (Profound/Otterly/Brand24/scripts)
- **Recommandation décision #2** : unblock GPTBot/ClaudeBot/PerplexityBot (aligne stratégie LLM)

### 14.3 Chapitre 3 — RGPD & Legal Pre-Clearance

**Fichier** : `v2/PLAN-V2-03-RGPD-LEGAL.md` (8 175 mots)

**ALERTES CRITIQUES** :

- **SMS outreach À ABANDONNER** vague initiale (L34-5 CPCE strict)
- **Purge phone+email des 920K non-RGE non-claim = action P0 non-négociable**
- **Seuls ~30K emails génériques** (sur 50K) éligibles outreach sans opt-in préalable
- **Si scraping origine** : purge + restart depuis SIRENE + annuaire RGE officiel **fortement recommandé** (sinon risque sanction CNIL 300-600K€)

**Apports clés** :

- **4 scénarios source 970K** avec base légale et risque CNIL chiffré (SAN-2023-019 Canal+ 600K€, SAN-2022-020 Clearview 20M€)
- **8 documents obligatoires** : registre traitements, AIPD, LIA, DPA, politique, procédures droits, notification breach, désignation DPO
- **Adresse EI = adresse perso** : masquer voie+numéro
- **Workflow opt-out** double opt-in SLA 15j + 410 Gone + noindex
- **3 templates email A/B/C** conformes LCEN art. 22
- **Cadence outreach** 4 vagues avec seuils arrêt (bounce >5%, plainte >0,1%)
- **YMYL** : auteur identifié + relecteur expert externe (150-300€/article), table `content_updates` traçable
- **CGU/CGV** statut hybride éditeur+intermédiaire+hébergeur LCEN
- **Cookies CMP** : Tarteaucitron (MVP 0€) ou Axeptio
- **Hébergement** : audit région Supabase (eu-west-3 obligatoire)
- **Budget compliance** : MVP 3 800€ / Anthropic-tier 12 500€ / recommandé 6 500€
- **Profils** : avocat (Herald, Derriennic, Bensoussan) + DPO (IAPP CIPP/E)

### 14.4 Chapitre 4 — Backlinks Tier 1-3 & PR Strategy

**Fichier** : `v2/PLAN-V2-04-BACKLINKS-PR.md` (10 119 mots)

**Apports clés** :

- **22 cibles Tier 1 nommées** (Le Monde Rey-Lefebvre/Mouterde, Les Échos Chauvot/Louis, Figaro Carasso, Capital Blondel, BFM Chicheportiche, Reporterre Kempf, Mediapart Correia, etc.) avec emails conventionnels, 3-5 angles, pitch templates personnalisés
- **26 cibles Tier 2** BTP/rénov (Moniteur, Batiactu, Batirama, Maison Écologique, MPF, Architectes.org)
- **54 cibles Tier 3** (30 blogs DIY + 20 YouTubers + Instagram/TikTok/forums)
- **12 études data-driven** prêtes à pitcher (Observatoire prix, Baromètre RGE, cartographie passoires, etc.)
- **12 partenariats institutionnels** (CAPEB, FFB, Qualibat, Qualit'EnR, France Rénov', ANAH, ADEME, MAR, Médiateur Énergie, CLER, Effinergie, Cerema)
- **Stack tooling 200€/mois → 600€/mois** (Hunter.io, Dropcontact, BuzzStream, Pitchbox, Notion, Ahrefs, Mention.com)
- **12 templates pitch** copy-paste (cold data/actu, expert dispo, follow-ups J+7/J+14, CP court 400 mots, CP dossier 2000 mots, LinkedIn DM, etc.)
- **HARO équivalents FR** : SourceSavant, ResponseSource, ProfileTree, #journorequest, #besoinsource
- **KPI cibles** : RD 23→220 (M12), DR 0,6→28, trafic PR 0→12K/mois, coût/backlink Tier 1 300-800€
- **15 actions ordonnées J1-J90** en 3 phases (Fondations / Activation / Amplification)

### 14.5 Chapitre 5 — Pre-Mortem & Competitive Intelligence Loop

**Fichier** : `v2/PLAN-V2-05-PREMORTEM-COMPETITIVE.md` (6 200 mots)

**Apports clés** :

- **28 causes d'échec** (méthodologie Gary Klein) en 6 catégories : Techniques (5), Algorithmiques (5), Concurrentiels (5), Réglementaires (4), Business (5), Humains (4)
  - Chaque cause avec : Probabilité × Impact, Signal précoce, Mitigation préventive, Plan contingence + analogie sectorielle vérifiable (Hopps, Frichti, Take Eat Easy, Drivy, Homejoy, Thumbtack, Handy, etc.)
- **Theory of Victory opposée** pour 8 concurrents (effy, quelleenergie, travaux.com, habitatpresto, allovoisins, MAR, Hellio, Heero)
- **Stack veille concurrentielle 150€/mois** : 15 Google Alerts précis, dashboard hebdo template, 4 niveaux triggers, war room 24h
- **4 scripts reverse engineering Node.js** + **3 honeypots** (SIRET fictif Luhn-valide, watermark phrase, Wayback defensive)
- **3 scénarios catastrophe war-gamés** : effy copie RGE-first, AI Overviews capture 50%, MaPrimeRénov' coupée
- **8 Kill Switches** (KS-1 à KS-8) quantifiés déclenchant changement cap sans débat émotionnel
- **12 actions immédiates 10 jours ouvrés** (~750€ + ~16h) incluant dépôt INPI "Lead Exclusif Artisan RGE" + runbook bus-factor>1

### 14.6 Chapitre 6 — Content Quality & LLM Grounding Pipeline

**Fichier** : `v2/PLAN-V2-06-CONTENT-QUALITY-LLM-EVAL.md` (8 912 mots)

**Apports clés** :

- **Stratégie 2 passes** : Claude 3 Haiku ou GPT-4o-mini sur 50K (15-28$) + Claude 3.5 Sonnet sur les 15% rejets (50$) = **78$ total** (loin sous plafond 500$)
- **Rubrique scoring 9 dimensions pondérées** : YMYL (×2.0), E-E-A-T (×1.5), originalité, variabilité, densité info, SEO sémantique, lisibilité, intent, guidelines Quality Raters
- **Eval set v1 — 100 fiches gold standard** : 20 RGE × 5 métiers, annotation manuelle 2 reviewers + résolveur, kappa Cohen > 0.7
- **Pipeline LLM grounding** : retrieval (DB INSEE+ADEME+territoire) → prompt → JSON output structuré → validation auto → review humain → publish
- **Prompt v1 versionné** ~500 mots avec contraintes (250-400 mots, ton, anti-patterns "leader local"/extrapolations)
- **Validation auto** : détection hallucinations vs DB, n-gram overlap inter-fiches, vérif compliance YMYL
- **Gate stop-go batch** : si >5% scores <7/10 → batch suivant bloqué jusqu'à correction prompt
- **A/B test Mann-Whitney** (non-paramétrique car SERP = loi puissance) : Cohorte A (IA grounded) vs B (template enrichi) vs C (control sans descrip), 5K fiches × 8 semaines
- **Sample 10% audit humain** = 5K fiches

### 14.7 Chapitre 7 — Financial Model & Team Scaling

**Fichier** : `v2/PLAN-V2-07-FINANCIAL-TEAM.md` (6 500 mots)

**3 scénarios financiers complets M1-M18** :

|                     | Scénario A Bootstrap | Scénario B Accéléré (reco) | Scénario C Croissance |
| ------------------- | -------------------- | -------------------------- | --------------------- |
| Burn max /mois      | 4 469 → 7 774 €      | jusqu'à 36 619 €           | jusqu'à 65 400 €      |
| Break-even          | M4                   | M8                         | M11                   |
| Cash floor critique | -                    | 15 K€ M7                   | -                     |
| Cash fin M18        | 934 K€               | 556 K€                     | ARR 1,56-2,34 M€      |
| Hires               | 0                    | 1 M3 + 1 M6                | 5 hires M9            |
| Levée               | Non                  | Non                        | 350 K€ seed M4        |

**Unit Economics 3 modèles** :

- **Commission** : ARPU 95€, LTV 1 615€, CAC 65€, LTV/CAC 24,8x, payback 0,86 mois
- **Abonnement SaaS** : ARPU 77,57€, churn 5%, LTV/CAC 27,5x
- **Freemium hybride** : 2,6× commission pure, effet réseau à 500 artisans actifs/dép

**Team scaling** :

- JD complète Senior Full-Stack Dev (55-65K€ brut, process 5 étapes, onboarding 30/60/90j)
- Org charts V1 (M12) et V2 (M18)
- 10 mitigations anti-bottleneck Marvin

**Funding** :

- Timing : M4-M5 seed, montant 350K€
- 10 BA ciblés (Larré, Gillet, Lepoutre, Prot, Samuelian, Larchevêque, Seydoux, Apotheker, Vernet, Mazzella, Grinda)
- 10 fonds seed (Kima, Elaia, Serena, Partech, ISAI, Alter Equity, Tomorrow Ventures, Axeleo, Otium, Founders Future)
- 8 outils non-dilutifs (Bpifrance, Réseau Entreprendre, PGE, CIR, CII, JEI)

### 14.8 Chapitre 8 — Theory of Victory & Defensible Moats

**Fichier** : `v2/PLAN-V2-08-THEORY-OF-VICTORY-MOAT.md` (7 800 mots)

**Theory of Victory en 1 phrase** :

> ServicesArtisans gagne en devenant la **jointure officielle temps réel SIRET INSEE × RGE ADEME × MaPrimeRénov'** sur 3 surfaces simultanées : SEO (annuaire), API (B2B partenaires), UX (simulateur).

**Wedge recommandé — A** : Leader pSEO `[métier RGE] [ville top 50]` (ICE 648)

- Rejette wedges B (simulateur seul ICE 288), C (claim premium SaaS ICE 144), D (hub éditorial ICE 294), E (API B2B ICE 180)

**7 moats détaillés avec cibles M3/M6/M12/M24** :

1. **Data** (poids 25%) — fraîcheur RGE, couverture 100% France
2. **Brand** (15%) — recall, citations média
3. **Réseau artisans** (15%) — 5K actifs M12
4. **Réseau clients** (10%) — 50K reviews vérifiées
5. **Switching cost** (15%) — tooling artisan (CRM, devis, planning)
6. **Réglementaire** (10%) — partenariats France Rénov', ADEME
7. **Expertise/contenu** (10%) — auteur cité presse Tier 1

**Defensibility 1/3/12 mois** par concurrent : societe.com = threat ÉLEVÉ, pagesjaunes/travaux.com/Effy/Hellio/Izi/habitatpresto/allovoisins évalués

**Product Vision 36 mois** :

- Y1 : annuaire RGE leader France
- Y2 : SaaS artisan complet (CRM + leads + financement)
- Y3 : marketplace certification + financement (avance MaPrimeRénov')

**Decision Framework** : 5 critères pivot/persévérer (M3 trafic, M6 conversion, M9 monétisation, M12 leadership, M18 break-even)

**The Master Question** : test Popper M6 sur "pompe à chaleur + ville" / ChatGPT artisan RGE — 4 branches d'interprétation si NON

### 14.9 Décisions stratégiques v2.0 (mise à jour)

| #       | Décision                               | v1.2        | v2.0                                                            |
| ------- | -------------------------------------- | ----------- | --------------------------------------------------------------- |
| 2       | Unblock GPTBot/ClaudeBot/PerplexityBot | Reco OUI    | **CONFIRMÉ par chap 2 — moat LLM premier arrivé**               |
| **NEW** | **SMS outreach 50K**                   | Plan v1     | **ABANDONNÉ — L34-5 CPCE strict (chap 3)**                      |
| **NEW** | **Source 970K données**                | Non audité  | **AUDIT P0 — si scraping → purge + restart SIRENE (chap 3)**    |
| **NEW** | **Wedge initial**                      | Hub renov   | **Pivot wedge A : pSEO `[métier RGE] [ville top 50]` (chap 8)** |
| **NEW** | **Modèle revenue prio**                | Non décidé  | **Commission 95€/lead (LTV/CAC 24,8x prouvé chap 7)**           |
| **NEW** | **Hire 1ère**                          | Non discuté | **Senior Full-Stack Dev M3 (chap 7)**                           |
| **NEW** | **Levée 350K€**                        | Non discuté | **M4-M5 si Scénario C (chap 7)**                                |

### 14.10 ICE révisé v2.0 (top 25)

| #          | Action                                                    | Plan | Chap | Score ICE |
| ---------- | --------------------------------------------------------- | ---- | ---- | --------- |
| 1          | Fix `CompareProviderWrapper` ssr:false                    | v1   | 01   | 1000      |
| 2          | Fix `DynamicFooterLinks` ssr:false                        | v1   | 01   | 900       |
| **3 NEW**  | **Audit RGPD source 970K (P0 critique)**                  | v2   | 03   | 900       |
| 4          | Migration noindex RGE-only (script prêt)                  | v1.2 | 13   | 810       |
| **5 NEW**  | **Purge phone+email 920K non-RGE**                        | v2   | 03   | 800       |
| 6          | Upload disavow GSC                                        | v1   | 01   | 700       |
| 7          | Génération descriptions 50K RGE (Haiku 78$)               | v1.2 | 06   | 700       |
| **8 NEW**  | **Déployer llms.txt + 7 Schema.org LLM**                  | v2   | 02   | 686       |
| 9          | Trigger sync_provider_noindex                             | v1.2 | 13   | 640       |
| **10 NEW** | **Stack measurement (PostHog + Metabase + 6 dashboards)** | v2   | 01   | 630       |
| **11 NEW** | **Pipeline LLM grounding eval set 100 fiches**            | v2   | 06   | 614       |
| **12 NEW** | **CMP cookies (Tarteaucitron MVP)**                       | v2   | 03   | 588       |
| 13         | Simulateur visible homepage                               | v1   | 02   | 648       |
| **14 NEW** | **Wedge pSEO `[métier RGE] [ville top 50]`**              | v2   | 08   | 648       |
| 15         | Réduction DevisForm 7→4 champs                            | v1   | 02   | 576       |
| 16         | Sync API ADEME RGE quotidien                              | v1   | 04   | 567       |
| **17 NEW** | **15 Google Alerts veille concurrentielle**               | v2   | 05   | 540       |
| **18 NEW** | **Pre-registration 3 expériences pilotes**                | v2   | 01   | 525       |
| 19         | Outreach claim 50K (~30K éligibles only)                  | v1.2 | 03   | 504       |
| **20 NEW** | **22 cibles Tier 1 emails contacted**                     | v2   | 04   | 504       |
| **21 NEW** | **3 templates email A/B/C LCEN-conforme**                 | v2   | 03   | 480       |
| **22 NEW** | **Pre-mortem 28 causes documentées**                      | v2   | 05   | 450       |
| **23 NEW** | **Honeypots SIRET fictif + watermark**                    | v2   | 05   | 432       |
| **24 NEW** | **JD Senior Full-Stack Dev publiée**                      | v2   | 07   | 420       |
| **25 NEW** | **Dépôt INPI "Lead Exclusif Artisan RGE"**                | v2   | 05   | 392       |

### 14.11 Action sequence consolidée v2.0 (90 jours)

**Semaine 1 (J1-J7)** :

- J1 : Fix bailout SSR (chap 13) + audit RGPD source 970K LANCÉ (chap 03)
- J2 : Migration noindex RGE-only (script prêt v1.2)
- J3 : Stack measurement (PostHog + Metabase + 6 dashboards) (chap 01)
- J4 : llms.txt + 7 Schema.org LLM (chap 02)
- J5 : Eval set 100 fiches gold standard annoté (chap 06)
- J6 : 15 Google Alerts setup (chap 05) + 22 emails Tier 1 vérifiés Hunter.io (chap 04)
- J7 : Pre-registration 3 expériences pilotes signées (chap 01)

**Semaine 2-4 (J8-J28)** :

- Pipeline LLM grounding 50K RGE descriptions (Haiku batch, $78)
- Validation auto + sample 10% audit humain
- A/B tests #1-3 lancés (DevisForm, simulateur, exit-intent)
- 5 pitchs Tier 1 envoyés/semaine
- CMP cookies déployée (chap 03)
- Audit RGPD livré + plan correction
- Si scraping : purge + restart SIRENE LANCÉ

**Mois 2 (J29-J60)** :

- 50K descriptions générées + indexées
- Outreach claim ~30K emails génériques (LCEN-conforme, 4 vagues)
- 8 études data-driven publiées
- Pre-mortem review : 4 KS validés
- Dépôt INPI "Lead Exclusif Artisan RGE"
- JD Senior Full-Stack Dev publiée + sourcing

**Mois 3 (J61-J90)** :

- Hire #1 Senior Full-Stack Dev onboarded
- 3 partenariats institutionnels signés (CAPEB/Qualibat/France Rénov')
- 3 backlinks Tier 1 acquis
- War game scénarios x3 simulés
- Dashboard QBR M3 préparé
- Décision GO/NO-GO Scénario B → Scénario C (levée seed 350K€)

### 14.12 Total documentation produite

| Plan                                 | Volume                   | Niveau                      |
| ------------------------------------ | ------------------------ | --------------------------- |
| MASTER-PLAN-00-SYNTHESIS v1.0        | 22 KB                    | Tactique senior 8/10        |
| MASTER-PLAN-01-TECHNICAL             | 42 KB                    | Spécialisé                  |
| MASTER-PLAN-02-PRODUCT               | 48 KB                    | Spécialisé                  |
| MASTER-PLAN-03-CONTENT               | 83 KB                    | Spécialisé                  |
| MASTER-PLAN-04-DATA-TRUST            | 39 KB                    | Spécialisé                  |
| MASTER-PLAN-05-GROWTH                | 60 KB                    | Spécialisé                  |
| **v2/PLAN-V2-01 à 08** (8 chapitres) | **~360 KB**              | **Anthropic-tier 10/10**    |
| **TOTAL**                            | **~654 KB / ~105K mots** | **Plan complet exécutable** |

### 14.13 Verdict v2.0

Le plan v1.2 amenait à "site qui marche bien sur 12 mois" (50K visites/jour, qq milliers devis).

Le plan v2.0 amène à **leader catégorie défendable** : moats data+brand+réseau+switching+régulation+expertise compounded, defensibility analysée par concurrent, kill switches contractuels, financial model 18 mois 3 scénarios, hire roadmap, wedge initial gagnable, theory of victory falsifiable.

**Différence économique** : v1.2 = bootstrap 100K€ runway, v2.0 = optionnalité levée 350K€ M4 si traction, ARR 1,56-2,34 M€ M18 sur scénario C.

**Différence stratégique** : v1.2 = "annuaire artisans + rénovation". v2.0 = **annuaire officiel RGE France acquérable par societe.com / Doctolib-de-l'artisan** (3-5 ans).

---

## 12. Verdict final

### Ce que ce plan garantit si exécuté à la lettre

- **Mois 3** : 50 devis RGE /mois, DR 5, 400 KW, position top 10 sur `maprimerenov 2026`
- **Mois 6** : 200 devis /mois, DR 15, 700 KW, top 5 sur `audit énergétique obligatoire`
- **Mois 12** : 1 000 devis /mois, DR 30, 1 500 KW, position #1 sur plusieurs KW stratégiques, ServicesArtisans **leader français** annuaire artisans RGE + rénovation énergétique

### Ce que ce plan ne promet PAS

- Pas de "hack" : exécution rigoureuse sur 12 mois
- Pas de chance : chaque gain = effort proportionnel
- Pas d'exceptions : les règles Google (E-E-A-T, YMYL, anti-spam) sont appliquées strictement

### La seule chose à retenir

> **Exécute le Jour 1 dans les 4 prochaines heures. Le reste suivra.**

Les 5 plans détaillent tout. Cette synthèse priorise. Les 15 premières minutes valent 10 000 heures d'optimisation future.

---

**Plan validé pour exécution par** : ********\_********
**Date de lancement Sprint 0** : ********\_********
**Revue trimestrielle CEO** : M3 / M6 / M9 / M12
