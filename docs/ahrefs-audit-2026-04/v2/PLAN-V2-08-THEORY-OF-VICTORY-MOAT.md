# Plan v2 — Chapitre 8 : Theory of Victory & Defensible Moats

> **Document type** : Strategic spine — se lit en amont des 7 chapitres tactiques (SEO, content, produit, data, growth, ops, finance).
> **Horizon** : 36 mois (avec focus exécution 12 mois).
> **Destinataire** : Marvin Bissohong (CEO) + prochain board / comité exécutif.
> **Posture** : Anthropic-tier — chaque affirmation doit être actionnable, falsifiable, shippable.

---

## PARTIE 1 — THEORY OF VICTORY

### La phrase unique

**ServicesArtisans devient le leader français "annuaire artisans + rénovation énergétique" en 12 mois en devenant la seule couche d'agrégation temps réel qui unifie SIRET INSEE + qualification RGE ADEME + éligibilité MaPrimeRénov' par adresse, exposée simultanément via SEO (50 347 fiches premium + 500 pages hub), API B2B (banques, courtiers, MAR) et UX grand public (simulateur + devis exclusif), pendant que les 18 concurrents perdent 13 à 41 % de trafic sur une fenêtre helpful-content + AI Overviews qui se refermera d'ici Q4 2026.**

Cette phrase tient en une ligne parce que chaque fragment est falsifiable individuellement :

- "seule couche d'agrégation temps réel" → vérifiable par audit comparatif (aucun concurrent ne sync ADEME quotidiennement + expose par API).
- "SEO + API + UX" → trois surfaces indépendantes. Si une tombe (ex. core update), les deux autres amortissent.
- "leader en 12 mois" → mesurable par rank share of voice, nombre de citations presse, ranking Ahrefs.
- "concurrents -13 % à -41 %" → déjà constaté dans l'audit Ahrefs 2026-04. Fenêtre documentée.

Le reste du chapitre étaye ces 5 affirmations dans l'ordre : marché, asset, wedge, séquence, moat.

### Paragraphe 1 — Le marché : pourquoi gagner _maintenant_

Le marché annuaire artisans + rénovation énergétique vit une triple dislocation simultanée, et la fenêtre se referme à mesure que chacune des trois forces se stabilise.

**Dislocation 1 — Google HCU décembre 2025 + AI Overviews.** L'audit Ahrefs du 18 avril 2026 mesure un effondrement coordonné : travaux.com -4 820 pages indexées, allovoisins -6 841, depanneo -1 797, habitatpresto -35 %, pagesjaunes.fr -13 % sur la verticale artisan. L'industrie des annuaires "thin" (copie INSEE + CSS + zéro valeur ajoutée) est déclassée par le _Helpful Content Update_ parce qu'elle déclenche les signaux doorway pages (templates identiques, descriptions absentes, aucun auteur identifié). Seul survivant : societe.com (+63 %), qui est une source officielle de données publiques — exactement le positionnement que nous pouvons revendiquer sur la verticale artisan RGE.

**Dislocation 2 — MaPrimeRénov' 2026 reconfigurée.** Le barème 2026 publié au JORF a modifié les plafonds, les catégories de ménages et les gestes éligibles. La vulgarisation n'a pas suivi : les 3 premières pages SERP sur "maprimerenov 2026" sont soit officielles (france-renov.gouv.fr), soit obsolètes (pages 2025 non mises à jour chez les concurrents). Cette asymétrie d'information crée un trou éditorial temporaire — 300 à 500 K volumes/mois selon les 120 KW rénovation-énergétique mesurés — que toute équipe content qui publie _cette_ semaine peut capter avant que les concurrents républient.

**Dislocation 3 — Obligation d'audit énergétique et DPE tendus.** La loi Climat & Résilience impose l'audit énergétique pour vendre un logement classé F ou G, avec un durcissement progressif jusqu'en 2034. 4,8 millions de logements concernés. Chaque propriétaire devient un acheteur potentiel d'artisan RGE. La demande est structurellement croissante sur 10 ans — mais la fenêtre pour _prendre position_ se limite à la phase où les intentions de recherche se formalisent encore (Q2-Q4 2026), avant que les grands marketplaces type leroy-merlin ou castorama installent leurs verticales "trouvez votre artisan RGE" avec leurs budgets média.

**Pourquoi la fenêtre se ferme.** Trois forces refermantes :

1. **Core updates compoundent.** Chaque trimestre, Google resserre les critères E-E-A-T. Les concurrents qui reviennent ne seront _pas_ les annuaires thin — ils seront les acteurs qui auront rebâti en profondeur. Nous avons 2 à 3 trimestres pour installer notre propre E-E-A-T avant que l'avantage relatif s'efface.
2. **Societe.com ou un institutionnel peut pivoter.** societe.com gagne sur SIRET uniquement — mais rien ne l'empêche d'ajouter une colonne "RGE" au moment où il verra le volume. De même, france-renov.gouv.fr peut décider d'intégrer un annuaire. Notre course est de construire le moat _avant_ que l'un d'eux regarde dans notre direction.
3. **Concurrents rénov-énergétique lèvent.** Un séries A tiers (Effy, Hellio, Izi by EDF) peut injecter 20 M€ média en 6 mois. Notre seule parade est d'avoir capitalisé suffisamment de trafic organique pour être économiquement plus rentables à acquérir ou plus coûteux à dépasser.

**Analogie stratégique** : Uber en 2010-2011 a gagné parce qu'il a pris San Francisco _pendant_ que les taxis étaient régulés, _avant_ que Lyft et Sidecar installent leurs flottes, _avant_ que la presse nationale comprenne la catégorie. Même logique ici : nous avons 6 à 12 mois pour prendre la catégorie "annuaire RGE officiel" pendant que la catégorie elle-même est floue.

### Paragraphe 2 — L'asset : ce que personne ne peut répliquer rapidement

Le codebase et la base de données ServicesArtisans contiennent aujourd'hui un asset qu'aucun des 18 concurrents suivis dans l'audit Ahrefs ne peut recréer en moins de 6 mois, même avec 2 M€ de budget et une équipe de 10 ingénieurs. Cet asset n'est pas "les 970 326 providers" — chiffre brut qu'un concurrent reproduirait en 2 semaines en scrappant l'annuaire INSEE. L'asset est la **couche de jointure normalisée** entre quatre référentiels officiels, maintenue en temps réel, exposée structurée pour le SERP, le LLM et l'API.

**Les 4 référentiels joints** :

1. **INSEE / Sirene V3** — 970 326 fiches actives, avec SIRET, SIREN, NAF (`code_naf`, `libelle_naf`), forme juridique (`legal_form_code`), adresse BAN géocodée (`latitude`, `longitude`, `geography`). Couverture : 99,30 % ville, 99,70 % NAF, 99,60 % géo. Vérifié en production (migrations 380-391, colonnes `providers.*`).

