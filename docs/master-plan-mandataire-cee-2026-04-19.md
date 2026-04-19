# Master Plan — Mandataire CEE résidentiel (2026-04-19)

**Statut** : document consolidé v1.0
**Supersède partiellement** : `docs/sprint3-keyword-strategy.md`, `docs/sprint3-backlinks-plan.md`, `docs/sprint3-outils-budget-strategie.md` sur l'angle stratégique
**Ne supersède pas** : le travail éditorial (100 flagships, Sprint 2 CTR, noindex brutal 50k RGE) reste utile en fondation
**Partenaire délégataire retenu** : Sonergia (sonergia.fr/professionnels)
**Structure juridique** : ServicesArtisans SAS (marketplace) + **ServicesArtisans Energy SAS** (mandataire CEE) via holding commune
**Communication publique** : jamais "mandataire CEE" en copy visible — toujours "plateforme rénovation énergétique avec gestion des primes"

---

## 0. Pourquoi ce document

Les 3 docs Sprint 3 (2026-04-18) ont été écrits avec un angle **annuaire / lead-gen**. Le business réel est **mandataire CEE résidentiel** (pivot décidé 2026-04-09, partenaire Sonergia confirmé 2026-04-14). Ce document consolide :

1. L'état réel du produit (ce qui est livré, ce qui manque)
2. Les 4 conditions de viabilité économique (modèle quantitatif 2026-04-14)
3. Les vrais leviers pour #1 mandataire FR (pas pour #1 annuaire)
4. La roadmap 12 mois réaliste (pas 3 mois irréalistes)

---

## 1. Cible business rappel

| Variable                        | Valeur                    | Source                             |
| ------------------------------- | ------------------------- | ---------------------------------- |
| Objectif M1                     | 200 dossiers CEE/mois     | Mémoire `project-mandataire-cee`   |
| Objectif **M9-M12** (recalibré) | 1 000 dossiers/mois       | Audit critique 2026-04-14 (pas M3) |
| Marge nette P50                 | **299 €/dossier**         | Modèle quantitatif 2026-04-14      |
| Break-even                      | ~50-80 dossiers/mois      | Modèle quantitatif                 |
| Viabilité claire                | dès 150 dossiers/mois P50 | Modèle quantitatif                 |
| BFR à 1000/mois                 | ~1,25 M€                  | Modèle quantitatif                 |
| CAPEX démarrage                 | 100-250 k€                | Modèle quantitatif                 |
| Partenaire délégataire          | **Sonergia**              | Confirmé 2026-04-14                |
| Valorisation cible M24          | 500 k€ – 3 M€             | 0,7-1,8x CA secteur                |

### 4 conditions de viabilité (non-négociables)

1. **Mix précarité ≥ 40 %** — marge unitaire x2 sinon divisée par 1,5-2
2. **CAC ≤ 100 €/dossier signé** — au-delà marge s'effondre en P10
3. **Taux rejet initial ≤ 8 %** — au-dessus pertes probabilistes critiques
4. **Accès BFR < 18 %/an** — affacturage CEE (Defacto, Karmen) ou equity

**Règle d'arbitrage** : quand on choisit entre volume et qualité, **qualité gagne**. Protéger le taux rejet est prioritaire sur la vitesse de ramp-up.

---

## 2. KPIs du business — ce qu'on mesure

**Abandonner** : clics/j, pages top 3, DR, referring domains comme KPIs cœur. Ce sont des proxies utiles mais pas des métriques business mandataire.

**KPIs cœur** :

| KPI                                  | Baseline | M3     | M6     | M12    |
| ------------------------------------ | -------- | ------ | ------ | ------ |
| Dossiers CEE déposés/mois            | 0        | 200    | 400    | 1 000  |
| Taux rejet initial                   | —        | ≤ 8 %  | ≤ 6 %  | ≤ 5 %  |
| Taux non-conformité ex-post          | —        | ≤ 15 % | ≤ 12 % | ≤ 10 % |
| Mix précarité                        | —        | 40 %   | 45 %   | 45 %   |
| MWhc médian/dossier                  | —        | 40     | 45     | 50     |
| Délai dépôt → cash médian (j)        | —        | 120    | 100    | 90     |
| CAC signé (€)                        | —        | 120    | 100    | 80     |
| Marge nette/dossier (€)              | —        | 250    | 290    | 310    |
| Artisans partenaires actifs          | 0        | 150    | 400    | 1 000  |
| Taux conversion simulateur → dossier | —        | 5 %    | 7 %    | 10 %   |

