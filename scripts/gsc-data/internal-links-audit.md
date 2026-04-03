# Audit Maillage Interne Blog — ServicesArtisans

**Date :** 2026-04-03
**Perimetre :** ~300 articles blog (hors 200 articles prix x ville generes programmatiquement)
**Methode :** Extraction exhaustive des liens `(/blog/...)` et `(/services/...)` dans tous les fichiers `src/lib/data/blog/*.ts`

---

## 1. Vue d'ensemble chiffree

| Metrique | Valeur |
|----------|--------|
| Total articles blog | ~500 (dont ~200 prix-villes auto-generes) |
| Articles manuels analyses | ~300 |
| Liens `/blog/` dans le contenu | **155** |
| Liens `/services/` dans le contenu | **410** |
| Fichiers avec 0 lien `/blog/` sortant | **22 fichiers sur 34** (65%) |
| Ratio liens blog sortants / article | **0.52** (tres faible, objectif > 2) |
| Systeme automatique "Articles lies" | Oui (4 articles en bas de page, scoring category+tags) |

---

## 2. Diagnostic severe : le maillage est concentre sur 4 fichiers

### Fichiers avec liens `/blog/` sortants (12 sur 34)

| Fichier | Nb liens /blog/ | Nb articles | Ratio |
|---------|----------------|-------------|-------|
| existing-articles.ts | 55 | 24 | 2.3 |
| batch-reglementation.ts | 40 | 19 | 2.1 |
| batch-conseils.ts | 16 | 17 | 0.9 |
| batch-prix.ts | 16 | 19 | 0.8 |
| batch-saisonniers-2026.ts | 9 | 15 | 0.6 |
| batch-metiers.ts | 6 | 21 | 0.3 |
| batch-metiers-3.ts | 5 | 7 | 0.7 |
| batch-saisonnier-urgence.ts | 3 | 13 | 0.2 |
| batch-guides-divers.ts | 2 | 4 | 0.5 |
| batch-metiers-5.ts | 1 | 2 | 0.5 |
| batch-urgences-guides.ts | 1 | 20 | 0.05 |
| batch-aides-saisonnier.ts | 1 | 3 | 0.3 |

### Fichiers avec 0 lien `/blog/` sortant (ORPHELINS MASSIFS)

| Fichier | Nb articles | Impact |
|---------|-------------|--------|
| **batch-comparatifs-materiaux.ts** | 10 | CRITIQUE — comparatifs sans lien vers prix ni guides |
| **batch-produits-materiaux.ts** | 12 | CRITIQUE — guides produits isoles |
| **batch-energie-2026.ts** | 10 | CRITIQUE — articles energie sans liens croisements |
| **batch-renovation-2026.ts** | 5 | CRITIQUE — articles renovation isoles |
| **batch-projets.ts** | 18 | CRITIQUE — guides projets sans maillage |
| **batch-tutoriels-diy.ts** | 15 | CRITIQUE — tutos sans liens vers prix artisan |
| **batch-tutoriels-diy-2.ts** | 12 | CRITIQUE — idem |
| **batch-aides-2026.ts** | 13 | CRITIQUE — articles aides sans liens croisements |
| **batch-securite-energie.ts** | 3 | Moyen |
| **batch-diy.ts** | 3 | Moyen |
| **batch-inspiration.ts** | 3 | Moyen |
| **batch-metiers-4.ts** | 7 | CRITIQUE — guides metiers sans liens |
| **batch-prix-btp.ts** | 5 | CRITIQUE — prix sans lien vers "comment choisir" |
| **batch-prix-design.ts** | 5 | CRITIQUE — idem |
| **batch-prix-metal-bois.ts** | 5 | CRITIQUE — idem |
| **batch-prix-services.ts** | 5 | CRITIQUE — idem |
| **batch-prix-tech.ts** | 5 | CRITIQUE — idem |
| **batch-prix-regionaux.ts** | 10 | CRITIQUE — articles prix regionaux isoles |
| **batch-prix-villes.ts** | 200 | Moyen (auto-generes, structure template) |
| **batch-seo-boost1.ts** | 5 | Moyen (mais piliers SEO !) |
| **batch-seo-boost2.ts** | 5 | Moyen |
| **batch-seo-boost3.ts** | 5 | Moyen |

**Total articles avec 0 lien /blog/ sortant : ~166 articles (55% du corpus manuel)**

---

## 3. Articles piliers (les plus lies)

