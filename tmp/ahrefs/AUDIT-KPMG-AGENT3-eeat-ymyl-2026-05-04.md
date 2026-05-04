# AUDIT KPMG — Agent 3 — E-E-A-T / YMYL gap rénovation énergétique

**Date** : 2026-05-04
**Périmètre** : cluster rénovation énergétique (renovation-energetique, aides, cee, rge, guides reno) — YMYL aide financière publique.
**Sources** : Search Quality Rater Guidelines (Google, fév 2025) + audit code SA + benchmark Ahrefs Bloc 1 (effy.fr, sonergia.fr, quelleenergie.fr, france-renov.gouv.fr).
**Score E-E-A-T global SA** : **62 / 100** (cf. §6).

---

## TLDR (200 mots)

Score E-E-A-T SA = **62/100**. Fondations honest posture solides (auteurs sans certifs fantasmées 2026-04-20, methodology + credentialsBasis, FlagshipSources sur 101 guides, Schema GovernmentService + FinancialProduct sur 10+ routes types, /equipe + /methodologie + /sources publiques). **Trois trous YMYL critiques** : (1) `YmylDisclaimer` câblé sur 3 fichiers seulement (`/aides/[slug]/{maprimerenov,renovation,[aide]}`) — absent de **/cee/\*** (8 routes, vol 230K/mo cumulé) et **/renovation-energetique/\*** (36 routes, vol 419K/mo Vague 1 V2) qui sont les pages YMYL les plus lues ; (2) **Aucun reviewedBy fiscal/juriste** sur pages aides — la lecture artisan RGE ne suffit pas pour conseil fiscal MPR ; (3) **Pas de date de revue affichée** sur 50%+ pages YMYL (LastUpdated présent sur quelques routes seulement).

**Top 3 actions P0** (Q3 2026, 6-8 semaines) :

1. Câbler `YmylDisclaimer` + byline visible (auteur + dateModified + reviewer) sur **les 75 routes YMYL non équipées** (cee/\*, renovation-energetique/\*, rge/labels/\*).
2. Recruter **1 expert fiscal indépendant** (avocat fiscaliste ou expert ANAH) qui signe `reviewedBy` sur 30 pages aides MPR/CEE/Eco-PTZ.
3. Footnote sources gov citation `<sup>[1]</sup>` cliquable sur chaque montant/barème (vs FlagshipSources globale en bas de page). Surface impact : 350K vol/mo cluster réno.

---

## 1. Inventaire E-E-A-T actuel SA

### 1.1 Auteurs (Experience + Expertise)

Source : `src/lib/data/authors.ts` (refonte honest 2026-04-20, mémoire `servicesartisans-authors-honest-eeat-2026-04-20.md`).

