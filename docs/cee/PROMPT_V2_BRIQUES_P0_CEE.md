# MISSION — Briques P0 CEE ServicesArtisans — Prompt V2 (10/10)

**Date** : 2026-04-14
**Cible** : agent dev Next.js 15 + Supabase + TypeScript strict
**Niveau attendu** : production-grade, top 0.001%, zéro compromis
**Base existante** : marketplace avec 188 API routes, 232 composants, 348K pages SEO, Pipedrive + Brevo + Sentry + Supabase RLS + ADEME sync + cron retry 6h déjà opérationnels

---

## 0. ARCHITECTURE STRATÉGIQUE (contexte à lire AVANT code)

**Deux sociétés juridiques distinctes** :

- **ServicesArtisans SAS** (existante) : marketplace SaaS + revente leads intra-groupe
- **ServicesArtisans Energy SAS** (nouvelle, à constituer) : apport d'affaires artisans + mandataire CEE sous un délégataire partenaire (Engie vague 1)

**Flux chantier CEE type** : bénéficiaire saisit simulateur → lead SA SAS → dispatch artisan exclusif → SA Energy monte le dossier CEE → 2 revenus distincts (commission artisan 10% HT + marge mandataire CEE).

**Référentiel mémoire** :

- `servicesartisans-architecture-double-societe.md`
- `servicesartisans-mandataire-cee-cdp-2026-04-14.md`
- `servicesartisans-emmy-operations.md`

**Tu ne codes QUE dans SA SAS.** SA Energy n'existe pas encore en base ; les flux mandataire CEE sont stubés (tables prêtes, logique à activer post-constitution SAS).

---

## 1. RÈGLES NON NÉGOCIABLES

1. **Zéro valeur hardcodée** de barème CEE/MPR/zones climatiques/plafonds revenus. Tout passe par 5 tables de référentiel temporel versionnées (voir §4).
2. **Zéro PII en colonne claire sans RLS.** Email/tel/revenus = RLS strict, service_role only côté anon.
3. **Reverse funnel obligatoire** : reveal estimation AVANT coordonnées (+150 à +220% CR vs funnel classique). Étapes 1→2→3→**reveal**→4.
4. **Pipedrive + Brevo = outbox pattern** (réutiliser le helper existant `83dc422f`). JAMAIS d'appel synchrone bloquant.
5. **Observabilité obligatoire** : Sentry tags + métriques Prometheus + tracking événements simulateur.
6. **RGPD bloquant** : mentions légales exactes, 3 cases à cocher séparées, disclaimer résultat, bordereau rétractation R.221-1.
7. **Rate-limit + Turnstile + honeypot** sur `/api/cee/leads` (route publique).
8. **Idempotence partout** : migrations `IF NOT EXISTS`, imports atomic swap staging, outbox Idempotency-Key.
9. **Commit atomique par PR** : 5 PR séquentielles, pas un seul gros commit.
10. **Tests obligatoires** : `calculate-prime.ts` + `detect-eligibility.ts` + Zod schemas = couverture 100% branches.

---

## 2. PLAN D'EXÉCUTION — 5 PR SÉQUENTIELLES

| PR      | Scope                                                                                              | Durée |
| ------- | -------------------------------------------------------------------------------------------------- | ----- |
| **PR1** | Migrations 420-425 (référentiels + devis + providers + cee_leads + observabilité + outbox)         | 3-5j  |
| **PR2** | Brique 1 — détection CEE sur `/api/devis` + seed référentiels + backfill 100k devis                | 3j    |
| **PR3** | Brique 3 — flag MAR providers (staging + atomic swap + cron hebdo)                                 | 2j    |
| **PR4** | Brique 2 — simulateur public `/simulateur-aides-cee` + 4 étapes + reveal + API + RGPD + rate-limit | 7-10j |
| **PR5** | Outbox Brevo + séquence 7 touches + webhooks + dashboards + alerts                                 | 2-3j  |

**Ordre d'exécution strict** : PR1 obligatoire avant toute autre. PR2 et PR3 parallélisables après PR1. PR4 bloque sur PR1+PR2. PR5 bloque sur PR4.

---

## 3. AVANT TOUTE LIGNE DE CODE — étape de reconnaissance

Exécute et rapporte :

```bash
# 1. Schéma actuel
psql $DATABASE_URL -c "\d providers"
psql $DATABASE_URL -c "\d devis"

# 2. Dernière migration existante
ls supabase/migrations/ | sort | tail -5

# 3. Vérifier présence helpers existants
grep -rn "pipedrive" lib/ | head -20
grep -rn "outbox" lib/ | head -20
grep -rn "set_updated_at" supabase/migrations/

# 4. Env vars déjà définies
grep -E "PIPEDRIVE|BREVO|SENTRY|UPSTASH|TURNSTILE|CRON" .env.example
```

**Rapporte les résultats avant toute migration.** Si un helper existe, RÉUTILISE-LE, n'en recrée pas.

---

## 4. PR1 — DDL MIGRATIONS 420-425 (LE PRÉREQUIS ABSOLU)

**Les fichiers SQL sont déjà produits** dans `docs/cee/` :

- `420_425_cee_mandataire.sql` (6 migrations dans 1 fichier, à splitter)
- `rollback_420_425.sql`
- `smoke_tests_420_425.sql` (20 SELECTs de vérification)
- `README.md`

### Action dev :

