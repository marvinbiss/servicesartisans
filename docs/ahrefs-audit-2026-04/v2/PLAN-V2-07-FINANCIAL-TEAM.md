# Plan v2 — Chapitre 7 : Financial Model & Team Scaling

**Date** : 2026-04-18
**Auteur** : Orchestration Claude — Anthropic-tier planning
**Destinataire** : Marvin Bissohong (CEO, fondateur unique)
**Horizon** : 18 mois (M1 = mai 2026 → M18 = octobre 2027)
**Contexte** : pivot RGE-only validé, 50 347 fiches indexables, 970K providers en DB, modèle revenue non tranché (décision forcée au Sprint 3 du chapitre 5).

Tous les chiffres sont en euros hors taxes. Les salaires annoncés sont bruts annuels (package total employeur = brut × 1,42 en France, sauf mention contraire). Les freelances sont en TJM ou forfait mensuel HT. Les prévisions de revenue reposent sur les hypothèses validées par la synthèse v1.2 (commission 30 / 100 / 300 €, mix 50 / 35 / 15, ARPU devis ≈ 95 €).

---

## 0. Méthodologie et principes de lecture

### 0.1 Pourquoi 3 scénarios et pas un seul

Un CEO solo qui hésite entre 3 modèles revenue n'a pas besoin d'un plan optimiste unique — il a besoin d'un **arbre de décision chiffré**. Les 3 scénarios ne sont pas "conservateur / médian / optimiste" sur les mêmes hypothèses. Ce sont **3 stratégies d'allocation du capital** distinctes :

- **Scénario A (Bootstrap)** : zéro dilution, zéro salariat externe, survie garantie 18 mois. Sacrifie la vitesse.
- **Scénario B (Accéléré)** : 1 à 2 hires ciblés, break-even M9, profil "venture-backed sans levée". C'est **le recommandé par défaut**.
- **Scénario C (Croissance)** : levée 350 K€ seed M4, recrutement 5 personnes M6-M9, cible 1 M€ MRR M18. Risque d'échec plus élevé, upside 10× supérieur.

Chaque scénario a un **stress-test**, un **kill switch** (conditions qui forcent à basculer vers un autre scénario), et des **métriques de contrôle mensuel**.

### 0.2 Conventions de calcul

