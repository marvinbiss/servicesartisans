# Plan de Consolidation Blog ServicesArtisans

**Date** : 2026-04-03
**Auteur** : Audit automatise
**Scope** : ~528 articles (328 manuels + 200 programmatiques)

---

## 1. Inventaire complet par batch

| Fichier | Articles | Importe ? | metaTitle ? | metaDescription ? |
|---------|----------|-----------|-------------|-------------------|
| existing-articles.ts | 24 | Oui | Oui (24) | Oui (24) |
| batch-prix.ts | 19 | Oui | Oui (19) | Oui (19) |
| batch-metiers.ts | 19 | Oui | Oui (12) | Oui (12) |
| batch-projets.ts | 18 | Oui | Non | Non |
| batch-conseils.ts | 17 | Oui | Oui (7) | Oui (7) |
| batch-reglementation.ts | 19 | Oui | Oui (7) | Oui (7) |
| batch-seo-boost1.ts | 5 | Oui | Non | Non |
| batch-seo-boost2.ts | 5 | Oui | Non | Non |
| batch-seo-boost3.ts | 5 | Oui | Non | Non |
| batch-metiers-3.ts | 7 | Oui | Non | Non |
| batch-metiers-4.ts | 7 | Oui | Non | Non |
| batch-metiers-5.ts | 2 | **NON** | Non | Non |
| batch-securite-energie.ts | 3 | Oui | Non | Non |
| batch-aides-saisonnier.ts | 3 | Oui | Non | Non |
| batch-guides-divers.ts | 4 | Oui | Non | Non |
| batch-saisonnier.ts | 1 | Oui | Non | Non |
| batch-inspiration.ts | 3 | Oui | Non | Non |
| batch-diy.ts | 3 | Oui | Non | Non |
| batch-energie-2026.ts | 10 | Oui | Non | Non |
| batch-renovation-2026.ts | 5 | Oui | Non | Non |
| batch-produits-materiaux.ts | 12 | Oui | Non | Non |
| batch-tutoriels-diy.ts | 15 | Oui | Non | Non |
| batch-tutoriels-diy-2.ts | 12 | Oui | Non | Non |
| batch-saisonnier-urgence.ts | 12 | Oui | Non | Non |
| batch-prix-regionaux.ts | 10 | Oui | Oui (10) | Oui (10) |
| batch-comparatifs-materiaux.ts | 10 | Oui | Non | Non |
| batch-prix-btp.ts | 5 | Oui | Oui (5) | Oui (5) |
| batch-prix-metal-bois.ts | 5 | Oui | Oui (5) | Oui (5) |
| batch-prix-design.ts | 5 | Oui | Oui (5) | Oui (5) |
| batch-prix-tech.ts | 5 | Oui | Oui (5) | Oui (5) |
| batch-prix-services.ts | 5 | Oui | Oui (5) | Oui (5) |
| batch-prix-villes.ts | 200 (programmatique) | Oui | Oui (gen.) | Oui (gen.) |
| batch-aides-2026.ts | 15 | Oui | Oui (15) | Oui (15) |
| batch-urgences-guides.ts | 20 | Oui | Oui (20) | Oui (20) |
| batch-saisonniers-2026.ts | 15 | Oui | Oui (15) | Oui (15) |

### Totaux

- **Articles manuels** : 328
- **Articles programmatiques (prix-villes)** : 200
- **TOTAL dans allArticles** : 526 (batch-metiers-5.ts = 2 articles NON importes)
- **TOTAL reel** : 528

### BUG CRITIQUE : batch-metiers-5.ts non importe

Le fichier `batch-metiers-5.ts` (2 articles : "alarme-maison-guide-complet-2026" et un second) existe mais n'est PAS importe dans `articles.ts`. Ces 2 articles sont invisibles sur le site.

---

## 2. Categorisation des articles

### Par categorie (valeurs brutes trouvees dans le code)

