# Sprint 3 — Stratégie outils, budget & exécution

**Date décision** : 2026-04-18
**Budget alloué** : 60 000€
**Fenêtre** : 6-12 mois
**Execution** : Claude Code (80% du travail) + user (review + publish + outreach humain)

---

## 1. Stack outils validé — 3 outils, 6.3K€/an

### Ahrefs Advanced — ~5K€/an ($450/mo)

**URL** : https://app.ahrefs.com/user/subscription

**Rôle unique** : volumes keywords réels + difficulty + analyse backlinks concurrents + AI Overviews citations.

**Outputs concrets** :

- Batch Analysis 100 keywords Sprint 3 → volume + KD + intent + traffic potential
- Site Explorer servicesartisans.fr → DR + BL + RD + organic traffic baseline
- Content Gap vs concurrents (Habitatpresto, Travaux.com, IZI by EDF, Hellio, Quotatis, Solocal) → +50-100 opportunités
- Keyword Explorer seed discovery (`maprimerenov`, `cee`, `rge`, `devis artisan`, `prix travaux`)
- Backlinks concurrents → liste top 500 referring domains à cibler

### Screaming Frog SEO Spider Pro — ~0.23K€/an (£199)

**URL** : https://www.screamingfrog.co.uk/seo-spider/licence/

**Rôle unique** : crawl technique complet des 459K pages.

**Outputs concrets** :

- Liste exhaustive des URLs → croisable avec GSC pour S3.3 (noindex brutal)
- Erreurs 404/500/redirects → liste de fix
- Titles/meta manquants, dupliqués, trop longs
- Canonical issues
- Pages orphelines (non linkées)
- Validation schema.org déployé (AggregateRating, FAQPage, Article)
- Log file analyzer inclus (analyse crawl Googlebot réel)

**Config critique pour 459K pages** :

- Memory : 16-24 GB
- Storage Mode : Database Storage (SSD, pas RAM)
- Crawl speed : 5 URLs/sec max
- User-Agent : Googlebot Smartphone
- Exclusions : `/api/*`, `/espace-*`, `/admin/*`, `/auth/*`

### SurferSEO Standard — ~1.1K€/an ($99/mo billed yearly)

**URL** : https://app.surferseo.com/billing

**Rôle unique** : optimisation sémantique flagship pages + **tracking AI Overviews** (critique vu AIO France H2 2026 - H1 2027).

**Outputs concrets** :

- Content Editor : 360 docs/an = 30/mois = largement suffisant pour 100 flagship × 3 itérations
- Score sémantique temps réel (target 75+/100 pour ranking sérieux)
- **AI Visibility tracking** : 25 AI prompts hebdo → savoir si on est cité par ChatGPT/Perplexity/Gemini/Claude
- Plagiarism Check
- Rank Drop Detection
- Brand Knowledge

**Features Standard vs Essential** (pourquoi on a choisi Standard) :

- AI Visibility tracking : ❌ Essential | ✅ Standard **critique pour AIO 2026-2027**
- AI Prompts tracking : ❌ Essential | ✅ Standard
- Plagiarism Check : ❌ Essential | ✅ Standard
- Rank Drop Detection : ❌ Essential | ✅ Standard

**Différence coût** : $10/mo de plus que Essential = $120/an pour débloquer la préparation AIO = no-brainer.

---

## 2. Budget 60K€ — allocation détaillée

| Poste                                    | Budget    | %      | Status                |
| ---------------------------------------- | --------- | ------ | --------------------- |
| **Outils SEO** (Ahrefs + SF + SurferSEO) | **6.3K€** | 10.5%  | **Achat immédiat**    |
| Photos auteurs E-E-A-T                   | 1.5K€     | 2.5%   | Semaine 2             |
| Backlinks / Digital PR (agence FR)       | 15-20K€   | 25-33% | Sprint 3.5 (mois 2-6) |
| Achat guest posts curated (sites DR 40+) | 10-15K€   | 17-25% | Sprint 3.5            |
| Réserve / embauche dev senior future     | 15-25K€   | 25-42% | Contingence           |
| Tests / opportunités imprévues           | 3-5K€     | 5-8%   | Continu               |
| **Total**                                | **60K€**  | 100%   |                       |

---

## 3. Répartition travail Claude Code vs Utilisateur

### Claude Code (~80% du travail intellectuel)

- ✅ Rédaction des 100 flagship pages (drafts complets, 2000-4000 mots, schema.org)
- ✅ Code des templates Next.js + Schema.org
- ✅ Analyse CSV Ahrefs + GSC + Screaming Frog
- ✅ Priorisation des 30 quick wins vs 70 long-terme
- ✅ Baromètre data propriétaire (queries Supabase + visualisations)
- ✅ Noindex brutal : liste pages + code implémentation
- ✅ Audit SEO technique continu
- ✅ Templates emails outreach backlinks
- ✅ Briefs missions (si dev senior hiré plus tard)
- ✅ Brief contenu pour SurferSEO
- ✅ Monitoring metrics + ajustements stratégie

