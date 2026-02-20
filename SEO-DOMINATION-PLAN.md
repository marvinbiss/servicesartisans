# PLAN DE DOMINATION SEO — ServicesArtisans.fr
# Objectif : 1.5M+ pages indexables

---

## ÉTAT ACTUEL

- **~37 000 pages** indexables
- **15 services** dans le routing URL
- **47 spécialités** avec contenu SEO riche (trade-content.ts)
- **2 280 villes** (communes 5 000+ hab.)
- **~11 400 quartiers** dans france.ts
- **101 départements**, **19 régions**
- **~125 articles** de blog
- Infrastructure technique : A+ (14 schemas JSON-LD, sitemap segmenté, SSG)

---

## ARCHITECTURE CIBLE : 1.5M+ PAGES

### Formule : PAGES = MÉTIERS × LOCALISATIONS × INTENTIONS

### Calcul détaillé

| Couche de pages | Formule | Total |
|---|---|---:|
| /services/[service]/[ville] | 47 × 2 280 | 107 160 |
| /services/[service]/[ville]/[quartier] | 47 × 11 400 | 535 800 |
| /devis/[service]/[ville] | 47 × 2 280 | 107 160 |
| /devis/[service]/[ville]/[quartier] | 47 × 11 400 | 535 800 |
| /urgence/[service]/[ville] | 15 × 2 280 | 34 200 |
| /tarifs/[service]/[ville] | 47 × 2 280 | 107 160 |
| /problemes/[probleme]/[ville] | 30 × 2 280 | 68 400 |
| /avis/[service]/[ville] | 47 × 2 280 | 107 160 |
| /departements/[dept]/[service] | 101 × 47 | 4 747 |
| /regions/[region]/[service] | 19 × 47 | 893 |
| Pages villes | | 2 280 |
| Pages quartiers | | 11 400 |
| Profils artisans (DB) | | ~350 000 |
| Blog + Guides | | ~300 |
| Pages statiques | | ~25 |
| **TOTAL** | | **~1 865 325** |

---

## ARCHITECTURE URL

```
/services/[service]/[ville]                  ← découvrir (existe, étendre à 47 métiers)
/services/[service]/[ville]/[quartier]       ← découvrir quartier (NOUVEAU)
/devis/[service]/[ville]                     ← intent transactionnel (NOUVEAU)
/devis/[service]/[ville]/[quartier]          ← devis quartier (NOUVEAU)
/urgence/[service]/[ville]                   ← intent urgence (ÉTENDRE)
/tarifs/[service]/[ville]                    ← intent comparatif (RENOMMER depuis tarifs-artisans)
/avis/[service]/[ville]                      ← intent confiance (NOUVEAU)
/problemes/[probleme]/[ville]                ← intent problème (NOUVEAU)
/departements/[dept]/[service]               ← geo département (NOUVEAU)
/regions/[region]/[service]                  ← geo région (NOUVEAU)
/guides/[slug]                               ← contenu informatif (NOUVEAU)
```

---

## SPRINTS D'EXÉCUTION

### Sprint 1 — Débloquer 73 000 pages (PRIORITÉ MAXIMALE)
**Action** : Ajouter les 32 spécialités manquantes au routing /services/[service]/[ville]
- Actuellement : 15 services dans le tableau `services` de france.ts
- Objectif : 47 services (ajouter les 32 de trade-content.ts)
- Fichiers à modifier :
  - `src/lib/data/france.ts` → étendre le tableau `services` avec les 32 métiers manquants
  - `src/app/(public)/services/[service]/page.tsx` → vérifier que generateStaticParams couvre les 47
  - `src/app/(public)/services/[service]/[location]/page.tsx` → idem
  - `src/app/sitemap.ts` → vérifier que les nouveaux services sont inclus
- Pages créées : 32 × 2 280 = +73 000
- Total cumulé : ~110 000

### Sprint 2 — Service × Quartier
**Action** : Créer /services/[service]/[ville]/[quartier]
- Route existante : /villes/[ville]/[quartier] (pages quartier sans service)
- Nouvelle route : /services/[service]/[ville]/[quartier]
- Fichiers à créer :
  - `src/app/(public)/services/[service]/[location]/[quartier]/page.tsx`
  - generateStaticParams avec 47 × quartiers
- Pages créées : 47 × 11 400 = +535 800
- Total cumulé : ~645 800

### Sprint 3 — Routing /devis/
**Action** : Créer les pages devis par service×ville
- Nouvelle route : /devis/[service]/[ville]
- Fichiers à créer :
  - `src/app/(public)/devis/[service]/page.tsx`
  - `src/app/(public)/devis/[service]/[ville]/page.tsx`
- Contenu : formulaire pré-rempli, artisans de la zone, prix indicatifs
- Schema JSON-LD : Service + Offer
- Pages créées : 47 × 2 280 = +107 160
- Total cumulé : ~752 960