| Categorie | Nombre (approx.) |
|-----------|-----------------|
| Tarifs | 67 (9 single-quote + 58 double-quote) |
| Guides | 54 (44 + 10) |
| DIY | 32 (20 + 12) |
| Conseils | 31 (18 + 13) |
| Saisonnier | 28 (20 + 8) |
| Aides & Subventions | 26 (11 + 15) |
| Reglementation | 22 (20 + 2 "Energie"?) |
| Fiches metier | 21 |
| Urgences | 14 |
| Materiaux | 10 |
| Energie / Energie | 9 (7 "Energie" + 2 "Energie") |
| Securite / Securite | 7 (3 "Securite" + 1 "Securite" + 3 "Securite") |
| Inspiration | 5 |
| **+ 200 Tarifs (prix-villes programmatiques)** | |

**TOTAL categories Tarifs avec prix-villes : ~267 articles**

### Problemes de coherence des categories

1. **"Securite" vs "Securite"** : 3 articles dans existing-articles utilisent `'Securite'` (sans accent), 4 utilisent `"Securite"` (avec accent). Le normalizer dans categories.ts corrige "Securite" -> "Securite", MAIS uniquement si appele.
2. **"Energie" vs "Energie"** : 2 articles utilisent `'Energie'` (sans accent), 9 utilisent `'Energie'`/`"Energie"`. Le normalizer corrige "Energie" -> "Energie".
3. **Categories definies mais faiblement representees** : "Inspiration" n'a que 5 articles, "Materiaux" seulement 10.

### Par intent

| Intent | Articles | Exemples |
|--------|----------|---------|
| **Transactionnel** (prix/devis) | ~267 | prix-plombier-2026, prix-electricien-par-departement, tous les prix-villes |
| **Informationnel** (guides/conseils) | ~180 | comment-choisir-*, guides DIY, comparatifs materiaux, reglementation |
| **Navigational** (fiches metier) | ~21 | fiches metier batch-metiers, metiers-3, metiers-4 |
| **Urgence** (intent hybride) | ~14 | fuite-eau-que-faire-urgence, panne-electricite-nuit |
| **Saisonnier** (timing) | ~28 | preparer-chauffage-hiver, entretien-climatisation-ete |
| **Aide** (intent admin/financier) | ~26 | maprimerénov, eco-ptz, aides locales par ville |

### Par metier cible

| Metier | Articles prix | Guide "choisir" | Fiche metier | Urgence | Saisonnier |
|--------|-------------|-----------------|--------------|---------|------------|
| Plombier | Oui (prix + villes) | Oui (existing) | Non | Oui (fuite eau) | Oui (canalisations gel) |
| Electricien | Oui (prix + villes) | Non | Oui | Oui (panne nuit) | Oui (normes) |
| Serrurier | Oui (villes) | Non | Non | Oui (serrure cassee) | Non |
| Chauffagiste | Oui (villes) | Non | Non | Oui (panne chaudiere) | Oui (revision hiver) |
| Peintre | Oui (prix + villes) | Oui (urgences-guides) | Oui (metiers) | Non | Non |
| Menuisier | Oui (villes) | Non | Oui (metiers) | Non | Non |
| Macon | Oui (villes) | Non | Oui (metiers) | Non | Non |
| Couvreur | Oui (villes) | Non | Oui (metiers) | Oui (fuite toiture) | Oui (automne) |
| Carreleur | Oui (villes) | Non | Oui (metiers) | Non | Non |
| Plaquiste | Oui (villes) | Non | Oui (metiers) | Non | Non |
| Terrassier | Non | Oui (urgences-guides) | Non | Non | Non |
| Facadier | Non | Oui (urgences-guides) | Non | Non | Oui (demoussage) |
| Charpentier | Non | Oui (urgences-guides) | Non | Non | Non |
| Etancheiste | Non | Oui (urgences-guides) | Non | Non | Non |
| Panneaux solaires | Non | Oui (urgences-guides) | Non | Non | Non |
| Alarme | Non | Oui (urgences-guides) | Oui (metiers-5) | Non | Non |
| Ramoneur | Non | Oui (urgences-guides) | Non | Non | Oui (obligatoire) |
| Decorateur | Non | Oui (urgences-guides) | Non | Non | Non |
| Ferronnier | Non | Oui (urgences-guides) | Non | Non | Non |
| Vitrier | Non | Non | Non | Oui (vitre cassee) | Non |

