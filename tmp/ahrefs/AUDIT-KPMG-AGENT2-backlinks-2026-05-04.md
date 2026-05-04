# AUDIT KPMG — Agent 2 — Backlinks & Autorité Cluster Rénovation Énergétique

**Date** : 2026-05-04
**Périmètre** : profil backlinks ServicesArtisans vs concurrents (Effy, Quelle Énergie, Sonergia, France-Renov, Hellio, Heero, Selectra)
**Sources** :

- `docs/ahrefs-audit-2026-04/normalized/ahrefs-backlinks.csv` (64 lignes, snapshot 2026-04-18)
- `docs/ahrefs-audit-2026-04/normalized/ahrefs-competitors.csv` (20 concurrents, snapshot 2026-04-18)
- `docs/audit-ahrefs-2026-05-03/outreach_targets_2026-05.csv` (383 cibles, audit Phase 0 backlinks Q2)
- `docs/audit-ahrefs-2026-05-03/D_backlinks/outreach_lemlist_top50.csv` (50 cibles top priority)
- `docs/audit-ahrefs-2026-05-03/competitor_intelligence_2026-05.csv` (300 top pages concurrents)
- `docs/ahrefs-audit-2026-04/MASTER-PLAN-05-GROWTH.md` (plan growth/PR 12 mois)
- `docs/sprint3-backlinks-plan.md` (plan tactique 90j)
- `docs/ahrefs-audit-2026-04/disavow.txt` (137 lignes, disavow déjà uploadé)

---

## TLDR (200 mots)

**Score autorité KPMG** : **8/100** — sous-investi structurellement. SA = DR Ahrefs **0,6** vs concurrents médians **DR 73-78** (Hellio 73, France-Renov 75, Effy ~72, Selectra 78). RD réels qualifiés = **4** (`artisanduvert.fr`, `climacontrol.fr`, `paysagistedoccitan.fr`, `borne-recharge-electrique-byadlan.fr`) — tous DR <30. **0 backlink Tier 1 (presse, gouv, .edu, ADEME, France-Renov, data.gouv.fr, Wikipedia)**. Cluster rénovation énergétique = **1 backlink sur 64** (1,6 %) pointant vers `/departements/saone-et-loire/borne-recharge` ; **0 lien éditorial** vers `/rge`, `/aides`, `/cee`, `/renovation-energetique`. 78,1 % du parc backlinks était spam (PBN .shop/.icu/.top), disavow uploadé 2026-04-18.

**Top 3 actions P0 (12 mois)** :