| Article cible | Liens entrants | Fichiers sources |
|--------------|----------------|------------------|
| garantie-decennale-tout-savoir | 12 | existing-articles, reglementation |
| aide-maprimerenov-2026-montants-conditions | 10 | existing-articles, conseils, reglementation |
| isolation-maison-guide-complet-materiaux-prix-aides | 8 | existing-articles, reglementation |
| tva-reduite-travaux-renovation-guide | 7 | existing-articles, reglementation |
| electricite-normes-securite | 6 | existing-articles, reglementation |
| certificats-economies-energie-cee-guide | 6 | existing-articles, reglementation |
| trouver-artisan-verifie-siren | 6 | existing-articles, reglementation |
| devis-travaux-comprendre | 5 | existing-articles, reglementation |
| devis-travaux-comment-comparer-choisir | 5 | existing-articles, reglementation |
| label-rge-artisan-travaux-energetiques | 5 | existing-articles, reglementation |
| eco-pret-taux-zero-guide-complet-2026 | 4 | existing-articles, reglementation |
| chauffage-solution-economique | 4 | existing-articles uniquement |

**Constat :** Les liens entrants viennent quasi exclusivement de `existing-articles.ts` et `batch-reglementation.ts`. Aucun des ~200 articles des autres batches ne pointe vers ces piliers.

---

## 4. Articles totalement orphelins (0 lien entrant dans le contenu)

Ce sont des articles qui ne recoivent AUCUN lien `/blog/` depuis un autre article. Le systeme automatique `getRelatedArticleSlugs` en bas de page compense partiellement, mais les liens contextuels dans le contenu sont bien plus puissants pour le SEO.

### 4.1 Guides produits/materiaux (12 articles, 0 liens entrants)
- `guide-pompe-chaleur-air-eau-2026`
- `chauffe-eau-thermodynamique-guide`
- `guide-carrelage-salle-de-bain`
- `parquet-flottant-guide-choix`
- `chaudiere-gaz-condensation-guide`
- `guide-fenetre-double-vitrage`
- `isolation-combles-materiaux-guide`
- `guide-volet-roulant-electrique`
- `poele-a-bois-guide-2026`
- `climatisation-reversible-guide`
- `ballon-eau-chaude-guide-choix`
- `porte-entree-guide-securite-isolation`

### 4.2 Comparatifs materiaux (10 articles, 0 liens entrants)
- `meilleur-isolant-thermique-comparatif`
- `peinture-interieure-guide-choix`
- `robinetterie-laiton-vs-inox`
- `types-de-carrelage-guide`
- `parquet-massif-vs-contrecolle-vs-stratifie`
- `menuiseries-bois-pvc-alu-comparatif`
- `types-de-tuiles-guide`
- `plaque-de-platre-ba13-guide`
- `types-enduit-facade`
- `beton-cire-vs-resine-vs-carrelage`

### 4.3 Articles energie 2026 (10 articles, 0 liens entrants)
- `prix-pompe-a-chaleur-2026`
- `prix-panneaux-solaires-2026`
- `prix-borne-recharge-domicile-2026`
- `dpe-obligatoire-2026-guide`
- `passoire-thermique-interdiction-location-2026`
- `eco-ptz-2026-conditions-montant`
- `prix-veranda-2026-guide-complet`
- `extension-maison-prix-m2-2026`
- `prix-domotique-maison-2026`
- `adaptation-logement-senior-aides-2026`

### 4.4 Tous les tutoriels DIY (27 articles, 0 liens entrants)
- `comment-deboucher-wc-guide`
- `comment-peindre-mur-guide`
- `comment-poser-carrelage-sol`
- `comment-changer-robinet-cuisine`
- `comment-installer-prise-electrique`
- `comment-refaire-joint-salle-de-bain`
- `comment-poser-parquet-flottant`
- `comment-peindre-plafond`
- `comment-reboucher-trou-mur`
- `comment-changer-joint-robinet`
- `comment-installer-wc-suspendu`
- `comment-poser-etagere-murale`
- `comment-refaire-electricite-appartement`
- `comment-isoler-fenetre-froid`
- `comment-deboucher-canalisation-naturellement`
- `comment-reparer-fuite-toilette`
- `comment-installer-mitigeur-douche`
- `comment-changer-interrupteur`
- `comment-poser-credence-cuisine`
- `comment-reparer-volet-roulant`
- `comment-changer-chasse-eau`
- `comment-installer-store-fenetre`
- `comment-poser-lambris-mur`
- `comment-enduire-mur-abime`
- `comment-installer-robinet-machine-laver`
- `comment-remplacer-joint-fenetre`
- `comment-fixer-meuble-mur-placo`