### Presence de FAQ et keyTakeaways

- **FAQ** : presente dans 326 articles sur 328 manuels (>99%)
- **keyTakeaways** : present dans 312 articles sur 328 manuels (~95%)
- **metaTitle + metaDescription** : present dans **153 articles manuels** sur 328 = **47%**
  - MANQUANT dans : projets (18), seo-boost 1/2/3 (15), metiers-3/4/5 (16), securite-energie (3), aides-saisonnier (3), guides-divers (4), saisonnier (1), inspiration (3), diy (3), energie-2026 (10), renovation-2026 (5), produits-materiaux (12), tutoriels-diy 1+2 (27), saisonnier-urgence (12), comparatifs-materiaux (10)
  - **= 142 articles sans metaTitle/metaDescription**

---

## 3. Trous dans la couverture

### 3.1 Metiers avec prix mais SANS guide "comment choisir"

Les 10 metiers du batch prix-villes ont des articles prix dans 20 villes, mais plusieurs n'ont PAS de guide "comment choisir" :

| Metier | Prix ? | Guide choisir ? | Action |
|--------|--------|----------------|--------|
| Serrurier | Oui | **NON** | Creer |
| Chauffagiste | Oui | **NON** | Creer |
| Menuisier | Oui | **NON** | Creer |
| Macon | Oui | **NON** | Creer |
| Couvreur | Oui | **NON** | Creer |
| Carreleur | Oui | **NON** | Creer |
| Plaquiste | Oui | **NON** | Creer |

### 3.2 Metiers sans article saisonnier

| Metier | Saisonnier ? |
|--------|-------------|
| Serrurier | Non |
| Menuisier | Non |
| Macon | Non |
| Carreleur | Non |
| Plaquiste | Non |
| Peintre | Non |
| Terrassier | Non |
| Charpentier | Non |
| Ferronnier | Non |
| Decorateur | Non |

### 3.3 Aides locales : couverture geographique

**Couvertes (batch-aides-2026)** : Paris, Lyon, Marseille, Bordeaux, Toulouse (5 villes)

**Manquantes (top 15 villes restantes)** :
- Nantes
- Nice
- Strasbourg
- Montpellier
- Lille
- Rennes
- Reims
- Saint-Etienne
- Toulon
- Le Havre
- Grenoble
- Dijon
- Angers
- Nimes

### 3.4 Urgences : couverture par type

**Couverts** : fuite eau, panne electricite, serrure cassee, chaudiere en panne, degat des eaux, fuite toiture, canalisation bouchee, vitre cassee, panne chauffage, cambriolage

**Manquants** :
- Inondation / montee des eaux (hors degat des eaux classique)
- Incendie (reflexes avant artisan)
- Fuite gaz
- Panne ascenseur (copropriete)
- Effondrement / fissures structurelles urgentes

---

## 4. Coherence et qualite

### 4.1 Format d'auteur

**3 variantes distinctes detectees** :
1. `"ServicesArtisans"` (142 occurrences) - format dominant
2. `'ServicesArtisans'` (34 occurrences) - meme valeur, quotes differentes
3. `"L'equipe ServicesArtisans"` (33 occurrences) - format different
4. Auteurs fictifs avec prenom/nom (82 occurrences) : Marc Lefebvre (33), Thomas Bernard (28), Claire Dubois (21), Sophie Martin (18), Jean-Pierre Duval (18), Isabelle Renault (16), Marie Lefevre (3), + 12 auteurs ponctuels (1 occurrence chacun)

**Probleme** : manque de coherence. "ServicesArtisans" vs "L'equipe ServicesArtisans" est une inconstance mineure. Les auteurs fictifs (Marc Lefebvre, etc.) posent un probleme E-E-A-T : Google favorise les vrais auteurs avec une page bio verifiable.