### Sprint 4 — Devis × Quartier
**Action** : Créer /devis/[service]/[ville]/[quartier]
- Fichiers à créer :
  - `src/app/(public)/devis/[service]/[ville]/[quartier]/page.tsx`
- Pages créées : 47 × 11 400 = +535 800
- Total cumulé : ~1 288 760

### Sprint 5 — /tarifs/ + /urgence/ + /avis/
**Action** : Créer 3 nouvelles routes intent
- /tarifs/[service]/[ville] (redirect tarifs-artisans → tarifs, ou routing parallèle)
- /urgence/[service]/[ville] (étendre l'existant avec paramètre ville)
- /avis/[service]/[ville] (NOUVEAU)
- Pages créées : ~248 520
- Total cumulé : ~1 537 280 ✅ OBJECTIF 1.5M ATTEINT

### Sprint 6 — /problemes/ + /dept×service/ + guides
**Action** : Contenu à haute valeur
- /problemes/[probleme]/[ville] : 30 problèmes × 2 280 villes
- /departements/[dept]/[service] : 101 × 47
- /regions/[region]/[service] : 19 × 47
- /guides/[slug] : 30-50 guides longs
- Pages créées : ~73 147
- Total cumulé : ~1 610 427

---

## 47 MÉTIERS (LISTE COMPLÈTE)

### 15 actuels (dans services[]) :
plombier, electricien, serrurier, chauffagiste, peintre-en-batiment, menuisier, carreleur, couvreur, macon, jardinier, vitrier, climaticien, cuisiniste, solier, nettoyage

### 32 à ajouter (dans trade-content, pas dans routing) :
terrassier, charpentier, zingueur, etancheiste, facadier, platrier, metallier, ferronnier, poseur-de-parquet, miroitier, storiste, salle-de-bain, architecte-interieur, decorateur, domoticien, pompe-a-chaleur, panneaux-solaires, isolation-thermique, renovation-energetique, borne-recharge, ramoneur, paysagiste, pisciniste, alarme-securite, antenniste, ascensoriste, diagnostiqueur, geometre, desinsectisation, deratisation, demenageur

### 10 métiers prioritaires (volume + faible concurrence) :
1. paysagiste
2. demenageur
3. pompe-a-chaleur
4. panneaux-solaires
5. isolation-thermique
6. charpentier
7. facadier
8. ramoneur
9. diagnostiqueur
10. renovation-energetique

---

## 30 PROBLÈMES POUR /problemes/

fuite-eau, canalisation-bouchee, panne-chaudiere, serrure-bloquee, porte-claquee, panne-electrique, court-circuit, fissure-mur, infiltration-toiture, degat-des-eaux, humidite, moisissure, vitre-cassee, volet-bloque, chaudiere-qui-fuit, radiateur-froid, ballon-eau-chaude-panne, wc-bouche, robinet-qui-fuit, tuile-cassee, gouttiere-bouchee, porte-garage-bloquee, interphone-panne, alarme-declenchee, inondation, gel-tuyaux, fissure-facade, affaissement-terrasse, probleme-isolation, nuisibles

---

## GARDE-FOUS

1. **Contenu unique** : chaque page doit avoir du contenu différenciant (stats DB, contexte local)
2. **noindex si 0 artisans** : pages sans providers → noindex pour éviter thin content
3. **Sitemap éclaté** : 30+ sous-sitemaps (50 000 URLs max par fichier)
4. **100% SSG** : Static Site Generation pour toutes les pages programmatiques
5. **Anti-cannibalisation** : chaque URL cible un intent différent (découvrir/devis/urgence/tarifs/avis)
6. **Canonical cross-referencing** : canonical self sur chaque page intent

---

## DONNÉES CONCURRENTS

| Concurrent | Trafic mensuel | Force |
|---|---|---|
| Habitatpresto | 610K visites | 500+ guides prix |
| Travaux.com | 200-300K | URL propres |
| MeilleurArtisan | 3M/an | Avis, 29K pros |
| AlloVoisins | 4.5M membres | Communauté |
| LesBonsArtisans | ~9.5M€ CA | Google Ads |

---

## MOTS-CLÉS MANQUANTS HAUTE VALEUR

### Par intent :
- "devis [métier] [ville]" → /devis/ (ABSENT)
- "urgence [métier] [ville]" → /urgence/ (PARTIEL)
- "prix [métier] [ville]" → /tarifs/ (URL "tarifs-artisans" pas optimale)
- "avis [métier] [ville]" → /avis/ (ABSENT)
- "[problème] [ville]" → /problemes/ (ABSENT)

### Modificateurs non couverts :
- "pas cher", "près de chez moi", "dimanche/nuit/jour férié"
- "SOS", "meilleur", "de confiance/fiable", "certifié RGE"

### Questions featured snippets :
- "combien coûte un [métier]"
- "comment trouver un bon [métier]"
- "quand faire appel à un [métier]"
- "que faire en cas de [problème]"
