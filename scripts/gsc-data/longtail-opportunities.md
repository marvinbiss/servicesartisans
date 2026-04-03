# Rapport : Opportunites mots-cles longue traine - ServicesArtisans

**Date** : 2026-04-03
**Methode** : 25 recherches web (Google Autocomplete, People Also Ask, forums, sites concurrents)
**Objectif** : Identifier les 50 meilleures opportunites de mots-cles longue traine non couverts par les ~500 articles existants

---

## Methodologie

- 25 recherches Google effectuees couvrant 5 categories (prix prestations, problemes specifiques, questions frequentes, aides locales, urgences/pratique)
- Comparaison systematique avec les slugs existants dans `src/lib/data/blog/`
- Scoring : Volume estime (V) x Pertinence annuaire (P) x Facilite de ranking (F) sur 10
- Concurrents analyses : prix-pose.com, travaux.com, renovationettravaux.fr, habitatpresto.com, ootravaux.fr, mesdepanneurs.fr

---

## Etat des lieux : couverture actuelle

### Bien couvert (ne PAS creer d'article)
- Prix par metier (plombier, electricien, serrurier, etc.) -- ~20 articles batch-prix
- Prix par ville -- ~200 articles batch-prix-villes
- MaPrimeRenov / eco-PTZ / aides nationales -- ~15 articles
- Comment choisir [metier] -- ~25 articles batch-metiers
- Urgences (fuite eau, panne elec, serrure cassee) -- ~10 articles batch-urgences
- Tutoriels DIY (deboucher WC, changer robinet, etc.) -- ~25 articles
- Saisonnier (ramonage, purge radiateurs, hivernage piscine) -- ~15 articles

### Lacunes identifiees (FORT potentiel)
- **Prix par prestation specifique** (chauffe-eau, baignoire->douche, parquet/m2, etc.)
- **Problemes diagnostics** (radiateur froid, humidite, fissures, bruits)
- **Questions juridiques artisans** (refus paiement, devis gratuit?, abandon chantier)
- **Aides locales par ville** (Nantes, Nice, Strasbourg, Lille -- seulement Paris/Lyon/Marseille/Bordeaux/Toulouse couverts)
- **Renovation specifique** (haussmannien, demolition mur porteur, tableau electrique)

---

## Top 50 opportunites classees par potentiel

### Categorie A : Prix par prestation specifique (Volume TRES eleve)

| # | Mot-cle cible | Volume est. | Score | Slug existant ? | Notes |
|---|---------------|-------------|-------|-----------------|-------|
| 1 | prix remplacement chauffe eau 2026 | 12K/mois | 9.5 | NON | Enorme demande. Concurrence moderee. Facile a ranker avec contenu detaille par type (elec/gaz/thermo) |
| 2 | prix remplacement baignoire par douche 2026 | 8K/mois | 9.5 | NON | Tres recherche, lie au vieillissement population + MaPrimeAdapt'. Angle senior/PMR |
| 3 | prix pose parquet m2 2026 | 10K/mois | 9.0 | PARTIEL (comparatif parquet) | L'article existant est un comparatif materiaux, pas un guide prix complet avec pose |
| 4 | prix refaire electricite appartement 2026 | 8K/mois | 9.0 | PARTIEL (refaire-electricite-maison-ancienne) | Existant = maison ancienne. Manque : specifique APPARTEMENT avec normes copro |
| 5 | prix ravalement facade immeuble 2026 | 6K/mois | 9.0 | PARTIEL (prix-ravalement-facade-2026) | Existant = general. Manque : specifique IMMEUBLE avec charges copro |
| 6 | prix agrandissement maison 20m2 2026 | 8K/mois | 9.0 | PARTIEL (prix-extension-maison-2026) | Existant = general. La requete "20m2" est ultra-specifique et tres recherchee |
| 7 | prix renovation complete appartement m2 2026 | 10K/mois | 9.0 | PARTIEL (prix-renovation-appartement-2026-budget) | Existant = budget. Manque : guide exhaustif au m2 par type de reno (legere/lourde/totale) |
| 8 | prix installation douche italienne 2026 | 7K/mois | 9.0 | NON | Tendance forte. Lie a baignoire->douche. Angle transformation + neuf |
| 9 | prix remplacement tableau electrique 2026 | 5K/mois | 8.5 | NON | Pas couvert. Forte demande (mise aux normes NF C 15-100) |
| 10 | prix isolation exterieure maison 100m2 2026 | 6K/mois | 8.5 | NON | Requete ultra-specifique. Angle aides MaPrimeRenov + ROI |
| 11 | prix demolition mur porteur appartement 2026 | 4K/mois | 8.5 | NON | Niche rentable. Copropriete, BET, IPN -- contenu expert |
| 12 | prix creation ouverture fenetre mur 2026 | 3K/mois | 8.0 | NON | Niche. Porteur vs non-porteur, permis de construire |
| 13 | prix renovation salle de bain 5m2 2026 | 5K/mois | 8.5 | PARTIEL (renovation-salle-de-bain-prix-guide-2026) | Manque : specifique petite surface (tres recherche car apparts) |
| 14 | prix pose cuisine equipee 2026 | 6K/mois | 8.0 | PARTIEL (cuisine-equipee-prix-pose-2026) | Deja couvert mais peut etre enrichi avec People Also Ask |