**Recommandation** : Standardiser sur `"L'equipe ServicesArtisans"` pour tous les articles, OU creer de vraies pages auteur pour les noms fictifs existants.

### 4.2 Dates

- La majorite des articles (76 articles) sont dates du `2026-04-03` (date d'aujourd'hui)
- 252 articles manuels repartis entre `2025-12-xx` et `2026-03-xx`
- Pas de date future (bien)
- Pas de date suspecte

### 4.3 Categories non standardisees

| Valeur dans le code | Valeur normalisee attendue | Nb articles |
|--------------------|-----------------------------|-------------|
| `'Securite'` | `'Securite'` | 3 |
| `'Energie'` | `'Energie'` | 2 |

Le normalizer dans `categories.ts` gere ces cas, mais les donnees source restent incoherentes. 5 articles a corriger.

### 4.4 Articles potentiellement dupliques ou tres similaires

| Groupe | Articles | Probleme |
|--------|----------|---------|
| Eco-PTZ | `eco-pret-taux-zero-guide-complet-2026`, `eco-ptz-2026-conditions-montant`, `eco-ptz-2026-pret-taux-zero-renovation` | 3 articles quasi-identiques |
| MaPrimeRenov | `maprimerenov-2026-guide-complet-aides-renovation`, `aide-maprimerenov-2026-montants-conditions`, `maprimerénov-2026-conditions-montants`, `maprimerenovv-guide-complet-2026` | 4 articles (dont un avec faute de frappe "maprimerenovv") |
| Domotique prix | `prix-domotique-maison-2026` (x2 slugs identiques dans des batches differents !) | Conflit de slug potentiel (le dernier ecrase le premier) |
| DPE | `dpe-diagnostic-performance-energetique-tout-savoir`, `dpe-obligatoire-2026-guide`, `audit-energetique-dpe-obligations-2026` | 3 articles proches |
| Passoire thermique | `passoire-thermique-interdiction-location-2026` (x2 dans des batches differents) | Doublon de slug |
| Preparer hiver | `preparer-maison-hiver-guide-complet`, `preparer-maison-hiver-checklist`, `preparer-chauffage-hiver-2026-check-list` | 3 articles tres similaires |
| Renovation salle de bain | `renovation-salle-de-bain-budget-etapes`, `renovation-salle-de-bain-guide-complet-prix-2026`, `tendances-salle-de-bain-2026` | 3 articles qui se chevauchent |
| Cumul aides | `cumul-aides-renovation-energetique-2026`, `cumul-aides-renovation-2026-tableau`, `aides-renovation-2026-cumul-guide` | 3 articles proches |
| Devis travaux | `devis-travaux-comprendre`, `devis-travaux-comprendre-comparer-negocier`, `devis-travaux-comment-comparer-choisir` | 3 articles quasi-identiques |
| Renovation energetique | `renovation-energetique-par-ou-commencer`, `travaux-renovation-energetique-par-ou-commencer` | 2 articles quasi-identiques |

**ALERTE** : Les slugs dupliques (`prix-domotique-maison-2026`, `passoire-thermique-interdiction-location-2026`) causent un ecrasement silencieux. Le spread operator `...` dans `allArticles` fait que le dernier batch gagne. Les articles des batches precedents sont perdus sans avertissement.

---

## 5. Plan de consolidation

### 5.1 Actions immediates (P0 - cette semaine)

| # | Action | Impact |
|---|--------|--------|
| 1 | **Importer batch-metiers-5.ts** dans articles.ts | 2 articles invisibles recuperes |
| 2 | **Corriger le slug duplique "prix-domotique-maison-2026"** (existe dans 2 batches) | Ecrasement silencieux |
| 3 | **Corriger le slug duplique "passoire-thermique-interdiction-location-2026"** | Ecrasement silencieux |
| 4 | **Corriger "maprimerenovv"** (double v) dans batch-seo-boost1 ou fusion | Faute de frappe dans le slug |
| 5 | **Standardiser "Securite" -> "Securite"** dans existing-articles.ts (3 articles) | Coherence categories |
| 6 | **Standardiser "Energie" -> "Energie"** dans existing-articles.ts (2 articles) | Coherence categories |

