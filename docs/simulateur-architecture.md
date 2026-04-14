# Simulateur aides rénovation — Architecture

**Route cible** : `/simulateur-aides-renovation` (remplace `/simulateur-prime-cee`, redirect 301 à prévoir)
**Version barèmes** : `2026-01-14` (voir `docs/baremes-sources/07-valeurs-officielles-confirmees-2026-04-14.md`)
**Auteur** : ServicesArtisans — 2026-04-14
**Statut** : Phase 0 — contrat d'architecture, bloquant avant code.

---

## 1. Objectif

Fournir à l'utilisateur final une **estimation indicative** de ses aides à la rénovation énergétique (MPR + CEE + Coup de Pouce + Éco-PTZ + TVA), avec :

1. **Opposabilité juridique** : barèmes sourcés officiellement, ID stable par geste, disclaimer affiché.
2. **Traçabilité < 30 secondes** : reconstruire le calcul exact d'une estimation à partir de son ID.
3. **Capture de lead qualifié** : transmission Pipedrive pipeline dédié `Simulateur Aides` pour mise en relation artisan RGE.
4. **Conformité RGPD** (voir `docs/rgpd-simulateur-aides.md`).

---

## 2. Stepper — 5 étapes

### Step 1 — Situation logement

| Champ                      | Type                                   | Validation                                   | Utilisation                                            |
| -------------------------- | -------------------------------------- | -------------------------------------------- | ------------------------------------------------------ |
| Type de logement           | radio `maison \| appartement`          | requis                                       | filtre fiches CEE (BAR-TH-143 maison uniquement, etc.) |
| Résidence principale       | radio `oui \| non`                     | requis ; si `non` → exclut CDP Rénov ampleur | éligibilité CDP                                        |
| Année de construction      | select `<2 ans \| 2-15 ans \| >15 ans` | requis ; >2 ans requis pour tous les gestes  | éligibilité                                            |
| Surface habitable          | input number (m²)                      | 15 ≤ x ≤ 500                                 | facteur surface VMC, plafonds, calcul rénov ampleur    |
| Code postal                | input 5 chiffres                       | validé vs table zones                        | détermine zone H1/H2/H3 + IdF                          |
| Nombre de personnes foyer  | select 1 à 6+                          | requis                                       | plafond ANAH                                           |
| Revenu fiscal de référence | input €                                | requis                                       | détermine catégorie Bleu/Jaune/Violet/Rose             |

Sortie : `situation = { typeLogement, residencePrincipale, anciennete, surface, codePostal, zone, idf, foyer, rfr, categorie }`

### Step 2 — Projet travaux

| Champ                                    | Type                                                                                                      | Validation                                                  |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Type parcours                            | radio `geste \| accompagne`                                                                               | requis                                                      |
| Si `geste` : gestes à réaliser           | checkbox multiple (PAC air/eau, CET, SSC, biomasse, VMC SF, isolation murs/toiture/plancher, menuiseries) | min 1                                                       |
| Si `accompagne` : audit énergétique fait | radio `oui \| non \| prévu`                                                                               | info uniquement                                             |
| Si `accompagne` : sauts DPE visés        | select `2 \| 3 \| ≥4`                                                                                     | détermine plancher CDP Rénov ampleur                        |
| Coup de Pouce souhaité                   | checkbox                                                                                                  | déclenche flag CDP + désactive fiche CEE std correspondante |
| Équipement actuel à remplacer            | select `gaz \| fioul \| charbon \| élec \| bois \| autre`                                                 | critère CDP Chauffage                                       |

Règle bloquante :

- Si `parcours = accompagne` → au moins 2 gestes d'isolation sélectionnés.
- Si `coupPouceRenovAmpleur` + `residencePrincipale = non` → toast bloquant "CDP Rénov ampleur réservé résidence principale depuis 17/01/2026".

### Step 3 — Estimation budget

| Champ                                  | Type    | Validation                                     |
| -------------------------------------- | ------- | ---------------------------------------------- |
| Budget estimé (HT)                     | input € | ≥ 1 000 €                                      |
| Dépense éligible par geste (optionnel) | input € | plafonné par règle (ex : PAC air/eau 12 000 €) |

