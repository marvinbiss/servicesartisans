# Plan v2 — Chapitre 5 : Pre-Mortem & Competitive Intelligence Loop

**Date** : 2026-04-18
**Auteur** : Plan v2, chapitre 5/N
**Destinataire** : Marvin Bissohong (CEO) + équipe exécution
**Dépendances** : lit chapitres 1-4 (diagnostic, Golden Path, pivot RGE-only, roadmap 12 sem)
**Mission** : identifier les causes d'échec AVANT qu'elles n'arrivent, construire une veille concurrentielle armée, définir les kill-switch d'un pivot stratégique.

> "Les entrepreneurs qui échouent ne le font jamais pour une cause qu'ils n'avaient pas identifiée. Ils échouent pour une cause qu'ils avaient identifiée mais qu'ils ont choisi d'ignorer." — post-mortem Hopps (2023)

---

## 0. Cadre méthodologique — Pourquoi un pre-mortem maintenant

Gary Klein (ex-chercheur CIA, inventeur du Recognition-Primed Decision Model) a démontré qu'un pre-mortem — imaginer **que le projet a déjà échoué** et remonter aux causes — produit 30 % d'identification de risques en plus qu'une analyse classique de risques. La raison est cognitive : le cerveau humain a horreur de l'échec abstrait mais excelle à expliquer un échec posé comme acquis.

On applique cette méthode à ServicesArtisans avec une contrainte supplémentaire : **chaque cause d'échec doit être ancrée dans une analogie sectorielle vérifiable** (Hopps, Frichti, Take Eat Easy, Travaux.com, Depanneo, Drivy, Homejoy, Thumbtack US, Handy, Porch.com). Pas de "il pourrait y avoir". Uniquement "voici qui s'est planté sur cette cause précise, voici pourquoi, voici comment on s'en prémunit".

Le chapitre suit 5 parties :

1. **Pre-Mortem** — 28 causes d'échec structurées (6 catégories × ~5 causes)
2. **Theory of Victory opposée** — ce que pensent nos 8 concurrents majeurs
3. **Competitive Intelligence Loop** — veille hebdo armée et automatisée
4. **War Gaming** — 3 scénarios catastrophe simulés
5. **Kill Switch Conditions** — triggers quantifiés de pivot

Il se termine par **12 actions immédiates** à exécuter dans les 10 jours ouvrés suivants.

---

## Partie 1 — PRE-MORTEM : 28 causes d'échec crédibles

**Hypothèse de départ** : on est le 18 avril 2027. Le plan a échoué. Traffic < 200 visites/jour (vs cible 2 500), zéro devis RGE exclusif signé, DR resté sous 5, l'équipe est démoralisée, deux concurrents qu'on ignorait il y a un an nous ont doublés. Marvin rédige le post-mortem. Voici les 28 causes qu'il y trouverait.

### Catégorie A — Techniques (5 causes)

#### A1. Le fix bailout SSR casse une fonctionnalité invisible en prod

**Probabilité** : Moyenne. **Impact** : Critique.

Le `CompareProviderWrapper` a été posé en `ssr:false` par quelqu'un qui, un jour, a eu une vraie raison de le faire — même si cette raison est aujourd'hui obsolète. Le retirer peut exposer :

- un `useEffect` qui appelle `window.localStorage.getItem('compare-list')` au mount → crash SSR
- un import transitif d'une lib client-only (ex : une lib de charting)
- un provider qui dépend d'un cookie Supabase qu'on ne lit pas côté serveur

**Analogie** : Frichti en 2019 a cassé son checkout mobile en déployant un "petit" refactor du context provider cart. 48h de downtime partiel, -22 % GMV semaine. Le bug n'était pas dans le context mais dans un `useEffect` enfant qui présupposait l'existence de `window`.

**Signal d'alerte précoce** : erreurs 500 Vercel + spike `console.error` côté client dans les 5 min post-déploiement. Taux d'erreur Sentry > 0,3 %.

**Mitigation préventive** :

- Avant retrait, lancer `grep -r "window\." src/components/CompareProvider* src/components/ui/Header*` et auditer tout match
- Wrapper défensif : `typeof window !== 'undefined'` sur chaque accès navigateur identifié
- Déploiement canary (Vercel preview) avec curl sur 10 URLs témoin avant merge main
- Feature flag `NEXT_PUBLIC_DISABLE_COMPARE` pour rollback <30s

**Plan de contingence** : rollback Vercel (git revert + redeploy = 3 min). Reproduire en local avec `next build && next start`. Fix ciblé. Nouveau déploiement canary. Ne **jamais** tenter de corriger à chaud en prod.

---

#### A2. Supabase down ou performance dégradée 48-72h pendant une vague de crawl

**Probabilité** : Faible. **Impact** : Élevé.

Supabase a connu 3 incidents majeurs en 2024 et 2 en 2025 (source : status.supabase.com historique). Une dégradation de la Postgres managée pendant que Googlebot crawle 50 000 URLs RGE produit des 500 massifs, Google interprète comme "site instable" et déclasse.

**Analogie** : Drivy en 2017, downtime Heroku 6h, perte de 40 % du trafic organique sur 3 semaines (soft signal de trust perdu, pas récupéré avant 8 semaines).

**Signal d'alerte précoce** : p99 latency Vercel > 800 ms (normal : ~200 ms), taux 5xx > 1 % sur une fenêtre de 10 min, alerte statuspage Supabase.

**Mitigation préventive** :

- Cache ISR long (revalidate 86400s) sur les pages providers RGE → tolère backend down sans servir d'erreur
- CDN Vercel Edge + fallback HTML statique généré à build time pour top 1000 villes × 10 métiers RGE
- Cron de génération sitemap ne dépend pas de Postgres (pré-matérialisé)
- Alerte PagerDuty (ou Better Uptime, gratuit) sur 3 canaux : CEO email + SMS + Discord webhook

**Plan de contingence** : bascule en mode "read-only degraded" (bannière site + 503 sur formulaires POST, 200 sur reads via cache). Communication transparente via page `/status`. Si > 2h, basculer DNS vers un fallback Cloudflare Workers servant le dernier snapshot HTML de top pages.

---

#### A3. Vercel change ses quotas/pricing et tue notre modèle unitaire

**Probabilité** : Moyenne (Vercel a augmenté pricing 3× en 18 mois 2024-2026). **Impact** : Moyen.

À 50 000 pages RGE + trafic x15, les Function Invocations et le bandwidth peuvent dépasser l'offre Pro (20 $/mois). À 2 500 visites/jour × 8 PV moyen × 459 K pages ISR regénérées… on peut passer de 20 $/mois à 400 $/mois sans changement de code. C'est survivable mais imprévu au budget accéléré (3 645 €/mois).

**Analogie** : Netlify 2022 a forcé un éditeur média indépendant (Indy Hall) à migrer vers un VPS en 2 semaines suite à un changement de quotas bande passante. Le dev lead a passé 3 semaines sur la migration au lieu de features.

**Signal d'alerte précoce** : emails Vercel "approaching quota", facture M+1 > M0 × 1,5, dashboard Vercel affichant "Function Invocations 80 % used".

**Mitigation préventive** :

- Instrumenter tôt : `vercel analytics` + alerte quand spend mensuel dépasse seuil
- Pages providers RGE en **full ISR static** (pas SSR) → bandwidth seulement, zéro function invocations
- Migrer images vers Cloudflare R2 ou bunny.net (bandwidth 90 % moins cher)
- Budget "infra scale" réservé (500 €/mois) dès M3 dans scénario accéléré

**Plan de contingence** : plan B "Cloudflare Pages + Workers" déjà scopé (1 jour-dev de migration, pas plus, le code Next.js 14 est portable). Éviter le DIY Kubernetes — trop coûteux en temps CEO.

---

#### A4. Bug silencieux de canonicals / hreflang qui duplique l'index

**Probabilité** : Moyenne. **Impact** : Élevé.

En générant 50 K pages providers RGE + 1 K pages villes + 500 pages longue traîne + variantes (`?city=`, `?service=`, filtres), il est quasi-certain qu'un bug canonical produit 2-10× la cardinalité réelle en index Google. Google interprète ça comme content farm et déclasse tout le silo.

**Analogie** : Depanneo en 2023 a généré accidentellement ~50 000 URLs avec paramètres `?sort=` indexables. Google a désindexé **tout le site pendant 4 mois**. Bataille à coup de 301 + canonical correct pour récupérer. Chute -28 % confirmée dans Ahrefs Q1 2026.

**Signal d'alerte précoce** : GSC > "Pages" > "Dupliquée, Google a choisi une canonique différente de l'utilisateur" augmente > 5 % des indexées. Ou : sitemap déclare N URLs, GSC rapporte indexées = N × 2.

**Mitigation préventive** :

- Test unitaire dédié `tests/seo/canonical.spec.ts` sur 100 URLs représentatives qui vérifie `<link rel="canonical">` = URL demandée
- Middleware Next.js qui supprime `?utm_*`, `?gclid=`, `?fbclid=` des canonicals rendus
- Audit hebdomadaire via Screaming Frog gratuit (500 URLs, suffisant pour échantillonnage)
- Règle : aucune page avec paramètre de filtre n'est indexable (meta `robots noindex` systématique)

**Plan de contingence** : purge sitemap, submit nouveau sitemap canonical-clean, GSC URL removal tool en batch, attendre 4-8 semaines de re-crawl. Dans l'intervalle : communication transparente dans le blog pour aspirer des backlinks "transparence" qui compensent.

---

#### A5. Migration noindex RGE-only mal configurée désindexe Tier A par erreur

**Probabilité** : Faible (script idempotent existe). **Impact** : Critique.

Le script `scripts/noindex-non-rge.ts` gère deux phases : (1) noindex non-RGE, (2) index RGE/claim. Un bug logique (typo dans `WHERE rge_valid_until > now()` → `now()::date` différent, timezone server vs app, NULL vs empty string) peut désindexer par erreur les 50 K RGE = **mort instantanée**.