### Categorie B : Problemes / diagnostics (Trafic informationnel FORT)

| # | Mot-cle cible | Volume est. | Score | Slug existant ? | Notes |
|---|---------------|-------------|-------|-----------------|-------|
| 15 | radiateur qui ne chauffe pas que faire | 15K/mois | 9.5 | NON | Enorme trafic saisonnier (oct-mars). Guide diagnostic + quand appeler chauffagiste |
| 16 | humidite mur interieur solution | 12K/mois | 9.0 | PARTIEL (humidite-moisissure-maison-solutions) | Existant = moisissure global. Manque : specifique MUR INTERIEUR avec causes/solutions detaillees |
| 17 | fissure mur porteur danger | 6K/mois | 9.0 | NON | Zero couverture. Sujet anxiogene = fort CTR. Lie a diagnostic + expert |
| 18 | bruit tuyauterie appartement solution | 4K/mois | 8.5 | NON | Pas couvert. Coup de belier, colliers, coffrage -- plombier necessaire |
| 19 | wc bouche que faire solution rapide | 8K/mois | 7.0 | COUVERT (comment-deboucher-wc-guide) | Bien couvert mais pourrait etre enrichi avec angle "urgence nuit" |
| 20 | fuite robinet goutte a goutte que faire | 5K/mois | 8.0 | NON | Pas d'article specifique. DIY vs appel plombier |
| 21 | chaudiere qui fait du bruit claquement | 4K/mois | 8.5 | NON | Diagnostic sonore. Saisonnier hiver. Lie a entretien chaudiere |
| 22 | odeur egout salle de bain cause | 5K/mois | 8.0 | NON | Frequemment recherche. Siphon sec, joint, VMC -- guide pratique |
| 23 | prise electrique qui grille ou fond | 3K/mois | 8.5 | NON | Sujet securite = engagement fort. Quand appeler electricien d'urgence |
| 24 | infiltration eau toiture que faire | 5K/mois | 8.0 | PARTIEL (toiture-fuite-urgence-que-faire) | Existant = urgence. Manque : guide complet infiltration chronique |
| 25 | mur qui se fissure maison neuve | 3K/mois | 8.0 | NON | Garantie decennale, expertise, recours -- contenu juridique + technique |

### Categorie C : Questions juridiques / pratiques artisans (Tres forte conversion)

| # | Mot-cle cible | Volume est. | Score | Slug existant ? | Notes |
|---|---------------|-------------|-------|-----------------|-------|
| 26 | est ce qu un devis est gratuit | 8K/mois | 9.5 | NON | Enorme requete. Legifrance + pratique. Lie directement a "demander un devis" = conversion |
| 27 | peut on refuser de payer un artisan | 6K/mois | 9.0 | PARTIEL (litige-artisan-recours-mediation-justice) | Existant = litige general. Manque : specifique REFUS PAIEMENT malfacons |
| 28 | artisan qui ne finit pas les travaux recours | 5K/mois | 9.0 | NON | Pas couvert. Mise en demeure, huissier, tribunal -- guide complet |
| 29 | combien de devis faut il demander | 5K/mois | 8.5 | PARTIEL (devis-travaux-comprendre) | Existant = comprendre un devis. Manque : combien en demander + comment comparer |
| 30 | obligation entretien chaudiere locataire proprietaire | 6K/mois | 8.5 | NON | Pas couvert. Question tres frequente. Locataire vs proprio, attestation |
| 31 | delai de retractation devis signe travaux | 4K/mois | 8.5 | NON | Question juridique courante. 14 jours demarchage, 0 jour en magasin |
| 32 | garantie decennale que couvre t elle exactement | 4K/mois | 7.5 | COUVERT (garantie-decennale-tout-savoir) | Existe mais pourrait etre enrichi avec cas concrets |
| 33 | comment verifier si artisan RGE | 4K/mois | 8.0 | NON | Pas couvert. Annuaire France Renov, Qualibat, SIRET -- indispensable avant aides |
| 34 | acompte travaux pourcentage legal maximum | 3K/mois | 8.5 | NON | Pas couvert. Sujet legal precis, forte conversion |
| 35 | facture artisan sans devis que faire | 3K/mois | 8.0 | NON | Protection consommateur. Lien avec nos services |