2. **ADEME RGE** — 50 332 providers avec `rge_qualifications` JSONB, `rge_valid_until`, `rge_organismes`, `rge_source_url`, `rge_last_synced_at`. Les qualifications sont structurées par signe de qualité (Qualibat, RGE Chaleur, Qualit'EnR) et par domaine (isolation, PAC, solaire, fenêtres). Index GIN JSONB + index partiel `rge_valid_until > now()` + composite ville déjà en prod (migration 380).

3. **MaPrimeRénov' 2026** — barèmes versionnés (à livrer Sprint 1, table `aides_bareme` versionnée par date JORF) + règle d'éligibilité croisant revenu fiscal de référence × zone géographique (A / B1 / B2 / C) × geste × type de logement × ancienneté. L'éligibilité est calculable _par adresse_ parce que nous avons la géoloc BAN et le statut RGE du prestataire le plus proche.

4. **Registre des entreprises + sanctions** — statut `is_active`, `claimed_at`, détection radiation SIRET, vérification cohérence SIREN/forme juridique. Base pour la confiance.

**La jointure est le moat.** Chaque concurrent possède _un_ de ces référentiels. Aucun ne possède les 4 joints proprement :

- societe.com : INSEE seul, pas de RGE, pas de MaPrimeRénov'.
- pagesjaunes.fr : annuaire libre, pas de vérification INSEE systématique, pas de RGE.
- france-renov.gouv.fr : annuaire RGE officiel, mais pas de fiches enrichies ni d'UX marketplace ni de simulateur devis.
- travaux.com / allovoisins / habitatpresto : aucun référentiel officiel, pure marketplace déclarative.
- Effy / Hellio / Izi by EDF : focalisés sur leur propre filière, pas annuaire national.

**Temps de réplication estimé pour un concurrent** :

- _INSEE_ : 2 semaines (API publique).
- _RGE_ : 1 mois (API ADEME publique mais mal documentée, matching fuzzy SIRET requis parce que l'ADEME n'expose pas toujours le SIRET propre).
- _MaPrimeRénov'_ : 2-3 mois (barèmes dispersés dans plusieurs arrêtés, validation juridique requise, UI simulateur).
- _Jointure temps réel_ : 3-6 mois (infra cron + triggers + monitoring + détection drift + gestion expirations RGE).
- _Contenu + SEO + link building autour du moat_ : 12-24 mois.

**Total minimum pour un concurrent qui démarre aujourd'hui : 6 à 9 mois**, sans compter la partie SEO/autorité qui prend 12+ mois. Notre avance opérationnelle est donc de 6 à 18 mois selon la mesure. Nous devons utiliser cette avance pour installer les moats secondaires (marque, réseau, switching cost) avant qu'elle ne s'érode.

**Analogie stratégique** : Stripe n'a pas gagné parce qu'il acceptait les cartes bancaires (tout le monde le faisait). Il a gagné parce qu'il a joint proprement _toutes_ les couches (API, fraude, compliance, KYC, payout, devise, reporting) que les développeurs assemblaient manuellement depuis des années. La jointure _était_ le produit. Même logique pour ServicesArtisans : la jointure des 4 référentiels _est_ le produit — tout le reste en découle.

### Paragraphe 3 — Le wedge : la première bataille étroite gagnable

Le wedge initial, celui qui ouvre la séquence de dominos, est le suivant :

> **Devenir #1 SERP France sur le cluster "[métier RGE] + [ville top 50]" — 40 métiers × 50 villes = 2 000 pages cibles, top 3 en 6 mois, top 1 sur 30 % des 2 000 en 9 mois.**

Ce n'est _pas_ "devenir leader annuaire artisans" (trop large, 5 ans d'exécution), ni "devenir leader rénovation énergétique" (dominé par acteurs filière avec gros budgets média). C'est un sous-segment étroit, précis, ingagnable aujourd'hui par un concurrent généraliste (trop granulaire) et ingagnable par un concurrent filière (pas leur business model).

**Pourquoi cette bataille est gagnable maintenant** :

1. **Le signal différenciateur est structurellement unique.** Nous pouvons générer une page `/artisans-rge/[métier]/[ville]/` qui affiche en H1 : "N artisans [métier] RGE certifiés à [ville] + éligibles MaPrimeRénov' — mis à jour le [date de sync ADEME]". Aucun concurrent ne peut copier le "certifiés + éligibles + mis à jour" en simultané avec la même fraîcheur.
2. **Le volume cumulé est énorme mais dilué.** Chaque KW individuel fait 50 à 500 volumes/mois (ex. "couvreur RGE Lyon" = 170/mois). 2 000 pages × volume moyen 200 = 400 000 volumes/mois adressables, mais répartis sur 2 000 KW distincts — difficile à attaquer par une opération unique d'un concurrent, facile à scaler par une pSEO template côté nous.
3. **La difficulté SEO est faible sur la longue traîne.** 70 % des KW [métier RGE] [ville] ont un KD < 20 (mesuré Ahrefs, audit 2026-04). Les SERP sont aujourd'hui remplies de france-renov.gouv.fr (mal optimisé UX) + sites généralistes non spécialisés RGE. Un contenu proprement enrichi (5 artisans RGE listés, schema LocalBusiness + Certification, simulateur intégré, auteur YMYL identifié) grimpe top 3 en 3-6 mois.
4. **L'intention est transactionnelle à 87 %** (mesuré audit 2026-04, trafic transactional intent). Chaque visiteur qui rank top 3 sur "plombier RGE Marseille" est un devis potentiel. Le taux de conversion cible 3-5 % (vs 0,7 % actuel) donne 400 000 × 0,03 = 12 000 leads/mois potentiels à terme — excessif mais ordre de grandeur validant le wedge.
5. **Nous avons 90 % de la tuyauterie.** Migrations 380-391 déployées, DB enrichie, simulateur en prod, script noindex RGE-only prêt. Le travail restant est : (a) fix bailout SSR (15 min), (b) générer 2 000 pages templates (2 semaines dev + 3 semaines enrichissement descriptions), (c) Schema.org + TrustBadge (1 semaine), (d) link building local (continu).

**Effort × valeur stratégique** :

- _Effort_ : ~80 jours-homme sur 6 mois (1 dev + 1 content + 1 growth mi-temps) → estimé 40-50 K€ en freelance.
- _Valeur_ : avec 30 % des 2 000 pages en top 3 (600 pages × 200 vol × 25 % CTR × 3 % conv × 95 € commission moyenne) ≈ 85 K€ MRR potentiel à M12.
- _ROI brut_ : payback 5-7 mois post-déploiement initial.
- _Effet stratégique_ : établit la défensibilité SEO locale + alimente les moats secondaires (marque locale, claims artisans, data).

**Comment on étend ensuite — le "land and expand"** : la séquence exposée au paragraphe 4.

**Analogie stratégique** : Notion a gagné en commençant par les _personal docs_ (wedge étroit, outil pour une personne qui prend ses notes), puis a étendu vers les équipes produit, puis vers l'enterprise. Chaque extension réutilisait le moat précédent (interface, bases de données bloc-based, API). Même séquence ici : commencer sur "[métier] RGE [ville]" (wedge local transactionnel), étendre vers les hubs éditoriaux nationaux, puis vers l'API B2B, puis vers le SaaS artisan.

### Paragraphe 4 — La séquence : du wedge vers la domination

Six mouvements consécutifs, chacun déverrouillant le suivant :

**Mouvement 1 (M0 à M3) — Capture locale transactionnelle.**

- Génération des 2 000 pages "[métier RGE] [ville]" + 500 pages "[service RGE] [département]" comme maillage.
- Fix bailout SSR + noindex RGE-only + Schema.org.
- Objectif : 50 K visites/mois sur le cluster local + 200 leads exclusifs RGE/mois.
- Preuve de traction : DR 5, 400 KW organiques, 10 pages top 3 sur cluster local.

**Mouvement 2 (M3 à M6) — Hub éditorial rénovation énergétique.**