### Step 4 — Coordonnées (capture lead)

| Champ                   | Type             | Validation             |
| ----------------------- | ---------------- | ---------------------- |
| Prénom + Nom            | input            | requis                 |
| Email                   | input email      | format valide          |
| Téléphone               | input E.164 (FR) | 10 chiffres            |
| Consentement RGPD       | checkbox         | requis (voir RGPD doc) |
| Consentement démarchage | checkbox         | optionnel              |

### Step 5 — Résultat

Affichage structuré :

```
Votre estimation indicative

MaPrimeRénov'       : 4 000 €
Certificats CEE     : entre 3 200 € et 5 400 €
Coup de Pouce       : +2 000 € (estimation délégataire)
TVA 5,5% appliquée
Éco-PTZ éligible    : jusqu'à 30 000 €

Plafond d'écrêtement (Jaune, parcours geste) : 75 % du TTC
Reste à charge estimé : 6 200 € à 8 400 €

[ID estimation : EST-2026-04-14-a7f3b2]
[Version barèmes : 2026-01-14]
```

- CTA « Recevoir un devis d'un artisan RGE certifié ».

---

## 3. Schéma de données

### 3.1 Table `simulateur_estimations` (Supabase)

```sql
create table simulateur_estimations (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null,           -- EST-2026-04-14-xxxxxx
  barometre_version text not null,          -- "2026-01-14"
  lead_id uuid references leads(id),        -- NULL si pas encore lead
  pipedrive_deal_id text,                   -- rempli après sync

  -- Situation
  type_logement text not null,              -- 'maison' | 'appartement'
  residence_principale boolean not null,
  anciennete text not null,
  surface_m2 integer not null,
  code_postal text not null,
  zone_climatique text not null,            -- 'H1' | 'H2' | 'H3'
  idf boolean not null,
  foyer_taille integer not null,
  rfr integer not null,
  categorie_anah text not null,             -- 'bleu' | 'jaune' | 'violet' | 'rose'

  -- Projet
  parcours text not null,                   -- 'geste' | 'accompagne'
  gestes jsonb not null,                    -- [{ id, label, forfait, source_bareme_id }]
  coup_de_pouce boolean default false,
  equipement_actuel text,
  sauts_dpe integer,

  -- Résultats (snapshot calcul)
  mpr_total numeric,
  cee_fourchette_bas numeric,
  cee_fourchette_haut numeric,
  coup_pouce_estimation numeric,
  ecretement_pct numeric,                   -- 75, 90, etc.
  reste_a_charge_bas numeric,
  reste_a_charge_haut numeric,

  -- Traçabilité
  bareme_ids jsonb not null,                -- ["MPR.PAC_AIREAU.JAUNE.2026-01", "CEE.BAR-TH-171.H1.MAISON.ETAS2.70_90.2026-01", ...]
  formule_debug jsonb,                      -- détail du calcul

  -- Consentements RGPD
  consent_rgpd boolean not null,
  consent_demarchage boolean default false,

  -- Audit
  created_at timestamptz default now(),
  ip_hash text,                             -- hash SHA-256 salé
  user_agent text
);

create index on simulateur_estimations (public_id);
create index on simulateur_estimations (created_at desc);
create index on simulateur_estimations (categorie_anah, parcours);
```

### 3.2 Table `baremes_versions`

```sql
create table baremes_versions (
  id text primary key,                      -- "2026-01-14"
  effective_from date not null,
  source_doc text not null,                 -- chemin vers doc/07 etc.
  data jsonb not null,                      -- dump complet des barèmes
  created_at timestamptz default now()
);
```

Chaque estimation référence `barometre_version` → garantit reconstruction même après MAJ barème.

### 3.3 Index des barèmes en mémoire