### Categorie D : Aides locales par ville (SEO local, faible concurrence)

| # | Mot-cle cible | Volume est. | Score | Slug existant ? | Notes |
|---|---------------|-------------|-------|-----------------|-------|
| 36 | aide renovation energetique nantes 2026 | 2K/mois | 8.5 | NON | Mon Projet Renov, Maison de l'Habitant -- contenu local unique |
| 37 | aide renovation energetique nice 2026 | 2K/mois | 8.5 | NON | Metropole Nice Cote d'Azur, 4000EUR audit, 6000EUR PAC |
| 38 | aide renovation energetique strasbourg 2026 | 1.5K/mois | 8.5 | NON | Eurometropole 6M EUR enveloppe, Agence du Climat, Oktave |
| 39 | aide renovation energetique lille 2026 | 2K/mois | 8.5 | NON | AMELIO, MEL, Maison Habitat Durable |
| 40 | aide renovation energetique rennes 2026 | 1.5K/mois | 8.0 | NON | A creer |
| 41 | aide renovation energetique montpellier 2026 | 1.5K/mois | 8.0 | NON | A creer |
| 42 | aide renovation energetique grenoble 2026 | 1K/mois | 7.5 | NON | A creer |
| 43 | aide renovation energetique rouen 2026 | 1K/mois | 7.5 | NON | A creer |
| 44 | aide renovation energetique toulon 2026 | 1K/mois | 7.5 | NON | A creer |

### Categorie E : Renovation specifique / niches (Forte intention, peu de concurrence)

| # | Mot-cle cible | Volume est. | Score | Slug existant ? | Notes |
|---|---------------|-------------|-------|-----------------|-------|
| 45 | renovation appartement haussmannien prix paris | 3K/mois | 8.5 | NON | Niche premium Paris. 880-1380EUR/m2. Moulures, parquet, cheminee |
| 46 | tarif depannage serrurier nuit weekend | 4K/mois | 8.0 | PARTIEL (serrure-bloquee-nuit-weekend) | Existant = urgence. Manque : grille tarifaire detaillee jour/nuit/weekend |
| 47 | prix renovation maison annees 70 | 3K/mois | 8.0 | NON | Niche temporelle. Amiante, elec non conforme, isolation inexistante |
| 48 | comment savoir si artisan est assure | 3K/mois | 8.0 | NON | Verification RC pro + decennale. Lien avec nos fiches artisans verifies |
| 49 | aide adaptation logement senior 2026 | 3K/mois | 8.0 | PARTIEL (adaptation-logement-senior-aides-2026) | Existe mais MaPrimeAdapt' a evolue en 2026. A mettre a jour |
| 50 | prix construction maison plain pied 100m2 2026 | 5K/mois | 7.5 | NON | Hors coeur de metier annuaire mais fort trafic. Poids SEO domaine |

---

## Synthese strategique

### Priorite 1 -- Impact immediat (a creer en premier, ROI max)

**8 articles "prix prestation specifique"** (positions 1-8, 10-11) :
- prix-remplacement-chauffe-eau-2026
- prix-remplacement-baignoire-douche-2026
- prix-pose-parquet-m2-2026
- prix-refaire-electricite-appartement-2026
- prix-installation-douche-italienne-2026
- prix-remplacement-tableau-electrique-2026
- prix-isolation-exterieure-maison-100m2-2026
- prix-demolition-ouverture-mur-porteur-2026

**Volume cumule estime : ~60K recherches/mois**
Format : 2000+ mots, tableaux de prix, FAQ schema, CTA devis

### Priorite 2 -- Problemes diagnostics (trafic saisonnier massif)