### 4.5 Articles prix specialises (25 articles, 0 liens entrants)
Tous les articles de batch-prix-btp, batch-prix-design, batch-prix-metal-bois, batch-prix-services, batch-prix-tech :
- `prix-terrassier-2026-tarifs-travaux`
- `prix-charpentier-2026-tarifs-charpente`
- `prix-zingueur-2026-tarifs-gouttiere`
- `prix-etancheiste-2026-tarifs-etancheite`
- `prix-platrier-2026-tarifs-platerie`
- `prix-metallier-2026-tarifs-travaux`
- `prix-ferronnier-2026-tarifs-ferronnerie`
- `prix-poseur-de-parquet-2026-tarifs-pose`
- `prix-miroitier-2026-tarifs-vitrage`
- `prix-storiste-2026-tarifs-stores-volets`
- `prix-architecte-interieur-2026-tarifs`
- `prix-decorateur-2026-tarifs`
- `prix-ramoneur-2026-tarifs`
- `prix-paysagiste-2026-tarifs`
- `prix-pisciniste-2026-tarifs`
- `prix-alarme-securite-2026-tarifs`
- `prix-antenniste-2026-tarifs`
- `prix-ascensoriste-2026-tarifs`
- `prix-diagnostiqueur-2026-tarifs`
- `prix-geometre-2026-tarifs`
- `prix-desinsectisation-2026-tarifs`
- `prix-deratisation-2026-tarifs`
- `prix-demenageur-2026-tarifs`
- `prix-isolation-thermique-2026-tarifs`
- `prix-renovation-energetique-2026-tarifs`

### 4.6 Articles guides metiers (14 articles, 0 liens entrants)
- `comment-choisir-solier-guide`
- `comment-choisir-poseur-parquet-guide`
- `comment-choisir-zingueur-guide`
- `comment-choisir-miroitier-guide`
- `comment-choisir-storiste-guide`
- `comment-choisir-domoticien-guide`
- `comment-choisir-diagnostiqueur-guide`
- `comment-choisir-ascensoriste-guide`
- `comment-choisir-metallier-guide`
- `comment-choisir-architecte-interieur-guide`
- `comment-choisir-pisciniste-guide`
- `comment-choisir-antenniste-guide`
- `comment-choisir-geometre-guide`
- `comment-choisir-demenageur-guide`

### 4.7 Articles projets (18 articles, 0 liens entrants sauf quelques-uns lies depuis existing-articles)
- `renover-cuisine-guide-complet-etapes`
- `amenager-combles-guide-habitables`
- `installer-pompe-chaleur-air-eau-guide`
- `installer-panneau-solaire-maison-2026`
- `creer-salle-de-bain-sous-combles`
- `agrandir-maison-extension-guide`
- `renover-facade-ravalement-guide`
- `amenager-terrasse-exterieure-guide`
- `installer-climatisation-maison-guide`
- `refaire-electricite-maison-ancienne`
- `refaire-plomberie-maison-ancienne`
- `poser-carrelage-guide-complet-techniques`
- `installer-parquet-massif-contrecolle-guide`
- `construire-garage-guide-permis-budget`
- `amenager-jardin-paysagiste-guide`
- `installer-portail-automatique-guide`
- `remplacer-fenetres-guide-performances`
- `installer-vmc-ventilation-guide`

### 4.8 Articles aides 2026 (13 articles, 0 liens entrants)
- `maprimerénov-2026-conditions-montants`
- `cee-certificats-economies-energie-2026`
- `eco-ptz-2026-pret-taux-zero-renovation` (duplicate slug avec batch-seo-boost3!)
- `tva-reduite-travaux-5-5-10-2026`
- `aide-renovation-energetique-paris-2026`
- `aide-renovation-energetique-lyon-2026`
- `aide-renovation-energetique-marseille-2026`
- `aide-renovation-energetique-bordeaux-2026`
- `aide-renovation-energetique-toulouse-2026`
- `mon-accompagnateur-renov-2026-guide`
- `audit-energetique-obligatoire-2026`
- `passoire-thermique-interdiction-location-2026` (duplicate slug avec batch-energie-2026!)
- `cumul-aides-renovation-2026-tableau`
- `aide-installation-borne-recharge-2026`
- `cheque-energie-2026-montant-utilisation`

### 4.9 Saisonniers 2026 (15 articles, max 1 lien entrant chacun)
- `preparer-chauffage-hiver-2026-check-list`
- `entretien-climatisation-ete-2026`
- `travaux-printemps-check-list-2026`
- `preparer-maison-avant-vacances-ete`
- `ramonage-obligatoire-2026-reglementation`
- `purger-radiateurs-avant-hiver-guide`
- `entretien-toiture-automne-guide`
- `proteger-canalisations-gel-hiver`
- `entretien-piscine-ouverture-printemps`
- `hivernage-piscine-guide-complet`
- `taille-haies-arbres-reglementation-2026`
- `demoussage-facade-meilleure-periode`
- `isolation-combles-ete-preparation-hiver`
- `entretien-chauffe-eau-detartrage-annuel`
- `renovation-energetique-meilleure-saison`

**TOTAL ORPHELINS ESTIMES : ~170 articles sur ~300 (57%)**

---

## 5. BUGS DETECTES : Slugs dupliques

