# Stratégie SEO — Rénovation Énergétique

**Pillar SEO #2** (après artisans locaux)

**Marché** : rénovation énergétique France 2026
**Volume accessible** : 300-500K vol/mois
**Différenciation** : RGE + SIREN + MaPrimeRénov' combinés

## Pourquoi maintenant

### Contexte réglementaire France 2026

- **Passoires thermiques G** : interdites location depuis 1er janvier 2025
- **Passoires thermiques F** : interdiction 2028
- **Classe E** : interdiction 2034
- **Audit énergétique obligatoire** pour vente passoires depuis 2023
- **MaPrimeRénov' Parcours accompagné** : aide renforcée travaux gros œuvre
- **Mon Accompagnateur Rénov'** : obligatoire pour aides >5 000 €
- **Fin chaudières fioul** : 2022
- **Transition pompes à chaleur** : incitation massive

### Signaux positifs déjà dans la data

| Signal                                | Preuve             | Implication             |
| ------------------------------------- | ------------------ | ----------------------- |
| `ma prime renov 2026`                 | pos 26, +4 trafic  | Déjà en décollage       |
| `/guides/maprimerenov-2026`           | NEW page qui ranke | Architecture fonctionne |
| `/blog/prix-climaticien-2026`         | Attire backlinks   | Thème attractif         |
| Simulateur `/api/simulateur/*`        | Déjà en prod       | Conversion prête        |
| Pipeline Pipedrive `simulateur-aides` | Canal séparé       | Business model OK       |
| Pattern `/guides/*` gagne             | 62 new KW          | Architecture validée    |

## Volumes de recherche France

| KW                            | Vol estimé                  | KD    | Priorité         |
| ----------------------------- | --------------------------- | ----- | ---------------- |
| pompe à chaleur               | 100 000+                    | 50+   | P1               |
| maprimerenov                  | 40-100K                     | 40-60 | P1               |
| DPE                           | 40 000                      | 50    | P2               |
| pompe à chaleur prix          | 30 000                      | 40    | P1               |
| isolation combles             | 15 000                      | 30    | P1               |
| rénovation énergétique        | 10 000                      | 40    | P2               |
| audit énergétique             | 10 000                      | 35    | P2               |
| passoire thermique            | 8 000                       | 30    | P3               |
| isolation extérieure prix     | 8 000                       | 25    | P1               |
| audit énergétique obligatoire | 5 000                       | 20    | P1 easy win      |
| prime CEE                     | 5 000                       | 25    | P2               |
| éco PTZ                       | 3 000                       | 20    | P2               |
| artisan RGE                   | 2 000                       | 15    | P1 trust         |
| chauffagiste RGE              | 800                         | 10    | P1 longue traîne |
| `[métier] RGE [ville]`        | 50-200 × 96 dép × 5 métiers | 5-10  | Goldmine         |

## Architecture éditoriale

### Hub `/renovation-energetique/`

```
/renovation-energetique/
├── /aides/
│   ├── /maprimerenov-2026/
│   │   ├── /montants/
│   │   ├── /eligibilite/
│   │   └── /parcours-accompagne/
│   ├── /cee-certificats-economie-energie/
│   ├── /eco-ptz-pret-zero/
│   └── /prime-coup-de-pouce/
├── /travaux/
│   ├── /pompe-a-chaleur/
│   │   ├── /air-eau-prix/
│   │   ├── /air-air-prix/
│   │   └── /geothermie/
│   ├── /isolation/
│   │   ├── /combles/
│   │   ├── /exterieure-ite/
│   │   └── /interieure/
│   ├── /chauffage/
│   │   ├── /chaudiere-condensation/
│   │   ├── /poele-granules/
│   │   └── /chauffe-eau-thermodynamique/
│   ├── /fenetres-double-vitrage/
│   └── /vmc-double-flux/
├── /diagnostic/
│   ├── /dpe/
│   ├── /audit-energetique-obligatoire/
│   └── /thermographie/
└── /passoires-thermiques/
    ├── /interdiction-location-g-f/
    └── /calendrier-2025-2028-2034/
```

