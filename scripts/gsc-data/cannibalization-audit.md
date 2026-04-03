# Audit de Cannibalisation SEO — ServicesArtisans Blog

**Date :** 2026-04-03  
**Scope :** ~500 articles blog (36 fichiers batch + existing-articles.ts + batch-prix-villes dynamique)  
**Methode :** Extraction exhaustive des metaTitle (ou title quand metaTitle absent) de chaque article, regroupement par intent semantique et mot-cle cible.

---

## Resume Executif

| Metrique | Valeur |
|----------|--------|
| Groupes de cannibalisation identifies | **27** |
| Articles impliques | **~130** (sur ~500 total) |
| Severite CRITIQUE (meme mot-cle exact) | **12 groupes** |
| Severite HAUTE (meme intent, formulation differente) | **10 groupes** |
| Severite MOYENNE (chevauchement partiel) | **5 groupes** |

---

## PARTIE 1 — CANNIBALISATION CRITIQUE (meme mot-cle cible)

### GROUPE 1 : "MaPrimeRenov 2026" — 4 articles en competition

| Fichier | Cle (slug) | metaTitle / title |
|---------|-----------|-------------------|
| existing-articles.ts | `maprimerenov-bareme-2026` | MaPrimeRenov' 2026 : jusqu'a 40 000EUR -- Bareme complet |
| batch-aides-2026.ts | `maprimerénov-2026-conditions-montants` | MaPrimeRenov' 2026 : Montants et Conditions -- Guide 2026 |
| batch-seo-boost1.ts | `maprimerenov-2026-guide-complet-aides-renovation` | MaPrimeRenov' 2026 : Aides Renovation |
| batch-aides-saisonnier.ts | (article 1) | MaPrimeRenov' 2026 : montants, conditions et demarches completes |

**Diagnostic :** 4 articles ciblent exactement "MaPrimeRenov 2026" avec le meme intent informatif. Google ne sait pas lequel positionner.

**Recommandation :**
- **PILIER** : `batch-aides-2026.ts` / `maprimerénov-2026-conditions-montants` — le plus complet (bareme par profil, demarches, conditions)
- `existing-articles.ts` → renommer en **"Bareme MaPrimeRenov' 2026 : Montants par Profil Bleu, Jaune, Violet, Rose"** (angle bareme/tableau uniquement)
- `batch-seo-boost1.ts` → **SUPPRIMER ou rediriger 301** vers le pilier (article doublon pur)
- `batch-aides-saisonnier.ts` → renommer en **"MaPrimeRenov' 2026 : Nouveautes et Changements vs 2025"** (angle actualite/evolution)

---

### GROUPE 2 : "Eco-PTZ 2026" — 3 articles en competition

| Fichier | metaTitle / title |
|---------|-------------------|
| batch-aides-2026.ts | Eco-PTZ 2026 : Jusqu'a 50 000EUR a Taux Zero -- Guide 2026 |
| batch-reglementation.ts | Eco-PTZ 2026 : jusqu'a 50 000EUR a taux zero -- Guide |
| batch-seo-boost3.ts | Eco-PTZ 2026 : Pret a Taux Zero Travaux |

**Diagnostic :** Les 2 premiers sont quasi-identiques (meme formulation a la casse pres). Le 3eme est un doublon allege.

**Recommandation :**
- **PILIER** : `batch-aides-2026.ts` (le plus detaille, contexte aides)
- `batch-reglementation.ts` → renommer en **"Eco-PTZ et Travaux : Quels Chantiers Eligibles en 2026 ?"** (angle reglementaire/eligibilite)
- `batch-seo-boost3.ts` → **SUPPRIMER ou 301** vers le pilier

---

### GROUPE 3 : "CEE / Prime Energie 2026" — 2 articles en competition

| Fichier | metaTitle / title |
|---------|-------------------|
| batch-aides-2026.ts | CEE 2026 : Prime Energie et Montants -- Guide 2026 |
| batch-reglementation.ts | CEE : Certificats d'Economies d'Energie 2026 |

**Recommandation :**
- **PILIER** : `batch-aides-2026.ts` (angle montants/beneficiaire)
- `batch-reglementation.ts` → renommer en **"CEE 2026 : Comment ca Marche pour les Artisans et Entreprises ?"** (angle pro/reglementaire)