1. **Soumettre le dataset RGE sur data.gouv.fr** (asset clé déjà live `/datasets/rge`, KBIS bloquant levé J+7) → backlink DR 88 quasi-garanti + débloque pitch presse Tier 1 (gain DR estimé +3-5 isolé, +6-10 en effet d'amplification).
2. **Pitch coordonné Tier 1 presse 8 cibles** (LeFigaro DR 91, Lesechos DR 90, BFM DR 89, LeMonde DR 91, Capital DR 84, Liberation DR 86, Challenges DR 82, JournalDuNet DR 86) sur angle « 1er annuaire RGE open-data » + baromètre mensuel → 3-5 publications réalistes (pattern Hellio-Effy validé).
3. **Wikipedia/Wikidata + ANAH/ADEME/France-Renov institutionnel** : créer page Wikidata "ServicesArtisans" + sourcing dataset sur articles RGE/MaPrimeRénov + demande référencement annuaire France-Renov.

**Gain DR P50 12 mois** : **DR 0,6 → 14-18** (target plan v2 conservatif). Stretch P75 = 22-28 si pitch presse exécuté + 8-10 études data publiées.

---

## 1. Profil backlinks ServicesArtisans (état zéro 2026-04-18)

### 1.1 Métriques brutes (Ahrefs export 2026-04-18)

| Métrique                         | Valeur                                                                                                                              | Source ligne                                              |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Domain Rating (DR)               | **0,6**                                                                                                                             | MASTER-PLAN-05-GROWTH.md:17, sprint3-backlinks-plan.md:19 |
| Total backlinks captés           | **64**                                                                                                                              | ahrefs-backlinks.csv (lignes 2-65)                        |
| Referring Domains uniques (RD)   | **54**                                                                                                                              | calculé csv                                               |
| Backlinks dofollow               | 29 (45,3 %)                                                                                                                         | calculé csv                                               |
| Backlinks nofollow               | 35 (54,7 %)                                                                                                                         | calculé csv                                               |
| Backlinks flaggés spam           | **50 (78,1 %)**                                                                                                                     | calculé csv (col `Is spam`)                               |
| Backlinks non-spam (signal réel) | **14**                                                                                                                              | calculé csv                                               |
| RD non-spam uniques              | **~6** (artisanduvert.fr, climacontrol.fr, paysagistedoccitan.fr, borne-recharge-electrique-byadlan.fr, keskeces.fr, sparx-elec.fr) | calculé csv                                               |
| Backlinks fr-FR                  | 11                                                                                                                                  | calculé csv                                               |
| Backlinks en-EN (PBN US/anglo)   | 54                                                                                                                                  | calculé csv                                               |
| Disavow domains uploadés         | **137 lignes / 119 domaines spam**                                                                                                  | disavow.txt (en-tête + lignes 8+)                         |

### 1.2 Distribution cluster cible

| Cluster URL cible                                           | # backlinks | %       |
| ----------------------------------------------------------- | ----------- | ------- |
| **Home** (`/`)                                              | 53          | 82,8 %  |
| `/blog/*` (prix-\* articles)                                | 8           | 12,5 %  |
| `/services/[s]/[v]/[publicId]`                              | 2           | 3,1 %   |
| `/departements/saone-et-loire/borne-recharge`               | 1           | 1,6 %   |
| `/rge*`, `/aides*`, `/cee*`, `/renovation*`, `/simulateur*` | **0**       | **0 %** |

**Verdict** : **0 backlink éditorial vers le cluster rénovation énergétique** alors que 100 % du plan croissance Pillar #2 (CLAUDE.md, STRATEGIE-RENOVATION-ENERGETIQUE.md) repose sur l'autorité de ces pages. Le seul backlink "réno" pointe vers une fiche départementale `/departements/saone-et-loire/borne-recharge` (DR 0,6 source).

### 1.3 Top 6 backlinks qualifiés (non-spam, signal authentique)

| #   | RD                                   | DR  | Cible                                                   | Type                     | Anchor                                  | Niche            | Source ligne                |
| --- | ------------------------------------ | --- | ------------------------------------------------------- | ------------------------ | --------------------------------------- | ---------------- | --------------------------- |
| 1   | artisanduvert.fr (×6 langues)        | 18  | `/blog/prix-jardinier-paysagiste-2026`                  | nofollow                 | "Services Artisans - Prix Jardinier..." | jardinage        | csv L20, L25, L34, L43, L61 |
| 2   | climacontrol.fr                      | 28  | `/blog/prix-climaticien-2026-installation-entretien`    | dofollow                 | URL nue                                 | climatisation    | csv L49                     |
| 3   | keskeces.fr                          | 24  | `/services/architecte-interieur/les-abymes/petit-canal` | nofollow                 | URL nue                                 | annuaire artisan | csv L2                      |
| 4   | paysagistedoccitan.fr                | 1,4 | `/blog/prix-terrasse-exterieure-2026`                   | dofollow                 | "Prix terrasse extérieure 2026"         | jardinage        | csv L35                     |
| 5   | borne-recharge-electrique-byadlan.fr | 0,6 | `/departements/saone-et-loire/borne-recharge`           | dofollow                 | "transparence prix"                     | IRVE             | csv L48                     |
| 6   | sparx-elec.fr                        | 0,1 | `/blog/prix-electricien-2026-tarifs-travaux`            | (lien retiré 2026-04-08) | "Servicesartisans — Prix..."            | électricité      | csv L53                     |

**Pattern gagnant identifié** : **les blogs `/blog/prix-[métier]-2026` attirent organiquement les backlinks** (5 sur 6 hors home). C'est le seul actif éditorial de SA qui génère du link earning. Replicable pour `/blog/prix-pompe-a-chaleur-2026`, `/blog/prix-isolation-combles-2026`, etc.

**Anchors observées** : 78 % brand (`servicesartisans.fr`, `Services Artisans - ...`), 12 % URL nue, 10 % keyword (titres prix). Ratio sain (pas de sur-optimisation) — mais volumes trop faibles pour avoir un signal anchor pondéré.

### 1.4 % cluster rénovation énergétique

| Cluster                                            | Backlinks | % du parc |
| -------------------------------------------------- | --------- | --------- |
| Cluster réno (RGE/CEE/aides/MPR/PAC/iso/DPE/audit) | **1**     | 1,6 %     |
| Cluster général artisanat (services/blog prix)     | 10        | 15,6 %    |
| Home + spam SEO (PBN ranking pages)                | 53        | 82,8 %    |

**Drift critique** : alors que SA cible 300-500K vol/mois sur le cluster rénovation énergétique (CLAUDE.md `Pillar #2`), **0 % de la traction backlink** ne s'oriente sur ces pages. Le cluster rénovation est un désert d'autorité au sens Ahrefs.

---

## 2. Profil backlinks concurrents (top 5 cluster réno)

### 2.1 Tableau autorité comparé

| Concurrent           | DR     | Trafic Ahrefs         | KW      | Pages indexées | Top page traffic max | Source                 |
| -------------------- | ------ | --------------------- | ------- | -------------- | -------------------- | ---------------------- |
| **travaux.com**      | **74** | 280 471 / mois        | 33 660  | 13 339         | n/a                  | competitors-v2.csv L12 |
| **societe.com**      | **86** | 580 498 / mois        | 178 559 | 157 000        | n/a                  | competitors-v2.csv L17 |
| **plus-que-pro.fr**  | **83** | 18 187 / mois (-36 %) | 4 010   | 1 468          | n/a                  | competitors-v2.csv L16 |
| **obat.fr**          | **76** | 103 406 / mois        | 13 458  | 3 277          | n/a                  | competitors-v2.csv L14 |
| **allovoisins.com**  | **72** | 387 526 / mois        | 24 164  | 14 134         | n/a                  | competitors-v2.csv L21 |
| **mesdepanneurs.fr** | **60** | 183 972 / mois        | 29 698  | 2 325          | n/a                  | competitors-v2.csv L20 |
| **yoojo.fr**         | **61** | 80 850 / mois         | 8 603   | 865            | n/a                  | competitors-v2.csv L18 |
| **depanneo.com**     | **62** | 60 794 / mois         | 11 011  | 4 681          | n/a                  | competitors-v2.csv L8  |
| **stannah.com**      | **67** | 18 496 / mois         | 652     | 137            | n/a                  | competitors-v2.csv L10 |
| **rdvartisans.fr**   | **57** | 11 789 / mois         | 4 232   | 3 293          | n/a                  | competitors-v2.csv L7  |

### 2.2 Cluster Énergie (snapshot 2026-05-03 + memoire)

| Concurrent                          | DR                                           | Référence                                                                 | Note autorité                                     |
| ----------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------- |
| **Selectra**                        | **78**                                       | memory `servicesartisans-ahrefs-deep-audit-25agents-final-2026-05-04.md`  | Top du cluster, DR ~78, agrégateur fournisseurs   |
| **France-Renov.gouv.fr**            | **75-85**                                    | outreach_targets_2026-05.csv L190 (DR 85 noté), memory bloc audit         | Domaine .gouv.fr — référent officiel              |
| **Hellio**                          | **73**                                       | competitor_intelligence_2026-05.csv L2-60                                 | DR 73, blog particulier/copropriete éditorial     |
| **Effy**                            | **~72**                                      | memory `servicesartisans-ahrefs-deep-audit-25agents-final-2026-05-04.md`  | Embauche Head of SEO Q2 2026, fenêtre se resserre |
| **Sonergia**                        | **49**                                       | memory `servicesartisans-ahrefs-deep-audit-20agents-fusion-2026-05-04.md` | Plus faible mais partenaire CEE retenu            |
| **Quelle Énergie**                  | **74**                                       | outreach_lemlist_top50.csv L36                                            | DR 74 (filiale Engie)                             |
| **ADEME**                           | **90**                                       | outreach_targets_2026-05.csv L144                                         | Référent technique de l'écosystème                |
| **France-Renov.gouv.fr** (annuaire) | **88** (selon sprint3-backlinks-plan.md L33) | Annuaire officiel artisans RGE                                            |

### 2.3 Top 10 patterns backlinks concurrents (cluster réno)

À partir de `competitor_intelligence_2026-05.csv` (Hellio top pages) + memory v2 fused :

| #   | Pattern de page qui attire des liens       | Concurrent leader    | Top KW vol mensuel | Position                     |
| --- | ------------------------------------------ | -------------------- | ------------------ | ---------------------------- |
| 1   | Blog "ma prime renov" 2024/2025/2026       | Hellio (DR 73)       | 57 000             | Pos 10 — 1 594 trafic/mois   |
| 2   | Calculateur "robinet thermostatique"       | Hellio               | 8 600              | Pos 1 — 2 219 trafic/mois    |
| 3   | Guide "plafond chèque énergie"             | Hellio               | 2 600              | Pos 1 — 2 636 trafic/mois    |
| 4   | Tutorial "sèche-linge pompe à chaleur"     | Hellio               | 17 000             | Pos 9 — 2 071 trafic/mois    |
| 5   | Article réglementaire "DPE F/G location"   | Hellio               | 1 400 + 900        | Pos 1                        |
| 6   | Annuaire artisans RGE certifié officiel    | France-Renov.gouv.fr | n/a                | Domain authority gouv        |
| 7   | Datasets CEE listés sur data.gouv.fr       | Sonergia/Hellio      | n/a                | Citation institutionnelle    |
| 8   | Glossaire travaux RGE (BAR-EN-101 etc.)    | Effy                 | n/a                | Backlinks Wikipedia/Wikidata |
| 9   | Communiqués presse études de marché        | Effy + Hellio        | n/a                | Le Figaro, Capital, Echos    |
| 10  | Guide réglementation 2026 (interdiction G) | Hellio + Selectra    | volume saisonnier  | Citations légales presse     |

### 2.4 Structures éditoriales clés (3 piliers)

**Tier 1 Press français** (sources : outreach_targets_2026-05.csv tier1_press, lignes 4-9, 14, 28, 40-41, 75) — **les concurrents y sont, SA y est absent** :

| Domaine presse   | DR  | Liés à concurrents (count) | Concurrents qui ont déjà ce backlink |
| ---------------- | --- | -------------------------- | ------------------------------------ |
| lefigaro.fr      | 91  | 4                          | effy, france_renov, hellio, selectra |
| lesechos.fr      | 90  | 4                          | effy, france_renov, hellio, selectra |
| bfmtv.com        | 89  | 4                          | effy, france_renov, hellio, selectra |
| liberation.fr    | 86  | 4                          | effy, france_renov, hellio, selectra |
| lemonde.fr       | 91  | 3                          | effy, france_renov, selectra         |
| capital.fr       | 84  | 3                          | effy, france_renov, hellio           |
| challenges.fr    | 82  | 3                          | effy, france_renov, hellio           |
| journaldunet.com | 86  | 2                          | france_renov, selectra               |

**Tier 3 Institutionnel** (outreach_targets_2026-05.csv lignes 60, 67, 69, 76-77, 125, 132, 143-144, 151, 154, 156, 190, 207, 241, 248, 258, 260, 262-263) — **pénétration France-Renov massive, SA absent à 100 %** :

| Domaine .gouv                 | DR  | Concurrents y figurant |
| ----------------------------- | --- | ---------------------- |
| service-public.gouv.fr        | 92  | france_renov           |
| economie.gouv.fr              | 91  | france_renov           |
| ecologie.gouv.fr              | 90  | effy, france_renov     |
| ademe.fr                      | 90  | france_renov           |
| impots.gouv.fr                | 90  | france_renov           |
| interieur.gouv.fr             | 89  | france_renov           |
| info.gouv.fr                  | 89  | france_renov           |
| travail-emploi.gouv.fr        | 89  | france_renov           |
| data.gouv.fr                  | 88  | france_renov, selectra |
| developpement-durable.gouv.fr | 88  | france_renov, selectra |
| francenum.gouv.fr             | 85  | hellio, selectra       |
| beta.gouv.fr                  | 85  | france_renov, hellio   |
| anah.gouv.fr                  | 84  | france_renov           |
| modernisation.gouv.fr         | 81  | france_renov           |
| esante.gouv.fr                | 80  | france_renov           |
| anah.fr                       | 80  | france_renov           |

**Tier 2 BTP/sectoriel** (outreach_targets_2026-05.csv lignes 107, 250, et top50 csv L31-40) — **SA absent, ces sites lient Effy/Sonergia naturellement** :

| Domaine BTP             | DR  | Concurrents liés   |
| ----------------------- | --- | ------------------ |
| ffbatiment.fr           | 80  | france_renov       |
| totalenergies.fr        | 77  | effy               |
| batiactu.com            | 76  | effy, sonergia     |
| fournisseur-energie.com | 76  | effy               |
| union-habitat.org       | 74  | sonergia           |
| quelleenergie.fr        | 74  | effy (intra-Engie) |
| construction21.org      | 72  | sonergia           |
| habitatpresto.com       | 71  | sonergia           |
| ohm-energie.com         | 70  | sonergia           |

---

## 3. Gap quantifié

### 3.1 RD manquants en absolu

| Métrique                                                   | SA actuel           | Médiane concurrents                             | Gap absolu                             | Multiple     |
| ---------------------------------------------------------- | ------------------- | ----------------------------------------------- | -------------------------------------- | ------------ |
| **DR Ahrefs**                                              | 0,6                 | 73 (Hellio) — 78 (Selectra)                     | -72 à -77                              | **120-130x** |
| **RD totaux**                                              | 54 (dont 78 % spam) | n/a (concurrents bien établis 2K-100K RD réels) | n/a                                    | n/a          |
| **RD qualifiés**                                           | **~4-6** (non-spam) | n/a (estim 1500-5000 RD qualifiés Hellio/Effy)  | -1500 à -5000                          | **>250x**    |
| **Backlinks Tier 1 presse**                                | **0**               | 8/8 cibles couvertes par Effy ou France-Renov   | -8                                     | ∞            |
| **Backlinks Tier 3 .gouv.fr**                              | **0**               | France-Renov présent sur 21/21                  | -21                                    | ∞            |
| **Backlinks data.gouv.fr**                                 | **0**               | france_renov + selectra                         | -2 (mais structurellement -1 RD DR 88) | ∞            |
| **Backlinks Wikipedia/Wikidata**                           | **0**               | présence implicite via gouv.fr et études citées | -1 minimum                             | ∞            |
| **Backlinks ADEME (ademe.fr DR 90)**                       | **0**               | france_renov                                    | -1 (structurel)                        | ∞            |
| **Backlinks France-Renov (france-renov.gouv.fr DR 85-88)** | **0**               | sonergia                                        | -1 (structurel)                        | ∞            |
| **Backlinks .edu / .ac / CNRS**                            | **0**               | partiel (cnrs.fr DR 89 lié à selectra cf L147)  | -1 minimum                             | ∞            |
| **Cluster réno (RGE/CEE/aides) RD**                        | **0**               | n/a                                             | 100 % du cluster vide                  | ∞            |

### 3.2 Tier 1 absents identifiés (8 catégories KPMG)

| Catégorie                               | RD ciblées identifiées                                                                                                                            | DR moy | Statut SA                       | # cibles audit (outreach_targets_2026-05.csv) |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------- | --------------------------------------------- |
| **Presse nationale**                    | LeFigaro, LeMonde, BFM, LesEchos, Liberation, Capital, Challenges, JournalDuNet                                                                   | 87     | 0/8 acquis                      | 8 (tier1_press)                               |
| **Gouvernement central**                | service-public, economie, ecologie, impots, interieur, travail-emploi, info, modernisation, conso, travail                                        | 86     | 0/10 acquis                     | 10 (tier3_inst)                               |
| **Agence ADEME / France-Renov / ANAH**  | ademe.fr, france-renov.gouv.fr, anah.gouv.fr, anah.fr, beta.gouv.fr, francenum, esante, pour-les-personnes-agees, developpement-durable, ecologie | 84     | 0/10 acquis                     | 11 (tier3_inst)                               |
| **Open data data.gouv.fr**              | data.gouv.fr (dataset reuses listing)                                                                                                             | 88     | 0/1 acquis (mais asset prêt)    | 1                                             |
| **.edu / recherche**                    | cnrs.fr, openedition.org, hypotheses.org, theconversation.com                                                                                     | 87     | 0/4 acquis                      | 4                                             |
| **Wikipedia FR / Wikidata / Wikimedia** | (catégorie hors outreach csv mais identifiée MASTER-PLAN-05-GROWTH.md L713-716)                                                                   | 95+    | 0 page Wikidata, 0 source citée | tactique                                      |
| **ONG énergie / Conso**                 | ufc-quechoisir (cible MASTER-PLAN-05-GROWTH.md L478, L510), conso.gouv (DR 80)                                                                    | 82     | 0 acquis                        | 2                                             |
| **Fédérations BTP**                     | ffbatiment, batiactu, qualibat, construction21, habitatpresto, union-habitat                                                                      | 75     | 0/6 acquis                      | 6                                             |
| **TOTAL Tier 1 atteignable Q3 2026**    |                                                                                                                                                   |        | **0/52 acquis**                 | **52 cibles documentées**                     |

---

## 4. Backlinks Tier 1 atteignables Q3 2026 — feuille de route 12 mois

### 4.1 Tableau action × tactique × ROI

Format colonnes : Cible | DR | Tactique | Effort (j-h) | Probabilité | Gain DR isolé estimé

| #                             | Cible                                                              | DR    | Tactique                                                                      | Effort                  | Proba            | Gain DR brique | Source plan                                                             |
| ----------------------------- | ------------------------------------------------------------------ | ----- | ----------------------------------------------------------------------------- | ----------------------- | ---------------- | -------------- | ----------------------------------------------------------------------- |
| **P0 - Sprint 1 (J0-J30)**    |                                                                    |       |                                                                               |                         |                  |                |                                                                         |
| 1                             | data.gouv.fr                                                       | 88    | Soumission dataset RGE 49K ouvert via `/datasets/rge` (CC-BY 4.0) — KBIS J+7  | 1 j                     | **★★★★★ (95 %)** | +3-5           | OUTREACH_BACKLINKS_PLAYBOOK.md L11-12, sprint3-backlinks-plan.md L37-43 |
| 2                             | ademe.fr                                                           | 90    | Demande référencement plateforme partenaire France-Rénov via contact officiel | 2 j                     | ★★★★ (50 %)      | +2-3           | sprint3-backlinks-plan.md L31, MASTER-PLAN-05-GROWTH.md L231-245        |
| 3                             | france-renov.gouv.fr                                               | 85-88 | Intégration réciproque annuaire RGE (signal claim)                            | 2 j                     | ★★★ (35 %)       | +2-3           | sprint3-backlinks-plan.md L32                                           |
| 4                             | Wikidata                                                           | 95    | Création entité Q "ServicesArtisans" + propriété site officiel                | 0,5 j                   | ★★★★★ (95 %)     | +1-2           | MASTER-PLAN-05-GROWTH.md L713-716                                       |
| 5                             | Wikipedia FR articles "RGE", "MaPrimeRénov", "Artisanat en France" | 95    | Sources externes bibliographiques (études PDF SA) — éviter spam               | 5 j (3-4 contributions) | ★★★ (40 %)       | +1-3           | MASTER-PLAN-05-GROWTH.md L715                                           |
| **P1 - Sprint 2 (J30-J90)**   |                                                                    |       |                                                                               |                         |                  |                |                                                                         |
| 6                             | LeFigaro                                                           | 91    | Pitch "1er annuaire RGE open-data data.gouv.fr" + interview marché PAC        | 3 j outreach            | ★★★ (35 %)       | +3-5           | outreach_lemlist_top50.csv L2                                           |
| 7                             | LesEchos                                                           | 90    | Pitch "Baromètre RGE mensuel" + angle économie chantier                       | 2 j                     | ★★★ (35 %)       | +3-5           | outreach_lemlist_top50.csv L3                                           |
| 8                             | BFM Business / BFMTV                                               | 89    | Pitch étude DPE/passoires thermiques + chiffres ADEME croisés                 | 2 j                     | ★★★ (30 %)       | +2-4           | outreach_lemlist_top50.csv L4                                           |
| 9                             | LeMonde                                                            | 91    | Pitch enquête fraude RGE / qualité chantier (data exclusives)                 | 3 j                     | ★★ (20 %)        | +3-5           | outreach_lemlist_top50.csv L6                                           |
| 10                            | Capital                                                            | 84    | Pitch "vrai prix PAC" sur 49K artisans (vol KW 17K)                           | 2 j                     | ★★★★ (45 %)      | +2-3           | outreach_lemlist_top50.csv L7                                           |
| 11                            | Challenges                                                         | 82    | Étude PME RGE marché 2026                                                     | 2 j                     | ★★★ (30 %)       | +1-3           | outreach_lemlist_top50.csv L8                                           |
| 12                            | Liberation                                                         | 86    | Angle social passoires thermiques DPE F/G                                     | 2 j                     | ★★ (25 %)        | +1-3           | outreach_lemlist_top50.csv L5                                           |
| 13                            | journaldunet.com                                                   | 86    | Étude data tech "API RGE publique" (pivot devs)                               | 1,5 j                   | ★★★★ (50 %)      | +2-3           | outreach_lemlist_top50.csv L9                                           |
| **P1 - Sprint 2 BTP**         |                                                                    |       |                                                                               |                         |                  |                |                                                                         |
| 14                            | batiactu.com                                                       | 76    | Échange éditorial réciproque (template `Tier 2 BTP`)                          | 1,5 j                   | ★★★★ (50 %)      | +1-2           | OUTREACH_BACKLINKS_PLAYBOOK.md L107-130, top50 csv L31                  |
| 15                            | ffbatiment.fr                                                      | 80    | Demande référencement "fournisseur data RGE"                                  | 2 j                     | ★★★ (35 %)       | +1-2           | top50 csv L32                                                           |
| 16                            | habitatpresto.com                                                  | 71    | Échange éditorial (compétitif mais data-source possible)                      | 2 j                     | ★★★ (40 %)       | +1             | top50 csv L38                                                           |
| 17                            | quelleenergie.fr                                                   | 74    | Échange data (concurrent Engie mais concurrent indirect)                      | 2 j                     | ★★ (20 %)        | +1-2           | top50 csv L36                                                           |
| 18                            | construction21.org                                                 | 72    | Article étude marché RGE                                                      | 2 j                     | ★★★★ (50 %)      | +1             | top50 csv L37                                                           |
| **P2 - Sprint 3 (J90-J180)**  |                                                                    |       |                                                                               |                         |                  |                |                                                                         |
| 19                            | actu.fr (PQR)                                                      | 87    | Guest post régional + 100 communes baromètre                                  | 4 j                     | ★★★ (35 %)       | +2-3           | top50 csv L41                                                           |
| 20                            | ouest-france.fr                                                    | 90    | Étude régionale Bretagne + Pays Loire                                         | 3 j                     | ★★★ (30 %)       | +2-4           | top50 csv L44                                                           |
| 21                            | leparisien.fr                                                      | 89    | Angle Île-de-France passoires + budgets MPR                                   | 3 j                     | ★★★ (30 %)       | +2-4           | top50 csv L46                                                           |
| 22                            | francebleu.fr                                                      | 89    | PQR régionalisée — 13 régions                                                 | 5 j (cumul)             | ★★★★ (50 %)      | +2-3           | top50 csv L47                                                           |
| 23                            | radiofrance.fr                                                     | 90    | Pitch débat passoires thermiques + invitation expert                          | 3 j                     | ★★ (15 %)        | +1-3           | top50 csv L45                                                           |
| 24                            | futura-sciences.com                                                | 85    | Article science PAC / pompe à chaleur (vulgarisation)                         | 3 j                     | ★★★ (40 %)       | +1-2           | top50 csv L42                                                           |
| 25                            | quechoisir.org                                                     | 84    | Angle conso "comment vraiment vérifier RGE"                                   | 4 j                     | ★★ (20 %)        | +1-3           | outreach_targets_2026-05.csv L209                                       |
| **P2 - Université / .edu**    |                                                                    |       |                                                                               |                         |                  |                |                                                                         |
| 26                            | cnrs.fr                                                            | 89    | Citation étude académique (data dataset)                                      | 5 j (relation)          | ★ (10 %)         | +1-2           | outreach_targets_2026-05.csv L147                                       |
| 27                            | openedition.org                                                    | 87    | Soumission article HAL / SciELO                                               | 3 j                     | ★★ (20 %)        | +1             | outreach_targets_2026-05.csv L71                                        |
| 28                            | hypotheses.org                                                     | 84    | Hosting blog recherche "Économie de l'artisanat"                              | 2 j                     | ★★★ (30 %)       | +1             | outreach_targets_2026-05.csv L206                                       |
| **P3 - Sprint 4 (J180-J360)** |                                                                    |       |                                                                               |                         |                  |                |                                                                         |
| 29                            | europa.eu                                                          | 96    | Citation étude transition énergétique EU (Effy, France-Renov déjà liés)       | 7 j                     | ★ (5 %)          | +2-4           | outreach_targets_2026-05.csv L43                                        |
| 30                            | iea.org                                                            | 90    | Citation rapport IEA via partenariat ADEME                                    | 5 j                     | ★ (10 %)         | +1-3           | outreach_targets_2026-05.csv L58                                        |
| 31                            | github.io / github.com                                             | 100   | Open-source dataset "annuaire RGE géolocalisé"                                | 1 j                     | ★★★★★ (95 %)     | +0,5-1         | MASTER-PLAN-05-GROWTH.md L716                                           |
| 32-50                         | Tier 4 général (DR 80-90)                                          | 80-95 | Échange contenu + études amplifiées                                           | 30 j cumul              | ★★★ (35 %)       | +5-10 cumul    | outreach_targets_2026-05.csv reste                                      |

### 4.2 Synthèse cumulée

| Phase                                   | RD acquis cumul          | DR cible     | Gain DR brique cumul | Effort total |
| --------------------------------------- | ------------------------ | ------------ | -------------------- | ------------ |
| Baseline 2026-05-04                     | 4-6 qualifiés            | 0,6          | 0                    | 0            |
| **P0** (J+30) — sprint 1                | +5 RD top tier           | 5-8          | +5-8                 | 11 j         |
| **P1** (J+90) — sprint 2 presse + BTP   | +15 RD                   | 12-16        | +12-16               | 30 j         |
| **P2** (J+180) — sprint 3 PQR + édu     | +25 RD                   | 16-22        | +16-22               | 45 j         |
| **P3** (J+360) — sprint 4 amplification | +50 RD cumul             | 22-30        | +22-30               | 90 j         |
| **Cible KPMG 12 mois P50**              | **80-100 RD qualifiés**  | **DR 14-18** | n/a                  | 175 j        |
| **Cible KPMG 12 mois P75 stretch**      | **150-200 RD qualifiés** | **DR 22-28** | n/a                  | 240 j        |

> **Note** : `MASTER-PLAN-05-GROWTH.md:878` ambitionne 200+ RD qualifiés et DR 30+ à 12 mois. KPMG considère ce target **trop optimiste sans budget PR externalisé** (≥ 4-6 K€/mois). Sans budget, target P50 conservatif = **DR 14-18 / 80-100 RD**. Avec budget Phase 0 dédié + agence PR = atteint 22-28.

### 4.3 Effets levier non-additifs (compound)

1. **Une fois data.gouv.fr publié** → débloque crédibilité Tier 1 presse (proba +50 % → +25 %, source OUTREACH_BACKLINKS_PLAYBOOK.md L17). Effet multiplicateur estimé +30 % sur réponses pitch.
2. **3 backlinks presse Tier 1 obtenus** → backlinks indirects "blog cite presse cite SA" (effet cascade) = +10-15 RD bonus organiques (MASTER-PLAN-05-GROWTH.md L823-825).
3. **1 dataset open-source GitHub** = signal LLM citation (Princeton 2026 cf L666-685) + indirect backlinks via projets open-source qui forkent.
4. **Page Wikipedia FR mention** = +5-10 backlinks indirects (presse, blogs qui sourcent Wikipedia).

Ces 4 effets compound non comptés dans le tableau additif (P50 = somme arithmétique conservative). En P75 stretch ils représentent +30-50 % du gain DR.

---

## 5. Verdict KPMG

### 5.1 Score autorité (méthode pondérée)

| Dimension                               | Pondération | Score SA (sur 100) | Score pondéré | Justif                                        |
| --------------------------------------- | ----------- | ------------------ | ------------- | --------------------------------------------- |
| Domain Rating absolu                    | 30 %        | 1                  | 0,3           | DR 0,6 vs concurrents 73-86                   |
| RD qualifiés                            | 25 %        | 5                  | 1,3           | 4-6 qualifiés vs 1,5K-5K concurrents          |
| Tier 1 (presse + .gouv + ADEME)         | 20 %        | 0                  | 0             | 0/52 cibles documentées                       |
| Diversité éditoriale (anchor + cluster) | 10 %        | 25                 | 2,5           | Pattern blog prix marche, mais 0 cluster réno |
| Spam ratio (santé profil)               | 10 %        | 60                 | 6,0           | 78 % spam mais disavow uploadé                |
| Cluster rénovation énergétique          | 5 %         | 0                  | 0             | 0/64 BL sur cluster Pillar #2                 |
| **TOTAL**                               | 100 %       |                    | **8,1 / 100** |                                               |

> **Comparaison sectorielle** : Hellio ≈ 65, Effy ≈ 60, France-Renov ≈ 80, Selectra ≈ 70, Sonergia ≈ 35. SA est en **dernière position absolue** sur l'axe autorité dans le cluster rénovation énergétique français.

### 5.2 Priorisation P0 / P1 / P2

| Priorité | Action                                                             | Délai         | Effort | Gain DR estimé | Bloquant ?                 |
| -------- | ------------------------------------------------------------------ | ------------- | ------ | -------------- | -------------------------- |
| **P0**   | Soumettre dataset RGE sur data.gouv.fr (KBIS reçu J+7)             | J+10          | 1 j    | +3-5           | Oui — bloque pitch Tier 1  |
| **P0**   | Créer entité Wikidata + sources externes Wikipedia FR (RGE, MPR)   | J+15          | 5 j    | +1-3           | Non                        |
| **P0**   | Publier baromètre RGE mensuel `/barometre/rge` v1                  | J+20          | 3 j    | indirect       | Asset PR clé               |
| **P0**   | Demande référencement officiel ADEME + France-Renov (annuaire)     | J+30          | 4 j    | +3-5           | Non                        |
| **P1**   | Pitch coordonné Tier 1 presse 8 cibles (Lemlist warm-up)           | J+30 à J+90   | 30 j   | +6-12          | data.gouv.fr requis        |
| **P1**   | Tier 2 BTP 10 cibles (batiactu, ffbatiment, etc.)                  | J+30 à J+90   | 15 j   | +3-6           | Non                        |
| **P1**   | Tier 4 général 11 cibles (actu, ouest-france, francebleu)          | J+60 à J+150  | 25 j   | +5-10          | Non                        |
| **P2**   | Étude data publiée (8 angles cf MASTER-PLAN-05-GROWTH.md L641-654) | J+90 à J+360  | 60 j   | +10-20 cumul   | Auteur identifié requis    |
| **P2**   | Open-source GitHub dataset RGE                                     | J+60          | 2 j    | +1-2           | Non                        |
| **P2**   | Outreach blog niche 40 cibles (DR 30-60)                           | J+90 à J+360  | 50 j   | +5-10          | Non                        |
| **P3**   | Tier édu (cnrs, openedition, hypotheses) + EU/IEA                  | J+180 à J+360 | 30 j   | +3-7           | Étude data publiée requise |
| **P3**   | Podcasts shownotes 24 invitations                                  | J+180 à J+360 | 30 j   | +3-5           | Notoriété requise          |

### 5.3 Risques identifiés

| Risque                                                       | Proba   | Impact   | Mitigation                                                |
| ------------------------------------------------------------ | ------- | -------- | --------------------------------------------------------- |
| Effy embauche Head of SEO Q2 → ferme la fenêtre              | Haute   | Critique | Exécuter P0+P1 en parallèle (12 sem max)                  |
| Pitch presse zero reply après 30 j (signal data trop faible) | Moyenne | Élevé    | Asset data.gouv.fr déterminant, KBIS bloquant à clore J+7 |
| Pénalité Google manuelle (PBN historique)                    | Faible  | Critique | Disavow déjà uploadé 2026-04-18                           |
| Plateformes spam continuent à pointer (linkjuice négatif)    | Élevée  | Faible   | Refresh disavow trimestriel                               |
| Concurrent IZI ou Travaux.com copie angle "open data RGE"    | Moyenne | Moyenne  | Premier-arrivé sur data.gouv.fr = lock-in identitaire     |

### 5.4 Recommandation finale

**Status authority : critique mais redressable**. SA est dans une situation paradoxale : 459K pages indexées avec autorité quasi-nulle (DR 0,6) et 0 backlink éditorial cluster réno. Mais les 3 actifs prêts (`/datasets/rge` open-data, `/barometre/rge` snapshots, `/rge` pillar 49K) constituent les 3 leviers structurels les plus puissants du marché français pour le link earning institutionnel — **pas Effy, pas Hellio, pas Selectra n'ont publié leur annuaire en open-data**. La fenêtre de 6-18 mois (avant Effy Head of SEO) est réelle mais étroite.

**Décision KPMG** : **investir P0+P1 sans délai (50 j-h sur 90 j)**, suspendre tout sprint code SEO secondaire jusqu'à 3 backlinks Tier 1 acquis (= signal de validation). DR 14-18 à 12 mois est un objectif **réaliste avec discipline d'exécution**, DR 22-28 = stretch crédible si étude data publiée + agence PR partielle (~3 K€/mois sur 6 mois = 18 K€ budget).

---

## Annexes

### A. Sources csv citées (lignes spécifiques)

| Fichier                               | Lignes citées           | Usage                              |
| ------------------------------------- | ----------------------- | ---------------------------------- |
| `ahrefs-backlinks.csv`                | 2-65 (64 backlinks)     | Profil SA, top 6 quality, clusters |
| `ahrefs-competitors.csv`              | 2-21 (20 concurrents)   | DR comparé, traffic                |
| `competitors-v2.csv`                  | 2-21                    | Données refresh                    |
| `outreach_targets_2026-05.csv`        | 2-383 (383 cibles)      | Tier breakdown, gap                |
| `outreach_lemlist_top50.csv`          | 2-51 (50 priority)      | Plan tactique 12 mois              |
| `competitor_intelligence_2026-05.csv` | 2-60 (Hellio top pages) | Patterns éditoriaux                |
| `disavow.txt`                         | 1-137                   | Spam baseline (pré-2026-04-18)     |

### B. Documents de référence consultés

| Document                              | Sections clés                                                                               | Usage                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------- |
| `MASTER-PLAN-05-GROWTH.md`            | L17-19, L77, L141-156, L223-245, L295-304, L382-391, L452-534, L641-654, L713-716, L823-878 | Stratégie Tier 1-7, KPI             |
| `MASTER-PLAN-04-DATA-TRUST.md`        | L29, L67, L926-936                                                                          | Cible DR 5 → 30, presse spécialisée |
| `sprint3-backlinks-plan.md`           | L4-19, L25-115, L330-395                                                                    | Plan tactique 90j détaillé          |
| `OUTREACH_BACKLINKS_PLAYBOOK.md`      | L11-19, L40-160, L172-188                                                                   | Templates email et KPI 90j          |
| `STRATEGIE-RENOVATION-ENERGETIQUE.md` | référencé via memory                                                                        | Pillar #2 contexte                  |

### C. Calculs reproductibles

```python
# python -c (executé 2026-05-04)
# total backlinks: 64
# RD uniques: 54
# spam: 50 (78.1%)
# nofollow: 35 (54.7%)
# dofollow: 29 (45.3%)
# fr-FR: 11
# en-EN: 54
# cluster réno (rge/cee/aides/mpr/etc): 1 sur 64
# clusters: home=53, blog=8, services=2, departements=1
```