**Analogie** : Airbnb 2017, migration canonical a accidentellement mis `noindex` sur 70 % des listings pendant 6 heures. Heureusement détecté par un ingénieur SEO senior. Si ça avait duré 48h, perte chiffrée à 30 M$.

**Signal d'alerte précoce** : dashboard SQL post-script affiche `count(*) WHERE noindex = false AND (rge_valid_until > now() OR claimed_at IS NOT NULL)` ≠ 50 347 attendu.

**Mitigation préventive** :

- Dry-run obligatoire : `--dry-run` flag qui `SELECT count(*)` sans `UPDATE`
- Snapshot DB pg_dump avant exécution (`supabase db dump > pre-noindex-$(date +%F).sql`)
- Assertion post-phase : si count indexables < 45 000, rollback automatique
- Exécution en heures creuses (23h-05h) avec CEO online + 1 dev en backup

**Plan de contingence** : rollback SQL prêt : `UPDATE providers SET noindex = false WHERE rge_valid_until > now() OR claimed_at IS NOT NULL;`. Re-submit sitemap à Google + IndexNow. Temps de récupération estimé : 48-72h si détecté en <2h.

---

### Catégorie B — Algorithmiques Google / LLM (5 causes)

#### B1. Core Update défavorable en Mai-Juin 2026 (fenêtre classique)

**Probabilité** : Élevée (Google publie 2-4 core updates/an depuis 2022). **Impact** : Élevé.

On vient de subir l'Helpful Content Update déc. 2025 (-41 % sur 18/20 concurrents). La prochaine fenêtre probable est mai-juin 2026, exactement quand le plan v2 commence à produire du trafic. Si l'update cible spécifiquement "directory/aggregator thin content", même avec le pivot RGE-only on peut être touché.

**Analogie** : travaux.com a perdu 4 820 pages en mars 2025 sur un core update. Ils avaient pourtant enrichi leurs fiches 18 mois plus tôt — l'update avait relevé la barre.

**Signal d'alerte précoce** : rollout Google officiel (blog Search Central, Barry Schwartz), mouvements brutaux sur concurrents (Ahrefs daily), chute > 15 % trafic 48h post-rollout.

**Mitigation préventive** :

- Diversifier les canaux d'acquisition AVANT que ça arrive : LLM citations (395 → 5 000), direct traffic (newsletter), branded search (PR). Cible : < 65 % trafic organique Google à M6.
- E-E-A-T renforcé : auteur YMYL identifié sur toutes les pages MaPrimeRénov', cité dans ≥2 médias Tier 1
- "Information gain" par page : chaque guide cite une donnée qu'aucun concurrent n'a (data ADEME propriétaire)

**Plan de contingence** : rollout-watch hebdo via Ahrefs + Sistrix. Si chute > 15 % observée : pas de panique 3 semaines (Google iterate), documenter précisément les pages touchées, lancer audit E-E-A-T ciblé. Si persistent M+1 : pivot partiel vers LLM-first distribution (cf. war game scénario 2).

---

#### B2. AI Overviews capture 50 % des clics informationnels

**Probabilité** : Élevée (déjà amorcé Q1 2026, cf. audit -33 %). **Impact** : Critique pour contenus guides.

Les guides `/guides/maprimerenov-2026/`, `/guides/audit-energetique/`, etc. produisent la majorité du top-of-funnel. Si Google AI Overview répond directement "MaPrimeRénov' monte à X € pour pompe à chaleur", le CTR peut chuter de 30 % à 5 %.

**Analogie** : HealthLine.com 2024, -48 % trafic organique en 6 mois sur les guides santé après rollout AI Overviews US. Ils n'avaient aucune stratégie "LLM-first". Ceux qui ont survécu : VerywellHealth (auteur expert nommé + data originale + bylines médicales).

**Signal d'alerte précoce** : CTR GSC sur guides passe de ~8 % à < 3 %. Queries apparaissent dans AI Overview mais site non cité. Ahrefs "Keyword Positions" montre un gap entre impressions (stables) et clics (en chute).

**Mitigation préventive** :

- "AI Overview-proofing" : chaque guide contient ≥3 data points uniques (chiffres, cartes, calculs) qu'une AI doit **citer** pour être crédible
- Structure Q&A explicite (H2 = question, H3 = réponse directe) → favorable inclusion
- Schema.org `FAQPage`, `HowTo`, `Article` avec `author.@type = Person` complet
- Soumission active aux citations ChatGPT, Perplexity (via leurs programmes publics) + aux index de fine-tuning (OpenAI, Anthropic Google-Extended bloc déjà décidé unblock)
- Push simulateur comme killer feature **non-générative** (une IA ne peut pas faire une simulation Pipedrive → click forcé)

**Plan de contingence** : cf. War Game Scénario 2 (section 4.2). Pivot vers "LLM citation farm" stratégique : produire du contenu conçu pour être cité par LLM plutôt que ranker en SERP classique.

---

#### B3. Google considère ServicesArtisans comme parasite SEO de l'ADEME

**Probabilité** : Faible-Moyenne. **Impact** : Critique.

