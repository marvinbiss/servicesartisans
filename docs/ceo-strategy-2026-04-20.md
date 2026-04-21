# ServicesArtisans — Stratégie CEO 90 jours

**Date** : 2026-04-20
**Horizon** : T+30 / T+60 / T+90 jours
**North Star** : Monthly Qualified Leads (MQL = devis avec ≥1 artisan claimed qui accepte)
**Baseline MQL** : ~8/mois (estimation : 19 claimed × taux accept 40% × ~1 devis/claimed/mois)
**Cible T+90** : 500 MQL/mois (×62)
**Rigueur** : kill criterion par pilier, data-driven, séquencé, budget chiffré, zero vanity metric.

---

## 0. Honest baseline (les faits, pas la narrative)

| Métrique                     | Valeur                                            | Commentaire                                   |
| ---------------------------- | ------------------------------------------------- | --------------------------------------------- |
| Traffic organique            | ~350 clics/jour (~10 500/mois)                    | stagnation depuis 60j                         |
| Pages indexées               | 459 000                                           | vs 970K BD = déjà 53% indexé                  |
| Templates actifs             | 252 routes                                        | 129 ont <3 liens sortants                     |
| DR (estimé)                  | ~20                                               | concurrents DR 60-86                          |
| Backlinks propres            | 14 / 64                                           | 78% spam, risque Penguin                      |
| **Providers total**          | **970 339**                                       | Scraping massif                               |
| **Providers claimed**        | **19** (0.002%)                                   | **SUPPLY-SIDE BROKEN**                        |
| **Providers claimed actifs** | **16**                                            | 16 artisans payent attention aux leads        |
| Devis/jour                   | 2.5 (74/30j)                                      | 0.7% conversion clic→devis                    |
| Assignment rate              | 78% (58/74)                                       | OK technique                                  |
| Accepted rate                | **0%** (0 acc / 58 ass, 40 pending + 18 declined) | 🚨 personne accepte                           |
| Reviews créées/30j           | **0** (sur 31 invitations)                        | 🚨 flywheel arrêté                            |
| Bookings/30j                 | 0                                                 | système booking non utilisé                   |
| RGE qualifications           | 50 539                                            | ingestion ADEME OK                            |
| Revenue mensuel              | 0 € (gratuit volontaire)                          | cf. mémoire project-servicesartisans-phase.md |

### Ce que ces chiffres disent

Le problème #1 n'est PAS le SEO. **C'est l'activation des 2-side marketplace**. On a construit une pSEO machine sans audience payante d'un côté (artisans), sans conversion de l'autre (reviews/bookings). Le SEO remplit un seau troué.

---

## 1. Thèse centrale (falsifiable, CEO rigor)

**Problème root** : ServicesArtisans est un annuaire de scraping SIRENE avec 970K fiches où **16 artisans seulement** ont revendiqué leur fiche et acceptent les leads. Chaque devis tombe dans un dead-pool (0 réponse) → client frustré → pas de review → pas de social proof → pas de CTR → SEO n'accroit pas.

**Ordre causal à casser** : Supply (artisans claimed) → Response rate (accept leads) → Demand quality (reviews) → CTR (social proof) → Ranking (SEO) → More demand → More revenue.

**Sans fix supply-side, tout investissement SEO est à ROI < 1.**

---

## 2. Les 5 piliers de la stratégie

### PILIER 1 — Supply activation (artisans claimed)

Objectif : 16 → 500 claimed actifs à T+90
Levier : x31 en 90j, impossible sans campagne proactive + valeur immédiate

### PILIER 2 — Conversion funnel (clic → devis → MQL)

Objectif : 0.7% → 2.5% clic→devis ; 0% → 40% accept rate
Levier : fix CTR blog (rank 5-7 → 0 clic est une anomalie), seed reviews, activation claimed artisans

### PILIER 3 — SEO offensif (templates + Pillar #2)

Objectif : 350 → 1 500 clics/j à T+90
Levier : 5 vagues template (plan existant) + Pillar #2 rénovation énergétique (85 queries dormantes)

### PILIER 4 — Authority & Trust (E-E-A-T, backlinks)

Objectif : DR 20 → 30 à T+90
Levier : disavow spam + 10 guest posts + press studies + auteurs identifiés sur YMYL

### PILIER 5 — Revenue mix (double société)