1. Splitter `420_425_cee_mandataire.sql` en 6 fichiers `supabase/migrations/420_*.sql` à `425_*.sql` selon les séparateurs `-- === FILE: xxx.sql ===`
2. Vérifier prérequis : extension `pgcrypto`, fonction `public.set_updated_at()`, JWT avec claims `role` et `provider_id`
3. `supabase db push` (ou Dashboard SQL editor — split multi-statements selon quirks mémoire)
4. Exécuter `smoke_tests_420_425.sql` → tous les 20 checks doivent renvoyer `ok=true`
5. `rollback_420_425.sql` placé dans `supabase/migrations/rollback/`

### Contenu fonctionnel des 6 migrations (résumé) :

| Migration | Contenu                                                                                                                                                                                                                                                     |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 420       | 5 tables référentiels : `cee_operations_ref`, `cee_forfaits`, `cee_spot_prices`, `revenus_plafonds`, `zones_climatiques_ref` (**clé = `code_insee VARCHAR(5)` commune, PAS département** — Hautes-Alpes + Corse mixtes)                                     |
| 421       | 3 ENUMs : `cee_lead_status`, `categorie_revenus`, `zone_climatique`                                                                                                                                                                                         |
| 422       | Extension `devis` : `cee_eligible`, `cee_operation_code` FK, `cee_forfait_id` FK snapshot, `cee_prime_estimee_cts` INTEGER, `cee_prime_version` (hash), `cee_lead_id` FK, `cee_detector_version`, `cee_detected_at`, CHECK format BAR-XX-NNN, index partiel |
| 423       | Extension `providers` : `is_mar_agree`, `mar_source_id`, `mar_last_seen_at`, `mar_imported_at`, `mar_revoked_at`, `mar_qualifications` jsonb + table `mar_staging`                                                                                          |
| 424       | `cee_leads` (email_hash SHA-256 generated, RLS admin/artisan/anon-deny, dédoublonnage index partiel 24h, trigger updated_at, expires_at 3 ans) + `cee_mandats` + FK inverse `devis.cee_lead_id`                                                             |
| 425       | `cee_simulator_events` (expires 90j), `cee_pipedrive_outbox`, `cee_emails_outbox`, `cee_email_events`, MV `v_cee_funnel_conversion`, MV `v_cee_leads_daily_stats`                                                                                           |

### Règles techniques DDL

- Tous montants en **INTEGER centimes** (suffixe `_cts`), jamais NUMERIC
- `email_hash` = `GENERATED ALWAYS AS (encode(digest(lower(email),'sha256'),'hex')) STORED`
- `telephone_e164` avec CHECK `^\+[1-9][0-9]{6,14}$`
- Index partiels `WHERE cee_eligible`, `WHERE is_mar_agree`, `WHERE status='pending'`
- RLS policies nommées `{table}_{role}_{action}`
- `expires_at` pour purge RGPD cron

---

## 5. SEED RÉFÉRENTIELS — ⚠️ ACTION HUMAINE OBLIGATOIRE AVANT PROD

**NE SEEDE PAS depuis des valeurs en dur dans le code.** Les barèmes 2026 exacts doivent être récupérés depuis les sources officielles suivantes AVANT mise en prod :

### Sources officielles à consulter (à J-7 du lancement)

| Référentiel                                | Source à consulter                                | Format                   |
| ------------------------------------------ | ------------------------------------------------- | ------------------------ |
| `zones_climatiques_ref` (par code INSEE)   | Arrêté 4 septembre 2014, annexe III (Légifrance)  | PDF → CSV parsing manuel |
| `revenus_plafonds` 4 tranches Anah 2026    | Arrêté janvier 2026 JO (revalorisation annuelle)  | Tableau officiel         |
| `cee_forfaits` CdP Chauffage 2026          | Charte Coup de Pouce publiée sur ecologie.gouv.fr | Charte PDF               |
| `cee_forfaits` MPR Parcours par geste 2026 | Barème MPR (anah.gouv.fr + maprimerenov.gouv.fr)  | Tableau officiel         |
| `cee_spot_prices` (seed dernières 12 mois) | emmy.fr publication mensuelle 1er du mois         | CSV export               |
| Fiche BAR-TH-171 (formule kWhc)            | PNCEE fiche officielle en vigueur                 | PDF + formule            |

### Seeds provisoires en dev/staging uniquement

Tant que les valeurs 2026 ne sont pas sourcées :

- Utiliser les valeurs **2025 taggées `date_validite_fin = '2025-12-31'`**
- Flag `date_validite_debut = '2026-01-01'` pour les valeurs à renseigner
- Disclaimer simulateur masqué en prod tant que `SELECT COUNT(*) FROM cee_forfaits WHERE date_validite_debut = '2026-01-01' AND montant_kwh_cumac IS NULL > 0`

### ⚠️ Erreurs connues du prompt V1 à NE PAS reproduire

- Paris (75) = **H1**, pas H2
- Marseille (13), Vaucluse (84) = **H3**, pas H2
- Zone climatique = **code INSEE commune**, pas département (Hautes-Alpes, Corse mixtes)
- MPR = **4 couleurs** (Bleu/Jaune/Violet/Rose), pas 2
- MPR rose sur PAC air/eau = **0€** depuis 2024 (parcours par geste)
- Formule kWhc BAR-TH-171 intègre **ETAS** (coef efficacité), pas juste surface × constante
- Cours CEE 2026 ≈ **7€/MWhc classique / 8€ précarité** (marché actuel), pas 9/16

### ⚠️ Smoke tests zones climatiques (bloquants, à ajouter `smoke_tests_420_425.sql`)