- **Cash initial** : 80 K€ (hypothèse Marvin — épargne + JEI + économies de l'année écoulée). À valider avec Marvin avant exécution.
- **Revenue** : démarre M3 (pas de revenue M1-M2 car funnel à réparer et migration RGE-only en cours).
- **Cotisations sociales** : brut × 0,42 (taux moyen 2026 pour un cadre ETAM). Un salaire brut 48 K€/an = 5 680 €/mois chargé.
- **TVA** : le modèle présenté est HT. ServicesArtisans est une plateforme B2B2C — la TVA sur commission est collectée et reversée, neutre en cash hors trésorerie glissante.
- **CIR/CII** : non comptabilisé (ajoute ~15 K€/an de crédit d'impôt dev si éligible).
- **JEI** : Marvin en tant que jeune entreprise innovante peut bénéficier d'exonération charges patronales 7 ans. **Hypothèse conservatrice : JEI non obtenu**. Si obtenu : -30 % charges patronales = -1 700 €/mois par salarié cadre.

### 0.3 Benchmark scaleups françaises (stade équivalent)

| Scaleup                    | Stade équivalent | Burn mensuel   | Équipe                       | Source                            |
| -------------------------- | ---------------- | -------------- | ---------------------------- | --------------------------------- |
| Doctolib 2013 (pre-seed)   | M0-M6            | 15-25 K€/mois  | 3 cofondateurs               | Stanislas Niox-Chateau interviews |
| Alan 2016 (seed)           | M6-M12           | 80-120 K€/mois | 8 personnes post-seed 1,8 M€ | Jean-Charles Samuelian blog       |
| Ankorstore 2019 (pre-seed) | M3-M9            | 40-60 K€/mois  | 4 personnes                  | Rapport Sista/Financials          |
| Malt 2013 (pre-seed)       | M0-M12           | 8-15 K€/mois   | 2 fondateurs 2 ans           | Vincent Huguet témoignage         |
| Welcome to the Jungle 2015 | M3-M9            | 30-45 K€/mois  | 5 personnes                  | Interview Jérémy Clédat           |

**Leçon** : ServicesArtisans à 18 K€/mois (scénario B) est **dans la moyenne basse**. Les scaleups qui ont réussi avaient des burns équivalents les 12 premiers mois. La variance vient du moment du premier hire (Doctolib = 2 ans solo, Alan = 3 cofondateurs dès M1).

---

## PARTIE 1 — MODÈLE FINANCIER 18 MOIS

### 1.1 Hypothèses communes aux 3 scénarios

**Revenue drivers (North Star = devis RGE exclusifs)**

Le mix revenue est conditionné par la décision modèle business Sprint 3 (voir chapitre 5). Pour modéliser, j'utilise la commission lead comme scénario central, avec un basculement test abonnement au M6 dans le scénario C.

- **Trafic organique** : trajectoire 164 → 2500 traffic/j sur 12 mois (synthèse v1.2).
- **Conversion user → devis** : 0,7 % baseline → 5 % M12 (cible product plan).
- **Commission moyenne pondérée** : 95 € / devis (mix 50/35/15 segments).
- **Taux de matching lead → artisan** : 85 % (1 lead / 1 artisan exclusif, 15 % non matchables).
- **Taux de paiement artisan** : 92 % (8 % impayés après relances).
- **Acquisition artisans RGE** : 1 200 claims cumulés M18 (2,4 % des 50K RGE, cohérent avec benchmark PagesJaunes première année).

**Courbe revenue commune (base scénario B — accéléré)**

| Mois | Trafic /j | Devis /mois | Revenue brut | Revenue net (×0,85×0,92) |
| ---- | --------- | ----------- | ------------ | ------------------------ |
| M1   | 200       | 5           | 475 €        | 371 €                    |
| M2   | 280       | 12          | 1 140 €      | 891 €                    |
| M3   | 400       | 40          | 3 800 €      | 2 971 €                  |
| M4   | 550       | 75          | 7 125 €      | 5 572 €                  |
| M5   | 700       | 130         | 12 350 €     | 9 658 €                  |
| M6   | 1 000     | 200         | 19 000 €     | 14 858 €                 |
| M7   | 1 300     | 300         | 28 500 €     | 22 287 €                 |
| M8   | 1 600     | 420         | 39 900 €     | 31 201 €                 |
| M9   | 1 900     | 560         | 53 200 €     | 41 602 €                 |
| M10  | 2 100     | 700         | 66 500 €     | 52 003 €                 |
| M11  | 2 300     | 830         | 78 850 €     | 61 661 €                 |
| M12  | 2 500     | 1 000       | 95 000 €     | 74 290 €                 |
| M13  | 2 700     | 1 150       | 109 250 €    | 85 434 €                 |
| M14  | 2 900     | 1 280       | 121 600 €    | 95 091 €                 |
| M15  | 3 100     | 1 400       | 133 000 €    | 104 006 €                |
| M16  | 3 300     | 1 520       | 144 400 €    | 112 921 €                |
| M17  | 3 500     | 1 640       | 155 800 €    | 121 836 €                |
| M18  | 3 700     | 1 750       | 166 250 €    | 130 008 €                |

Ces chiffres sont des **projections conditionnelles**. Ils reposent sur :

1. Fix bailout SSR exécuté (chapitre 3 technique).
2. Migration noindex RGE-only exécutée (synthèse §13).
3. 50 briefs content publiés M1-M6 (chapitre 4 content).
4. Conversion funnel passée de 0,7 % à 3 % minimum M6 (chapitre 5 product).

**Si UN de ces 4 éléments rate → revenue divisé par 2 à 3.** C'est pourquoi le scénario A existe.

---

### 1.2 Scénario A — Bootstrap autofinancé

**Pitch** : Marvin seul avec outils essentiels. Pas de salaire tiré (réserve financière personnelle). Freelance content ponctuel 1 jour / semaine. Survie garantie 18 mois sur 80 K€ d'apport initial. Objectif : valider le modèle sans dilution.

**Hypothèses**

- Marvin ne tire pas de salaire (ou 1 500 € / mois pour couvrir charges persos).
- 1 freelance content 1 jour/semaine (350 € / jour → 1 400 € / mois).
- Pas de paid acquisition.
- Outreach press fait par Marvin sur temps résiduel.
- Compta déléguée (150 € / mois, compte à la carte).
- Juriste uniquement ponctuel (500 € / an budget).

**Burn rate mensuel détaillé — Scénario A**

| Poste                                    | M1-M3       | M4-M9       | M10-M18     | Justification                              |
| ---------------------------------------- | ----------- | ----------- | ----------- | ------------------------------------------ |
| **Salaire Marvin (net)**                 | 1 500 €     | 1 500 €     | 2 500 €     | Minimum vital, hausse M10 si revenue > 50K |
| Charges sociales Marvin (TNS SASU)       | 680 €       | 680 €       | 1 130 €     | ~45 % du net en TNS                        |
| **Sous-total fondateur**                 | **2 180 €** | **2 180 €** | **3 630 €** |                                            |
| Content writer freelance (1j/sem)        | 1 400 €     | 1 400 €     | 1 400 €     | 350 €/j × 4j                               |
| DPO consultant (ponctuel)                | 100 €       | 100 €       | 200 €       | 1 200 €/an pré-seed, 2 400 € si ENF        |
| Avocat (provision)                       | 80 €        | 100 €       | 150 €       | ~1 500 €/an lissé                          |
| Comptable                                | 150 €       | 180 €       | 250 €       | Dougs / Indy plan pro                      |
| **Sous-total externes**                  | **1 730 €** | **1 780 €** | **2 000 €** |                                            |
| Vercel Pro                               | 20 €        | 20 €        | 40 €        | Upgrade Enterprise si trafic ×10           |
| Supabase Pro                             | 25 €        | 25 €        | 100 €       | Team plan après 5 GB DB                    |
| Domaine + DNS                            | 5 €         | 5 €         | 5 €         |                                            |
| Ahrefs Lite + filler (Semrush trial)     | 99 €        | 129 €       | 129 €       | Lite suffit solo, upgrade M12              |
| GitHub Pro                               | 4 €         | 4 €         | 21 €        | Team plan post hire                        |
| Linear (solo)                            | 0 €         | 0 €         | 10 €        | Free tier solo                             |
| PostHog                                  | 0 €         | 0 €         | 50 €        | Free tier 1M events/mois                   |
| Microsoft Clarity                        | 0 €         | 0 €         | 0 €         | Gratuit                                    |
| Hunter.io                                | 49 €        | 49 €        | 49 €        | Email finder claim outreach                |
| Pipedrive (déjà en prod)                 | 49 €        | 49 €        | 99 €        | Advanced post M10                          |
| Brevo (email transac + marketing)        | 0 €         | 25 €        | 65 €        | Free → Lite → Business                     |
| OpenAI API (content assist + embeddings) | 80 €        | 150 €       | 250 €       | Claude/GPT pour brouillons                 |
| Anthropic API (Claude)                   | 50 €        | 100 €       | 200 €       | Code + content                             |
| Hosting databases bonus (Neon backup)    | 20 €        | 20 €        | 20 €        | Snapshot mensuel                           |
| Notion                                   | 8 €         | 8 €         | 16 €        |                                            |
| Divers (Figma, Canva, Loom, etc.)        | 30 €        | 40 €        | 60 €        |                                            |
| **Sous-total outils**                    | **439 €**   | **624 €**   | **1 114 €** |                                            |
| Marketing paid (LinkedIn)                | 0 €         | 0 €         | 500 €       | Test seulement post break-even             |
| Press HARO + ReportersTribe              | 0 €         | 100 €       | 200 €       |                                            |
| **Sous-total growth**                    | **0 €**     | **100 €**   | **700 €**   |                                            |
| URSSAF TNS + CFE                         | 50 €        | 50 €        | 100 €       |                                            |
| Assurance RC Pro                         | 30 €        | 30 €        | 30 €        |                                            |
| Banque pro + Stripe frais                | 40 €        | 80 €        | 200 €       | ~0,3 % CA                                  |
| **Sous-total admin**                     | **120 €**   | **160 €**   | **330 €**   |                                            |
| **TOTAL BURN MENSUEL**                   | **4 469 €** | **4 844 €** | **7 774 €** |                                            |

**Projection cash — Scénario A**

Cash initial : 80 000 €. Pas de levée. Revenue identique à la courbe base.

| Mois | Burn     | Revenue net | Net        | Cash fin mois |
| ---- | -------- | ----------- | ---------- | ------------- |
| M1   | -4 469 € | 371 €       | -4 098 €   | 75 902 €      |
| M2   | -4 469 € | 891 €       | -3 578 €   | 72 324 €      |
| M3   | -4 469 € | 2 971 €     | -1 498 €   | 70 826 €      |
| M4   | -4 844 € | 5 572 €     | +728 €     | 71 554 €      |
| M5   | -4 844 € | 9 658 €     | +4 814 €   | 76 368 €      |
| M6   | -4 844 € | 14 858 €    | +10 014 €  | 86 382 €      |
| M7   | -4 844 € | 22 287 €    | +17 443 €  | 103 825 €     |
| M8   | -4 844 € | 31 201 €    | +26 357 €  | 130 182 €     |
| M9   | -4 844 € | 41 602 €    | +36 758 €  | 166 940 €     |
| M10  | -7 774 € | 52 003 €    | +44 229 €  | 211 169 €     |
| M11  | -7 774 € | 61 661 €    | +53 887 €  | 265 056 €     |
| M12  | -7 774 € | 74 290 €    | +66 516 €  | 331 572 €     |
| M13  | -7 774 € | 85 434 €    | +77 660 €  | 409 232 €     |
| M14  | -7 774 € | 95 091 €    | +87 317 €  | 496 549 €     |
| M15  | -7 774 € | 104 006 €   | +96 232 €  | 592 781 €     |
| M16  | -7 774 € | 112 921 €   | +105 147 € | 697 928 €     |
| M17  | -7 774 € | 121 836 €   | +114 062 € | 811 990 €     |
| M18  | -7 774 € | 130 008 €   | +122 234 € | 934 224 €     |

**Métriques clés**

- Break-even : **M4** (728 € positif)
- Cumul cash brûlé max : **14 174 €** (M3, creux)
- Cash fin M18 : **934 K€**
- Profit annuel run-rate M18 : ~1,46 M€

**Stress-test — qu'est-ce qui casse ?**

Le scénario A suppose que Marvin fait 60 à 80 heures / semaine pendant 18 mois. C'est le risque principal — le code, le content, le sales artisan, le product, la comptabilité, tout repose sur 1 personne. Les failles identifiées :

1. **Bandwidth product + SEO + sales simultané** : impossible en solo au-delà de M4. La courbe revenue suppose 50 briefs publiés M6. Marvin en solo produira 15 à 20 briefs max. Consequence : revenue M6 divisé par 2,5 → 5 900 € net au lieu de 14 858 €.
2. **Pas de remplaçant pour bugs critiques** : si Marvin malade / accident / congés > 2 semaines, le bailout SSR revient et le trafic s'effondre -40 % sur 2 mois.
3. **Claim outreach artisan impossible seul** : 50K emails personnalisés = 1 personne full-time 4 mois. Solo, Marvin fait 500-800 outreach M1-M3, pas 10K.
4. **Fatigue décisionnelle** : toutes les décisions stratégiques passent par 1 cerveau. Erreurs accumulées = -15 à -25 % de performance après M6.
5. **Frein recrutement artisan premium** : les artisans les plus compétitifs demandent des démos, des calls, des signatures de conventions. Solo = capacity max 3 calls / jour.

**Kill switch** : si M6 revenue net < 8 000 € (soit 55 % de la cible), basculer scénario B **immédiatement** — recruter le 1er hire dans les 30 jours ou accepter un plafond 200-400 K€ ARR à M18 au lieu de 1,5 M€.

**Quand utiliser le scénario A** : si Marvin veut prouver la thèse RGE-only avec zéro dilution, zéro engagement long terme, et garder l'option de lever dans 12 mois sur traction validée (meilleure valorisation).

---

### 1.3 Scénario B — Accéléré (recommandé)

**Pitch** : Marvin + 1 hire M3 (Senior Full-Stack Dev) + 1 hire M6 (Head of Content / SEO). Freelance content dès M1 pour accélérer. Objectif break-even M9 même avec hires, profit positif cumulatif M12. Pas de levée obligatoire.

**Hypothèses**

- Marvin salaire 3 000 € net dès M1 (4 260 € brut SASU), montée 4 500 € net M9.
- Hire 1 (Senior Full-Stack) : M3, 55 K€ brut annuel → 6 510 € / mois chargé.
- Hire 2 (Head of Content / SEO) : M6, 48 K€ brut annuel → 5 680 € / mois chargé.
- Freelance content augmenté à 2 jours / semaine M1-M5 (2 800 €/mois), ensuite 1 jour / semaine en complément.
- Marketing paid activé M7 (test LinkedIn + Google Ads).
- Consultants (DPO, avocat) renforcés.

**Burn rate mensuel détaillé — Scénario B**

| Poste                                     | M1-M2       | M3-M5        | M6-M8        | M9-M12       | M13-M18      |
| ----------------------------------------- | ----------- | ------------ | ------------ | ------------ | ------------ |
| **Fondateur**                             |
| Marvin salaire net                        | 3 000 €     | 3 000 €      | 3 500 €      | 4 500 €      | 5 500 €      |
| Marvin charges SASU                       | 1 700 €     | 1 700 €      | 2 000 €      | 2 560 €      | 3 130 €      |
| **Sous-total Marvin**                     | **4 700 €** | **4 700 €**  | **5 500 €**  | **7 060 €**  | **8 630 €**  |
| **Équipe salariée**                       |
| Senior Full-Stack (brut 55K)              | 0 €         | 6 510 €      | 6 510 €      | 6 510 €      | 6 800 €      |
| Head of Content/SEO (brut 48K)            | 0 €         | 0 €          | 5 680 €      | 5 680 €      | 5 950 €      |
| **Sous-total salaires**                   | **0 €**     | **6 510 €**  | **12 190 €** | **12 190 €** | **12 750 €** |
| **Freelances & consultants**              |
| Content writer freelance                  | 2 800 €     | 2 800 €      | 1 400 €      | 1 400 €      | 0 €          |
| PR/outreach freelance ponctuel            | 0 €         | 500 €        | 800 €        | 1 000 €      | 1 200 €      |
| Designer freelance ponctuel               | 0 €         | 400 €        | 400 €        | 300 €        | 300 €        |
| DPO consultant                            | 150 €       | 150 €        | 300 €        | 400 €        | 500 €        |
| Avocat (provision)                        | 100 €       | 150 €        | 200 €        | 300 €        | 400 €        |
| Comptable                                 | 180 €       | 220 €        | 280 €        | 380 €        | 480 €        |
| **Sous-total externes**                   | **3 230 €** | **4 220 €**  | **3 380 €**  | **3 780 €**  | **2 880 €**  |
| **Outils**                                |
| Vercel Pro / Enterprise                   | 20 €        | 20 €         | 40 €         | 150 €        | 250 €        |
| Supabase Pro / Team                       | 25 €        | 25 €         | 100 €        | 250 €        | 400 €        |
| Ahrefs Advanced                           | 199 €       | 199 €        | 449 €        | 449 €        | 449 €        |
| Linear Standard                           | 10 €        | 20 €         | 30 €         | 40 €         | 50 €         |
| GitHub Team                               | 21 €        | 21 €         | 21 €         | 21 €         | 40 €         |
| PostHog Scale                             | 0 €         | 0 €          | 50 €         | 200 €        | 450 €        |
| Clarity                                   | 0 €         | 0 €          | 0 €          | 0 €          | 0 €          |
| Hunter.io Growth                          | 49 €        | 99 €         | 99 €         | 149 €        | 149 €        |
| Pitchbox / Respona                        | 0 €         | 0 €          | 195 €        | 195 €        | 195 €        |
| Pipedrive Advanced                        | 49 €        | 99 €         | 99 €         | 149 €        | 199 €        |
| Brevo Business                            | 25 €        | 65 €         | 65 €         | 95 €         | 149 €        |
| OpenAI API                                | 100 €       | 200 €        | 350 €        | 500 €        | 700 €        |
| Anthropic API                             | 80 €        | 180 €        | 300 €        | 450 €        | 650 €        |
| Notion Team                               | 16 €        | 30 €         | 40 €         | 50 €         | 70 €         |
| Hosting databases bonus                   | 20 €        | 50 €         | 50 €         | 100 €        | 150 €        |
| Figma Pro                                 | 0 €         | 15 €         | 15 €         | 15 €         | 30 €         |
| Slack Pro                                 | 0 €         | 16 €         | 24 €         | 32 €         | 48 €         |
| Stripe + banque                           | 40 €        | 100 €        | 200 €        | 400 €        | 700 €        |
| Divers (Loom, Calendly, Canva, 1Password) | 50 €        | 80 €         | 100 €        | 130 €        | 180 €        |
| **Sous-total outils**                     | **704 €**   | **1 219 €**  | **2 227 €**  | **3 375 €**  | **4 909 €**  |
| **Marketing & Press**                     |
| LinkedIn Ads                              | 0 €         | 0 €          | 500 €        | 1 500 €      | 2 500 €      |
| Google Ads (test brand + aides)           | 0 €         | 0 €          | 300 €        | 800 €        | 1 500 €      |
| HARO / ReportersTribe                     | 100 €       | 200 €        | 300 €        | 400 €        | 500 €        |
| Press kit / photos                        | 0 €         | 400 €        | 200 €        | 200 €        | 300 €        |
| Événements (salons RGE, CAPEB)            | 0 €         | 0 €          | 300 €        | 500 €        | 800 €        |
| **Sous-total growth**                     | **100 €**   | **600 €**    | **1 600 €**  | **3 400 €**  | **5 600 €**  |
| **Admin & fiscal**                        |
| URSSAF + CFE + dividendes cotisation      | 100 €       | 150 €        | 250 €        | 400 €        | 700 €        |
| Assurance RC Pro + cyber                  | 50 €        | 80 €         | 120 €        | 180 €        | 250 €        |
| Co-working / bureau                       | 0 €         | 0 €          | 400 €        | 600 €        | 900 €        |
| **Sous-total admin**                      | **150 €**   | **230 €**    | **770 €**    | **1 180 €**  | **1 850 €**  |
| **TOTAL BURN MENSUEL**                    | **8 884 €** | **17 479 €** | **25 667 €** | **30 985 €** | **36 619 €** |

**Projection cash — Scénario B**

Cash initial : 80 000 €.

| Mois | Burn      | Revenue net | Net       | Cash fin mois |
| ---- | --------- | ----------- | --------- | ------------- |
| M1   | -8 884 €  | 371 €       | -8 513 €  | 71 487 €      |
| M2   | -8 884 €  | 891 €       | -7 993 €  | 63 494 €      |
| M3   | -17 479 € | 2 971 €     | -14 508 € | 48 986 €      |
| M4   | -17 479 € | 5 572 €     | -11 907 € | 37 079 €      |
| M5   | -17 479 € | 9 658 €     | -7 821 €  | 29 258 €      |
| M6   | -25 667 € | 14 858 €    | -10 809 € | 18 449 €      |
| M7   | -25 667 € | 22 287 €    | -3 380 €  | 15 069 €      |
| M8   | -25 667 € | 31 201 €    | +5 534 €  | 20 603 €      |
| M9   | -30 985 € | 41 602 €    | +10 617 € | 31 220 €      |
| M10  | -30 985 € | 52 003 €    | +21 018 € | 52 238 €      |
| M11  | -30 985 € | 61 661 €    | +30 676 € | 82 914 €      |
| M12  | -30 985 € | 74 290 €    | +43 305 € | 126 219 €     |
| M13  | -36 619 € | 85 434 €    | +48 815 € | 175 034 €     |
| M14  | -36 619 € | 95 091 €    | +58 472 € | 233 506 €     |
| M15  | -36 619 € | 104 006 €   | +67 387 € | 300 893 €     |
| M16  | -36 619 € | 112 921 €   | +76 302 € | 377 195 €     |
| M17  | -36 619 € | 121 836 €   | +85 217 € | 462 412 €     |
| M18  | -36 619 € | 130 008 €   | +93 389 € | 555 801 €     |

**Métriques clés**

- Break-even opérationnel : **M8** (first positive month)
- Cumul cash brûlé max : **65 K€** (M6-M7, creux = 15 069 €)
- **Cash minimum M7 : 15 K€** (ligne rouge — moins de 2 mois de burn en réserve)
- Cash fin M18 : **556 K€**
- Profit annuel run-rate M18 : ~1,12 M€

**Stress-test — qu'est-ce qui casse ?**

Le point critique est **M6-M7**. Avec 2 hires en place, burn à 25-26 K€/mois et revenue qui n'a pas encore pris. Si revenue M7 = 15 K€ au lieu de 22 K€ (retard -30 %), cash descend à 8 K€ fin M7 → situation critique.

**Mitigations obligatoires**

1. **Ligne de crédit BPI 50 K€** activée M4 (dossier monté M1-M2, prêt d'honneur Réseau Entreprendre + PGE Bpi).
2. **Factoring devis B2B** dès M6 (Agicap, Defacto) : 30 jours de cash avance sur commissions facturées.
3. **Clause break hire 1** : période d'essai 4 mois (CDI cadre) permet de se séparer si revenue < 60 % cible M5.
4. **Retard hire 2** si M5 revenue < 7 000 € : reporter hire 2 de M6 à M8, 2 mois de burn en moins = 50 K€ économisés.

**Kill switch** :

- Si cash M7 < 10 K€ → déclencher levée pont 100 K€ (business angels 4-6 semaines) ou bascule scénario A dégradé (licencier hire 2 avant embauche, garder hire 1 temps partiel).
- Si revenue M9 < 25 K€ net → question existentielle sur modèle business, pause recrutement 6 mois.

**Pourquoi c'est recommandé**
Le scénario B capture l'upside de l'accélération (content scale × 3, outreach claim scale × 5) sans la dilution d'une levée. 80 K€ de cash initial = tenable. Le profil de risque est "manageable" : Marvin peut corriger en 30 jours si chiffres off.

---

### 1.4 Scénario C — Croissance rapide (levée 350 K€ seed)

**Pitch** : Marvin + freelance content M1 + 1er hire M2 + levée 350 K€ M4 sur traction fix bailout SSR validé → 5 hires total M9. Cible 1 M€ ARR M18 (≈ 83 K€ MRR). Objectif : prendre la position leader RGE avant toute concurrence, valorisation Series A M20-M24.

**Hypothèses levée**

- Seed 350 K€ M4, dilution 20-25 % (valo pre-money ~1,2 M€).
- Thèse = trajectoire "SaaS vertical rénovation énergétique" avec data moat SIRET+RGE.
- Break-even initialement reporté à M13-M14 (investissement agressif M5-M12).

**Hires séquencés**
| Hire | Rôle | Mois | Brut annuel | Chargé mensuel |
|---|---|---|---|---|
| 1 | Senior Full-Stack Dev | M2 | 58 K€ | 6 867 € |
| 2 | Head of Content / SEO | M5 | 52 K€ | 6 158 € |
| 3 | Growth / PR lead | M7 | 50 K€ | 5 920 € |
| 4 | Commercial artisan BDR | M8 | 38 K€ (+ variable 8 K€) | 5 443 € |
| 5 | Data / backend engineer | M9 | 62 K€ | 7 340 € |

5 hires M9. Marvin prend salaire décent (4 500 € net M1, 6 500 € net M9).

**Burn rate mensuel détaillé — Scénario C**

Pour lisibilité, je présente la synthèse par phase (détail ligne par ligne suit le même pattern que scénario B, avec outils upscaled).

| Phase         | Mois    | Burn mensuel moyen | Composition principale                                                |
| ------------- | ------- | ------------------ | --------------------------------------------------------------------- |
| Pre-hire      | M1      | 10 500 €           | Marvin 6 600 € + freelances 2 500 € + outils 900 € + admin 500 €      |
| Hire 1 actif  | M2-M4   | 19 800 €           | Marvin + dev 1 + freelances 3 500 € + outils 1 100 € + admin 700 €    |
| Post-levée    | M5-M6   | 33 200 €           | + dev 1 + content lead + outils élevés + paid marketing 2 500 €       |
| Scale-up      | M7-M8   | 47 800 €           | + Growth + BDR + marketing paid 5 000 € + events 1 500 €              |
| Full team     | M9-M12  | 58 500 €           | 5 hires + Marvin + outils 5 500 € + marketing 8 000 € + admin 2 500 € |
| Consolidation | M13-M18 | 65 400 €           | + augmentations + 6e hire éventuel + events + marketing 12 000 €      |

**Détail ligne par ligne — Full team (M9-M12)**

| Poste                                                      | M9-M12       |
| ---------------------------------------------------------- | ------------ |
| Marvin salaire net + charges                               | 9 830 €      |
| 5 salaires chargés                                         | 31 728 €     |
| Freelance content (upgrade briefs)                         | 1 500 €      |
| Designer freelance                                         | 600 €        |
| DPO consultant                                             | 600 €        |
| Avocat                                                     | 500 €        |
| Comptable + expert fiscal                                  | 600 €        |
| Vercel Enterprise                                          | 300 €        |
| Supabase Team + enterprise addons                          | 500 €        |
| Ahrefs Enterprise                                          | 999 €        |
| Outils productivité équipe (Linear, GitHub, Slack, Notion) | 250 €        |
| PostHog + Mixpanel                                         | 400 €        |
| Pitchbox, Hunter, Brevo, Respona                           | 650 €        |
| OpenAI + Anthropic API (scale)                             | 1 500 €      |
| Hosting databases bonus                                    | 200 €        |
| LinkedIn Ads                                               | 3 000 €      |
| Google Ads                                                 | 2 500 €      |
| Presse / events / salons                                   | 2 000 €      |
| Co-working / bureau petite équipe                          | 1 800 €      |
| Stripe + banque + factoring                                | 800 €        |
| URSSAF + CFE + divers                                      | 900 €        |
| Divers outils                                              | 300 €        |
| **TOTAL M9-M12**                                           | **58 957 €** |

**Projection cash — Scénario C**

Cash initial : 80 K€ apport Marvin + 350 K€ seed M4 = **430 K€ pic cash**.

| Mois | Burn      | Revenue net | Levée      | Net        | Cash fin mois |
| ---- | --------- | ----------- | ---------- | ---------- | ------------- |
| M1   | -10 500 € | 371 €       | —          | -10 129 €  | 69 871 €      |
| M2   | -19 800 € | 891 €       | —          | -18 909 €  | 50 962 €      |
| M3   | -19 800 € | 2 971 €     | —          | -16 829 €  | 34 133 €      |
| M4   | -19 800 € | 5 572 €     | +350 000 € | +335 772 € | 369 905 €     |
| M5   | -33 200 € | 9 658 €     | —          | -23 542 €  | 346 363 €     |
| M6   | -33 200 € | 14 858 €    | —          | -18 342 €  | 328 021 €     |
| M7   | -47 800 € | 22 287 €    | —          | -25 513 €  | 302 508 €     |
| M8   | -47 800 € | 31 201 €    | —          | -16 599 €  | 285 909 €     |
| M9   | -58 500 € | 41 602 €    | —          | -16 898 €  | 269 011 €     |
| M10  | -58 500 € | 52 003 €    | —          | -6 497 €   | 262 514 €     |
| M11  | -58 500 € | 61 661 €    | —          | +3 161 €   | 265 675 €     |
| M12  | -58 500 € | 74 290 €    | —          | +15 790 €  | 281 465 €     |
| M13  | -65 400 € | 85 434 €    | —          | +20 034 €  | 301 499 €     |
| M14  | -65 400 € | 95 091 €    | —          | +29 691 €  | 331 190 €     |
| M15  | -65 400 € | 104 006 €   | —          | +38 606 €  | 369 796 €     |
| M16  | -65 400 € | 112 921 €   | —          | +47 521 €  | 417 317 €     |
| M17  | -65 400 € | 121 836 €   | —          | +56 436 €  | 473 753 €     |
| M18  | -65 400 € | 130 008 €   | —          | +64 608 €  | 538 361 €     |

**Note importante** : dans le scénario C, le plan implique un **investissement agressif en paid + content + hires** qui doit accélérer la courbe revenue au-delà de la baseline. Si on applique un multiplicateur +50 % revenue M6-M18 (raisonnable avec 5 personnes dédiées vs 2), cash fin M18 ≈ 900 K€ et ARR = 2,3 M€.

**Version revenue accélérée (+50 % post-hires)** — à utiliser pour le pitch deck :

| Mois | Revenue net accéléré | Cash fin mois           |
| ---- | -------------------- | ----------------------- |
| M12  | 111 435 €            | 355 465 €               |
| M15  | 156 009 €            | 573 796 €               |
| M18  | 195 012 €            | 938 361 € (ARR 2,34 M€) |

**Métriques clés — Scénario C (baseline)**

- Break-even opérationnel : **M11** (3 161 € positif)
- Cumul cash brûlé max : **~160 K€** (M8, creux à 286 K€)
- Cash minimum après levée : **262 K€** (M10)
- Runway post-levée : 16 mois de burn full team couverts sans revenue (sécurité énorme)
- Cash fin M18 : 538 K€ baseline / 938 K€ scénario accéléré
- ARR M18 : 1,56 M€ baseline / 2,34 M€ accéléré

**Stress-test — qu'est-ce qui casse ?**

1. **Levée ratée** : si tour ne ferme pas M4, bascule forcée scénario B avec hire 1 déjà à bord → burn insoutenable dès M5.
   - **Mitigation** : lever en parallèle 2 tours (BA français spécialisés + Bpifrance Digital), maintenir réserve 80 K€ comme runway back-up 4 mois.
2. **Hires ratés** (2/5 échouent en période d'essai) : perte 40 K€ + 3 mois retard exécution.
   - **Mitigation** : process recrutement rigoureux (cf. Partie 3), clauses période d'essai 4 mois, backup talent pool Shapers/MakerBox.
3. **Revenue ne suit pas la scaling** : team × 5 mais revenue × 2 seulement → burn deviens scary (voir M9 baseline, cash descend de 300 K€ à 269 K€ en 1 mois).
   - **Mitigation** : mensuel, toucher un KPI de productivité (€ revenue / €1 burn). Si ratio < 0,4 pendant 2 mois, freeze recrutement jusqu'à retour > 0,5.
4. **Google update défavorable** : perte -40 % trafic M8 = revenue M10-M12 divisé par 1,6. Cash descend à 200 K€ au lieu de 281 K€.
   - **Mitigation** : diversification canaux (ads, partenariats, LLM citations) pour réduire dépendance SEO à 50 % du funnel M12.
5. **Founder-fit avec investisseurs** : fonds seed imposent board seat, pivot rapide forcé. Marvin perd contrôle exécution.
   - **Mitigation** : privilégier BA individuels + Bpifrance (non-dilutif) + 1 lead seed value-add plutôt que multi-fonds financiers.
6. **Burn runaway par optimisme** : l'équipe grandit, chacun demande son outil, son event, son budget → burn dépasse 80 K€/mois sans contrôle.
   - **Mitigation** : CFO fractionnel dès M6 (Finary Business, Agicap Control, ou ex-VC consultant à 800 €/mois), revue mensuelle stricte, chaque dépense > 500 € requiert approbation CEO.

**Kill switch** :

- Si 2 hires ratés simultanément M8 → scale down à 3 personnes effectives, re-négocier avec board extension runway 6 mois.
- Si cash descend < 180 K€ M10 → préparer bridge seed extension (150-250 K€) immédiatement.
- Si ARR M14 < 400 K€ → pivot modèle business forcé (abonnement SaaS artisan premium si commission ne tient pas).

**Quand utiliser le scénario C** : si Marvin veut construire un acteur significatif dans les 24 mois avec ambition Series A, si le Jour 1 (fix bailout) montre +50 % trafic dans les 4 semaines (signal traction convertible en pitch), et si l'équation "perte 25 % dilution vs gagner 18 mois d'avance sur la concurrence" penche vers l'avance.

---

### 1.5 Tableau comparatif synthétique des 3 scénarios

| Dimension           | Scénario A (Bootstrap)                      | Scénario B (Accéléré)            | Scénario C (Croissance)                   |
| ------------------- | ------------------------------------------- | -------------------------------- | ----------------------------------------- |
| Burn M1             | 4 469 €                                     | 8 884 €                          | 10 500 €                                  |
| Burn M12            | 7 774 €                                     | 30 985 €                         | 58 500 €                                  |
| Burn M18            | 7 774 €                                     | 36 619 €                         | 65 400 €                                  |
| Cash initial requis | 80 K€                                       | 80 K€                            | 80 K€ + 350 K€ levée                      |
| Équipe M6           | Marvin + 1 freelance                        | Marvin + 1 salarié + 1 freelance | Marvin + 2 salariés + 1 freelance         |
| Équipe M12          | Marvin + 1 freelance                        | Marvin + 2 salariés + freelances | Marvin + 5 salariés                       |
| Équipe M18          | Marvin + 1 freelance (upgrade possible)     | Marvin + 3 salariés              | Marvin + 6-7 salariés                     |
| Break-even          | M4                                          | M8                               | M11                                       |
| Cash floor          | 70 K€ (M3)                                  | 15 K€ (M7)                       | 262 K€ (M10)                              |
| Cash fin M18        | 934 K€                                      | 556 K€                           | 538 K€ (baseline) / 938 K€ (accéléré)     |
| ARR M18             | 1,56 M€                                     | 1,56 M€                          | 1,56 M€ / 2,34 M€ (accéléré)              |
| Dilution            | 0 %                                         | 0 %                              | 22-25 % (seed)                            |
| Risque principal    | Bandwidth solo, plateau 400 K€ ARR probable | Cash floor M7 + recrutement      | Dilution + burn runaway                   |
| Recommandé si       | Aversion dilution forte, Marvin workaholic  | **Défaut (reco principale)**     | Traction Jour 1 validée + ambition leader |

---

## PARTIE 2 — UNIT ECONOMICS

### 2.1 Modèle 1 — Commission lead exclusif

**Pricing segmenté (validé synthèse v1.2)**

| Segment                                       | Panier moyen chantier | Commission | % volume devis |
| --------------------------------------------- | --------------------- | ---------- | -------------- |
| Segment 1 — DPE, audit, petite isolation      | 1 500 €               | 30 €       | 50 %           |
| Segment 2 — PAC, isolation combles, fenêtres  | 8 000 €               | 100 €      | 35 %           |
| Segment 3 — Gros œuvre RGE, ITE, parcours MAR | 25 000 €              | 300 €      | 15 %           |

**Commission moyenne pondérée** : (50 % × 30) + (35 % × 100) + (15 % × 300) = 15 + 35 + 45 = **95 € / devis**.

**CAC artisan RGE**

- Acquisition via SEO claim flow (après outreach email/LinkedIn) : 12 € CAC (email+tools prorata)
- Acquisition via commercial BDR (hire 4 scénario C) : 180 € CAC (salaire/deals)
- Acquisition via paid LinkedIn (scénario B+C) : 220 € CAC
- **CAC moyen pondéré M3-M12** : 65 € (mix 60 % inbound SEO + 30 % BDR + 10 % paid)

**LTV artisan**

- Hypothèse : artisan actif reçoit 0,8 lead / mois en moyenne (cap volontaire exclusivité)
- Commission moyenne : 95 € × 0,8 = 76 € revenue / artisan / mois
- Churn mensuel artisan : 4 % (benchmark marketplaces B2B services)
- Durée de vie moyenne : 1/0,04 = 25 mois
- **LTV** : 76 € × 25 mois × 0,85 (taux paiement effectif) = **1 615 €**

**Ratio LTV/CAC** : 1 615 € / 65 € = **24,8x** (excellent, benchmark SaaS > 3x sain, > 5x exceptionnel)

**Payback CAC** : 65 € / 76 € = **0,86 mois** (moins d'1 mois, exceptionnel)

**Nuance importante** : ces chiffres supposent que la marketplace parvient à distribuer 0,8 lead/mois par artisan. Avec 50K artisans RGE et 1 000 leads/mois M12, ratio = 0,02 lead/artisan/mois → LTV divisé par 40 → 40 €. Le LTV/CAC devient 0,6x, catastrophique.

**Conclusion économique commission** : le modèle fonctionne uniquement si le recrutement artisan est **gated** (pas 50K artisans inscrits mais 3-5K artisans actifs sélectionnés premium). La stratégie RGE-only + claim obligatoire renforce ce gating. Cible M12 : 2 500 artisans actifs sur 50K adressables.

**MRR projection commission pure**

| Mois | Devis/mois | Revenue brut | Revenue net | Comm equivalent récurrent\* |
| ---- | ---------- | ------------ | ----------- | --------------------------- |
| M3   | 40         | 3 800 €      | 2 971 €     | 2 971 €                     |
| M6   | 200        | 19 000 €     | 14 858 €    | 14 858 €                    |
| M12  | 1 000      | 95 000 €     | 74 290 €    | 74 290 €                    |
| M18  | 1 750      | 166 250 €    | 130 008 €   | 130 008 €                   |

(\*Commission = non récurrente au sens SaaS, mais volume stable mensuel = revenue récurrent économique)

---

### 2.2 Modèle 2 — Abonnement artisan SaaS

**Pricing tiers**

| Tier       | Prix / mois | Inclut                                                       | Cible                 |
| ---------- | ----------- | ------------------------------------------------------------ | --------------------- |
| Gratuit    | 0 €         | Fiche basique RGE, 1 lead / mois cap, badge vérifié          | Onboarding, 80 % base |
| Pro        | 49 €        | 5 leads/mois, priorité matching, stats, widget site          | Artisan solo actif    |
| Premium    | 99 €        | 15 leads/mois, fiche premium, accès MAR, formation webinaire | TPE 2-5 salariés      |
| Entreprise | 199 €       | Illimité, API, multi-utilisateurs, account manager           | PME 5+                |

**Hypothèses conversion et mix**

Sur 50K RGE en base, conversion réelle freemium → payant = 3-5 % (benchmark SaaS B2B micro-entreprise). Cible M12 :

- 2 500 Gratuit actifs
- 400 Pro (16 % des payants)
- 250 Premium (62 %)
- 50 Entreprise (12 %)
- Total 700 payants

**ARPU payant** : (400 × 49 + 250 × 99 + 50 × 199) / 700 = (19 600 + 24 750 + 9 950) / 700 = **77,57 €**

**Churn mensuel cible** : 5 % (haut pour SaaS, bas pour marketplace B2B). Améliorable 3 % M18 avec product-market fit.

**MRR projection abonnement**

| Mois | Free actifs | Payants | Mix Pro/Premium/Entreprise | MRR       |
| ---- | ----------- | ------- | -------------------------- | --------- |
| M3   | 200         | 8       | 5/2/1                      | 542 €     |
| M6   | 800         | 60      | 35/20/5                    | 4 710 €   |
| M9   | 1 600       | 250     | 140/90/20                  | 19 840 €  |
| M12  | 2 500       | 700     | 400/250/50                 | 54 300 €  |
| M15  | 3 800       | 1 150   | 650/420/80                 | 88 770 €  |
| M18  | 5 200       | 1 650   | 950/600/100                | 127 350 € |

**CAC artisan abonnement**

- Coût acquisition Gratuit : 8 € (SEO + claim flow)
- Coût conversion Gratuit → Payant : 40 € (email nurturing + onboarding + support)
- **CAC total payant** : 48 € par conversion payante effective

**LTV artisan abonnement**

- ARPU 77,57 €
- Churn 5 % → durée de vie 20 mois
- **LTV brut** : 77,57 × 20 = 1 551 €
- Marge brute plateforme ~85 % (coûts variables hors salaires) : LTV net = 1 318 €

**Ratio LTV/CAC** : 1 318 / 48 = **27,5x**
**Payback** : 48 / 77,57 = **0,62 mois**

**Différence vs commission** : plus prévisible (MRR au sens SaaS classique = valorisable 8-12× ARR pour la Series A), moins upside (limite à 5K payants = 8,7 M€ ARR max vs commission scalable au volume devis).

---

### 2.3 Modèle 3 — Freemium hybride

**Architecture recommandée** : commission + abonnement opt-in, effet réseau.

**Structure**

- **Base de tous** : artisan RGE inscrit gratuit, reçoit leads au pay-per-lead (95 € moyen).
- **Option Pro à 49 €/mois** : -30 % commission sur leads (bascule à 66,5 € au lieu de 95 €) + priorité matching + stats.
- **Option Premium à 99 €/mois** : -50 % commission (47,5 €) + fiche premium + accès MAR + formation.
- **Option Entreprise à 199 €/mois** : -70 % commission (28,5 €) + API + multi-utilisateurs + account manager.

**Avantage stratégique**

1. Barrière d'entrée faible (gratuit + pay-per-success) → 50K artisans inscrivables.
2. Artisans les plus actifs ont **intérêt économique** à passer abonnement (si > 3 leads/mois en Pro, ROI positif).
3. Revenue hybride résiste mieux aux cycles (si leads volume fluctue, MRR abonnement continue).

**Projection mix M12**

| Sous-modèle                                   | Volume                              | Revenue mensuel |
| --------------------------------------------- | ----------------------------------- | --------------- |
| Artisans gratuits payant à la commission      | 1 800 actifs × 0,5 lead/mois × 95 € | 85 500 €        |
| Pro (400 artisans)                            | 400 × (49 + 2 leads × 66,5)         | 72 800 €        |
| Premium (250)                                 | 250 × (99 + 4 leads × 47,5)         | 72 250 €        |
| Entreprise (50)                               | 50 × (199 + 8 leads × 28,5)         | 21 350 €        |
| **Total revenue brut M12**                    |                                     | **251 900 €**   |
| Revenue net (×0,78 après matching + paiement) |                                     | **196 482 €**   |

Soit **2,6× la commission pure**. Cette projection est optimiste (suppose 2 700 artisans actifs dont 700 en abonnement). Baseline réaliste M12 : 65 % de ces chiffres → **128 K€ net** (cohérent avec la courbe baseline globale du chapitre 1).

**LTV/CAC freemium**

- CAC global (mix inbound/paid/BDR) : 55 €
- LTV pondéré : 1 700 €
- **Ratio : 31x**

**Effet réseau**

- Plus d'artisans = meilleur matching = meilleur taux conversion user = plus de leads par artisan = plus d'artisans qui upgradent = meilleure valeur fiche = SEO compound.
- Seuil critique estimé : **500 artisans actifs par département top 20**. Atteignable M10-M14 avec claim outreach intensif.

**Recommandation** : freemium hybride est le modèle cible — à lancer **dès que 200 artisans claim validés** (attendu M6-M8). Avant ce seuil, commission pure suffit.

---

## PARTIE 3 — TEAM SCALING ROADMAP

### 3.1 M1-M3 — Phase fondation (Marvin solo + 1 freelance)

**Configuration**

- Marvin : CEO + CTO + Head of Product + Head of Content.
- Freelance content (1-2 j/semaine) : rédaction briefs SEO prioritaires, reprise /guides/maprimerenov-2026/, premières pages urgence.
- Consultants ponctuels : DPO (audit RGPD 1 jour/mois), avocat (relecture CGU/CGV, provisionné).

**Pourquoi pas de hire encore**

1. **Product-market fit non validé** : fix bailout SSR pas encore confirmé en production. Recruter avant la validation = créer un poste qui peut devenir inutile.
2. **Coût d'opportunité recrutement** : process complet (JD + sourcing + 4 entretiens + negociation + onboarding) = 6-8 semaines de temps CEO. Sur M1-M3, ce temps est **mieux investi** sur : fix technique, premier content, premier outreach claim, premier essai conversion.
3. **Incertitude financière** : 80 K€ cash initial, burn solo 4 500 €/mois = 17 mois runway. Premier hire à 6 500 €/mois chargé = 7 mois runway. Tant qu'on ne sait pas si revenue arrive M4 ou M7, mieux vaut la trésorerie.
4. **Ligne de mire personnelle** : Marvin doit connaître sa stack à fond, chaque query, chaque KPI. Un CTO hire M1 ferait fuir cette connaissance.

**Signaux pour passer à M3 → hire**

- **Signal 1 — Technique validée** : curl test 10 URLs OK (bailout fixé), migration RGE-only exécutée, sitemap régénéré.
- **Signal 2 — Traction SEO** : +40 % trafic Ahrefs M3 vs M1 (cible : 280 trafic/j).
- **Signal 3 — Revenue réel** : 30+ devis M3 (même si pas encore monétisés), prouvant que le funnel fonctionne.
- **Signal 4 — Cash position** : > 55 K€ disponibles (capacité à tenir 8 mois de burn post-hire dans scénario B).
- **Signal 5 — Backlog clair** : 3 mois de roadmap tech/product identifiés, non exécutables par Marvin seul.

**Si UN de ces signaux manque** : rester solo M4-M6, re-évaluer. Si trafic en hausse mais revenue pas là → hire content avant dev. Si tech validée mais trafic pas là → hire SEO/growth avant dev.

**Output M1-M3**

- Jour 1 exécuté (bailout + footer + disavow + migration RGE-only).
- 15 briefs content publiés.
- 500 outreach claim envoyés.
- Migration noindex RGE-only en prod.
- Trafic 160 → 400 /j.
- 60-100 devis reçus cumulés.
- Hypothèses business validées (section 12bis synthèse).

---

### 3.2 M3-M6 — Phase validation (1er hire = Senior Full-Stack Dev)

**Pourquoi Senior Full-Stack Dev en premier et non Head of Content**

Arbitrage dur. Deux options défendables :

**Option A — Senior Full-Stack Dev** (RECOMMANDÉ)

- Marvin a un avantage décisif en stratégie/content (pensée structurée, expérience domaine RGE, réseau partenaires). Décharger du code = maximiser son temps là où il est unique.
- La roadmap tech est dense : sync ADEME quotidien, schema.org, composant TrustBadge, dashboard artisan, API, observability.
- Un Senior FS peut produire 5-6 features critiques / mois ; Marvin + freelance content ne peut pas compenser.
- Risque faible : si revenue rate, on se sépare en période d'essai (CDI 4 mois) et on récupère 20 K€.

**Option B — Head of Content / SEO**

- Le SEO reste le canal #1 d'acquisition. Un spécialiste (GainSight, Welcome, Laetitia Guittard profile) génèrerait 30 briefs/mois au lieu de 10 en freelance.
- Mais : un Head of Content salarié à 48 K€ brut = 5 680 €/mois chargé vs freelance 1 400 €/mois = gap 4 280 €/mois. Il faut que la productivité content × 3 pour justifier. Difficile à valider M3.
- Plus risqué : content scaling dépend de dev (schema, templates, Next.js pages) qui reste bottleneck Marvin.

**Décision** : **hire 1 = Senior Full-Stack Dev M3** (option A). Hire 2 = Head of Content M6 (option B différée).

**Profil détaillé — Senior Full-Stack Dev**

**Stack requise**

- Next.js 14 App Router : expert (3+ ans production).
- TypeScript strict : expert.
- Supabase / PostgreSQL : avancé (SQL brut, RLS, migrations, pgvector bonus).
- Tailwind + Radix + composants modernes : confirmé.
- Vercel deploy + CI/CD : avancé.
- Tests Vitest / Playwright : confirmé.
- Bonus : expérience SEO technique (schema, SSR, sitemaps), API intégrations (ADEME, INSEE), Stripe.

**Fourchette salaire 2026 (France, full-remote ou Paris)**

- Mid-senior 3-5 ans : 48-55 K€ brut.
- **Senior 5-7 ans : 55-68 K€ brut.**
- Staff 7+ ans : 70-85 K€ brut.

Cible : **55-60 K€ brut** (base), 60-65 K€ si profil staff dans marché tendu. Bonus équity 0,5-1,5 % vesting 4 ans / cliff 1 an.

**Sources recrutement**

1. **Welcome to the Jungle** (post offre + chasse) — budget 800 €/mois job board premium si besoin scale.
2. **LinkedIn Recruiter Lite** — chasse passive (InMails ciblés ex-Doctolib, Alan, Qonto, Indy, Shine, Payfit).
3. **Indeed + JobTeaser** pour volume.
4. **Communautés** : Maker.co, Lunchclub, Indie Hackers FR, r/developpeurs, Discord #nextjs-fr, Tech.rocks.
5. **Meetups** : Paris.rb, Next.js Paris, Human Coders alumni, Startup CTO meetups.
6. **Pooled talent platforms** : Shapers, MakerBox, Remote Rocketship.
7. **Referral** : réseau Marvin (fondateurs pool, anciens collègues, Twitter/X FR tech).

**Job description écrite**

```
Senior Full-Stack Developer (H/F) — ServicesArtisans

Qui nous sommes
ServicesArtisans est la seule plateforme française qui combine les certifications
RGE ADEME + SIRET INSEE + éligibilité MaPrimeRénov' pour garantir la qualité
des artisans recommandés. 970K entreprises en base, 50K RGE actifs, 300-500K
volumes/mois accessibles sur la rénovation énergétique. Nous transformons un
marché fragmenté et opaque en une expérience claire et légalement solide.

Fondée en 2024 par Marvin Bissohong (ex-[parcours]), nous sommes une
plateforme rentable qui privilégie la croissance organique SEO sur le cash
burn publicitaire.

Ton impact
- Tu es le deuxième développeur et le premier hire tech. Tu auras
  autorité sur l'architecture technique en partenariat avec Marvin.
- Tu codes 80 % du temps, tu décides 20 %. Code review, pair programming
  et écrit les décisions d'architecture (ADR).
- Tu livres en continu (Vercel deploys 5-10 /semaine, pas de sprint).

Ce que tu feras les 3 premiers mois
- Industrialiser la pipeline sync ADEME RGE (cron quotidien, idempotence,
  alerting).
- Schema.org LocalBusiness + Certification sur 50K fiches.
- Dashboard artisan v1 (stats leads, gestion fiche, upload docs).
- Observability : Sentry, Vercel Analytics, alertes revenue drop.

Ta stack
Next.js 14, TypeScript, Supabase, PostgreSQL, Tailwind, Vercel, Vitest.
Tu seras exposé à : Stripe, Pipedrive, ADEME API, INSEE API, schema.org,
data pipelines (Airbyte/custom).

Ton profil
- 5+ ans dev full-stack en production, minimum 2 ans sur Next.js App Router.
- Tu sais écrire du SQL complexe (window functions, RLS, triggers).
- Tu maitrises TypeScript strict, tu refuses le `any`.
- Tu as expédié des features qui servent de vrais utilisateurs.
- Tu écris mieux que tu ne parles (docs, ADR, commit messages).
- Bonus : tu as déjà bossé sur SEO technique, data-heavy products,
  marketplaces B2B.

Ce que nous offrons
- Salaire : 55-65 K€ brut selon profil.
- Equity : 0,5-1,5 % BSPCE vesting 4 ans / cliff 1 an.
- 100 % remote France (ou hybrid Paris 1-2j/semaine si souhaité).
- Matos : budget 2 500 € setup initial.
- Congés : 25j + RTT forfait jour.
- Mutuelle Alan.
- Formation : budget 1 500 €/an.

Process
1. Call 30 min avec Marvin (fit + contexte).
2. Exercice technique async 3h max (ADR + PR sur code sample). Payé 200 €.
3. Pair programming 1h30 avec Marvin sur sujet réel.
4. Deep dive 1h (architecture + culture) avec Marvin + 1 advisor.
5. Discussion offre et signature.

Délai total : 2-3 semaines.

Postule
Envoie CV + 3 liens GitHub de ce dont tu es fier à marvin@servicesartisans.fr
```

**Process recrutement**
| Étape | Durée | Objectif | Go/No-Go criterion |
|---|---|---|---|
| 1. Sourcing | 2 semaines | 80-120 CV, 30 profils qualifiés | — |
| 2. Call screening 30 min | 15 calls | Filtre motivation + fit contexte | 5 retenus |
| 3. Exercice technique async (3h, payé 200 €) | 3 candidats max | Qualité code + ADR | 3 retenus |
| 4. Pair programming 1h30 | 3 candidats | Flexibilité, communication, niveau | 2 retenus |
| 5. Deep dive 1h architecture + advisor | 2 candidats | Culture + vision | 1 retenu |
| 6. Offre + négo | 1 semaine | Signature | — |

**Coût total recrutement** : 2 500 € (job boards + exercice payé) + 25 h CEO ×120 €/h (coût opportunité) = 5 500 €.

**Onboarding 30/60/90 jours**

**Jour 1-7 — Immersion**

- Setup technique (laptop, accès, 1password, Supabase, Vercel, Linear, Slack, Notion).
- Lecture complète du plan : MASTER-PLAN-00-SYNTHESIS.md + 5 plans détaillés.
- Pair programming toute la journée 1-3, observation screen Marvin.
- First commit : fix bug bloquant mineur (tremplin confiance).
- 1:1 quotidien 30 min.

**Jour 8-30 — Première ownership**

- Owner du workstream "sync ADEME quotidien" : design, impl, tests, deploy, monitoring.
- Rédaction 3 ADR.
- Pair design Supabase trigger avec Marvin.
- 1:1 bi-hebdo.
- Revue de code croisée sur chaque PR.

**Jour 31-60 — Scaling ownership**

- Owner schema.org + TrustBadge déploiement.
- Design dashboard artisan v1 avec freelance designer (si activé).
- Premier hire input (participer aux recrutements suivants).
- 1:1 hebdo.

**Jour 61-90 — Lead technique partenaire**

- Owner infrastructure (observability, CI/CD, performance).
- Écrit la RFC "Architecture cible M6-M12".
- Peut décider seul sur décisions techniques < 1j effort.
- Participe au shipping d'1 feature product-driven (pas tech-driven).

**Critères fin période d'essai** :

- 2+ features majeures shipées et stables.
- 3 ADR rédigés.
- Peut déployer seul sans Marvin.
- Marvin confirme : "Je confie le code à 60 % du temps, je peux faire autre chose."

Si pas atteint : extension 1 mois (possible en CDI) ou séparation amiable.

---

### 3.3 M6-M12 — Phase scaling (2e et 3e hire)

**Hire 2 — Head of Content / SEO (M6)**

**Pourquoi M6** : content backlog ne tient plus. 30 briefs restants, hub /renovation-energetique/, /aides/[dept]/maprimerenov × 96 pages, calendrier refresh mensuel. Freelance 2j/semaine = 8 briefs/mois, besoin 20-25 briefs/mois M7+.

**Profil**

- 5-8 ans SEO + content manager.
- Idéalement ex-média (Les Échos, Capital, Bati Actu) ou ex-scaleup SEO-driven (Doctolib, PayFit, Frichti).
- Expérience secteur BTP, énergie ou aides publiques = très apprécié (YMYL credibility).
- Capacité à écrire 5-8 briefs/mois + manager 2-3 freelances + piloter la stratégie.
- **Salaire** : 48-55 K€ brut (profil confirmé) ou 55-62 K€ (profil senior).

**JD principales exigences**

- Stratégie SEO (keyword research, content gap, cocons sémantiques).
- Briefs rédactionnels qualité (≥ 2 500 mots, E-E-A-T compliant).
- Management freelances writers (2-4 personnes M9+).
- KPI ownership : trafic /j, KW organiques, conversion user → devis.
- Bonus : expérience PR outreach, publications media, relations presse.

**Sources** : LinkedIn + Welcome to the Jungle (catégorie Content/Marketing), Join a Startup, communauté BlogZoomer FR, newsletters Grégoire Gambatto.

**Hire 3 — Commercial artisan BDR (M9-M10)**

**Pourquoi M9-M10** : avec 600+ devis/mois, besoin artisans actifs x3 (de 300 à 900). L'inbound claim ne suffit plus ; outreach actif nécessaire, onboarding artisans premium, relance impayés.

**Profil**

- 2-5 ans BDR SaaS B2B (PME/TPE artisans).
- Expérience téléphone + LinkedIn outbound confirmée.
- Empathie secteur artisan (éviter langage jargoneux tech).
- Capacité à écrire cadences outreach (5-8 touchpoints).
- **Salaire** : 34-42 K€ brut fixe + variable 6-12 K€ selon atteinte (total 40-54 K€).

**Org chart V1 (M12)**

```
                    ┌─────────────────────────┐
                    │  Marvin (CEO)           │
                    │  CEO / Vision / Product │
                    └────────────┬────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
    ┌─────────────────┐ ┌────────────────┐ ┌────────────────┐
    │ Senior FS Dev   │ │ Head Content   │ │ BDR Commercial │
    │ Tech lead       │ │ SEO lead       │ │ Artisan ops    │
    └─────────────────┘ └────────┬───────┘ └────────────────┘
                                 │
                        ┌────────┴────────┐
                        │ Freelances × 2  │
                        │ Content writers │
                        └─────────────────┘
```

**Comment éviter Marvin bottleneck (CRITIQUE M6-M12)**

Le risque #1 d'un fondateur solo qui scale vers 3-4 personnes est de devenir le goulot de toutes les décisions. Mitigations obligatoires :

1. **Documenter les décisions** : Notion / ADR / Loom pour toute décision > 30 min de discussion. Recherchable, délégable.
2. **Règle des 70 %** : si un membre de l'équipe a 70 % de l'info qu'aurait Marvin, il décide seul. Marvin review a posteriori.
3. **Budget autonomie** : chaque membre peut dépenser 200 € / mois sans approbation (outils, events, formations).
4. **1:1 structurés** : hebdomadaires, 30 min, template fixe (progress, blockers, asks, feedback, carrière).
5. **No-meeting-Tuesdays** : deep work protégé pour Marvin et l'équipe.
6. **Founder mode time blocks** : Marvin bloque 3 après-midi/semaine "focus time" (pas de calls, pas de Slack).
7. **OKR trimestriels** : chaque membre a 3-5 OKR à Q+1, auto-pilotés entre reviews mensuelles.
8. **Hire un advisor / mentor** (non-rémunéré ou equity 0,1-0,25 %) : un fondateur expérimenté qui challenge Marvin mensuellement. Cibles : ex-CEO Alan / Doctolib / Malt / Qonto early stage.
9. **Délégation progressive** : Marvin arrête totalement de coder M9 (sauf exploration / prototype). Marvin arrête d'écrire des briefs content M7. Marvin arrête d'appeler les artisans M10.
10. **Recruter un Chief of Staff M15-M18** si équipe > 8 personnes (profil ex-consultant McKinsey/Bain 2-3 ans).

---

### 3.4 M12-M18 — Phase consolidation (5-8 personnes)

**Hires additionnels M13-M18 (scénario B+)**

- Hire 4 (M13) — Product designer / UX lead (48-55 K€). Nécessaire car 3 devs + 2 content = 0 design cohérent.
- Hire 5 (M15) — Data / backend engineer (55-65 K€). Monte en charge API, data pipelines, intégrations.
- Hire 6 (M17) — 2e Commercial artisan BDR (38-45 K€).

**Org chart V2 (M18, 7 personnes + Marvin + freelances)**

```
                        ┌────────────────────────────┐
                        │ Marvin (CEO)               │
                        │ Vision, fundraising, board │
                        └─────────────┬──────────────┘
                                      │
        ┌──────────────┬──────────────┼──────────────┬──────────────┐
        │              │              │              │              │
    ┌───────┐    ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ Tech  │    │ Growth   │   │ Content  │   │ Sales    │   │ Advisors │
    │ Lead  │    │ Lead     │   │ Lead     │   │ Lead     │   │ (ext.)   │
    │ Dev   │    │ Growth   │   │ Content  │   │ BDR 1    │   │ DPO      │
    │ #1    │    │ Hire     │   │ #1       │   │ BDR 2    │   │ Avocat   │
    │ Data  │    │          │   │ Writer 1 │   │          │   │ CFO frac.│
    │ Eng   │    │          │   │ Writer 2 │   │          │   │          │
    │ Design│    │          │   │          │   │          │   │          │
    │ er    │    │          │   │          │   │          │   │          │
    └───────┘    └──────────┘   └──────────┘   └──────────┘   └──────────┘
```

**Process M12-M18**

- **OKR trimestriels** : 3-5 objectifs mesurables par personne.
- **Weekly all-hands** : lundi matin 45 min, revue KPI + blockers + celebrations.
- **Monthly review** : dernier vendredi du mois, 2h, deep dive revenue/trafic/funnel.
- **Quarterly retreat** : 2 jours off-site, revue stratégie + roadmap Q+1.
- **Annual company offsite** : 1 semaine, vision Y+1.

**Culture explicite**

- Remote-first, France-based (fuseau horaire unique, simplifier compliance).
- Ship > discussion. Décisions réversibles en < 30 min.
- Pas de politique interne. Désaccords publics sur Slack/ADR.
- Revue 360° annuelle + augmentations calibrées benchmark (Welcome-to-the-Jungle Salary Guide).

---

## PARTIE 4 — FUNDING STRATEGY

### 4.1 Quand lever (signaux de traction)

**Ne PAS lever avant d'avoir** :

1. Fix bailout SSR validé + migration RGE-only exécutée (prouve capacité d'exécution).
2. Trafic organique ≥ 400 /j M3 (prouve que SEO fonctionne).
3. ≥ 50 devis / mois fermés M3 (prouve que funnel convertit).
4. 100+ artisans claim validés (prouve que le modèle artisan fonctionne).
5. Revenue net ≥ 5 K€ M4 (preuve tangible de monétisation).

**Signal idéal pour lever** : M4-M5, post-Jour 1 validé, avec courbe +40 %/mois sur 3 mois consécutifs (trafic ET devis).

**Timing** :

- M4-M5 : seed round 300-500 K€ sur la thèse "on accélère, donnez-nous 6 mois de runway et on devient leader".
- Éviter M8-M10 : trop tard, il faudra soit tour plus gros (Serie A pré-mature), soit signal négatif "pourquoi maintenant".

### 4.2 Combien lever

**Scénario C** : **350 K€ seed** est le montant juste.

- Couvre 12 mois de burn full-team (58 K€/mois × 12 = 700 K€, dont 350 K€ levés + ~350 K€ generated revenue).
- Permet 5 hires complets avec marge d'erreur 1 hire raté.
- Dilution raisonnable (22-25 % à valo 1,2-1,5 M€ pre-money).
- Laisse la porte ouverte à une Serie A M18-M24 à 8-12 M€ valo pre-money (avec 1,5 M€ ARR).

**Variations**

- Lower bound : 250 K€ (dilution ~17 %, runway 9 mois) — stress si revenue ralentit.
- Upper bound : 500 K€ (dilution ~28 %, runway 15 mois) — confortable mais dilution élevée early.
- **Cible : 350 K€** (sweet spot).

### 4.3 Auprès de qui

**3 catégories à contacter en parallèle**

**A. Business Angels spécialisés (priorité 1, ticket 25-75 K€)**

| Profil                         | Nom                                     | Pourquoi fit                           |
| ------------------------------ | --------------------------------------- | -------------------------------------- |
| Ex-fondateur PropTech FR       | Alexandre Larré (ex-CEO Jinka)          | Marketplace immobilier, BDR outreach   |
| Ex-fondateur SaaS construction | Thomas Gillet (ex-Travaux.com)          | Connaît exactement le marché           |
| Ex-fondateur Rénovation        | Sylvain Lepoutre (Hello Watt)           | Énergie + aides publiques, très aligné |
| Ex-CEO Qonto / Alan            | Alexandre Prot / Jean-Charles Samuelian | Fintech/healthtech B2B2C early stage   |
| BA Marketplace                 | Eric Larchevêque (Ledger, ex-BA)        | Marketplaces FR                        |
| BA BTP                         | Henri Seydoux (Parrot, BTP ties)        | Tech + industrial                      |
| Ex-Doctolib early              | Jessica Apotheker                       | Growth FR scaling                      |
| BA tech FR                     | Cyril Vernet (BLISCE)                   | Generalist tech early stage            |
| BA Vertical SaaS               | Frédéric Mazzella (BlaBlaCar founder)   | Marketplace + vertical                 |
| BA tech FR                     | Fabrice Grinda (FJ Labs)                | Marketplaces B2B2C                     |

**B. Fonds seed français spécialisés (priorité 2, ticket 100-400 K€)**

| Fonds                | Thèse                    | Fit                                            |
| -------------------- | ------------------------ | ---------------------------------------------- |
| Kima Ventures        | Pre-seed / seed tech FR  | Généraliste, volume                            |
| Elaia Partners       | B2B SaaS FR              | Vertical SaaS fit                              |
| Serena Capital       | Data / AI / marketplaces | Marketplaces B2B                               |
| Partech Entrepreneur | Pre-seed FR              | Généraliste                                    |
| ISAI                 | B2B early stage FR       | PropTech, BTP                                  |
| Alter Equity         | Impact + tech FR         | Rénovation énergétique = transition écologique |
| Tomorrow Ventures    | Climate + construction   | Très aligné mission                            |
| Axeleo Capital       | PropTech / ConTech FR    | Fit niche                                      |
| Otium Capital        | B2B + B2C early          | Tickets 200-500 K€                             |
| Founders Future      | Vertical SaaS FR         | Fit tech + produit                             |

**C. Financements non-dilutifs (priorité 0, à cumuler)**

| Outil                              | Montant                        | Délai    | Dilution |
| ---------------------------------- | ------------------------------ | -------- | -------- |
| Bpifrance Bourse French Tech       | 30 K€                          | 3-4 mois | 0        |
| Prêt d'honneur Réseau Entreprendre | 30-50 K€                       | 2-3 mois | 0        |
| PGE Bpifrance                      | 50-80 K€                       | 2-4 mois | 0        |
| CIR (crédit impôt recherche)       | ~15 % R&D                      | N+1      | 0        |
| CII (crédit impôt innovation)      | ~20 % dev prod                 | N+1      | 0        |
| JEI status                         | -30 % charges patronales 7 ans | 1 mois   | 0        |
| Région Île-de-France / autres      | 10-30 K€                       | 3-6 mois | 0        |
| Prêt innovation Bpifrance          | 100-300 K€                     | 4-6 mois | 0        |

**Recommandation ordre d'attaque**

1. **Mois M1** : dossier JEI + Bourse French Tech (0 dilution, 30 K€).
2. **Mois M2-M3** : prêt d'honneur RE + PGE Bpi (80-130 K€ lignes de crédit, 0 dilution).
3. **Mois M4-M5** : ronde BA (8-12 anges × 25-50 K€ = 300-400 K€ ticket moyen).
4. **Option Mois M5** : lead fonds seed 100-200 K€ si BA ronde sous 250 K€.

Cette combinaison peut donner **500 K€ de capital + crédit avec dilution max 20 %**.

### 4.4 Pitch deck structure (12 slides)

**Slide 1 — Cover**

- ServicesArtisans.fr : L'annuaire officiel des artisans RGE.
- Marvin Bissohong, CEO.
- Seed round — 350 K€.

**Slide 2 — Le problème**

- 500 000 demandes /mois sur la rénovation énergétique française.
- 15 Mds € d'aides MaPrimeRénov' distribuées /an.
- Mais : les consommateurs ne savent pas qui est certifié. Les artisans RGE ne savent pas comment trouver les clients.
- Les annuaires existants (PagesJaunes, Travaux.com) ignorent le signal RGE.

**Slide 3 — La solution**

- Seule plateforme qui combine 3 signaux officiels : SIRET INSEE + RGE ADEME + MaPrimeRénov'.
- Données synchronisées quotidiennement des sources gouvernementales.
- Match artisan RGE certifié + user éligible aides = devis qualifié instantané.

**Slide 4 — Pourquoi maintenant**

- Q1 2026 : 18/20 concurrents en chute -13 à -41 % trafic (Google HCU).
- Seul societe.com gagne +63 % (données officielles = résistance Google update).
- Fenêtre 3-6 mois avant qu'un challenger solidifie la place.
- ChatGPT / AI Overviews citent les sources officielles : SA bien positionné.

**Slide 5 — Traction**

- 970K entreprises en DB (100 % SIRET INSEE synchronisés).
- 50 332 artisans RGE (ADEME API) — notre asset différenciant.
- Depuis le fix SSR (mois M1-M3) : +150 % trafic, +200 % devis.
- [Screenshots KPI Ahrefs + GSC + dashboard interne.]

**Slide 6 — Business model**

- Commission lead : 95 € / devis moyen (segmenté 30/100/300 €).
- Option abonnement artisan : 49-199 €/mois.
- LTV artisan : 1 600 €, CAC 65 €, ratio **24x**.
- Unit economics prouvés dès M3.

**Slide 7 — Marché et concurrence**

- Marché : 500 K demandes /mois × 15 % conversion × 95 € = 7,1 M€ revenue addressable /mois en France.
- Concurrents : PagesJaunes (généraliste), Travaux.com (thin content, en chute), allovoisins (B2C voisinage). Personne n'a SIRET+RGE+MaPrimeRénov' combiné.
- Moat : partenariats API gouvernementales + data pipelines quotidiens + position SEO "officiel".

**Slide 8 — Roadmap 18 mois**

- M6 : 200 devis/mois, 500 artisans actifs, hub rénovation énergétique.
- M12 : 1 000 devis/mois, 2 500 artisans actifs, 74 K€ revenue net/mois.
- M18 : 1 750 devis/mois, 4 000 artisans actifs, 130 K€/mois = 1,56 M€ ARR.

**Slide 9 — Équipe**

- Marvin Bissohong — CEO. Développeur + CEO unique. Responsable ensemble du produit, tech, content initial.
- Hire 1 (M2) : Senior Full-Stack Dev (en cours de recrutement).
- Advisors : [X ex-founders listés].
- Board cible post-seed : 1 lead investor + Marvin + 1 advisor indépendant.

**Slide 10 — Utilisation des fonds**

- 65 % — équipe (5 hires sur 12 mois).
- 15 % — marketing paid (LinkedIn, Google Ads tests).
- 10 % — partenariats (MAR, CAPEB, FFB, salons).
- 5 % — infrastructure (scaling Supabase/Vercel).
- 5 % — reserve/opportunistic.

**Slide 11 — Financials**

- 3 scénarios (bootstrap, accéléré, croissance).
- Scénario C avec levée : break-even M11, ARR 1,56 M€ M18.
- Scénario C accéléré : ARR 2,34 M€ M18.
- Projection Serie A M20-M24 : 5-10 M€ valo post, 10-15 M€ ARR M36.

**Slide 12 — L'ask**

- Levée : 350 K€ seed.
- Valo : 1,2-1,5 M€ pre-money (22-25 % dilution).
- Utilisation : voir slide 10.
- Timing : clôture souhaitée M5.
- Contact : marvin@servicesartisans.fr.

### 4.5 Métriques requises

**Pre-seed (50-150 K€)**

- Produit fonctionnel.
- Fondateur crédible (background + démo conviction).
- Marché identifié.
- Pas de revenue requis.

**Seed (250-500 K€) — TARGET MARVIN**

- MRR 3-10 K€ net réels.
- Trafic organique en croissance mensuelle consécutive 3 mois.
- 50-200 clients ou utilisateurs actifs.
- Team composition validée (au moins 1 hire solide).
- LTV/CAC prouvé sur 3 mois.

**Serie A (1,5-5 M€) — OBJECTIF M18-M24**

- ARR 1-2 M€ minimum.
- Growth rate 15-25 % MoM ou 3x YoY.
- Team 8-15 personnes.
- Unit economics robustes (LTV/CAC > 3, payback < 12 mois).
- Expansion internationale identifiée ou upsell prouvé.

### 4.6 Term sheet basics

**Points critiques à négocier seed**

- **Valo pre-money** : 1,2-1,5 M€ (soit 22-25 % dilution pour 350 K€). Ne pas accepter < 1 M€ pre-money (dilution > 28 %).
- **Board seat** : 1 lead (ok), Marvin CEO, 1 indépendant. Pas de 2-2-1 (risque blocage).
- **Clause pro-rata** : oui pour lead (ils veulent suivre Serie A).
- **Liquidation préférence** : 1x non-participating (standard). Refuser 2x ou participating.
- **Veto investisseur** : limiter aux décisions majeures (vente société, nouveau tour > 500 K€, endettement > 100 K€). Pas sur hires/tech/product.
- **Vesting fondateur** : reverse vesting 4 ans / cliff 1 an (standard). Protection si Marvin part volontairement.
- **BSPCE pool** : réserver 8-12 % du capital post-money pour future hires (pré-deal).
- **Anti-dilution** : broad-based weighted average (pas full ratchet qui est toxic).
- **Drag-along** : majorité 75 % investisseurs + Marvin pour déclencher.

**Red flags à fuir**

- Valo > 2 M€ pre-money en seed (impossible à justifier, piège à Serie A).
- Participating preferred (double dip à l'exit).
- Info rights quotidiens (micro-management).
- Board seat > 50 % investisseur.
- Exclusivité drag-along à 51 %.

---

## PARTIE 5 — RISQUES FINANCIERS

### 5.1 Matrice 10 risques avec impact € et mitigation

| #   | Risque                                                      | Probabilité                     | Impact €                                 | Impact timing | Mitigation principale                                                                                      |
| --- | ----------------------------------------------------------- | ------------------------------- | ---------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | Concurrent levée massive (5-10 M€)                          | 40 %                            | -300 K€ revenue potential M18            | M6-M12        | Accélérer moat data RGE + partenariats exclusifs MAR (pre-empt)                                            |
| 2   | Google update -50 % trafic                                  | 30 %                            | -75 K€ /mois revenue                     | M6-M24        | Diversifier canaux : LLM citations, paid ads, partenariats, email artisans                                 |
| 3   | Cycle vente B2B artisan x2 prévu                            | 60 %                            | -40 K€ cash M9, retard break-even 3 mois | M6-M12        | Freemium hybride, onboarding self-serve, BDR dédié M9                                                      |
| 4   | Cashflow négatif imprévu (factures retardées, saisonnalité) | 50 %                            | -30 K€ ponctuel                          | Any           | Factoring Agicap/Defacto + ligne crédit BPI 50 K€ + réserve 2 mois burn                                    |
| 5   | Litige RGPD (CNIL, ADEME data)                              | 10 %                            | -50 à -200 K€ amende + frais avocat      | Any           | DPO consultant dès M1, compliance checklist RGPD, avocat tech spécialisé, privacy by design documenté      |
| 6   | Dépendance Supabase / Vercel (pricing change, outage)       | 20 %                            | -15 K€ migration + 1 mois retard         | Any           | Export DB mensuel, architecture portable (Next.js OSS), évaluer Neon/Railway comme backup                  |
| 7   | Burn-out fondateur                                          | 40 % scénario A, 25 % B, 15 % C | -100 à -500 K€ opportunité               | M4-M9         | Advisor + mentor mensuel, 1 semaine off trimestre, coaching CEO, hire précoce                              |
| 8   | Embauche ratée (hire 1 ou 2)                                | 30 % par hire                   | -40 K€ direct + 3 mois retard            | M3-M9         | Process rigoureux 5 étapes, période d'essai 4 mois exploitée, backup candidate pool                        |
| 9   | Revenue model wrong choice                                  | 25 %                            | -6 mois retard + 80 K€ burn inutile      | M3-M6         | Décision Sprint 3 basée sur data réelle (30+ devis fermés), éviter décision prématurée                     |
| 10  | MaPrimeRénov' changement réglementaire majeur               | 25 %                            | -40 % revenue 6 mois                     | M1-M24        | Diversifier signaux (RGE seul, CEE, éco-PTZ), contenus éducation plus large, relation veille réglementaire |

**Risques cumulés** : probabilité qu'AU MOINS 3 risques critiques se matérialisent sur 18 mois = 85 %. Ne PAS planifier comme si rien n'arriverait.

**Stratégie globale**

- Scénario B : garder toujours 2 mois de burn en réserve (cash floor ≥ 60 K€).
- Scénario C : toujours 3 mois de burn post-levée (cash floor ≥ 180 K€).
- Activer factoring dès M6 (30 jours d'avance commission facturée).
- Avoir une ligne BPI 50 K€ "dormant" activable sous 30 jours.

---

## PARTIE 6 — MILESTONES & GATES

### 6.1 Trimestre 1 (M1-M3) — "Prove the fix"

**Métriques cibles**

- Trafic Ahrefs : 400 /j (baseline 164, +150 %).
- Keywords organiques : 400 (baseline 261).
- Devis reçus cumulés : 60-100.
- Revenue net M3 : 3 K€.
- Claim artisans : 100.
- Cash position M3 : scénario B 48 K€ / scénario C 34 K€.
- Équipe : Marvin + 1 freelance content.

**Décision GO/NO-GO M3**

- **GO scénario B** : trafic ≥ 300/j ET devis ≥ 30 ET cash ≥ 45 K€ → hire Senior FS Dev M3-M4.
- **GO scénario C** : GO B + traction > 400/j + 50+ devis + courbe +40 % MoM 3 mois → lancer levée M4.
- **NO-GO** : trafic < 220/j OU devis < 20 → rester scénario A, itérer technique 2 mois, ré-évaluer M5.

**Gate de pivot** : si revenue M3 net < 1 K€, question modèle business → tester abonnement test A/B avant d'engager budget accéléré.

### 6.2 Trimestre 2 (M4-M6) — "Prove the scaling"

**Métriques cibles**

- Trafic : 1 000 /j.
- Keywords : 700.
- Devis : 200 /mois.
- Revenue net : 15 K€ /mois.
- Claim artisans : 500.
- Cash position M6 : scénario B 18 K€ / scénario C 328 K€.
- Équipe : Marvin + 1 dev + 1 content lead + 1 freelance.

**Décision GO/NO-GO M6**

- **GO continue scénario B** : revenue ≥ 10 K€ /mois ET cash ≥ 20 K€ ET hires performants.
- **GO continue scénario C** : levée closed OU en cours serieux → continuer hires 3 et 4.
- **Pivot vers modèle abonnement** : si commission pure plafonne < 12 K€ /mois → tester freemium hybride M7.
- **NO-GO** : cash < 15 K€ ET revenue < 8 K€ → licencier hire 2 avant embauche, freeze recrutement 3 mois.

**Gate de pivot** : si conversion funnel stagnante < 1,5 % M6 → Product review intensif, retarder scaling content.

### 6.3 Trimestre 3 (M7-M9) — "Validate unit economics"

**Métriques cibles**

- Trafic : 1 900 /j.
- Keywords : 1 100.
- Devis : 560 /mois.
- Revenue net : 41 K€ /mois.
- Claim artisans : 1 200.
- LTV/CAC prouvé : > 5x.
- Cash position M9 : scénario B 31 K€ / scénario C 269 K€.
- Équipe : scénario B 3 personnes / scénario C 6 personnes.

**Décision GO/NO-GO M9**

- **GO scale** : LTV/CAC ≥ 5 ET revenue trajectory on-track → hire BDR + data engineer.
- **Hold** : LTV/CAC 3-5 → optimiser funnel 2 mois avant nouveau hire.
- **Pivot revenue** : si commission + abonnement < 30 K€ → analyse segmentation fine, retailored pricing.

### 6.4 Trimestre 4 (M10-M12) — "Establish leadership"

**Métriques cibles**

- Trafic : 2 500 /j.
- Keywords : 1 500.
- Devis : 1 000 /mois.
- Revenue net : 74 K€ /mois (ARR 890 K€).
- Claim artisans : 2 500.
- Part de voix Ahrefs secteur : top 3 sur "artisan RGE".
- Équipe : scénario B 3-4 / scénario C 6-7.

**Décision GO/NO-GO M12**

- **GO prepare Serie A** : ARR ≥ 800 K€ ET growth ≥ 15 % MoM → préparation Serie A M18-M20.
- **Continue organic** : ARR 400-800 K€ → tenir scénario B, éviter over-hire.
- **Pivot narrowly** : ARR < 400 K€ → focus profitabilité, scale down marketing, tenir profitabilité.

### 6.5 Trimestre 5 (M13-M15) — "Optimize and expand"

**Métriques cibles**

- Trafic : 3 100 /j.
- Devis : 1 400 /mois.
- Revenue net : 104 K€ /mois (ARR 1,25 M€).
- Claim artisans : 3 500.
- Équipe : 5-8 personnes.
- Expansion : 1 vertical adjacent validé (serrurier, plombier urgence, ou électricien dépannage).

**Décision GO/NO-GO M15**

- **GO Serie A** : ARR ≥ 1 M€ ET growth MoM ≥ 12 % → roadshow Serie A.
- **GO vertical expansion** : ARR on track + 1 vertical adjacent montre traction → dédier 1 hire au vertical.
- **GO profitability** : ARR 800 K€-1 M€ mais growth < 12 % → focus margin, pas de hires.

### 6.6 Trimestre 6 (M16-M18) — "Set up next level"

**Métriques cibles**

- Trafic : 3 700 /j.
- Devis : 1 750 /mois.
- Revenue net : 130 K€ /mois (ARR 1,56 M€).
- Claim artisans : 4 000.
- Équipe : 6-8 personnes.
- Cash fin M18 : scénario B 556 K€ / scénario C 538 K€ baseline.

**Décision M18**

- **GO Serie A closed** : raised 2-5 M€ to scale internationally (Belgique, Suisse romande) OU verticaux connexes.
- **GO maintain profitability** : opération rentable sans nouveau tour, ARR 1-2 M€ stable, 10-15 % MoM.
- **Exit possible** : LBO ou acquisition stratégique (PagesJaunes, Engie, EDF, scaleup rénovation).

---

## Action Sequence — 10 actions financières immédiates

1. **Jour 1** — Valider cash position réel (relevé bancaire Marvin + compte pro société), confirmer 80 K€ disponible. Si < 60 K€, pivoter directement scénario A et reporter tout hire de 3 mois.

2. **Semaine 1** — Déposer dossier **Bourse French Tech Bpifrance** (30 K€ non-dilutif). Dossier 5 pages + business plan simplifié. Délai instruction 3-4 mois, argent dispo M4. Aucune raison de ne pas le faire.

3. **Semaine 1** — Demander **statut JEI** (Jeune Entreprise Innovante) auprès du service des impôts des entreprises. Exonération charges patronales 7 ans = -30 % sur tout hire futur = 20 K€ économisés sur scénario B sur 12 mois, 50 K€+ sur scénario C.

4. **Semaine 2** — Rendez-vous **Réseau Entreprendre** (prêt d'honneur 30-50 K€ à taux 0 %). Process 2-3 mois, renforce la crédibilité banque et BA. Accompagnement d'un mentor senior gratuit bonus.

5. **Semaine 2** — Ouverture compte pro **Qonto Business** (si pas déjà fait) + banque pro traditionnelle (BNP, LCL) pour accéder au **PGE Bpifrance** (50-80 K€). Le double compte facilite le refinancement.

6. **Mois 1** — Setup **tracking revenue fin** : dashboard Supabase + Google Sheet consolidé. Métrics quotidiens : devis reçus, devis fermés, CAC, LTV estimé par cohort, cash burn mensuel, runway restant. Sans ça, les décisions GO/NO-GO sont aveugles.

7. **Mois 1** — Recruter **expert-comptable spécialisé tech/startup** : Dougs, Indy, ou cabinet traditionnel 200-400 €/mois. Paramétrer comptabilité analytique par projet/poste dès M1 (évite 20h de rework M12).

8. **Mois 2** — Si signaux Jour 1 validés, préparer **job description Senior Full-Stack Dev** + publier sur 3 canaux (Welcome, LinkedIn, Tech.rocks). Démarrer process 6-8 semaines avant besoin effectif (M3-M4).

9. **Mois 3** — Préparer **pitch deck seed** + **deal memo** interne. Identifier 15 BA cibles + 8 fonds seed cibles. Commencer conversations informelles pour décembre si scénario C envisagé.

10. **Mois 3** — Décision finale **scénario A vs B vs C** basée sur data M3 : si traffic +150 % post-Jour 1 ET revenue ≥ 2 K€ ET cash ≥ 55 K€, lancer scénario B. Si hyper-traction (+250 %, revenue ≥ 5 K€), lancer prep levée scénario C. Sinon scénario A pendant 3 mois supplémentaires.

---

**Ce chapitre 7 est un plan, pas une prophétie.** Les chiffres sont aussi honnêtes que les hypothèses, et les hypothèses dépendent d'un fix technique de 15 minutes (bailout SSR) et de décisions produit exécutées dans les 90 premiers jours. Le seul vrai risque, c'est de ne pas commencer. Le scénario B est le défaut raisonnable pour un fondateur qui a déjà construit l'asset (970K providers, 50K RGE, migration RGE-only prête) mais n'a pas encore prouvé la conversion revenue. Le scénario A est la ceinture de sécurité. Le scénario C est l'option ambitieuse, disponible seulement si le Jour 1 montre dans les 30 jours une traction convertible en pitch.

**La seule décision à prendre cette semaine** : exécuter le Jour 1, puis mesurer pendant 60 jours, puis choisir entre A, B ou C. Pas avant.