---

### GROUPE 4 : "Prix Plombier 2026" — 3 articles + articles villes

| Fichier | metaTitle / title |
|---------|-------------------|
| existing-articles.ts | Prix Plombier 2026 : Tarifs Depannage, Reparation et Devis Gratuit |
| existing-articles.ts | Combien coute un plombier ? 40-90EUR/h en 2026 |
| batch-prix-regionaux.ts | Tarifs Plombier par Ville 2026 : Paris vs Lyon... |
| batch-prix-villes.ts | (genere) Prix Plombier {Ville} 2026 -- Tarifs et Devis Gratuit |

**Diagnostic :** "Prix plombier" et "combien coute un plombier" = meme requete utilisateur. L'article regionaux concurrence les articles villes.

**Recommandation :**
- **PILIER** : `Prix Plombier 2026 : Tarifs Depannage, Reparation et Devis Gratuit` (le plus complet)
- `Combien coute un plombier` → renommer en **"Plombier : Comprendre sa Facture (Main-d'oeuvre, Deplacement, Fournitures)"** (angle decomposition facture)
- `batch-prix-regionaux.ts` article plombier → renommer en **"Ecarts de Prix Plombier entre Regions 2026 : +40% en IDF"** (angle regional unique)

---

### GROUPE 5 : "Prix Electricien 2026" — 2 articles + articles villes

| Fichier | metaTitle / title |
|---------|-------------------|
| existing-articles.ts | Prix Electricien 2026 : Tarifs au m2, Intervention et Devis Gratuit |
| batch-prix-regionaux.ts | Prix Electricien par Departement 2026 : 35-95EUR/h |

**Recommandation :**
- **PILIER** : `existing-articles.ts` (national)
- `batch-prix-regionaux.ts` → OK tel quel, angle "par departement" suffisamment different. Mais verifier le contenu pour eviter les paragraphes copier-coller.

---

### GROUPE 6 : "Renovation Salle de Bain 2026" — 4 articles en competition

| Fichier | metaTitle / title |
|---------|-------------------|
| existing-articles.ts | Renover Salle de Bain 2026 : Budget + Etapes |
| batch-prix.ts | Prix Salle de Bain 2026 : 3 000-25 000EUR |
| batch-renovation-2026.ts | Renovation Salle de Bain : Prix et Guide 2026 |
| batch-seo-boost2.ts | Renovation Salle de Bain 2026 : Prix |

**Diagnostic :** 4 articles pour "renovation salle de bain 2026". C'est le pire cas de cannibalisation du site.

**Recommandation :**
- **PILIER** : `existing-articles.ts` — "Renover Salle de Bain 2026 : Budget + Etapes" (guide complet)
- `batch-prix.ts` → renommer en **"Cout Salle de Bain 2026 : Devis Detaille par Poste (Carrelage, Plomberie, Meuble)"** (angle decomposition prix)
- `batch-renovation-2026.ts` → **SUPPRIMER ou 301** vers le pilier (doublon pur)
- `batch-seo-boost2.ts` → **SUPPRIMER ou 301** vers le pilier (doublon pur)

---

### GROUPE 7 : "Devis Travaux / Comparer Devis" — 3 articles en competition

| Fichier | metaTitle / title |
|---------|-------------------|
| existing-articles.ts | Devis Travaux : 5 pieges a eviter en 2026 |
| existing-articles.ts | Comparer des Devis Travaux : 5 criteres cles |
| batch-renovation-2026.ts | Devis Travaux : Guide pour Comparer et Negocier |
| batch-seo-boost2.ts | Devis Travaux : Comparer et Negocier |

**Recommandation :**
- **PILIER** : `Devis Travaux : 5 pieges a eviter en 2026` (angle "pieges" unique et attirant)
- `Comparer des Devis Travaux` → renommer en **"Tableau Comparatif Devis : Comment Lire et Analyser Chaque Ligne"** (angle technique)
- `batch-renovation-2026.ts` → **301** vers le pilier
- `batch-seo-boost2.ts` → **301** vers le pilier

---

### GROUPE 8 : "Choisir son Plombier 2026" / "Verifier un Artisan" — 4 articles voisins