```sql
SELECT zone = 'H1' AS ok FROM zones_climatiques_ref WHERE code_insee = '75056'; -- Paris
SELECT zone = 'H3' AS ok FROM zones_climatiques_ref WHERE code_insee = '13055'; -- Marseille
SELECT zone = 'H3' AS ok FROM zones_climatiques_ref WHERE code_insee = '84007'; -- Avignon (Vaucluse)
SELECT COUNT(*) >= 34960 AS ok FROM zones_climatiques_ref; -- nb communes INSEE couvertes
```

**Si ton code V1 stockait `zone` sur `departement` : backfill PR2 VA recalculer TOUTES les primes avec les mauvaises valeurs.** Audit obligatoire avant run backfill : `SELECT COUNT(*) FROM devis WHERE cee_prime_estimee_cts IS NOT NULL` — si > 0, ces devis sont suspects et doivent être recalculés avec la bonne table INSEE.

---

## 6. PR2 — BRIQUE 1 : DÉTECTION CEE SUR `/api/devis`

### Fichier : `lib/cee/detect-eligibility.ts`

```ts
export interface EligibilityInput {
  devis_id: string
  provider_id: string
  type_travaux: string
  montant_ht_cts: number
  surface_m2?: number
  code_postal?: string
  annee_construction?: number
  energie_remplacee?: string
}

export interface EligibilityResult {
  eligible: boolean
  operation_code?: string
  forfait_id?: number
  prime_estimee_cts?: number
  detector_version: string // hash de la logique, ex: "v1.0.0-2026-04-14"
  reasons_rejected?: string[]
}

export async function detectCEEEligibility(input: EligibilityInput): Promise<EligibilityResult>
```

### Règles détection (NE PAS naïves comme V1)

1. **Artisan RGE** : `providers.is_rge = true`
2. **RGE qualifié sur l'opération** : `providers.qualifications @> '[{"code": "QualiPAC"}]'` pour BAR-TH-171/172, QualiBois pour BAR-TH-113, Qualibat pour isolation, etc. — Table de correspondance `operation_code ↔ qualifs_requises` dans `cee_operations_ref`
3. **Bâtiment existant > 2 ans** : `année_construction <= year(now()) - 2` (règle PNCEE)
4. **Mapping type_travaux → operation_code** via table DB, pas hardcodé
5. **Seuil montant HT** : dépend de l'opération (pas uniforme 3000€). Isolation combles = seuil m² minimum, PAC = seuil COP/ETAS
6. **Zone climatique** : résolue via `zones_climatiques_ref` sur CP → impacte forfait
7. **Catégorie revenus** : NON détectable sur devis seul (requiert déclaration bénéficiaire) → `cee_eligible=true` mais `cee_prime_estimee_cts` = fourchette avec hypothèse "modeste" par défaut
8. Calcul prime estimée : fonction séparée `estimatePrime()` qui lit `cee_forfaits` avec snapshot version

### Intégration dans `/api/devis`

```ts
// app/api/devis/route.ts (POST et PUT)
// ... logique existante ...
try {
  const eligibility = await detectCEEEligibility({...});
  await supabase.from('devis').update({
    cee_eligible: eligibility.eligible,
    cee_operation_code: eligibility.operation_code,
    cee_forfait_id: eligibility.forfait_id,
    cee_prime_estimee_cts: eligibility.prime_estimee_cts,
    cee_detector_version: eligibility.detector_version,
    cee_detected_at: new Date()
  }).eq('id', devisId);
} catch (err) {
  Sentry.captureException(err, { tags: { module: 'cee-detection' }});
  // NE JAMAIS bloquer la réponse /api/devis
}
```

### Script backfill : `scripts/backfill-cee-devis.ts`

- Batch 1000/run, cursor-based `WHERE id > $cursor ORDER BY id`
- Off-peak (nuit)
- Métriques : `cee_eligible_ratio`, `detected_count`, `errors_count`
- Dry-run mode obligatoire

### Tests

- `detect-eligibility.test.ts` : 20 cas de test minimum couvrant chaque règle
- Snapshot tests sur format operation_code
- Mock Supabase, pas d'appel réseau

---

## 7. PR3 — BRIQUE 3 : FLAG MAR PROVIDERS

### ⚠️ Prérequis bloquant

**Le dataset MAR N'EXISTE PAS en open data officiel.** Action obligatoire avant coder :

1. Ouvrir DevTools Network sur `https://france-renov.gouv.fr/annuaire-ar/recherche`
2. Saisir CP `75001` + département → capturer la requête XHR
3. Noter : URL endpoint, params, headers requis
4. Tester curl direct : `curl -H "Referer: https://france-renov.gouv.fr/annuaire-ar/recherche" "<endpoint>?..."`
5. Si endpoint JSON accessible → stratégie HTTP direct
6. Sinon → fallback HTML scraping cheerio

**En parallèle** : demande formelle convention ANAH (levier "mandataire CEE Engie").

### Fichier : `scripts/import-mar.ts`

Pattern identique à ADEME sync (migrations 380-381) : **staging + atomic swap + grace period 21j**.