```ts
// src/lib/simulateur/baremes/index.ts
export const BAREMES_2026_01 = {
  version: '2026-01-14',

  plafondsAnah: {
    horsIdf: {
      /* table exacte doc 07 §1 */
    },
    idf: {
      /* table exacte doc 07 §1 */
    },
  },

  ecretement: {
    geste: { bleu: 0.9, jaune: 0.75, violet: 0.6, rose: null /* exclu */ },
    accompagne: { bleu: 1.0, jaune: 0.9, violet: 0.8, rose: 0.5 },
  },

  mprAccompagne: {
    bleu: { min: 0.6, max: 0.8 },
    jaune: { min: 0.4, max: 0.6 },
    violet: 0.45,
    rose: 0.1,
  },

  mprGeste: {
    PAC_AIREAU: { bleu: 5000, jaune: 4000, violet: 3000, rose: 1000, plafondDepenses: 12000 },
    // ... autres gestes
  },

  cee: {
    'BAR-TH-148': { mi: 14700, appart: 11800 },
    'BAR-TH-113': { h1: 41300, h2: 33800, h3: 26300 },
    'BAR-TH-143': { h1: 134800, h2: 121000, h3: 100500 },
    'BAR-TH-127': {
      /* base + facteurs surface + facteur R */
    },
    'BAR-TH-171': {
      /* formule via computeBarTh171() */
    },
  },

  nonCumul: [
    ['BAR-TH-148', 'BAR-TH-171'],
    ['BAR-TH-148', 'BAR-TH-172'],
    ['BAR-TH-143', 'BAR-TH-171'],
    ['BAR-TH-143', 'BAR-TH-172'],
    ['BAR-TH-143', 'BAR-TH-113'],
  ],
} as const
```

---

## 4. IDs stables

Format : `{FAMILLE}.{GESTE}.{DIMENSION}.{VERSION}`

- `FAMILLE` ∈ `MPR`, `CEE`, `CDP`, `ECOPTZ`, `TVA`
- `GESTE` : identifiant geste (PAC_AIREAU, BAR-TH-148…)
- `DIMENSION` : critères qui font varier le forfait (BLEU, H1.MAISON, ETAS2.70_90…)
- `VERSION` : `2026-01` (aligné avec `barometre_version`)

Exemples validés : voir doc 07 §10.

**Invariant** : un ID stable + une version barème = un forfait unique, déterministe, reconstruisible.

---

## 5. Moteur de calcul

### 5.1 Pipeline

```
Input (Step 1-2-3)
  ↓
[1] classifier(situation) → categorie ANAH
  ↓
[2] eligibilite(gestes, situation) → gestes retenus + raisons rejets
  ↓
[3] calcMPR(gestes, categorie, parcours) → { mprTotal, breakdown, baremeIds }
  ↓
[4] calcCEE(gestes, zone, surface) → { kwhCumac, fourchette, baremeIds }
  ↓
[5] calcCDP(gestes, categorie, cdpFlag) → { cdpEstimation, baremeIds }
  ↓
[6] applyNonCumul(aides) → aides nettoyées
  ↓
[7] applyEcretement(aides, budget, categorie, parcours) → aides plafonnées
  ↓
[8] calcResteACharge(budget, aides) → fourchette RAC
  ↓
Output (Step 5) + snapshot DB
```

### 5.2 Contrat de test

Chaque fonction = pure, testée avec cas limites :

- `categorie = rose` + `parcours = geste` → exclusion avec message explicite
- `BAR-TH-148` + `BAR-TH-171` simultanés → non-cumul détecté, garde le + avantageux
- Surface 30 m² + VMC SF → facteur 0,3 appliqué
- Zone détectée via code postal inconnu (DOM) → fallback H3 + warning

---

## 6. Intégration Pipedrive

### 6.1 Pipeline dédié

Créer pipeline Pipedrive `Simulateur Aides` avec les stages :

| Stage                       | Probabilité | Déclencheur                |
| --------------------------- | ----------- | -------------------------- |
| 1 — Estimation générée      | 10 %        | Step 5 atteint             |
| 2 — Coordonnées validées    | 30 %        | Email + tel confirmés      |
| 3 — Contact initial artisan | 50 %        | Artisan RGE assigné        |
| 4 — Devis en cours          | 70 %        | Artisan confirme visite    |
| 5 — Devis signé             | 100 %       | Feedback artisan « signé » |
| Perdu                       | 0 %         | Pas de réponse 30j / refus |

### 6.2 Payload (fire-and-forget + DLQ)

