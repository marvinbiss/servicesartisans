# MISSION — V3 Artisan-First CEE ServicesArtisans Energy

**Date** : 2026-04-14
**Cible** : agent dev Next.js 15 + Supabase + TypeScript strict
**Niveau attendu** : production-grade, top 0.001%, zéro compromis
**Base existante** : marketplace 188 API routes, 232 composants, 348k pages SEO, Pipedrive+Brevo+Sentry+Supabase RLS+ADEME sync+cron retry 6h opérationnels, ~Nk providers dont X QualiPAC vérifiés

---

## 0. PIVOT STRATÉGIQUE — LIRE AVANT TOUTE LIGNE DE CODE

**V2 était BtoC** (simulateur public → lead particulier → dispatch artisan).
**V3 est BtoB artisan-first** (activation base artisans RGE existante → l'artisan amène le client → SA Energy monte le dossier CEE).

### Pourquoi ce pivot

| Dimension | BtoC simulateur | **BtoB artisan apporteur** |
|---|---|---|
| CAC | 90€/lead | **~0€ (base existante)** |
| Conversion bout-en-bout | ~6% | **80-90%** (devis déjà signé) |
| Dépendance trafic | Haute | **Nulle** (scale linéaire sur activation artisan) |
| Ticket moyen | Moyen | **Supérieur** (artisan pousse au chantier) |
| Coût d'acquisition scale | Exponentiel | **Constant** |

### Math cible

**200 artisans actifs × 2 dossiers/mois = 400 dossiers/mois**
= 648 k€/mois brut, 7,8 M€/an brut, marge nette ~5,5 M€/an après coûts.

Version ambitieuse (500 × 3 = 1 500) = 29 M€/an brut. À valider par le taux réel d'activation.

### Conséquence code

- **Cœur V3 = portail artisan** `/espace-artisan/cee/*` + **back-office ops SA Energy** `/admin/cee/*`
- Simulateur public `/simulateur-aides-cee` **reste** (lead gen + SEO + marque) mais **secondaire**
- Nouveau : `cee_artisan_partners`, `cee_dossiers`, `cee_dossier_documents`, `cee_commissions`
- Nouveau : workflow DocuSign convention, Stripe Connect ou SEPA virement, formation/certif quiz, QA interne 3-5%

---

## 1. RÈGLES NON NÉGOCIABLES

1. **Zéro dossier CEE soumis au délégataire sans QA interne passée** — responsabilité solidaire CA Paris 2024 + Cass. crim. 2024.
2. **Zéro commission payée avant validation PNCEE** (pas sur simple dépôt). Cash cycle artisan = dépôt → validation Sonergia → versement.
3. **Zéro PII client en clair sans RLS.** L'artisan ne voit QUE ses propres dossiers.
4. **Zéro artisan activé sans convention DocuSign signée + IBAN + RGE valide à la date dépôt.**
5. **Formation obligatoire avant premier dépôt** (vidéo + quiz 8/10). Sinon blocage UX.
6. **Contrôle qualité échantillonnage 3-5%** (Hellio benchmark) par ops humain — pas tout auto.
7. **Zéro hardcode barème** (tables versionnées, snapshot sur dossier).
8. **Idempotence partout** (uploads, soumissions, commissions).
9. **Observabilité dossier par dossier** (status machine, audit trail, Sentry tags).
10. **RGPD bloquant** : mandat CEE arrêté 2/11/2023 (6 mentions obligatoires + R.221-1), conservation 10 ans pièces CEE, mandat artisan révocable.
11. **Ne jamais révoquer `is_rge` ou `is_mar_agree` sur échec de fetch** — mode dégradé read-only.
12. **Commit atomique par PR**, 7 PR séquentielles.

---

## 2. PLAN D'EXÉCUTION — 7 PR SÉQUENTIELLES

| PR | Scope | Durée |
|---|---|---|
| **PR1** | Migrations 420-428 (ref + devis + providers + dossiers + documents + commissions + partners + observabilité) | 4-6j |
| **PR2** | Base artisan activation : email campaign + landing `/devenir-partenaire-cee` + onboarding wizard + convention DocuSign | 4j |
| **PR3** | Portail artisan `/espace-artisan/cee` : dashboard + formation + certification + upload pièces | 6-8j |
| **PR4** | Back-office ops SA Energy `/admin/cee` : queue dossiers + QA 3-5% + soumission délégataire + suivi statuts | 5-7j |
| **PR5** | Détection CEE `/api/devis` (auto-flag) + backfill devis historiques | 3j |
| **PR6** | Flag MAR providers (atomic swap) + simulateur public résiduel (lead gen léger) | 3-4j |
| **PR7** | Commissions artisan (calcul + virement SEPA batch hebdo ou Stripe Connect) + Pipedrive pipeline ops + Brevo nurture artisan+client | 4j |

**Dépendances** : PR1 bloque tout. PR2 avant PR3. PR3 avant PR4 (les ops valident des dossiers créés par artisans). PR5+PR6 parallèles après PR1. PR7 dernier.

---

## 3. RECONNAISSANCE OBLIGATOIRE AVANT CODE

```bash
# 1. Taille base artisan activable (ton TAM immédiat)
psql $DATABASE_URL -c "
SELECT COUNT(*) FROM providers
WHERE qualifications @> '[{\"code\":\"QualiPAC\"}]'::jsonb
  AND email IS NOT NULL
  AND is_active = true
  AND (is_rge = true OR qualifications @> '[{\"code\":\"RGE\"}]'::jsonb);
"
# Même requête pour Qualibat, QualiBois, Qualit'EnR (ITE/solaire), Qualifelec
# Ce chiffre définit le scope commercial.

# 2. Schéma existant
psql $DATABASE_URL -c "\d providers"
psql $DATABASE_URL -c "\d devis"
psql $DATABASE_URL -c "\d profiles"

# 3. Dernières migrations
ls supabase/migrations/ | sort | tail -10

# 4. Helpers existants
grep -rn "outbox\|pipedrive\|set_updated_at\|createAdminClient" lib/ | head -30

# 5. Espace artisan existant
ls src/app/\(private\)/espace-artisan/ 2>/dev/null
grep -rn "espace-artisan" src/app/ | head -20

# 6. DocuSign / Stripe existants
grep -rn "docusign\|stripe" lib/ src/app/api/ 2>/dev/null
```

**Rapporte les 6 résultats avant toute migration.**

---

## 4. PR1 — DDL MIGRATIONS 420-428

### Réutiliser partiellement V2

Les migrations 420-425 du V2 (`docs/cee/420_425_cee_mandataire.sql`) restent valides pour :
- 420 : 5 tables référentiels (zones clim INSEE, forfaits, SPOT, plafonds, opérations)
- 421 : 3 ENUMs (à étendre)
- 422 : extension `devis` (flag auto-détection)
- 423 : extension `providers` MAR

**À ajouter en 426-428** :

### 426 — `cee_artisan_partners` (activation + convention + IBAN)

```sql
CREATE TABLE cee_artisan_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,

  -- Status activation
  status cee_partner_status NOT NULL DEFAULT 'invited',
  -- invited → onboarding → convention_sent → convention_signed → training → certified → active → suspended → revoked
  invited_at timestamptz,
  onboarding_started_at timestamptz,
  convention_sent_at timestamptz,
  convention_signed_at timestamptz,
  convention_envelope_id text, -- DocuSign
  convention_pdf_url text,      -- stockage signé
  training_completed_at timestamptz,
  certification_score int,      -- quiz /10
  certified_at timestamptz,
  activated_at timestamptz,
  suspended_at timestamptz,
  suspended_reason text,
  revoked_at timestamptz,

  -- Paiement
  iban_encrypted text,          -- chiffré pgcrypto
  iban_last4 char(4),
  bic text,
  titulaire_compte text,
  stripe_connect_account_id text,  -- alternative si Stripe Connect

  -- Commission
  commission_rate_default numeric(5,2) NOT NULL DEFAULT 10.00, -- 10% HT
  commission_rate_override numeric(5,2),  -- négocié cas par cas
  commission_rate_effective numeric(5,2) GENERATED ALWAYS AS
    (COALESCE(commission_rate_override, commission_rate_default)) STORED,

  -- Scope
  qualifications_snapshot jsonb,  -- snapshot RGE à l'activation
  operations_allowed text[],      -- ['BAR-TH-171','BAR-EN-101',...] autorisées selon qualifs
  zones_allowed text[],           -- départements couverts (ex. ['75','92','93'])

  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (provider_id)
);

CREATE TYPE cee_partner_status AS ENUM (
  'invited','onboarding','convention_sent','convention_signed',
  'training','certified','active','suspended','revoked'
);

CREATE INDEX idx_cee_partners_status ON cee_artisan_partners(status) WHERE status IN ('active','certified');
CREATE INDEX idx_cee_partners_user ON cee_artisan_partners(user_id);

-- RLS
ALTER TABLE cee_artisan_partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY partners_artisan_self_read ON cee_artisan_partners
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY partners_admin_all ON cee_artisan_partners
  FOR ALL USING (auth.jwt()->>'role' = 'admin');
-- anon / other artisans : deny par défaut (pas de policy)

CREATE TRIGGER trg_partners_updated BEFORE UPDATE ON cee_artisan_partners
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### 427 — `cee_dossiers` (cœur métier) + `cee_dossier_documents` + `cee_dossier_events`

```sql
CREATE TABLE cee_dossiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,  -- format SAE-YYYYMM-NNNNNN

  -- Partenaire source
  partner_id uuid NOT NULL REFERENCES cee_artisan_partners(id) ON DELETE RESTRICT,
  provider_id uuid NOT NULL REFERENCES providers(id),

  -- Client bénéficiaire
  client_nom text NOT NULL,
  client_prenom text NOT NULL,
  client_email_encrypted text NOT NULL,
  client_email_hash text GENERATED ALWAYS AS (encode(digest(lower(client_email_encrypted),'sha256'),'hex')) STORED,
  client_telephone_encrypted text,
  client_adresse_encrypted text NOT NULL,
  client_code_postal text NOT NULL,
  client_commune_insee text NOT NULL REFERENCES zones_climatiques_ref(code_insee),

  -- Revenus bénéficiaire (déclaratif + pièce d'impôt obligatoire)
  foyer_personnes smallint NOT NULL CHECK (foyer_personnes BETWEEN 1 AND 12),
  revenus_categorie categorie_revenus NOT NULL,
  rfr_declared_cts bigint,   -- revenu fiscal référence déclaré

  -- Chantier
  operation_code text NOT NULL REFERENCES cee_operations_ref(code),
  type_travaux text NOT NULL,
  surface_m2 numeric(7,2),
  annee_construction smallint,
  energie_remplacee text,
  montant_ht_cts bigint NOT NULL,
  montant_ttc_cts bigint NOT NULL,
  date_devis date NOT NULL,
  date_chantier_prevue date,
  date_chantier_realisee date,

  -- Primes calculées (snapshot versionné)
  forfait_id bigint NOT NULL REFERENCES cee_forfaits(id),
  forfait_version text NOT NULL,  -- hash date_validite_debut + montant
  prime_cee_cts bigint NOT NULL,
  prime_mpr_cts bigint,
  prime_total_cts bigint GENERATED ALWAYS AS (prime_cee_cts + COALESCE(prime_mpr_cts,0)) STORED,
  reste_a_charge_cts bigint GENERATED ALWAYS AS (montant_ttc_cts - prime_cee_cts - COALESCE(prime_mpr_cts,0)) STORED,

  -- Délégataire
  delegataire text,  -- 'sonergia','engie','totalenergies'...
  delegataire_reference text,
  delegataire_submission_at timestamptz,
  delegataire_response_at timestamptz,
  delegataire_response_status text, -- accepted/rejected/pending
  delegataire_response_motif text,
  pncee_reference text,

  -- Status machine
  status cee_dossier_status NOT NULL DEFAULT 'draft',
  -- draft → submitted_by_artisan → qa_pending → qa_approved|qa_rejected → deposited → validated|rejected_pncee → paid_client → commission_due → commission_paid → archived
  qa_score int,           -- scoring QA interne
  qa_reviewer_id uuid REFERENCES auth.users(id),
  qa_reviewed_at timestamptz,
  qa_notes text,

  -- Commission artisan
  commission_rate numeric(5,2) NOT NULL,  -- snapshot
  commission_amount_cts bigint GENERATED ALWAYS AS
    ((montant_ht_cts * commission_rate / 100)::bigint) STORED,
  commission_status text DEFAULT 'pending', -- pending|due|paid|cancelled
  commission_paid_at timestamptz,

  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '10 years', -- conservation pièces CEE

  CHECK (operation_code ~ '^(BAR|BAT|IND|RES|TRA|AGRI)-[A-Z]{2}-[0-9]{3}$')
);

CREATE TYPE cee_dossier_status AS ENUM (
  'draft','submitted_by_artisan','qa_pending','qa_approved','qa_rejected',
  'deposited','validated','rejected_pncee','paid_client',
  'commission_due','commission_paid','archived'
);

CREATE INDEX idx_dossiers_partner_status ON cee_dossiers(partner_id, status);
CREATE INDEX idx_dossiers_qa_queue ON cee_dossiers(created_at) WHERE status = 'qa_pending';
CREATE INDEX idx_dossiers_deleg ON cee_dossiers(delegataire, delegataire_submission_at)
  WHERE status IN ('deposited','validated','rejected_pncee');

-- RLS
ALTER TABLE cee_dossiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY dossiers_artisan_self ON cee_dossiers
  FOR SELECT USING (partner_id IN (SELECT id FROM cee_artisan_partners WHERE user_id = auth.uid()));
CREATE POLICY dossiers_artisan_insert ON cee_dossiers
  FOR INSERT WITH CHECK (partner_id IN (
    SELECT id FROM cee_artisan_partners WHERE user_id = auth.uid() AND status = 'active'
  ));
CREATE POLICY dossiers_artisan_update_draft ON cee_dossiers
  FOR UPDATE USING (
    partner_id IN (SELECT id FROM cee_artisan_partners WHERE user_id = auth.uid())
    AND status IN ('draft','qa_rejected')
  );
CREATE POLICY dossiers_admin_all ON cee_dossiers FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- Documents
CREATE TABLE cee_dossier_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id uuid NOT NULL REFERENCES cee_dossiers(id) ON DELETE CASCADE,
  kind text NOT NULL, -- 'devis_signe','facture','avis_imposition','mandat_cee','photo_avant','photo_apres','fiche_technique','attestation_rge','pv_reception'
  filename text NOT NULL,
  storage_path text NOT NULL,   -- Supabase Storage bucket cee-dossiers/{dossier_id}/{kind}/...
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL,
  sha256 text NOT NULL,         -- intégrité
  geo_lat numeric(10,7),         -- photos géoloc obligatoires depuis 1/1/2026
  geo_lng numeric(10,7),
  taken_at timestamptz,          -- EXIF
  uploaded_by uuid NOT NULL REFERENCES auth.users(id),
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  virus_scan_status text DEFAULT 'pending',  -- pending/clean/infected
  UNIQUE (dossier_id, kind, sha256)
);
CREATE INDEX idx_doc_dossier ON cee_dossier_documents(dossier_id);
ALTER TABLE cee_dossier_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY doc_artisan_self ON cee_dossier_documents
  FOR ALL USING (dossier_id IN (
    SELECT id FROM cee_dossiers WHERE partner_id IN (
      SELECT id FROM cee_artisan_partners WHERE user_id = auth.uid()
    )
  ));