```
fetch_mar_feed (HTTP JSON ou HTML)
  ↓
Zod validation par ligne (schéma MarRow)
  ↓
INSERT INTO mar_staging (run_id = uuid, bulk)
  ↓
QA gate :
  - count(staging) >= 0.80 * rolling_avg_4w → sinon ABORT + Sentry alerte
  - duplicated SIREN = 0 → sinon ABORT
  ↓
BEGIN TRANSACTION
  UPDATE providers SET is_mar_agree=true, mar_source_id, mar_last_seen_at, mar_imported_at, mar_revoked_at=NULL
    WHERE siren IN (SELECT DISTINCT siren FROM mar_staging WHERE import_run_id = $1)
  UPDATE providers SET is_mar_agree=false, mar_revoked_at=now()
    WHERE is_mar_agree=true
      AND siren NOT IN (SELECT DISTINCT siren FROM mar_staging WHERE import_run_id = $1)
      AND mar_last_seen_at < now() - interval '21 days'  -- grace period
COMMIT
  ↓
REFRESH MATERIALIZED VIEW + IndexNow + Sentry metric
```

### Contraintes techniques

- **Match SIREN uniquement** (9 chiffres), pas SIRET (multi-établissements)
- User-Agent : `ServicesArtisans-MAR-Sync/1.0 (+tech@servicesartisans.fr)`
- Rate : 1 req/s strict
- Cron : hebdo dimanche 3h (`0 3 * * 0`)
- DLQ après 3 échecs consécutifs → Sentry P1

### ⚠️ Mode dégradé fetch MAR (non négociable)

Le fallback HTML scraping cheerio est fragile (DOM france-renov peut changer sans préavis). Règle stricte :

- **Si fetch MAR échoue 3 fois consécutives** (timeout / 5xx / parse error / QA gate < 80% rolling avg) → **DLQ P1 Sentry + `is_mar_agree` INCHANGÉ sur tous les providers existants**. NE PAS révoquer.
- Le grace period 21j ne s'applique QUE si le staging est valide (QA gate passée).
- Fetch KO = statu quo read-only sur les flags existants jusqu'à résolution humaine.
- Metric : `mar_sync_status{result=ok|dlq_frozen}` + alerte Slack `#cee-ops` si `dlq_frozen` > 2 runs consécutifs (= 2 semaines sans refresh).
- Plan de résolution manuel documenté : si DOM change → capture nouveau sélecteur via DevTools → PR hotfix parser.

### Dispatch artisan

**NE PAS** réinventer. Intégrer au dispatch marketplace existant :

```ts
// dans le service dispatch existant, ajouter une règle
if (lead.type_travaux === 'renovation_ampleur' || lead.operation_code.startsWith('BAR-TH-REN')) {
  query = query.eq('is_mar_agree', true)
}
```

---

## 8. PR4 — BRIQUE 2 : SIMULATEUR PUBLIC (le plus long)

### Architecture routes

```
/simulateur-aides-cee                            # hub national, canonical
/simulateur-aides-cee/[departement]              # 101 pages, self-canonical
/simulateur-aides-cee/[type-travaux]             # 6 pages produit
/simulateur-aides-cee/[type-travaux]/[departement] # 606 pages LD
/simulateur-aides-cee/copropriete                # variant B2B (phase 2)
/simulateur-aides-cee/resultat?sim=<token>       # noindex
```

Total indexé phase 1 : **~714 pages** (vs 101 du prompt V1). Sitemap dédié `sitemap-cee-simulateur.xml`.

### Wireframe 4 étapes + reveal

Voir la spec UX complète ci-dessous (§ 8bis). State géré via `useReducer` + URL query params (`?etape=1..4`) pour back button natif + tracking.

### Composants React

```
<SimulatorShell>              // wrapper + progress + state machine
  ├── <StepTypeTravaux>        // étape 1 : 6 cards cliquables radio
  ├── <StepLogement>           // étape 2 : <AddressAutocomplete API BAN> + surface + année tranches + énergie
  ├── <StepRevenus>            // étape 3 : <RevenusPicker> 4 tranches Bleu/Jaune/Violet/Rose (pas RFR direct) + foyer stepper
  ├── <StepReveal>             // étape 3bis : <EstimationCard> + 3 <ArtisanCard> + CTA
  ├── <StepCoordonnees>        // étape 4 : prénom/nom/email/tel + 3 cases RGPD + Turnstile
  └── <SimulatorResult>        // thank you
<ExitIntentModal>              // desktop mousemove + mobile scroll up
```

### API routes

```
POST /api/cee/estimate     // body: { type_travaux, code_postal, surface, annee, energie, revenus_categorie, foyer }
                           // response: { primeCEE, primeMPR, total, reste, artisans: [3 matches] }
                           // lit cee_forfaits + revenus_plafonds + zones_climatiques_ref

POST /api/cee/leads        // Zod strict + Turnstile + honeypot + rate-limit
                           // INSERT cee_leads + INSERT cee_pipedrive_outbox + INSERT cee_emails_outbox J+0
                           // fire-and-forget Pipedrive/Brevo
                           // response: { lead_id, artisan_assigned: { name, url } }

POST /api/cee/simulator-events  // tracking funnel (voir §11)

GET /api/cee/bareme?cp=&foyer=  // renvoie tranches Bleu/Jaune/Violet/Rose selon zone + foyer
```

### Zod schema (complet)