### Pages services RGE locales

```
/services/chauffagiste-rge/[ville]            × 200 villes
/services/pompe-a-chaleur/[ville]             × 200
/services/isolation-combles/[ville]           × 200
/services/fenetres-double-vitrage/[ville]     × 200
/services/plombier-rge/[ville]                × 200
```

### Pages aides par département

```
/aides/[dept]/maprimerenov                    × 96
/aides/[dept]/cee                             × 96
/aides/[region]/renovation                    × 13
```

### Simulateur amélioré

```
/simulateur-aides                             # page landing dédiée
/simulateur-aides/[ville]                     × 200 villes
```

### Blog `/blog/prix-*-2026`

Pattern gagnant confirmé (article climaticien attire backlinks).

```
/blog/prix-pompe-a-chaleur-2026-aides
/blog/prix-isolation-combles-2026
/blog/prix-chaudiere-condensation-2026
/blog/prix-audit-energetique-2026
/blog/prix-dpe-2026
/blog/prix-fenetres-double-vitrage-2026
/blog/prix-poele-granules-2026
/blog/prix-vmc-double-flux-2026
```

## Différenciation compétitive

| Concurrent           | Angle                           | Statut Q2 2026      |
| -------------------- | ------------------------------- | ------------------- |
| travaux.com          | Hub générique                   | -18 %, -4 820 pages |
| effy.fr              | Spécialiste aides               | DR 70+              |
| quelleenergie.fr     | Ancien, fort                    | Leader historique   |
| habitatpresto.com    | Rénovation globale              | Stable              |
| engie-hometips.com   | Service ENGIE                   | -                   |
| **ServicesArtisans** | **RGE + SIREN + MaPrimeRénov'** | **À construire**    |

### USP (Unique Selling Proposition)

Personne ne combine ces 3 signaux de confiance :

1. **RGE certifié** (via API france-renov.gouv.fr)
2. **SIREN officiel** (déjà en place)
3. **Éligibilité MaPrimeRénov'** (simulateur existant)

### Positionnement vs societe.com (seul +63 %)

Google récompense les sources officielles. Notre data SIREN + API RGE officielle = même signal.

## Modifications base de données

```sql
-- providers: certifications RGE
ALTER TABLE providers ADD COLUMN rge_qualifications text[];
ALTER TABLE providers ADD COLUMN rge_verified_at timestamptz;
ALTER TABLE providers ADD COLUMN rge_expires_at timestamptz;

-- Exemples qualifications
-- ['Qualibat RGE', 'QualiPAC', 'QualiBois', 'Chauffage+', 'Eco Artisan']

-- services: nouveaux services rénovation énergétique
INSERT INTO services (slug, name, category, is_active) VALUES
  ('pompe-a-chaleur', 'Pompe à chaleur', 'chauffage', true),
  ('pompe-a-chaleur-air-eau', 'Pompe à chaleur air-eau', 'chauffage', true),
  ('pompe-a-chaleur-air-air', 'Pompe à chaleur air-air', 'chauffage', true),
  ('isolation-combles', 'Isolation combles', 'isolation', true),
  ('isolation-exterieure-ite', 'Isolation extérieure ITE', 'isolation', true),
  ('audit-energetique', 'Audit énergétique', 'diagnostic', true),
  ('dpe-diagnostic', 'DPE / Diagnostic performance', 'diagnostic', true),
  ('chaudiere-condensation', 'Chaudière condensation', 'chauffage', true),
  ('poele-granules', 'Poêle à granulés', 'chauffage', true),
  ('chauffe-eau-thermodynamique', 'Chauffe-eau thermodynamique', 'chauffage', true),
  ('vmc-double-flux', 'VMC double flux', 'ventilation', true);
```

## Contenu E-E-A-T obligatoire

Chaque page rénovation énergétique :