| Fichier | metaTitle / title |
|---------|-------------------|
| existing-articles.ts | Choisir son Plombier en 2026 : 7 verifications |
| existing-articles.ts | Verifier un Artisan par son SIREN : Comment ? |
| existing-articles.ts | Verifier un Artisan avant de signer (Guide 2026) |
| batch-seo-boost1.ts | Choisir un Artisan de Confiance 2026 |

**Diagnostic :** "Verifier un artisan" et "Verifier un artisan avant de signer" se cannibalisent directement. "Choisir un artisan de confiance" est un concurrent generique.

**Recommandation :**
- **PILIER verification** : `Verifier un Artisan avant de signer (Guide 2026)` (le plus large)
- `Verifier par SIREN` → renommer en **"Verifier le SIREN d'un Artisan : Tutoriel Pas a Pas (URSSAF, Insee)"** (angle outil specifique)
- `Choisir son Plombier` → OK (angle metier specifique, pas de cannibalisation)
- `batch-seo-boost1.ts` "Choisir un Artisan de Confiance" → **301** vers "Verifier un Artisan avant de signer"

---

### GROUPE 9 : "Pompe a Chaleur 2026 / PAC" — 4 articles en competition

| Fichier | metaTitle / title |
|---------|-------------------|
| existing-articles.ts | PAC vs Chaudiere Gaz 2026 : le vrai comparatif |
| batch-energie-2026.ts | Prix Pompe a Chaleur en 2026 : Couts, Aides et Rentabilite |
| batch-securite-energie.ts | Pompe a chaleur air-eau en 2026 : prix, aides et rentabilite |
| batch-seo-boost1.ts | Pompe a Chaleur 2026 : Prix et Aides |
| batch-produits-materiaux.ts | Pompe a Chaleur Air-Eau : Guide Complet 2026 |
| batch-projets.ts | Pompe a Chaleur Air-Eau 2026 : Guide |

**Diagnostic :** 6 articles sur "pompe a chaleur 2026". Cas le plus grave en volume. Google va distribuer le rank entre tous = aucun ne sera en top 3.

**Recommandation :**
- **PILIER prix** : `batch-energie-2026.ts` "Prix Pompe a Chaleur en 2026" (le plus detaille en prix)
- **PILIER comparatif** : `existing-articles.ts` "PAC vs Chaudiere Gaz" (angle comparaison, mot-cle different)
- `batch-securite-energie.ts` → **301** vers le pilier prix (quasi-identique)
- `batch-seo-boost1.ts` → **301** vers le pilier prix (doublon)
- `batch-produits-materiaux.ts` → renommer en **"Pompe a Chaleur Air-Eau : Fonctionnement, COP et Dimensionnement"** (angle technique/produit)
- `batch-projets.ts` → renommer en **"Installer une PAC Air-Eau : Etapes, Delais et Devis"** (angle projet)

---

### GROUPE 10 : "Panneaux Solaires 2026" — 3 articles en competition

| Fichier | metaTitle / title |
|---------|-------------------|
| batch-energie-2026.ts | Prix Panneaux Solaires en 2026 : Installation, Rentabilite et Aides |
| batch-securite-energie.ts | Panneaux solaires 2026 : rentabilite reelle et retour sur investissement |
| batch-projets.ts | Panneaux Solaires 2026 : Installation |

**Recommandation :**
- **PILIER** : `batch-energie-2026.ts` (le plus complet)
- `batch-securite-energie.ts` → renommer en **"Panneaux Solaires : Rentabilite Reelle apres 5, 10 et 20 ans (Calcul)"** (angle ROI pur)
- `batch-projets.ts` → renommer en **"Installer des Panneaux Solaires en 2026 : Demarches, Raccordement, Delais"** (angle pratique)

---

### GROUPE 11 : "Arnaques Artisans / Batiment" — 3 articles

| Fichier | metaTitle / title |
|---------|-------------------|
| existing-articles.ts | 10 Arnaques Batiment a Connaitre en 2026 |
| existing-articles.ts | Artisan Pas Cher = Arnaque ? Les signaux 2026 |
| batch-seo-boost2.ts | Arnaques Artisans : Reconnaitre et Eviter |

