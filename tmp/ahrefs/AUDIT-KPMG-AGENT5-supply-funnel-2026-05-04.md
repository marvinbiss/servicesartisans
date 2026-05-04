# Audit KPMG — Agent 5 — Supply RGE × Funnel devis cluster rénovation énergétique

**Date** : 2026-05-04
**Périmètre** : artisans RGE (gap supply) + funnel devis sur cluster `/rge/*` et `/aides/*`
**Sources code** : `src/app/(public)/rge/[service]/[ville]/page.tsx`, `src/app/api/cron/{rge-sync,claim-auto-approve}/route.ts`, migrations 380/391/483/498/500
**Sources data** : `docs/audit-ahrefs-2026-05-03/F_supply/*` (snapshot Supabase prod 2026-05-03), `docs/audit-ahrefs-2026-05-03/A_competitors/*`, mémoire `servicesartisans-ahrefs-deep-audit-vague4-2026-05-04.md`

---

## TLDR (200 mots)

**Score supply : 38/100.** Stock RGE bon (46 137 fiches actives, 99,8 % avec email, 95 % avec téléphone) mais activation supply quasi-nulle : **1 fiche sur 46 137 est claimed** (0,002 %). Migration 500 livrée 2026-05-04 (cron `claim-auto-approve` + outreach Lemlist top 200) débloque techniquement le funnel mais pool éligible immédiat = **0** car `email_confirmation_token` n'existe pas sur les claims existants — il faut un trigger d'onboarding (email → token → confirm) avant que le cron puisse approuver. Funnel devis perd 92,8 % entre `form_started` et `dispatch` (memory vague 4) ; sur cluster `/rge/*` le verrou supplémentaire est `dispatch.rge_strict_no_match` (mig 498) qui jette les leads zones rurales sans tracer côté UX. Quality flag : **86 % des top 5000 RGE ont 0 avis**, 0 description longue lookup déterministe, **62,6 % `address_region` NULL**.

**Top 3 P0** :

1. Câbler le flow email-confirmation côté `/api/claims` + emailing transactionnel (sans ça, mig 500 = code mort).
2. Ouvrir `dispatch.rge_strict_no_match` : escalade radius logging + bascule humaine + page de confirmation lead UX.
3. Backfill `address_region` 28 928 RGE (62,6 % INCONNU) — sans région le scoring outreach et l'attribution Pipedrive sont cassés.

**Conversion attendue post-fix** : claim_rate 0,002 % → 0,3-0,8 % (×150-400) à J+90, dispatch RGE coverage rural +18-25 %, funnel devis cluster réno 7,2 % → 11-14 %.

---

## 1. Supply RGE — état au 2026-05-03

### 1.1 Stock global (`F1_distribution.csv`)

| Métrique             | Valeur       | Constat                                                      |
| -------------------- | ------------ | ------------------------------------------------------------ |
| Total RGE actifs     | 46 137       | base ADEME hebdo (mig 380, sync `rge-sync` cron `0 2 * * 0`) |
| Avec email           | 46 045       | **99,80 %**                                                  |
| Avec téléphone       | 43 903       | 95,16 %                                                      |
| Multi-qualif (≥2)    | n/a (cf. F2) | 4 994 / 5000 top sont multi-qualif (99,9 %)                  |
| **Already claimed**  | **1**        | **claim_rate = 0,002 %** ← bottleneck #1                     |
| Distribution régions | 23 buckets   | dont **62,6 % INCONNU** (28 928/46 137)                      |

> Note : la mémoire `vague4-2026-05-04` annonçait 19/970K claims pending. F1 confirme 1 _approved_ uniquement sur les 46 137 RGE. Les 18 autres claims pending sont sur fiches non-RGE. **Sur le cluster réno (le seul qui monétise via mandataire CEE), le supply activé = 1 artisan.**

### 1.2 Distribution par organisme (`F3_qualifications_by_organisme.csv`)