- ✅ **Montants MaPrimeRénov' 2026 à jour** (revenus modestes/intermédiaires/supérieurs)
- ✅ **Conditions éligibilité officielles**
- ✅ **Lien sortant vers france-renov.gouv.fr** (signal trust)
- ✅ **Calculateur aides** (simulateur existant intégré)
- ✅ **Liste artisans RGE locaux vérifiés** (via API)
- ✅ **Dates importantes** (interdiction G 2025, F 2028, E 2034)
- ✅ **Auteur identifié** (CRUCIAL pour YMYL — aides financières = YMYL)
- ✅ **Dernière mise à jour visible**
- ✅ **Schema.org** : `Service` + `GovernmentService` + `FinancialProduct`

## API FRANCE-RÉNOV' — intégration

**Endpoint** : `https://data.ademe.fr/data-fair/api/v1/datasets/liste-des-entreprises-rge-2/lines`

**Fields utiles** :

- `siret` (match sur providers.siret)
- `nom_entreprise`
- `code_qualification`
- `date_debut_validite`
- `date_expiration_validite`
- `adresse`

**Fréquence sync** : mensuelle (cron)

## Plan de déploiement

### Sprint 0 — Fondation (priorité absolue)

1. **Fix bailout SSR** (prérequis absolu)
2. Upload disavow.txt

### Sprint 1 — Hub (1 semaine)

3. Créer `/renovation-energetique/` index
4. Script import API RGE → populate DB
5. 10 guides prioritaires :
   - MaPrimeRénov' 2026 (4 pages hub)
   - Pompe à chaleur (prix + guide)
   - Isolation combles
   - Audit énergétique obligatoire (easy win)
   - DPE
   - Chaudière condensation
   - VMC double flux

### Sprint 2 — Pages services (2 semaines)

6. Top 20 villes × 5 métiers RGE = 100 pages
7. 8 articles `/blog/prix-*-2026`
8. Simulateur aides visible homepage + pages rénovation
9. Internal linking hub ↔ services ↔ simulateur ↔ artisans RGE

### Sprint 3 — Territorial (3 semaines)

10. 96 pages `/aides/[dept]/maprimerenov`
11. 13 pages `/aides/[region]/renovation`
12. Schema.org complet
13. Link building : presse locale + blogs rénovation
14. Outreach sites qui linkent `/blog/prix-*` déjà

### Sprint 4 — Amplification (1-3 mois)

15. Calculateur interactif amélioré
16. Carte interactive artisans RGE par région
17. Newsletter "Actus aides rénovation"
18. Partenariat Mon Accompagnateur Rénov'

## ROI estimé

| Horizon | KW top 10 | Trafic   | Devis    |
| ------- | --------- | -------- | -------- |
| 3 mois  | 50        | 5 000    | 30-50    |
| 6 mois  | 200       | 30 000   | 200-400  |
| 12 mois | 500+      | 100 000+ | 800-1500 |

## KPI suivi

- **Trafic segment "renovation-energetique"** (GA4 landing path)
- **Nombre artisans RGE** dans la base
- **Taux conversion** simulateur → devis
- **Position `maprimerenov`** : pos 26 → top 5
- **Position `pompe à chaleur prix`** : actuellement 0 → top 20
- **Position `audit énergétique obligatoire`** : à capturer (KD 20, easy win)
- **Mentions ChatGPT** "servicesartisans + rénovation énergétique"

## Sources officielles à citer

- `france-renov.gouv.fr`
- `anah.gouv.fr`
- `service-public.fr/particuliers/actualites`
- `ecologie.gouv.fr/aides`
- Communiqués ministère Transition Écologique

## Décisions pending

- [ ] Quel sprint lancer en 1er après bailout ?
- [ ] Budget content writer pour 30-50 articles longue forme ?
- [ ] Fréquence re-sync API RGE (hebdo vs mensuelle) ?
- [ ] Positionnement : pillar dédié `/renovation-energetique/` ou intégré au site actuel ?
  - Recommandation : intégré (pas de sous-domaine, évite dilution autorité)