**Recommandation :**
- **PILIER** : `10 Arnaques Batiment a Connaitre en 2026` (angle listicle performant)
- `Artisan Pas Cher = Arnaque ?` → OK (angle different : prix bas vs arnaque)
- `batch-seo-boost2.ts` → **301** vers le pilier

---

### GROUPE 12 : "Entretien Maison Checklist" — 3 articles

| Fichier | metaTitle / title |
|---------|-------------------|
| batch-conseils.ts | Entretien Maison 2026 : Checklist |
| batch-seo-boost2.ts | Entretien Maison : Checklist Annuelle 2026 |
| batch-aides-saisonnier.ts | Check-list entretien maison printemps 2026 : 15 points essentiels |

**Recommandation :**
- **PILIER** : `batch-conseils.ts` (annuel, le plus large)
- `batch-seo-boost2.ts` → **301** vers le pilier (identique)
- `batch-aides-saisonnier.ts` → OK (angle "printemps" specifique, pas de conflit si le title reste saisonnier)

---

## PARTIE 2 — CANNIBALISATION HAUTE (meme intent, formulation differente)

### GROUPE 13 : "Renovation Energetique 2026"

| Fichier | metaTitle / title |
|---------|-------------------|
| existing-articles.ts | Renovation Energetique 2026 : ordre des travaux |
| batch-prix-services.ts | Prix Renovation Energetique 2026 : Devis Gratuit |
| batch-prix-regionaux.ts | Prix Renovation Energetique par Region 2026 |
| batch-seo-boost3.ts | Renovation Energetique 2026 : Par Ou Commencer |
| batch-saisonniers-2026.ts | Renovation energetique : quelle saison ? |

**Recommandation :**
- **PILIER guide** : `existing-articles.ts` "ordre des travaux" (guide principal)
- **PILIER prix** : `batch-prix-services.ts` (angle tarifaire, OK)
- `batch-prix-regionaux.ts` → OK (angle regional, pas de conflit direct)
- `batch-seo-boost3.ts` → **301** vers le pilier guide (meme intent "par ou commencer" = "ordre des travaux")
- `batch-saisonniers-2026.ts` → renommer en **"Meilleure Saison pour Renover : Printemps, Ete ou Automne ?"** (angle saisonnier unique)

---

### GROUPE 14 : "Aides Renovation 2026 / Cumul Aides"

| Fichier | metaTitle / title |
|---------|-------------------|
| existing-articles.ts | Aides Renovation 2026 : jusqu'a 80% finances -- Guide |
| batch-aides-2026.ts | Cumul Aides Renovation 2026 : Tableau Complet -- Guide 2026 |
| batch-reglementation.ts | Cumuler les Aides Renovation 2026 : methode |
| batch-aides-saisonnier.ts | Cumul des aides renovation 2026 : MaPrimeRenov' + CEE + eco-PTZ |

**Recommandation :**
- **PILIER general** : `existing-articles.ts` (panorama complet des aides)
- **PILIER cumul** : `batch-aides-2026.ts` (tableau detaille de cumul)
- `batch-reglementation.ts` → **301** vers le pilier cumul (doublon)
- `batch-aides-saisonnier.ts` → **301** vers le pilier cumul (doublon)

---

### GROUPE 15 : "Isolation Maison / Isolation Thermique 2026"

| Fichier | metaTitle / title |
|---------|-------------------|
| batch-prix-services.ts | Prix Isolation Thermique 2026 : Devis Gratuit |
| batch-seo-boost1.ts | Isolation Maison 2026 : Prix et Aides |
| batch-produits-materiaux.ts | Isolation des Combles : Materiaux, Prix et Aides |
| batch-comparatifs-materiaux.ts | Quel est le meilleur isolant thermique ? Comparatif 2026 |
| batch-saisonniers-2026.ts | Isolation combles en ete : preparer l'hiver |
| batch-conseils.ts | Isolation Phonique : Contre le Bruit |

**Recommandation :**
- **PILIER prix** : `batch-prix-services.ts` (angle prix/devis)
- `batch-seo-boost1.ts` → **301** vers le pilier prix (doublon)
- `batch-produits-materiaux.ts` → renommer en **"Isolation des Combles : Soufflage, Rouleaux ou Panneaux ? Guide Choix"** (angle materiau/technique)
- `batch-comparatifs-materiaux.ts` → OK (angle comparatif materiaux specifique)
- `batch-saisonniers-2026.ts` → OK (angle saisonnier specifique)
- `batch-conseils.ts` → OK (angle phonique, pas thermique = mot-cle different)