Deux cas de slugs identiques dans des fichiers differents (le dernier importe ecrase le premier dans `allArticles`) :

1. **`eco-ptz-2026-pret-taux-zero-renovation`** existe dans `batch-seo-boost3.ts` ET `batch-aides-2026.ts`
2. **`passoire-thermique-interdiction-location-2026`** existe dans `batch-energie-2026.ts` ET `batch-aides-2026.ts`
3. **`prix-domotique-maison-2026`** existe dans `batch-energie-2026.ts` ET `batch-guides-divers.ts`
4. **`tendances-salle-de-bain-2026`** existe dans `existing-articles.ts` ET `batch-guides-divers.ts`

**Impact :** L'article qui est importe en dernier dans `articles.ts` ecrase silencieusement le premier. Aucune erreur TypeScript ni runtime. Contenu potentiellement perdu.

---

## 6. Mitigations existantes

Le site a deja 3 mecanismes partiels :

1. **`getRelatedArticleSlugs`** — Affiche 4 articles lies en bas de chaque article (scoring category+tags). Automatique, zero maintenance, mais poids SEO faible (liens en footer de page, pas contextuels).

2. **`BlogClusterLinks`** et **`DeepPageLinks`** — Affichent des liens vers les pages service/tarifs/devis en bas de page.

3. **`topical-clusters.ts`** — Map formelle service → articles blog (3 articles par service, 30 services). Bien structure mais ne couvre que 90 paires sur ~300 articles.

**Ce qui manque :** Des liens **contextuels dans le contenu** (markdown inline `[ancre](/blog/slug)`), qui sont le signal le plus fort pour Google.

---

## 7. Opportunites de maillage prioritaires

### 7.1 PRIORITE P0 — Articles prix → articles "comment choisir" du meme metier

Chaque article prix devrait lier vers le guide de choix du meme metier. C'est le parcours utilisateur naturel : "combien ca coute" → "comment bien choisir".

| Article prix | Lien a ajouter | Ancre suggeree |
|-------------|----------------|----------------|
| prix-terrassier-2026-tarifs-travaux | comment-choisir-terrassier-guide | comment choisir un terrassier |
| prix-charpentier-2026-tarifs-charpente | comment-choisir-charpentier-guide | bien choisir son charpentier |
| prix-zingueur-2026-tarifs-gouttiere | comment-choisir-zingueur-guide | choisir un zingueur de confiance |
| prix-etancheiste-2026-tarifs-etancheite | comment-choisir-etancheiste-guide | choisir son etancheiste |
| prix-metallier-2026-tarifs-travaux | comment-choisir-metallier-guide | trouver un metallier qualifie |
| prix-ferronnier-2026-tarifs-ferronnerie | comment-choisir-ferronnier-guide | choisir un ferronnier d'art |
| prix-poseur-de-parquet-2026-tarifs-pose | comment-choisir-poseur-parquet-guide | comment choisir un poseur de parquet |
| prix-miroitier-2026-tarifs-vitrage | comment-choisir-miroitier-guide | choisir un miroitier |
| prix-storiste-2026-tarifs-stores-volets | comment-choisir-storiste-guide | comment choisir un storiste |
| prix-architecte-interieur-2026-tarifs | comment-choisir-architecte-interieur-guide | choisir un architecte d'interieur |
| prix-decorateur-2026-tarifs | comment-choisir-decorateur-guide | comment choisir un decorateur |
| prix-ramoneur-2026-tarifs | comment-choisir-ramoneur-guide | choisir un ramoneur qualifie |
| prix-paysagiste-2026-tarifs | comment-choisir-jardinier-paysagiste | choisir un paysagiste |
| prix-pisciniste-2026-tarifs | comment-choisir-pisciniste-guide | trouver un pisciniste de confiance |
| prix-alarme-securite-2026-tarifs | comment-choisir-installateur-alarme-guide | comment choisir un installateur d'alarme |
| prix-antenniste-2026-tarifs | comment-choisir-antenniste-guide | choisir un antenniste |
| prix-ascensoriste-2026-tarifs | comment-choisir-ascensoriste-guide | trouver un ascensoriste |
| prix-diagnostiqueur-2026-tarifs | comment-choisir-diagnostiqueur-guide | comment choisir un diagnostiqueur |
| prix-geometre-2026-tarifs | comment-choisir-geometre-guide | trouver un geometre-expert |
| prix-demenageur-2026-tarifs | comment-choisir-demenageur-guide | choisir un demenageur de confiance |
| prix-desinsectisation-2026-tarifs | nuisibles-maison-prevention-traitement | prevention et traitement des nuisibles |
| prix-deratisation-2026-tarifs | nuisibles-maison-prevention-traitement | prevention contre les nuisibles |
| prix-isolation-thermique-2026-tarifs | isolation-maison-guide-complet-materiaux-prix-aides | guide complet de l'isolation |
| prix-renovation-energetique-2026-tarifs | renovation-energetique-par-ou-commencer | par ou commencer sa renovation energetique |

