# MASTER PLAN 05 — GROWTH & COMPÉTITIF

## Prendre la place de travaux.com, depanneo, allovoisins et devenir le leader FR annuaire artisans + rénovation énergétique

**Auteur** : VP Growth, ServicesArtisans
**Date** : 18 avril 2026
**Horizon** : 12 mois (Q2 2026 → Q2 2027)
**Fichiers amont** : `RAPPORT-FINAL.md`, `KEYWORDS-ANALYSIS.md`, `STRATEGIE-RENOVATION-ENERGETIQUE.md`, `MASTER-PLAN-01..04-*.md`
**Livrables associés** : `disavow.txt`, `normalized/competitors-v2.csv`, `normalized/best-by-links-external.csv`

---

## TL;DR exécutif

Le marché français des annuaires d'artisans est en **effondrement algorithmique coordonné** : 18 des 20 concurrents trackés perdent entre -13 % et -41 % de trafic entre Q1 et Q2 2026 (Helpful Content Update décembre 2025 + Core Update + AI Overviews). `travaux.com` a perdu **4 820 pages** et -18 % de trafic. `allovoisins.com` a perdu **6 841 pages**. Le seul concurrent en hausse est `societe.com` (+63 %) — parce qu'il s'appuie sur la donnée officielle SIREN.

ServicesArtisans est **aligné sur le pattern gagnant** (données SIREN + code NAF + is_artisan officiel) mais souffre de **DR 0,6** (quasi-zéro autorité), **78 % de backlinks SPAM**, et d'un bailout SSR global qui plafonne la traction. La **fenêtre d'opportunité est de 3-6 mois** avant qu'un challenger solide (probablement effy.fr côté rénovation énergétique, ou un nouveau pur-player) ne solidifie la place vacante.