---

### GROUPE 16 : "Prix Renovation Maison / Appartement 2026"

| Fichier | metaTitle / title |
|---------|-------------------|
| batch-prix.ts | Prix Renovation Appart 2026 : 200-2 500EUR/m2 |
| batch-renovation-2026.ts | Prix Renovation Maison au m2 en 2026 |
| batch-seo-boost1.ts | Prix Renovation Maison 2026 : Budget |
| batch-prix-regionaux.ts | Prix Renovation par Region 2026 : 450-3 500EUR/m2 |

**Recommandation :**
- **PILIER maison** : `batch-renovation-2026.ts` (le plus complet)
- `batch-prix.ts` → OK (angle "appartement" = requete differente)
- `batch-seo-boost1.ts` → **301** vers le pilier maison (doublon)
- `batch-prix-regionaux.ts` → OK (angle regional distinct)

---

### GROUPE 17 : "TVA Travaux 2026 : 5,5% / 10% / 20%"

| Fichier | metaTitle / title |
|---------|-------------------|
| batch-aides-2026.ts | TVA Reduite Travaux : 5,5% vs 10% vs 20% -- Guide 2026 |
| batch-reglementation.ts | TVA Travaux : 5,5 %, 10 % ou 20 % ? |

**Recommandation :**
- **PILIER** : `batch-aides-2026.ts` (plus complet, angle aide financiere)
- `batch-reglementation.ts` → renommer en **"TVA Travaux : Conditions d'Application et Attestation Cerfa"** (angle administratif/cerfa)

---

### GROUPE 18 : "DPE / Diagnostic Energetique 2026"

| Fichier | metaTitle / title |
|---------|-------------------|
| batch-aides-2026.ts | Audit Energetique Obligatoire : Prix et Guide -- Guide 2026 |
| batch-reglementation.ts | Audit et DPE : Obligations 2026 |
| batch-seo-boost2.ts | DPE 2026 : Diagnostic de Performance |
| batch-energie-2026.ts | DPE Obligatoire 2026 : Tout ce qui Change pour les Proprietaires |

**Recommandation :**
- **PILIER DPE** : `batch-energie-2026.ts` (le plus complet sur le DPE)
- **PILIER audit** : `batch-aides-2026.ts` (angle audit energetique, distinct du DPE)
- `batch-reglementation.ts` → renommer en **"Obligations DPE Vente et Location : Seuils 2026"** (angle legal/obligation)
- `batch-seo-boost2.ts` → **301** vers le pilier DPE

---

### GROUPE 19 : "Passoire Thermique / Interdiction Location"

| Fichier | metaTitle / title |
|---------|-------------------|
| batch-aides-2026.ts | Passoire Thermique : Interdiction Location -- Guide 2026 |
| batch-energie-2026.ts | Passoires Thermiques : Interdiction de Location en 2026 |

**Recommandation :**
- **PILIER** : `batch-aides-2026.ts` (plus complet avec les aides)
- `batch-energie-2026.ts` → renommer en **"Propriétaire d'un Logement DPE G : Que Faire Avant l'Interdiction 2026 ?"** (angle action/proprietaire)

---

### GROUPE 20 : "Cuisine Equipee 2026 / Choisir Cuisiniste"

| Fichier | metaTitle / title |
|---------|-------------------|
| existing-articles.ts | Choisir sa Cuisine Equipee : Guide 2026 |
| batch-prix.ts | Prix Cuisine Equipee 2026 : 3 000-40 000EUR |
| batch-renovation-2026.ts | Prix Cuisine Equipee avec Pose en 2026 |
| batch-metiers.ts | Choisir son Cuisiniste : 7 criteres (2026) |
| batch-projets.ts | Renover sa Cuisine 2026 : Guide Etapes |