```ts
// lib/cee/schemas.ts
import { z } from 'zod'

export const CeeLeadSchema = z.object({
  email: z.string().email().max(254).toLowerCase(),
  prenom: z.string().min(1).max(60),
  nom: z.string().min(1).max(80),
  telephone: z.string().regex(/^(\+33|0)[1-9](\d{8})$/),
  code_postal: z.string().regex(/^\d{5}$/),
  departement: z.string().regex(/^(0[1-9]|[1-8]\d|9[0-5]|2[AB])$/),
  type_travaux: z.enum([
    'pac_air_eau',
    'pac_air_air',
    'ite',
    'iti',
    'combles',
    'plancher_bas',
    'vmc',
    'chauffe_eau',
    'renovation_ampleur',
  ]),
  surface_m2: z.number().int().min(5).max(500),
  annee_construction_tranche: z.enum(['<1948', '1948-1974', '1975-1989', '1990-2005', '>2005']),
  energie_actuelle: z.enum(['gaz', 'fioul', 'electricite', 'bois', 'charbon']),
  foyer_personnes: z.number().int().min(1).max(12),
  revenus_categorie: z.enum(['tres_modeste', 'modeste', 'intermediaire', 'superieur']),
  consent_rgpd_obligatoire: z.literal(true), // case obligatoire mise en relation
  consent_rgpd_privacy: z.literal(true), // case obligatoire politique
  consent_marketing: z.boolean().default(false), // case facultative
  consent_tel_bloctel: z.boolean().default(false), // case facultative si tel
  turnstile_token: z.string().min(20),
  website: z.string().max(0), // honeypot
  sim_token: z.string().uuid().optional(), // référence à session simulator_events
})
```

### Rate-limit + Turnstile + honeypot

Voir §11.

---

## 8bis. SPEC UX DÉTAILLÉE SIMULATEUR

### Étape 1 — Type de travaux

- **H1** : `Quelle rénovation voulez-vous financer ?`
- **Sous-titre** : `En 2 minutes, on calcule vos aides CEE + MaPrimeRénov'. Sans créer de compte.`
- **Progress** : `1/4 — 25%`
- **6 cards** grille 2×3 desktop / 1 col mobile, hauteur 120px (PAC, Chaudière biomasse, Isolation murs, Isolation combles, Menuiseries, Solaire)
- Auto-advance 300ms après sélection mobile
- Réassurance latérale : `Service 100% gratuit` + `Sans engagement` + témoignage « _J'ai touché 4 200€ de CEE sur ma PAC, dossier monté en 3 semaines._ » — Marc L., Rennes

### Étape 2 — Logement

- Champs : `<AddressAutocomplete>` (API BAN `api-adresse.data.gouv.fr/search?q=&limit=5` debounce 250ms), CP (pré-rempli via BAN), surface (number 10-1000), année construction (tranches select), énergie actuelle (radio 4), statut occupant (radio 2)
- Tooltip année : « Pas sûr ? Regardez votre acte de propriété ou taxe foncière. »

### Étape 3 — Revenus

- `<RevenusPicker>` : 4 cards colorées (Bleu/Jaune/Violet/Rose) avec plafonds dynamiques selon CP + foyer
- Foyer stepper `[−] 1 [+]` max 8
- API `/api/cee/bareme?cp=&foyer=` renvoie seuils
- Tooltip : « Les tranches sont ajustées selon votre code postal et votre foyer (barème ANAH 2026). »

### Étape 3bis — REVEAL

- H1 animé : `Votre estimation : jusqu'à XX XXX€ d'aides` (compteur 1.2s easeOut via rAF)
- Breakdown : Prime CEE / MPR / Total / Reste à charge
- Barre comparaison : « Moyenne nationale : 6 200€. Votre estimation : 8 400€ (+35%) »
- 3 cards artisans pré-matchés (prénom + initiale nom, commune, distance, rating, qualifs badges, CTA "Voir le profil")
- Bloc ambré justification : « Pour activer votre dossier + mettre en relation avec [Nom], on a besoin de vos coordonnées. »
- CTA principal : `Débloquer mon estimation exacte + voir mon artisan RGE →`

### Étape 4 — Coordonnées

- Champs : prénom, nom, email, tel (masque `00 00 00 00 00`)
- **3 cases RGPD séparées** (texte exact §10)
- Turnstile widget en bas
- Honeypot field `website` caché
- CTA : `Envoyer ma demande — 100% gratuit`

### Résultat thank-you

- H1 : `Votre dossier est en route`
- Sous-titre : `[Nom] vient de recevoir votre projet. Il vous appelle sous 48h ouvrées. Un récap est parti sur [email].`

### Exit intent modal

- Desktop : `mousemove` vers `e.clientY < 10`
- Mobile : scroll up rapide + `history.pushState`
- 1× max par session (`sessionStorage`)
- Contenu : « Partir sans votre estimation ? Il reste 30 secondes. On vous envoie le résultat par email, sans créer de compte. »

### Micro-copy (40 éléments) — voir fichier séparé `docs/cee/microcopy-simulateur.md` (à créer avec la liste exhaustive)

### Benchmarks conversion

- Étape 1 : 85% (marché 70-75%)
- Étape 2 : 70% (marché 50-55%)
- Étape 3 : 62% (marché 38-42%)
- Reveal : 60%
- Étape 4 : 42%
- **Lead global cible** : **42%** (marché 18-22%)

---

## 9. PR5 — PIPEDRIVE + BREVO + OBSERVABILITÉ

### Pipedrive — Pipeline CEE

**Script bootstrap** : `scripts/bootstrap-pipedrive-cee.ts` (one-shot, à lancer 1 fois)

- Crée le pipeline `CEE - Mandataire` (8 stages avec probabilités 10/25/40/55/75/85/92/100%)
- Crée les custom fields Person (8 champs) et Deal (13 champs) — voir spec agent
- Stocke les keys hashés dans `env.PIPEDRIVE_FIELD_KEYS_JSON`

### Outbox Pipedrive

- Réutiliser pattern de `83dc422f` (cron 6h, DLQ 3 échecs)
- Idempotency-Key = `cee_lead.id` pour Person, `uuid_v5(lead.id, 'deal')` pour Deal
- Dédoublonnage Person : `GET /persons/search?term={email}&exact_match=true` avant création