**KPIs proxy SEO** (conservés car feed le CAC) :

- Trafic organique pages CEE (ciblé, pas global)
- Conversion simulateur aides (déjà tracé — Pipedrive 3 canaux)
- Trafic `/devenir-partenaire-cee` (recrutement B2B)

---

## 3. État des lieux — ce qui est livré

### 3.1 Tech mandataire (migrations)

| Brique                       | Statut                                                              | Référence                                                                     |
| ---------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Sync RGE ADEME hebdo         | ✅ Livré                                                            | Migrations 380-381, commits `27b9ba40` + `29dccf9f`                           |
| Catalogue `cee_operations`   | ✅ Livré (19 FOS seedées)                                           | Migrations 382-384, commits `5a59098a` + `5a07e819`                           |
| Traçabilité opposable        | ✅ Livré                                                            | `version_dgec`, `date_application`, `arrete_source`, `rge_formulation_arrete` |
| Fiches VÉRIF PDF REQUISE     | 🟡 Vérification manuelle PDF par PDF à faire avant 1ᵉʳ dossier prod | 15 fiches listées mémoire                                                     |
| Pipedrive 3 canaux CEE/devis | ✅ Livré                                                            | Commit `83dc422f` + pipedrive-3-canaux                                        |
| Migration 457 sitemap RGE    | ✅ Livré                                                            | 50 257 URLs exposées                                                          |

### 3.2 Pages site — statut réel

| Route                                                    | Statut      | Lignes | Commentaire                                                                 |
| -------------------------------------------------------- | ----------- | ------ | --------------------------------------------------------------------------- |
| `/devenir-partenaire-cee`                                | ✅ Livré    | 592    | Landing recrutement B2B artisans. À auditer vs manque de simulateur revenus |
| `/cee/mandataire-vs-direct`                              | ✅ Livré    | 653    | Page comparative                                                            |
| `/cee/coup-de-pouce-2026`                                | ✅ Livré    | 721    | Nouvelles règles P6                                                         |
| `/leads-exclusifs-vs-partages`                           | ✅ Livré    | ?      | Angle différenciateur                                                       |
| `/comparatif-primes-cee-2026`                            | ✅ Livré    | ?      | Comparatif CEE                                                              |
| `/cee/[operation]/guide`                                 | ✅ Livré    | —      | Guides par opération BAR-TH/BAR-EN                                          |
| `/cee/[operation]/[ville]`                               | ✅ Livré    | —      | pSEO opération × ville                                                      |
| `/simulateur-prime-cee` → `/simulateur-aides-renovation` | 🟡 En cours | —      | Plan 20/20 mémoire, Phase 0 docs bloquant                                   |
| `/partenaires`                                           | 🟡 Stub     | 131    | À enrichir (logos + témoignages)                                            |
| `/espace-artisan/cee` (dashboard suivi dossiers)         | ❌ Absent   | —      | P1 plan compétitif                                                          |
| `/cee/fraude-anti-arnaque`                               | ❌ Absent   | —      | Angle DGCCRF 26K signalements/an                                            |

### 3.3 Ce qui manque côté tech

**Briques 1-6** (ref mémoire pivot) : 28-43 jours de dev cumulés

- **Brique 2** : tunnel collecte pièces `/cee/dossier/[token]` + Yousign + EXIF géotag + conservation 6 ans — **non commencée** → bloquant ramp-up
- **Brique 3** : vérification auto (OCR + validateur schéma + anti-fraude) — **non commencée** → c'est le moat fenêtre 12-18 mois
- **Brique 4** : connecteur API Sonergia + retry + webhooks — **non commencée**
- **Brique 5** : dashboard `/admin/cee` (KPIs, alertes, signaux fraude) — **non commencée**
- **Brique 6** : facturation Pennylane/Abby/Tiime — **non commencée**

**POC 1 semaine** (recommandé mémoire avant dev lourd) : flag manuel CEE + collecte pièces email + envoi portail Sonergia + tracking Google Sheet — **non lancé**.