**Recommandation :**
- **PILIER guide** : `existing-articles.ts` "Choisir sa Cuisine"
- **PILIER prix** : `batch-prix.ts` (angle tarifaire)
- `batch-renovation-2026.ts` → **301** vers le pilier prix (doublon prix cuisine)
- `batch-metiers.ts` → OK (angle "choisir un cuisiniste" = professionnel, pas le produit)
- `batch-projets.ts` → renommer en **"Renover sa Cuisine : Etapes Chronologiques et Planning"** (angle projet/planning)

---

### GROUPE 21 : "Preparer sa Maison pour l'Hiver"

| Fichier | metaTitle / title |
|---------|-------------------|
| batch-conseils.ts | Preparer sa Maison pour l'Hiver : Guide |
| batch-saisonnier.ts | Preparer sa maison pour l'hiver : la check-list complete |
| batch-saisonnier-urgence.ts | Preparer sa maison pour l'hiver : checklist complete |
| batch-saisonniers-2026.ts | Chauffage hiver 2026 : check-list entretien |

**Recommandation :**
- **PILIER** : `batch-saisonnier.ts` (le plus ancien/complet)
- `batch-conseils.ts` → **301** vers le pilier
- `batch-saisonnier-urgence.ts` → **301** vers le pilier (identique)
- `batch-saisonniers-2026.ts` → OK (angle chauffage specifique)

---

### GROUPE 22 : "Alarme Maison 2026"

| Fichier | metaTitle / title |
|---------|-------------------|
| batch-metiers-5.ts | Alarme Maison 2026 : Guide Complet pour Proteger Votre Domicile |
| batch-securite-energie.ts | Alarme maison 2026 : comparatif, prix et installation |
| batch-prix-tech.ts | Prix Alarme Securite 2026 -- Devis Gratuit |

**Recommandation :**
- **PILIER guide** : `batch-metiers-5.ts` (guide complet)
- `batch-securite-energie.ts` → renommer en **"Comparatif Alarmes 2026 : Filaire, Sans Fil, Connectee -- Lequel Choisir ?"** (angle comparatif produit)
- `batch-prix-tech.ts` → OK (angle prix/devis uniquement)

---

## PARTIE 3 — CANNIBALISATION MOYENNE (chevauchement partiel)

### GROUPE 23 : "Extension Maison 2026"

| Fichier | metaTitle / title |
|---------|-------------------|
| batch-prix.ts | Prix Extension Maison 2026 : 600-3 000EUR/m2 |
| batch-energie-2026.ts | Extension Maison : Prix au m2 en 2026 selon le Type |
| batch-projets.ts | Agrandir sa Maison 2026 : Les Options |

**Recommandation :**
- **PILIER prix** : `batch-prix.ts`
- `batch-energie-2026.ts` → **301** vers le pilier prix (meme angle)
- `batch-projets.ts` → OK (angle "options" = surelevation, veranda, extension laterale)

---

### GROUPE 24 : "Ravalement Facade 2026"

| Fichier | metaTitle / title |
|---------|-------------------|
| batch-prix.ts | Prix Ravalement Facade 2026 : 40-300EUR/m2 |
| batch-projets.ts | Ravalement Facade 2026 : Types et Prix |
| batch-reglementation.ts | Ravalement Facade : Obligations Legales |

**Recommandation :**
- **PILIER prix** : `batch-prix.ts`
- `batch-projets.ts` → renommer en **"Ravalement Facade : Enduit, Peinture ou Bardage ? Comparatif"** (angle choix technique)
- `batch-reglementation.ts` → OK (angle legal distinct)

---

### GROUPE 25 : "Amenager ses Combles 2026"

| Fichier | metaTitle / title |
|---------|-------------------|
| batch-projets.ts | Amenager ses Combles 2026 : Guide |
| batch-inspiration.ts | Amenager ses combles en 2026 : idees, contraintes et budget |

**Recommandation :**
- **PILIER** : `batch-inspiration.ts` (plus complet : idees + contraintes + budget)
- `batch-projets.ts` → renommer en **"Amenagement Combles : Permis, Hauteur et Contraintes Techniques"** (angle technique/reglementaire)

---

### GROUPE 26 : "Normes Electriques NF C 15-100"

| Fichier | metaTitle / title |
|---------|-------------------|
| existing-articles.ts | Normes Electriques NF C 15-100 : Guide 2026 |
| batch-seo-boost3.ts | Normes NF C 15-100 : Guide Complet 2026 |