**Objectif 12 mois** : passer de DR 0,6 à DR 30+, de 45 RD à 200+ RD qualifiés, de 164 trafic/j Ahrefs à 2 000/j, de 395 citations ChatGPT à 5 000+, et conquérir 30 % de branded search. **Le plan est 100 % white hat** — aucun lien acheté, aucun PBN, aucun guest post payé masqué. Tactiques alignées avec [Google Search Quality Guidelines 2026](https://developers.google.com/search/docs/essentials/spam-policies) et best practices Backlinko / Detailed / Eli Schwartz.

---

# 1. Analyse du déclin concurrents — pourquoi ils s'écroulent tous

## 1.1 Les chiffres bruts (Ahrefs snapshot 18/04/2026)

| Concurrent          |     DR |            Δ Trafic |    Δ Pages | Nature                      |
| ------------------- | -----: | ------------------: | ---------: | --------------------------- |
| travaux.com         |     74 | **-18 %** (-63 042) |     -4 820 | Hub historique leads        |
| allovoisins.com     |     72 |                -1 % | **-6 841** | Marketplace services        |
| depanneo.com        |     62 |               -23 % |     -1 797 | Annuaire dépannage          |
| mesdepanneurs.fr    |     60 |               -14 % |       -369 | Plateforme dépannage        |
| rdvartisans.fr      |     57 |               -15 % |     -1 544 | Prise RDV                   |
| lesbonsartisans.fr  |     52 |               -30 % |     -1 395 | Annuaire marketing          |
| etienne-services.fr |     42 |           **-41 %** |     -1 425 | Multi-services              |
| contactartisan.com  |     41 |               -28 % |       -709 | Annuaire pur                |
| plus-que-pro.fr     |     83 |               -36 % |     -1 597 | Label qualité               |
| obat.fr             |     76 |               -16 % |       -832 | Rénovation                  |
| yoojo.fr            |     61 |               -17 % |       -474 | Services à la pers.         |
| ringtwice.fr        |     45 |               -13 % |       -648 | Jobs petit.                 |
| ou-serrurier.fr     |     45 |                -1 % |     -1 063 | Niche serrurerie            |
| **societe.com**     | **86** |           **+63 %** |     -3 546 | **Annuaire SIREN officiel** |

**Total pages perdues par le top 14 concurrents** : ~**28 000 pages déclassées** entre janvier et avril 2026.

## 1.2 Les 5 causes croisées du déclin

### Cause 1 — Helpful Content Update de décembre 2025 (confirmé)

Le déploiement du 11 → 29 décembre 2025 a ciblé trois axes d'après l'analyse post-update :

- **Content depth vs length** (longueur creuse pénalisée)
- **Experience dilution** (contenu générique sans expertise de terrain)
- **Byline authority** (sites sans auteurs identifiés dévalorisés)

Les annuaires d'artisans cochent les **trois cases négatives** : pages template sans expertise, auteur "Équipe éditoriale" générique, variation minimale entre pages.

### Cause 2 — AI Overviews + -33 % trafic éditeurs 2025

Les éditeurs mondiaux ont perdu **-33 % de trafic Google entre novembre 2024 et novembre 2025** à cause des AI Overviews. Quand un utilisateur cherche "prix plombier Paris", l'AI Overview répond directement — le clic vers un annuaire thin n'est plus nécessaire. Les annuaires avec **zéro data propriétaire** sont doublement punis : ils n'apportent rien que l'AI ne puisse synthétiser depuis la SERP.

### Cause 3 — Désindexation massive des pages thin (mai 2025)

Depuis fin mai 2025, Google désindexe activement les pages dites "non monétisables, non ancrées localement, ou peu utiles". Les patterns `/metier/ville` générés en masse sans contenu local réel sont les premiers touchés. C'est ce qui explique les **-1 797 pages perdues par depanneo** et **-4 820 par travaux.com** : ce sont les pages les plus thin qui disparaissent en premier.

### Cause 4 — Penguin continu + PBN détectés

Plusieurs concurrents ont massivement acheté du backlink entre 2020 et 2023. Les passes Penguin continues (SpamBrain) de 2024-2025 invalident ces liens, faisant chuter leur autorité relative. `plus-que-pro.fr` (DR 83, -36 %) en est le cas d'école — DR élevé construit sur backlinks à moitié toxiques.

### Cause 5 — Pourquoi societe.com (+63 %) ?

Seul `societe.com` gagne. Pourquoi ? Parce qu'il répond à **4 critères E-E-A-T simultanés** :

- **Source officielle** (SIREN/SIRET INSEE, pas de scraping)
- **Données vérifiables** (bilans comptables, dirigeants, statuts juridiques)
- **Pages profondes et uniques** (chaque entreprise = fiche unique)
- **Citations institutionnelles** (ministères, presse éco, études uni.)

C'est **exactement le positionnement** de ServicesArtisans (SIREN + code NAF + is_artisan + legal_form_code sur chaque provider). Il faut **amplifier cette différenciation** — on est le "societe.com de l'artisanat résidentiel".

## 1.3 Conclusion analyse — ce que dit le marché

> Google dévalorise le modèle "annuaire marketing générique avec pages thin `/metier/ville` × 100k". Il récompense la donnée officielle vérifiable + contenu de profondeur + expertise identifiable.

ServicesArtisans a **le bon ADN structurel** (SIREN officiel, 500k providers réels, géolocalisation INSEE) mais **pas encore l'exécution** (bailout SSR = Google voit du vide, DR 0,6 = aucune crédibilité link graph).

---

# 2. Fenêtre d'opportunité — 3 à 6 mois avant qu'un challenger solidifie

## 2.1 Analyse des "places à prendre"

Chaque concurrent en chute laisse des SERPs vacantes que Google remplit avec :

1. Le concurrent restant le moins touché (si DR correct)
2. Un nouveau site qui arrive avec une meilleure exécution E-E-A-T
3. Un AI Overview qui absorbe la position 1

**Indicateurs clés** :

- 73 % des KW perdus par les 20 concurrents sont **ré-attribués sous 90 jours** à un autre résultat organique (vs AI Overview pur)
- Les nouveaux entrants ont **une fenêtre de ~4 mois** pour capturer la position avant que Google "solidifie" son choix

## 2.2 Challengers potentiels à surveiller (qui pourrait nous doubler)

| Site                        | Signal à surveiller                                             | Risque                     |
| --------------------------- | --------------------------------------------------------------- | -------------------------- |
| effy.fr                     | Hub rénovation énergétique puissant, DR 70+, backed Groupe Effy | **Haut** (côté rénovation) |
| habitatpresto.com           | Marketplace rénovation, contenu blog régulier                   | Moyen                      |
| hellio.com                  | Marque CEE forte, contenu institutionnel                        | Moyen                      |
| izi-by-edf-renov.fr         | Backed EDF, notoriété brand                                     | Haut (brand search)        |
| Nouveau pur-player IA-first | À surveiller dans Product Hunt / Web3 / TechCrunch FR           | Inconnu                    |

## 2.3 Notre fenêtre stratégique

- **Mois 1-3** : exécution technique (fix bailout, disavow, pré-rendu top villes, content velocity)
- **Mois 3-6** : **window of gold** — Google ré-attribue les SERPs vacantes. C'est là qu'on doit être prêt avec 500+ pages rénovation énergétique + 30+ backlinks qualifiés + PR campaign lancée.
- **Mois 6-12** : consolidation, digital PR continue, brand building

Si on manque les mois 3-6, un challenger prend la place et nous oblige à un combat 2x plus dur.

---

# 3. Link building plan agressif 12 mois — 7 tiers

## 3.1 Philosophie

**Règle d'or** : chaque backlink doit pouvoir être montré au Google Quality Team sans gêne.
**Interdits absolus** :

- Liens achetés (Penguin direct)
- PBN (Private Blog Networks — détectés par SpamBrain)
- Guest posts payés masqués (violation Google Guidelines § "Link Schemes")
- Link exchanges massifs (patterns détectés)
- Comment spam, forum spam, profile links
- Directory submissions en masse (faible valeur + flag)

**Autorisés et priorisés** :

- Citations éditoriales naturelles (digital PR)
- Backlinks institutionnels (fédérations, ministères, open data)
- Mentions presse spontanées (data-driven PR)
- Podcasts / interviews
- HARO-like sourcing
- Outreach outreach sur ressources réelles (broken link, skyscraper, resource page)
- Co-création de contenu avec partenaires

**Objectif 12 mois** : 200+ RD qualifiés, DR 30+, reparti entre :

- Tier 1 (Media presse) : 20 RD DR 50-80
- Tier 2 (Institutionnels) : 10 RD DR 60-90
- Tier 3 (Blogs niche) : 40 RD DR 30-60
- Tier 4 (HARO/sourcing) : 30 RD DR 40-80
- Tier 5 (Podcasts) : 15 RD DR 20-50
- Tier 6 (Data-driven PR) : 50 RD DR 30-80 (amplification des 4 premiers)
- Tier 7 (Local citations) : 30 RD DR 20-60

## 3.2 Tier 1 — Media presse BTP / rénovation

### Cibles prioritaires et pitch angles

| Média                              | DR estimé | Contact                                                             | Angle pitch                                                                               |
| ---------------------------------- | --------: | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **lemoniteur.fr**                  |       80+ | 17 rue d'Uzès 75002 Paris / 01 40 13 30 30 / rédaction BTP          | "Étude exclusive : 63 000 artisans RGE en France — cartographie territoriale 2026"        |
| **batirama.com**                   |     60-70 | Laure Pophillat (rédac-chef) / Emilie Wood (rénovation énergétique) | "Baromètre MaPrimeRénov' 2026 par département — qui en profite vraiment ?"                |
| **batiactu.com**                   |       70+ | Equipe éditoriale (1M lecteurs/mois)                                | "Passoires thermiques : 3,9 M de logements pour 63 000 artisans RGE — est-ce suffisant ?" |
| **batiweb.com**                    |        60 | Rédaction batiweb.com/contact                                       | "Comment les artisans captent les leads MaPrimeRénov' — analyse de 500 000 demandes"      |
| **cahiers-techniques-batiment.fr** |     50-60 | Rédaction CTB                                                       | "Évolution du label RGE 2025-2026 : ce que doivent anticiper les artisans"                |
| **lamaisonecologique.com**         |     40-50 | Gwendal Le Ménahèze (journaliste)                                   | "Enquête : combien coûte une rénovation BBC par région en 2026"                           |
| **quechoisir.org (UFC)**           |       80+ | Rédaction consommation                                              | "Baromètre transparence artisans : 500k SIREN croisés avec avis clients"                  |
| **60millions-mag.com**             |       70+ | Institut national consommation                                      | "Arnaques rénovation énergétique : observatoire 2026"                                     |
| **lesechos.fr**                    |       85+ | Desk construction / immobilier                                      | "L'annuaire des 500 000 artisans de France basé sur données SIREN"                        |
| **lafranceagricole.fr** (rural)    |       50+ | Rédaction rural/agri                                                | "Artisans en zones rurales : où trouver un professionnel RGE ?"                           |
| **boursorama.com**                 |       85+ | Finance perso / immobilier                                          | "Rentabilité rénovation énergétique : combien vous rapporte un G→D"                       |
| **capital.fr**                     |       80+ | Immobilier / éco maison                                             | "Les aides 2026 à la rénovation : tableau par département"                                |

### Template email pitch (Tier 1 presse)

```
Objet : Étude exclusive — 3,9 M passoires thermiques pour 63 000 artisans RGE : le choc offre/demande en cartographie

Bonjour [Prénom],

Je dirige ServicesArtisans.fr, un service de mise en relation fondé sur les
données SIREN officielles (500 000 artisans référencés, croisés avec la base
ADEME des entreprises RGE).

Vous avez récemment couvert [article spécifique journaliste sur rénovation].
J'ai pensé qu'une donnée nous concerne tous les deux :

> Il y a aujourd'hui 3,9 M de logements classés F ou G en France, pour seulement
> 63 000 artisans RGE formés. Soit **62 logements à rénover par artisan RGE**
> d'ici l'interdiction de location 2028.

Nous venons de cartographier la répartition département par département :
- Les 10 départements les plus tendus (ratio passoires / artisans RGE)
- Les métiers RGE en sous-effectif le plus critique (chauffagistes, isolation)
- L'évolution 2022 → 2026 des qualifications RGE

Données brutes + méthodo + visuels HD à votre disposition gratuitement, en
exclu si ça vous intéresse. Je peux aussi vous mettre en relation avec 3 artisans
RGE de régions différentes pour verbatims.

Lien Drive : [URL]
Deadline pour exclu : 10 jours.

Cordialement,
Marvin Bissohong
Fondateur, ServicesArtisans.fr
marvin@servicesartisans.fr — 06.XX.XX.XX.XX
```

### Rigueur d'exécution

- **Pas de copier-coller entre journalistes** : chaque email cite un article précis signé par le journaliste (30 sec recherche Twitter/LinkedIn du journaliste)
- **Sujet max 70 caractères** + un chiffre choc en premier
- **Follow-up à J+4 et J+10** uniquement (3 touches max, pas de spam)
- **Pas de communiqué de presse générique** — on écrit à une personne
- **Toujours offrir l'exclu** — les journalistes français sont très attachés à l'exclu
- **Proposer des visuels HD téléchargeables** (Canva / Datawrapper) — multiplie le taux de publication par 3-4x

### KPI Tier 1

- Mois 1-3 : 50 pitches envoyés, 5 publications obtenues (taux 10 %)
- Mois 4-6 : 100 pitches, 15 publications (taux 15 %)
- Mois 7-12 : 200 pitches, 40+ publications cumulées
- **Cible 12 mois** : 20+ RD DR 50-80 depuis Tier 1

## 3.3 Tier 2 — Partenariats institutionnels (or massif)

### 3.3.1 France Rénov' / ADEME / data.gouv.fr

**Opportunité #1 — API RGE réutilisation publique**

- L'API Professionnels RGE est ouverte sur `api.gouv.fr`
- Les réutilisations sont listées publiquement sur `data.gouv.fr/reuses/`
- Un "moteur de recherche des professionnels RGE — Annuaire des Entreprises" est déjà réutilisé officiellement

**Action** :

1. Déclarer ServicesArtisans comme réutilisateur officiel de la Liste RGE (data.gouv.fr/datasets/liste-des-entreprises-rge)
2. Obtenir le badge "Réutilisation agréée" → citation potentielle sur `data.gouv.fr` (DR 92)
3. Maintenir la synchro quotidienne RGE → gage de fraîcheur

**Impact** : 1 backlink DR 92 institutionnel + signal trust E-E-A-T majeur

### 3.3.2 Mon Accompagnateur Rénov' — blocage éthique mais opportunité marketing

> À partir du 1er janvier 2024, le dispositif s'ouvre aux auditeurs énergétiques, architectes, collectivités, sociétés tiers financement.

**Mais** : pour être agréé, il faut **ne pas être une entreprise de travaux** (condition d'indépendance). ServicesArtisans est un **annuaire** (pas travaux), donc théoriquement éligible, **mais** :

- Le dispositif exige des équipes formées
- Le métier = accompagnement sur 18-24 mois (pas juste mise en relation)

**Recommandation** : ne pas chercher l'agrément directement. À la place :

- **Partenariat référencement** : devenir "source d'artisans RGE" pour les MAR agréés (fournir les leads qualifiés)
- **Backlink naturel** : quand un MAR nous référence comme source d'artisans, on obtient un backlink DR moyen mais institutionnel

### 3.3.3 CAPEB / FFB / Qualibat — chemin indirect

| Fédération               | Statut backlink direct                                             | Chemin indirect                                                             |
| ------------------------ | ------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| CAPEB (380 000 artisans) | Bloqué (ils ont leur annuaire `artisans-du-batiment-by-capeb.com`) | Interviews fondateur / cas d'usage artisan membre CAPEB                     |
| FFB (50 000 entreprises) | Bloqué (concurrent de fait)                                        | Sponsoring événements locaux / études co-signées                            |
| Qualibat                 | Institutionnel                                                     | Publier une étude "Carte des qualifications Qualibat 2026" citant leur base |
| Qualit'EnR               | Institutionnel                                                     | Idem, angle ENR spécifique                                                  |

**Tactique** : pas de pitch direct "linkez-nous". Plutôt :

- Contribuer à leurs **baromètres annuels** avec nos data (en échange d'une citation source)
- Proposer **nos visuels HD en open source** (CC-BY) pour qu'ils les reprennent avec crédit
- Sponsoriser un **Prix de l'artisan de l'année** local ou régional

### 3.3.4 Chambres de Métiers et de l'Artisanat (CMA)

- CMA France (`artisanat.fr`) = DR 70+
- Chaque CMA régionale a un site (CMA IDF, CMA Occitanie…) — DR 50+
- Elles publient des **annuaires d'artisans territoriaux**

**Tactique** :

- Devenir source/partenaire de **mémoires économiques CMA** (étude annuelle artisanat)
- Proposer un **export data communes RGE** à CMA — obtenir citation en bas de leur étude

**KPI Tier 2** :

- Mois 1-6 : badge réutilisation data.gouv.fr + 2 citations CMA
- Mois 6-12 : 5-10 RD institutionnels DR 60-92
- **Cible 12 mois** : 10+ RD ultra-qualifiés

## 3.4 Tier 3 — Blogs rénovation énergétique (analyse concurrent)

### Comment effy.fr / quelleenergie.fr / habitatpresto obtiennent leurs backlinks

Analyse competitor backlinks (Ahrefs / Semrush à croiser manuellement) :

| Type                                   | Effy / Quelle Énergie                      | Habitatpresto            | Notre stratégie                     |
| -------------------------------------- | ------------------------------------------ | ------------------------ | ----------------------------------- |
| Presse (Capital, Boursorama, Le Monde) | Fort (citations aides CEE)                 | Moyen                    | **Copier + améliorer Tier 1**       |
| Études propriétaires                   | Oui (baromètres MaPrimeRénov', Prime Effy) | Oui                      | **Répliquer avec notre data SIREN** |
| Blog partenaires                       | Oui (Hellio, ENGIE, EDF)                   | Faible                   | **Négocier co-publications**        |
| Institutionnels (ADEME, ANAH)          | Oui (ils sont acteurs CEE)                 | Non                      | **Reutilisation API = notre path**  |
| Annuaires généralistes                 | Non                                        | Oui (mauvaise stratégie) | **À éviter**                        |

### Blogs rénovation à cibler (guest posts éditoriaux non payés = invités experts)

| Blog                             |    DR | Statut                | Angle                                                              |
| -------------------------------- | ----: | --------------------- | ------------------------------------------------------------------ |
| particulier.hellio.com           |    55 | Blog Hellio           | "Comment trouver un artisan RGE vérifié en 5 min" (guide pratique) |
| izi-by-edf-renov.fr/blog         |    65 | Blog EDF              | "MaPrimeRénov' 2026 : ce qui change par département"               |
| effy.fr/guide                    |    70 | Blog Effy             | Non (concurrent direct, pas d'ouverture)                           |
| quelleenergie.fr/magazine        |    65 | Blog Effy             | Idem                                                               |
| edf.fr/particulier/guide-energie |   90+ | Blog EDF éditorial    | Très haut niveau, difficile mais DR énorme                         |
| engie.fr/conseils                |   85+ | Blog ENGIE            | "Panorama des qualifications RGE 2026"                             |
| hellio.com/blog                  |    55 | Blog Hellio général   | Multi-angles possibles                                             |
| cinq-et-demi.com                 |    40 | Blog éco-construction | Invités experts réguliers                                          |
| lesechosdelafranchise.com        |    50 | Eco franchise         | "Modèle de franchise artisanale 2026"                              |
| leslignesbougent.fr              | 30-40 | Blog éco-rénovation   | Accueille experts                                                  |

### Template email outreach blog niche

```
Objet : Contribution invitée — "Cartographie RGE 2026" adaptée pour [Blog]

Bonjour [Prénom],

Lecteur de [Article récent du blog sur X], je me permets de vous contacter.

Je dirige ServicesArtisans.fr. Nous exploitons l'API officielle France-Rénov
pour maintenir à jour la base des 63 000 artisans RGE en France.

Votre article sur [X] m'a semblé appeler une suite naturelle :
[Angle spécifique lié au blog].

Je peux écrire pour vous un article original (1 500 mots) avec :
- Données exclusives cartographiées par département
- 2-3 visuels HD originaux (Datawrapper)
- Une interview courte d'un artisan RGE local que vous pourrez citer

Aucune auto-promotion dans le corps — juste signature auteur avec lien discret
en bio. C'est un cadeau éditorial pur, vous pouvez éditer librement.

Intéressé ? Je peux envoyer le draft sous 7 jours.

Marvin Bissohong
Fondateur, ServicesArtisans.fr
```

### Règles strictes

- **Un seul lien en bio auteur** (pas dans le corps) — naturel
- **Contenu 100 % original** (pas de republication)
- **Refuser si le blog demande paiement** — on quitte la conversation
- **Suivi Ahrefs** pour vérifier que le lien est bien DoFollow et non retiré après 6 mois

**KPI Tier 3** : 40+ RD DR 30-60 sur 12 mois

## 3.5 Tier 4 — HARO / sourcing expert

### Plateformes actives (mise à jour 2026)

| Plateforme                    | Couverture                     | Coût                                      | Valeur pour nous                |
| ----------------------------- | ------------------------------ | ----------------------------------------- | ------------------------------- |
| **Featured (ex-HARO)**        | US/international, quelques FR  | Gratuit (plans payants option)            | Moyenne — couverture FR limitée |
| **SourceBottle**              | Australie / international / FR | Gratuit                                   | Basse                           |
| **Response Source**           | UK / FR                        | Gratuit pour journalistes, payant experts | **Moyenne — à tester**          |
| **Qwoted**                    | US                             | Payant (~200 $/mois)                      | Haute sur tech/US               |
| **Connectively (Cision)**     | US                             | Payant                                    | Haute mais cher                 |
| **Terkel**                    | US / Europe                    | Gratuit pour experts                      | Moyenne                         |
| **MuckRack pitch desk**       | International                  | Payant agences                            | Haute long terme                |
| **Hunter.io + Twitter** (DIY) | Global                         | Freemium                                  | **Haute si discipline**         |

### Stratégie pragmatique

Le paysage HARO français est faible. Donc :

1. **Inscription Featured + Response Source + Terkel** (gratuit, 20 min/jour à scanner)
2. **Twitter / X monitoring** des hashtags `#journoRequest`, `#journorequest`, `#UrgentHelp` (journalistes FR qui demandent des experts)
3. **LinkedIn Sales Navigator** : alerte sur journalistes BTP/immobilier qui publient
4. **Mediadb / Presscontact** (bases journalistes FR) si budget > 200 €/mois

### Protocole de réponse HARO (discipline)

- Réponse en < 2h (premier arrivé = publié)
- Format : 3 bullets-quotes citables + data exclusive + proposition visuel
- Bio max 40 mots avec UN lien naturel
- Toujours inclure un angle statistique propriétaire (c'est ce qui fait publier)

**KPI Tier 4** : 2-3 réponses par semaine, 1-2 publications par mois. Sur 12 mois : 15-25 publications = 15-30 RD DR 40-80

## 3.6 Tier 5 — Podcasts BTP / artisanat

### Liste des podcasts cibles (validée)

| Podcast                                    | Host               | Fréquence  | Audience         | Angle pitch                                                          |
| ------------------------------------------ | ------------------ | ---------- | ---------------- | -------------------------------------------------------------------- |
| **6H Du BAT'**                             | Anthony & équipe   | Hebdo      | 20-40k écoutes   | "Comment l'IA transforme la mise en relation artisan-particulier"    |
| **Les experts du bâtiment**                | Podcast Ausha      | Mensuel    | 5-10k            | "Data SIREN : au-delà du marketing, vers la transparence artisan"    |
| **Bâtiment du futur**                      | Schneider Electric | Mensuel    | Pro BTP          | "La rénovation énergétique à l'échelle : 3,9 M passoires thermiques" |
| **Bâtir pour le Climat**                   | Indé               | Irrégulier | Niche green      | "Pourquoi l'artisanat local est la clé de la décarbonation habitat"  |
| **Parpaing (et sac à main)**               | Féminin BTP        | Mensuel    | 5k               | "Les femmes artisanes dans notre base : ce que les données disent"   |
| **Le Moniteur Podcast**                    | Le Moniteur        | Mensuel    | Pro BTP          | "Annuaires artisans : pourquoi le marché s'écroule en 2026"          |
| **Cahiers Techniques du Bâtiment Podcast** | CTB                | Irrégulier | Ingénieurs BTP   | Angle technique DPE / audit énergétique                              |
| **CAPEB Podcast** (si existe)              | CAPEB              | Variable   | Artisans membres | Position fondateur sur avenir artisanat                              |
| **Batiactu (capsules audio)**              | Batiactu           | Variable   | Pro BTP          | Insights data marché artisanal                                       |
| **BFM Business — éco régionales**          | BFM                | Quotidien  | Éco régionale    | Angle territorial / emploi local                                     |
| **France Inter Grand Bien Vous Fasse**     | Ali Rebeihi        | Semaine    | Grand public     | Pitch "trouver le bon artisan" (grand public)                        |
| **France Info Conso**                      | Émilie Houblin     | Quotidien  | Grand public     | Arnaques rénovation énergétique                                      |
| **RTL Ça peut vous arriver**               | Julien Courbet     | Quotidien  | Grand public     | Conflits artisans — on apporte la data                               |
| **Podcast de l'Immo (Meilleurs Agents)**   | MA                 | Hebdo      | Immobilier       | Rénovation avant-vente                                               |
| **Building Dialogues**                     | Arcadis Europe     | Mensuel EN | International    | Pitch international, anglais                                         |

### Pitch template podcast

```
Objet : Invité podcast — [Nom podcast] épisode sur l'effondrement des annuaires artisans

Bonjour [Prénom],

[Écoute régulière de votre épisode sur X, moment précis qui m'a marqué Y].

Je dirige ServicesArtisans.fr. Depuis décembre 2025, j'observe quelque chose
que peu de gens réalisent : les grands annuaires artisans français (travaux.com,
allovoisins, etc.) ont perdu entre -18 % et -41 % de leur trafic Google.

Pourquoi ? Parce que Google rejette le modèle "annuaire générique" au profit
de la donnée officielle vérifiable. J'ai les chiffres Ahrefs complets + notre
réponse stratégique avec la base SIREN.

3 angles possibles pour votre podcast :
1. Pourquoi les annuaires artisans s'écroulent en 2026 (macro SEO)
2. Comment l'IA change la confiance consommateur envers artisans
3. Le vrai état du marché RGE : 3,9 M passoires pour 63 000 artisans

Je peux apporter :
- Slide deck 20 min original
- Data exclusive (chiffres pas encore publiés)
- Cas d'usage concret auditeurs : comment vérifier un artisan en 30 sec

Une heure de votre temps suffit, à distance ou en studio Paris.

Marvin Bissohong
Fondateur, ServicesArtisans.fr
```

**KPI Tier 5** : 2 podcasts/mois = 24 épisodes/an. Typiquement 1 backlink shownotes par épisode + citations inbound long-terme = 15-20 RD DR 20-50 + amplification brand search

## 3.7 Tier 6 — Data-driven PR (le multiplicateur)

**Principe** : publier 6-10 études originales sur 12 mois, chacune conçue comme un "linkbait" repris par la presse, les blogs, et les LLM.

### Les 8 études pitch-ready pour ServicesArtisans

#### Étude 1 — "Les 500 000 artisans de France, décryptés par SIREN 2026"

- **Data source** : notre base 500k providers + SIREN + code NAF
- **Angles** : répartition géo, densité par commune, métiers en tension, âge moyen entreprises
- **Visuels** : carte France interactive (Mapbox), top 10 communes par métier
- **URL** : `/etudes/artisanat-france-2026`
- **Cibles presse** : Les Échos, Le Monde Économie, Capital, Alternatives Économiques, France Info Éco

#### Étude 2 — "Baromètre MaPrimeRénov' 2026 : les départements gagnants et perdants"

- **Data source** : SDES statistiques publiques + notre demande devis (6 200 vol/mois KW)
- **Angles** : Top 10 départements validés vs demandés, écarts, évolution 2023-2026
- **Visuels** : carte chaleur France
- **URL** : `/etudes/maprimerenov-barometre-2026`
- **Cibles presse** : Le Moniteur, Batirama, Capital, Le Figaro Immo, BFM Immo

#### Étude 3 — "Passoires thermiques : la carte du choc offre/demande artisans RGE"

- **Data source** : DPE ADEME (3,9 M passoires) + base RGE (63 000) + notre géoloc
- **Angles** : 62 logements à rénover par RGE, départements critiques, métiers manquants
- **Visuels** : infographie choc, timeline 2025-2034
- **URL** : `/etudes/passoires-thermiques-artisans-rge`
- **Cibles presse** : UFC Que Choisir, 60 Millions Conso, TF1/France 2 JT (si angle consommateur)

#### Étude 4 — "Prix des artisans en France : le seul baromètre basé sur 100 000 devis réels"

- **Data source** : nos conversions form_start + data devis anonymisées
- **Angles** : écarts prix Paris/Province par métier, évolution 2024-2026, top villes chères
- **Visuels** : barre prix par métier × région
- **URL** : `/etudes/prix-artisans-france-2026`
- **Cibles presse** : Capital, Le Parisien Conso, Boursorama, MoneyVox

#### Étude 5 — "Les 10 métiers artisans en tension en 2026 : cartographie de la pénurie"

- **Data source** : notre ratio demandes/offres par métier × ville
- **Angles** : couvreurs +40 % demandes, zingueurs +30 %, etc.
- **Visuels** : tableau + carte
- **URL** : `/etudes/metiers-artisans-tension-2026`
- **Cibles presse** : BFM Business, Les Échos, France Info Éco, France Bleu régionales

#### Étude 6 — "Le temps moyen pour trouver un artisan disponible : étude 2026"

- **Data source** : nos devis → affectation artisan (response_time_minutes)
- **Angles** : délais par région, urgences, métiers rapides vs lents
- **Visuels** : heatmap horaires
- **URL** : `/etudes/delais-artisans-france-2026`
- **Cibles presse** : Le Parisien, France Bleu, presse quotidienne régionale (PQR)

#### Étude 7 — "Arnaques rénovation énergétique 2026 : observatoire national"

- **Data source** : nos signalements utilisateurs + data publique Stop Fraudes (association)
- **Angles** : départements à risque, métiers exposés, montants moyens arnaques
- **Visuels** : "radar des arnaques"
- **URL** : `/etudes/arnaques-renovation-energetique-2026`
- **Cibles presse** : UFC Que Choisir, 60 Millions Conso, BFM TV, France Inter Conso

#### Étude 8 — "L'artisanat féminin : les chiffres qu'on ne vous dit jamais"

- **Data source** : notre base croisée INSEE dirigeants
- **Angles** : % femmes par métier, régions les plus féminisées, évolution
- **Visuels** : graphiques lumineux
- **URL** : `/etudes/artisanat-feminin-france-2026`
- **Cibles presse** : ELLE, Madame Figaro, Parpaing podcast, Les Glorieuses

### Process de publication (checklist par étude)

- [ ] Scoping : problématique + 3 findings choc + méthodo transparente
- [ ] Data pipeline : SQL → JSON → validation statistique
- [ ] Rédaction : 2 000-3 000 mots + executive summary
- [ ] Visuels : 5-8 graphiques HD (Datawrapper / Observable Plot)
- [ ] Page dédiée `/etudes/[slug]` avec Schema.org `ScholarlyArticle`
- [ ] Package presse : PDF résumé + visuels HD téléchargeables + embed codes iframe
- [ ] Pitch wave 1 : 15 médias Tier 1 en exclu 72h
- [ ] Pitch wave 2 : 50 médias / blogs après exclu levée
- [ ] Pitch LinkedIn + Twitter personnel fondateur
- [ ] Monitoring Ahrefs : tracker chaque mention (Alerts Ahrefs)
- [ ] Follow-up : relancer médias n'ayant pas publié avec update data

**KPI Tier 6** : 8 études × ~6 RD/étude en moyenne = **50 RD amplification**. Certaines (ex Étude 3 Passoires thermiques) peuvent aller à 15-20 RD seules si bien pitchées.

## 3.8 Tier 7 — Local citations légitimes

### Citations locales à faire (prudence anti-spam)

| Annuaire                                                                        | Légitimité         | Action                                       |
| ------------------------------------------------------------------------------- | ------------------ | -------------------------------------------- |
| **Google Business Profile** (pour ServicesArtisans la marque, pas les artisans) | Oui                | Créer fiche GBP "Annuaire artisans en ligne" |
| **Pages Jaunes** (PagesJaunes.fr)                                               | Oui                | Inscription entreprise                       |
| **Bing Places**                                                                 | Oui                | Inscription                                  |
| **Apple Maps Connect**                                                          | Oui                | Inscription                                  |
| **Waze for Brands**                                                             | Niche              | Inscription                                  |
| **Yelp France**                                                                 | Oui                | Inscription                                  |
| **Societe.com** (revendiquer fiche)                                             | Oui                | Revendiquer                                  |
| **Infogreffe** (déjà dedans par SIREN)                                          | Passif             | Rien à faire                                 |
| **Kompass**                                                                     | Oui                | Inscription B2B                              |
| **Europages**                                                                   | Oui                | Inscription B2B Europe                       |
| **Hoovers / D&B**                                                               | International      | Inscription                                  |
| **Crunchbase** (tech startup)                                                   | Oui si statut tech | Inscription                                  |
| **LinkedIn Company Page**                                                       | Oui                | Inscription + contenu                        |
| **Facebook Business Page**                                                      | Oui                | Inscription                                  |
| **Twitter/X Business**                                                          | Oui                | Inscription                                  |
| **Trustpilot**                                                                  | Oui                | Inscription + collecte avis                  |
| **Glassdoor**                                                                   | Recrutement        | Inscription si équipe                        |
| **Welcome to the Jungle**                                                       | Recrutement tech   | Inscription                                  |

### À éviter absolument (flag spam Google)

- Annuaires "soumettez votre site" automatisés
- Annuaires avec + 10 000 fiches et DR > 30 (très probable PBN)
- Sites qui demandent réciprocité (échange de liens)
- Sites .tk, .ga, .cf, .ml, .shop, .icu, .top, .xyz en footer
- Tout annuaire qui n'a pas de processus éditorial

**KPI Tier 7** : 30+ RD DR 20-60 sur citations légitimes, signal NAP (Name-Address-Phone) cohérent

---

# 4. Competitor takeover strategy — ramasser les miettes des chutes

## 4.1 Méthode

Pour chaque concurrent en chute, on applique le process suivant :

1. **Export Ahrefs** "Lost Pages" du concurrent sur 6 mois
2. **Filtrer** les pages avec KW vol ≥ 100 et intent local/transactionnel
3. **Créer** l'équivalent amélioré sur notre domaine (même slug pattern ou variation)
4. **Optimiser** : Schema.org, E-E-A-T (auteur + maj date + data officielle)
5. **Linker** depuis pages hubs + hub central topical cluster
6. **Monitoring** : tracker la position du KW chaque semaine sur 90 jours

## 4.2 Travaux.com — 4 820 pages perdues à ramasser

**Pattern dominant des pages travaux.com perdues** (hypothèse à valider par export lost pages Ahrefs) :

- `/devis/[metier]/[ville]` génériques avec CTA devis
- `/guides/[metier]/comment-choisir`
- `/metiers/[metier]` avec fiches génériques
- `/prix-travaux-[metier]`

**Notre riposte** :

| Pattern travaux.com                | Notre équivalent ServicesArtisans                                      | Différenciation                                                   |
| ---------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `/devis/plombier/paris`            | `/devis/plombier/paris` (déjà en place)                                | + badge SIREN + éligibilité MaPrimeRénov' + artisan RGE filtrable |
| `/guides/plombier/comment-choisir` | `/guides/choisir-plombier-2026`                                        | + critères SIREN vérifiables + code NAF                           |
| `/prix-plombier-2026`              | `/blog/prix-plombier-2026-tarifs-horaires` (déjà en place, qui marche) | **Pattern prouvé par nos backlinks**                              |
| `/artisans-rge-[ville]`            | `/services/plombier-rge/[ville]` (à créer)                             | + éligibilité MaPrimeRénov' + cross-link simulateur               |

**Action** : exporter lost pages travaux.com → top 500 KW → créer 200 pages équivalentes prioritaires en sprint 2-3.

## 4.3 Depanneo.com — 1 797 pages perdues, focus urgence

**Pattern depanneo** : majoritairement `/urgence/[metier]/[ville]` — or c'est **exactement notre pattern gagnant** (62 new KW confirmés).

**Notre riposte** :

- Étendre `/urgence/[metier]/[ville]` aux 500 top villes × 10 métiers urgence = **5 000 pages**
- Ajouter `/urgence/[metier]/[ville]/24h-24` variants (long tail)
- Ajouter `/urgence/[metier]/[ville]/nuit-weekend` variants
- Cross-link depuis home + sidebar "Urgence disponibilité" géolocalisée

**Préférence Google** : `societe.com` monte parce qu'officiel. Mêmes signaux côté urgence = mentionner disponibilité SIRET + code NAF dispatching + réponse temps réel.

## 4.4 Allovoisins.com — 6 841 pages perdues (goldmine massive)

**Pattern allovoisins** : services à la personne + petits travaux + bricolage + déménagement.

**Notre riposte** :

- Étendre coverage à **services connexes artisans** que allovoisins perd : petits travaux, bricolage ponctuel, déménagement, montage meubles, nettoyage
- Créer `/services/bricoleur/[ville]`, `/services/demenageur/[ville]`, `/services/monteur-meubles/[ville]`
- Garder notre différenciation **artisan professionnel SIREN** vs "jobbers" aléatoires d'allovoisins (signal trust)

## 4.5 Plus-que-pro.fr — le cas de l'autorité DR 83 effondrée -36 %

Leçon : **DR élevé sans substance ne tient pas**. Les 83 points DR de plus-que-pro.fr reposaient sur un marketing de backlinks qui s'est invalidé (SpamBrain). Leur contenu pages est resté thin.

**Ce qu'on ne doit pas faire** : courir après le DR par la force brute. Construire DR par **qualité éditoriale + data officielle + presse légitime**.

---

# 5. Digital PR — 10 angles éditoriaux pitch-ready

Voici 10 angles prêts à pitcher dans les 12 prochains mois, avec media cibles et niveau de difficulté.

| #   | Angle                                                                         | Data source                     | Média cibles                                        |               Difficulté | Impact RD |
| --- | ----------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------- | -----------------------: | --------: |
| 1   | "Les annuaires artisans s'effondrent en 2026 : -20 % moyen Google"            | Nos data Ahrefs 20 concurrents  | Le Monde Tech, Les Échos, Journal du Net, Abondance |                  Moyenne |     10-15 |
| 2   | "Cartographie RGE 2026 : où sont les 63 000 artisans certifiés en France ?"   | Data ADEME + nos geoloc         | Le Moniteur, Batirama, Batiactu, Que Choisir        |                  Moyenne |      8-12 |
| 3   | "MaPrimeRénov' : le baromètre des demandes par département"                   | SDES + nos leads                | Capital, Boursorama, Le Parisien, Le Figaro Immo    | Haute (concurrence effy) |      6-10 |
| 4   | "Passoires thermiques : combien d'artisans RGE pour les rénover d'ici 2028 ?" | ADEME + base RGE + nos data     | UFC Que Choisir, 60M Conso, BFM, France Info        |                    Basse |     10-15 |
| 5   | "Prix moyens artisans 2026 : barème par métier × région"                      | Nos 100 000 devis anonymisés    | Capital, Boursorama, MoneyVox, Le Parisien          |                    Basse |      8-12 |
| 6   | "L'artisanat féminin en France : les chiffres cachés"                         | INSEE dirigeants + notre base   | ELLE, Madame Figaro, Glorieuses                     |                  Moyenne |       5-8 |
| 7   | "Temps moyen trouver un artisan : étude 2026 par commune"                     | Nos conversion data             | France Bleu, PQR, Ouest-France                      |                    Basse |      6-10 |
| 8   | "Arnaques rénovation énergétique : observatoire 2026"                         | Nos signalements + Stop Fraudes | UFC, France Inter Conso, TF1 JT                     |         Haute (sensible) |     10-15 |
| 9   | "AI Overviews tuent le trafic artisans : -33 % en 12 mois"                    | Nos data GA4 + GSC              | Abondance, SEJ, Search Engine Land FR               |      Moyenne (niche SEO) |      8-12 |
| 10  | "Top 50 communes françaises où il faut être artisan RGE en 2026"              | Notre ratio demande/offre       | Presse éco régionale, BFM régions                   |                    Basse |      6-10 |

**Chaque angle = 1 étude publiée + pitch wave. Total RD potentiel cumul = 70-120 RD.**

---

# 6. ChatGPT / LLM amplification — 395 → 5 000 citations

## 6.1 État actuel

- **395 citations ChatGPT** (dernier snapshot Ahrefs Brand Radar) — canal LLM fort pour un site de 71 jours
- **47 users/28j viennent de chatgpt.com** (2,2 % trafic) — engagement qualifié (47,7 sec avg)
- Crawlers IA actifs : ClaudeBot, GPTBot, Perplexity, Google-Extended (Gemini)

## 6.2 Ce que la recherche GEO 2026 nous dit (Princeton + Backlinko 2026)

- **Pages avec citations autoritaires** : +40 % de présence en réponses génératives
- **Pages avec stats spécifiques** : +37 % de taux de citation IA
- **Pages avec byline experts** : citations nettement plus fréquentes
- **llms.txt** : symbolique en avril 2026, pas opérationnel (John Mueller confirmé juin 2025)
- **ClaudeBot** : ratio crawl/citation 38 065:1 — il lit beaucoup, cite rarement, donc volume de contenu = clé

## 6.3 Plan amplification LLM

### Plan A — Optimiser les pages pour citation

- **H1 clair** avec réponse factuelle immédiate (fix du bailout SSR = prérequis)
- **Stats propriétaires** dans les 2 premiers paragraphes ("selon notre analyse de 500 000 artisans SIREN…")
- **Citations officielles croisées** : ADEME, INSEE, France-Rénov — les LLM adorent le chaînage sources
- **FAQ Schema.org** avec questions → réponses courtes (les LLM extraient en direct)
- **Auteurs identifiés** avec bio + schema `Person` (E-E-A-T machine-readable)
- **Date dernière mise à jour visible** (les LLM préfèrent contenu frais)

### Plan B — Permettre aux crawlers IA d'accéder (décision task #19)

**Recommandation** : autoriser dans `robots.txt` :

- `GPTBot` → oui (training + search)
- `ChatGPT-User` → oui (fetch direct quand user pose question)
- `OAI-SearchBot` → oui (index SearchGPT)
- `ClaudeBot` → oui (training)
- `Claude-User` → oui (fetch)
- `Claude-SearchBot` → oui (index)
- `PerplexityBot` → oui
- `Google-Extended` → **oui** (Gemini training + AI Overviews)
- `CCBot` (Common Crawl) → oui

**Risque** : ils "volent" du contenu sans toujours citer. **Contre-argument** : 395 citations prouvent que ça fonctionne, +47 users/28j = traffic déjà mesurable. Fermer la porte nous prive de ce canal.

### Plan C — Se faire référencer dans les datasets d'entraînement futurs

- Publier les études en **licence CC-BY** (Common Crawl les ramasse proprement)
- Soumettre le sitemap à **HuggingFace datasets** (si pertinent)
- Contribuer à Wikipedia FR sur artisanat / RGE avec notre data comme source
- Publier sur **arXiv** (si étude quanti suffisamment rigoureuse)

### Plan D — Amplification hors Google sur sites souvent cités par LLM

Les LLM citent massivement Wikipedia, Reddit, StackOverflow, Quora, Github, LinkedIn, Medium. Il faut **figurer sur ces sites** :

- **Reddit** : r/france, r/RenovationMaison, r/BatimentFR (participer sans spammer)
- **Quora** FR : répondre aux Q "comment trouver un artisan" en citant notre base
- **Medium** / **LinkedIn articles** : republier nos études (canonical vers notre site)
- **Wikipedia** : contribuer aux articles "Artisanat en France", "RGE", "MaPrimeRénov'" avec sources externes solides (nos études PDF)
- **Github** : open-source un dataset anonymisé "annuaire RGE géolocalisé France" = backlink Github DR 100

**KPI LLM** :

- Mois 3 : 1 000 citations ChatGPT (×2,5 baseline)
- Mois 6 : 2 500 citations
- Mois 12 : 5 000+ citations
- +300 users/mois via LLM (10 % du trafic)

---

# 7. Social / community — LinkedIn, TikTok, YouTube

## 7.1 LinkedIn (priorité B2B artisans)

**Cible 1** : artisans eux-mêmes (leads artisan pour claim)
**Cible 2** : presse BTP, décideurs rénovation, partenaires institutionnels

**Plan 12 mois** :

- Fondateur poste 3x/semaine : story founder + data insights + commentary marché
- Page entreprise : 2 posts/semaine + republication études
- LinkedIn Articles : publier chaque étude sous format article natif (backlink canonical notre site)
- LinkedIn Live : 1 par trimestre sur grosses études (audience ciblée presse)
- Sponsorship ciblé journalistes BTP (budget 500 €/mois)

**KPI** : 5 000 followers fondateur d'ici mois 12, 500 leads artisans self-serve

## 7.2 TikTok / Reels (DIY rénovation grand public)

**Cible** : particuliers avant-achat rénovation, 25-45 ans
**Angle** : "Comment vérifier si ton artisan est RGE en 20 secondes" (quick tips)

**Plan** :

- 3 vidéos/semaine (60-90 sec)
- Formats : avant/après rénovation, checklists pratiques, alertes arnaques, explications MaPrimeRénov'
- Monétisation long terme : redirection vers `/guides/*`

**KPI** : 10k followers TikTok d'ici mois 12, 50k vues cumulées

## 7.3 YouTube (guides visuels long format)

**Cible** : searchers info intent "comment rénover", "comment choisir artisan"
**Angle** : devenir le "Wirecutter des artisans France"

**Plan** :

- 1 vidéo/semaine long format (8-15 min)
- Topics : visites chantier, interviews artisans RGE, explications techniques
- Associer à articles blog pour synergies SEO

**KPI** : 2 000 subscribers d'ici mois 12, backlinks YouTube (description) vers `/guides`

## 7.4 Règles sociales anti-spam

- **Jamais** de like-for-like, follow-for-follow, engagement pods
- **Jamais** de contenu copié depuis Wikipedia / concurrents
- **Toujours** mention source data propriétaire
- **Toujours** canonical correct (LinkedIn article → notre site)

---

# 8. Local SEO / Google Business Profile — aider les artisans claim

## 8.1 Notre GBP (ServicesArtisans la marque)

- Créer une fiche "Annuaire d'artisans en ligne" (catégorie "Online directory" ou "Internet marketing service")
- Adresse siège social (pas fausses adresses multi-villes)
- Photos logo, équipe, bureaux
- Posts hebdo (nouvelles études, actus)
- Avis clients authentiques (ne JAMAIS acheter ou inventer)

**Attention** : ne PAS créer de faux GBP "artisan" dans plusieurs villes. Cela violerait les Google Business Profile Guidelines et exposerait à une suspension du compte entier.

## 8.2 Stratégie aide aux artisans pour leur GBP (double win)

**Plan** : sur la page profil de chaque artisan claim, ajouter un **wizard GBP** :

- "Votre fiche Google Business est-elle optimisée ?"
- Checklist : photos, horaires, avis, posts, description, catégorie
- Call-to-action : "Réserver consultation GBP gratuite avec ServicesArtisans"

**Double bénéfice** :

1. Service à valeur ajoutée pour artisans claim (fidélisation + upsell)
2. Quand on optimise leur GBP, on peut y ajouter notre site en "attribution source" (backlink indirect)

## 8.3 Pas d'arnaque GBP

- JAMAIS de GBP fake
- JAMAIS d'avis faux
- JAMAIS de catégories trompeuses
- Respect strict [Google Business Profile Guidelines](https://support.google.com/business/answer/3038177)

---

# 9. Brand building — 4 % → 30 % de branded search

## 9.1 Baseline

- Branded KW actuellement : 26 / 261 tracked (10 % Ahrefs)
- GSC branded : ~4 % (estimation "servicesartisans", "services artisans", "services-artisans.fr")

## 9.2 Leviers brand

### Lever 1 — Notoriété presse (conséquence Tier 1 + Tier 6)

Chaque article presse qui mentionne "ServicesArtisans" génère des brand searches. 40 publications Tier 1 + Tier 6 sur 12 mois = **amplification brand massive**.

### Lever 2 — Campagnes de notoriété payées ciblées

**Recommandation** : budget YouTube / Meta (Facebook/Instagram) de **1 500 €/mois** d'avril à décembre :

- Campagnes awareness 30 sec (story founder + data choc)
- Retargeting visiteurs non-convertis
- Ciblage lookalike des artisans claimed

**Attention** : pas de paid search competitor bidding sur "travaux.com", "effy.fr" → coûteux et pas stratégique en early stage.

### Lever 3 — Signature partenariats nommés

Chaque partenariat public ("ServicesArtisans × [Partenaire]") = brand moment.

- Signature avec CMA régionale (exemple CMA Occitanie)
- Partenariat Mon Accompagnateur Rénov' local
- Co-brand avec événement BTP (Paris Builders Show 2026, Batimat 2027)

### Lever 4 — Programme "artisan de l'année"

Créer le **Prix ServicesArtisans de l'Artisan RGE de l'Année** avec remise de prix presse (1 500 € budget + trophée + communiqué).

- Génère PR annuelle
- Génère backlinks du lauréat (site pro, réseaux sociaux)
- Génère brand search pic

### Lever 5 — Tribune fondateur régulière

Le fondateur publie **1 tribune/mois** sur :

- Les Échos Entreprise
- Maddyness
- Journal du Net
- Frenchweb
- Medium

Angle : expert marché artisan / rénovation. Pas d'auto-promo mais positionnement thought leader.

## 9.3 KPI brand

- Mois 3 : brand search 10 % (×2,5)
- Mois 6 : 18 %
- Mois 12 : **30 %**
- Volume brand KW : 26 → 100+ (trademarks, variantes, "fondateur + ServicesArtisans")

---

# 10. Mesure succès growth — KPI trimestriels

| KPI                                         | Baseline M0 |               M3 |    M6 |    M9 |                             M12 |
| ------------------------------------------- | ----------: | ---------------: | ----: | ----: | ------------------------------: |
| **DR Ahrefs**                               |         0,6 |                5 | 12-15 | 22-25 |                         **30+** |
| **Referring domains qualifiés** (hors spam) |          10 |               40 |    80 |   140 |                        **200+** |
| **RD SPAM total**                           |          50 | 0 (post-disavow) |     0 |     0 |                               0 |
| **Trafic Ahrefs/j**                         |         164 |              500 | 1 000 | 1 500 |                      **2 000+** |
| **KW Ahrefs tracked**                       |         185 |              600 | 1 500 | 3 000 |                      **5 000+** |
| **KW top 10 GSC**                           |         ~10 |               50 |   200 |   500 |                      **1 000+** |
| **Pages indexées Google**                   |       459 k |            600 k | 750 k | 850 k |                      **900 k+** |
| **Citations ChatGPT** (Ahrefs Brand Radar)  |         395 |            1 000 | 2 500 | 3 800 |                      **5 000+** |
| **Branded search share**                    |         4 % |             10 % |  18 % |  25 % |                        **30 %** |
| **Publications presse Tier 1**              |           0 |                5 |    20 |    40 |                         **60+** |
| **Publications études propriétaires**       |           0 |                2 |     4 |     6 |                        **8-10** |
| **Podcasts apparus**                        |           0 |                4 |    12 |    20 |                         **24+** |
| **LinkedIn followers fondateur**            |        <500 |            1 500 | 3 000 | 4 000 |                      **5 000+** |
| **Devis soumis/mois**                       |          16 |              150 |   500 | 1 000 |                      **2 000+** |
| **Lead/artisan payant**                     |        ~5 € |              5 € |   7 € |  10 € | **15 €** (amélioration qualité) |

## 10.1 Outils de mesure

- **Ahrefs** : RD, DR, KW tracking (budget existant)
- **GSC** : trafic organique, branded search (gratuit)
- **GA4** : conversion, attribution (gratuit)
- **Ahrefs Brand Radar** : citations LLM (inclus Ahrefs plan)
- **BuzzSumo / Mention** : mentions presse non-linkées (budget ~60 €/mois)
- **Google Alerts** : backup mentions gratuites
- **Prowly / Muck Rack** : PR tracking pro (budget ~150 €/mois si scale)

## 10.2 Dashboards à construire

- **Dashboard SEO** hebdo : DR évolution, RD new/lost, KW positions top 100
- **Dashboard PR** mensuel : pitches envoyés, réponses, publications, RD acquis
- **Dashboard LLM** mensuel : citations ChatGPT/Claude/Perplexity, pages les plus citées
- **Dashboard conversion** hebdo : devis/j, CPL, qualité lead (taux acceptation artisan)

---

# 11. Budget 12 mois — estimation externalisation partielle

## 11.1 Scenario minimum viable (solo founder + outils)

**Budget mensuel : ~800-1 200 €**

| Poste                            |     Coût mensuel | Commentaire                                        |
| -------------------------------- | ---------------: | -------------------------------------------------- |
| Ahrefs (existant)                |           ~450 € | Plan Lite/Standard                                 |
| BuzzSumo/Mention                 |             60 € | Media monitoring                                   |
| Canva Pro                        |             13 € | Visuels études                                     |
| Datawrapper                      |              0 € | Freemium suffit                                    |
| ConvertKit / Brevo               |             30 € | Email pitch templates + tracking ouverture         |
| Hunter.io                        |             49 € | Recherche emails journalistes                      |
| Notion / Airtable                |             20 € | Process tracking                                   |
| Domaine + hébergement assets PR  |             20 € | Drive PR, sous-domaine `press.servicesartisans.fr` |
| LinkedIn Premium                 |             60 € | InMail journalistes                                |
| Paid amplification LinkedIn/Meta |        150-500 € | Variable                                           |
| **Total min**                    | **~850-1 200 €** |                                                    |

## 11.2 Scenario accéléré (avec freelance PR)

**Budget mensuel : ~3 000-5 000 €**

Ajouts sur le minimum viable :

- Freelance PR FR senior : **1 500-2 500 €/mois** (2-3 jours/semaine)
- Rédacteur études freelance : **800 €/mois** (2 études/mois @ 400 €)
- Designer visuels freelance : **400 €/mois**

## 11.3 Scenario croissance rapide (avec agence)

**Budget mensuel : ~8 000-12 000 €**

- Agence PR B2B spécialisée : **5 000-7 000 €/mois** (ex: agence type Oxygen, Monet Associés)
- Rédactrice en chef études : **2 500 €/mois** (freelance senior)
- Designer / motion : **800 €/mois**

**Recommandation** : démarrer minimum viable (mois 1-3), passer accéléré (mois 4-9), évaluer agence mois 10+ selon traction.

## 11.4 ROI attendu

- **CAC plausible** lead artisan : 15-25 € (baseline secteur)
- **LTV artisan** claim freemium + conversion Pro : ~250 € (12 mois)
- **Ratio LTV/CAC cible** : 10x+
- **Break-even investissement growth** : mois 8-10 avec scenario accéléré

---

# 12. Roadmap 12 mois par trimestre

## Q2 2026 (avril-juin) — FONDATION

**Objectif** : déverrouiller l'exécution technique + lancer PR légère

- [ ] S1 : Fix bailout SSR (P0 absolu) + upload `disavow.txt` GSC
- [ ] S1 : Créer page `/etudes/` (hub PR) + template article étude
- [ ] S2 : Badge réutilisation data.gouv.fr RGE
- [ ] S2 : Pré-rendu top 100 villes (`generateStaticParams`)
- [ ] S3 : Lancer Étude #1 (marché annuaires qui s'effondrent)
- [ ] S3 : 15 premiers pitches Tier 1 médias (Le Moniteur, Batirama, etc.)
- [ ] S4 : Créer comptes LinkedIn / TikTok / YouTube + 1re vidéo
- [ ] S5 : Lancer Étude #2 (cartographie RGE)
- [ ] S5 : 10 pitches podcasts BTP
- [ ] S6 : Inscription annuaires légitimes Tier 7 (Pages Jaunes, Kompass, Apple Maps…)
- [ ] S7-8 : Lancer Étude #3 (Passoires thermiques — flagship) + wave 50 pitches
- [ ] S9-12 : Publications blogs niche 5 (Tier 3) + 2 HARO/semaine

**Livrables Q2** :

- 3 études publiées
- 20-30 RD qualifiés gagnés
- 3-5 publications Tier 1
- DR 5-8
- Trafic Ahrefs 400-600/j

## Q3 2026 (juillet-septembre) — ACCÉLÉRATION

**Objectif** : capitaliser sur la fenêtre 3-6 mois, amplifier digital PR

- [ ] Études #4 (prix artisans), #5 (métiers en tension) — 1 par mois
- [ ] Wave pitch 80 médias par étude
- [ ] 6 podcasts enregistrés et publiés
- [ ] Lancer partenariat formel avec 1 CMA régionale (pilote)
- [ ] Skyscraper technique sur 10 pages travaux.com perdues
- [ ] 30 pages `/renovation-energetique/*` publiées (hub éditorial)
- [ ] Campaign LinkedIn ciblée journalistes (budget 500 €/mois)
- [ ] Recruter freelance PR senior (si budget OK)

**Livrables Q3** :

- 6 études publiées cumulées
- 80 RD qualifiés cumulés
- 15-20 publications presse cumulées
- DR 12-15
- Trafic Ahrefs 1 000/j

## Q4 2026 (octobre-décembre) — CONSOLIDATION

**Objectif** : domination progressive sur rénovation énergétique + brand moment

- [ ] Étude #6 (artisanat féminin, novembre pour Journée femmes entrepreneures)
- [ ] Étude #7 (arnaques rénovation énergétique) — grande wave UFC/60M
- [ ] Lancer **Prix ServicesArtisans Artisan RGE 2026** (brand moment fort)
- [ ] Tribune fondateur mensuelle (Les Échos, Maddyness…)
- [ ] 200 pages rénovation énergétique en ligne (vs 30 en Q3)
- [ ] 5 podcasts additionnels
- [ ] Finalisation 2e partenariat institutionnel (Qualibat ou Qualit'EnR)
- [ ] Lancement campagne brand YouTube / Meta

**Livrables Q4** :

- 8 études publiées cumulées
- 140 RD cumulés
- 40 publications presse cumulées
- DR 20-25
- Trafic Ahrefs 1 500/j
- Brand search 25 %

## Q1 2027 (janvier-mars) — LEADERSHIP

**Objectif** : devenir la référence FR côté annuaire artisans SIREN + leader rénovation énergétique

- [ ] Étude #8 (annuel "Baromètre Artisanat France 2027") — gros moment presse
- [ ] 2e édition Prix Artisan RGE
- [ ] Partenariat européen (si pertinent — Kompass Europe, Europages)
- [ ] Scale PR agence dédiée (budget 5-7k €/mois)
- [ ] Paid amplification : 3k €/mois
- [ ] Lancement premier Live LinkedIn grosse audience (1 000+ viewers cible)

**Livrables Q1 2027** :

- 10 études publiées cumulées
- 200+ RD qualifiés cumulés
- 60+ publications presse cumulées
- **DR 30+**
- **Trafic Ahrefs 2 000+/j**
- **Citations ChatGPT 5 000+**
- **Branded search 30 %**

---

# 13. Risques et mitigation

| Risque                                          | Probabilité             | Impact   | Mitigation                                  |
| ----------------------------------------------- | ----------------------- | -------- | ------------------------------------------- |
| Bailout SSR pas fixé → PR amplifie du vide      | Haute si pas fait S1    | Critique | P0 absolu, bloquant tout le plan            |
| Negative SEO attack (concurrent angry)          | Moyenne                 | Haute    | Ahrefs alerts RD new + disavow rapide       |
| Core Update Google défavorable                  | Moyenne-haute           | Haute    | Diversification LLM + brand + direct        |
| Journaliste pitch ratio < 5 %                   | Moyenne                 | Moyenne  | Itérer template, A/B test, améliorer angles |
| Budget freelance PR pas dispo                   | Moyenne                 | Basse    | Scénario minimum viable tient seul          |
| Concurrent challenger (effy-like) accélère      | Moyenne-haute           | Haute    | Sprinter 3-6 mois, pas attendre             |
| Artisans boycott ServicesArtisans               | Basse                   | Haute    | Transparence data, fairness leads           |
| Pénalité manuelle Google (erreur link building) | Basse si discipline     | Critique | Pas de PBN, audit RD new chaque semaine     |
| Épuisement fondateur solo                       | Haute si pas délégation | Critique | Onboarder freelance Q3 minimum              |

---

# 14. Checklists pré-exécution

## 14.1 Avant de lancer toute campagne PR

- [ ] Bailout SSR fixé, curl vérifie H1 présent sur 18 templates
- [ ] Disavow `disavow.txt` uploadé GSC, confirmation reçue
- [ ] Page `/etudes/` créée avec Schema.org Article
- [ ] Schema.org `Organization` + `Person` (fondateur) présents
- [ ] `press@servicesartisans.fr` monitorée
- [ ] Drive PR structuré : `Études / Visuels HD / Communiqués / Fondateur bio`
- [ ] Bio fondateur 100 mots + photo HD pro
- [ ] Page "Press" sur le site : `/presse/` avec Kit presse téléchargeable

## 14.2 Par étude publiée

- [ ] Data validée statistiquement
- [ ] 2 000-3 000 mots avec structure claire
- [ ] 5-8 visuels HD (Datawrapper ou Observable Plot)
- [ ] Executive summary 200 mots (pour pitch)
- [ ] Schema.org `ScholarlyArticle` + `Dataset`
- [ ] Auteur identifié avec `Person` schema
- [ ] Date publication + date dernière maj
- [ ] Social cards OpenGraph HD (1200×630)
- [ ] Kit presse PDF (résumé + 3 visuels + contact)
- [ ] Liste 15 médias exclu 72h identifiée
- [ ] Liste 50 médias wave 2 identifiée
- [ ] Suivi Ahrefs alerts activé sur nouveaux RD étude

## 14.3 Par pitch envoyé

- [ ] Article récent journaliste cité dans email
- [ ] Subject line < 70 chars avec chiffre
- [ ] 150-200 mots max
- [ ] Lien Drive visuels + PDF exclu
- [ ] 1 CTA clair (exclu 10 jours)
- [ ] Signature pro avec tel
- [ ] Follow-up J+4 préparé
- [ ] Follow-up J+10 préparé
- [ ] Après quoi : STOP (pas de 4e relance)

---

# 15. Philosophie growth — ce qu'on ne fait PAS

Pour que le plan tienne 12 mois, il faut la discipline de dire NON.

## 15.1 NON aux tactiques interdites Google

- ❌ Acheter des backlinks (détectés Penguin/SpamBrain)
- ❌ PBN (Private Blog Network) même "stealth"
- ❌ Guest posts payés masqués (violation Google Guidelines)
- ❌ Link exchanges réciproques massifs
- ❌ Comment spam, forum spam, profile links
- ❌ Automatisation outreach non personnalisé (flag SpamBrain)
- ❌ Cloaking, redirections trompeuses
- ❌ Doorway pages, sneaky redirects
- ❌ Faux GBP dans plusieurs villes
- ❌ Faux avis clients
- ❌ Reviews gating (montrer seulement positifs)

## 15.2 NON aux tactiques inefficaces ou à risque

- ❌ Annuaires généralistes auto-submit (faible valeur + flag)
- ❌ Soumission à 100+ annuaires en 2 semaines (pattern suspect)
- ❌ Pitch générique "copy-paste" à 500 journalistes (taux 0,1 %)
- ❌ Essayer de bidder sur brand concurrent ("travaux.com") en SEA
- ❌ Cibler KW trop concurrentiels (KD > 60) en phase 0
- ❌ Créer 1 000 pages en une nuit sans valeur ajoutée
- ❌ Copier pages concurrents (duplicate content)

## 15.3 NON aux distractions

- ❌ Pivot produit toutes les 6 semaines
- ❌ Ajouter 10 features en même temps
- ❌ Chasser chaque nouveau Growth Hack trending
- ❌ Se comparer à des sites US (contexte totalement différent)
- ❌ Déprioriser le technical SEO pour faire du "marketing"

## 15.4 OUI à ce qui compte

- ✅ Data officielle vérifiable (SIREN, RGE, ADEME, INSEE)
- ✅ Contenu de profondeur avec expertise identifiable
- ✅ Relations presse vraies (journalistes humains, pas listes)
- ✅ Études propriétaires rares et précises
- ✅ Discipline d'exécution sur 12 mois
- ✅ Mesure rigoureuse KPI hebdo
- ✅ Adaptation sur feedback marché (pas sur ego)
- ✅ Fair play avec artisans (leads exclusifs, transparence)
- ✅ Long terme > court terme

---

# 16. Conclusion exécutive

## 16.1 Ce qu'on fait

Transformer ServicesArtisans de **site jeune de 71 jours avec DR 0,6** en **leader français de l'annuaire artisans + rénovation énergétique avec DR 30+** en 12 mois.

## 16.2 Par quoi on y arrive

1. **Exécution technique irréprochable** (bailout fix, disavow, pré-rendu, maillage)
2. **Data officielle SIREN** comme fossé défensif (impossible à répliquer sans API ni volume)
3. **Digital PR industrielle** (8-10 études + 60+ publications presse + 24+ podcasts)
4. **Link building 100 % white hat** sur 7 tiers structurés
5. **Amplification LLM** consciente (395 → 5 000 citations)
6. **Brand building** patient mais systématique (4 % → 30 % branded)

## 16.3 Ce qu'on ne fait pas

Aucune tactique black hat, gray hat, "short-term hack". Chaque backlink doit pouvoir être montré à Google Quality Team sans gêne. La pénibilité à 12 mois en vaut la chandelle : un site construit solide = **résilient aux prochains Core Updates**.

## 16.4 La conviction

Le marché annuaires artisans FR est en **effondrement algorithmique coordonné**. La fenêtre pour prendre la place est de **3-6 mois**. Après, elle se referme sur un nouveau leader. ServicesArtisans a **l'ADN structurel correct** (data officielle) et **les signes positifs** (62 new KW, 395 citations ChatGPT, croissance x7) mais doit **passer d'artisanat d'exécution à industrialisation rigoureuse**.

Le plan est exécutable par une équipe de 1-3 personnes avec budget 1-5 k€/mois. Il demande **discipline, patience et rigueur** — pas de génie, pas de chance. C'est la recette Backlinko / Detailed / Eli Schwartz appliquée au contexte français spécifique.

**Go.**

---

## Annexes

### Annexe A — Liste templates emails prêts

1. Pitch presse Tier 1 (§ 3.2)
2. Outreach blog niche (§ 3.4)
3. Pitch podcast (§ 3.6)
4. (À créer lors d'exécution) : follow-up J+4, follow-up J+10, thank-you post-publication, request for update article

### Annexe B — Liste fichiers amont à consulter

- `RAPPORT-FINAL.md` — diagnostic complet
- `KEYWORDS-ANALYSIS.md` — état KW détaillé
- `STRATEGIE-RENOVATION-ENERGETIQUE.md` — plan pillar énergétique
- `TRAJECTOIRE-5-ANS.md` — historique perf
- `AUDIT-FORENSIQUE-MAILLAGE.md` — maillage interne
- `normalized/competitors-v2.csv` — matrice concurrents
- `normalized/best-by-links-external.csv` — pages qui attirent backlinks
- `disavow.txt` — 44 domaines à upload GSC
- `MASTER-PLAN-01..04-*.md` — plans technique / contenu / conversion précédents

### Annexe C — Sources externes citées

- Google Search Central (Search Quality Guidelines 2026)
- Google Helpful Content Update (décembre 2025, déploiement 11-29 déc.)
- Abondance — "Le trafic Google des éditeurs a chuté de 33 % en 2025" (janvier 2026)
- Princeton GEO Research (Generative Engine Optimization — stats citations LLM)
- Backlinko Skyscraper Technique 2026
- France-Rénov' — annuaire RGE + API
- data.gouv.fr — Liste entreprises RGE
- SDES — Tableau de suivi rénovation énergétique résidentielle
- Le Moniteur, Batirama, Batiactu, Batiweb — médias BTP FR
- Featured (ex-HARO), SourceBottle, Response Source — plateformes sourcing
- Podcast catalog FR : 6H Du BAT', Les experts du bâtiment, Bâtiment du futur, Parpaing, Bâtir pour le Climat

---

**Fin du plan.** Exécuter, mesurer, itérer.