Objectif : 0 € → 5-15 k€ MRR à T+90 ; 50-150 k€ CEE one-time
Levier : SAS SaaS freemium + SA Energy mandataire CEE opérationnel

Chaque pilier a son **kill criterion** à T+30. Si échec, pivot.

---

## 3. PILIER 1 — Supply activation (artisans claimed)

### Data baseline

- 970 339 providers scrapés (SIRENE + PJ + Google)
- **19 claimed, 16 actifs** → 0.002% claim rate
- Claim flow existant : page artisan → bouton « Revendiquer » → SIRET → provider_claims → admin approve
- **0 campagne proactive jamais lancée** (validé par mémoire)

### Sous-plan 1.A — Seed 100 artisans à T+30 (manuel + incitatif)

**Cible** : 100 artisans claimed actifs à T+30.

**Approach hybride** :

1. **Email outbound automatisé** (H0-J10)
   - Script : extraire 5 000 providers top (SIRENE enrichi) dans top 20 villes sur services top 5 (plombier, électricien, serrurier, chauffagiste, couvreur)
   - Email provider.email quand dispo (SIRENE public) : « Votre fiche `/services/plombier/marseille/nom-prenom-SIRET` reçoit N visites/mois sur ServicesArtisans. Revendiquez gratuitement pour recevoir les devis clients en exclusivité. »
   - Incitation : 12 mois gratuits (leads exclusifs, pas de commission, pas de subscription). Sortie légale via memoire project-servicesartisans-phase.md validée.
   - Email délivrabilité : SPF+DKIM+DMARC propre, throttle 200/jour, 1 follow-up J+7
   - Outil : Postmark ou SendGrid transactional + template
   - Tracking : UTM sur CTA → events claim_started + claim_completed dans GA/Plausible
2. **Landing `/devenir-partenaire` optimisée** (J0-J3)
   - Actuellement : `/devenir-partenaire-cee` existe (cf. mémoire competitive-intel), mais pas flow claim rapide
   - Refaire landing : « Vos leads exclusifs » + 3 bullets (pas de commission, pas de subscription, exclusivité) + form SIRET en 30s
3. **Cold calling 100 artisans top-traffic** (J10-J30)
   - Pour les 100 pages `/services/[s]/[v]` avec >100 impr et 0 claim : extraire phone SIRENE + appeler
   - Script : « On vous a indexé votre fiche, elle est première page Google sur votre ville, on vous offre les leads gratuits pendant 12 mois »
   - 3 appels/jour × 20 jours = 60 pistes, ~15% conversion = 9 claims/semaine

**Budget** : ~25h (scripts email + appels) + ~200€ délivrabilité

**Kill criterion 1.A T+30** : 100 claimed actifs. Si <50, pivot proprietary acquisition (buy leads externally, partenariats).

### Sous-plan 1.B — Scale à 500 claimed T+90 (machine learning-ready)

**Approche** : une fois 100 claimed atteint, mesurer cohort

- MQL par claimed
- Claim → first response delay
- Claim → first accepted lead
- Claim → churn rate

Si cohort cohort à 30j >60% actifs acceptant ≥1 lead/mois : ouvrir pub Facebook Ads (€2-5 CAC artisan) sur look-alike des 100 premiers.

Si cohort <30% : stop acquisition, fix retention first.

**Budget** : ~5 k€ media ads (T+60-T+90)

---

## 4. PILIER 2 — Conversion funnel (clic → MQL)

### Data baseline

- 350 clics/j × 30 = 10 500 clics/mois
- 74 devis/mois = **0.7% conversion**
- 58 assignments = 78% dispatch (OK)
- 0 accepted / 58 = **0% accept rate** 🚨
- 0 reviews / 31 invitations = **0% review submit**

### Sous-plan 2.A — Fix CTR blog (quick win T+14)

**Anomalie détectée** :

- `/blog/prix-installation-electrique-neuve-2026` : 1625 impr **rank 6.4** → **0 clic**
- `/blog/prix-electricien-2026-tarifs-travaux` : 1577 impr **rank 7.0** → **0 clic**
- 12 blog pages total : 6879 impr, 0 clics

**CTR à rank 6-7 normal** = 4-8% → on devrait avoir 280-550 clics/mois juste sur blog.

**Hypothèses par ordre de probabilité** :