### 5.2 Ajout de metaTitle/metaDescription (P1 - 2 semaines)

**142 articles** n'ont pas de metaTitle/metaDescription. Par priorite :

| Priorite | Batch | Nb articles | Raison |
|----------|-------|-------------|--------|
| Haute | batch-projets.ts | 18 | Guides a fort potentiel SEO |
| Haute | batch-energie-2026.ts | 10 | Thematique tres recherchee |
| Haute | batch-comparatifs-materiaux.ts | 10 | Intent transactionnel fort |
| Haute | batch-saisonnier-urgence.ts | 12 | Articles saisonniers a fort trafic |
| Moyenne | batch-tutoriels-diy.ts + diy-2.ts | 27 | Volume important |
| Moyenne | batch-produits-materiaux.ts | 12 | Guides achat |
| Moyenne | batch-metiers-3.ts + metiers-4.ts | 14 | Fiches metier |
| Basse | batch-seo-boost 1/2/3 | 15 | Deja indexes, impact marginal |
| Basse | Reste (inspiration, diy, etc.) | 24 | Volumes faibles |

### 5.3 Fusion des articles dupliques (P1)

| Groupe a fusionner | Action | Article cible (garder) |
|-------------------|--------|----------------------|
| 3 articles eco-PTZ | Fusionner en 1 + redirect 301 | `eco-ptz-2026-pret-taux-zero-renovation` |
| 4 articles MaPrimeRenov | Fusionner en 1 + redirect 301 | `maprimerénov-2026-conditions-montants` (batch-aides-2026) |
| 3 articles DPE | Fusionner en 1 + redirect 301 | `dpe-obligatoire-2026-guide` |
| 3 articles hiver | Fusionner en 1 ou differencier angles | `preparer-maison-hiver-checklist` |
| 3 articles cumul aides | Fusionner en 1 + redirect 301 | `cumul-aides-renovation-2026-tableau` |
| 3 articles devis | Fusionner en 1 + redirect 301 | `devis-travaux-comment-comparer-choisir` |
| 2 articles reno energetique | Fusionner en 1 + redirect 301 | `renovation-energetique-par-ou-commencer` |

**Economies** : ~12 articles supprimes, cannibalisation SEO eliminee.

### 5.4 Les 20 prochains articles a creer (par priorite)

| # | Titre | Categorie | Intent | Justification |
|---|-------|-----------|--------|---------------|
| 1 | Comment choisir un serrurier : guide 2026 | Fiches metier | Informationnel | Metier top 3 recherche, 0 guide choisir |
| 2 | Comment choisir un chauffagiste : guide 2026 | Fiches metier | Informationnel | Metier top 5, urgences hiver |
| 3 | Comment choisir un couvreur : guide 2026 | Fiches metier | Informationnel | Ticket moyen eleve, 0 guide |
| 4 | Comment choisir un macon : guide 2026 | Fiches metier | Informationnel | Gros oeuvre, projet couteux |
| 5 | Comment choisir un carreleur : guide 2026 | Fiches metier | Informationnel | Renovation SDB/cuisine, forte demande |
| 6 | Fuite de gaz : les reflexes qui sauvent | Urgences | Urgence | Manque dans la couverture urgences |
| 7 | Aides renovation Nantes 2026 | Aides & Subventions | Informationnel | 6e ville de France, 0 couverture |
| 8 | Aides renovation Nice 2026 | Aides & Subventions | Informationnel | 5e ville de France, 0 couverture |
| 9 | Aides renovation Strasbourg 2026 | Aides & Subventions | Informationnel | 7e ville, region Grand Est |
| 10 | Aides renovation Montpellier 2026 | Aides & Subventions | Informationnel | 8e ville, croissance forte |
| 11 | Aides renovation Lille 2026 | Aides & Subventions | Informationnel | 10e ville, Nord-Pas-de-Calais |
| 12 | Comment choisir un menuisier : guide 2026 | Fiches metier | Informationnel | Metier couvert en prix mais pas en guide |
| 13 | Comment choisir un plaquiste : guide 2026 | Fiches metier | Informationnel | Metier couvert en prix mais pas en guide |
| 14 | Travaux saisonniers peintre : quand peindre ? | Saisonnier | Informationnel | 0 contenu saisonnier pour ce metier |
| 15 | Travaux saisonniers menuisier : quand intervenir ? | Saisonnier | Informationnel | 0 contenu saisonnier pour ce metier |
| 16 | Travaux saisonniers macon : la meilleure saison | Saisonnier | Informationnel | Betonnage = meteo-dependant |
| 17 | Fissures mur porteur : urgence structurelle | Urgences | Urgence | Manque dans la couverture urgences |
| 18 | Prix serrurier 2026 : guide complet | Tarifs | Transactionnel | Pas de guide prix dedie (hors villes) |
| 19 | Prix chauffagiste 2026 : guide complet | Tarifs | Transactionnel | Pas de guide prix dedie (hors villes) |
| 20 | Incendie domestique : securiser et reparer | Urgences | Urgence | Sujet critique non couvert |