**6 articles "probleme que faire"** (positions 15-18, 20-24) :
- radiateur-qui-ne-chauffe-pas-que-faire
- fissure-mur-porteur-danger-solutions
- bruit-tuyauterie-appartement-solutions
- fuite-robinet-goutte-a-goutte-reparation
- chaudiere-bruit-claquement-diagnostic
- odeur-egout-salle-de-bain-cause-solution
- prise-electrique-qui-fond-danger

**Volume cumule estime : ~40K recherches/mois**
Format : guide diagnostic illustre, quand DIY vs quand appeler pro, CTA artisan

### Priorite 3 -- Questions juridiques (conversion maximale)

**7 articles "questions pratiques"** (positions 26-35) :
- devis-gratuit-ou-payant-regle
- refuser-payer-artisan-travaux-mal-faits
- artisan-ne-finit-pas-travaux-recours
- obligation-entretien-chaudiere-locataire-proprietaire
- delai-retractation-devis-signe-travaux
- verifier-artisan-rge-certification
- acompte-travaux-pourcentage-legal

**Volume cumule estime : ~30K recherches/mois**
Format : article juridique vulgarise, references Code consommation, CTA devis

### Priorite 4 -- Aides locales (SEO local, faible concurrence)

**9 articles "aide renovation [ville] 2026"** (positions 36-44) :
Nantes, Nice, Strasbourg, Lille, Rennes, Montpellier, Grenoble, Rouen, Toulon

Complement aux 5 villes deja couvertes (Paris, Lyon, Marseille, Bordeaux, Toulouse) = **14 grandes villes couvertes**

**Volume cumule estime : ~15K recherches/mois**
Format : montants aides locales, contacts, conditions, cumul MaPrimeRenov

### Priorite 5 -- Niches renovation (premium, faible concurrence)

**4 articles niche** (positions 45-50) :
- renovation-appartement-haussmannien-prix
- prix-renovation-maison-annees-70
- comment-savoir-artisan-assure-verification
- tarif-depannage-serrurier-nuit-weekend-grille

---

## Metriques cibles

| Indicateur | Objectif |
|-----------|----------|
| Nombre d'articles a creer | 34 nouveaux + 8 enrichissements |
| Volume total incremental | ~150K recherches/mois |
| Temps de production | 2-3 semaines (batch de 10/semaine) |
| Position cible | Top 5 Google en 3-6 mois |
| Taux conversion estime | 2-4% vers demande de devis |

---

## Articles existants a enrichir (Quick Wins)

Ces articles existent mais manquent de sous-themes identifies par les recherches :

1. **humidite-moisissure-maison-solutions** -- ajouter section "mur interieur specifique" + injection resine
2. **devis-travaux-comprendre** -- ajouter "combien de devis demander" + tableau comparatif
3. **litige-artisan-recours-mediation-justice** -- ajouter "refus paiement malfacons" + consignation fonds
4. **prix-ravalement-facade-2026** -- ajouter section "immeuble copropriete" + repartition charges
5. **prix-extension-maison-2026** -- ajouter section "20m2" avec prix par materiau
6. **serrure-bloquee-nuit-weekend** -- ajouter grille tarifaire jour/nuit/weekend/ferie
7. **adaptation-logement-senior-aides-2026** -- mettre a jour avec MaPrimeAdapt' 2026
8. **renovation-salle-de-bain-prix-guide-2026** -- ajouter section "petite salle de bain 3-5m2"

---

## Sources principales des donnees concurrentielles

- [Travaux.com](https://www.travaux.com) -- guides prix exhaustifs
- [Prix-pose.com](https://www.prix-pose.com) -- leader prix travaux
- [Renovationettravaux.fr](https://www.renovationettravaux.fr) -- articles longs SEO
- [Habitatpresto.com](https://www.habitatpresto.com) -- problemes/diagnostics
- [MesDepanneurs.fr](https://www.mesdepanneurs.fr) -- urgences et depannage
- [Ootravaux.fr](https://www.ootravaux.fr) -- prix et devis
- [Hellowatt.fr](https://www.hellowatt.fr) -- energie et renovation
- [IZI by EDF](https://izi-by-edf.fr) -- tutoriels et prix
- [Service-public.gouv.fr](https://www.service-public.gouv.fr) -- obligations legales
- [Economie.gouv.fr](https://www.economie.gouv.fr) -- protection consommateur