1. Featured snippet pris par concurrent → on est sous la box
2. Title/desc non attractifs vs concurrent
3. Les queries rankées par ces pages ne sont pas les queries money mais des queries LSI périphériques
4. Clics trackés incorrectement (CTR réel ≠ GSC report)

**Action** :

- J0-J2 : manuel SERP check top 12 blog URLs sur queries money (Incognito, fr-FR geolocalisé)
- J2-J5 : refactor title/desc pour 12 pages avec data concrète (`Prix électricien 2026 : 28-50€/h selon région — Guide ServicesArtisans`)
- J5-J7 : Schema Article + HowTo + FAQPage enrichi pour viser featured snippets
- J7-J14 : mesure GSC J+8 vs baseline

**Kill criterion 2.A** : +200 clics/mois sur blog (de 0 à 200) à T+14. Si échec → le blog est inutile, focus 100% templates.

### Sous-plan 2.B — Fix accept rate (déblocage par Pilier 1)

Accept rate 0% est **directement causé par Pilier 1** : les providers assignés ne sont pas claimed → ne voient pas leurs leads. La fonction `dispatch_lead` RGE-aware (migration 462) assigne au top scorer mais celui-ci est souvent non-claimed.

**Action** :

- Modifier `dispatch_lead` : ajouter paramètre `p_require_claimed boolean default false`. Tester sur cohort.
- Si `require_claimed=true` : boost score x3 pour claimed, x1 pour unclaimed
- Mesurer J+30 : % accept rate après boost

**Kill criterion 2.B** : accept rate >30% à T+30 une fois ≥50 claimed en prod.

### Sous-plan 2.C — Seed reviews flywheel 200 avis T+30

**Problème** : 0 reviews / 31 invitations sur 30j = 0% submit rate.

**Hypothèses** :

1. Page `/invitation-avis/[token]` mal configurée (peut-être brisée)
2. Token HMAC expiration trop courte
3. Client pas engagé (lead dead, pas de service rendu)
4. Form UX friction

**Action** :

- J0-J2 : end-to-end test invitation → check email arrive → clic → form soumet → review published
- J2-J5 : si flow OK, mesurer délai invitation→ouverture email (Postmark webhooks)
- J5-J15 : A/B tester sujet email : « Notez votre artisan [Nom] en 30s » vs « [Marvin], votre avis compte »
- J15-J30 : si toujours 0% → incentive €10 voucher ou tirage au sort
- Objectif : 10-15% submit rate → 3-5 reviews/mois au début, scale à 30-50/mois si claimed explose

**Kill criterion 2.C** : 20+ reviews créées à T+30, sinon retry ou accept que flywheel marche pas à ce volume.

### Sous-plan 2.D — Fix clic→devis rate (2.5% cible vs 0.7%)

Conversion 0.7% = très faible pour une annuaire avec intent transactional. Standards Industry:

- Travaux.com : ~2-4%
- Habitatpresto : ~3-5%

**Hypothèses** :