### Utilisateur (~20% du travail, irremplaçable)

- 🔴 **Révoquer le PAT GitHub** exposé (URGENT) : https://github.com/settings/tokens
- 🔴 **Vérifier envs Vercel** : `CRON_SECRET`, `FROM_EMAIL`, `RESEND_API_KEY`, DKIM/SPF
- 🔴 **Souscrire les 3 outils** cette semaine
- 🔴 **Exports data** :
  - Ahrefs CSV : Batch Analysis 100 keywords + Site Explorer overview + Content Gap
  - GSC CSV 90 jours : Queries + Pages + Dates (pas mobile copy-paste)
  - Screaming Frog : All URLs + Response Codes + Canonical issues + Titles issues
- 🟡 Review drafts flagship pages avant publish
- 🟡 Publish contenu (Claude Code produit, user clic publish)
- 🟡 Outreach emails humains (backlinks, partenariats CCI/FFB/CAPEB)
- 🟡 Signature contrats (SLA artisans S1.13)
- 🟡 Photos auteurs (sessions pro si besoin)
- 🟡 Monitoring GSC continu + feedback à Claude Code

---

## 4. Avantage concret attendu

### Ce que les outils SEULS donnent

**Infrastructure + data** pour ne plus piloter à l'aveugle. Économie directe : 10-20 flagship pages évitées sur requêtes à 0 vol réel = **6-12K€ d'écriture inutile évitée**.

### Ce qui génère le VRAI avantage

L'équation complète :

```
Avantage = (Moat produit) × (Outils) × (Exécution disciplinée) × (Temps)
```

**Moat produit ServicesArtisans (existant, non copiable) :**

- Leads exclusifs 1=1 artisan (enforced DB post-migration 455)
- Reviews flywheel technique branché (Sprint 1 livré + déployé)
- Sprint 2 CTR rewrites sur 459K pages (cascade recrawl en cours ~8 jours)
- Data propriétaire devis_requests + reviews + lead_assignments

**Facteur temps** : min 3-6 mois pour voir l'effet complet des flagship pages + backlinks.

### Prédictions 3 scénarios T+6 mois

| Scénario                                   | Clics/jour            | Pages top 3 | DR    | Probabilité |
| ------------------------------------------ | --------------------- | ----------- | ----- | ----------- |
| **Solide** : outils + exécution 4h/j user  | 1800-2200 (+400-500%) | 150-200     | 32-38 | 40%         |
| **Moyen** : outils + exécution 1h/j user   | 900-1300 (+150-270%)  | 80-120      | 27-32 | 45%         |
| **Faible** : outils + exécution sporadique | 500-700 (+40-100%)    | 30-50       | 24-26 | 15%         |

Sprint 2 déjà livré porte **minimum +40-85%** même sans Sprint 3 = **500-650 clics/j garantis** dans 2-4 semaines.

---

## 5. Ordre d'exécution Sprint 3

### Semaine 1 — Setup outils + data (2-3h user)

1. Révoquer PAT GitHub
2. Vérifier envs Vercel
3. Souscrire Ahrefs Advanced + Screaming Frog Pro + SurferSEO Standard
4. Lancer crawl Screaming Frog (6-12h en background)
5. Export GSC CSV 90 jours
6. Import 100 keywords dans Ahrefs Batch Analysis
7. Export tous les CSVs → transmettre à Claude Code

### Semaine 2 — Analyse + priorisation (Claude Code 100%)

1. Analyse CSV Ahrefs → priorisation 30 quick wins + 50 long-terme + 20 à drop
2. Analyse CSV Screaming Frog → liste fix techniques + pages à noindex
3. Crossage GSC × Screaming Frog → liste exhaustive pages 0 impression à noindex brutal
4. Setup 25 AI Prompts SurferSEO sur queries critiques
5. Baseline AI Visibility (où on est cité ou pas)
6. Architecture template flagship page (S3.2)

### Semaines 3-4 — Quick wins (Claude Code + user review)

- 10 flagship pages cluster 3 (Comment choisir) + cluster 8 (Problèmes) — faible difficulty
- Implémentation noindex brutal (S3.3)
- Baromètre data propriétaire (S3.4) — queries Supabase + visualisations

### Semaines 5-8 — Scale up

- 30 flagship pages sur clusters 1-2 (Prix + Aides) — intent commercial fort
- Démarrage campagne backlinks (S3.5) — agence FR ou outreach manuel

### Semaines 9-12 — Long-tail + optimisation

- 60 flagship pages restantes
- Itérations sur pages sous-performantes (SurferSEO rescore)
- Digital PR sur data baromètre

---

## 6. KPIs target T+6 mois