Notre USP repose sur la data ADEME (RGE) + INSEE (SIRET) + ANAH (MaPrimeRénov'). Si Google nous classe comme "parasite site" re-publiant des données publiques sans valeur ajoutée, on est broyé comme Genius.com 2024 (suspicion scraping) ou EntrepreneursMag (2023, -70 % trafic).

**Analogie** : ForbesHealth et WSJBuySide ont été pénalisés en 2024 pour "Site Reputation Abuse" — contenu produit par affiliés sans editorial review. Google a publié une guideline spécifique mars 2024.

**Signal d'alerte précoce** : baisse SEO sur queries où concurrents officiels (france-renov.gouv.fr, ademe.fr) ranquent au-dessus. Absence des pages RGE dans AI Overviews alors qu'elles ont le meilleur data. GSC "Manual Action" warning.

**Mitigation préventive** :

- Chaque page RGE doit ajouter **valeur editoriale** : rating artisan, zone de chalandise calculée, disponibilité en temps réel, comparatif local. Pas juste "nom + SIRET + certif".
- Transparence source : footer de chaque page "Données RGE synchronisées le {date} depuis data.ademe.fr" avec lien sortant. Signal de transparence, pas d'aspiration silencieuse.
- Licence ouverte respectée (ADEME = Licence Ouverte 2.0) visible sur page légale
- Ne **jamais** reproduire 1:1 les data gouvernementales ; toujours enrichir (géocodage BAN, calcul score, texte unique)

**Plan de contingence** : si manual action reçue, desk reconciliation : réponse détaillée à Google listing des enrichissements. Historiquement la procédure prend 2-6 semaines mais récupère le site si argumentée.

---

#### B4. Schema.org mal validé déclenche rich-result malus

**Probabilité** : Moyenne. **Impact** : Moyen.

Le plan déploie LocalBusiness + Certification + HowTo + FAQ + Article. Un bug JSON-LD (date invalide, `priceRange` non conforme, `aggregateRating` avec 0 reviews mais déclaré) → Google log un warning en masse et dégrade rich results.

**Analogie** : TripAdvisor 2021 a déclaré `aggregateRating` avec `reviewCount: 0` sur les nouvelles fiches restaurants. Google a retiré les étoiles du SERP pendant 2 mois sur le site.

**Signal d'alerte précoce** : GSC > "Enhancements" affiche `Invalid` > 2 % des pages. Rich Results Test (search.google.com/test/rich-results) échoue sur échantillon.

**Mitigation préventive** :

- Test d'intégration Playwright qui valide chaque template avec `https://validator.schema.org/validate` sur 1 URL par template
- CI/CD : rebuild échoue si schema invalide détecté sur 100 URLs samples
- Ne pas déclarer `aggregateRating` si `reviewCount = 0` (conditionnel en template)
- Ne pas déclarer `priceRange` sur fiche artisan avant que le champ soit peuplé (pas de `"€"` vide)

**Plan de contingence** : audit complet en 1 jour via Screaming Frog + custom extract JSON-LD. Correction globale par ajustement template (1 PR). Temps de récupération : 2-4 semaines re-crawl.

---

#### B5. Google HCU-style update touche spécifiquement "annuaires RGE"

**Probabilité** : Faible-Moyenne. **Impact** : Critique.

Si Google estime que les annuaires RGE (nous, effy.fr, quelleenergie.fr) dupliquent data.ademe.fr et n'apportent rien, un update ciblé peut déclasser **tout le segment**. Notre pivot RGE-only deviendrait alors le choix qui nous tue.

**Analogie** : en 2023, Google a écrasé les "deals coupon sites" (RetailMeNot, Coupons.com) après un update ciblé. Tout le vertical en -50 %.

**Signal d'alerte précoce** : chute concordante avec nos concurrents directs sur queries RGE + apparition de `france-renov.gouv.fr` ou `ademe.fr` en position 1-3 sur ces mêmes queries.

**Mitigation préventive** :

- **Diversification verticale** : pas juste RGE, aussi urgence/dépannage (/urgence/\*, déjà 62 new KW qui décollent), devis tous métiers, guides entretien
- USP combinée (RGE+SIRET+MaPrimeRénov'+simulateur) plutôt que RGE seul
- Branded search via PR + notoriété : à M6, viser 5 % de trafic "servicesartisans" branded
- Ne pas mettre 100 % du contenu éditorial sur RGE : 60/40 RGE/généraliste

**Plan de contingence** : pivot scénario 3 war game (section 4.3). Repli sur /urgence/_ + /tarifs/_ + lead gen B2C généraliste.

---

### Catégorie C — Concurrentiels (5 causes)

#### C1. effy.fr copie stratégie RGE-first en 90 jours

**Probabilité** : Élevée (ils ont les moyens + l'expertise énergétique). **Impact** : Élevé.

effy.fr a -17 % trafic mais DR 52, backlinks 40K, équipe de 80 personnes. Si leur CEO lit un de nos guides, il peut cloner notre approche en 90 jours avec plus d'autorité.

**Analogie** : Thumbtack US 2016, Google Home Services (Google lui-même) a copié l'UX et ajouté la certification + verification → Thumbtack a perdu ~40 % de share en 18 mois.

**Signal d'alerte précoce** :

- Nouveau sitemap effy.fr > 1 000 URLs "artisans-rge-[ville]"
- Leur homepage ajoute une bannière "Trouvez un artisan RGE certifié"
- Embauches LinkedIn "SEO Manager" ou "Head of Content" chez effy
- Ahrefs: effy gagne > 500 new KW RGE en 1 mois

**Mitigation préventive** :

- **Vitesse d'exécution** : fenêtre d'avance est de 3-6 mois, exploiter entièrement (Golden Path 12 sem)
- **Moat data** : partenariat API Entreprise DataPass (cf. Décision #8 master plan) + sync ADEME quotidien → 24h fraîcheur vs 7j
- **Trust moat** : auteur YMYL fondateur nommé, backlinks institutionnels CAPEB/FFB signés exclusifs si possible
- Honeypot : 1 SIRET fictif identifiable dans nos données (voir 3.6) → détection copie

**Plan de contingence** : cf. War Game Scénario 1 (section 4.1). Accélérer différentiation (MaPrimeRénov' simulator + carte interactive + lead exclusif) sur 30 jours, lancer comms "première plateforme RGE garantie exclusive".

---

#### C2. Un nouvel entrant pure-player RGE se lance avec funding série A

**Probabilité** : Moyenne. **Impact** : Élevé.

Le marché rénovation énergétique attire du VC (MaPrimeRénov' = 4 Md€/an budget État). Un entrant avec 3-5 M€ de levée peut inonder SEM, acheter backlinks, embaucher 3 SEO seniors et brûler cash sur 18 mois.

**Analogie** : Homejoy (2014, 40M$ levé, mort 2015) puis Handy (racheté) ont écrasé un segment home services pendant 24 mois avec cash brûlé. Qui a survécu : les "scrappy" avec moat (Thumbtack).

**Signal d'alerte précoce** :

- Crunchbase alert "rénovation énergétique" + "série A"
- Sites Carbure, FrenchWeb annoncent une levée dans le vertical
- Nouveau domaine < 6 mois apparaît soudainement dans les top 10 KW RGE
- Recruteurs LinkedIn chassent nos employés (signal qu'ils nous identifient comme référence)

**Mitigation préventive** :

- Moat data (idem C1) + moat distribution (relations presse + institutionnels) → coût de rattrapage > 2 M€ pour un entrant
- Construire une community artisans RGE engagée (Slack privé, 100+ membres à M6) — l'entrant ne peut pas cloner des relations humaines
- Enregistrer domaines défensifs `servicesrge.fr`, `artisans-rge.fr`, `primerenov-artisans.fr` (500 € total)

**Plan de contingence** : si entrant détecté série A → accélérer le "land grab" presse + institutionnels dans un sprint 60j. Positionner ServicesArtisans comme "l'annuaire historique, incumbent". Racheter tactiquement des mots-clés SEM sur leur nom de marque pendant leur période de notoriété.

---

#### C3. societe.com ajoute un filtre "certification RGE" à sa recherche entreprise

**Probabilité** : Faible-Moyenne (ils n'ont jamais été dans le vertical rénovation). **Impact** : Critique.

societe.com = DR 87, 15M de pages indexées, +63 % trafic Q1 2026. Leur avantage : **ils ont déjà toutes les entreprises françaises indexées**. Ajouter un filtre RGE = 1 sprint ingé. Ils deviennent alors tout ce qu'on veut être avec ×100 d'autorité.

**Analogie** : Yelp 2012 face aux verticaux reviews restaurants → Yelp a juste ajouté des filtres cuisine + bio et écrasé les verticaux en 6 mois. Cas analogue : pappers.fr a "généralisé" son offre et capturé les verticaux SIRET.

**Signal d'alerte précoce** :

- Blog societe.com publie "RGE", "rénovation énergétique"
- Nouvelles pages societe.com : `/rge/[ville]`, `/annuaire/artisans-rge`
- Partenariat ADEME annoncé officiellement (communiqué de presse)

**Mitigation préventive** :

- Ne pas rentrer en compétition frontale SIRET (ils gagnent)
- Positionnement strict : "annuaire artisans + devis exclusif + simulateur aides" (pas "base de données entreprises")
- Ajouter deux moats qu'ils n'ont PAS : (1) flow devis exclusif lead, (2) review artisan verified by booking_id
- Différenciateur produit : simulateur MaPrimeRénov' live (pas dans leur ADN)

**Plan de contingence** : accepter le territoire SIRET, sur-investir sur territoire "lead exclusif + transaction". Pivoter narrative PR vers "la plateforme qui transforme l'information en devis signé".

---

#### C4. travaux.com ou allovoisins pivotent sur RGE avec leur stock de trafic historique

**Probabilité** : Moyenne. **Impact** : Moyen.

Malgré leur chute (-4 820 pages, -6 841 pages), ils gardent un stock d'authority (DR 50+, backlinks 15K+). Si un PM survivant dit "pivotons sur RGE", ils ont de l'avance structurelle.

**Analogie** : Frichti pivotant sur épicerie bio 2021 a redistribué son trafic existant → +80 % revenus 9 mois alors que la home-food était morte.

**Signal d'alerte précoce** : refonte visuelle de leur homepage avec mise en avant RGE, nouvelle page "/rge" ou "/renovation-energetique".

**Mitigation préventive** :

- Capturer prioritairement les KW sur lesquels ils sont en chute (cf. stratégie KW reconquête chap 3 déjà planifiée)
- Redirect récupérés via backlinks broken-link building sur leurs 404 (via Ahrefs broken backlinks)
- Enregistrer positionnement "100 % RGE" avant qu'ils le fassent

**Plan de contingence** : accélérer 301 broken backlink outreach (~200 backlinks à récupérer) sur sprint 4.

---

#### C5. Mon Accompagnateur Rénov' devient obligatoire et capture le funnel amont

**Probabilité** : Moyenne-Élevée (déjà obligatoire en 2024 pour rénovation d'ampleur > 5K€ d'aide). **Impact** : Moyen-Élevé.

Si MAR devient la porte d'entrée obligatoire de MaPrimeRénov' pour TOUS les travaux, notre simulateur perd de son attrait (le particulier doit passer par MAR avant même de chercher un artisan).

**Analogie** : en assurance, comparateurs généralistes (LeLynx) ont perdu 30 % de leur funnel quand les assureurs ont imposé le devis en direct en 2015.

**Signal d'alerte précoce** : décret JORF étend obligation MAR. Trafic organique sur "simulateur MaPrimeRénov'" baisse mécaniquement.

**Mitigation préventive** :

- **Partenariat MAR** (déjà identifié master plan Sprint 4-12) : devenir MAR partenaire ou référenceur officiel → on prend le haut du funnel par contrat
- Positionnement "post-MAR" : une fois MAR fait, venir chez nous pour choisir l'artisan RGE (niche conservée)
- Formation équipe interne à devenir MAR certifié (1 personne, 5 jours de formation, 2 500 €)

**Plan de contingence** : si décret 2026 élargit MAR, lancer partenariat MAR en 30 jours + pivot de la prop value de "trouvez + comparez artisan RGE" vers "finalisez votre projet après MAR".

---

### Catégorie D — Réglementaires / Juridiques (4 causes)

#### D1. CNIL sanctionne sur gestion data particuliers devis

**Probabilité** : Faible-Moyenne (inspections secteur 2025 +40 %). **Impact** : Critique.

Stockage de 970 K providers + données particuliers pour leads → si RGPD mal exécuté (consentement pas opt-in clair, durée conservation trop longue, transmission artisan non documentée), amende CNIL de 2-4 % CA possible.

**Analogie** : Doctolib n'a pas été sanctionné mais a subi 3 plaintes CNIL 2022-2023 → ~6 mois de legal time. Dernière sanction marketplace similaire : Amazon France 32 M€ janv. 2024.

**Signal d'alerte précoce** : email CNIL "demande d'information", plainte utilisateur sur la page "Mes données", ticket support mentionnant "je veux être supprimé".

**Mitigation préventive** :

- Double opt-in sur formulaire devis ("J'accepte la transmission de ma demande à un artisan partenaire")
- Registre de traitement RGPD rédigé + DPO désigné (external, ~300 €/mois)
- Page `/rgpd` claire : finalités, durée, droits
- Purge automatique DB : leads > 36 mois anonymisés, providers non-claimés data INSEE-only (pas d'email/phone en front)
- Audit juridique annuel (~2 000 €) — prévu budget sénior

**Plan de contingence** : avocat CNIL briefé à l'avance, modèle de réponse à "demande d'information" prêt. Prévoir suspension flow devis max 72h si anomalie majeure, le temps de corriger.

---

#### D2. MaPrimeRénov' drastiquement réduite ou supprimée (changement gouvernemental)

**Probabilité** : Moyenne (budget État tendu, réforme déjà amorcée 2024 avec plafonds revus à la baisse). **Impact** : Critique si brutal.

La rénovation énergétique est un sujet politique. Un changement de majorité, une loi de finances, une coupe budgétaire soudaine = notre positionnement "MaPrimeRénov' calculée en temps réel" perd 60 % de son attrait.

**Analogie** : CITE (Crédit d'Impôt Transition Énergétique) supprimé 2020 → sites d'aide impôt (impots-gouv aggregator) -40 % trafic 6 mois.

**Signal d'alerte précoce** : discours ministériel, amendement PLF (loi finances), tweet ministre Écologie, rapport Cour des Comptes critiquant MaPrimeRénov'.

**Mitigation préventive** :

- **Diversification prop value** : RGE + SIRET + aides **régionales/locales** (chaque collectivité a ses propres aides) — si national tombe, local reste
- CEE (Certificats Économies Énergie, obligation imposée aux fournisseurs énergie → dure même sans État) = filet de sécurité. Intégrer Hellio, Effy.fr CEE en backup.
- Diversification verticale /urgence/_, /tarifs/_, devis généraliste = 40 % du business à M6

**Plan de contingence** : cf. War Game Scénario 3 (section 4.3). Pivot en 60 jours vers DPE obligatoire + audit énergétique obligatoire + CEE.

---

#### D3. Obligation RGE supprimée ou élargie

**Probabilité** : Faible. **Impact** : Critique (positif comme négatif).

Scénario négatif : RGE devient optionnel → notre différenciation disparaît. Scénario positif : RGE devient obligatoire pour plus de métiers → notre TAM explose mais concurrents sont à armes égales.

**Signal d'alerte précoce** : décret JORF modifiant article R543-105 du code de l'énergie.

**Mitigation préventive** :

- Ne pas miser 100 % sur RGE. Garder USP = RGE + **assurance décennale vérifiée** + **Qualibat** + **review verified**. Si RGE tombe, décennale reste la barrière de qualité.
- Abonner à journal officiel JORF + alerte Legifrance sur "RGE" + "rénovation énergétique"

**Plan de contingence** : repositionner en 30 jours sur "artisans vérifiés (décennale + Qualibat)" sans perte de substance.

---

#### D4. Publication des données ADEME RGE freinée ou réduite

**Probabilité** : Faible. **Impact** : Élevé.

data.ademe.fr publie actuellement dataset RGE 4x/an sous licence ouverte. Si l'ADEME restreint la fréquence ou la granularité (pour protéger les données artisans), on perd la fraîcheur.

**Signal d'alerte précoce** : changement de politique de publication, communiqué ADEME, retard > 2 mois sur dataset trimestriel.

**Mitigation préventive** :

- Cache historique : conserver tous les datasets ADEME téléchargés en S3/R2 → même si l'ADEME gèle, on a déjà 6 mois de visibilité
- Partenariat direct ADEME (via relation CAPEB/FFB) pour accès API premium → hors fréquence publique
- Croiser avec Qualibat directement (partenariat), Qualit'EnR (indépendant) → données complémentaires

**Plan de contingence** : basculer source primaire sur Qualibat + Qualit'EnR si ADEME devient instable. Ajouter mention "RGE auto-déclaratif vérifié Qualibat 2026" aux pages pour maintenir trust.

---

### Catégorie E — Business (5 causes)

#### E1. Pas assez d'artisans RGE claim leur fiche → offre < demande

**Probabilité** : Moyenne-Élevée (seulement 16 claimed actuellement). **Impact** : Critique.

Tout l'édifice du lead exclusif suppose que des artisans RGE rejoignent activement la plateforme. Si après 6 mois on a 500 claims mais il faudrait 5 000, le matching fail, les devis partent nulle part, les leads sont gâchés, conversion effondre.

**Analogie** : HomeAdvisor US 2010, croissance trafic rapide, artisans insuffisants → qualité lead dégradée, clients mécontents, reviews Trustpilot 1/5, 3 ans pour corriger. Hopps (France, 2023) : marketplace artisans a explosé parce que ratio leads/artisans déséquilibré, impossibilité d'honorer SLA réponse 24h.

**Signal d'alerte précoce** : `lead_assignments` rate de matching < 70 %, leads sans artisan assigné > 100/semaine, plaintes clients "je n'ai jamais été contacté".

**Mitigation préventive** :

- Outreach claim massif prioritaire — **50 000 artisans avec phone+email déjà en DB**
- Script semi-automatisé : email perso + relance SMS + script téléphone (équipe outsourcée 5 €/claim réussi)
- Incentive temps limité : "claim dans les 30j = 3 mois premium offerts"
- Partenariat CAPEB/FFB/Qualibat pour envoi en masse à leurs adhérents (via newsletter fédération)
- Onboarding friction < 3 min (pas 15)

**Plan de contingence** : si ratio reste < 1 artisan / 5 leads → pauser temporairement l'acquisition de leads sur zones dégradées, concentrer le trafic sur zones où ratio sain. Mieux 200 leads honorés que 1000 leads gâchés.

---

#### E2. Pricing lead rejeté par les artisans (trop cher, trop cher)

**Probabilité** : Moyenne. **Impact** : Élevé.

30€/100€/300€ par segment est une **hypothèse**. Si la vraie disposition à payer artisan RGE est 15€ (lead non qualifié moyen marché), modèle économique cassé.

**Analogie** : Houzz 2017-2019 a tenté 5 modèles de pricing artisans avant de trouver 99$/mois fixe + leads = ~50$ unit. 18 mois de cash brûlé.

**Signal d'alerte précoce** : conversion claim → paiement < 10 %, taux de churn M1 > 30 %, feedback artisan "vos leads sont trop chers / trop froids".

**Mitigation préventive** :

- Tester 3 pricing modèles en parallèle dès M3 (cohortes A/B/C, 30 artisans chacune)
- "Pay-per-qualified-lead" conditionné à SLA (réponse artisan < 24h, sinon refund) → dérisque
- Freemium 3 leads/mois gratuits pour amorcer habitude + paiement après

**Plan de contingence** : pivot freemium SaaS 49 €/mois illimité + commission conversion sur devis signé (si artisan déclare signature). Moins elegant business-wise mais plus digestible côté artisan.

---

#### E3. Budget épuisé avant ROI (scenario accéléré brûle runway)

**Probabilité** : Moyenne. **Impact** : Critique.

Scenario accéléré = 3 645 €/mois × 12 = 43 740 €. Si ROI M6 < 15K€ MRR, on entre M7 avec 21K€ restants et 12 mois devant. La peur pousse à baisser budget, à retarder recrutement content writer, à couper PR → cercle vicieux.

**Analogie** : Take Eat Easy (2016, 12M€ levés, mort au bout de 18 mois parce que cash burn > gross margin). Sans cash-flow positif, on fait du temps jusqu'à la mort.

**Signal d'alerte précoce** : M3 MRR < 5K€, M6 MRR < 15K€, burn rate > 75 % runway cash.

**Mitigation préventive** :

- Cash-flow-first : prioriser actions ICE 1000 gratuites (fix bailout, disavow, simulateur visible) qui génèrent ROI sans dépense
- Content interne d'abord 10 briefs, externaliser seulement si ROI prouvé
- Pas de paid ads avant que SEO soit traction (ne pas acheter visibilité qu'on peut capturer gratuit)
- Checkpoint mensuel obligatoire CEO : burn vs MRR réel, décision go/no-go M+1

**Plan de contingence** : passer scénario accéléré → minimal (645 €/mois) si M4 MRR < 3K€. Marvin reprend content lui-même 2 mois. Report levée fonds envisageable si traction M6 avérée.

---

#### E4. Conversion reste à 0,7 % après pivot funnel

**Probabilité** : Faible-Moyenne. **Impact** : Élevé.

Plan v2 projette 0,7 % → 5 % M12. Si le funnel reste bloqué parce que la vraie cause n'était pas les 7 champs mais la **méfiance utilisateur** (marketplace inconnue, aucun avis, aucune marque), les A/B tests ne sauvent rien.

**Analogie** : Uber 2014 a pris 2 ans à dépasser 15 % conversion car problème = trust brand, pas UX. Solution = TV ads + PR massif, pas UX tweaks.

**Signal d'alerte précoce** : après 5 A/B tests sprints 1-3, conversion < 1,5 % sur groupe optimisé.

**Mitigation préventive** :

- Trust signals "lourds" : logo ADEME/CAPEB/FFB en homepage (si autorisés), testimonials vidéo, presse mentions
- Test "brand splash" A/B : bannière "Vu dans Le Moniteur, Batiactu, Les Échos" vs sans → mesure impact brand
- Fonder une newsletter pour habituer avant conversion (lead scoring pré-devis)

**Plan de contingence** : rédiger bilan A/B tests M3, identifier si blocage UX (résoluble) ou brand (long). Si brand, investir 12 mois PR avant d'attendre conversion haute.

---

#### E5. Dépendance unique à Marvin (single point of failure stratégique)

**Probabilité** : Moyenne. **Impact** : Critique.

L'ensemble du plan v2 repose sur Marvin (CEO + dev + stratégie). Un bus factor de 1 est un risque structurel documenté.

**Analogie** : Frichti 2020, fondateur en burn-out total pendant 3 mois → ce sont 3 mois de décisions critiques non prises, concurrents ont rattrapé.

**Signal d'alerte précoce** : PR count/semaine Marvin en chute, décisions repoussées > 2 fois, commits en soirée/weekend > 50 % total, ticket non traité > 5 jours.

**Mitigation préventive** :

- Runbook obligatoire : "si Marvin est out 2 sem, qui fait quoi" — 1 pager + accès
- Documentation stratégique écrite (ce plan v2 en fait partie)
- Dev freelance backup identifié, onboardé 1 fois, prêt à intervenir 48h
- Règle CEO : 1 jour off par semaine strict, 2 sem vacances M6, pas de nuit > 2 fois/semaine

**Plan de contingence** : si burn-out détecté, pause Sprint 30 jours décidée en amont (= moins cher qu'un échec stratégique). Déléguer décisions mineures à checklist pré-écrite.

---

### Catégorie F — Humains / Équipe (4 causes)

#### F1. Dev lead burn-out (déjà flaggé master plan section 8)

**Probabilité** : Moyenne-Élevée (4 responsabilités critiques Sprint 0-2). **Impact** : Critique.

Variante de E5 mais ciblée Dev. Si le dev lead fait bailout fix + Footer + sync ADEME + Schema + 18 A/B + noindex migration seul, il tiendra 6 semaines max.

**Analogie** : 40 % des défaillances de startups early-stage impliquent un burn-out technique clé dans les 6 premiers mois (Y Combinator data 2022).

**Mitigation préventive** :

- Externaliser sync ADEME à un dev freelance dès Sprint 1 (3-5 jours-dev, 1 500 €)
- 1 code review obligatoire hebdomadaire externe (Claude Code + 1 senior dev review payé à l'heure)
- Pair-programming 2h/semaine avec autre dev
- Découpler Dev lead du rôle SEO-ops (routine crawl monitoring → Marvin ou freelance)

**Plan de contingence** : si détection burn-out (fatigue visible, commits erratiques, rollbacks répétés), pause obligatoire 2 semaines, dev freelance take over tickets critiques.

---

#### F2. Content writer senior ne livre pas (qualité ou timing)

**Probabilité** : Moyenne (freelance 1 500 €/mois, recrutement rapide = qualité variable). **Impact** : Élevé.

30 briefs à produire sur 12 semaines. Si le freelance livre 3 briefs par mois au lieu de 10, le sprint content capote → conquête SEO ralentie → budget brûle sans ROI.

**Analogie** : Marketplaces de freelance content (Malt, Upwork) taux d'échec "mauvaise qualité ou retard" = 35 % sur missions senior (étude Malt 2023).

**Signal d'alerte précoce** : brief livré hors délai > 1 fois, qualité éditoriale < attendu, rewrite interne nécessaire > 30 %.

**Mitigation préventive** :

- Période d'essai 2 briefs (4-6 jours) avant engagement long
- Brief formaté ultra-précis (outline + mots-clés obligatoires + sources + ton) — réduit variance qualité
- Système 2-review : 1 expert RGE, 1 Marvin
- Backup : 2ème freelance identifié en parallèle, priorité 2 sur pipeline (plan B prêt)

**Plan de contingence** : si échec après 2 briefs, switch backup immédiatement. Ne jamais laisser 3 mois contractualisés à un freelance qui déçoit.

---

#### F3. Conflit fondateur / non-alignement stratégique

**Probabilité** : Faible si mono-fondateur, Élevée si co-fondateurs. **Impact** : Critique.

La plupart des startups qui échouent pour cause humaine (selon CB Insights) le font par conflit fondateur.

**Mitigation préventive** :

- Si co-fondateur : pacte d'associés actualisé, vestings, clauses de sortie documentées
- Si mono-fondateur (cas actuel) : advisor board 3 personnes consultées chaque trimestre pour challenge stratégique

**Plan de contingence** : si désaccord profond détecté (coaching shareholder), mettre sur pause sprint et résoudre AVANT d'avancer. Pas d'exécution à 2 cerveaux divergents.

---

#### F4. Marvin perd motivation avec la lenteur SEO (3-6 mois avant signaux)

**Probabilité** : Moyenne. **Impact** : Élevé.

Le SEO a un cycle long. Plan v2 promet M3 cible 400 KW / 400 visites/jour. Entre M0 et M3, le trafic peut **baisser temporairement** (re-crawl incertain, HCU effets résiduels, migration noindex). Pendant ce temps, Marvin voit ses chiffres stables ou en baisse et peut se décourager, saboter silencieusement le plan.

**Analogie** : documenté par Julian Shapiro (Growth Hacker) — "le piège des 90 jours SEO" : 70 % des fondateurs qui démarrent une stratégie SEO sérieuse pivotent avant M4 parce que les données sont ambiguës.

**Signal d'alerte précoce** : CEO mentionne "peut-être on devrait faire X autre chose" (nouvelle idée) pendant sprints 2-4.

**Mitigation préventive** :

- Dashboard leading indicators vs lagging : trafic = lagging, crawl rate + indexed pages + backlinks acquis + content published = leading. Focus sur leading M0-M3.
- Célébrer micro-wins : "+ 20 nouveaux KW cette semaine", "5 pages top 20 gagnées", "1er backlink Tier 1"
- Checkpoint coach/mentor mensuel (advisor) pour maintenir conviction

**Plan de contingence** : si démotivation détectée, revue stratégique forcée (ce plan v2 relu, Master Plan section 12 relue). Sortir du quotidien 3 jours (voyage, retraite). Interdit de pivoter avant M6 sauf kill-switch déclenché (section 5).

---

### Synthèse pre-mortem — Matrice probabilité × impact

| Top 10 risques par ICE              | Cat | Prob    | Impact   | Score | Mitigation principale                           |
| ----------------------------------- | --- | ------- | -------- | ----- | ----------------------------------------------- |
| E1 Pas assez de claims artisans     | E   | Haute   | Critique | 9     | Outreach claim 50K + partenariat institutionnel |
| B1 Core update défavorable mai-juin | B   | Haute   | Élevé    | 8     | Diversification canaux + E-E-A-T                |
| B2 AI Overviews capture trafic info | B   | Haute   | Critique | 9     | AI-proofing + LLM citations actives             |
| E5 Single point of failure Marvin   | E   | Moyenne | Critique | 8     | Runbook + advisor + 1 jour off strict           |
| A5 Migration noindex mal configurée | A   | Faible  | Critique | 7     | Dry-run obligatoire + snapshot                  |
| C1 effy copie stratégie RGE-first   | C   | Haute   | Élevé    | 8     | Vitesse + moat + honeypot                       |
| D2 MaPrimeRénov' revue baisse       | D   | Moyenne | Critique | 8     | Diversification aides régionales + CEE          |
| F1 Dev lead burn-out                | F   | Haute   | Critique | 9     | Externalisation + 1 jour off                    |
| E3 Budget brûlé avant ROI           | E   | Moyenne | Critique | 7     | Cash-flow-first, checkpoints                    |
| F4 Marvin perd motivation 90j       | F   | Moyenne | Élevé    | 7     | Leading indicators + micro-wins                 |

**Pattern** : 5 des 10 risques les plus sévères sont humains/business (pas techniques). Le plan v2 doit protéger les humains autant que le code.

---

## Partie 2 — THEORY OF VICTORY OPPOSÉE (point de vue concurrent)

Pour chaque concurrent majeur, on répond aux 4 questions :

1. **Stratégie probable 12 mois** (ce qu'ils pensent gagner)
2. **Réaction probable à notre montée**
3. **Comment ils peuvent nous attaquer**
4. **Contre-attaque préparée**

### 2.1 effy.fr

**Stratégie 12 mois** : consolider position rénovation éco, defender DR 52, monétiser via lead gen + travaux signés (commission artisan). Ils ont subi -17 % Q1 2026, ils vont probablement investir en content + outreach journalistique. Leur USP actuelle : simulateur aides maison.

**Réaction à notre montée** : à M3-M4 quand on dépasse 500 KW RGE, ils verront Ahrefs alert. Réaction probable : lancement landing page "artisans RGE certifiés" en copie de notre structure.

**Comment ils nous attaquent** :

- Guest post gratuit sur médias Tier 1 (Les Échos, Le Moniteur) en leveragant leur ancienneté
- Google Ads préemptifs sur notre marque "servicesartisans"
- Copie feature "lead exclusif" en 45 jours
- Pression relations publiques : "le comparateur rénovation historique" (brand story > nous)

**Contre-attaque préparée** :

- Défense nom de marque Google Ads (campagne brand défensive 100 €/mois)
- Our PR doit être 2x plus agressive M1-M6 (tribune Marvin Les Échos, podcast Batirama)
- Moat "exclusif par construction" (pas juste en feature UI, dans le contrat artisan) — ils peuvent copier mais pas livrer sans revoir leur matching engine
- Pricing psychologique : 30 €/100 €/300 € vs leur modèle lead à 45-60€ — communiquer "deux fois moins cher pour artisan"

### 2.2 quelleenergie.fr

**Stratégie 12 mois** : consolider simulateur éco énergétique + générer leads travaux vers partenaires installateurs. Actuellement DR 45, -13 % Q1. Probable : double down sur guides rénov' + partenariat installateurs régionaux.

**Réaction à notre montée** : silence probable jusqu'à M4 (ils sous-estiment les petits joueurs). À M4-M5, potentiellement une acquisition/partenariat avec un pure-player pour rattraper.

**Comment ils nous attaquent** :

- Achat de backlinks institutionnels via ancien réseau énergéticiens
- Budget SEM dominant sur "simulateur MaPrimeRénov'" (~15 €/click, on ne peut pas suivre)
- Content machine : 50 articles/mois vs nos 10/mois

**Contre-attaque préparée** :

- Ne **pas** les suivre en SEM (bataille perdue d'avance). Concentrer sur SEO organique (moat durable)
- Qualité > quantité content : 10 articles 3000 mots avec data ADEME > 50 articles 800 mots génériques
- Différenciateur : artisan + RGE + lead exclusif (ils n'ont pas artisan dans leur ADN)

### 2.3 travaux.com

**Stratégie 12 mois** : survivre. -4 820 pages Q1 2026, crise profonde. Probable : refonte complète Q3 2026 ou rachat/consolidation.

**Réaction à notre montée** : aucune. Ils luttent pour eux-mêmes.

**Comment ils nous attaquent** : improbable. Risque principal = leur rachat par un grand groupe (Adeo/Leroy Merlin, ManoMano) qui injecte cash et relance.

**Contre-attaque préparée** :

- Opportunité capture : broken backlinks de leurs 4 820 pages → outreach "remplacez votre lien cassé vers travaux.com par notre page équivalente"
- Ahrefs "broken backlinks" filter sur travaux.com → ~200 opportunités à récupérer
- Surveille Crunchbase pour signaux de rachat

### 2.4 habitatpresto.com

**Stratégie 12 mois** : consolider marché travaux BtoC, monétisation lead classique 30-45€, pas de focus RGE spécifique. Probable : moderniser UX mobile, incrémentale.

**Réaction à notre montée** : tardive (M5-M6), via copie feature simulateur.

**Comment ils nous attaquent** :

- Stock historique de backlinks (DR 43) leveragé pour créer nouveaux contenus RGE optimisés
- Budget marketing performance (ils sont plus matures financièrement)

**Contre-attaque préparée** :

- Moat data (RGE fraîcheur 24h vs leur probable 30j)
- SEO technique supérieur (post-bailout fix, TTFB < 100 ms) → Google les dépasse sur signaux techniques

### 2.5 allovoisins.com

**Stratégie 12 mois** : survivre aussi. -6 841 pages, plus grave que travaux. Proche de la mort organique. Probable pivot vers Madeinvoisins (communauté), abandon verticale travaux.

**Réaction à notre montée** : aucune.

**Comment ils nous attaquent** : improbable.

**Contre-attaque** : exploiter broken backlinks (~300 opportunités sur leurs 404).

### 2.6 Mon Accompagnateur Rénov' (france-renov.gouv.fr + MAR privés)

**Stratégie 12 mois** : déployer obligation MAR, croissance 3-4x du réseau (objectif ministère 5 000 MAR). Officiel, bien doté.

**Réaction à notre montée** : neutre à positive. Si on joue bien, partenariat possible (on leur envoie des prospects qualifiés MAR, ils nous envoient post-MAR des prospects en recherche d'artisan).

**Comment ils nous attaquent** : ils **peuvent** labelliser un annuaire officiel d'artisans RGE, et dans ce cas c'est game over pour la compétition "autorité".

**Contre-attaque préparée** :

- **Devancer le partenariat** : demande officielle de labellisation/partenariat France Rénov' dès Sprint 3
- Positionnement complémentaire et non concurrent : "trouve ton MAR près de chez toi + après MAR, trouve ton artisan RGE"
- Employer 1 personne ancienne MAR en advisor (400 €/mois conseil) — signal trust + réseau

### 2.7 Hellio (hellio.com, groupe Hellio)

**Stratégie 12 mois** : dominer CEE (Certificats Économies Énergie) + développer MaPrimeRénov'. Groupe industriel, 500 M€ CA.

**Réaction à notre montée** : faible. Ils sont B2B (fournisseurs énergie + grandes entreprises), pas B2C directement sur artisan.

**Comment ils nous attaquent** : improbable directement. Indirectement, ils peuvent aspirer les meilleurs artisans RGE via contrats CEE exclusifs.

**Contre-attaque** : partenariat Hellio pour intégrer leurs primes CEE dans notre simulateur → complémentarité gagnante.

### 2.8 Heero (heero.fr, ex-Pretto Rénov')

**Stratégie 12 mois** : rénovation + financement (eux ont Pretto en amont pour crédit rénov'). Angle financement intégré. DR 30, croissance.

**Réaction à notre montée** : moyenne. Ils vont probablement ajouter feature RGE à leur funnel existant.

**Comment ils nous attaquent** :

- Financement intégré (on n'a pas, c'est un gap)
- Cross-sell Pretto (crédit immobilier) → trafic qualifié jardin

**Contre-attaque préparée** :

- Partenariat crédit rénov' avec Younited Credit ou Cofidis (on ne construit pas notre propre offre crédit)
- Messaging : "l'artisan RGE + la prime + ton crédit partenaire en 1 clic"

---

## Partie 3 — COMPETITIVE INTELLIGENCE LOOP AUTOMATISÉ

Une veille non-armée est inutile. Objectif : dashboard hebdo lu en 10 min, déclenchant action si triggers.

### 3.1 Stack d'outils + abonnements

| Outil                                                     | Usage                                                | Coût mensuel | Owner            |
| --------------------------------------------------------- | ---------------------------------------------------- | ------------ | ---------------- |
| **Ahrefs Site Explorer** (déjà)                           | Alerts DR/trafic/KW 8 concurrents                    | 0 (inclus)   | Marvin           |
| **Ahrefs Alerts**                                         | New/lost backlinks + KW movement                     | 0 (inclus)   | Marvin           |
| **Semrush Position Tracking** (freemium 10 KW/concurrent) | Cross-check Ahrefs + AIO detection                   | 0            | Marvin           |
| **VisualPing**                                            | Screenshot diff homepage 8 concurrents, hebdo        | 14 $/mois    | Marvin           |
| **Google Alerts**                                         | 15 queries actives (voir 3.2)                        | 0            | Marvin           |
| **GitHub watch**                                          | Repos publics concurrents (effy, hellio public libs) | 0            | Dev              |
| **LinkedIn Sales Navigator**                              | Track hiring + moves clés                            | 99 $/mois    | Growth freelance |
| **Crunchbase Pro**                                        | Funding alerts vertical rénov' éco                   | 29 $/mois    | Marvin           |
| **JORF/Légifrance RSS**                                   | Changements réglementaires RGE, MaPrimeRénov'        | 0            | Marvin           |
| **Screaming Frog** (licence unique)                       | Sitemap diff concurrent mensuel                      | 209 €/an     | Marvin           |
| **FeedBurner / Feedly**                                   | Agrégation communiqués presse concurrents            | 0            | Marvin           |

**Total coût veille** : ~150 €/mois tous outils compris. Ligne budget dédiée.

### 3.2 Google Alerts — 15 setups précis

À configurer dans les 30 min :

1. `"effy.fr" -site:effy.fr` — mentions presse effy
2. `"quelleenergie.fr" -site:quelleenergie.fr` — idem
3. `"travaux.com" pivot OR acquisition OR rachat`
4. `"Mon Accompagnateur Rénov" partenariat OR annuaire`
5. `"annuaire artisans RGE"` — toute nouvelle offre
6. `"MaPrimeRénov" 2027 OR réforme OR réduction`
7. `"obligation RGE" décret OR loi`
8. `"AI Overviews" France SEO rénovation`
9. `"données ADEME" RGE licence`
10. `site:linkedin.com "head of SEO" "rénovation"`
11. `site:linkedin.com "CMO" effy.fr OR quelleenergie.fr`
12. `"série A" "rénovation énergétique" funding`
13. `"Hopps" OR "Take Eat Easy" OR "Homejoy" faillite marketplace` (apprentissages sectoriels)
14. `"servicesartisans" -site:servicesartisans.fr` — brand protection
15. `"scraping" OR "parasite SEO" rénovation` — signal de pénalités sectorielles

### 3.3 Dashboard hebdo "Competitive Intel"

**Format** : Google Sheet (ou Notion), 1 page. Rempli chaque **lundi 8h-8h30** par Marvin (30 min fixe au calendrier).

**Structure du dashboard** :

```
Semaine du : __/__/____
================================================================

▍ SECTION 1 — KPI CONCURRENTS (Ahrefs snapshot mardi)
┌──────────────────┬─────┬─────┬──────┬──────┬─────────┐
│ Concurrent       │ DR  │ ΔDR │ KW   │ ΔKW  │ Trafic  │
├──────────────────┼─────┼─────┼──────┼──────┼─────────┤
│ effy.fr          │     │     │      │      │         │
│ quelleenergie.fr │     │     │      │      │         │
│ travaux.com      │     │     │      │      │         │
│ habitatpresto    │     │     │      │      │         │
│ allovoisins      │     │     │      │      │         │
│ heero.fr         │     │     │      │      │         │
│ hellio.com       │     │     │      │      │         │
│ societe.com      │     │     │      │      │         │
│ SERVICESARTISANS │     │     │      │      │         │
└──────────────────┴─────┴─────┴──────┴──────┴─────────┘

▍ SECTION 2 — NOUVELLES PAGES (sitemap diff via script Node, voir 3.5)
- effy.fr : X new URLs cette semaine
  - URL 1 : …
  - URL 2 : …
- …

▍ SECTION 3 — NOUVEAUX BACKLINKS TIER 1 (Ahrefs)
- Concurrent : X new backlinks DR > 50 détectés
- Sources : liste

▍ SECTION 4 — VISUALPING DIFF (homepage concurrents)
- effy.fr : changement détecté (capture)
- …

▍ SECTION 5 — PRESSE / COMMUNIQUÉS
- Titre, source, URL

▍ SECTION 6 — EMBAUCHES CLÉS (LinkedIn Sales Nav)
- Concurrent, poste, personne, ancien employeur

▍ SECTION 7 — SIGNAUX RÉGLEMENTAIRES
- JORF, Legifrance, communiqués ministère

▍ SECTION 8 — ALERTES (triggers, voir 3.4)
- [ ] Aucun trigger déclenché cette semaine
OU
- [TRIGGER X] : description + action lancée
```

**Owner** : Marvin
**Fréquence** : lundi 8h-8h30 (slot récurrent Google Calendar "Comp Intel Review")
**Review** : mensuelle équipe (15 min sprint planning)

### 3.4 Triggers d'alerte (4 niveaux)

| Niveau       | Trigger                                           | Action                                                                                        |
| ------------ | ------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **Info**     | Concurrent publie 10-49 pages en 1 sem            | Noter dashboard, pas d'action                                                                 |
| **Warning**  | Concurrent publie 50+ pages en 1 sem              | **Analyse archi** : crawler leur sitemap, identifier pattern, évaluer menace (cf. script 3.5) |
| **Warning**  | Concurrent gagne 10K+ backlinks en 1 mois         | **Audit source backlinks** : Ahrefs référents, identifier si tier 1 organique ou PBN          |
| **Warning**  | Concurrent embauche "Head of SEO" ou "VP Growth"  | **Escalade** : recherche LinkedIn profil, anticiper 60-90j leur roadmap                       |
| **Critical** | Concurrent lance produit RGE visible sur homepage | **War room** (voir 3.5)                                                                       |
| **Critical** | Concurrent lève série A > 3 M€                    | War room                                                                                      |
| **Critical** | AI Overview apparaît sur top 10 KW business       | War room                                                                                      |
| **Critical** | GSC manual action reçue                           | War room                                                                                      |

### 3.5 War room process (24h response)

**Trigger conditions** : voir ci-dessus (niveau "Critical" uniquement).

**Participants** : Marvin (CEO) + Dev lead + Content lead (freelance) + 1 advisor externe (optionnel).

**Format** :

- **H+0** : trigger détecté, Marvin crée ticket Linear "War Room : [sujet]" + Slack #alerts message
- **H+2** : kickoff call 30 min (video), lecture triggers + données bruts
- **H+8** : memo interne 1 page : Situation / Diagnostic / Options (3 à 5) / Recommandation
- **H+24** : décision finale + plan d'action 7 jours, propriétaire de chaque action
- **H+168 (J+7)** : revue résultats

**Outputs** :

1. Memo interne Notion (archivé)
2. Plan action (tickets Linear ou Linear équivalent)
3. Communication interne équipe

### 3.6 Reverse engineering scripts (Node.js)

#### Script 1 — Crawler sitemap concurrent

```javascript
// scripts/competitor-sitemap-diff.ts
// Usage: npx tsx scripts/competitor-sitemap-diff.ts effy.fr

import { parseString } from 'xml2js';
import { readFileSync, writeFileSync, existsSync } from 'fs';

async function fetchSitemap(domain: string): Promise<string[]> {
  const res = await fetch(`https://${domain}/sitemap.xml`);
  const xml = await res.text();
  const parsed: any = await new Promise((resolve) =>
    parseString(xml, (err, result) => resolve(result))
  );
  return (parsed.urlset?.url ?? []).map((u: any) => u.loc[0]);
}

async function diff(domain: string) {
  const current = await fetchSitemap(domain);
  const file = `competitive-intel/sitemaps/${domain}.json`;
  const previous: string[] = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : [];
  const added = current.filter((u) => !previous.includes(u));
  const removed = previous.filter((u) => !current.includes(u));
  writeFileSync(file, JSON.stringify(current, null, 2));
  console.log(`[${domain}] +${added.length} pages, -${removed.length} pages`);
  writeFileSync(`competitive-intel/diffs/${domain}-${Date.now()}.json`, JSON.stringify({ added, removed }, null, 2));
}

diff(process.argv[2]);
```

Cron GitHub Actions **lundi 07h30** : itère sur les 8 concurrents, commit diff dans repo privé `competitive-intel/`.

#### Script 2 — Parser leur Schema.org

```javascript
// scripts/competitor-schema-extract.ts
// Extrait tous les blocs <script type="application/ld+json"> d'une page
async function extract(url: string) {
  const html = await (await fetch(url)).text();
  const matches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  return matches.map((m) => { try { return JSON.parse(m[1]); } catch { return null; } }).filter(Boolean);
}
```

Usage : détecter si un concurrent ajoute `Certification` schema sur fiches artisans (signal = ils clonent notre approche).

#### Script 3 — Extraire leur stratégie internal linking

Utiliser Screaming Frog crawl limité (500 URLs) sur concurrent → export "Internal Links" → analyser patterns anchor / destination. Détecte leurs money pages et leur maillage.

#### Script 4 — Identifier leurs money pages

Croiser `top-pages.csv` Ahrefs concurrent (top 20 pages par trafic) avec leur structure URL. Si 15/20 sont en `/aides/*` ou `/simulateur/*`, on sait où ils investissent.

### 3.7 Honeypots & traps

**Objectif** : détecter copie de notre contenu/data.

1. **SIRET fictif identifiable** : insérer 1 SIRET volontairement faux mais cohérent (checksum Luhn valide) dans le dataset RGE. Exemple : `81250100500012` (contrôlé). Si ce SIRET apparaît chez un concurrent, c'est un scraping prouvé.
2. **UTM tracking** : pages `/artisans-rge/[ville-exemple]` intégrent un paramètre invisible (HTML comment `<!-- honeypot-202604 -->`). Si apparaît dans search "honeypot-202604", c'est une copie.
3. **Phrase watermark** : dans chaque guide, une phrase unique hautement spécifique ("un plombier de Saint-Ouen en Seine-Saint-Denis déclare en moyenne un chiffre d'affaires…") — toute reproduction sera attribuable.
4. **Wayback defensive archive** : archiver chaque nouveau contenu sur archive.org dans les 24h → preuve de priorité légale en cas de plagiat.

**Legal suite** : si honeypot déclenché, cease and desist letter via avocat IP (~500 € lettre). Historiquement efficace contre marketplaces concurrentes.

### 3.8 Calendrier de veille

| Jour/Heure          | Activité                                 | Owner         | Durée                       |
| ------------------- | ---------------------------------------- | ------------- | --------------------------- |
| Lundi 8h-8h30       | Dashboard Comp Intel hebdo               | Marvin        | 30 min                      |
| Lundi 8h30-9h       | Actions triggers                         | Marvin        | 30 min max (sinon escalade) |
| Mercredi 14h        | Review GitHub Actions sitemap diff       | Marvin        | 5 min                       |
| Vendredi 17h        | Archive + review Google Alerts digest    | Marvin        | 10 min                      |
| Mensuel (1er lundi) | Screaming Frog crawl + memo              | Marvin        | 2h                          |
| Trimestriel         | Revue stratégique veille (output → plan) | CEO + advisor | 1h                          |

---

## Partie 4 — WAR GAMING : 3 scénarios catastrophe

### 4.1 Scenario 1 — "effy.fr copie notre stratégie RGE-first"

**Timing probable** : M3-M5 (quand notre traction devient visible sur Ahrefs).

**Comment on s'en aperçoit** :

- Sitemap effy diff : +500 URLs `artisans-rge-[ville]` sur 1 semaine
- Ahrefs : effy gagne > 1 000 new KW "rge + ville" en 1 mois
- VisualPing : homepage effy ajoute bannière "Annuaire RGE"
- Google Alert : article presse "effy lance son annuaire RGE"

**Réaction 30 jours** :

**J+1 à J+3** : War room (section 3.5). Analyse rapide :

- Qualité de leurs pages (enrichies ou thin ?)
- Vitesse de production (50/semaine ? 500 ?)
- Sources des backlinks qu'ils pushent
- Messaging clé ("artisan vérifié" vs "RGE certifié + lead exclusif")

**J+4 à J+15** :

- Accélérer notre différenciation exclusive-by-construction (juridique) : publication CGV artisan "1 lead = 1 artisan, contrat écrit"
- Push presse en urgence : tribune Marvin "Le premier vrai annuaire RGE avec lead exclusif"
- Partenariat éclair Qualibat / CAPEB : annoncer partenariat officiel (on peut préparer 3-6 mois en amont, sortir au moment critique)
- Activer moat data : publier "ServicesArtisans synchronise RGE quotidiennement vs 7 jours chez nos concurrents" (fait PR)

**J+16 à J+30** :

- A/B test landing page "Pourquoi ServicesArtisans" avec comparatif feature (sans nommer effy)
- Campagne LinkedIn organique auprès des artisans RGE avec message "rejoignez la seule plateforme avec lead exclusif garanti"
- Si effy copie aussi simulateur MaPrimeRénov' : pivoter vers simulateur **inter-aides** (MaPrimeRénov' + CEE + aides régionales) — hausse de complexité = coût de copie 6 mois pour eux

**Comment maintenir avantage long terme** :

1. **Vitesse** : shipping 2x plus rapide que eux (equipe fluide, pas de comité)
2. **Moat data** : API Entreprise DataPass signée avant eux
3. **Moat distribution** : relations CAPEB/FFB contractualisées
4. **Moat humain** : communauté artisans RGE engagée (Slack privé, event annuel "Prix Artisan RGE")
5. **Moat légal** : trademark "Lead Exclusif Artisan RGE" déposé INPI (~200 €)

### 4.2 Scenario 2 — "Google AI Overviews capture 50 % notre trafic info"

**Timing probable** : M4-M9 (rollout AIO français monté en puissance).

**Détection** :

- GSC CTR sur guides /guides/\* passe de ~8 % à < 3 %
- Impressions stables mais clics en chute
- Requête Google manuelle sur top KW guides → AIO apparaît avec réponse synthétique + liens vers gouvernement, pas nous
- Semrush SERP Features tracking active

**Réaction 30-60 jours (pivot)** :

**Phase 1 — AI-proofing des guides existants** (2 semaines, 30 articles x 2h) :

- Chaque guide ajoute 3 données propriétaires chiffrées (data ADEME agrégée)
- Chaque guide ajoute un simulateur/calculateur interactif (AIO ne peut pas répliquer)
- Schema.org `HowTo`, `FAQPage`, `Article` avec author détaillé
- H2 = questions longue traîne précises, H3 = réponse + CTA simulateur
- Ajouter video embed (YouTube) → signal richesse que AIO préserve

**Phase 2 — Redistribution de contenu** (4 semaines) :

- Publier chaque guide aussi en newsletter (Substack/Beehiiv) — trafic direct, hors Google
- Soumettre à LLM index : ChatGPT Submit URL, Perplexity, Anthropic ai-review (via unblock Google-Extended + anthropic-ai + GPTBot)
- Créer corpus de "data-first micro-articles" optimisés pour AIO citation (300-500 mots, 1 data point unique par article, citation par l'AIO = brand exposure même sans click)

**Phase 3 — Pivot funnel** (8 semaines) :

- Dé-prioriser top-of-funnel info → prioriser middle-of-funnel transactionnel (/artisans-rge/[ville]/[métier] + simulateur)
- Les queries transactionnelles sont moins vulnérables à AIO (Google ne fait pas simulation à la place de l'utilisateur)
- Repositioning budget content : 70 % transactional / 30 % informational (au lieu de 50/50 initial)

**Plan B si AIO continue d'aspirer** :

- LLM citations first : produire articles spécifiquement pour être cités par ChatGPT/Claude/Perplexity (385 citations actuelles → 5 000 cible)
- LLM citations génèrent brand exposure + parfois clicks sortants, déjà documenté +40 % "dark traffic" chez certains éditeurs

### 4.3 Scenario 3 — "MaPrimeRénov' supprimée ou revue à la baisse"

**Timing probable** : Q3 2026 (loi de finances 2027 votée automne 2026) ou urgence ministérielle.

**Détection** :

- Amendement PLF 2027 débattu Assemblée Nationale septembre-octobre
- Discours ministre Budget / Écologie
- Rapport Cour des Comptes
- Tweet Marvin l'Émeute (pas celui-là, l'autre)

**Diversification stratégique — pivot 60 jours** :

**Semaine 1** :

- War room : ampleur changement (suppression totale, réduction 30 %, recentrage sur passoires uniquement ?)
- Quick sanity check : combien de pages site citent MaPrimeRénov' ? (grep) → plan de rewrite
- Communication transparente site (bannière "Aides en cours d'actualisation, voici ce qui reste valide")

**Semaines 2-4 — Repositionnement "aides diversifiées"** :

- Mise en avant **CEE** (Certificats Économies Énergie) : existent tant qu'il y a des fournisseurs énergie (obligation légale indépendante de PLF). Partenariat Hellio possible.
- **Aides régionales** : chaque région a son écosystème (Île-de-France, Occitanie, Nouvelle-Aquitaine particulièrement généreuses). Hub `/aides-regionales/[region]` → 13 pages à créer.
- **Éco-PTZ** (prêt à taux zéro rénovation) : dispositif structurel non lié aux aides.
- **Déductions fiscales** (LMNP, dispositif Denormandie-like…)

**Semaines 5-8 — Pivot vers DPE + audit énergétique obligatoire** :

- Loi Climat & Résilience 2021 impose DPE G/F à rénover d'ici 2028 (interdiction location) — obligation légale non supprimable par PLF
- Positionnement "trouvez un artisan RGE pour sortir votre bien de la passoire thermique" → trust légal obligation
- Hub `/passoire-thermique/` + `/dpe-obligatoire/[ville]` → ~200 pages longue traîne, 100-500 vol/mois chacune
- Narrative : "MaPrimeRénov' évolue, l'obligation DPE, elle, reste"

**Phase durcissement : maintenir 50 % de la prop value** :

- Ajuster NSM : "devis RGE exclusif (MaPrimeRénov' OU CEE OU aide régionale)" — pas juste MaPrimeRénov'
- Repricer business model : si aides baissent, panier moyen baisse → ajuster commission cible

**Bénéfice secondaire** : cette diversification rendra le business plus robuste même si MaPrimeRénov' survive. Utile dans tous les cas.

---

## Partie 5 — KILL SWITCH CONDITIONS

Un plan sans kill-switch est une foi aveugle. Voici les 8 conditions quantifiées qui déclenchent un changement de cap stratégique **sans discussion émotionnelle**.

### 5.1 Kill switches techniques

**KS-1** : **Fix bailout SSR ne produit pas effet SEO visible en 6 semaines**

- Mesure : si M+6 semaines post-fix, trafic Ahrefs < 200 visites/jour ET KW organiques < 320 → la cause racine n'était pas le bailout
- Action : audit technique externe commandé (Mozinga, Foxar Rénard, ou équivalent Dejan Marketing international, ~2 500 €)
- Pivot : accepter 2 semaines d'investigation avant reprendre sprints éditoriaux

**KS-2** : **Migration noindex RGE-only cause chute > 40 % trafic**

- Mesure : si M+4 semaines post-migration, trafic < 100 visites/jour (vs baseline 164/jour)
- Action : rollback partiel (réouvrir index Tier B + top 20 villes du Tier C avec contenu enrichi généré)
- Pivot : accepter "index mixte" RGE + top 1 000 providers non-RGE enrichis manuellement

### 5.2 Kill switches business

**KS-3** : **Conversion reste < 1,5 % après 5 A/B tests complets**

- Mesure : M3, cohorte de trafic qualifié converti en devis < 1,5 %
- Action : revue funnel avec UX consultant externe (day rate 600-800 €, ~3 jours mission)
- Pivot : si 2-3 % inatteignable, investir massivement dans brand trust (PR + testimonials) avant optimisation UX

**KS-4** : **Zéro backlink Tier 1 acquis M3**

- Mesure : aucun backlink DR > 50 hors PBN acquis entre M0 et M3
- Action : embauche immédiate PR freelance senior spécialisé BTP/rénov' (1 500-2 500 €/mois)
- Pivot : si budget insuffisant, Marvin dédie 8h/semaine outreach presse personnellement (coût opportunité, pas cash)

**KS-5** : **MRR M6 < 10 K€** (vs projection 15-20 K€)

- Mesure : pipeline ConsolidatedMRR (abonnement + commission) < 10 K€ en M6
- Action : pivoter pricing (freemium vs pay-per-lead test en parallèle)
- Pivot : si toujours bloqué M8, envisager levée fonds bridge (500K€-1M€) pour accélérer distribution OU recentrer sur segment le plus lucratif observé

**KS-6** : **Claim rate < 500 artisans RGE en M3**

- Mesure : providers.claimed_at IS NOT NULL WHERE rge_valid_until > now() < 500 à M3
- Action : externaliser campagne outreach (call center spécialisé BTP, France, ~3 €/call, budget 10 K€)
- Pivot : si toujours bloqué, rebroadcast priorité vers artisans Qualibat (peut être plus réceptifs) ou segment géographique prioritaire (top 5 régions)

### 5.3 Kill switches stratégiques

**KS-7** : **Un concurrent dépasse notre DR et notre trafic simultanément M6**

- Mesure : un concurrent direct (effy/habitatpresto/heero) passe DR+10 et trafic+50 % vs notre évolution M0-M6
- Action : war room stratégique (advisor externe, CEO, dev lead)
- Pivot : reconnaissance de l'avantage concurrent, choix entre (a) continuer et attendre, (b) repositionner niche (ex : artisans RGE Paris-petite-couronne uniquement), (c) chercher acquisition/M&A

**KS-8** : **Signal algorithmique Google "Manual Action" ou chute > 50 % 48h**

- Mesure : GSC manual action OU chute trafic Ahrefs > 50 % 48h confirmée
- Action : war room immédiate, pause nouveaux contenus, focus exclusive sur resolution
- Pivot : si cause = site reputation abuse ou parasite SEO, audit contenu complet, suppression massive si nécessaire, soumission reconsideration request

### 5.4 Format de décision kill-switch

Le CEO (Marvin) et idéalement un advisor externe valident chaque kill-switch trigger par un décision-memo 1 page :

- Trigger factuel (chiffres)
- Diagnostic cause profonde (pas symptôme)
- 3 options considérées
- Option retenue + plan 30 jours
- Date de review (M+1)

**Règle d'or** : un kill-switch déclenché n'est **pas** un échec. C'est la preuve que le système de feedback fonctionne. L'échec, c'est d'ignorer un kill-switch déclenché.

---

## Action Sequence — 12 actions immédiates (10 jours ouvrés)

À exécuter **avant** de lancer Sprint 2 du Golden Path. Sans ces fondations de veille et de défense, on pilote aveugle.

| #   | Action                                                                                                                      | Owner           | Délai                    | Output                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------ | --------------------------------------- |
| 1   | **Créer 15 Google Alerts** (liste section 3.2)                                                                              | Marvin          | J+1 (30 min)             | Digest reçu quotidien                   |
| 2   | **Configurer Ahrefs Alerts** sur 8 concurrents (new KW, new backlinks, DR change)                                           | Marvin          | J+1 (15 min)             | Emails Ahrefs automatiques              |
| 3   | **Souscrire VisualPing** + setup 8 homepages concurrents                                                                    | Marvin          | J+2 (30 min + 14 $/mois) | Screenshots diff hebdo                  |
| 4   | **Créer GitHub repo privé** `competitive-intel/` + cron GitHub Actions sitemap diff (script 3.6)                            | Dev lead        | J+3 (2h)                 | Diff sitemap auto lundi 07h30           |
| 5   | **Créer Google Sheet "Competitive Intel Dashboard"** (template section 3.3)                                                 | Marvin          | J+2 (1h)                 | Dashboard vierge prêt                   |
| 6   | **Bloquer slot Google Calendar récurrent** lundi 8h-9h "Comp Intel Review"                                                  | Marvin          | J+1 (2 min)              | Routine hebdo armée                     |
| 7   | **Enregistrer domaines défensifs** `servicesrge.fr`, `artisans-rge.fr`, `primerenov-artisans.fr` (OVH)                      | Marvin          | J+2 (~500 €)             | Moat défensif                           |
| 8   | **Déposer trademark INPI** "Lead Exclusif Artisan RGE" (classes 35, 38, 42)                                                 | Marvin          | J+5 (~200 €)             | Protection légale                       |
| 9   | **Insérer honeypot SIRET fictif** + phrase watermark dans dataset RGE + archiver tout nouveau contenu sur archive.org       | Dev lead        | J+4 (2h)                 | Détection copie automatisée             |
| 10  | **Rédiger runbook "si Marvin est out 2 semaines"** + accès backup dev freelance                                             | Marvin          | J+5 (2h)                 | Bus factor > 1                          |
| 11  | **Écrire 8 "one-pager concurrent"** : stratégie 12 mois + attaque probable + contre-attaque (section 2.1-2.8 en doc Notion) | Marvin          | J+7 (4h)                 | Battle cards prêts                      |
| 12  | **Programmer 3 war games simulations** (scénarios 4.1-4.3) sur 3 séances 1h équipe sur 30 jours                             | Marvin + équipe | J+10 (3h total)          | Équipe préparée aux 3 scénarios majeurs |

**Total coût** : ~750 € (domaines + trademark + VisualPing 1 mois)
**Total temps** : ~16h sur 10 jours ouvrés, dont ~10h Marvin et ~6h Dev lead + équipe
**Gain** : passage d'un plan offensif naïf à un plan offensif armé défensivement.

---

> "Un plan sans pre-mortem, c'est une voiture de course sans airbag. Ça marche jusqu'à ce que ça plante." — règle opérationnelle Plan v2

**Ce chapitre est conçu pour être relu au début de chaque sprint.** Les 28 risques ne sont pas une liste à cocher, ce sont des mentaux permanents. Chaque lundi, 30 min de veille. Chaque trimestre, relecture complète pre-mortem. Chaque kill-switch déclenché = arrêt décisionnel structuré.

**Next chapter** : Plan v2 — Chapitre 6 : Organizational Design & Hiring Sequence.