1. Les 350 clics/j incluent 80% pages `/services/[s]/[v]` où le CTA devis est secondaire (intent ranking : découvrir l'annuaire, pas demander devis)
2. Form devis friction (trop de champs, SIRET requis, etc.)
3. Pas d'engagement au scroll (pas de sticky mobile CTA ou trop agressif)

**Action** :

- J0-J3 : audit form devis /devis/[s]/[v] — mesurer abandon per step (Hotjar gratuit)
- J3-J10 : simplifier form (passer à 3 champs : zip + description + phone)
- J10-J15 : A/B sticky mobile CTA vs hero CTA vs banner
- J15-J30 : measure

**Kill criterion 2.D** : 1.5% conversion à T+30 (de 0.7% à 1.5% = +80 devis/mois supplémentaires).

---

## 5. PILIER 3 — SEO offensif

### Plan existant repris : `docs/market-conquest-plan-2026-04-20.md`

Vagues A-E sur template `/services/[s]/[v]` (voir plan source).

### Ajouts CEO-grade

#### 3.A — Cascade templates (T+15 → T+60)

Une fois vague A validée sur `/services/[s]/[v]` (T+14, kill criterion 40/40 villes enrichies), appliquer le même pattern à :

| Template                                      | Pages    | Dormance                    | Plan                                                                                 |
| --------------------------------------------- | -------- | --------------------------- | ------------------------------------------------------------------------------------ |
| `/tarifs` + `/tarifs/[s]/[v]` + `/tarifs/[s]` | 126      | 25.9% impressions dormantes | enrichment : fourchettes prix INSEE BTP + DVF par ville + data Batiprix              |
| `/departements/[dept]`                        | 63       | 68.9%                       | data dept : population, densité, nb artisans Sirene, top 10 communes, top 5 services |
| `/urgence/[s]/[v]`                            | existant | pilier distinct             | schema.org EmergencyService + phone visible + geo-response                           |
| `/avis/[s]/[v]`                               | 25       | 50% dormance                | data seed reviews pilier 1+2.C                                                       |
| `/problemes/[p]/[v]`                          | N/A      | non mesuré                  | check dormance, si >1K impr → enrichir                                               |

**Kill criterion 3.A T+60** : cascade complète validée sur ≥2 autres templates → +500 clics/mois additionnels.

#### 3.B — Pillar #2 rénovation énergétique execution (T+0 → T+90)

**85 queries détectées, 8052 impressions, 0 clicks, avg pos 30.6**. Non-exécuté vs CLAUDE.md plan.

**Sous-actions** :

1. Hub `/renovation-energetique/` — **actuellement orphan dans audit interne linking**. Le câbler :
   - Breadcrumb global : Accueil → Rénovation énergétique
   - Lien depuis homepage + footer + IntentNavBar
   - Integrate dans sitemap principal
2. Pages services RGE : `/services/chauffagiste-rge/[ville]`, `/services/pompe-a-chaleur/[ville]`, `/services/isolation-combles/[ville]`
   - Actuellement le template `/services/[s]/[v]` rend pour `renderRenovationBlocks` intent-aware
   - **Audit** : combien de couples RGE services × ville sont indexés ?
   - Kill : viser 100 couples indexés minimum
3. Pages aides territoire : `/aides/[dept]/maprimerenov`
   - Utiliser data INSEE + France Rénov par dept (nb dossiers, montant moyen)
   - 101 départements = 101 pages uniques
4. Blog prix : pattern gagnant `/blog/prix-pompe-a-chaleur-2026`, `/blog/prix-isolation-2026`, `/blog/prix-audit-energetique-2026` (x10 articles)
   - Data : ADEME barèmes + France Rénov + INSEE
   - Schema Article + HowTo + FAQPage
5. E-E-A-T obligatoire YMYL :
   - Auteur identifié par page (doc `servicesartisans-authors-honest-eeat-2026-04-20.md` : methodology[] + credentialsBasis)
   - Dates de publication + dateModified visibles
   - Sources officielles linkées (service-public.fr, france-renov.gouv.fr, ADEME)
   - Schema `Service` + `GovernmentService` + `FinancialProduct`

**Kill criterion 3.B T+60** : Pillar #2 génère ≥200 clics/mois (de 0 à 200). Si <50 → authority bloque, pilier 4 prio.

#### 3.C — Money keywords gap (T+30 → T+90)

**951 keywords artisanat KD≤30 vol≥300 où on ne rank pas**.

Top quick-wins ultra-long-tail geo :

- "plombier autour de moi" vol 10K KD 0 — page nouvelle `/plombier-pres-de-moi` avec geo-IP + list top providers géolocalisés
- "serrurier autour de moi" vol 11K KD 2 — même pattern
- "couvreur autour de moi" vol 12K KD 0 — même pattern
- "électricien autour de moi" vol 5.5K KD 1 — même pattern
- Pattern "{métier} autour de moi" × 10 métiers × top 30 villes IP fallback = **300 pages à créer**

Plus gros long-tail :

- "tarif horaire électricien france 2026" : 190 impr rank 6.4 → 0 clic → refaire title
- "isolation thermique villejuif" : 257 impr rank 11.9 → push à top 10 via enrichment

**Kill criterion 3.C T+90** : 30% des 951 gaps rankés (285 mots-clés) avec au moins page 3 (rank ≤30).

---

## 6. PILIER 4 — Authority & Trust

### Sous-plan 4.A — Disavow & clean-up (T+0 → T+7)

- Parse ahrefs-backlinks.csv, extraire 50 spam domains
- Générer disavow.txt (format GSC)
- Upload GSC disavow tool
- **Kill** : fait à J+7

### Sous-plan 4.B — 10 guest posts DR≥30 (T+14 → T+90)

Angles à haute valeur (tous basés sur data qu'on possède) :

1. **Baromètre prix travaux 2026 France** — data DVF + DB artisans → pitch presse régionale (Ouest-France, La Provence, Nice-Matin, La Voix du Nord, Sud-Ouest, Le Progrès)
2. **Observatoire RGE : cartographie des 50K artisans certifiés** — data ADEME enrichie → pitch Batiactu, Le Moniteur, Journal Batiment, Revue du Bâtiment
3. **Transparence des tarifs artisans** — étude sur 970K fiches → pitch Que Choisir, UFC, 60 Millions Consommateurs
4. **Artisanat local et transition énergétique** — data Pillar #2 + ADEME → pitch presse écolo (Reporterre, Novethic)
5. **Pénurie artisans par région** — data SIRENE + INSEE → pitch Les Échos, Le Figaro éco

**Process** : 1 pitch/semaine × 12 semaines = 12 pitches → 30% acceptation = 3-4 guest posts attendus.

Pour les 5-10 manquants : méthode HARO / Presse-citron Agence de presse (2-3 € par pitch envoyé à 1 000 journalistes) → ~5 retombées.

**Kill criterion 4.B T+90** : +6 backlinks DR≥30 cumulés.

### Sous-plan 4.C — E-E-A-T build-up (T+7 → T+90)

- J+7 : fix AuthorSchema + ClaimReview sur flagship guides (doc authors-honest-eeat existant)
- J+14 : ajouter `Organization` schema à homepage avec `sameAs` (LinkedIn entreprise, Mastodon, registre INSEE)
- J+30 : fix `/a-propos` + `/equipe/[slug]` pour être canonical pages d'auteurs + qualifications verifiables
- J+60 : obtenir mentions Wikipedia (page entreprise si critères remplis, sinon citations dans articles existants)

**Kill criterion 4.C** : Knowledge Panel Google déclenché à T+90 (si pas → impossible sans press coverage, pivot).

### Sous-plan 4.D — PPC bridging (T+15 → T+60)

Pendant qu'organic mature, **PPC pour accélérer signal CTR et tester money keywords** :

- Budget 500 €/mois Google Ads
- Cibles : top 20 keywords money (plombier paris, serrurier nice, etc.)
- Objectif : pas ROI direct, mais test CTR rate pour infleuncer algo puis landing page optimization signal

**Kill** : si CPC > 3€ et conversion <2%, stop PPC.

---

## 7. PILIER 5 — Revenue mix

### Architecture (déjà décidée, à exécuter)

- **SAS ServicesArtisans** : SaaS artisans (subscription) + leads exclusifs (commission ou forfait)
- **SA Energy** : apport + mandat CEE via Sonergia (200→1000 dossiers/mois, marge ~1 870€/chantier)

Sources : `servicesartisans-architecture-double-societe.md`, `project-servicesartisans-mandataire-cee.md`, `servicesartisans-mandataire-cee-audit-2026-04-14.md`.

### Sous-plan 5.A — SaaS Freemium (T+30 → T+60)

Tiers à définir :

- **Gratuit** (premiers 100 claimed) : 12 mois leads exclusifs
- **Pro 29 €/mois** : leads illimités + badge vérifié + stats + calendrier
- **Premium 79 €/mois** : Pro + apparition prioritaire + photos portfolio + réponse template AI
  Pricing valide si 20%+ des claimed passent payants après 12 mois gratuits = 20 payants × 29 € = 580 €/mois MRR minimum.

**Kill criterion 5.A T+60** : 20 payants (0 → 20), MRR ≥ 500 €.

### Sous-plan 5.B — Mandataire CEE actif (T+30 → T+90)

État actuel : partenaire Sonergia identifié (mémoire mandataire-cee-2026-04-14). Compte EMMY + process documenté.

**Blocage** : le plan v2 mentionne audit critique avec 3 piliers fragiles (Teksial liquidation, moat vérif auto = commodité, 20-25% rejet).

**Action CEO** :

- J0-J15 : décision finale go/no-go sur mandataire CEE (revoir mémoire audit)
- Si go : setup SAS Energy + contrat Sonergia signé + onboarding 10 chantiers test
- J15-J60 : scaler à 50 dossiers/mois (marge ~90K € mensuel si 299€/dossier médian)
- J60-J90 : scaler à 150 dossiers/mois (point de viabilité selon modèle quantitatif P50)

**Kill criterion 5.B T+90** : 50 dossiers CEE soumis avec rejet <20%.

### Sous-plan 5.C — Distribution / partenariats (T+30 → T+90)

Zero canal actuel hors SEO organic. Ouvrir :

1. **Syndics copro** : contact top 20 syndics de France avec offer « abonnement 10 artisans disponibles en urgence 24h »
2. **Assureurs dommage-ouvrage** : partenariat inspection-devis avec top 3 assureurs (MAAF, Generali, Allianz)
3. **Courtiers rénovation** : relation avec Heero, Hellio (ou concurrents) pour flux leads rénovation énergétique en contrepartie 5-10% commission
4. **Référral artisan-to-artisan** : 50 € offert au claimed qui amène un claimed (bootstrap supply)

**Kill criterion 5.C T+90** : 1 deal signé + 50 leads generated via partenariats.

---

## 8. Séquençage brutal 90 jours

### Bande T+0 → T+30 — Fondations

**Focus** : Pilier 1 (supply) + Pilier 2 fixes + vague SEO A + disavow backlinks.

| Sem | Actions                                                                  |
| --- | ------------------------------------------------------------------------ |
| S1  | Disavow spam + script email 5K artisans + enrichment script DVF/INSEE    |
| S2  | Email outbound lancé + enrichment 40 villes en DB + refactor blog titles |
| S3  | Review flywheel E2E test + cold calling 100 artisans top                 |
| S4  | Mesure kill criterion 1.A (100 claimed?) + mesure CTR blog T+14          |

**Livrables T+30** :

- 100 claimed actifs (ou pivot)
- 40 villes enrichies
- Disavow uploadé
- CTR blog +200 clics/mois
- Reviews créées ≥20

### Bande T+30 → T+60 — Scaling

**Focus** : Pilier 2 optim + cascade SEO templates + Pillar #2 exécution + SaaS pricing launch.

| Sem  | Actions                                                                            |
| ---- | ---------------------------------------------------------------------------------- |
| S5-6 | Cascade enrichment `/tarifs`, `/departements` + SaaS Pro launch 100 claimed        |
| S7-8 | Pillar #2 hub câblage + 10 articles blog prix + 300 pages "{métier} autour de moi" |

**Livrables T+60** :

- 250 claimed actifs
- SaaS 10+ payants (MRR 300+ €)
- Pillar #2 génère 100+ clics/mois
- ×1.5 trafic (350 → 550 clics/j)

### Bande T+60 → T+90 — Compounding

**Focus** : Pilier 4 authority + Pilier 5 CEE actif + PPC accélération + revenue sign-off.

| Sem    | Actions                                                                             |
| ------ | ----------------------------------------------------------------------------------- |
| S9-10  | Guest posts publication #1-3 + Mandataire CEE 10 premiers dossiers                  |
| S11-12 | Authority build-up + CEE scaling 50 dossiers + préparation série A ou cash reinvest |

**Livrables T+90** :

- 500 claimed actifs
- SaaS 30+ payants (MRR 1 000+ €)
- CEE 50 dossiers soumis (marge ~15 k€/mois)
- ×2 trafic (350 → 700 clics/j)
- DR 20 → 30
- **500 MQL/mois**

---

## 9. Décisions CEO à prendre MAINTENANT (avant exécution)

1. **Aller chercher 100 claimed manuellement** (email + cold calling) = tout le plan dépend de ça. OK/KO ?
2. **Go/no-go mandataire CEE** (audit critique 2026-04-14 = 3 piliers fragiles). OK/KO ?
3. **Budget PPC 500 €/mois** vs 100% organic. OK/KO ?
4. **Pricing SaaS Pro 29 € vs Premium 79 €** ou freemium pur avec commission ? OK/KO ?
5. **Ressource humaine** : toutes les actions supposent solo-founder. Recrutement sales BD à T+60 si traction ? OK/KO ?
6. **Incentive reviews** : €10 voucher pour submit ? Légal en France (vérif DGCCRF) avant action.

---

## 10. Métriques de suivi hebdomadaires

Dashboard à maintenir chaque lundi :

| Métrique                  | Baseline | T+30 | T+60  | T+90   |
| ------------------------- | -------- | ---- | ----- | ------ |
| Claimed actifs            | 16       | 100  | 250   | 500    |
| Devis/mois                | 74       | 100  | 150   | 300    |
| Accept rate               | 0%       | 30%  | 50%   | 70%    |
| MQL/mois                  | ~8       | 30   | 100   | 500    |
| Reviews créées/mois       | 0        | 20   | 80    | 200    |
| SaaS payants              | 0        | 0    | 10    | 30     |
| MRR (€)                   | 0        | 0    | 300   | 1 000  |
| CEE dossiers/mois         | 0        | 0    | 10    | 50     |
| CEE revenue (€)           | 0        | 0    | 3 000 | 15 000 |
| Traffic organic (clics/j) | 350      | 400  | 550   | 700    |
| DR Ahrefs                 | 20       | 22   | 26    | 30     |

---

## 11. Ce qu'on ARRÊTE de faire (fatal focus)

- ❌ **Ajouter des blocs** au template `/services/[s]/[v]` — saturé
- ❌ **Lancer Sprint 3 flagship 100 pages** (mémoire sprint3-plan) — c'est du nice-to-have, pas du compounding
- ❌ **Rewrite auth system / DB refactor** — ça marche, laisser
- ❌ **Onboarder de nouveaux concurrents** (US Attorneys, AssurPro) — avant ServicesArtisans rentable c'est non
- ❌ **Blog post de qualité sans distribution** — chaque article doit avoir un plan outreach
- ❌ **Chatbot** (mémoire règle non-négociable)
- ❌ **Commission sur leads avant claimed ≥500** — supply-side fragile

---

## 12. Risques identifiés

| Risque                                                  | Probabilité | Impact             | Mitigation                                                                |
| ------------------------------------------------------- | ----------- | ------------------ | ------------------------------------------------------------------------- |
| Email SIRENE à large volume → spam complaint            | Moyenne     | Haut (domain burn) | Throttle 200/j + DKIM propre + unsub lien                                 |
| Artisans claimés mais pas de leads de qualité → churn   | Haute       | Critique           | Pilier 3 doit pousser trafic avant que les 100 claimés churnent (90j max) |
| Google dévalue 920K pages noindex → perte entity signal | Basse       | Moyen              | Déjà appliqué (rollback impossible)                                       |
| Mandataire CEE Sonergia coupe la relation               | Moyenne     | Haut               | backup Hellio + SAS Energy structure prête                                |
| DR stagne malgré guest posts                            | Haute       | Moyen              | Plan B = PPC + paid amplification contenu (Outbrain, Taboola)             |
| Solo-founder bottleneck                                 | Haute       | Critique           | Recrutement BDR à T+60 obligatoire si traction                            |
| Réglementation leads consommateur (RGPD strict)         | Basse       | Haut               | CNIL compliance check à J+15 avant email mass                             |

---

## 13. ROI synthétique

**Investissement T+0→T+90** :

- Dev/tech : ~150h solo
- Media PPC : 500 €/mois × 2 = 1 000 €
- Email délivrabilité : 200 €
- Guest posts (boost) : 1 500 € (pitches payants DR≥30)
- Total cash out : ~2 700 €

**Revenue T+90 (conservative P50)** :

- SaaS MRR : 30 × 29 € = 870 €/mois
- CEE : 50 × 299 € marge = 14 950 €/mois
- Total : ~15 820 €/mois
- **Run rate annuel : 190 k€**

**Break-even** : atteint à T+60 à condition que CEE démarre à T+30.

**Scénario ambitieux (P90 à T+180)** :

- 2 000 claimed + 200 SaaS payants + 300 CEE/mois
- MRR SaaS : 5 800 €
- CEE : 90 k€/mois
- **Run rate : 1.15 M€/an**

---

## 14. Conclusion CEO

Trois leviers sont load-bearing (sans eux rien ne marche) :

1. **Supply activation** (Pilier 1) — seul axe non-SEO qui débloque tout
2. **CEE mandataire** (Pilier 5.B) — seul revenue model avec traction immédiate
3. **Cascade SEO après validation vague A** (Pilier 3) — asset existant non-exploité

Tout le reste (backlinks, PPC, partenariats) est **accelerator**, pas fondation.

**Si on doit choisir UNE chose** : email outbound 5K artisans cette semaine. Tout part de là.