---

## 4. Fracture à corriger : 90 % du Sprint 3 flagships hors-angle mandataire

Sur les 100 flagships livrés :

- **10 flagships Cluster 2 (Aides & CEE)** = directement utiles mandataire
- **90 autres** = utiles annuaire/trafic général (prix travaux, comment choisir, urgences, problèmes, réglementation)

**Décision** : on ne jette pas. Ils captent du trafic qui peut être rerouté vers le simulateur aides (top funnel). Mais on **ré-enrichit les 10 du Cluster 2** pour pointer vers `/simulateur-aides-renovation` + `/devenir-partenaire-cee` en CTA primaire.

**Nouvelle priorité flagships** : basculer les **50 restants prévus Sprint 3.6** vers des clusters mandataire :

- 15 pages "dossier CEE pas à pas par opération" (BAR-TH-171, BAR-TH-113, BAR-EN-101…)
- 10 pages "refus dossier CEE que faire" (angle SAV catastrophique concurrents)
- 10 pages "MaPrimeRénov + CEE cumul 2026 pas à pas"
- 10 pages "éligibilité précarité énergétique CEE ménage modeste/très modeste"
- 5 pages piliers "Sonergia vs Hellio", "Effy vs Hellio", "mandataire CEE vs délégataire", "POS vs SAS", "mandat de dépôt CEE décrypté"

---

## 5. Sprint mandataire CEE — Roadmap 12 mois

### M1 — avril 2026 (maintenant)

**P0 bloquant (cette semaine)** :

- [ ] POC 1 semaine — 10 dossiers réels manuels via portail Sonergia → valider taux validation + friction client
- [ ] Audit rigoureux `/devenir-partenaire-cee` : ajouter simulateur revenus artisan + FAQPage schema + formulaire SIRET pré-rempli ADEME
- [ ] Simulateur `/simulateur-aides-renovation` Phase 0 docs (mémoire plan 20/20) — débloquer Phase 1 code
- [ ] Vérif PDF par PDF des 15 fiches CEE "VÉRIF PDF REQUISE" avant 1ᵉʳ dossier prod
- [ ] Kbis + surveillance BODACC Sonergia (rappel structurel — Hellio→CMAF, consolidation active)

**P1 (2-4 semaines)** :

- [ ] Brique 2 tunnel pièces (5-8 j + 3-5 j compliance 2025)
- [ ] Dashboard artisan `/espace-artisan/cee` (suivi temps réel — killer feature vs concurrents)
- [ ] Candidature backup parallèle Effy Pro + TotalEnergies (ne pas dépendre uniquement Sonergia)

### M2-M3 — mai-juin 2026