**Recommandation :**
- **PILIER** : `existing-articles.ts`
- `batch-seo-boost3.ts` → **301** vers le pilier

---

### GROUPE 27 : "Fuite d'Eau Urgence"

| Fichier | metaTitle / title |
|---------|-------------------|
| batch-urgences-guides.ts | Fuite d'Eau Urgence : Gestes Immediats + Plombier |
| batch-seo-boost3.ts | Fuite d'Eau : Gestes d'Urgence et Couts |

**Recommandation :**
- **PILIER** : `batch-urgences-guides.ts` (plus complet)
- `batch-seo-boost3.ts` → **301** vers le pilier

---

## PARTIE 4 — SERIE "CHOISIR SON [METIER]" : Coherence parfaite, AUCUNE cannibalisation

Les fichiers `batch-metiers.ts` (12 articles), `batch-metiers-3.ts` (7 articles), `batch-metiers-4.ts` (7 articles) et `batch-urgences-guides.ts` (10 articles "Comment Choisir Son...") couvrent des metiers differents sans doublon. **Aucune action requise.**

Metiers couverts : Electricien, Serrurier, Chauffagiste, Menuisier, Carreleur, Macon, Couvreur, Jardinier, Vitrier, Climaticien, Cuisiniste, Nettoyage, Solier, Poseur Parquet, Zingueur, Miroitier, Storiste, Domoticien, Diagnostiqueur, Ascensoriste, Metallier, Architecte Interieur, Pisciniste, Antenniste, Geometre, Demenageur, Peintre, Terrassier, Facadier, Charpentier, Etancheiste, Installateur Solaire, Installateur Alarme, Ramoneur, Decorateur, Ferronnier.

---

## PARTIE 5 — SERIE "PRIX [METIER] 2026" : Coherence globalement bonne

Les fichiers `batch-prix.ts`, `batch-prix-btp.ts`, `batch-prix-design.ts`, `batch-prix-metal-bois.ts`, `batch-prix-tech.ts`, `batch-prix-services.ts` couvrent des metiers distincts sans doublon entre eux. **Aucune action requise sur cette serie.**

Les articles `batch-prix-villes.ts` (generes dynamiquement pour 10 metiers x N villes) sont correctement differencies par ville dans le title. **Pas de cannibalisation intra-serie.**

---

## PARTIE 6 — ARTICLES BATCH-SEO-BOOST : Zone de danger principal

Les 3 fichiers `batch-seo-boost1.ts`, `batch-seo-boost2.ts`, `batch-seo-boost3.ts` contiennent **15 articles** qui sont presque tous des doublons alleger d'articles existants :

| batch-seo-boost | title | Doublon de |
|-----------------|-------|------------|
| boost1 | MaPrimeRenov' 2026 : Aides Renovation | batch-aides-2026 |
| boost1 | Choisir un Artisan de Confiance 2026 | existing-articles |
| boost1 | Prix Renovation Maison 2026 : Budget | batch-renovation-2026 |
| boost1 | Pompe a Chaleur 2026 : Prix et Aides | batch-energie-2026 |
| boost1 | Isolation Maison 2026 : Prix et Aides | batch-prix-services |
| boost2 | DPE 2026 : Diagnostic de Performance | batch-energie-2026 |
| boost2 | Devis Travaux : Comparer et Negocier | existing-articles |
| boost2 | Renovation Salle de Bain 2026 : Prix | existing-articles |
| boost2 | Entretien Maison : Checklist Annuelle | batch-conseils |
| boost2 | Arnaques Artisans : Reconnaitre et Eviter | existing-articles |
| boost3 | Eco-PTZ 2026 : Pret a Taux Zero | batch-aides-2026 |
| boost3 | Renovation Energetique 2026 : Par Ou Commencer | existing-articles |
| boost3 | Prix Toiture 2026 : Refection et Tarifs | unique |
| boost3 | Normes NF C 15-100 : Guide Complet | existing-articles |
| boost3 | Fuite d'Eau : Gestes d'Urgence et Couts | batch-urgences-guides |

**RECOMMANDATION GLOBALE :** 13 des 15 articles seo-boost sont des doublons. Il faut soit les **supprimer avec 301**, soit leur donner un angle radicalement different (long-tail, sous-niche).