**Impact : 24 liens a ajouter. Effort : faible (une phrase + lien par article).**

### 7.2 PRIORITE P0 — Articles "comment choisir" → articles prix du meme metier

Le chemin inverse est aussi essentiel.

| Article guide | Lien a ajouter | Ancre suggeree |
|--------------|----------------|----------------|
| comment-choisir-terrassier-guide | prix-terrassier-2026-tarifs-travaux | tarifs d'un terrassier en 2026 |
| comment-choisir-charpentier-guide | prix-charpentier-2026-tarifs-charpente | prix d'un charpentier |
| comment-choisir-facadier-guide | prix-ravalement-facade-2026 | prix d'un ravalement de facade |
| comment-choisir-etancheiste-guide | prix-etancheiste-2026-tarifs-etancheite | tarifs d'un etancheiste |
| comment-choisir-installateur-panneaux-solaires-guide | prix-panneaux-solaires-2026 | prix des panneaux solaires en 2026 |
| comment-choisir-installateur-alarme-guide | prix-alarme-securite-2026-tarifs | prix d'un systeme d'alarme |
| comment-choisir-ramoneur-guide | prix-ramoneur-2026-tarifs | tarifs de ramonage en 2026 |
| comment-choisir-decorateur-guide | prix-decorateur-2026-tarifs | prix d'un decorateur d'interieur |
| comment-choisir-ferronnier-guide | prix-ferronnier-2026-tarifs-ferronnerie | tarifs de ferronnerie |
| comment-choisir-solier-guide | prix-solier-revetement-sol-2026 | prix des revetements de sol |
| comment-choisir-poseur-parquet-guide | prix-poseur-de-parquet-2026-tarifs-pose | prix de pose du parquet |
| comment-choisir-zingueur-guide | prix-zingueur-2026-tarifs-gouttiere | tarifs de zinguerie |
| comment-choisir-miroitier-guide | prix-miroitier-2026-tarifs-vitrage | prix d'un miroitier |
| comment-choisir-storiste-guide | prix-storiste-2026-tarifs-stores-volets | prix de stores et volets |
| comment-choisir-domoticien-guide | prix-domotique-maison-2026 | prix de la domotique en 2026 |
| comment-choisir-diagnostiqueur-guide | prix-diagnostiqueur-2026-tarifs | tarifs d'un diagnostiqueur |
| comment-choisir-ascensoriste-guide | prix-ascensoriste-2026-tarifs | prix d'un ascenseur |
| comment-choisir-metallier-guide | prix-metallier-2026-tarifs-travaux | tarifs de metallerie |
| comment-choisir-architecte-interieur-guide | prix-architecte-interieur-2026-tarifs | honoraires d'un architecte d'interieur |
| comment-choisir-pisciniste-guide | prix-pisciniste-2026-tarifs | prix de construction de piscine |
| comment-choisir-antenniste-guide | prix-antenniste-2026-tarifs | tarifs d'un antenniste |
| comment-choisir-geometre-guide | prix-geometre-2026-tarifs | honoraires d'un geometre |
| comment-choisir-demenageur-guide | prix-demenageur-2026-tarifs | prix d'un demenagement |
| comment-choisir-peintre-guide | prix-peintre-batiment-2026-guide-complet | prix d'un peintre en batiment |

**Impact : 24 liens a ajouter.**

### 7.3 PRIORITE P0 — Tutoriels DIY → articles prix correspondants

Chaque tutoriel "comment faire soi-meme" devrait lier vers l'article prix du professionnel equivalent, avec une phrase du type "Si le travail vous depasse, consultez les [tarifs d'un plombier](/blog/prix-plombier-2026-tarifs-horaires)."