### 5.5 Strategie de mise a jour trimestrielle

#### T2 2026 (avril-juin)
- [ ] Corriger les 6 bugs P0 (imports, slugs, fautes)
- [ ] Ajouter metaTitle/metaDescription aux 42 articles haute priorite
- [ ] Creer les 7 guides "comment choisir" manquants
- [ ] Fusionner les 7 groupes d'articles dupliques
- [ ] Creer 5 articles aides locales (Nantes, Nice, Strasbourg, Montpellier, Lille)

#### T3 2026 (juillet-septembre)
- [ ] Ajouter metaTitle/metaDescription aux 100 articles restants
- [ ] Creer les 5 articles urgences manquants
- [ ] Creer les articles saisonniers d'automne/hiver (anticiper)
- [ ] Mettre a jour les prix 2026 dans tous les articles prix (verification annuelle)
- [ ] Ajouter 5 aides locales supplementaires (Rennes, Reims, Grenoble, Dijon, Angers)

#### T4 2026 (octobre-decembre)
- [ ] Revue des performances GSC : identifier les articles sous-performants
- [ ] Enrichir les articles les mieux classes (plus de FAQ, plus de contenu)
- [ ] Creer des articles "bilan 2026 / perspectives 2027" (lien interne boost)
- [ ] Mettre a jour les tarifs pour les villes programmatiques (coefficient regional)
- [ ] Evaluer l'ajout de nouvelles villes au generateur prix-villes (30-50 villes)

#### T1 2027 (janvier-mars)
- [ ] Mettre a jour toutes les dates et tarifs 2026 -> 2027
- [ ] Revue annuelle du maillage interne
- [ ] Audit de cannibalisation SEO (Search Console)
- [ ] Creer les articles saisonniers printemps/ete

---

## 6. Resume executif

### Chiffres cles

| Metrique | Valeur |
|----------|--------|
| Total articles | 528 (326 manuels + 200 programmatiques + 2 orphelins) |
| Articles avec metaTitle | 353 (~67% - dont 200 gen. + 153 manuels) |
| Articles SANS metaTitle | 175 (~33%) |
| Categories distinctes | 14 (dont 3 avec variantes d'accent) |
| Groupes d'articles dupliques | 7 groupes, ~20 articles concernes |
| Auteurs distincts | 12+ (incoherent) |
| Bugs critiques (P0) | 6 |
| Articles a creer en priorite | 20 |
| Articles a fusionner | ~12 (7 groupes) |

### Top 3 actions a impact maximal

1. **Importer batch-metiers-5 + corriger slugs dupliques** : 0 effort, recupere 2 articles + elimine 2 ecrasements silencieux
2. **Ajouter metaTitle/metaDescription a 142 articles** : impact SEO direct sur les SERP, CTR potentiellement +15-30%
3. **Fusionner les articles dupliques** : elimine la cannibalisation SEO, concentre le "link juice" et les signaux utilisateur sur un seul article par sujet