| KPI                    | Baseline 2026-04-18 | Target T+6 mois |
| ---------------------- | ------------------- | --------------- |
| Clics/jour GSC         | 350                 | 1800-2200       |
| Impressions/jour       | 15 000              | 60-80 000       |
| CTR moyen              | 1.5%                | 3-4%            |
| Pages top 3            | ~50                 | 150-200         |
| Avis clients DB        | 0                   | 2000+           |
| Domain Rating          | 22                  | 32-38           |
| AI Overviews citations | 0                   | 5-10 queries    |
| Referring domains      | ~150                | 400-600         |

---

## 7. Dépendances bloquantes

1. **Révocation PAT GitHub** (URGENT - sécurité)
2. **Envs Vercel** : cron reviews + Resend DKIM/SPF sinon flywheel inactif
3. **Seed avis réels** via `scripts/import-reviews-seed.ts` → prérequis rich snippets ★
4. **Souscription 3 outils** → prérequis data-driven decisions
5. **Exports CSV** (Ahrefs + GSC + Screaming Frog) → prérequis analyse réelle
6. **Discipline review/publish user** : 20 min/jour minimum

---

## 8. Risques + mitigations

| Risque                                | Probabilité     | Mitigation                                                             |
| ------------------------------------- | --------------- | ---------------------------------------------------------------------- |
| Volumes Ahrefs surestimés vs réalité  | Moyenne         | Buffer 10-15% keywords, Content Gap discovery                          |
| AIO France absorbe queries info       | Haute (H2 2026) | Hedge sur transactional + commercial, tracking AI Visibility SurferSEO |
| Concurrence IZI by EDF agressive      | Haute           | Moat leads exclusifs DB + baromètre data inimitable                    |
| Bus factor 1 user                     | Haute           | 25K€ réserve dispo pour embauche dev senior à tout moment              |
| User capacity < 20min/jour            | Moyenne         | Sprint 2 déjà livré porte +40-85% même si Sprint 3 ralentit            |
| Google update pénalise templates pSEO | Faible          | Noindex brutal S3.3 réduit l'exposition                                |

---

## 9. Exclusions — outils que je n'achète PAS

❌ **Semrush** (redondant avec Ahrefs)
❌ **ContentKing** (monitoring temps réel utile seulement si équipe >5 éditeurs)
❌ **MarketMuse** (SurferSEO Standard fait déjà AI Visibility)
❌ **Frase** (SurferSEO plus complet)
❌ **Moz Pro** (Ahrefs mieux sur backlinks)
❌ **Sitebulb / DeepCrawl / JetOctopus** (Screaming Frog suffit)
❌ **Notion / Airtable** (GitHub suffit pour workflow content)
❌ **Plugins WordPress SEO** (stack Next.js)
❌ **Chatbot Intercom / Drift** (kill la conversion, rappel mémoire)

---

## 10. Outils GRATUITS déjà utilisés

| Outil gratuit          | Usage                                                  |
| ---------------------- | ------------------------------------------------------ |
| Google Search Console  | Data réelle clics/impressions/position sur SA          |
| Google Analytics 4     | Trafic + conversions                                   |
| Supabase Dashboard     | Data propriétaire leads/reviews/artisans               |
| Vercel Dashboard       | Logs deploys + Core Web Vitals                         |
| ADEME open data API    | Data RGE officielle                                    |
| INSEE / data.gouv.fr   | Stats publiques France                                 |
| Claude Code            | Rédaction + code + audit + data analysis (80% travail) |
| Google Keyword Planner | Backup volumes si Ahrefs insuffisant                   |

---

## 11. Décision finale validée

**Souscription immédiate (cette semaine)** :

- ✅ Ahrefs Advanced yearly (~5K€)
- ✅ Screaming Frog Pro yearly (~0.23K€)
- ✅ SurferSEO Standard yearly (~1.1K€)

**Total cash-out immédiat** : ~6.3K€ (10.5% du budget 60K€)

**Réservé pour plus tard** : 53.7K€

- Backlinks / Digital PR (15-20K€ dans 2-3 mois)
- Guest posts (10-15K€ continu)
- Réserve dev senior si bus factor critique (15-25K€)
- Tests / opportunités (3-5K€)

---

## 12. Actions USER requises cette semaine

Ordre strict :

1. **MAINTENANT** : Révoquer le PAT GitHub exposé dans la session (voir transcript) → https://github.com/settings/tokens et générer un nouveau token scoped `repo` uniquement
2. **Aujourd'hui** : Souscrire Ahrefs Advanced
3. **Aujourd'hui** : Télécharger + souscrire Screaming Frog Pro
4. **Aujourd'hui** : Souscrire SurferSEO Standard
5. **Cette semaine** : Vérifier envs Vercel + Resend DKIM/SPF
6. **Cette semaine** : Lancer crawl Screaming Frog servicesartisans.fr
7. **Cette semaine** : Export GSC CSV 90 jours propre
8. **Cette semaine** : Import 100 keywords dans Ahrefs Batch Analysis + export
9. **Transmettre CSVs à Claude Code** → démarrage Sprint 3 réel

---

**Document de référence. À relire mensuellement pour arbitrage + ajustement.**