| Tutoriel | Article prix a lier |
|----------|-------------------|
| comment-deboucher-wc-guide | prix-plombier-2026-tarifs-horaires |
| comment-deboucher-canalisation-naturellement | prix-plombier-2026-tarifs-horaires |
| comment-reparer-fuite-toilette | prix-plombier-2026-tarifs-horaires |
| comment-changer-robinet-cuisine | prix-plombier-2026-tarifs-horaires |
| comment-changer-joint-robinet | prix-plombier-2026-tarifs-horaires |
| comment-installer-wc-suspendu | prix-plombier-2026-tarifs-horaires |
| comment-changer-chasse-eau | prix-plombier-2026-tarifs-horaires |
| comment-installer-mitigeur-douche | prix-plombier-2026-tarifs-horaires |
| comment-installer-robinet-machine-laver | prix-plombier-2026-tarifs-horaires |
| comment-refaire-joint-salle-de-bain | renovation-salle-de-bain-budget-etapes |
| comment-peindre-mur-guide | prix-peintre-batiment-2026-guide-complet |
| comment-peindre-plafond | prix-peintre-batiment-2026-guide-complet |
| comment-poser-carrelage-sol | prix-carreleur-2026-pose-fourniture |
| comment-poser-parquet-flottant | prix-poseur-de-parquet-2026-tarifs-pose |
| comment-installer-prise-electrique | prix-electricien-2026-tarifs-travaux |
| comment-refaire-electricite-appartement | prix-electricien-2026-tarifs-travaux |
| comment-changer-interrupteur | prix-electricien-2026-tarifs-travaux |
| comment-reboucher-trou-mur | prix-peintre-batiment-2026-guide-complet |
| comment-enduire-mur-abime | prix-peintre-batiment-2026-guide-complet |
| comment-poser-etagere-murale | prix-menuisier-2026-tarifs-travaux |
| comment-isoler-fenetre-froid | prix-isolation-thermique-2026-tarifs |
| comment-reparer-volet-roulant | prix-storiste-2026-tarifs-stores-volets |
| comment-installer-store-fenetre | prix-storiste-2026-tarifs-stores-volets |
| comment-poser-lambris-mur | prix-menuisier-2026-tarifs-travaux |
| comment-poser-credence-cuisine | prix-cuisiniste-2026-pose-cuisine |
| comment-remplacer-joint-fenetre | prix-menuisier-2026-tarifs-travaux |
| comment-fixer-meuble-mur-placo | prix-platrier-2026-tarifs-platerie |

**Impact : 27 liens a ajouter.**

### 7.4 PRIORITE P1 — Articles aides → articles prix correspondants

Les articles sur les aides financieres devraient systematiquement lier vers les articles prix pour que l'utilisateur puisse estimer son reste a charge.

| Article aides | Lien a ajouter |
|--------------|----------------|
| maprimerénov-2026-conditions-montants | prix-pompe-a-chaleur-2026, prix-isolation-thermique-2026-tarifs |
| cee-certificats-economies-energie-2026 | prix-renovation-energetique-2026-tarifs |
| tva-reduite-travaux-5-5-10-2026 | prix-renovation-maison-2026-budget-complet |
| aide-renovation-energetique-paris-2026 | prix-artisans-ile-de-france |
| aide-renovation-energetique-lyon-2026 | cout-renovation-par-region |
| aide-renovation-energetique-marseille-2026 | prix-travaux-sud-france |
| aide-renovation-energetique-bordeaux-2026 | cout-renovation-par-region |
| aide-renovation-energetique-toulouse-2026 | prix-travaux-sud-france |
| mon-accompagnateur-renov-2026-guide | renovation-energetique-par-ou-commencer |
| audit-energetique-obligatoire-2026 | dpe-obligatoire-2026-guide |
| cumul-aides-renovation-2026-tableau | aides-renovation-2026-cumul-guide |
| aide-installation-borne-recharge-2026 | prix-borne-recharge-domicile-2026 |
| cheque-energie-2026-montant-utilisation | passoire-thermique-interdiction-location-2026 |

**Impact : ~15 liens a ajouter.**

### 7.5 PRIORITE P1 — Articles energie → articles guides et prix

| Article energie | Liens a ajouter |
|----------------|----------------|
| prix-pompe-a-chaleur-2026 | pompe-a-chaleur-guide-complet-2026, aide-maprimerenov-2026-montants-conditions |
| prix-panneaux-solaires-2026 | installer-panneau-solaire-maison-2026, aide-maprimerenov-2026-montants-conditions |
| prix-borne-recharge-domicile-2026 | aide-installation-borne-recharge-2026 |
| dpe-obligatoire-2026-guide | audit-energetique-dpe-obligations-2026, passoire-thermique-interdiction-location-2026 |
| passoire-thermique-interdiction-location-2026 | renovation-energetique-par-ou-commencer, aide-maprimerenov-2026-montants-conditions |
| eco-ptz-2026-conditions-montant | eco-pret-taux-zero-guide-complet-2026 |
| prix-veranda-2026-guide-complet | prix-extension-maison-2026, permis-construire-declaration-prealable-guide |
| extension-maison-prix-m2-2026 | agrandir-maison-extension-guide, permis-construire-declaration-prealable-guide |
| prix-domotique-maison-2026 | comment-choisir-domoticien-guide, domotique-maison-connectee-guide-debutant |
| adaptation-logement-senior-aides-2026 | accessibilite-pmr-logement-normes |

**Impact : ~15 liens a ajouter.**

### 7.6 PRIORITE P1 — Comparatifs materiaux → articles prix et guides projet