### Brevo — Séquence 7 touches

Templates à créer dans Brevo (IDs en env var) :

- `CEE_NURTURE_01_RECAP` (J+0 immédiat)
- `CEE_NURTURE_02_GUIDE_{pac,ite,combles,vmc}` (J+1 conditionnel type_travaux)
- `CEE_NURTURE_03_COMPARE` (J+3)
- `CEE_NURTURE_04_TESTIMONIAL` (J+5)
- `CEE_NURTURE_05_VISIO` (J+7, SMS + email fallback)
- `CEE_NURTURE_06_REMIND` (J+14 conditionnel pipedrive_stage ∈ {1,2})
- `CEE_NURTURE_07_URGENCY` (J+30)

**Contenu textuel exact** : voir output complet agent Pipedrive+Brevo, à coller dans templates Brevo tels quels.

**Footer opt-out** obligatoire (conforme L.34-5 CPCE) dans chaque template.

### Webhook Brevo `/api/webhooks/brevo`

- Signature HMAC-SHA256 via `BREVO_WEBHOOK_SECRET`
- Insert `cee_email_events`
- Si `event_type ∈ ('unsubscribe','spam')` → `UPDATE cee_leads SET unsubscribed_at=now()` + cancel futurs emails outbox

### Observabilité

**Sentry tags globaux** : `cee_lead_id`, `simulator_step`, `operation_code`, `outbox_kind`, `attempt_n`

**Métriques `/api/metrics`** (format Prometheus) :

- `cee_simulator_views_total{step}`
- `cee_simulator_abandons_total{step}`
- `cee_leads_created_total{source}`
- `cee_pipedrive_sync_failures_total{event}`
- `cee_brevo_send_failures_total{template}`
- `cee_detection_eligible_ratio` (gauge)
- `cee_outbox_pending{queue}`
- `cee_api_leads_latency_seconds_bucket`

**Alerts Grafana → Slack #cee-ops** :

- Détection CEE drop >20% sur 24h (P1)
- Pipedrive fail rate >5% sur 1h (P1)
- Events flood >10k/h (P2 DDoS)
- Outbox pending >500 for 30min (P2)
- Brevo bounce >3% sur 24h (P1 réputation IP)

---

## 10. MENTIONS RGPD EXACTES (TEXTE À COLLER)

### Bloc au-dessus du formulaire (accordéon, 4 premières lignes toujours visibles)

```
Traitement de vos données personnelles

Responsable du traitement : ServicesArtisans SAS, SIREN {SIREN}, dont le siège est {ADRESSE}, représentée par son Président.

Finalités : (i) calcul d'une estimation du montant de la prime CEE et de MaPrimeRénov' ; (ii) mise en relation avec un artisan titulaire d'une qualification RGE partenaire de ServicesArtisans sur votre zone géographique ; (iii) le cas échéant, proposition d'un mandat de gestion de vos certificats d'économies d'énergie par ServicesArtisans Energy SAS ; (iv) amélioration du service et production de statistiques agrégées anonymes.

Base légale (art. 6-1 RGPD) : consentement (art. 6-1-a) pour la mise en relation et la prospection ; exécution de mesures précontractuelles prises à votre demande (art. 6-1-b) pour le calcul d'estimation ; obligation légale (art. 6-1-c) pour l'archivage des pièces CEE (art. 4 arrêté du 4 septembre 2014 modifié).

Destinataires : l'artisan RGE partenaire sélectionné pour votre zone (destinataire unique et exclusif du lead) ; ServicesArtisans Energy SAS si vous souscrivez un mandat CEE ; le délégataire CEE porteur du dossier (Engie Solutions / Sonergia / autre, identifié avant signature) ; nos sous-traitants techniques (hébergeur Supabase — UE, Vercel — UE, routage email Brevo — UE, CRM Pipedrive — UE/US sous CCT art. 46 RGPD). Aucune cession commerciale à des tiers.

Durées de conservation : lead non converti : 3 ans à compter du dernier contact (CNIL, norme prospection commerciale, délib. 2016-264) ; client (devis signé) : durée de la relation + 5 ans (art. L.110-4 C. com.) ; pièces justificatives CEE : 10 ans à compter de la date d'engagement de l'opération (art. 4 arrêté du 4 septembre 2014 modifié par arrêté du 2 novembre 2023) ; cookies et traceurs : 13 mois maximum (CNIL délib. 2020-091).

Vos droits (art. 15 à 22 RGPD et art. 85 LIL) : accès, rectification, effacement, limitation, opposition, portabilité, retrait du consentement à tout moment, directives post mortem. Exercice : {EMAIL_DPO} ou courrier à l'adresse du siège avec copie d'une pièce d'identité. Réponse sous 1 mois (art. 12-3 RGPD).

Délégué à la protection des données : {EMAIL_DPO}.

Réclamation : vous pouvez introduire une réclamation auprès de la CNIL (3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, www.cnil.fr) sans préjudice d'un recours juridictionnel.
```

### 4 cases à cocher (non cochées par défaut)

**Case 1 — OBLIGATOIRE** :

```
☐ Je consens à la transmission de ma demande à un artisan RGE partenaire de ServicesArtisans pour qu'il me recontacte en vue d'établir un devis gratuit et sans engagement. Je comprends qu'un seul artisan sera destinataire de ma demande (lead exclusif).
```

**Case 2 — OBLIGATOIRE** :