```ts
POST /api/simulateur/submit
  ↓ écrit simulateur_estimations
  ↓ enqueue Pipedrive job (non bloquant)
  ↓ retourne public_id à l'utilisateur

Job Pipedrive :
  ↓ create Person (email, tel, nom)
  ↓ create Deal (pipeline="simulateur-aides", stage=1)
  ↓ create Note (estimation détaillée + public_id + bareme_ids)
  ↓ si erreur → DLQ table + cron retry 6h (pattern existant ServicesArtisans)
```

Source pattern : voir mémoire `servicesartisans-pipedrive.md`.

### 6.3 Fallback

Si Pipedrive down → l'estimation reste stockée en DB avec `pipedrive_deal_id = null`. Le cron de retry relance toutes les 6h.

---

## 7. Traçabilité < 30 secondes

**Objectif** : à partir d'un `public_id`, reconstruire le calcul exact affiché à l'utilisateur.

### 7.1 Endpoint admin

```
GET /admin/simulateur/estimations/:public_id
→ affiche :
  - situation complète
  - gestes retenus + raisons rejet éventuelles
  - baremeIds utilisés + version
  - formule debug (kWhc × prix, facteurs appliqués)
  - écrêtement appliqué
  - breakdown final
  - lien Pipedrive
```

### 7.2 Mécanisme

- `bareme_ids jsonb` stocke les IDs exacts consultés.
- `formule_debug jsonb` stocke le détail de chaque étape du pipeline §5.1.
- `barometre_version` permet de reloader `baremes_versions.data` exactement comme au moment du calcul.

**Contrat** : une estimation générée le jour J reste reconstructible même si les barèmes sont mis à jour le jour J+30.

---

## 8. Refresh des barèmes

### 8.1 Fréquence

| Composant                 | Fréquence              | Source                                                   |
| ------------------------- | ---------------------- | -------------------------------------------------------- |
| Plafonds ANAH             | Annuelle (janvier)     | Arrêté ANAH                                              |
| Forfaits MPR              | Annuelle ou ponctuelle | Décrets JO                                               |
| Forfaits CEE (fiches)     | Arrêté par arrêté      | Légifrance + PDF DGEC                                    |
| Prix EMMY kWhc            | Trimestrielle          | Variables env `CEE_PRIX_CLASSIQUE`, `CEE_PRIX_PRECARITE` |
| Coup de Pouce signataires | Variable               | Fourchette figée, pas d'API                              |
| Zones climatiques         | Jamais (arrêté 2010)   | Statique                                                 |

### 8.2 Processus

1. Veille manuelle + alerte Légifrance sur arrêtés CEE/MPR.
2. Mise à jour doc `baremes-sources/0X-*.md` avec source officielle.
3. Nouvelle entrée `baremes_versions` (ex : `2026-07-01`).
4. Migration base : `const BAREMES_2026_07 = { ... }` en plus de `BAREMES_2026_01`.
5. Le simulateur utilise toujours la **dernière version active** pour les nouveaux calculs ; les estimations anciennes restent liées à leur version d'origine.

---

## 9. Zones H1/H2/H3

Résolution code postal → zone :

```ts
// src/lib/simulateur/zones.ts
const ZONES: Record<string, 'H1' | 'H2' | 'H3'> = {
  // H1
  '02': 'H1',
  '08': 'H1' /* ... doc 07 §7 */,
  // H2 (incluant 75, 77, 78, 91, 92, 93, 94, 95, 2A, 2B)
  '01': 'H2',
  '03': 'H2' /* ... */,
  // H3
  '13': 'H3',
  '30': 'H3' /* ... 971, 972, 973, 974, 976 */,
}

export function zoneFromCodePostal(cp: string): {
  zone: 'H1' | 'H2' | 'H3'
  idf: boolean
  warning?: string
} {
  const dept = cp.length === 5 ? (cp.startsWith('97') ? cp.slice(0, 3) : cp.slice(0, 2)) : ''
  const zone = ZONES[dept]
  if (!zone) return { zone: 'H3', idf: false, warning: 'Département inconnu, zone H3 par défaut' }
  const idf = ['75', '77', '78', '91', '92', '93', '94', '95'].includes(dept)
  return { zone, idf }
}
```