| Article comparatif | Liens a ajouter |
|-------------------|----------------|
| meilleur-isolant-thermique-comparatif | isolation-maison-guide-complet-materiaux-prix-aides, prix-isolation-thermique-2026-tarifs |
| peinture-interieure-guide-choix | prix-peintre-batiment-2026-guide-complet, peinture-interieure-conseils |
| robinetterie-laiton-vs-inox | renovation-salle-de-bain-budget-etapes |
| types-de-carrelage-guide | prix-carreleur-2026-pose-fourniture, guide-carrelage-salle-de-bain |
| parquet-massif-vs-contrecolle-vs-stratifie | prix-poseur-de-parquet-2026-tarifs-pose, parquet-flottant-guide-choix |
| menuiseries-bois-pvc-alu-comparatif | prix-menuisier-2026-tarifs-travaux, remplacer-fenetres-guide-performances |
| types-de-tuiles-guide | prix-toiture-2026-refection-reparation-materiaux, toiture-renovation-prix-2026 |
| plaque-de-platre-ba13-guide | prix-platrier-2026-tarifs-platerie |
| types-enduit-facade | prix-ravalement-facade-2026, renover-facade-ravalement-guide |
| beton-cire-vs-resine-vs-carrelage | prix-solier-revetement-sol-2026, prix-carreleur-2026-pose-fourniture |

**Impact : ~15 liens a ajouter.**

### 7.7 PRIORITE P1 — Guides projets → articles prix et aides

| Article projet | Liens a ajouter |
|---------------|----------------|
| renover-cuisine-guide-complet-etapes | prix-cuisiniste-2026-pose-cuisine, comment-choisir-cuisine-equipee-guide |
| amenager-combles-guide-habitables | prix-renovation-appartement-2026-budget, permis-construire-declaration-prealable-guide |
| installer-pompe-chaleur-air-eau-guide | prix-pompe-a-chaleur-2026, aide-maprimerenov-2026-montants-conditions |
| installer-panneau-solaire-maison-2026 | prix-panneaux-solaires-2026, aide-maprimerenov-2026-montants-conditions |
| creer-salle-de-bain-sous-combles | renovation-salle-de-bain-budget-etapes, prix-salle-de-bain-complete-2026 |
| agrandir-maison-extension-guide | prix-extension-maison-2026, permis-construire-declaration-prealable-guide |
| renover-facade-ravalement-guide | prix-ravalement-facade-2026, reglementation-ravalement-facade-obligations |
| amenager-terrasse-exterieure-guide | prix-terrasse-exterieure-2026 |
| installer-climatisation-maison-guide | prix-climaticien-2026-installation-entretien |
| refaire-electricite-maison-ancienne | prix-installation-electrique-neuve-2026, normes-electriques-2026-nfc-15-100-guide |
| refaire-plomberie-maison-ancienne | prix-plombier-2026-tarifs-horaires |
| poser-carrelage-guide-complet-techniques | prix-carreleur-2026-pose-fourniture, types-de-carrelage-guide |
| installer-parquet-massif-contrecolle-guide | prix-poseur-de-parquet-2026-tarifs-pose, parquet-massif-vs-contrecolle-vs-stratifie |
| construire-garage-guide-permis-budget | prix-extension-maison-2026, permis-construire-declaration-prealable-guide |
| amenager-jardin-paysagiste-guide | prix-jardinier-paysagiste-2026 |
| installer-portail-automatique-guide | prix-cloture-portail-2026 |
| remplacer-fenetres-guide-performances | prix-fenetre-double-vitrage-2026, menuiseries-bois-pvc-alu-comparatif |
| installer-vmc-ventilation-guide | prix-renovation-energetique-2026-tarifs |

**Impact : ~25 liens a ajouter.**

### 7.8 PRIORITE P2 — Saisonniers → articles permanents

| Article saisonnier | Lien a ajouter |
|-------------------|----------------|
| preparer-chauffage-hiver-2026-check-list | prix-chauffagiste-2026-installation-entretien |
| entretien-climatisation-ete-2026 | prix-climaticien-2026-installation-entretien |
| travaux-printemps-check-list-2026 | entretien-annuel-maison-checklist-complete |
| ramonage-obligatoire-2026-reglementation | prix-ramoneur-2026-tarifs |
| purger-radiateurs-avant-hiver-guide | chauffage-pompe-chaleur-vs-chaudiere-gaz-2026 |
| entretien-toiture-automne-guide | prix-toiture-2026-refection-reparation-materiaux |
| proteger-canalisations-gel-hiver | fuite-eau-urgence-guide-complet-gestes-couts |
| entretien-piscine-ouverture-printemps | prix-pisciniste-2026-tarifs |
| hivernage-piscine-guide-complet | prix-pisciniste-2026-tarifs |
| taille-haies-arbres-reglementation-2026 | prix-jardinier-paysagiste-2026 |
| demoussage-facade-meilleure-periode | prix-ravalement-facade-2026 |
| isolation-combles-ete-preparation-hiver | isolation-maison-guide-complet-materiaux-prix-aides |
| entretien-chauffe-eau-detartrage-annuel | prix-plombier-2026-tarifs-horaires |
| renovation-energetique-meilleure-saison | renovation-energetique-par-ou-commencer |