```
☐ Je reconnais avoir pris connaissance des informations ci-dessus relatives au traitement de mes données personnelles et de la [Politique de confidentialité](/politique-confidentialite).
```

**Case 3 — OPTIONNELLE** :

```
☐ J'accepte de recevoir par email des informations sur les aides à la rénovation énergétique et les services de ServicesArtisans (désinscription en 1 clic dans chaque email).
```

**Case 4 — OPTIONNELLE** (si téléphone renseigné, obligation Bloctel L.223-1 C. conso) :

```
☐ J'accepte d'être contacté par téléphone par l'artisan RGE partenaire pour les besoins de mon projet. J'ai été informé(e) de mon droit de m'inscrire gratuitement sur la liste d'opposition au démarchage téléphonique Bloctel (www.bloctel.gouv.fr).
```

### Page résultat — disclaimer exact

```
Estimation non contractuelle. Le montant affiché est une estimation indicative calculée sur la base des informations que vous avez déclarées et des barèmes en vigueur à la date du {DATE_VERSION_BAREMES}. Il ne constitue ni un engagement de ServicesArtisans, ni une garantie de versement. Le montant définitif dépendra de l'éligibilité confirmée de votre projet, des caractéristiques techniques validées par l'artisan et du cours des CEE à la date de dépôt du dossier.

Sources : fiches d'opérations standardisées publiées par le Ministère de la Transition écologique (arrêté du 22 décembre 2014 modifié) ; barème MaPrimeRénov' (arrêté du 14 janvier 2020 modifié) ; cours CEE EEX Emmy consulté le {DATE}. Le cours des CEE est volatil et peut varier significativement entre la simulation et le dépôt effectif du dossier.

Pour les rénovations d'ampleur (gain énergétique ≥ 2 classes DPE) : l'accompagnement par un Accompagnateur Rénov' agréé est obligatoire pour bénéficier de MaPrimeRénov' Parcours accompagné (décret n° 2022-1649 du 23 décembre 2022 ; arrêté du 21 décembre 2022). Trouvez un Accompagnateur Rénov' sur france-renov.gouv.fr.

ServicesArtisans est un service privé, édité par ServicesArtisans SAS. Il ne s'agit pas d'un service public. Pour une information officielle et gratuite sur les aides à la rénovation énergétique, consultez mesaidesreno.gouv.fr et france-renov.gouv.fr, ou appelez le service public France Rénov' au 0 808 800 700 (service gratuit + prix d'un appel local).
```

### Écran mandat CEE (si souscription)

6 mentions obligatoires arrêté 2/11/2023 + formulaire rétractation R.221-1 — voir `docs/cee/mentions-mandat-cee.md` (à créer avec texte complet agent RGPD).

### Bandeau cookies (CNIL-conforme)

Boutons symétriques `Tout accepter` / `Tout refuser` / `Personnaliser` — voir texte agent RGPD.

### Page `/politique-confidentialite`

15 sections — voir plan agent RGPD.

### AIPD obligatoire

Justification : 5 critères CNIL 11/10/2018 (scoring + données financières + personnes vulnérables + grande échelle + croisement). Template PIA v3 CNIL.

### Registre traitements (art. 30 RGPD)

Entrée T-2026-001 "Simulateur CEE et mise en relation artisan RGE" — tableau complet agent RGPD.

---

## 11. RATE-LIMIT + ANTI-SPAM + TRACKING

### Upstash Ratelimit

```ts
import { Ratelimit } from '@upstash/ratelimit'
const rl = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  prefix: 'rl:cee-leads',
})
```

5 submissions/IP/h sur `POST /api/cee/leads`. Réponse 429 avec `Retry-After`.

### Turnstile Cloudflare

- Widget étape 4 : `TURNSTILE_SITE_KEY` (public)
- Server-side verify : `POST https://challenges.cloudflare.com/turnstile/v0/siteverify` avec `TURNSTILE_SECRET_KEY`
- **Bypass dev local** : si `BYPASS_TURNSTILE=true` ET `NODE_ENV !== 'production'` → `return { success: true }` sans appel réseau. Sinon PR4 impossible à tester en local.
- **Fail fast au boot** : si `NODE_ENV=production` ET `BYPASS_TURNSTILE=true` → `throw new Error('BYPASS_TURNSTILE interdit en prod')` au démarrage server (guard dans `lib/env.ts` ou équivalent).

```ts
// lib/cee/turnstile.ts
export async function verifyTurnstile(token: string, ip?: string) {
  if (process.env.BYPASS_TURNSTILE === 'true' && process.env.NODE_ENV !== 'production') {
    return { success: true, bypass: true }
  }
  // ... appel siteverify normal
}
// lib/env.ts (boot check)
if (process.env.NODE_ENV === 'production' && process.env.BYPASS_TURNSTILE === 'true') {
  throw new Error('SECURITY: BYPASS_TURNSTILE=true interdit en production')
}
```

### Honeypot

```html
<input name="website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" />
```

Si rempli → 204 silent drop + `Sentry.captureMessage('honeypot_hit', level='info')`

### Dédoublonnage

```sql
SELECT count(*) FROM cee_leads WHERE email_hash = $1 AND created_at > now() - interval '24 hours'
```

Si ≥ 3 → `duplicate_of = first.id`, skip Pipedrive + skip Brevo.

### Tracking événements simulateur

Events envoyés à `POST /api/cee/simulator-events` (insert async, non bloquant) :