Contrat de test : les 101 départements + DOM → classification déterministe sans faille.

---

## 10. Erreurs & cas limites

| Cas                                            | Comportement                                                               |
| ---------------------------------------------- | -------------------------------------------------------------------------- |
| RFR manquant                                   | Step 1 bloquant, message « indispensable pour calculer vos droits »        |
| Code postal hors France                        | Step 1 bloquant, « simulateur France métropolitaine + DOM uniquement »     |
| Surface < 15 m²                                | Message « surface minimale 15 m² »                                         |
| Catégorie Rose + parcours geste                | Step 2 bloquant, redirige vers parcours accompagné                         |
| Non-cumul détecté (ex BAR-TH-148 + BAR-TH-171) | Step 2 warning, l'utilisateur choisit lequel retirer                       |
| Écrêtement > plafond                           | Auto-plafonné, affichage note « plafond atteint »                          |
| Pipedrive 500                                  | Estimation stockée, message « nous reviendrons vers vous », job retry cron |
| Variable prix EMMY absente                     | Affiche kWhc + texte « Prime estimée selon cours du marché »               |

---

## 11. Mesures & métriques

À tracker (Mixpanel/Plausible + table `simulateur_events`) :

- Taux d'abandon par step
- Temps moyen par step
- Catégorie ANAH la plus fréquente
- Geste le plus sélectionné
- Taux conversion vers lead qualifié (Step 5 → Step 4 validé)
- Taux conversion lead → devis signé (via Pipedrive stage 5)
- Distribution par zone H1/H2/H3

---

## 12. Sécurité

- **Rate limit** : 5 estimations/IP/heure, 20/jour (anti-scraping concurrent)
- **RFR** : jamais stocké en clair > 90j ; anonymisé après 90j (hash + tranche 10k)
- **IP** : hash SHA-256 salé, jamais en clair
- **Consentement RGPD** : obligatoire Step 4, tracé avec timestamp
- **Endpoint admin** : protégé par `requirePermission('simulateur', 'read')`

---

## 13. Routes

| Route                                     | Méthode | Rôle                               |
| ----------------------------------------- | ------- | ---------------------------------- |
| `/simulateur-aides-renovation`            | GET     | Page publique (Next.js App Router) |
| `/simulateur-prime-cee`                   | GET     | Redirect 301 → route cible         |
| `/api/simulateur/estimate`                | POST    | Calcul + stockage (steps 1-2-3)    |
| `/api/simulateur/submit`                  | POST    | Finalisation + Pipedrive (step 4)  |
| `/api/simulateur/result/:publicId`        | GET     | Consultation résultat partageable  |
| `/admin/simulateur/estimations`           | GET     | Liste + export CSV                 |
| `/admin/simulateur/estimations/:publicId` | GET     | Détail + traçabilité §7            |

---

## 14. Plan d'implémentation

| Phase     | Livrables                                                                               |
| --------- | --------------------------------------------------------------------------------------- |
| P0 (fait) | 6 docs barèmes + doc 07 valeurs officielles + ce doc + RGPD doc                         |
| P1        | Migration tables `simulateur_estimations` + `baremes_versions` + seed `BAREMES_2026_01` |
| P2        | Moteur calcul (§5) + tests unitaires (cas limites §10)                                  |
| P3        | UI stepper 5 étapes + validation Zod + intégration Supabase                             |
| P4        | Intégration Pipedrive (fire-and-forget + DLQ + cron retry)                              |
| P5        | Endpoint admin traçabilité + export CSV                                                 |
| P6        | Redirect 301 ancienne route + revalidate sitemap + IndexNow                             |
| P7        | Monitoring (métriques §11)                                                              |

---

## 15. Références

- `docs/baremes-sources/01-maprimerenov-2026.md` → doc 07
- Plan initial en mémoire : `servicesartisans-simulateur-aides-plan.md`
- Pattern Pipedrive : `servicesartisans-pipedrive.md`
- Pattern ADEME sync (refresh barèmes) : `servicesartisans-rge-integration.md`