---

## PARTIE 7 — PLAN D'ACTION PRIORITAIRE

### Actions immediates (impact SEO fort)

| Priorite | Action | Articles concernes | Impact estime |
|----------|--------|--------------------|---------------|
| P0 | Rediriger 301 les 13 articles seo-boost doublons | 13 articles | Elimine 50% de la cannibalisation |
| P0 | Fusionner les 4 articles "Renovation Salle de Bain" en 2 (guide + prix) | 4 → 2 | Top keyword, conversion directe |
| P0 | Fusionner les 6 articles "Pompe a Chaleur" en 3 (prix + comparatif + technique) | 6 → 3 | Marche en forte croissance |
| P0 | Fusionner les 4 articles "MaPrimeRenov" en 2 (guide + bareme) | 4 → 2 | Top query aides |
| P1 | Differencier les 5 articles "Renovation Energetique" | 5 articles | Cluster important |
| P1 | Differencier les 4 articles "Devis Travaux" | 4 articles | Intent transactionnel |
| P1 | Differencier les 3 articles "Eco-PTZ" | 3 articles | Query aides frequente |
| P2 | Differencier les 3 articles "Preparer Maison Hiver" | 3 articles | Saisonnier |
| P2 | Differencier les articles "Entretien Maison" | 3 articles | Saisonnier |
| P2 | Audit contenu des articles survivants pour dedupliquer les paragraphes | tous | Qualite globale |

### Metriques de suivi post-correction

- Nombre de pages en competition sur les memes queries (GSC > Performance > Pages)
- CTR moyen par groupe de keywords apres corrections
- Position moyenne des piliers apres 4-6 semaines
- Nombre d'impressions perdues par cannibalisation (avant/apres)

---

## ANNEXE : Synthese des 301 recommandees

| Article source (a rediriger) | Article cible (pilier) |
|------------------------------|----------------------|
| batch-seo-boost1 / maprimerenov | batch-aides-2026 / maprimerénov-2026-conditions-montants |
| batch-seo-boost1 / choisir-artisan | existing-articles / verifier-artisan-avant-signer |
| batch-seo-boost1 / prix-renovation | batch-renovation-2026 / prix-renovation-maison |
| batch-seo-boost1 / pompe-chaleur | batch-energie-2026 / prix-pompe-chaleur |
| batch-seo-boost1 / isolation | batch-prix-services / prix-isolation-thermique |
| batch-seo-boost2 / dpe | batch-energie-2026 / dpe-obligatoire |
| batch-seo-boost2 / devis-travaux | existing-articles / devis-travaux-pieges |
| batch-seo-boost2 / renovation-sdb | existing-articles / renover-salle-de-bain |
| batch-seo-boost2 / entretien-maison | batch-conseils / entretien-maison |
| batch-seo-boost2 / arnaques | existing-articles / arnaques-batiment |
| batch-seo-boost3 / eco-ptz | batch-aides-2026 / eco-ptz |
| batch-seo-boost3 / renovation-energetique | existing-articles / renovation-energetique |
| batch-seo-boost3 / normes-nfc | existing-articles / normes-electriques |
| batch-seo-boost3 / fuite-eau | batch-urgences-guides / fuite-eau-urgence |
| batch-securite-energie / pac | batch-energie-2026 / prix-pompe-chaleur |
| batch-renovation-2026 / renovation-sdb | existing-articles / renover-salle-de-bain |
| batch-renovation-2026 / devis-travaux | existing-articles / devis-travaux-pieges |
| batch-renovation-2026 / prix-cuisine | batch-prix / prix-cuisine-equipee |
| batch-energie-2026 / extension-maison | batch-prix / prix-extension-maison |
| batch-reglementation / cumul-aides | batch-aides-2026 / cumul-aides |
| batch-aides-saisonnier / cumul-aides | batch-aides-2026 / cumul-aides |
| batch-conseils / preparer-hiver | batch-saisonnier / preparer-maison-hiver |
| batch-saisonnier-urgence / preparer-hiver | batch-saisonnier / preparer-maison-hiver |

**Total : 23 redirections 301 recommandees**

---

*Rapport genere automatiquement le 2026-04-03. Verifier les slugs exacts dans le code avant implementation des 301.*