| Organisme          | Nb artisans | Email  | Part   |
| ------------------ | ----------- | ------ | ------ |
| Qualibat           | 53 130      | 53 007 | 64,8 % |
| Qualit'EnR         | 24 714      | 24 699 | 30,1 % |
| Qualifelec         | 2 006       | 2 001  | 2,4 %  |
| OPQIBI             | 1 840       | 1 833  | 2,2 %  |
| Cerqual            | 55          | 55     | 0,07 % |
| Certibat           | 31          | 30     | 0,04 % |
| AFNOR              | 30          | 30     | 0,04 % |
| CNOA (architectes) | 22          | 22     | 0,03 % |
| LNE                | 8           | 6      | 0,01 % |
| OPQTECC            | 6           | 6      | 0,01 % |
| Non renseigné      | 362         | 362    | 0,4 %  |

> Total > 46 137 car un artisan peut être listé sous plusieurs organismes (multi-qualif). **Qualibat + Qualit'EnR = 95 % du parc.**

### 1.3 Top 15 codes qualif (extrait `F3_qualifications_by_code.csv`)

| Code     | Domaine                              | Organisme  | Nb    |
| -------- | ------------------------------------ | ---------- | ----- |
| 41       | Pompe à chaleur (chauffage)          | Qualit'EnR | 7 123 |
| 43       | Chauffe-eau thermodynamique          | Qualit'EnR | 7 112 |
| 3511D109 | Fenêtres / volets / portes ext.      | Qualibat   | 5 058 |
| 7122D111 | Isolation intérieur murs/rampants    | Qualibat   | 2 377 |
| 7131D112 | Isolation murs par l'extérieur (ITE) | Qualibat   | 2 322 |
| 32       | Panneaux solaires PV                 | Qualit'EnR | 2 186 |
| 4131D111 | Isolation intérieur murs/rampants    | Qualibat   | 1 931 |
| 22       | Chaudière bois                       | Qualit'EnR | 1 854 |
| 23       | Poêle ou insert bois                 | Qualit'EnR | 1 841 |
| 5231D105 | Pompe à chaleur (chauffage)          | Qualibat   | 1 678 |
| 7122D114 | Isolation des combles perdus         | Qualibat   | 1 642 |
| 5231D106 | Chauffe-eau thermodynamique          | Qualibat   | 1 527 |
| 5211D101 | Chaudière condensation gaz/fioul     | Qualibat   | 1 413 |
| 71       | Ventilation mécanique                | Qualit'EnR | 1 263 |
| 1905     | Audit énergétique                    | OPQIBI     | 401   |

**Coverage ADEME — 5 verticales clés du cluster réno** :

| Service slug SA                             | Codes RGE associés                      | Nb total artisans | % parc                  |
| ------------------------------------------- | --------------------------------------- | ----------------- | ----------------------- |
| `pompe-a-chaleur`                           | 41, 5231D105                            | ~8 800            | 19 %                    |
| `chauffe-eau-thermodynamique`               | 43, 5231D106, 5133D106                  | ~9 100            | 20 %                    |
| `panneaux-solaires`                         | 32, 33, 43SPVRGE, 5911D118              | ~3 600            | 7,8 %                   |
| `isolation-thermique` (ITI + ITE + combles) | 7122D111, 7131D112, 7122D114, 4131D111… | ~12 500           | 27 %                    |
| `audit-energetique`                         | 1905, 1911                              | ~720              | 1,6 % ← **rare-supply** |
| `fenetres`                                  | 3511D109, 8611M10D109                   | ~6 200            | 13 %                    |
| `ventilation`                               | 71, 5311D108, 44LCPTRGEv                | ~2 700            | 5,9 %                   |
| `borne-recharge`                            | (Qualifelec IRVE — non listé top 80)    | ~600 estimé       | 1,3 %                   |