**Impact : 14 liens a ajouter.**

### 7.9 PRIORITE P2 — Guides produits → articles prix et "comment choisir"

| Article produit | Liens a ajouter |
|----------------|----------------|
| guide-pompe-chaleur-air-eau-2026 | prix-pompe-a-chaleur-2026, comment-choisir-chauffagiste-guide |
| chauffe-eau-thermodynamique-guide | prix-plombier-2026-tarifs-horaires |
| guide-carrelage-salle-de-bain | prix-carreleur-2026-pose-fourniture, comment-choisir-carreleur-guide |
| parquet-flottant-guide-choix | prix-poseur-de-parquet-2026-tarifs-pose |
| chaudiere-gaz-condensation-guide | prix-chauffagiste-2026-installation-entretien, comment-choisir-chauffagiste-guide |
| guide-fenetre-double-vitrage | prix-fenetre-double-vitrage-2026, comment-choisir-menuisier-guide |
| isolation-combles-materiaux-guide | prix-isolation-thermique-2026-tarifs, aide-maprimerenov-2026-montants-conditions |
| guide-volet-roulant-electrique | prix-storiste-2026-tarifs-stores-volets |
| poele-a-bois-guide-2026 | prix-ramoneur-2026-tarifs, ramonage-obligatoire-avant-hiver |
| climatisation-reversible-guide | prix-climaticien-2026-installation-entretien |
| ballon-eau-chaude-guide-choix | prix-plombier-2026-tarifs-horaires |
| porte-entree-guide-securite-isolation | prix-serrurier-2026-tarifs-interventions, securiser-maison-cambriolage-solutions |

**Impact : ~18 liens a ajouter.**

---

## 8. Resume des actions

| Priorite | Action | Nb liens | Effort |
|----------|--------|----------|--------|
| **P0** | Prix → Comment choisir (meme metier) | 24 | Faible |
| **P0** | Comment choisir → Prix (meme metier) | 24 | Faible |
| **P0** | Tutoriels DIY → Prix professionnel | 27 | Faible |
| **P1** | Aides → Prix correspondants | 15 | Moyen |
| **P1** | Energie → Guides et prix | 15 | Moyen |
| **P1** | Comparatifs → Prix et guides | 15 | Moyen |
| **P1** | Projets → Prix et aides | 25 | Moyen |
| **P2** | Saisonniers → Articles permanents | 14 | Faible |
| **P2** | Guides produits → Prix et guides | 18 | Moyen |
| **BUG** | Corriger les 4 slugs dupliques | 4 | Critique |
| **TOTAL** | | **~180 liens** | |

**Score maillage actuel : 2/10**
- Liens blog contextuels : 155 sur ~300 articles = 0.52/article (objectif : 2-3)
- Orphelins : 57% des articles n'ont aucun lien entrant depuis le contenu
- Concentration : 75% des liens sortants viennent de 2 fichiers (existing-articles + reglementation)

**Score estime apres corrections : 7/10**
- Ajout de ~180 liens portera le ratio a 1.1/article
- Reduction des orphelins de 57% a ~15%
- Meilleure distribution du link equity

---

## 9. Implementation recommandee

### Phase 1 (quick wins, 2-3h)
1. Corriger les 4 slugs dupliques (renommer dans batch-aides-2026 et batch-energie-2026)
2. Ajouter les 24 liens Prix → Comment choisir : une phrase en intro ou outro de chaque article prix
3. Ajouter les 24 liens Comment choisir → Prix : idem

### Phase 2 (4-6h)
4. Ajouter les 27 liens Tutoriels DIY → Prix : phrase en outro "Si le travail depasse vos competences..."
5. Ajouter les liens Projets → Prix et aides

### Phase 3 (4-6h)
6. Ajouter les liens Aides → Prix
7. Ajouter les liens Comparatifs → Prix et guides
8. Ajouter les liens Energie → Guides

### Phase 4 (2-3h)
9. Ajouter les liens Saisonniers → permanents
10. Ajouter les liens Guides produits → Prix

### Metriques de suivi
- Surveiller dans GSC : pages crawlees/jour (devrait augmenter)
- Surveiller : profondeur de crawl moyenne (devrait diminuer)
- Surveiller : impressions des articles orphelins (devrait decoller)
- A/B test possible : comparer les articles avec liens ajoutes vs sans pendant 4 semaines