- `view_step_{n}` (1..4)
- `view_reveal`, `view_result`
- `submit_step_{n}` avec `{durationMs, fieldsFilled}`
- `validation_error` `{field, errorCode}`
- `reveal_shown` `{estimationMin, estimationMax}`
- `reveal_to_coords_click`
- `lead_submitted` `{leadId, artisanId, rgpdOptin}`
- `lead_partial_submitted` (exit intent)
- `abandon_step_{n}` (via `navigator.sendBeacon` sur `beforeunload`)
- `exit_intent_shown/converted/dismissed`
- `tooltip_opened` `{name}`
- `back_button_clicked` `{fromStep, toStep}`
- `artisan_card_clicked` `{artisanId, position}`

---

## 12. ENV VARS À AJOUTER

```bash
# Pipedrive CEE
PIPEDRIVE_PIPELINE_CEE_ID=
PIPEDRIVE_USER_DISPATCH_CEE=
PIPEDRIVE_FIELD_KEYS_JSON=

# Brevo
BREVO_WEBHOOK_SECRET=
BREVO_TEMPLATE_IDS_JSON=

# Cloudflare Turnstile
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
BYPASS_TURNSTILE=false  # true uniquement en dev local, guard fail-fast en prod

# Upstash Redis (rate limit)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Cron auth
CRON_SECRET=

# Observabilité
METRICS_IP_ALLOWLIST=

# MAR import
MAR_FEED_URL=
MAR_USER_AGENT_CONTACT=tech@servicesartisans.fr

# SA Energy placeholders (à renseigner post-constitution SAS)
SA_ENERGY_SIREN=
SA_ENERGY_PPEE_NUMBER=
SA_ENERGY_ADRESSE=
DPO_EMAIL=
```

---

## 13. CHECKLIST GO-PROD

Avant merge PR4 en production, **valider chaque case** :

- [ ] Migrations 420-425 appliquées + smoke tests ✓ × 20
- [ ] Référentiels seedés avec valeurs 2026 sourcées officielles (§5)
- [ ] RLS `cee_leads` vérifiée : anon SELECT → 401, anon INSERT → 401, service_role ALL OK
- [ ] Zod schema refuse inputs malformés (test 15 cas)
- [ ] Turnstile bloque absence de token
- [ ] Rate-limit 429 après 5 soumissions/h depuis même IP
- [ ] Honeypot déclenche silent drop + log
- [ ] Pipedrive outbox : 3 échecs consécutifs → DLQ + Sentry P1
- [ ] Brevo outbox : retry backoff 5min/30min, DLQ après 3
- [ ] Dédoublonnage email : 4ème soumission 24h → skip flagged `duplicate_of`
- [ ] Mentions RGPD visibles avant soumission formulaire
- [ ] 3 cases à cocher séparées, 2 obligatoires, blocage UX si non cochées
- [ ] Disclaimer estimation affiché page résultat
- [ ] Bordereau rétractation R.221-1 téléchargeable écran mandat
- [ ] Bandeau cookies CNIL symétrique sur première visite
- [ ] Politique confidentialité accessible /politique-confidentialite (15 sections)
- [ ] AIPD documentée dans registre traitements
- [ ] Séquence Brevo 7 touches : 7 templates créés + tests envoi sandbox
- [ ] Webhook Brevo signature HMAC vérifiée
- [ ] Redirection obligatoire MAR si `type_travaux = renovation_ampleur`
- [ ] Mention "service privé" + renvoi mesaidesreno.gouv.fr page résultat
- [ ] Tests `detect-eligibility.ts` couverture 100% branches
- [ ] Tests `calculate-prime.ts` validés sur 10 cas officiels (cf. simulateurs-aides.gouv.fr)
- [ ] Backfill devis historiques exécuté en dry-run + validation métier
- [ ] Dashboard Metabase : 4 requêtes funnel/conversion opérationnelles
- [ ] Alerts Grafana : 5 règles configurées Slack #cee-ops
- [ ] Load test k6 : 500 rps pendant 10 min sur `/api/cee/leads` sans dégradation

---

## 14. CE QUI N'EST **PAS** DANS CE PROMPT (hors scope, phase 2)

- Constitution juridique SA Energy SAS (expert-comptable + avocat énergie, hors dev)
- Convention intra-groupe prix de transfert 30€/lead SA SAS ↔ SA Energy
- Ouverture compte EMMY (4-8 semaines, admin EEX)
- Agrément MAR de ServicesArtisans Energy (dossier ANAH 12 mois)
- Dépôt réel dossiers CEE auprès délégataire Engie (post-convention signée)
- Variant B2B copropriétés (phase 2, cf. audit SEO)
- Intégration DocuSign + IDNow pour QES (phase 2, sur mandats réels)

---

## 15. NIVEAU D'EXIGENCE

Ce prompt intègre **6 domaines d'expertise parallèles** (barèmes réglementaires + RGPD + DDL data + UX reverse funnel + Pipedrive/Brevo + sources MAR). Toute régression sur un domaine = PR bloquée.

**Référence de rigueur** : pattern reviews 2026-04-12 (schema drift évité), Pipedrive v1 (outbox retry), ADEME sync (atomic swap). Reproduis ces patterns, ne réinvente rien.

**Hostile par défaut** : assume que l'utilisateur est un bot spammeur, que le feed MAR va casser, que Pipedrive va retourner 429, que Supabase va drop une connexion. Ton code survit. Sentry voit tout.

**Si un point est ambigu** : STOP, pose la question, ne décide pas seul. Les dettes Pipedrive v1 et reviews drift ont coûté 4-6 PR de correction — on ne recommence pas.

---

**Fin prompt V2. ~4 500 mots.**