- Construction du hub `/renovation-energetique/` + 30 guides profondeur (MaPrimeRénov' 2026 par geste, audit énergétique, DPE, CEE, éco-PTZ).
- Chaque guide lie vers le cluster local (artisan RGE [métier] proche de vous).
- Objectif : top 5 sur 15 KW nationaux à fort volume (maprimerenov 2026, aide pompe à chaleur, audit énergétique obligatoire).
- Preuve : 200 K visites/mois hub + 300 backlinks presse + 1 000 leads/mois total.

**Mouvement 3 (M4 à M9) — Simulateur MaPrimeRénov' tout trafic.**

- Simulateur éligibilité en 90 secondes, embedded partout (homepage, header, guides, footer).
- Lead magnet puissant : "combien je touche ? Quels artisans RGE près de moi ? Combien ça coûte ?"
- Objectif : outil référencé sur /r/france, banques partenaires, MAR, courtiers.
- Preuve : 100 K simulations/mois, 30 % complètent le devis, taux conversion simulateur → devis RGE > 15 %.

**Mouvement 4 (M6 à M12) — Claim artisan + premium SaaS.**

- Outreach massif des 50 332 RGE : "votre fiche est publique, claim-la gratuitement, enrichissez-la, récupérez vos leads exclusifs."
- Conversion claim → premium (CRM artisan, devis PDF, planning, factures, tracking leads) à 9-49 €/mois.
- Objectif M12 : 5 000 artisans claim + 500 premium payants = 30 K€ MRR.
- Preuve : NPS artisan > 50, taux de rétention M+3 > 80 %.

**Mouvement 5 (M9 à M18) — API B2B.**

- Ouverture API "RGE-as-a-service" pour banques (pré-financement MaPrimeRénov'), courtiers travaux, plateformes CEE, MAR.
- Pricing : 0,10 € par requête ou 500-5 000 €/mois selon volume.
- Objectif : 5-10 partenaires banques/fintechs, 300 K€ ARR B2B.
- Preuve : contrats signés, retention > 12 mois.

**Mouvement 6 (M12 à M24) — Marketplace avance MaPrimeRénov'.**

- Partenariat bancaire pour avancer aux artisans le montant MaPrimeRénov' (6 mois de délai moyen aujourd'hui).
- ServicesArtisans devient le tiers de confiance qui valide RGE + éligibilité + escrow.
- Commission 1-2 % du montant financé.
- Ouvre la place de marché vraie : "financement + artisan + aide" en un seul parcours.

**Pourquoi cette séquence et pas une autre** :

- Chaque mouvement _nourrit_ le suivant. Le trafic local (M1) valide l'autorité (M2). L'autorité permet les partenariats API (M5). Les partenariats API valident la marque institutionnelle (M6).
- Chaque mouvement est _falsifiable_ avec un critère de succès binaire. Si M2 ne produit pas 200 K visites/mois à M6, on revoit la stratégie avant de s'engager sur M3.
- L'ordre suit la loi de l'effort marginal : chaque mouvement à effort N+1 utilise les actifs construits en N. M5 (API B2B) est quasi-gratuit si M1 à M4 ont installé data + marque + partenaires.

**Analogie stratégique** : Airbnb (2008-2015) a suivi exactement cette structure : wedge (SF + NYC), expansion géographique (villes top 20), expansion éditoriale (guides voyage), expansion produit (expériences, business travel), expansion financière (Airbnb Plus, assurance hôte). Chaque mouvement ajoutait une couche de moat sans casser la précédente. Notre séquence applique la même grammaire sur la verticale rénovation énergétique.

### Paragraphe 5 — Le moat : pourquoi notre position se renforce avec le temps

Un moat, contrairement à un avantage ponctuel, est une boucle de compounding. Chaque mois qui passe doit augmenter l'écart entre ServicesArtisans et le challenger hypothétique. Cinq boucles de compounding imbriquées :

**Boucle 1 — Data freshness compounding.** Chaque sync ADEME quotidien améliore la fraîcheur moyenne de notre base. Notre cible : médiane de 1 à 7 jours depuis dernière sync RGE, vs 30 à 90 jours pour les concurrents qui syncent trimestriellement ou jamais. Plus nous syncons, plus Google crawle (50K pages × crawl quotidien = signal trust premium), plus le rank monte, plus le trafic augmente, plus nous pouvons financer la sync. Boucle vertueuse technique qui coûte 20-50 €/mois à maintenir une fois automatisée.

**Boucle 2 — Réseau artisans compounding.** Chaque artisan claim sa fiche → reçoit des leads exclusifs → constate le ROI → parraine 2 confrères (ordre de grandeur observé sur plateformes similaires type Stars of Service). 100 claims convertis en M3 → 500 en M6 → 3 000 en M9 → 10 000 en M12. Chaque claim améliore la qualité (photos, descriptions, reviews), ce qui améliore le SEO, ce qui augmente les leads, ce qui attire plus de claims. Boucle Metcalfe classique côté offre.

**Boucle 3 — Réseau clients + reviews compounding.** Chaque devis converti → 15-30 % laissent un avis vérifié (via booking_id FK prouvant la transaction). 1 000 devis/mois → 200-300 avis/mois → 50 000 avis/an. Chaque avis améliore CTR SERP (stars), améliore conversion (trust social), enrichit les pages (contenu unique UGC légal). Les concurrents ne peuvent pas copier les avis — ils peuvent les scraper, mais sans le `booking_id` ils n'ont pas la vérification. Boucle UGC vérifié.

**Boucle 4 — Marque spécifique RGE compounding.** Chaque citation presse ("selon ServicesArtisans, N % des artisans RGE français...") installe la marque _en tant que source_ sur la verticale RGE. Objectif : devenir générique du segment (comme "Kleenex" pour les mouchoirs). Plus la marque est citée, plus les journalistes re-citent par défaut, plus les LLM (ChatGPT, Perplexity, Claude) nous citent, plus les artisans nous respectent, plus les partenariats sont faciles. Boucle de légitimation par répétition.

**Boucle 5 — Switching cost artisan compounding.** Un artisan qui utilise notre CRM (devis, planning, factures) pendant 6 mois a migré ses processus et ses données. Son coût de sortie (migration CRM, réécriture templates devis, perte historique reviews) croît linéairement avec le temps. À 12 mois de rétention, le coût de sortie équivaut à 2-3 mois de travail. Boucle classique SaaS lock-in.

**Invariant commun à toutes les boucles** : le temps. Aucune de ces 5 boucles ne peut être accélérée par un concurrent qui nous copie au mois M+6. Si nous avons 12 mois d'avance à M12 (ce que la fenêtre de marché permet), le concurrent devra investir 12 mois de compounding _sur son temps propre_ pour nous rattraper — pendant lesquels nous continuons nous-mêmes à compounder. L'écart s'ouvre, il ne se ferme pas.

**Failure mode à surveiller** : si _une_ boucle ne s'amorce pas (ex. les artisans ne claim pas parce que le produit premium ne converge pas), le compounding global ralentit. D'où l'importance d'un monitoring mensuel de chaque boucle via les "Moat scores" détaillés en Partie 7.

**Analogie stratégique** : Amazon a expliqué pendant 20 ans qu'il n'avait "aucun avantage durable sur aucun produit individuel" — mais que le flywheel (prix bas → plus de clients → plus de vendeurs → plus de choix → plus de clients) se renforçait chaque trimestre. Après 10 ans, le rattrapage devenait mathématiquement impossible. Même logique ici à échelle réduite : aucun item individuel (fix SSR, pages pSEO, RGE sync) n'est protégeable isolément — le système _en entier_ l'est.

---

## PARTIE 2 — PRODUCT WEDGE

### Le wedge recommandé

**Wedge A — Leader pSEO "[métier RGE] + [ville top 50]"**, détaillé au paragraphe 3 ci-dessus, est la recommandation finale. Les sous-sections ci-dessous justifient pourquoi A bat B, C, D et E malgré leurs mérites apparents.

### Analyse ICE des 5 wedges candidats

| Wedge | Description 1-ligne                                           | Impact 12 mois | Confidence | Ease | ICE (I×C×E) | Rang |
| ----- | ------------------------------------------------------------- | -------------- | ---------- | ---- | ----------- | ---- |
| **A** | Leader pSEO "[métier RGE] [ville]" — 2 000 pages, top 3 local | 9              | 9          | 8    | **648**     | 1er  |
| **B** | Leader simulateur MaPrimeRénov' tous trafic — outil viral     | 8              | 6          | 6    | 288         | 3e   |
| **C** | Marketplace claim → premium artisan SaaS — 500 payants        | 9              | 4          | 4    | 144         | 5e   |
| **D** | Hub éditorial autorité — les médias nous citent               | 7              | 7          | 6    | 294         | 2e   |
| **E** | API B2B données RGE pour partenaires banques/MAR              | 9              | 4          | 5    | 180         | 4e   |

_Lecture_ : Impact sur 10 (quelle part de la vision devient accessible si on gagne), Confidence sur 10 (probabilité de gagner cette bataille en 12 mois), Ease sur 10 (effort inverse — 10 = trivial, 1 = massif).

### Justification détaillée du scoring

**Wedge A — Leader pSEO "[métier RGE] + [ville]" (ICE 648)**

- _Impact 9_ : débloque 400 K volumes/mois adressables transactionnels. Pose les fondations maillage, crée la preuve sociale nécessaire aux wedges D et E.
- _Confidence 9_ : 62 nouveaux KW décollent déjà sur `/urgence/*` et `/départements/*` (audit 2026-04) — le pattern est validé empiriquement. Le KD moyen < 20 permet un timeline 3-6 mois crédible. Fenêtre concurrentielle ouverte.
- _Ease 8_ : 90 % de la tuyauterie existe (migrations 380-391 RGE, script noindex, simulateur en prod). Le travail restant est essentiellement du templating + enrichissement descriptions + fix SSR (15 min critique).

**Wedge B — Leader simulateur MaPrimeRénov' (ICE 288)**

- _Impact 8_ : simulateur viral peut générer 100 K usages/mois. Mais sans SEO local en amont, la distribution reste limitée.
- _Confidence 6_ : la concurrence sur "simulateur MaPrimeRénov'" inclut france-renov.gouv.fr (SERP dominant par autorité officielle). Passer devant est incertain.
- _Ease 6_ : simulateur déjà en prod (`PIPEDRIVE_PIPELINE_SIMULATEUR`), mais la distribution virale demande du média payant ou du SEO — qui dépend du wedge A.
- _Verdict_ : excellent wedge **secondaire** (Mouvement 3 de la séquence), mauvais wedge **premier** parce qu'il a besoin de l'autorité construite par A.

**Wedge C — Marketplace claim → premium SaaS (ICE 144)**

- _Impact 9_ : monétisation directe, revenus récurrents, moat switching cost. La vision cible inclut ce wedge.
- _Confidence 4_ : la conversion claim → premium nécessite une masse critique de leads à offrir, qui elle-même nécessite le trafic du wedge A. Démarrer par C sans A = pousser un produit payant à des artisans qui ne voient pas encore de valeur.
- _Ease 4_ : développement CRM artisan (devis, planning, factures) = 3-6 mois dev ≈ 60-100 K€. Payback tardif.
- _Verdict_ : wedge Y2 (Mouvement 4), pas Y1.

**Wedge D — Hub éditorial autorité (ICE 294)**

- _Impact 7_ : médias qui citent ServicesArtisans = compounding marque. Attire backlinks presse.
- _Confidence 7_ : crédible sur 12 mois avec 1 auteur YMYL identifié + 8 études data-driven + pitch presse Tier 1.
- _Ease 6_ : écriture de qualité YMYL coûte 1 500-2 500 €/article pour un freelance senior. 30 articles = 50-75 K€.
- _Verdict_ : wedge **complémentaire** (Mouvement 2), indispensable mais pas suffisant seul.

**Wedge E — API B2B données RGE (ICE 180)**

- _Impact 9_ : débloque un flux B2B qui ne dépend pas de Google. Revenus récurrents stables.
- _Confidence 4_ : cycle de vente B2B banques/MAR = 6-12 mois. Pas gagnable en M12 sans référence client.
- _Ease 5_ : stack API + contrats + KYC partenaire = 3-4 mois.
- _Verdict_ : wedge Y2-Y3 (Mouvement 5), débloqué par la preuve de traction A + D.

### Recommandation finale et justification

**Wedge A est le seul qui remplit les 4 conditions d'un wedge valide** :

1. **Gagnable en 6-12 mois avec les ressources actuelles** — oui (ICE 648, tuyauterie à 90 %).
2. **Crée un asset réutilisable pour les wedges suivants** — oui (autorité SEO, maillage interne, données d'usage, première preuve de traction).
3. **Défendable contre un concurrent qui copie tard** — oui (compounding boucles 1+2+3, timeline de réplication 6-9 mois minimum).
4. **Aligné avec la vision produit Y3** — oui (local transactionnel → hub → SaaS artisan → API B2B suit naturellement).

**Séquence d'exécution recommandée** : A (M0-M6) → D en parallèle light (M3-M9) → B (M6-M9) → C (M9-M15) → E (M15-M24) → F marketplace financement (M24-M36). Les 3 premiers wedges composent la "phase SEO-produit" (Y1), les 3 derniers la "phase SaaS + B2B" (Y2-Y3).

**Analogie stratégique** : Stripe n'a pas commencé par les grandes entreprises (B2B gros contrats) ni par les consommateurs (card processing grand public). Il a commencé par le "developer wedge" — une ligne de code `pip install stripe` pour le développeur indé ou la startup. Étroit, gagnable, compounding. Même logique : on ne commence pas par l'API B2B banques (cycle trop long) ni par le SaaS artisan (pas encore de leads) — on commence par le template SEO local gagnable sur 12 mois.

---

## PARTIE 3 — MOAT METRICS

Sept types de moat possibles, appliqués à ServicesArtisans avec métriques mesurables et cibles 12 mois.

### Moat 1 — Data

**Description** : exclusivité, fraîcheur et complétude de la donnée — base du positionnement "source de vérité RGE".

**Métriques instrumentées** :

- _Fraîcheur RGE_ : médiane du nombre de jours depuis `rge_last_synced_at` pour les 50 332 providers RGE actifs.
- _Couverture France_ : % des 34 968 communes INSEE avec ≥ 1 artisan RGE référencé et à jour.
- _Exclusivité jointure_ : nombre de "triplets" (SIRET + RGE valide + éligibilité MaPrimeRénov' calculée) exposés publiquement, vs concurrents.
- _Complétude fiches Tier A_ : % des 50 332 fiches RGE avec description enrichie ≥ 500 mots, photos, avis, schema complet.

**Cibles 12 mois** :
| Métrique | Baseline actuelle | M3 | M6 | M12 |
|---|---|---|---|---|
| Fraîcheur RGE médiane (jours) | Inconnue (sync non activée) | 7 | 3 | 1 |
| Couverture communes (≥ 1 RGE) | À mesurer | 40 % | 60 % | 80 % |
| Triplets publics exposés | 0 | 10 K | 30 K | 50 K |
| Fiches Tier A enrichies | 595 / 50 332 (1 %) | 20 % | 60 % | 100 % |

**Cible symbolique** : _"Plus à jour que france-renov.gouv.fr en moyenne de 7 à 30 jours."_ Vérifiable par audit hebdomadaire comparatif (échantillon 50 fiches aléatoires, comparaison rge_valid_until affiché vs api.data.gouv.fr/ademe).

**Mesure opérationnelle** : dashboard SQL hebdo (5 min à produire) + audit manuel trimestriel 50 fiches.

### Moat 2 — Brand

**Description** : capacité de la marque à devenir générique du segment "annuaire RGE" dans l'esprit du public, des artisans, des journalistes, des LLM.

**Métriques** :

- _Recall non-aidé_ : % d'artisans RGE qui citent "ServicesArtisans" spontanément à la question "quel annuaire artisan connaissez-vous ?" (étude 100 artisans, 1 par trimestre).
- _Citations presse Tier 1 / mois_ : mentions dans Le Moniteur, Batirama, Batiactu, Les Échos Immobilier, Le Monde Habitat.
- _Citations LLM / mois_ : mentions dans réponses ChatGPT, Perplexity, Claude, Gemini à des prompts RGE / rénovation énergétique.
- _Rank cognitif_ : position de ServicesArtisans dans le top 5 cité par ChatGPT à "quels sont les meilleurs annuaires d'artisans en France ?".

**Cibles 12 mois** :
| Métrique | Baseline | M3 | M6 | M12 |
|---|---|---|---|---|
| Recall non-aidé artisans | 0-5 % | 10 % | 20 % | 35 % |
| Citations presse Tier 1 / mois | 0 | 2 | 5 | 10 |
| Citations LLM / mois | 395 (mesuré) | 800 | 2 000 | 5 000 |
| Top 3 cité LLM "annuaire artisan" | Non | Non | Oui | Oui (top 2) |

**Cible symbolique** : _"Top 3 des annuaires cités quand on demande à ChatGPT 'annuaire artisan France'."_

**Mesure opérationnelle** : tracking LLM via prompts standardisés mensuels + Google Alerts + mention.com pour presse + étude artisans trimestrielle (500 € via SurveyMonkey).

### Moat 3 — Réseau (artisans)

**Description** : effet réseau côté offre. Plus d'artisans actifs = plus de couverture géographique = plus de leads convertis = plus d'artisans attirés.

**Métriques** :

- _Artisans claim_ : providers avec `claimed_at IS NOT NULL`.
- _Taux d'engagement_ : % des claim qui se loggent ≥ 1 fois / 30 jours.
- _NPS artisan_ : score classique 0-10, calculé trimestriellement sur cohorte active.
- _Densité géographique_ : # artisans claim par département, variance minimisée.
- _Artisans payants_ (plan gratuit → premium) : conversion vers 9-49 €/mois.

**Cibles 12 mois** :
| Métrique | Baseline | M3 | M6 | M12 |
|---|---|---|---|---|
| Artisans claim | 16 | 200 | 1 500 | 5 000 |
| Taux engagement 30j | n/a | 50 % | 55 % | 60 % |
| NPS artisan | n/a | 30 | 40 | 50 |
| Départements avec ≥ 10 claim | 0 | 20 | 60 | 95 |
| Artisans payants | 0 | 20 | 150 | 500 |

**Effet réseau mesurable** : démontrer que la valeur moyenne d'un artisan (# leads reçus / mois) augmente avec le nombre total d'artisans (par effet de couverture géographique et de référencement enrichi).

**Mesure opérationnelle** : SQL + dashboard Retool/Metabase interne, revue mensuelle CEO.

### Moat 4 — Réseau (clients)

**Description** : effet réseau côté demande. Plus de reviews vérifiées + recommandations BAO = plus de confiance public = plus de clients = plus de reviews.

**Métriques** :

- _Reviews vérifiées / mois_ (liées à `booking_id`).
- _Review vélocité_ : reviews / devis converti (%).
- _Rating moyen global_ (stars).
- _Referral bouche-à-oreille_ : % de nouveaux clients arrivant via recommandation directe (question inscription).

**Cibles 12 mois** :
| Métrique | Baseline | M3 | M6 | M12 |
|---|---|---|---|---|
| Reviews vérifiées cumulées | 14 335 (legacy) | 16 000 | 25 000 | 50 000 |
| Review vélocité | n/a | 15 % | 20 % | 25 % |
| Rating moyen global | À mesurer | 4,2 | 4,4 | 4,6 |
| Référral BAO (%) | n/a | 5 % | 12 % | 20 % |

**Cible symbolique** : _"50 000 reviews vérifiées par booking_id à M12."_ Ce chiffre seul bat tous les concurrents annuaire en France sur les reviews _vérifiées_ (i.e. liées à une transaction, pas déclaratives).

**Mesure opérationnelle** : SQL `SELECT count(*) FROM reviews WHERE booking_id IS NOT NULL AND status = 'published'` mensuel.

### Moat 5 — Switching cost (pour artisan)

**Description** : plus l'artisan utilise notre stack (CRM, devis, planning, factures, historique reviews), plus le coût de migrer ailleurs augmente. Classique SaaS lock-in.

**Métriques** :

- _% revenus artisan via plateforme_ : estimation déclarative trimestrielle auprès d'une cohorte de 50 artisans actifs premium.
- _Ancienneté moyenne des claim actifs_ (mois).
- _Taux de rétention M+3 / M+12_ pour les premium.
- _Fonctionnalités utilisées_ (nb features touchées / mois) : proxy de dépendance.

**Cibles 12 mois** :
| Métrique | Baseline | M3 | M6 | M12 |
|---|---|---|---|---|
| % revenus plateforme (cohort premium) | n/a | 10 % | 25 % | 40 % |
| Ancienneté moy. claim actifs (mois) | n/a | 1,5 | 3 | 6 |
| Rétention M+3 premium | n/a | 75 % | 80 % | 85 % |
| Features / mois / artisan | n/a | 2 | 4 | 6 |

**Comment renforcer** : shipper CRM artisan Y1-Y2 dans cet ordre — (1) historique leads, (2) template devis PDF, (3) planning rendez-vous, (4) facturation, (5) integration comptable, (6) signature électronique. Chaque feature ajoute un point d'ancrage.

**Mesure opérationnelle** : événements PostHog + Stripe retention cohort + enquête trimestrielle.

### Moat 6 — Réglementaire / institutionnel

**Description** : partenariats officiels avec ADEME, France Rénov', MAR, ministères. Statut de tiers de confiance qui ouvre des moats inaccessibles aux concurrents purement commerciaux.

**Métriques** :

- _Partenariats formalisés_ (MoU, convention, API contract) avec institutionnels.
- _Statut "tiers de confiance"_ : reconnu officiellement par France Rénov' ?
- _Mentions dans documents officiels_ (arrêtés, guides ADEME, pages gouv.fr).
- _Présence événements institutionnels_ (salons MAR, colloques CAPEB, assises rénovation).

**Cibles 12 mois** :
| Métrique | Baseline | M3 | M6 | M12 |
|---|---|---|---|---|
| Partenariats institutionnels | 0 | 1 | 3 | 5 |
| Statut "tiers de confiance" France Rénov' | Non | Non | En cours | Obtenu |
| Mentions documents officiels | 0 | 0 | 1 | 3 |
| Présence événements | 0 | 1 | 3 | 6 |

**Partenaires cibles** prioritaires : France Rénov' (premier contact), Mon Accompagnateur Rénov', ADEME, Qualibat, CAPEB, FFB, Les Compagnons du Devoir.

**Mesure opérationnelle** : tracker interne CEO + réunion trimestrielle "institutional relations".

### Moat 7 — Expertise / contenu

**Description** : devenir la source citée par la presse Tier 1 sur les sujets RGE / MaPrimeRénov' / rénovation énergétique. Moat éditorial qui alimente tous les autres.

**Métriques** :

- _Auteur identifié_ nommé, LinkedIn connecté, bylines sur tous les guides YMYL.
- _Citations presse par article_ : moyenne de # backlinks / article publié.
- _Linkable assets uniques_ (études propriétaires, datasets, cartes interactives).
- _Source citée par journalistes_ : # journalistes qui nous contactent spontanément / mois.
- _Classement en top-of-mind cognitif SEO_ : # articles en position #1 sur KW "informationnel" YMYL.

**Cibles 12 mois** :
| Métrique | Baseline | M3 | M6 | M12 |
|---|---|---|---|---|
| Auteur YMYL identifié public | Non | Oui | Oui | Oui |
| Citations presse / article moy. | 0 | 1 | 3 | 8 |
| Linkable assets uniques | 0 | 3 | 8 | 15 |
| Sollicitations journalistes / mois | 0 | 1 | 3 | 8 |
| Articles en #1 sur KW info YMYL | 0 | 3 | 10 | 25 |

**Assets prioritaires** : (a) Baromètre trimestriel RGE France, (b) Cartographie interactive passoires thermiques × artisans RGE, (c) Observatoire prix MaPrimeRénov', (d) Guide juridique audit énergétique obligatoire.

**Mesure opérationnelle** : SurveyMonkey journalistes + Ahrefs backlinks/article + GSC impressions KW informationnels.

### Tableau de synthèse Moat scores

Score 0-10 par moat, mis à jour mensuellement en board CEO.

| Moat                        | Baseline (avril 2026) | M3      | M6      | M12     | M24     |
| --------------------------- | --------------------- | ------- | ------- | ------- | ------- |
| 1. Data                     | 4                     | 6       | 7       | 9       | 10      |
| 2. Brand                    | 2                     | 3       | 5       | 7       | 9       |
| 3. Réseau artisans          | 1                     | 2       | 4       | 6       | 8       |
| 4. Réseau clients (reviews) | 3                     | 3       | 5       | 7       | 9       |
| 5. Switching cost artisans  | 0                     | 1       | 3       | 5       | 8       |
| 6. Réglementaire            | 0                     | 1       | 3       | 5       | 7       |
| 7. Expertise / contenu      | 1                     | 3       | 5       | 7       | 9       |
| **Moyenne pondérée**        | **1,6**               | **2,7** | **4,6** | **6,6** | **8,6** |

**Pondérations recommandées** pour la moyenne : Data 25 %, Brand 15 %, Réseau artisans 15 %, Réseau clients 10 %, Switching cost 10 %, Réglementaire 15 %, Expertise 10 %. Reflète que data + marque + régulation sont les 3 piliers centraux du positionnement.

---

## PARTIE 4 — DEFENSIBILITY ANALYSIS

Pour chaque concurrent majeur, projection "comment ils peuvent nous copier" en 1 mois, 3 mois, 12 mois — et réponse stratégique.

### Concurrent 1 — societe.com (+63 % trafic, seul gagnant)

**Threat level** : ÉLEVÉ (seul concurrent en croissance, base data officielle INSEE).

**Réplication** :

- _1 mois_ : ajouter un filtre "RGE oui/non" dérivé de l'API ADEME. Faible effort (leur stack est prête).
- _3 mois_ : générer 50 K pages "artisan RGE [ville]" templates similaires à leurs pages société. Moyen effort.
- _12 mois_ : construire simulateur MaPrimeRénov' + marketplace lead + branding rénovation. Effort lourd (pas leur DNA : ils sont positionnés "données entreprises" pas "services particuliers").

**Notre défense** :

- _Contre 1 mois_ : vitesse d'exécution — nous lançons notre pSEO local **avant** leur filtre.
- _Contre 3 mois_ : qualité des pages (descriptions enrichies, avis vérifiés, simulateur intégré, auteur YMYL) + maillage hub éditorial. Leur template thin perdra en E-E-A-T sous HCU.
- _Contre 12 mois_ : marketplace lead + CRM artisan sont hors de leur scope. Ils ne peuvent pas pivoter produit sans casser leur cash cow B2B info.

### Concurrent 2 — pagesjaunes.fr (-13 %)

**Threat level** : MOYEN (traffic legacy, pas de focus RGE, déclin structurel).

**Réplication** :

- _1 mois_ : ajouter badge "RGE" déclaratif (non vérifié) sur fiches. Trivial, mais sans valeur.
- _3 mois_ : intégrer API ADEME. Faisable.
- _12 mois_ : pivot complet "annuaire rénovation énergétique". Improbable (leur brand = généraliste).

**Notre défense** :

- _Contre 1 mois_ : différenciation "certifié + vérifié + éligibilité calculée" — un badge déclaratif ne remplace pas la jointure temps réel.
- _Contre 3 mois_ : notre autorité éditoriale YMYL se sera installée (hub + citations presse).
- _Contre 12 mois_ : effet réseau artisans + reviews vérifiés nous met hors d'atteinte rapide.

### Concurrent 3 — travaux.com (-4 820 pages)

**Threat level** : FAIBLE (en déclin fort, modèle thin déclassé par HCU).

**Réplication** :

- _1 mois_ : pivot éditorial rénovation énergétique possible.
- _3 mois_ : refonte produit autour RGE. Freiné par dette technique.
- _12 mois_ : peu probable sans levée fonds externe. Hypothèse rachat par acteur tiers.

**Notre défense** :

- Vitesse + capture des KW qu'ils perdent (reconquête 59 KW perdus = 94 K vol/mois documentés audit 2026-04).

### Concurrents 4-6 — Effy / Hellio / Izi by EDF

**Threat level** : ÉLEVÉ (budgets média, backing énergéticien, focus rénovation).

**Réplication** :

- _1 mois_ : lancer une verticale "annuaire artisans RGE" sur leur domaine. Possible techniquement.
- _3 mois_ : acquérir un annuaire existant (cf. habitatpresto, allovoisins en difficulté). Faisable financièrement.
- _12 mois_ : construire position SEO concurrentielle. Coûteux (budgets média pour compenser SEO plus lent).

**Notre défense** :

- _Contre 1 mois_ : leur DNA = filière (installer + financer + fournir). Annuaire neutre n'est pas leur ADN, conflit intérêt perçu.
- _Contre 3 mois_ : nous nous positionnons comme **neutre**, ils sont partie prenante — avantage trust décisif.
- _Contre 12 mois_ : moat réglementaire (partenariats France Rénov') renforce la neutralité perçue.

### Concurrents 7-8 — habitatpresto / allovoisins (-35 % / -6 841 pages)

**Threat level** : FAIBLE (déclin, non focalisés RGE).

**Réplication** : peu probable, plus vraisemblablement cibles de rachat que challengers actifs.

**Notre défense** : capture de leurs KW perdus. Étudier un rachat sélectif d'actifs SEO (base backlinks, si décote massive à Q4 2026).

### Stratégie globale "course aux moats" — 4 leviers

**Levier 1 — Vitesse d'exécution.**
Chaque sprint hebdomadaire livre un moat score mesurable amélioré. Règle : aucun sprint ne se termine sans une métrique moat qui bouge. Celebrity metric : **"Deploys per week touching a moat-relevant file ≥ 5"**.

**Levier 2 — Compounding (chaque mois renforce le moat précédent).**
Revue mensuelle CEO : "Que fait chaque action ce mois pour renforcer le moat du mois précédent ?" Si une action ne renforce aucun moat existant, elle descend en priorité. Règle : 80 % du budget mensuel sur actions qui compoundent, 20 % exploration nouveaux moats.

**Levier 3 — Effets de réseau enclenchés tôt.**
Les boucles 2 (artisans) et 3 (reviews) sont les plus lentes à démarrer. Amorce dès M1 avec outreach ciblé 500 artisans RGE + incentive claim (fiche premium gratuite 6 mois + promesse leads exclusifs). Même faux départ préférable à démarrage tardif — le compounding a besoin de temps.

**Levier 4 — Brand qui devient générique du segment.**
Objectif stratégique non-mesurable directement mais structurant : **lorsqu'un journaliste Tier 1 écrit un article sur "la rénovation énergétique en 2026", il cite ServicesArtisans par réflexe**. Obtenir ce réflexe prend 12-24 mois. Commencer maintenant.

**Analogie stratégique** : Figma n'a pas battu Sketch en faisant "Sketch mais dans le navigateur" — il a battu Sketch en enclenchant la boucle collaborative (2+ designers sur un même fichier) _avant_ que Sketch n'y réfléchisse. Une fois la boucle enclenchée, même Adobe (XD) + Microsoft (Designer) + cie ne pouvaient plus rattraper. Notre équivalent : enclencher la boucle "artisan claim → leads → reviews → claim" _avant_ que societe.com ou un tiers ne s'en soucie.

---

## PARTIE 5 — PRODUCT VISION 36 MOIS

### Year 1 (M0 → M12) — Annuaire RGE leader France

**Focus** : where we focus. Tout effort non-aligné est filtré.

**Livrables produit** :

- 50 347 fiches Tier A (RGE + claim) enrichies + indexées.
- 2 000 pages pSEO "[métier RGE] [ville]" maillées.
- 500 pages hub éditorial rénovation énergétique.
- Simulateur MaPrimeRénov' visible sur 5 surfaces + API publique.
- Outreach claim 5 000 artisans → 1 500 claim actifs → 150 premium payants.
- API ADEME sync quotidien + IndexNow ping.

**Métriques cibles M12** :

- 2 500 visites/jour organiques (vs 164 baseline).
- 1 500 KW organiques.
- DR 30.
- 1 000 devis RGE exclusifs / mois.
- 30 K€ MRR.

### Year 2 (M12 → M24) — SaaS artisan complet

**Focus** : expand. Monétiser le réseau construit en Y1.

**Livrables produit** :

- CRM artisan complet : historique leads, devis PDF, planning, facturation, signature électronique.
- Portail artisan premium (9 / 29 / 99 €/mois selon volume + features).
- Marketplace lead tiering (basic / premium / exclusif).
- Intégrations comptables (QuickBooks, Pennylane, Indy).
- Notifications SMS/email automatisées.
- App mobile artisan (iOS + Android).

**Métriques cibles M24** :

- 10 000 artisans claim actifs.
- 2 000 artisans premium payants.
- 150 K€ MRR SaaS + 100 K€ MRR commission lead.
- 5 000 devis/mois.
- Rétention M+12 premium > 70 %.

### Year 3 (M24 → M36) — Place de marché certification + financement

**Focus** : systemic. Devenir le tiers de confiance qui orchestre le parcours complet.

**Livrables produit** :

- Partenariat bancaire (Crédit Agricole / BNP / Hellio Finance) pour avance MaPrimeRénov'.
- Escrow multi-parties (client paye, fonds bloqués, libérés à validation jalons).
- API B2B data RGE (banques, courtiers, MAR, assurances).
- Certification ServicesArtisans (label au-delà de RGE, validé par reviews + audits terrain).
- Application mobile client.
- Internationalisation : Belgique + Suisse francophones (copie modèle local).

**Métriques cibles M36** :

- 30 000 artisans actifs / 5 000 premium.
- 20 000 devis/mois.
- 1 M€ MRR total (SaaS + commission + API + escrow).
- 3 partenaires banques signés.
- Levée série A à valorisation 50-100 M€ (ou rachat stratégique).

### Architecture produit cible Y3

```
                    +----------------------------------+
                    |          CLIENT (particulier)    |
                    |  mobile app + web + simulateur   |
                    +---------------+------------------+
                                    |
                                    v
              +---------------------+---------------------+
              |    PARCOURS ORCHESTRÉ "de l'idée au geste"|
              |  1. simulation -> 2. devis -> 3. choix    |
              |  4. signature -> 5. financement ->        |
              |  6. travaux -> 7. avis                    |
              +---------------------+---------------------+
                                    |
                   +----------------+----------------+
                   |                |                |
                   v                v                v
          +---------------+ +---------------+ +---------------+
          | ARTISAN SaaS  | |  ANNUAIRE RGE | | FINANCEMENT   |
          | CRM + devis + | |  50K fiches   | | banques +     |
          | planning +    | |  temps réel   | | MaPrimeRénov' |
          | factures + app| |  SEO + API    | | avance + PTZ  |
          +-------+-------+ +-------+-------+ +-------+-------+
                  |                 |                 |
                  +--------+--------+--------+--------+
                           |                 |
                           v                 v
                +----------+-----+   +-------+---------+
                | DATA PLATFORM  |   | PLATFORM B2B API|
                | INSEE + ADEME  |   | banques, MAR,   |
                | + BAN + JORF   |   | courtiers,      |
                | joints, daily  |   | assurances      |
                +----------------+   +-----------------+
```

**Invariant architecture** : la _Data Platform_ reste le cœur. Tout ce qui est construit au-dessus (UX client, SaaS artisan, financement, API B2B) est une consommation de cette couche. Si cette couche pourrit, tout pourrit — d'où le moat 1 (data) classé en priorité absolue.

**Analogie stratégique** : Shopify a commencé comme "e-commerce pour Snowdevil" (un magasin de snowboard). Y3 ils étaient la plateforme e-commerce + POS + fulfillment + financement (Shopify Capital) + App Store. Chaque couche réutilisait la précédente. Même grammaire ici — l'annuaire Y1 devient la fondation d'un stack SaaS + financement Y2-Y3.

---

## PARTIE 6 — POSITIONING STATEMENT

### Format standard (formule type)

> Pour **[client cible]**, qui **[problème]**, ServicesArtisans est **[catégorie]** qui **[bénéfice unique]**, contrairement à **[concurrent]**, parce que **[preuve]**.

### Variant 1 — Particulier rénovation énergétique

> Pour **les propriétaires occupants de logements F ou G obligés de rénover** qui **ne savent pas quel artisan RGE choisir, combien ça va coûter, ni combien d'aide ils toucheront**, ServicesArtisans est **le seul annuaire national d'artisans certifiés RGE qui calcule en 90 secondes le devis probable + l'aide MaPrimeRénov' + les 3 artisans disponibles près de chez vous**, contrairement à **PagesJaunes (fiches non vérifiées), France-Rénov' (annuaire sans UX de choix), ou habitatpresto (leads partagés non exclusifs)**, parce que **nous joignons en temps réel SIRET INSEE actif + qualification ADEME + éligibilité MaPrimeRénov' géolocalisée, et chaque lead est exclusif (1 client = 1 artisan)**.

**Propositions courtes dérivées** :

- Tagline grand public : _"L'artisan RGE vérifié + la prime calculée + le devis en 90 secondes."_
- Tagline SEO : _"Annuaire officiel des artisans RGE certifiés France — mis à jour chaque jour."_

### Variant 2 — Artisan RGE

> Pour **les artisans certifiés RGE qui veulent des leads qualifiés sans dépenser 500 € par mois en Google Ads et sans partager chaque lead avec 5 concurrents**, ServicesArtisans est **la plateforme de génération de leads RGE exclusifs (1 lead = 1 artisan) avec CRM + devis + planning intégrés**, contrairement à **habitatpresto ou allovoisins (leads partagés 3-5 fois, aucun outil métier)**, parce que **notre SEO capte l'intention RGE-spécifique au moment où le particulier est éligible MaPrimeRénov', et nous ne monétisons qu'en commission sur devis signé — pas de frais fixes aveugles**.

**Propositions courtes** :

- Pitch cold email : _"Votre fiche RGE est déjà publique sur ServicesArtisans. Revendiquez-la en 2 minutes : 100 % gratuit, leads exclusifs, aucune commission les 3 premiers mois."_
- Tagline artisan : _"Les leads RGE exclusifs. Pas de partage. Pas de frais fixes."_

### Variant 3 — Partenaire institutionnel (banque, courtier, MAR, fédération)

> Pour **les banques qui veulent proposer une avance MaPrimeRénov' sans fraude, les courtiers travaux qui cherchent des artisans RGE vérifiés à recommander, les Mon Accompagnateur Rénov' qui doivent orienter vers des professionnels qualifiés**, ServicesArtisans est **la couche API de confiance qui valide en 50 ms SIRET + RGE + éligibilité MaPrimeRénov' + historique avis vérifiés**, contrairement à **l'ADEME (API officielle RGE seule, sans jointure) ou aux annuaires commerciaux sans données officielles**, parce que **nous maintenons en temps réel la jointure entre les 4 référentiels officiels + une couche UGC de 50 000 avis vérifiés par booking_id**.

**Propositions courtes** :

- Pitch B2B banque : _"Avancez MaPrimeRénov' en confiance. Notre API valide RGE + éligibilité + historique en 50 ms, pour 10 centimes par requête."_
- Tagline institutionnel : _"La source de vérité RGE pour l'écosystème rénovation énergétique français."_

### Règle éditoriale cross-variants

Chaque variant doit respecter 3 invariants :

1. _Preuve mesurable_ — "50 ms", "1 lead = 1 artisan", "chaque jour", "50 000 avis vérifiés". Zéro abstraction.
2. _Concurrent nommé explicitement_ — force la différenciation claire.
3. _Le "parce que"_ — toujours ancré dans un asset data / processus reproductible.

---

## PARTIE 7 — STRATEGIC METRICS DASHBOARD

**Distinction critique** : métriques stratégiques (impact à 12 mois, conviction directionnelle) vs tactiques (A/B tests, CTR, formulaire). Ce dashboard ne contient que les premières. Les tactiques vivent dans le dashboard growth hebdomadaire.

### 12 métriques stratégiques — CEO monthly review

```
+---------------------------------------------------------------+
|        SERVICESARTISANS — CEO MONTHLY STRATEGIC REVIEW        |
|        Month: YYYY-MM | Quarter: QX | Year: Y1/Y2/Y3          |
+---------------------------------------------------------------+

BLOC 1 — NORTH STAR & REVENUS
1. Devis RGE exclusifs / mois ..........  [Current] / [Target M]
2. MRR total (€) .......................  [Current] / [Target M]
3. Rétention 12 mois cohortes premium ..  [Current] / [Target]

BLOC 2 — MOAT SCORES (1-10)
4. Moat score moyen pondéré ............  [Current] / [Target M]
5. Data freshness median (days) ........  [Current] / [Target M]
6. Citations LLM / mois ................  [Current] / [Target M]

BLOC 3 — POSITION CONCURRENTIELLE
7. Rank share-of-voice vs 8 concurrents . [Position / 8]
8. Trafic organique (v. concurrent #1) .  [Ratio X]
9. Domain Rating Ahrefs ................  [Current] / [Target]

BLOC 4 — QUALITÉ SYSTÉMIQUE
10. Qualité fiche moyenne (0-10 audit) .  [Current] / [Target]
11. Qualité contenu YMYL (audit expert) . [Current] / [Target]
12. Brand recall non-aidé (étude) ......  [Current] / [Target]

+---------------------------------------------------------------+
|  DECISIONS REQUESTED THIS MONTH:                              |
|  - [ ] Decision 1: ...                                        |
|  - [ ] Decision 2: ...                                        |
|                                                               |
|  RED FLAGS:                                                   |
|  - ...                                                        |
|                                                               |
|  WINS OF THE MONTH:                                           |
|  - ...                                                        |
+---------------------------------------------------------------+
```

### Spécification de chaque métrique

| #   | Métrique                    | Source                        | Fréquence     | Cible M12 | Responsable |
| --- | --------------------------- | ----------------------------- | ------------- | --------- | ----------- |
| 1   | Devis RGE exclusifs / mois  | SQL `bookings` + filter RGE   | Mensuelle     | 1 000     | CEO         |
| 2   | MRR total (€)               | Stripe dashboard              | Mensuelle     | 30 K€     | CEO         |
| 3   | Rétention 12 mois cohortes  | Stripe cohort                 | Trimestrielle | 70 %      | CEO         |
| 4   | Moat score moyen pondéré    | Calcul manuel 7 moats         | Mensuelle     | 6,6       | CEO         |
| 5   | Data freshness median (j)   | SQL `rge_last_synced_at`      | Hebdomadaire  | 1 j       | Dev lead    |
| 6   | Citations LLM / mois        | Tracking prompts standardisés | Mensuelle     | 5 000     | Growth      |
| 7   | Rank SoV vs 8 concurrents   | Ahrefs keyword rank           | Mensuelle     | Top 3     | Growth      |
| 8   | Trafic / concurrent #1      | Ahrefs                        | Mensuelle     | Ratio 0,5 | Growth      |
| 9   | Domain Rating Ahrefs        | Ahrefs                        | Mensuelle     | 30        | Growth      |
| 10  | Qualité fiche moyenne       | Audit 50 fiches aléatoires    | Trimestrielle | 8         | Content     |
| 11  | Qualité YMYL (audit expert) | Expert RGE externe            | Trimestrielle | 9         | Content     |
| 12  | Brand recall non-aidé       | Étude 100 artisans            | Trimestrielle | 35 %      | CEO         |

### Règle d'interprétation dashboard

**4 états possibles** (appliqué à chaque métrique individuelle) :

- ✅ _On track_ : ≥ 90 % de la cible linéaire du mois.
- ⚠️ _At risk_ : 70-90 %. Plan d'action dans le board suivant.
- 🚨 _Red_ : < 70 %. Réunion ad hoc sous 48h.
- 🎯 _Beat_ : > 110 %. Documenter ce qui a marché pour réutiliser.

**Règle 3-strikes** : une métrique 🚨 pendant 3 mois consécutifs déclenche un pivot/retour dans le DECISION FRAMEWORK (Partie 8).

### Format de communication (asynchrone + synchrone)

- _Loom mensuel 10 min_ par CEO à partir du dashboard — partagé board + équipe + conseillers.
- _Meeting board trimestriel_ 90 min — revue moat scores détaillés + vote décisions stratégiques.
- _Dashboard Metabase/Retool_ accessible 24/7 — seule source de vérité.

---

## PARTIE 8 — DECISION FRAMEWORK (Pivot vs Persévérer)

Cinq critères mesurables déclencheurs de revue stratégique. Chacun a un seuil binaire non-négociable — si le seuil n'est pas atteint, on entre en "review mode" (revue obligatoire 2 semaines) avant toute nouvelle décision tactique.

### Critère 1 — M3 : traction SEO

**Seuil** : trafic organique Ahrefs ≥ 400 visites/jour (vs 164 baseline = ×2,4).

**Si seuil non atteint** :

- Hypothèse 1 : le fix bailout SSR n'a pas tenu (rollback silencieux ?). Vérification curl + GSC impressions.
- Hypothèse 2 : Google n'a pas recrawlé massivement. Escalade IndexNow + GSC soumission manuelle 100 URLs.
- Hypothèse 3 : problème E-E-A-T (auteur manquant, descriptions non enrichies). Accélérer YMYL.
- Action obligatoire : revue à 2 semaines + budget dédié root cause.

**Si très en-deçà (< 250/j)** : reconsidérer le wedge SEO local. Possible pivot vers wedge B (simulateur) pour Y1.

### Critère 2 — M6 : conversion funnel

**Seuil** : conversion globale (visitor → devis) ≥ 2 % (vs 0,7 % baseline, cible M12 5 %).

**Si seuil non atteint** :

- Diagnostiquer : lequel des 4 gouffres (SERP-page, page-form, form-submit, submit-lead) reste le goulot ?
- Hypothèse 1 : formulaire encore trop long — retour à 3 champs ?
- Hypothèse 2 : trust signals invisibles — re-design fiche.
- Hypothèse 3 : leads pas qualifiés parce que trafic mauvais (intention informationnelle vs transactionnelle). Pivot content mix.

**Si < 1 %** : hypothèse produit-marché fit cassé. Revue fondamentale positioning + parcours.

### Critère 3 — M9 : signal monétisation

**Seuil** : MRR ≥ 10 K€ OU 100 artisans premium payants OU 1 partenariat B2B en pilote signé.

**Si aucun des 3 seuils** : le modèle économique ne converge pas. Deux options :

- _Bootstrap mode_ : descendre tous les coûts variables (freelances, média payant) au minimum, extend runway 18+ mois sur revenus existants, continuer SEO organique lent.
- _Raise mode_ : si SEO traction excellente (M3 + M6 atteints) mais monétisation lente, envisager pre-seed 500 K€ pour accélérer le SaaS artisan Y2 anticipé.

**Règle** : si MRR < 3 K€ à M9, pas de levée possible (traction insuffisante). Bootstrap imposé.

### Critère 4 — M12 : leadership catégoriel

**Seuil** : top 3 SERP sur ≥ 50 KW "[métier RGE] [ville]" + top 5 sur 5 KW hub nationaux + DR ≥ 25.

**Si seuil non atteint** :

- Étendre le wedge ? Passer à "[service RGE] [dpt/région]" (wedge plus large mais plus ardu).
- Pivoter wedge ? Passer au simulateur MaPrimeRénov' comme wedge principal si trafic simulateur > trafic annuaire.
- Abandonner wedge ? Accepter que le positionnement "leader RGE" est pris par france-renov.gouv.fr ou societe.com, pivoter vers niche complémentaire (ex. "avis vérifiés artisans").

**Règle** : si DR < 15 à M12, problème link building structurel — revue PR/outreach.

### Critère 5 — M18 : break-even

**Seuil** : MRR couvre ≥ 120 % des charges opérationnelles mensuelles (infra + freelances + outils).

**Si seuil non atteint** :

- Option A (continuer) : réduire les charges à 70 % (scénario minimal) + étendre wedge D (éditorial) pour maximiser revenus publicitaires auxiliaires.
- Option B (exit) : mettre en vente les actifs (domaine + data + trafic). Valorisation estimée baseline M18 = 500 K€ à 1,5 M€ selon DR final.
- Option C (acquire) : chercher rachat stratégique par Effy / Hellio / énergéticien comme verticale "annuaire RGE" intégrée.

**Règle** : si on atteint break-even à M15 (3 mois en avance), déclencher levée série A. Si M20+ sans break-even, exit strategy obligatoire.

### Synthèse du framework (tableau de bord)

| Milestone | Métrique clé           | Seuil binaire             | Action si miss              | Action si beat    |
| --------- | ---------------------- | ------------------------- | --------------------------- | ----------------- |
| M3        | Trafic organique /jour | ≥ 400                     | Revue SEO 2 sem.            | Accélérer content |
| M6        | Conversion globale     | ≥ 2 %                     | Revue funnel 2 sem.         | Accélérer SaaS    |
| M9        | MRR ou premiums        | ≥ 10 K€ / 100 / 1 partner | Bootstrap ou raise decision | Accélérer Y2      |
| M12       | Leadership catégoriel  | Top 3 × 50 KW + DR 25     | Étendre ou pivoter wedge    | Attaquer wedge 2  |
| M18       | Break-even             | MRR ≥ 120 % coûts         | Exit / acquire / downsize   | Série A           |

**Engagement de gouvernance** : ce framework est remis en revue chaque trimestre. Les seuils peuvent être ajustés _avant_ qu'un milestone approche, jamais _après_ (pour éviter le biais de justification ex post).

**Analogie stratégique** : Reid Hoffman disait "commit to your product-market fit indicators _before_ you have data, so you can't rationalize after". Le framework ci-dessus est notre version — des seuils gravés aujourd'hui, pour que nous ne nous mentions pas dans 6 mois.

---

## The Master Question

Une question dont la réponse détermine si toute cette stratégie tient debout. Une seule. Mesurable. À répondre empiriquement d'ici M6.

> **À M6, quand un propriétaire français classé F ou G tape "pompe à chaleur + [sa ville]" dans Google ou demande à ChatGPT "quel artisan RGE choisir pour isoler mes combles", ServicesArtisans apparaît-il dans le top 3 des résultats cités _avant_ france-renov.gouv.fr, pagesjaunes.fr et les énergéticiens (Effy, Hellio, Izi) — avec une fiche qui montre simultanément le nom de l'artisan, son numéro RGE vérifié, et le montant MaPrimeRénov' estimé ?**

Si la réponse à M6 est OUI : l'hypothèse centrale (jointure SIRET + RGE + MaPrimeRénov' = moat différenciateur visible depuis le SERP et le LLM) est validée empiriquement — la séquence complète 12-36 mois devient mécanique.

Si la réponse à M6 est NON : une des 4 hypothèses fondamentales est fausse et doit être tranchée avant toute nouvelle dépense majeure —

1. _Google ne récompense pas notre jointure data_ (Core algorithm ne la voit pas) → repositionner sur autre signal.
2. _Les utilisateurs ne cliquent pas sur notre format_ (CTR faible malgré rank) → refonte UX SERP (titre, meta, rich snippets).
3. _La jointure est répliquée plus vite que prévu_ (france-renov.gouv.fr ou societe.com a bougé) → accélérer moats secondaires, déplacer wedge.
4. _Le marché n'existe pas à cette granularité_ (recherches locales RGE trop rares) → pivoter vers wedge national simulateur (wedge B).

Cette question n'est pas rhétorique. Elle est le test de falsification unique de la stratégie. Le **test de Popper** de Plan v2 : _si à M6 nous ne sommes pas top 3 sur "pompe à chaleur Lyon" avec notre signal différenciateur, nous avons appris quelque chose qui réécrit le plan._

Tout le reste — les 7 autres chapitres, les 12 semaines de roadmap, les moats à 10 pondérés — sert à construire la probabilité que la réponse soit OUI.

**— Fin du Chapitre 8.**