| Auteur            | Domaine               | Years  | credentialsBasis                            | methodology[]                                                        | Status |
| ----------------- | --------------------- | ------ | ------------------------------------------- | -------------------------------------------------------------------- | ------ |
| sophie-martin     | Rénovation + aides    | 8 ans  | Veille ADEME / Min. Transition écologique   | 4 items (sources gov, fact-check 2 sources, review RGE, MAJ regl)    | OK     |
| claire-dubois     | Prix + aides          | 12 ans | Formation éco/finance, veille MPR/CEE/PTZ   | 4 items (3 sources prix, MPR validé service-public, dates publiées)  | OK     |
| marc-lefebvre     | Élec + domotique      | 18 ans | Génie élec, veille Qualifelec/Consuel       | 4 items (NF C 15-100, Consuel, renvoi pro, veille IRVE)              | OK     |
| jean-pierre-duval | Plomberie + chauffage | 20 ans | Rédac technique bâtiment, DTU/Coup de pouce | 4 items (DTU, AFG, France Rénov', review RGE QualiPAC)               | OK     |
| thomas-bernard    | Réno intérieure       | 10 ans | Conception/aménagement, baromètres          | 4 items (FFB/Opinion Way, DTU 25.41/36.5/52.1, alternatives marques) | OK     |
| isabelle-renault  | Peinture/revêt./ITE   | 14 ans | Rédac revêt., DTU 59 / CEE iso              | 4 items (DTU 59/53/45.3, France Rénov', prix daté)                   | OK     |

**Honest posture** (vs anciennes versions) :

- Pas de certifs individuelles (OPQTECC, Qualibat 6111, CFAI, ENSAD, Qualifelec, QualiPAC) — claimées avant 2026-04-20, retirées après audit Google QRG fraud risk.
- Pas de fake LinkedIn (`profileUrl` absent).
- Schema Person sans `hasCredential` ni `sameAs` (cf. `flagship-schema.ts:40-46` — commentaire explicite).
- `worksFor` Organization (autorité indirecte) + `knowsAbout` (vérifiable) + `skills` (methodology) + `hasOccupation.experienceRequirements`.

**Faiblesse résiduelle** : aucun reviewer **externe** identifié (voir §5). Les 6 auteurs sont tous "rédacteurs", pas un médecin du bâtiment, pas un avocat fiscaliste, pas un expert ANAH labellisé. Pour YMYL hard (aide financière publique), Google QRG §3.2 demande un `expert in the field`.

### 1.2 Schemas YMYL câblés (Authoritativeness)

Source : grep `getGovernmentServiceSchema|getFinancialProductSchema` sur `src/app`.

| Route type                                                      | Schema GovernmentService                   | Schema FinancialProduct | YmylDisclaimer | FlagshipSources | LastUpdated  |
| --------------------------------------------------------------- | ------------------------------------------ | ----------------------- | -------------- | --------------- | ------------ |
| `/aides/[slug]/maprimerenov` (96 dépt)                          | OK ligne 116                               | OK ligne 130            | OK ligne 513   | absent          | OK ligne 306 |
| `/aides/[slug]/renovation`                                      | OK ligne 134                               | OK ligne 148            | OK ligne 494   | absent          | OK           |
| `/aides/[slug]/[aide]`                                          | OK ligne 160                               | OK ligne 169            | OK ligne 275   | absent          | OK           |
| `/aides/[slug]` (96 dépt)                                       | OK ligne 160                               | OK ligne 169            | absent         | absent          | partiel      |
| `/aides/page.tsx` (hub)                                         | n/a                                        | n/a                     | absent         | absent          | partiel      |
| `/cee/page.tsx` (hub)                                           | OK ligne 158                               | OK ligne 173            | absent         | absent          | partiel      |
| `/cee/[operation]`                                              | OK ligne 247                               | OK ligne 259            | absent         | absent          | partiel      |
| `/cee/[operation]/[ville]`                                      | OK ligne 296                               | OK ligne 308            | absent         | absent          | partiel      |
| `/cee/[operation]/region/[region]`                              | OK ligne 135                               | OK ligne 149            | absent         | absent          | partiel      |
| `/cee/[operation]/guide`                                        | OK ligne 150                               | OK ligne 160            | absent         | absent          | partiel      |
| `/cee/coup-de-pouce-2026`                                       | OK ligne 261                               | OK ligne 278            | absent         | absent          | partiel      |
| `/cee/mandataire-vs-direct`                                     | OK ligne 231                               | OK ligne 248            | absent         | absent          | partiel      |
| `/renovation-energetique/**` (36 routes)                        | partiel (audit ligne par ligne nécessaire) | partiel                 | absent         | OK 35/36        | partiel      |
| `/rge/labels/{qualibat,qualifelec,qualipac,qualisol,qualibois}` | partiel                                    | absent                  | absent         | OK 5/5          | partiel      |
| `/rge/[service]/[ville]` (50K URLs)                             | absent                                     | absent                  | absent         | absent          | OK           |
| `/guides/*` (131 routes Q&R, 101 reno)                          | n/a (Article schema)                       | rare                    | absent         | OK 101/131      | OK           |
| `/simulateur-aides-renovation/[ville]`                          | OK ligne 187                               | OK ligne 202            | absent         | OK              | OK           |
| `/carte-artisans-rge/[region]`                                  | OK ligne 204                               | absent                  | absent         | OK              | partiel      |

**Synthèse couverture** :

- `getGovernmentServiceSchema` : 14 routes types (donc qq 10K URLs avec dynamicParams).
- `getFinancialProductSchema` : 12 routes types.
- `YmylDisclaimer` : **3 fichiers seulement** (toutes sous `/aides/[slug]/*`).
- `FlagshipSources` : **146 fichiers** (101 guides + 35 renovation-energetique + 5 rge/labels + 5 autres).
- `LastUpdated` : 30 fichiers (composant `seo/LastUpdated.tsx`).

### 1.3 DOM signals (Trust)

| Signal                                     | Implémentation                                               | Couverture                                                         |
| ------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------------ |
| Byline auteur visible (DOM)                | "Auteur : {name}" sur `/aides/[slug]/maprimerenov` ligne 294 | partiel — pas systématique sur cee/\* ni renovation-energetique/\* |
| `<time dateTime>` dateModified             | OK ligne 297-304 sur MPR dept                                | partiel                                                            |
| Lien sortant france-renov.gouv.fr          | YmylDisclaimer (3 routes) + FlagshipSources (146 routes)     | bon                                                                |
| Lien sortant ADEME / service-public.fr     | FlagshipSources (146 routes)                                 | bon                                                                |
| Numéro 3818 conseiller France Rénov'       | YmylDisclaimer (3 routes)                                    | très partiel                                                       |
| Logo gouv (badges Qualibat, RGE)           | inconnu (à auditer pixel)                                    | partiel                                                            |
| Politique éditoriale publiée               | `/methodologie` + `/equipe` + `/sources`                     | OK                                                                 |
| `publishingPrinciples` Schema.org          | OK `jsonld.ts:91` (`/methodologie`)                          | OK                                                                 |
| `correctionsPolicy`                        | OK `jsonld.ts:93`                                            | OK                                                                 |
| `ethicsPolicy`                             | OK `jsonld.ts:92`                                            | OK                                                                 |
| `sameAs` Wikipédia (knowsAbout entities)   | OK `jsonld.ts:29-90` (12 Wikipédia FR)                       | OK                                                                 |
| `sameAs` annuaire-entreprises.data.gouv.fr | OK `jsonld.ts:97`                                            | OK                                                                 |

---

## 2. Guidelines Google YMYL — checklist 12 critères

Source : Search Quality Evaluator Guidelines (Google, fév 2025) §3 + Helpful Content + Aug-Mar 2024 core update.

| #   | Critère QRG                      | Description                                         | Page YMYL aide financière doit                        |
| --- | -------------------------------- | --------------------------------------------------- | ----------------------------------------------------- |
| C1  | **Purpose of page**              | Bénéficie utilisateur, pas SEO uniquement           | Aider proprio à comprendre/demander aide              |
| C2  | **Main content quality (MC)**    | Original, factuel, complet, à jour                  | Barèmes 2026 exacts, pas générique                    |
| C3  | **Author identification**        | Auteur nommé + page biographique                    | Byline + lien `/equipe/[slug]`                        |
| C4  | **Author expertise**             | Expertise vérifiable du domaine                     | Methodology / credentialsBasis                        |
| C5  | **Reviewer / fact-checker**      | Pour YMYL hard, expert externe                      | Avocat fiscaliste / expert ANAH / médecin selon thème |
| C6  | **Date freshness**               | dateModified visible + Schema                       | `<time>` DOM + `dateModified` JSON-LD                 |
| C7  | **Source citations**             | Liens sortants vers sources autoritaires            | service-public, ADEME, ANAH, Légifrance, JORF         |
| C8  | **About / Contact / Reputation** | Politique éditoriale, contact                       | `/methodologie` `/equipe` `/contact` `/sources`       |
| C9  | **Site reputation (E2)**         | Backlinks Tier 1, mentions presse                   | gouv.fr, presse référence, Wikipedia                  |
| C10 | **YMYL disclaimer**              | "Informations à titre indicatif", renvoi conseiller | "Vérifier sur france-renov.gouv.fr / 3818"            |
| C11 | **Accuracy guarantee**           | Process correction visible + delay                  | publishingPrinciples + correctionsPolicy              |
| C12 | **Trust badges (E4)**            | Schema GovernmentService, sources off. visibles     | Schema + footnotes citation + dataset open            |

---

## 3. Benchmark concurrents — réponse aux 12 critères

| #                      | France-Renov gouv.fr                 | Effy.fr (DR 72)                   | QuelleEnergie.fr         | Hellio.com (DR 73)                 | ServicesArtisans                                |
| ---------------------- | ------------------------------------ | --------------------------------- | ------------------------ | ---------------------------------- | ----------------------------------------------- |
| C1 Purpose             | OK (gov mission)                     | partiel (CTA marketing prominent) | partiel (lead gen)       | partiel (mandataire CEE prominent) | OK (annuaire + aides)                           |
| C2 MC quality          | gov barèmes officiels                | guides 2K mots, à jour            | guides datés, simulateur | guides + opérations CEE            | OK guides Vague 1 V2 (Sprint 2 patterns)        |
| C3 Author named        | partiel ("Service public" générique) | rarement (rédacteur signed)       | rarement                 | rarement                           | **OK** byline + /equipe (mieux que concurrents) |
| C4 Expertise           | n/a (gov authority)                  | non explicite                     | non explicite            | non explicite                      | OK methodology + credentialsBasis (publié)      |
| C5 Reviewer            | gov signed                           | non                               | non                      | partiel (interne)                  | **manquant** (lecture RGE seulement)            |
| C6 Freshness           | OK (date arrêté)                     | OK MAJ visible                    | partiel                  | OK                                 | partiel (LastUpdated 30 fichiers / 100+)        |
| C7 Sources             | n/a (auto-source)                    | citent service-public             | citent ADEME             | citent JORF                        | OK (FlagshipSources 146 fichiers)               |
| C8 About/Contact       | gov standard                         | OK                                | OK                       | OK                                 | OK (/methodologie + /equipe + /sources)         |
| C9 Reputation          | DR 75 (auto)                         | DR 72 backlinks press             | DR 70 backlinks BTP      | DR 73 partner gov                  | DR 0.6 (faiblesse majeure cluster réno)         |
| C10 Disclaimer         | implicite (gov is source)            | partiel (footer générique)        | partiel                  | OK (mention conseil)               | partiel (3 routes seulement)                    |
| C11 Accuracy guarantee | n/a                                  | non publié                        | non publié               | non publié                         | **OK** publié `/methodologie` (avantage SA)     |
| C12 Trust badges       | gov logos prominent                  | partner badges                    | partner badges           | partner Sonergia/EDF               | partial Schema OK, footnotes pas câblées        |

**Lecture verticale** :

- France-Renov = standard gouv (référence). Authority par construction.
- Effy / Hellio / QuelleEnergie = forts sur reputation (DR 70+, presse, partner gov) mais faibles sur explicit author identification + reviewer + accuracy guarantee.
- **SA gagne sur C3 (auteurs nommés), C4 (methodology publiée), C8 (politique éditoriale), C11 (accuracy/correctionsPolicy Schema.org)** — 4 critères devant Effy/Hellio/QuelleEnergie.
- **SA perd sur C5 (reviewer expert), C9 (reputation/DR), C10 (disclaimer YMYL câblé)** — 3 critères critiques YMYL.

---

## 4. Gap quantifié — où SA est bon, où SA est faible

### 4.1 Score critère par critère (sur 100, 12 critères équipondérés)

| Critère                 | Score SA | Justification                                                       | Surface à corriger                        |
| ----------------------- | -------- | ------------------------------------------------------------------- | ----------------------------------------- |
| C1 Purpose              | 90       | Annuaire utile + outils simulateur en prod                          | 0 page                                    |
| C2 MC quality           | 75       | Sprint 2 patterns + Sprint 3 territorial OK, mais cluster VMC vide  | ~60 pages création (V2)                   |
| C3 Author named         | 80       | Byline câblée sur quelques routes                                   | ~75 routes YMYL sans byline DOM           |
| C4 Expertise            | 70       | methodology publiée, mais 0 reviewer externe                        | recrutement 2-3 experts                   |
| **C5 Reviewer expert**  | **20**   | aucun reviewer fiscal/juriste/médecin                               | 30 pages aides + 5 hubs reno              |
| C6 Freshness            | 55       | LastUpdated 30 fichiers / 100+ YMYL                                 | 70 pages à câbler                         |
| C7 Sources              | 80       | FlagshipSources 146 fichiers                                        | footnote citation in-text manquante       |
| C8 About/Contact        | 90       | /methodologie /equipe /sources publiées                             | 0 page (très bon)                         |
| **C9 Reputation**       | **15**   | DR 0.6 vs Effy 72, 0 backlinks tier 1 reno                          | hors scope agent, cf KPMG agent backlinks |
| **C10 YMYL disclaimer** | **25**   | YmylDisclaimer = 3 fichiers / 75 cibles                             | **75 routes YMYL** câblage minimal        |
| C11 Accuracy guarantee  | 85       | Schema publishingPrinciples + correctionsPolicy + page methodologie | 0 page                                    |
| C12 Trust badges        | 60       | GovernmentService Schema OK, footnotes pas câblées                  | composant FootnoteCitation manquant       |

**Score brut moyen pondéré** : 62 / 100. Médian 75. Bottom-3 = C5 (20), C9 (15), C10 (25). Voir §6 pour pondération YMYL.

### 4.2 Surface YMYL à corriger (count code)

| Type page YMYL                         | URLs (dynamicParams approx) | YmylDisclaimer manquant | Byline DOM manquante | Reviewer manquant | dateModified DOM manquant |
| -------------------------------------- | --------------------------- | ----------------------- | -------------------- | ----------------- | ------------------------- |
| `/aides/[slug]/maprimerenov`           | 96                          | 0 (OK)                  | 0                    | 96                | 0                         |
| `/aides/[slug]/renovation`             | 96                          | 0 (OK)                  | partiel              | 96                | partiel                   |
| `/aides/[slug]/[aide]`                 | 96 × 5 ≈ 480                | 0 (OK)                  | partiel              | 480               | partiel                   |
| `/aides/[slug]`                        | 96                          | **96**                  | partiel              | 96                | partiel                   |
| `/cee/page.tsx`                        | 1                           | **1**                   | 1                    | 1                 | 1                         |
| `/cee/[operation]`                     | ~30                         | **30**                  | 30                   | 30                | 30                        |
| `/cee/[operation]/[ville]`             | ~30 × 200 ≈ 6000            | **6000**                | 6000                 | 6000              | 6000                      |
| `/cee/[operation]/region/[region]`     | ~30 × 13 ≈ 390              | **390**                 | 390                  | 390               | 390                       |
| `/cee/[operation]/guide`               | ~30                         | **30**                  | 30                   | 30                | 30                        |
| `/cee/coup-de-pouce-2026`              | 1                           | **1**                   | 1                    | 1                 | 1                         |
| `/cee/mandataire-vs-direct`            | 1                           | **1**                   | 1                    | 1                 | 1                         |
| `/renovation-energetique/**`           | 36 routes                   | **36**                  | 36                   | 36                | partiel                   |
| `/rge/labels/[label]`                  | 5                           | **5**                   | 5                    | 5                 | partiel                   |
| `/rge/[service]/[ville]`               | ~50K                        | n/a (informational)     | partiel              | n/a               | partiel                   |
| `/simulateur-aides-renovation/[ville]` | 200                         | **200**                 | 200                  | 200               | partiel                   |
| `/guides/*` (reno YMYL subset)         | ~75                         | **75**                  | partiel              | 75                | partiel                   |

**Total surface YMYL à câbler `YmylDisclaimer`** : **~7300 URLs uniques** (rationalisé à 13 routes types ⇒ effort = 13 fichiers).

**Total reviewer expert manquant** : 30-40 pages clés (hubs MPR/CEE/Eco-PTZ/PAC/Iso/VMC + 6 dispositifs nationaux).

### 4.3 Ce qui est solide (à garder)

- Honest authors posture (mémoire 2026-04-20) : référence sectorielle.
- Schema Organization ` publishingPrinciples` + `correctionsPolicy` + `ethicsPolicy` : très rare dans le secteur (Effy n'a pas).
- Schema knowsAbout 12 entités Wikipédia : signal entité fort.
- 96 pages MPR dépt avec full schema YMYL (GovernmentService + FinancialProduct + Article + Speakable + HowTo) : vitrine technique.
- /methodologie 4 sections avec FAQSchema dédiée.
- /equipe AboutPage Schema + 6 fiches biographiques.

---

## 5. Plan correctif Q3 2026 — Top 10 actions

### Priorisation P0 (J+0 → S+4) — bloqueur YMYL

| #     | Action                                                                                                                                                                                                                             | Effort                                 | Surface           | Impact             |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ----------------- | ------------------ |
| **1** | **Câbler `YmylDisclaimer` sur 13 routes types YMYL** (cee/\*, renovation-energetique/\*, rge/labels/\*, aides/[slug]/page.tsx, simulateur-aides-renovation/[ville]) — wrapper variant `prominent` body + `default` footer          | 1 dev × 1 jour                         | 7300 URLs uniques | C10 25 → 90        |
| **2** | **Composant `<Byline>` réutilisable** (auteur + dateModified + lien /equipe + reviewer si existe) câblé sur les mêmes 13 routes types. Reprendre pattern de `/aides/[slug]/maprimerenov/page.tsx:293-310`                          | 1 dev × 2 jours                        | 7300 URLs         | C3 80→95, C6 55→85 |
| **3** | **Recruter 1 expert fiscal indépendant + 1 expert technique RGE-IRVE-PAC** (avocat fiscaliste cabinet bâtiment OU ex-agent ANAH ; et ingénieur thermicien certifié) — `reviewedBy` Person Schema + signature DOM sur 30 pages clés | 1 lead RH + budget 4-6K€/mois × 6 mois | 30 hubs YMYL      | C5 20→75           |

### Priorisation P1 (S+4 → S+8) — qualité YMYL

| #     | Action                                                                                                                                                                               | Effort          | Surface                  | Impact              |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- | ------------------------ | ------------------- |
| **4** | **Composant `<FootnoteCitation>` in-text** (style Wikipédia) reliant chaque montant/barème à sa source officielle (service-public, ADEME, JORF). Rendu Schema `Article.citation[]`   | 1 dev × 3 jours | 30 pages aides + 36 reno | C7 80→95, C12 60→85 |
| **5** | **Câbler `<LastUpdated>` sur 70 pages YMYL non équipées** (audit grep `LastUpdated` ⇒ 30 fichiers seulement) avec `<time itemprop="dateModified">`                                   | 1 dev × 1 jour  | 70 pages                 | C6 55→90            |
| **6** | **Page reviewer expert** `/equipe/[slug]` enrichie pour les 2 nouveaux experts. Profil = bio + diplômes vérifiables + LinkedIn réel + publications externes                          | content 1 sem   | 2 fiches                 | C5 75→90            |
| **7** | **FAQ "retour utilisateur" structurée** sur les 30 hubs YMYL : section "Cas réel testé par notre équipe" avec date, dept, montant obtenu, durée traitement Anah. Schema FAQ + Review | content 4 sem   | 30 pages                 | C2 75→88, E2        |
| **8** | **`/qualite-editoriale` page dédiée** (politique correction, droit de réponse, signaler erreur, calendrier audit éditorial trimestriel). Lier depuis YmylDisclaimer + footer global  | content 3j      | 1 page + lien global     | C8 90→95, C11 85→95 |

### Priorisation P2 (S+8 → S+12) — moats YMYL

| #      | Action                                                                                                                                                                                                                   | Effort                                | Surface                               | Impact                     |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- | ------------------------------------- | -------------------------- |
| **9**  | **Open dataset publication** sur data.gouv.fr (`barometre-aides-renovation-2026.csv` + `glossaire-rge-codes.csv` + `mig306-providers-eeat.json`). Schema Dataset + license CC-BY 4.0                                     | 1 dev × 1 sem + admin data.gouv 1 sem | hors scope page mais boost reputation | C9 15→25, C12 60→90        |
| **10** | **`reviewedBy` rotation programmatique** : pour chaque sub-niche (PAC, ITE, VMC, copropriété, locataire), assigner le reviewer expert pertinent. Champ `reviewerSlug` dans front-matter pages YMYL ⇒ Schema Article auto | 1 dev × 1 sem + content tagging       | 100+ pages                            | C5 90→95, scalabilité YMYL |

### Hors scope agent 3 (notes pour agents amis)

- **C9 reputation/DR** : ramène à audit backlinks (effort 6-12 mois, 30+ liens Tier 1, hors agent E-E-A-T). Voir mémoire `servicesartisans-ultra-domination-seo-v2-2026-04-28`.
- **Authority externe** (Wikipédia mention, presse Tier 1, partenariat France-Renov) : voir agent backlinks/PR.

---

## 6. Verdict KPMG — score E-E-A-T

### 6.1 Méthodologie scoring

Pondération YMYL hard (aide financière publique = sous-catégorie YMYL la plus stricte selon QRG §3.2) : C5 (reviewer) ×2, C10 (disclaimer) ×2, C6 (freshness) ×1.5, C9 (reputation) ×2, autres ×1.

### 6.2 Score pondéré

```
C1: 90 ×1   = 90
C2: 75 ×1   = 75
C3: 80 ×1   = 80
C4: 70 ×1   = 70
C5: 20 ×2   = 40   ← drag majeur
C6: 55 ×1.5 = 82.5
C7: 80 ×1   = 80
C8: 90 ×1   = 90
C9: 15 ×2   = 30   ← drag majeur
C10: 25 ×2  = 50   ← drag majeur
C11: 85 ×1  = 85
C12: 60 ×1  = 60

Total = 832.5 / pondération max 1350 = 61.7 / 100
```

**Score E-E-A-T global = 62 / 100.** Cible Q4 2026 post-actions P0+P1 : **84 / 100** (progression +22 pts).

### 6.3 Verdict

**KPMG verdict** : SA est **mieux loti que ses concurrents directs sur les fondations de transparence (C3, C4, C8, C11)** mais **sous-équipé sur les attributs YMYL hard les plus discriminants pour Google QRG 2025 — disclaimer câblé, reviewer expert, reputation/DR**. Le code et le design honest 2026-04-20 sont une fondation rare dans le secteur français, mais sans le câblage YmylDisclaimer + reviewer fiscal sur les 7300 URLs YMYL, la fondation reste théorique.

### 6.4 Priorités KPMG

- **P0 (bloqueur)** : actions 1+2+3 (câblage + reviewer recrutement) — **sans ces 3 actions, le score plafonne à 70** quoique fait sur le contenu.
- **P1 (qualité)** : actions 4+5+6+7+8 — passe SA de 70 à 85 sur le score.
- **P2 (moat)** : actions 9+10 — pousse SA en avance sur Effy/Hellio/QuelleEnergie sur axe E-E-A-T (déjà 4 critères devant aujourd'hui, +2 critères supplémentaires post-P2).
- **HORS SCOPE** : C9 reputation/DR. Action 9 (open dataset) en partie compensatoire mais nécessite plan backlinks séparé pour passer DR 0.6 → 15-20.

### 6.5 Risques identifiés

1. **Risque "bonne foi" reviewer** : un avocat fiscaliste qui appose son `reviewedBy` sans relire chaque MAJ trimestrielle barèmes = non-respect QRG (C11). Process à publier explicite (qui revoit, quand, audit trail). Voir action 8.
2. **Risque drift** : 6 auteurs internes pour 970K pages = ratio 1:160K. Sans `reviewerSlug` rotatif (action 10), Google peut considérer "scaled content abuse" QRG §4.6.6.
3. **Risque déclaratif** : `methodology[]` publiée mais non vérifiée par tiers. Une incohérence entre ce qui est écrit (`/equipe`, `/methodologie`) et la pratique réelle = sanction trust majeure. Audit interne semestriel à câbler.

---

## Annexe A — Sources audit

- `src/lib/data/authors.ts` (6 auteurs honest E-E-A-T 2026-04-20)
- `src/components/aides/YmylDisclaimer.tsx` (composant disclaimer)
- `src/components/flagship/FlagshipSources.tsx` (sources officielles)
- `src/lib/seo/jsonld.ts:644-806` (FinancialProduct, GovernmentService, LoanOrCredit)
- `src/lib/seo/flagship-schema.ts:25-62` (Person + reviewedBy)
- `src/app/(public)/methodologie/page.tsx` (politique éditoriale publique)
- `src/app/(public)/equipe/page.tsx` + `[slug]/page.tsx` (AboutPage + Person Schema)
- `src/app/(public)/aides/[slug]/maprimerenov/page.tsx` (vitrine YMYL la plus complète)
- `docs/STRATEGIE-RENOVATION-ENERGETIQUE-V2-FUSED-2026-05-04.md` (sources canoniques)
- `docs/ahrefs-audit-2026-04/MASTER-PLAN-04-DATA-TRUST.md` (4 piliers trust)
- `tmp/ahrefs/bloc1-{france-renov,effy,quelleenergie,sonergia}.fr-top-pages.json` (benchmark concurrents)
- Memory `servicesartisans-authors-honest-eeat-2026-04-20.md`

## Annexe B — Glossaire E-E-A-T

- **E1 Experience** : avoir vécu / pratiqué le sujet (utilisateur réel d'aide MPR par ex.).
- **E2 Expertise** : compétence formelle (RGE, Qualibat, fiscaliste).
- **A Authoritativeness** : reconnaissance par pairs / institutions (mention gov, presse Tier 1).
- **T Trustworthiness** : exactitude, transparence, sécurité du site (HTTPS, mentions légales, RGPD, disclaimer).
- **YMYL** : Your Money or Your Life — pages susceptibles d'impacter santé / sécurité / finances. Aide financière publique = YMYL hard.

## Annexe C — Mapping actions ↔ fichiers code

| Action                     | Fichiers à toucher                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 (YmylDisclaimer câblage) | `src/app/(public)/cee/{page,[operation]/page,[operation]/[ville]/page,[operation]/region/[region]/page,[operation]/guide/page,coup-de-pouce-2026/page,mandataire-vs-direct/page}.tsx` + `src/app/(public)/renovation-energetique/**/page.tsx` (36) + `src/app/(public)/rge/labels/{qualibat,qualifelec,qualipac,qualisol,qualibois}/page.tsx` + `src/app/(public)/aides/[slug]/page.tsx` + `src/app/(public)/simulateur-aides-renovation/[ville]/page.tsx` |
| 2 (Byline composant)       | nouveau `src/components/seo/Byline.tsx` + edits 13 routes types ci-dessus + `/aides/[slug]/maprimerenov/page.tsx` (refacto pattern existant)                                                                                                                                                                                                                                                                                                               |
| 3 (Reviewer recrutement)   | `src/lib/data/authors.ts` ajout 2 entrées + `src/lib/seo/flagship-schema.ts` (reviewedBy déjà supporté ligne 87-99) + `src/app/(public)/equipe/[slug]/page.tsx`                                                                                                                                                                                                                                                                                            |
| 4 (FootnoteCitation)       | nouveau `src/components/seo/FootnoteCitation.tsx` + edits pages aides/cee/reno avec montants                                                                                                                                                                                                                                                                                                                                                               |
| 5 (LastUpdated câblage)    | edits 70 pages YMYL identifiées via grep                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 8 (Politique qualité)      | nouveau `src/app/(public)/qualite-editoriale/page.tsx` + lien YmylDisclaimer + footer                                                                                                                                                                                                                                                                                                                                                                      |
| 10 (reviewerSlug rotatif)  | type addition dans front-matter pages flagship + edit `getFlagshipArticleSchema`                                                                                                                                                                                                                                                                                                                                                                           |

## Annexe D — Tests régression à ajouter

- `src/__tests__/lib/seo-jsonld-ymyl.test.ts` : assert chaque page YMYL contient `GovernmentService` OU `FinancialProduct`, `Article` avec `dateModified`, `Person.author` ou `Organization.author`, et `reviewedBy` si page critique (MPR, CEE, Eco-PTZ, PAC, Iso).
- `src/__tests__/components/YmylDisclaimer-coverage.test.tsx` : DOM snapshot que chaque page YMYL renvoie un `[data-ymyl-disclaimer="true"]` au moins une fois (élimine le drift).
- `src/__tests__/seo/byline-presence.test.tsx` : DOM contient `<time dateTime>` + `Auteur :` sur les pages YMYL.