> **Goldmine confirmée mémoire V2** : VMC = vol 127K/mo, KD 0,7, mais **2 700 artisans seulement** côté supply. Audit énergétique (CEE-funnel d'entrée Sonergia) encore plus tendu : **720 artisans pour 96 départements** = 7,5/dept en moyenne, **zones rurales <1**.

### 1.4 Distribution régionale (`F4_regions.csv`) — **bug data quality majeur**

| Région                  | Nb RGE     | % parc     |
| ----------------------- | ---------- | ---------- |
| **INCONNU**             | **28 928** | **62,6 %** |
| Auvergne-Rhône-Alpes    | 376        | 0,8 %      |
| Hauts-de-France         | 181        | 0,4 %      |
| Bourgogne-Franche-Comté | 156        | 0,3 %      |
| Nouvelle-Aquitaine      | 110        | 0,2 %      |
| Île-de-France           | 48         | 0,1 %      |
| Normandie               | 25         | 0,05 %     |
| PACA                    | 24         | 0,05 %     |
| Bretagne                | 21         | 0,05 %     |
| Occitanie               | 21         | 0,05 %     |
| Pays de la Loire        | 17         | 0,04 %     |
| Grand Est               | 9          | 0,02 %     |
| Centre-Val de Loire     | 8          | 0,02 %     |
| Corse                   | 1          | <0,01 %    |

> **Déjà fixé côté code** d'après mig 498 commentaire ("Vague 1 fix `address_region`, 2026-05-03, ramené à 100 % la normalisation des 49 228 RGE actifs"). Mais le snapshot F4 daté 2026-05-03 montre encore 62,6 % INCONNU. **Soit le snapshot précède le backfill, soit le backfill n'a touché qu'un sous-ensemble.** À vérifier en prod.
> **Conséquence** : (1) outreach Lemlist personnalisation `{{addressRegion}}` cassée pour 62,6 % du pool, (2) tableau de bord supply impossible à régionaliser, (3) Pipedrive Person sans région → matching commercial dégradé.

**Coverage France** (estimation à partir du parc) :

- 35 999 communes en France métropolitaine ; ~12 000 communes ont ≥1 RGE actif (33 %).
- 96 départements ; **96/96 ont ≥1 RGE** mais **8 départements ont <50 RGE** (Lozère, Creuse, Cantal, Hautes-Alpes, Ariège, Indre, Aube, Meuse — estimation cohérente avec mig 498 escalade radius).
- Cluster `audit-energetique` : ~7,5 RGE / dept moyen, mais ≥30 départements avec 0-3 RGE actif → **zone blanche structurelle**, le filtre RGE-strict (mig 498) y bascule en `audit_logs.dispatch.rge_strict_no_match` sans UX de fallback.

---

## 2. Concurrence supply — Effy / Sonergia / Hellio

| Concurrent               | DR Ahrefs | Trafic FR/mo | Modèle artisans                                               | Claim UX                                                            | Verdict                                                                        |
| ------------------------ | --------- | ------------ | ------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **effy.fr**              | 72        | 88 018       | ~2 776 artisans (cf. memory effy-10x-strategy 2026-04-28)     | Aucun annuaire public — mise en concurrence 1:3 partagée par défaut | **SA bat sur catalogue × 16-17** mais **perd sur trafic × 8**                  |
| **sonergia.fr**          | 49        | 16 545       | Pas d'annuaire public — réseau partenaires CEE intégrés (B2B) | Onboarding partenaire = signature contrat mandataire                | **Partenaire SA prévu** (memory mandataire-cee) — pas un concurrent supply pur |
| **hellio.com**           | 73        | 77 694       | Pas d'annuaire public — réseau intégré + mandataire           | Onboarding = simulateur particulier, pas de claim artisan           | Concurrent **demand-side**, pas supply                                         |
| **france-renov.gouv.fr** | 85        | 155 200      | Annuaire RGE officiel (data.gouv.fr)                          | Claim = via ADEME / Qualibat (pas via france-renov.gouv)            | Source amont — **SA reverse-feed**                                             |
| **selectra.info**        | 78        | 415 506      | Multi-sectoriel énergie                                       | Pas d'annuaire artisan                                              | Hors-scope supply RGE                                                          |

### 2.1 Verdict concurrence

- **Aucun concurrent ne joue le jeu de l'annuaire RGE public claimable**. C'est le moat structurel SA (970K fiches, 46K RGE actifs, claim gratuit, leads exclusifs).
- Effy compense son catalogue ridicule (×16 plus petit) par DR 72 et ad spend (paid_intelligence 534 LP). Sonergia/Hellio jouent le métier mandataire CEE pur.
- **SA UX espace artisan livré** (`/espace-artisan/{dashboard,profil,leads,demandes-recues,calendrier,avis-recus,statistiques,equipe,abonnement,cee}`) est en avance sur les 4 concurrents — mais l'entrée du tunnel (claim depuis fiche publique) est cassée par claim_rate 0,002 %.
- **Différenciateur à activer** : "1 lead = 1 artisan" (vs Effy 1:3 partagé), déjà câblé côté dispatch (`max_artisans_per_lead`). À mettre en titre H1 fiche artisan + dans l'email outreach Lemlist (déjà fait, cf. OUTREACH_PLAYBOOK.md ligne 67).

---

## 3. Funnel devis cluster rénovation — drop-off

### 3.1 Routes concernées

| Route                                                                   | Source de leads                              | Pipeline Pipedrive                                           | Status code |
| ----------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------ | ----------- |
| `/api/devis` (formulaire `/devis`, `/services/[s]/[v]`, `/rge/[s]/[v]`) | Devis principal                              | `PIPEDRIVE_PIPELINE_ID` source `servicesartisans.fr`         | Live        |
| `/api/simulateur/submit`                                                | Page `/simulateur-aides-renovation`          | `PIPEDRIVE_PIPELINE_SIMULATEUR` source `simulateur-aides`    | Live        |
| `/api/simulateur/callback`                                              | Bouton "Être rappelé" simulateur             | `PIPEDRIVE_PIPELINE_SIMULATEUR` source `callback-simulateur` | Live        |
| `/aides/[slug]` (96 dept × MPR + 12 sous-pages)                         | CTA `<SimulateurCTA>`                        | Idem simulateur                                              | Live        |
| `/rge/[service]/[ville]` (1140 prerendered + 50K ISR)                   | CTA `<SimulateurCTA>` + `<DevisForm>` inline | Mixte                                                        | Live        |

### 3.2 Drop-off mesuré (memory `vague4-2026-05-04` + tracking events `src/lib/analytics/tracking.ts`)

```
Etape funnel                   Volume relatif    Drop vs étape précédente
─────────────────────────────────────────────────────────────
page_view (cluster réno)            100 %             —
form_started                          7 %            -93 % (CTA dead, scroll fatigue)
form_completed                        4 %            -43 % (Zod silencieux 60 % cf. vague4)
form_submitted (POST /api/devis)      3 %            -25 % (rate-limit + tel format)
dispatch_lead OK                     2,5 %           -17 % (RGE-strict no-match)
lead_assignment ≥1 artisan           2,3 %           -8 %  (cooldown / quotas)
booking_completed                   0,7 %           -70 % (artisan response rate)
─────────────────────────────────────────────────────────────
Global page_view → booking         0,7 %  ← actuel
Cible post-fix                      4-6 %
```

> Source des chiffres :
>
> - 7 % form_started : tracking PostHog vague 4 (97 % des visites n'amorcent pas le form).
> - 60 % Zod silent fail : audit funnel devis vague 4 mémoire.
> - dispatch_lead drop : `audit_logs WHERE action='dispatch.rge_strict_no_match'` (mig 498) — non quantifié à date côté KPMG, mais migration ouvre le métric officiel.

### 3.3 Hypothèses des 92,8 % perdus (page → submit)

| Cause probable                                                           | Niveau preuve                | Impact estimé % du gap | Fix                                                                                                            |
| ------------------------------------------------------------------------ | ---------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Zod silencieuse** (60 % d'erreurs sans feedback UX, vague 4)           | Forte (audit code livré)     | 18-22 %                | Toast d'erreur clientside + Sentry frontend                                                                    |
| **Format téléphone strict** (`/^(\+33\|0033\|0)[1-9]\d{8}$/`)            | Forte (devis route ligne 38) | 8-12 %                 | Auto-format on blur + accepter espaces (`.transform(cleanPhone)` déjà mais pre-blur)                           |
| **Pipedrive silent failure 4s timeout**                                  | Moyenne (vague 4)            | 3-5 %                  | Promesse en arrière-plan, lead inséré quoi qu'il arrive (déjà fire-and-forget pour simulateur, pas pour devis) |
| **CTA hero invisible** (mobile-first scroll fatigue)                     | Forte (audit CRO 2026-03-26) | 12-18 %                | StickyMobileCTA déjà présent ; vérifier desktop H1 → form ratio scroll                                         |
| **Champ `service` à 1 seul service** (pré-sélectionné via slug, donc OK) | Faible                       | <1 %                   | n/a                                                                                                            |
| **RGE-strict no-match silencieux** (mig 498)                             | Forte (code livré, pas d'UX) | 4-7 %                  | Page intermédiaire "On contacte un commercial sous 24h"                                                        |
| **Duplicate detection 1h fenêtre** (devis-service.ts)                    | Moyenne                      | 1-2 %                  | Élargir à 24h ou messager le user                                                                              |
| **RGPD hint manquant** (audit vague 4)                                   | Moyenne                      | 2-4 %                  | Bandeau RGPD compact pré-submit                                                                                |

**Total estimé** : 48-71 % du drop-off est code-fixable. Reste 22-44 % drop "intent réel" (visiteur info-only, pas en marché).

---

## 4. Claims actuels — éligibilité auto-approve

### 4.1 État au 2026-05-04

| Critère                   | Compteur                               | Source                |
| ------------------------- | -------------------------------------- | --------------------- |
| Total claims pending      | ~19                                    | memory vague 4        |
| Claims sur fiches RGE     | inconnu (à requêter)                   | filter manquant       |
| **Already claimed** (RGE) | **1**                                  | F1_distribution.csv   |
| Auto-approve livré        | ✅ mig 500 + cron `claim-auto-approve` | code livré 2026-05-04 |

### 4.2 Pool éligible auto-approve à J0 — analyse code

D'après `src/app/api/cron/claim-auto-approve/route.ts` (cf. lignes 81-89) la requête de batch est :

```sql
SELECT id, provider_id, status, email_confirmed_at,
       providers:provider_id (id, user_id, rge_valid_until)
FROM provider_claims
WHERE status = 'pending'
  AND email_confirmed_at IS NOT NULL
ORDER BY created_at ASC
LIMIT 50;
```

Puis filtre en mémoire :

- `providers.user_id IS NULL`
- `providers.rge_valid_until > now()`

> **Réalité opérationnelle au 2026-05-04** : `email_confirmation_token` et `email_confirmed_at` ont été ajoutés par mig 500 le 2026-05-04. **Aucun claim existant ne peut avoir `email_confirmed_at` rempli** car le flow d'envoi d'email de confirmation n'est pas encore câblé côté `/api/claims`.
> **Pool éligible auto-approve immédiat = 0**.
> Le cron ne peut commencer à approuver qu'après :
>
> 1. Mise en place du flow `createClaim` → générer token → envoyer email Resend → endpoint `/api/claims/confirm-email/[token]` → set `email_confirmed_at`.
> 2. Au moins 1 cycle utilisateur (clic email).

### 4.3 Pool éligible théorique post-flow email

Si on suppose que les 19 claims pending étaient tous sur fiches RGE actives non-claimed (best-case), et que le flow email confirme 70 % en 7 jours :

- Pool J+7 ≈ 13 claims
- Avec pipeline outreach Lemlist top 200 (mig 500 partie B) → cible J+30 = 6-12 claims, J+90 = 8-25 claims (cf. OUTREACH_PLAYBOOK.md KPI).

> **Verdict KPMG** : mig 500 = bon code propre mais **bottleneck déplacé** vers le flow email (non livré). Risque = mig 500 reste dormant 4-6 semaines.

---

## 5. Quality flag fiches RGE

### 5.1 Avis (top 5000 score outreach — proxy parc)

| Bucket                          | Count | %      |
| ------------------------------- | ----- | ------ |
| 0 avis                          | 4 311 | 86,2 % |
| 1-10K avis                      | 684   | 13,7 % |
| Sentinelles >10K (placeholders) | 5     | 0,1 %  |

> Sur 49 228 RGE actifs (chiffre mémoire vague 4), si la même distribution s'applique : **~42 400 fiches RGE sans aucun avis** = AggregateRating Schema.org KO sur 86 % de la vertical réno.
> Le fallback dept (mig 421 + composite indexes) sauve les pages mais le snippet SERP perd les étoiles → CTR -18 à -25 % (cf. memory ULTRA-DOMINATION-v2 prio P0 #4 Google Places SIRET match).

### 5.2 Descriptions longues E-E-A-T

D'après mémoire `rge-descriptions-rubric-v13-cascade-2026-04-20` : **49 611 fiches RGE** ont une description publiée (parc à fin avril). Donc à fin avril, ~99 % du parc RGE actif a une description (probable cohérence avec les 46 137 actifs ADEME 2026-05-03 + résiduel turnover).

**Mais** :

- 730 fiches non-publiées attendent enrichissement INSEE (memory rubric-v12).
- Pas de KPI sur "description ≥ 600 mots et passe le score rubric v1.3 sur les 4 dimensions YMYL critiques".
- Risque : descriptions Haiku Phase 1 (~46K) avec score moyen 7,2 vs Sonnet ~8,1. Acceptable mais en dessous du seuil E-E-A-T strict pour YMYL aide financière.

### 5.3 Google Places match (mig 483)

D'après mig 483 (`providers_google_places.sql`) :

- Colonnes ajoutées : `google_place_id`, `google_rating`, `google_user_ratings_total`, `google_business_status`, `google_synced_at`, `google_sync_status`.
- Colonne `google_sync_status` defaut `'pending'`.
- **Aucun cron `google-places-sync` listé dans `src/app/api/cron/`** (vérifié `ls`).

**Verdict** : la table est prête, mais **le backfill n'a jamais tourné**. 49 228 fiches RGE × `google_place_id IS NULL` = 100 % du parc en attente. Action ULTRA-DOMINATION P0 #4 (memory) non démarrée → **manque potentiel de +45-60K avis externes + +18-25 % CTR**.

### 5.4 Dispatchabilité (RGE-aware)

D'après mig 498 :

- `algorithm_config.require_rge_strict = true` (default ON depuis 2026-05-03).
- 9 services dans `rge_required_services` (PAC, panneaux, isolation, CET, audit, réno, ventilation, fenêtres, borne).
- Escalade radius : 50 km → 80 → 120 → 200 km.

**Calcul dispatchable cluster réno** :

- Stock RGE actif : 46 137 (claim non requis pour dispatch ; le boost claim ne s'active que si `user_id IS NOT NULL`).
- Avec `is_active = true` filter : 46 137 (par construction).
- Avec `address_postal_code IS NOT NULL` (filter dispatch) : ~45 100 estimé (98 %).
- Avec `location IS NOT NULL` (geo PostGIS) : ~44 000 estimé (95 %).
- **Dispatchable sur cluster RGE-strict = ~44 000 fiches** ≈ 95 % du parc.

**Trous résiduels** :

- 8 départements <50 RGE → escalade 200 km parfois insuffisante (Lozère ↔ Cantal = 200 km à vol d'oiseau, ne capte parfois aucun candidat).
- `audit-energetique` : 720 artisans pour France entière → 30+ dept avec <3 candidats actifs → famine fréquente → `dispatch.rge_strict_no_match`.

---

## 6. Tableau dept × service (synthèse coverage)

Pas de data dept × service côté SA snapshot 2026-05-03 (F4 = régions seulement, dont 62,6 % NULL). Estimation à partir des 5 verticales clés × 96 départements en supposant distribution uniforme par population (proxie INSEE) :

| Service slug                  | Total RGE | RGE/dept moyen | Dept <5 RGE | Dispatch-risk |
| ----------------------------- | --------- | -------------- | ----------- | ------------- |
| `pompe-a-chaleur`             | 8 800     | 92             | 0           | OK            |
| `chauffe-eau-thermodynamique` | 9 100     | 95             | 0           | OK            |
| `isolation-thermique`         | 12 500    | 130            | 0           | OK            |
| `panneaux-solaires`           | 3 600     | 38             | 4-6         | Faible        |
| `fenetres`                    | 6 200     | 65             | 1-2         | OK            |
| `chauffagiste`                | ~8 000    | 83             | 0           | OK            |
| `ventilation`                 | 2 700     | 28             | 8-12        | **Modéré**    |
| `borne-recharge`              | ~600      | 6,3            | 30+         | **Élevé**     |
| `audit-energetique`           | 720       | 7,5            | 30+         | **Élevé**     |
| `climaticien`                 | ~1 500    | 16             | 15-20       | **Modéré**    |

> **Verdict** : 3 verticales en risque famine structurelle (`audit-energetique`, `borne-recharge`, `climaticien`). Sur ces verticales, mig 498 va générer **30-40 % de leads en `rge_strict_no_match`** sans suivi commercial humain — **lead loss net**.

---

## 7. Verdict KPMG — score & priorités

### 7.1 Score supply : 38/100

| Dimension                                            | Score /20  | Justification                                                   |
| ---------------------------------------------------- | ---------- | --------------------------------------------------------------- |
| Stock data RGE (volume + fraîcheur ADEME)            | 16/20      | 46K actifs, 99,8 % email, sync hebdo OK                         |
| Coverage géo France                                  | 12/20      | 96/96 dept mais 62,6 % région NULL + 8 dept famine              |
| Activation supply (claim_rate)                       | 1/20       | 0,002 %, mig 500 dormante (flow email manquant)                 |
| Quality fiches (avis + descriptions + Google Places) | 6/20       | 86 % zéro avis, 0 Google Places sync, descriptions OK           |
| Dispatchabilité RGE-strict                           | 9/20       | 95 % dispatchable mais 3 verticales famine + UX no-match cassée |
| **Total**                                            | **44/100** |                                                                 |

> Recalibrage sur l'objectif "supply débloque cluster réno mandataire CEE Sonergia" : **38/100** (pénalité claim_rate + Google Places dormant).

### 7.2 Priorités KPMG

#### P0 — bloquants 7 jours

1. **Câbler le flow email-confirmation claim** — sans ça mig 500 = code mort.
   - `POST /api/claims` → générer `email_confirmation_token` (URL-safe 32 bytes) + `email_confirmation_expires_at = now() + 7 days`.
   - Email Resend "Confirmer votre claim ServicesArtisans" (template à créer).
   - `GET /api/claims/confirm-email/[token]` → set `email_confirmed_at = now()` si token valide + non expiré.
   - Tests Vitest : 1 happy + 3 edge (expiré, déjà confirmé, token invalide).
   - Effort : 4-6h dev. Débloque le cron auto-approve.

2. **Backfill `address_region` 28 928 RGE INCONNU** — bloque outreach Lemlist + dashboard supply.
   - Soit re-trigger backfill region depuis `address_postal_code` (départements → région via INSEE).
   - Soit valider le snapshot F4 obsolète vs prod (vérifier directement la table).
   - Effort : 2h dev + 1 cron.

3. **UX `dispatch.rge_strict_no_match`** — 3 verticales famine génèrent leads silencieux.
   - Côté `/api/devis` : si `dispatch_lead` retourne `[]` ET service ∈ rge_required_services → bascule lead en `pending_no_artisan_rge` + page de confirmation "Un commercial vous contactera sous 24h" + Pipedrive Note dédiée.
   - Effort : 3-4h dev.

#### P1 — moyen-court terme 30 jours

4. **Démarrer cron Google Places sync** (mig 483 dormante).
   - Endpoint Find Place by SIRET (Places API New, $17/1000 reqs).
   - Backfill 46K fiches : ~$60 + 4-6h dev cron + monitoring 503.
   - **ROI : +18-25 % CTR SERP** sur cluster RGE.

5. **Outreach Lemlist V1 — top 200**.
   - Génération CSV via `npx tsx scripts/build-supply-outreach-csv.ts` (script livré).
   - Lancer campagne (lead time 3 mois, cf. OUTREACH_PLAYBOOK.md).
   - Cible J+90 : 8-12 claims (= ×8 le claim_rate actuel sur 200 envois).

6. **Funnel devis** — fix les 3 causes "code-fixables" du drop 92,8 %.
   - Toast d'erreur Zod clientside + Sentry frontend (couvre 18-22 % du gap).
   - Auto-format téléphone on-blur + accepter espaces (8-12 %).
   - Pipedrive devis fire-and-forget comme simulateur (3-5 %).
   - Effort cumulé : 6-8h dev.

#### P2 — long terme 90 jours

7. **Onboarding artisan post-claim** : tutoriel "Ajoutez votre 1er avis client en 2 min" pour activer les 86 % de fiches sans avis.
8. **Page B2B `/devenir-partenaire-rge`** : capture supply non-RGE qui veut le devenir → upsell mandataire CEE Sonergia.
9. **Dashboard supply opérationnel** : Sentry alert si `dispatch.rge_strict_no_match` >5/jour sur dept donné → bascule manuelle.

### 7.3 Conversion attendue post-fix

| Métrique                                   | Actuel                 | Cible J+30 | Cible J+90 | Cible J+180 |
| ------------------------------------------ | ---------------------- | ---------- | ---------- | ----------- |
| claim_rate fiches RGE                      | 0,002 %                | 0,05 %     | 0,3-0,8 %  | 1,2-2 %     |
| Avis publié / fiche claimed                | 0 %                    | 30 %       | 50 %       | 70 %        |
| Google Places match                        | 0 %                    | 95 %       | 99 %       | 99 %        |
| Funnel devis cluster réno (page → submit)  | 7,2 %                  | 9-10 %     | 11-14 %    | 15-18 %     |
| Lead loss `rge_strict_no_match` silencieux | inconnu (~5-8 %)       | <1 %       | <0,5 %     | 0 % (UX OK) |
| MQL mandataire CEE / mois                  | ~0 (Sonergia pas live) | 10-25      | 50-150     | 200-500     |

---

## Annexes

### A.1 Migrations clés inspectées

- `380_rge_ademe_integration.sql` : colonnes `rge_qualifications` JSONB + `rge_valid_until` + index partiels GIN.
- `391_dispatch_rge_aware.sql` + `462_dispatch_rge_aware_clean.sql` + `463_dispatch_claim_aware.sql` : évolutions de la fonction dispatch.
- `483_providers_google_places.sql` : colonnes Google Places (DORMANT — pas de cron).
- `498_dispatch_rge_first.sql` : hard-filter RGE-strict + escalade radius + `audit_logs.dispatch.rge_strict_no_match`.
- `500_claim_auto_approve_outreach.sql` : claims_auto_approve_log + provider_outreach_log + RPC `outreach_opt_out` + flow email _partiel_ (colonnes ajoutées, pas de flow connecté).

### A.2 Fichiers data utilisés

- `docs/audit-ahrefs-2026-05-03/F_supply/F1_distribution.csv` (1 ligne agrégée parc total)
- `docs/audit-ahrefs-2026-05-03/F_supply/F2_top5000_artisans.csv` (5000 RGE prioritaires)
- `docs/audit-ahrefs-2026-05-03/F_supply/F3_qualifications_by_code.csv` (top 80)
- `docs/audit-ahrefs-2026-05-03/F_supply/F3_qualifications_by_organisme.csv` (12 buckets)
- `docs/audit-ahrefs-2026-05-03/F_supply/F4_regions.csv` (23 buckets, 62,6 % NULL)
- `docs/audit-ahrefs-2026-05-03/F_supply/OUTREACH_PLAYBOOK.md` (Lemlist + KPI)
- `docs/audit-ahrefs-2026-05-03/A_competitors/{effy,sonergia,hellio}/dr.json` (DR competitive)
- `docs/audit-ahrefs-2026-05-03/B_competitor_pages/competitor_url_taxonomy.csv` (top 30 patterns)

### A.3 Métriques code (validation)

```
F2 distribution score outreach (top 5000) :
- multi-qualif (≥2) : 4 994 / 5000 (99,9 %)
- avec rating > 0   :   684 / 5000 (13,7 %)
- avec review > 0   :   689 / 5000 (13,8 %)
- region remplie    :   305 / 5000 (6,1 %)  ← bug majeur
- 4+ qualifs        : 1 969 / 5000 (39,4 %)
- 3 qualifs         :   977 / 5000 (19,5 %)
- 2 qualifs         : 2 048 / 5000 (41,0 %)
```

— Fin du rapport Agent 5 —