CREATE POLICY doc_admin_all ON cee_dossier_documents FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- Events / audit trail
CREATE TABLE cee_dossier_events (
  id bigserial PRIMARY KEY,
  dossier_id uuid NOT NULL REFERENCES cee_dossiers(id) ON DELETE CASCADE,
  event_type text NOT NULL,  -- status_change, doc_uploaded, qa_review, deleg_submitted, ...
  actor_id uuid REFERENCES auth.users(id),
  actor_role text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_dossier ON cee_dossier_events(dossier_id, created_at DESC);
```

### 428 — `cee_commissions` + outbox paiement

```sql
CREATE TABLE cee_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id uuid NOT NULL UNIQUE REFERENCES cee_dossiers(id),
  partner_id uuid NOT NULL REFERENCES cee_artisan_partners(id),
  amount_cts bigint NOT NULL,
  currency char(3) NOT NULL DEFAULT 'EUR',
  status text NOT NULL DEFAULT 'due', -- due|batched|sent|confirmed|failed
  batch_id uuid,
  payment_method text,  -- 'sepa_credit_transfer','stripe_connect'
  payment_reference text,  -- IBAN end-to-end ID ou Stripe transfer id
  invoice_number text,     -- auto-incrément factu commission
  invoice_pdf_url text,
  scheduled_at timestamptz,
  sent_at timestamptz,
  confirmed_at timestamptz,
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_commissions_batch ON cee_commissions(batch_id, status);
CREATE INDEX idx_commissions_due ON cee_commissions(partner_id) WHERE status = 'due';
```

### Smoke tests additionnels

Ajouter à `smoke_tests_420_425.sql` (renommer en `smoke_tests_420_428.sql`) 15 tests :
- RLS artisan ne voit pas dossiers d'un autre
- Artisan non `active` ne peut pas INSERT dossier
- Artisan peut UPDATE uniquement si status ∈ {draft, qa_rejected}
- Commission calculée correctement via GENERATED column
- Status transition illégales bloquées (via trigger)
- Upload document unique par (dossier, kind, sha256)
- Zone clim Paris 75056 = H1, Marseille 13055 = H3
- Expiration dossier = 10 ans exact

---

## 5. PR2 — ACTIVATION BASE ARTISAN

### 5.1 Requête TAM

```sql
-- À exécuter avant de lancer
CREATE MATERIALIZED VIEW mv_cee_partners_tam AS
SELECT
  p.id, p.name, p.email, p.phone, p.siret,
  p.qualifications,
  CASE
    WHEN p.qualifications @> '[{"code":"QualiPAC"}]' THEN 'PAC'
    WHEN p.qualifications @> '[{"code":"Qualibat"}]' THEN 'ITE_ITI'
    WHEN p.qualifications @> '[{"code":"QualiBois"}]' THEN 'BIOMASSE'
    WHEN p.qualifications @> '[{"code":"Qualit-EnR"}]' THEN 'SOLAIRE'
  END AS segment,
  p.address_region, p.address_department
FROM providers p
WHERE p.is_active = true
  AND p.email IS NOT NULL
  AND p.is_rge = true
  AND NOT EXISTS (SELECT 1 FROM cee_artisan_partners cap WHERE cap.provider_id = p.id);
REFRESH MATERIALIZED VIEW mv_cee_partners_tam;
-- Refresh cron hebdo
```

### 5.2 Email d'invitation (Brevo template `CEE_PARTNER_INVITE_01`)

**Segmenté par qualification** (PAC / ITE / Biomasse / Solaire).

Objet : *"{prenom_dirigeant}, débloque 7 000€ d'aides sur chaque chantier PAC"*

Corps (template — à adapter) :
- H1 : Transformez vos devis en chantiers signés
- Problème : "Vos clients hésitent devant 12 000€ ? Avec CEE + MPR, reste à charge 5 000€."
- Solution : "ServicesArtisans Energy monte le dossier CEE à votre place. Vous encaissez votre chantier + une commission."
- Preuve sociale : "{X} artisans QualiPAC nous ont déjà rejoint. {Y} dossiers traités. Commission moyenne 1 200€/chantier."
- CTA : `/devenir-partenaire-cee?ref={provider_id_signed}`
- Footer opt-out L.34-5 CPCE

Envoi batch 500/jour, throttle SMTP Brevo, UTM tracking.

**Relances** : J+3 (ouverture mais pas click), J+7 (pas d'ouverture — changement objet), J+14 (dernière chance). Arrêt automatique après désinscription ou inscription.

### 5.3 Landing `/devenir-partenaire-cee`

Route publique, noindex (pour ne pas cannibaliser SEO hub).

Sections :
1. **Proof above fold** : "{N} artisans partenaires · {M} dossiers traités · {Z}M€ de primes versées"
2. **Simulateur reverse** : "Votre chantier moyen en €" slider → "Votre commission mensuelle estimée : X €" (stimule FOMO)
3. **Comment ça marche** : 5 étapes (invite → convention → formation → premier dossier → commission)
4. **3 témoignages artisans** (vidéos courtes 30s ou quotes)
5. **FAQ** : combien ça coûte (0€), conflit avec abonnement (non, service distinct), combien de temps (5 min/dossier), quand je suis payé (J+7 post validation PNCEE), et si le dossier est rejeté (commission annulée), puis-je sortir (préavis 30j)
6. **CTA principal** : "Je démarre mon onboarding" → `/devenir-partenaire-cee/onboarding`
7. **Mentions** : "ServicesArtisans Energy SAS, SIREN {X}, mandataire CEE immatriculé PP-EE n°{Y}"

### 5.4 Onboarding wizard `/devenir-partenaire-cee/onboarding`

Route privée (auth artisan existante + claim vérifié). Si pas encore auth : redirect `/connexion?next=...`.

Étapes :

**Étape 1 — Vérif identité** : SIRET pré-rempli depuis `providers`, RGE check temps réel via ADEME sync cache, IBAN saisie + masque + validation mod-97.

**Étape 2 — Scope** : opérations souhaitées (cases selon qualifs détectées), départements couverts (multi-select carte), volume estimé/mois (slider).

**Étape 3 — Convention DocuSign** :
- Genération PDF convention via template (champs pré-remplis : raison sociale, SIREN, dirigeant, IBAN, taux commission, scope)
- Push enveloppe DocuSign via API
- Webhook `/api/webhooks/docusign` met à jour `convention_signed_at` + stocke PDF signé
- Email confirmation envoyé automatiquement

**Étape 4 — Formation** :
- 4 vidéos Wistia/Mux (3-5 min chacune) : (1) rôle SA Energy vs artisan, (2) pièces obligatoires par fiche BAR, (3) photos géoloc depuis 1/1/2026, (4) éthique + pièges fraude
- Quiz 10 questions, seuil 8/10, retry illimité, tracking tentatives
- Certification générée + PDF téléchargeable

**Étape 5 — Activation** : status → `active`, email bienvenue, CTA "Créer mon premier dossier"

### 5.5 API routes PR2

```
POST /api/cee/partners/invite-batch        # admin, batch email Brevo
GET  /api/cee/partners/me                  # artisan auth, lit son record
POST /api/cee/partners/onboarding/iban     # chiffré pgcrypto
POST /api/cee/partners/onboarding/convention  # crée enveloppe DocuSign
POST /api/webhooks/docusign                # HMAC verify + update status
POST /api/cee/partners/training/quiz       # submit réponses, calcule score
POST /api/cee/partners/activate            # final, admin ou auto si quiz OK
```

---

## 6. PR3 — PORTAIL ARTISAN `/espace-artisan/cee`

### 6.1 Dashboard `/espace-artisan/cee`

KPIs :
- Dossiers en cours (par status)
- Primes totales montées (ce mois / lifetime)
- Commissions dues (€)
- Commissions payées (€)
- Taux de rejet QA (%) — incite à mieux faire
- Prochain versement (date + montant)

Blocks :
- CTA "Nouveau dossier CEE"
- Liste 10 derniers dossiers (status badge, montant, commission)
- Alerte si dossiers `qa_rejected` (action requise)
- Rappel formation si score quiz < 10 ou >12 mois

### 6.2 Wizard nouveau dossier `/espace-artisan/cee/nouveau`

**Étape 1 — Client** : nom, prénom, email, tel, adresse (AddressAutocomplete BAN), CP → INSEE commune auto

**Étape 2 — Revenus** : foyer (1-12 stepper), RFR déclaré (OU upload avis d'imposition avec OCR Claude Vision en async), catégorie déduite auto selon plafonds Anah (Bleu/Jaune/Violet/Rose)

**Étape 3 — Chantier** : operation_code select filtré par qualifs artisan, type_travaux détail, surface, année construction, énergie remplacée, montant HT (number + ancillary TVA calc auto), date devis, date chantier prévue

**Étape 4 — Preview prime** : calcul live `/api/cee/estimate-dossier` avec snapshot version
- Affichage breakdown : CEE / MPR / Total / Commission artisan / Reste à charge client
- Warning si seuils non atteints (ex. PAC ETAS insuffisant)

**Étape 5 — Documents** : upload multiple drag&drop
- Obligatoires : devis signé, mandat CEE signé (PDF pré-généré), avis d'imposition client, attestation RGE à date devis
- À fournir post-chantier : facture, photos avant/après (géoloc + EXIF), PV réception
- Virus scan côté storage (ClamAV lambda ou Supabase Storage policy)
- Hash SHA256 pour intégrité

**Étape 6 — Récap & soumission** : preview complet, CGU Energy acceptées, submit → status `submitted_by_artisan`

### 6.3 Détail dossier `/espace-artisan/cee/[reference]`

Timeline events (audit trail), status machine visuelle, docs par kind, QA feedback si rejet, CTA upload manquant, copie PDF mandat, contact ops chat intégré.

### 6.4 Mandat CEE auto-généré (PDF)

- Template conforme arrêté 2/11/2023 (6 mentions obligatoires)
- Champs dynamiques : raison sociale SA Energy SIREN {SA_ENERGY_SIREN}, PPEE n°{SA_ENERGY_PPEE_NUMBER}, bénéficiaire, opération, forfait snapshot
- Bordereau rétractation R.221-1 en page 2
- Signé côté client via DocuSign (ou scan+upload manuel en fallback pour artisans réfractaires)

---

## 7. PR4 — BACK-OFFICE OPS SA ENERGY `/admin/cee`

### 7.1 Queue QA `/admin/cee/queue`

Table filtrable des dossiers `qa_pending` :
- Colonnes : reference, artisan, client commune, opération, montant, prime, date soumission
- Tri par SLA (24h max)
- Bulk actions : approve, reject, assign reviewer
- Sampling auto : 3-5% des dossiers routés en QA approfondie (humain), le reste QA auto (règles)

### 7.2 Règles QA auto (fonction `lib/cee/qa-auto.ts`)

Score 0-100, seuil 80 = pass auto, sinon escalation humain.

Checks :
- RGE valide à date devis (query ADEME cache)
- Qualif cohérente avec operation_code
- Zone clim correcte vs CP
- Catégorie revenus cohérente avec RFR (si fourni)
- Montant HT/m² dans fourchette marché (flag si outlier ±30%)
- Photos : géoloc dans rayon CP +/- 10km, EXIF taken_at cohérent avec date chantier
- Docs obligatoires présents avec bonnes extensions
- Hash SHA256 unique (pas de doublon cross-dossier — détection fraude)
- OCR avis d'imposition matche RFR déclaré (Claude Vision async)

### 7.3 Review humain `/admin/cee/review/[id]`

Split view : pièces uploadées (iframe PDF/image) | checklist QA | formulaire décision (approve avec notes / reject avec motif + retour artisan via Brevo)

### 7.4 Soumission délégataire `/admin/cee/deposit/[id]`

- Génération bordereau délégataire (format selon partenaire : Sonergia API, Engie portal, TotalEnergies CSV…)
- Upload sur portail délégataire (semi-manuel phase 1, API phase 2)
- Mise à jour `delegataire_submission_at`, `delegataire_reference`
- Status → `deposited`

### 7.5 Suivi PNCEE

- Sync hebdo avec délégataire (API ou CSV export)
- Update `delegataire_response_status`, `pncee_reference`
- Si `validated` → trigger commission_due + email artisan
- Si `rejected_pncee` → capture motif + retour artisan + cancel commission

### 7.6 Dashboards ops

- Funnel : soumis → QA pass → déposé → validé → payé
- SLA QA (médiane, p90)
- Taux rejet par artisan / par opération / par délégataire
- Volume et CA par délégataire
- Top artisans performants (commissions versées)
- Alerte fraude (clusters d'anomalies)

---

## 8. PR5 — DÉTECTION CEE AUTO `/api/devis` (hérité V2)

Inchangé vs V2 §6. Utilité réduite car V3 artisan-first, mais utile pour :
- Sensibiliser les artisans non encore partenaires (bandeau "Ce devis serait éligible CEE, rejoignez notre programme")
- Alimenter la séquence Brevo d'invitation automatiquement sur devis détectés
- Backfill 100k devis historiques pour identifier les artisans à prioriser en activation

---

## 9. PR6 — FLAG MAR + SIMULATEUR LÉGER

### 9.1 Flag MAR providers

Inchangé vs V2 §7, avec **mode dégradé renforcé** : si fetch MAR échoue 3× → DLQ P1 + `is_mar_agree` INCHANGÉ, pas de révocation.

### 9.2 Simulateur public `/simulateur-aides-cee` (léger)

Version réduite vs V2 :
- **Objectif principal** : capture lead qualifié → **transmission à un artisan partenaire SA Energy** (pas juste dispatch marketplace)
- Garde reverse funnel (reveal avant coordonnées) pour SEO + ads long terme
- CTA final : "Un artisan partenaire vous rappelle sous 48h pour monter votre dossier"
- Matching : préférence artisans `cee_artisan_partners.status = 'active'` avec `operations_allowed` et `zones_allowed`
- Quand aucun partner dispo dans zone → fallback dispatch marketplace classique (provider RGE simple)

Routes et conversion cible réduites (cible 25-30% au lieu de 42% — c'est un bonus, pas le cœur).

---

## 10. PR7 — COMMISSIONS + PIPEDRIVE OPS + BREVO NURTURE

### 10.1 Calcul commission

Trigger sur `cee_dossiers.status = 'validated'` :
```sql
INSERT INTO cee_commissions (dossier_id, partner_id, amount_cts, status, scheduled_at)
VALUES (NEW.id, NEW.partner_id, NEW.commission_amount_cts, 'due', now() + interval '7 days');
```

### 10.2 Batch paiement hebdo (cron vendredi 10h)

Option A — **SEPA Credit Transfer** :
- Génération fichier XML pain.001.001.09 (norme SEPA SCT)
- Upload sur portail banque pro (ou API Qonto/Shine si compte pro fintech)
- Update batch_id sur commissions incluses
- Confirmation bancaire via webhook ou réconciliation CSV J+1

Option B — **Stripe Connect** (plus simple, coût ~0,25€/transfert) :
- `stripe.transfers.create` avec `destination = stripe_connect_account_id`
- Webhook `/api/webhooks/stripe` met à jour `confirmed_at`

Facture commission auto-générée (PDF stockage Supabase, numérotation continue, mentions TVA auto-liquidation si artisan non assujetti ou TVA FR standard).

### 10.3 Pipedrive pipeline ops

Pipeline "CEE - Dossiers" 8 stages :
1. Partner invited (10%)
2. Partner active (25%)
3. Dossier submitted (40%)
4. QA approved (55%)
5. Deposited délégataire (70%)
6. Validated PNCEE (85%)
7. Client paid (95%)
8. Commission paid (100%)

Deal créé à activation partner, stages auto-updated via trigger DB → outbox → Pipedrive.

### 10.4 Brevo nurture (3 séquences)

**Séquence partner** : J+0 bienvenue, J+1 formation rappel, J+3 guide premier dossier, J+7 relance si aucun dossier, J+14 tips, J+30 bilan mensuel.

**Séquence client (bénéficiaire)** : J+0 confirmation dossier monté, J+3 explication prime + délais, J+30 statut dépôt, J+60 validation PNCEE, J+90 prime versée (si applicable), J+120 avis public incité.

**Séquence artisan dossier en cours** : transactionnels sur status change (soumis, QA rejet avec action, validé, commission due, commission payée).

Unsubscribe L.34-5 obligatoire sauf transactionnels critiques.

---

## 11. RGPD RENFORCÉ (spécifique V3)

### 11.1 Base légale

- **Artisan partner** : exécution contractuelle (art. 6-1-b) via convention signée
- **Client bénéficiaire** : consentement (6-1-a) pour traitement + obligation légale (6-1-c) archivage 10 ans pièces CEE + exécution contractuelle (6-1-b) pour mandat CEE

### 11.2 Mandat CEE (arrêté 2/11/2023) — 6 mentions obligatoires

À coller dans le PDF mandat (template) :
1. Identité mandant (bénéficiaire) et mandataire (SA Energy SAS, n°PPEE)
2. Opérations couvertes par le mandat
3. Durée du mandat et conditions de résiliation
4. Modalités de rémunération du mandataire (% ou forfait, plafond)
5. Obligations du mandataire (montage, dépôt, reversement prime)
6. Obligations du mandant (fourniture pièces, signature AH)

+ **Bordereau rétractation R.221-1** (page 2, détachable, délai 14j)

### 11.3 Conservation

- Dossiers CEE : **10 ans** (art. 4 arrêté 4/9/2014 modifié 2/11/2023)
- Commissions : 10 ans (obligations comptables L.123-22 C. com.)
- Données activité artisan partner : durée contrat + 5 ans

### 11.4 AIPD obligatoire

Critères CNIL : scoring bénéficiaire + financier + grande échelle + croisement source (ADEME + RGE + RFR) + traitement pièces identité.

Template PIA v3 à compléter avant ouverture prod, stocké `docs/cee/AIPD_T-2026-002.pdf`.

---

## 12. ENV VARS ADDITIONNELLES V3

```bash
# SA Energy identité
SA_ENERGY_SIREN=
SA_ENERGY_PPEE_NUMBER=
SA_ENERGY_ADRESSE=
SA_ENERGY_REPRESENTANT=
SA_ENERGY_CAPITAL_CTS=

# DocuSign
DOCUSIGN_INTEGRATION_KEY=
DOCUSIGN_USER_ID=
DOCUSIGN_ACCOUNT_ID=
DOCUSIGN_BASE_URL=
DOCUSIGN_PRIVATE_KEY=   # RSA JWT
DOCUSIGN_WEBHOOK_SECRET=

# Stripe Connect (si retenu)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CONNECT_ACCOUNT_PREFIX=

# SEPA (si retenu)
SEPA_CREDITOR_ID=
SEPA_IBAN=
SEPA_BIC=
BANK_API_URL=           # Qonto/Shine si fintech
BANK_API_TOKEN=

# Claude Vision OCR
ANTHROPIC_API_KEY=
CLAUDE_VISION_MODEL=claude-opus-4-6

# Délégataires
SONERGIA_API_KEY=
SONERGIA_API_URL=
ENGIE_PORTAL_USER=
ENGIE_PORTAL_PASS=

# Storage
SUPABASE_STORAGE_BUCKET_DOSSIERS=cee-dossiers
VIRUS_SCAN_WEBHOOK=     # ClamAV lambda
```

---

## 13. CHECKLIST GO-PROD V3 (35 items)

### Sécurité + conformité
- [ ] Migrations 420-428 appliquées + smoke tests ✓ × 35
- [ ] RLS `cee_dossiers` : artisan ne voit que ses dossiers (test 4 cas)
- [ ] RLS `cee_dossier_documents` : idem
- [ ] IBAN chiffré pgcrypto, `iban_last4` seule colonne clear
- [ ] Convention DocuSign : HMAC webhook vérifié, PDF signé archivé 10 ans
- [ ] Mandat CEE PDF : 6 mentions + R.221-1 présents
- [ ] Photos : géoloc obligatoire 1/1/2026, EXIF conservé
- [ ] Virus scan toutes pièces avant soumission délégataire
- [ ] AIPD T-2026-002 documentée et signée DPO
- [ ] Registre traitements à jour (entrée T-2026-002)

### Métier
- [ ] Formation quiz 10 questions, seuil 8/10, blocage si non certif
- [ ] QA auto score ≥ 80 = pass, sinon humain
- [ ] Sampling 3-5% QA humain même sur score élevé (audit)
- [ ] Status machine strict (triggers bloquent transitions illégales)
- [ ] Audit trail exhaustif (cee_dossier_events sur tout)
- [ ] Seeds référentiels 2026 officiels sourcés (§5 V2)
- [ ] Zones clim code INSEE commune (tests Paris H1, Marseille H3, Avignon H3)

### Activation
- [ ] MV TAM rafraîchie, email batch Brevo testé sandbox 10 envois
- [ ] Landing /devenir-partenaire-cee noindex, testée mobile
- [ ] Onboarding 5 étapes complète sans bug (Playwright e2e)
- [ ] Convention DocuSign : test round-trip (envoi → signature → webhook → PDF archivé)

### Ops
- [ ] Dashboard `/admin/cee/queue` SLA 24h affiché
- [ ] Queue QA priorisée (FIFO + outliers montant)
- [ ] Soumission délégataire : 3 formats bordereau OK (Sonergia/Engie/TotalEnergies)
- [ ] Sync PNCEE hebdo automatisée
- [ ] Alertes Grafana → Slack #cee-ops : QA SLA dépassé, taux rejet >10%, fraude cluster

### Paiement
- [ ] Commission calculée auto sur `validated`, pas avant
- [ ] Batch SEPA XML pain.001 conforme (test banque sandbox)
- [ ] Facture commission PDF avec numérotation continue
- [ ] Retry commissions échouées 3× puis DLQ + alerte

### Hostile
- [ ] Rate-limit `/api/cee/dossiers` (abus artisan)
- [ ] Rate-limit upload documents (50 MB/dossier, 10 docs max)
- [ ] Dédoublonnage SHA256 documents cross-dossier (détection fraude)
- [ ] Load test k6 500 rps sur wizard, pas de dégradation

---

## 14. HORS SCOPE V3

- Constitution juridique SA Energy SAS (avocat énergie)
- Agrément MAR ANAH (dossier 12 mois)
- Intégration API complète délégataires (phase 2, semi-manuel au début)
- App mobile artisan (phase 2, mobile-web responsive suffit V3)
- Variant B2B copropriétés (phase 3)
- Acquisition artisans via scraping externe (phase 2, on active la base existante d'abord)
- Extension mandataire direct obligés (phase 3, on reste sous délégataire)

---

## 15. NIVEAU D'EXIGENCE

### Priorités de rigueur

1. **RGPD client** (mandat CEE + conservation 10 ans + chiffrement PII) = bloquant
2. **Responsabilité solidaire PNCEE** (CA Paris 2024 + Cass. crim. 2024) → QA interne 3-5% obligatoire
3. **Paiement commission** = contrat avec l'artisan, retard = rupture de confiance, zéro tolérance
4. **Formation artisan** = assurance qualité dossiers, zéro shortcut

### Hostile par défaut

- Assume artisan malveillant (faux SIRET, faux RGE, photo volée d'internet)
- Assume client fraudeur (faux RFR, résidence fictive)
- Assume DocuSign down (retry queue, fallback scan+upload)
- Assume délégataire portail casse (mode dégradé CSV)
- Assume SEPA refusé (batch retry + alerte)

### Si un point est ambigu → STOP, pose la question

Les dettes Pipedrive v1 + reviews drift ont coûté 4-6 PR de correction. On ne recommence pas.

### Ordre de rigueur pour ce dev

1. Sécurité DB (RLS, chiffrement PII)
2. Status machine + audit trail
3. Conformité RGPD
4. UX artisan (friction minimale)
5. Performance (vient après tout le reste)

---

**Fin prompt V3. ~5 000 mots. 7 PR. 3 tables coeur : `cee_artisan_partners`, `cee_dossiers`, `cee_commissions`.**