- [ ] Brique 3 vérification auto (OCR + validateur + anti-fraude doublons) — **fenêtre moat 12-18 mois ouverte maintenant**
- [ ] Brique 4 connecteur API Sonergia (ou RPA/CSV si pas d'API)
- [ ] Batch rédaction 50 flagships cluster mandataire (ré-orientation Sprint 3.6)
- [ ] Seed avis 200-500 via outreach clients historiques (bloqueur rich snippets)
- [ ] Ramp-up 50 → 100 dossiers/mois (validation conditions)

### M4-M6 — juillet-septembre 2026

- [ ] Brique 5 dashboard ops `/admin/cee` (KPIs + alertes fraude)
- [ ] Brique 6 facturation Pennylane
- [ ] Recrutement 2 ETP gestionnaires CEE (productivité 100-150 doss/ETP/mois)
- [ ] Ramp 100 → 400 dossiers/mois
- [ ] Monitoring 4 conditions viabilité (mix précarité, CAC, rejet, BFR)

### M7-M12 — octobre 2026 → avril 2027

- [ ] Ramp 400 → 1 000 dossiers/mois
- [ ] Recrutement 8-10 ETP ops total
- [ ] Affacturage CEE négocié (Defacto/Karmen) — BFR 1,25 M€
- [ ] Optionalité : passage délégataire à partir de ~625 dossiers/mois (seuil 300 M kWhc)
- [ ] Recalibrage valorisation vers pitch series A si trajectoire P50+ tenue

---

## 6. Backlinks repriorisés — angle mandataire

Le plan backlinks Sprint 3.5 a ses Tier 1-4 valides mais **les priorités changent** pour un mandataire :

### Tier 1 — Institutionnel mandataire (DR 80-95)

- **data.gouv.fr** — publier dataset "taux validation CEE par opération" + "évolution prix SPOT CEE" (baromètre CEE, pas baromètre prix artisan). Angle unique impossible à copier sans historique dossiers.
- **ADEME** — demander référencement comme "partenaire qualifié" (nécessite agrément réel)
- **PNCEE / DGEC** — backlink peu probable mais mention dans bilan annuel P6 possible si volume >1000/mois atteint

### Tier 2 — Écosystème CEE (DR 55-80)

- **Sonergia corporate** (notre partenaire) — page partenaires réciproque
- **Fédérations artisans RGE** : CAPEB, FFB, Qualit'EnR, Qualibat, Qualifelec — mêmes que plan annuaire mais angle **"gestion primes simplifiée"** pas "annuaire leads"
- **CLER** (réseau transition énergétique) — DR 58
- **Négawatt** — DR 55
- **Observatoire National Rénovation Énergétique (ONRE)** — DR 60

### Tier 3 — Presse CEE spécialisée (DR 65-90)

- **Actu-Environnement** — DR 72, presse environnement/CEE la plus active
- **GreenUnivers** — DR 55, source Teksial liquidation (fiable sur CEE)
- **Le Moniteur** — DR 80, angle BTP pro
- **Batiactu** — DR 70, très ouvert data CEE
- **Énergie Plus** — DR 55
- **EuroPoolStatus / ElvenStatusPostnatal** — fiches CEE peu connues, bon pour link bait
- **Actu-Juridique / Dalloz Énergie** — jurisprudence CEE (angle loi 30 juin 2025)

### Tier 4 — Blogs & embed (DR 30-70)

- **Widget éligibilité CEE** à embed chez les partenaires énergéticiens, bailleurs sociaux, agences immo
- **Calculateur revenus artisan mandataire CEE** → pages trade (CAPEB, FFB, Qualit'EnR chambres régionales)

**Ce qu'on abandonne** du plan initial :

- Cibles purement "baromètre prix travaux" presse immo (Capital, BFM Immo, Le Figaro Immobilier) — garder mais en secondaire
- Angle "consumer protection leads exclusifs" — c'est notre moat artisan, pas angle presse mandataire

---

## 7. Contenu éditorial — ré-orientation Sprint 3.6

**Basculer les 50 flagships restants** vers clusters mandataire :

### Cluster A — Dossier CEE par opération (15 flagships)

Format : "Déposer un dossier {opération BAR-xxx} en 2026 — guide pas à pas"

- BAR-TH-171 (PAC air/eau haute performance)
- BAR-TH-172 (PAC eau/eau)
- BAR-TH-148 (CET)
- BAR-TH-113 (chaudière biomasse)
- BAR-TH-112 (appareil bois indépendant)
- BAR-TH-174 (rénovation ampleur maison)
- BAR-TH-175 (rénovation ampleur appartement)
- BAR-EN-101 (ITI combles)
- BAR-EN-102 (ITI murs)
- BAR-EN-103 (ITI planchers bas)
- BAR-EN-104 (fenêtres)
- BAR-TH-125 (VMC double flux)
- BAR-TH-129 (PAC air/air)
- BAR-TH-143 (SSC solaire)
- BAR-SE-104 (équilibrage hydraulique collectif)

### Cluster B — SAV & recours CEE (10 flagships)

- "Refus dossier CEE : 5 raisons + recours"
- "Délai paiement CEE 2026 : médianes réelles par délégataire"
- "Contrôle PNCEE : que faire + procédure"
- "Photos CEE géolocalisées : norme 2025 pas à pas"
- "Signature électronique CEE qualifiée : Yousign vs DocuSign"
- "Fraude CEE : sanctions 2025 (loi 30 juin 2025)"
- "Mandataire retire mon dossier : recours amiable + judiciaire"
- "Attestation honneur CEE : modèle officiel 2026"
- "Audit ex-post PNCEE : préparation + check-list"
- "Rejet documents CEE : erreurs top 10 à éviter"

### Cluster C — MaPrimeRénov + CEE cumul (10 flagships)

- "Cumul MPR + CEE 2026 : calcul exact pas à pas"
- "Ménage très modeste bleu : plafonds 2026"
- "Ménage modeste jaune : plafonds 2026"
- "Parcours accompagné MPR + CEE : timeline réelle"
- "Mon Accompagnateur Rénov rôle CEE"
- "MPR Sérénité terminée : que reste-t-il ?"
- "ITE retirée parcours geste 2026 : conséquences"
- "Chaudière biomasse retirée parcours geste 2026"
- "Fenêtres 2026 : fin MPR geste isolé"
- "Copropriété MPR + CEE : parcours 46 mois"

### Cluster D — Précarité énergétique (10 flagships)

- "Prime CEE précarité 2026 : qui est éligible ?"
- "Revenu fiscal référence plafonds précarité 2026"
- "Coup de pouce précarité 2026 vs classique"
- "Ile-de-France vs reste France plafonds précarité"
- "Chèque énergie 2026 + CEE cumulable"
- "Locataire en précarité : qui bénéficie de la prime ?"
- "Personne âgée précarité : accompagnement renforcé"
- "Bailleur social + CEE précarité (BAR-TH-171)"
- "Rénovation ampleur en précarité : plafonds majorés"
- "Preuve précarité CEE : documents acceptés 2026"

### Cluster E — Piliers comparatifs (5 flagships)

- "Mandataire CEE vs délégataire : différences juridiques 2026"
- "Sonergia vs Hellio vs Effy : comparatif mandataires 2026" (attention neutralité — on est partenaire Sonergia)
- "Particulier : déposer CEE soi-même vs via mandataire"
- "Marché CEE P6 2026-2030 : tout ce qu'il faut savoir"
- "Loi 30 juin 2025 fraudes CEE : nouvelles obligations artisan"

---

## 8. Risques consolidés (post-audits 2026-04-14)

| Risque                                               | Proba   | Impact       | Mitigation                                                                          |
| ---------------------------------------------------- | ------- | ------------ | ----------------------------------------------------------------------------------- |
| Volatilité prix SPOT CEE (-30 %)                     | Moyenne | Critique P10 | Stress test obligatoire ; viser mix précarité ≥ 40 % pour hedger                    |
| Consolidation délégataires (Hellio→CMAF, Teksial)    | Haute   | Fort         | Candidatures backup Effy + TotalEnergies parallèles                                 |
| Sonergia change d'actionnaire                        | Faible  | Fort         | Audit trimestriel + clause rupture contractuelle favorable                          |
| Moat vérif auto périmé (rattrapage Effy ~12-18 mois) | Haute   | Moyen        | Accélérer Brique 3 ; pivoter vers détection fraude IA avancée                       |
| Contrôle PNCEE renforcé à >500 doss/mois             | Haute   | Critique     | Taux rejet ≤ 8 %, traçabilité opposable complète, compliance écrite                 |
| BFR 1,25 M€ non financé                              | Moyenne | Critique     | Equity 300-500 k€ + affacturage CEE négocié avant M6                                |
| CAC dérape >150 €                                    | Moyenne | Critique     | SEO + simulateur = CAC organique bas ; limiter paid à 20 %                          |
| Rejet >8 % détruit marge                             | Moyenne | Critique     | Brique 3 avant ramp-up ; POC 10 dossiers valide taux                                |
| Penurie artisans RGE (-16 % YoY)                     | Haute   | Fort         | 50K RGE sync ADEME en base déjà — goulot recrutement, pas sourcing                  |
| Google AIO absorbe requêtes info CEE                 | Haute   | Moyen        | Cluster A/B/C orienté transactional, pas purement info                              |
| Bus factor 1 dev + 1 fondateur                       | Haute   | Fort         | 25K€ réserve recrutement + embauche ETP ops avant ETP tech                          |
| Loi 30 juin 2025 — amende 10 % CA                    | Moyenne | Critique     | Compliance EXIF géotag photos + conservation 6 ans dès Brique 2                     |
| Demande CADA taux rejet PNCEE refusée                | Moyenne | Moyen        | Utiliser rejet observé POC + benchmark ; ne pas communiquer "20-25 %" non sourçable |

---

## 9. Communication — règles fermes

**Ne jamais écrire** publiquement :

- "mandataire CEE" en UI particulier
- "le seul qui fait de la vérif auto" (faux — Effy/Hellio/Sonergia font aussi)
- "taux de rejet 20-25 % chez nos concurrents" (non sourçable)
- "0 % de commission" sans mention "en phase de lancement"

**Toujours écrire** :

- "plateforme rénovation énergétique avec gestion des primes"
- "vérification automatique pré-dépôt pour éviter les rejets"
- "partenaire Sonergia délégataire P6"
- "leads exclusifs : 1 demande = 1 artisan" (moat durable, vrai différenciateur)

**Dans le pitch interne (investisseurs/délégataires)** :

- Moat = leads exclusifs + vérif auto pré-dépôt (fenêtre 12-18 mois) + détection fraude IA future + intégration marketplace
- Plan conservateur : 200→400→1000 sur 12 mois
- BFR sécurisé equity + affacturage CEE avant ramp >500/mois

---

## 10. Actions aujourd'hui (journée code)

Dans l'ordre :

1. **Audit `/devenir-partenaire-cee`** (1h) — lister les manques vs plan compétitif (simulateur revenus artisan, FAQPage schema, pré-remplissage SIRET ADEME, témoignages artisans, timeline activation visible)
2. **Audit `/cee/mandataire-vs-direct` + `/leads-exclusifs-vs-partages` + `/comparatif-primes-cee-2026`** (1h) — cohérence editoriale, neutralité Sonergia, schemas
3. **Livrer `/partenaires` v2** (1h) — logos délégataires/fédérations, témoignages, grille vide prête à se remplir (prérequis Tier 1 backlinks)
4. **Créer `/cee/fraude-anti-arnaque`** (2h) — angle DGCCRF 26K signalements/an + loi 30 juin 2025 (trou éditorial vs Cluster B)
5. **Audit 10 flagships Cluster 2 Aides & CEE** — ajouter CTA primaire vers `/simulateur-aides-renovation` + secondaire vers `/devenir-partenaire-cee`
6. **Doc Phase 0 simulateur aides** (mémoire plan 20/20) — si pas commencé, c'est bloquant

**Non-négociable** : chaque commit passe lint-staged + vitest + build. Commits atomiques. Pas de push auto (règle ServicesArtisans).

---

## 11. Actions cette semaine (business)

Dehors code :

- [ ] Lancer POC 10 dossiers CEE manuels via portail Sonergia
- [ ] Vérifier les 15 fiches BAR "VÉRIF PDF REQUISE" ligne par ligne
- [ ] Commander Kbis Sonergia + surveillance BODACC (10 €)
- [ ] Candidature Effy Pro backup (effy.fr/pro)
- [ ] Email cee-support@eex.com — 5 questions API/tarifs/SLA/RPA
- [ ] Demande CADA PNCEE taux rejet 2022-2025 (délai 1 mois)
- [ ] RDV avocat énergie (LPA-CGR / De Gaulle Fleurance / Jeantet) — montage SAS Energy

---

## 12. Relecture trimestrielle

Ce document est **opérationnel, pas stratégique immuable**. À relire :

- **2026-07-19** (T+3 mois) : validation trajectoire M3 = 200 dossiers/mois
- **2026-10-19** (T+6 mois) : validation M6 = 400 dossiers/mois + 4 conditions viabilité
- **2027-04-19** (T+12 mois) : validation M12 = 1 000 dossiers/mois ou recalibrage

Chaque relecture compare réalité vs prévu et ajuste le plan suivant.

---

## 13. Ce que ce document **ne remplace pas**

- Le modèle quantitatif P10/P50/P90 (mémoire `servicesartisans-mandataire-cee-model-2026-04-14.md`) — rester la source numérique
- L'audit critique 2026-04-14 — rester la source de vérification des hypothèses
- Le plan simulateur aides 20/20 (`docs/simulateur-architecture.md` + mémoire) — plan produit dédié
- Les règles CLAUDE.md (leads exclusifs, pas de tel DB sur public, pas de CTA devis sur fiches non-claimed, pas de chatbot)

---

**Version** : 1.0 — 2026-04-19
**Auteur** : Marvin Bissohong + Claude Code
**Prochaine révision planifiée** : 2026-05-17 (T+4 semaines, après POC)
