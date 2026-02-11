-- =============================================================================
-- Migration 110 : Schéma 10/10 — ServicesArtisans
-- 2026-02-09
-- =============================================================================
-- Crée le schéma `app` avec :
--   - profiles, artisans, services, cities
--   - artisan_services (N:N + rayon), artisan_zones
--   - leads + lead_assignments (quota-safe)
--   - reviews, notifications, contact_suppressions
--   - artisan_merges, artisan_monthly_usage
--   - outreach_messages & events (partitionnés par mois)
--   - algorithm_config (dashboard réglages)
--   - public_artisans (vue sans PII)
--   - Fonctions, triggers, RLS, indexes
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Schéma dédié
CREATE SCHEMA IF NOT EXISTS app;

-- ============================================================================
-- 1. PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS app.profiles (
  id            uuid PRIMARY KEY,              -- = auth.users.id
  role          text NOT NULL DEFAULT 'artisan'
                CHECK (role IN ('admin','artisan','support','client')),
  email         citext,
  phone_e164    text,
  full_name     text,
  avatar_url    text,
  onboarding_completed_at timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_uniq
  ON app.profiles(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_uniq
  ON app.profiles(phone_e164) WHERE phone_e164 IS NOT NULL;

-- ============================================================================
-- 2. CITIES (~36K communes FR)
-- ============================================================================
CREATE TABLE IF NOT EXISTS app.cities (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  slug          text NOT NULL UNIQUE,
  postal_code   text NOT NULL,
  department    text NOT NULL,
  region        text,
  latitude      double precision,
  longitude     double precision,
  geo           geography(Point, 4326),
  population    integer,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cities_dept_idx ON app.cities(department);
CREATE INDEX IF NOT EXISTS cities_geo_gist ON app.cities USING gist(geo);
CREATE INDEX IF NOT EXISTS cities_name_idx ON app.cities(name);

-- ============================================================================
-- 3. SERVICES (13+ métiers)
-- ============================================================================
CREATE TABLE IF NOT EXISTS app.services (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  code_naf    text,
  category    text,
  icon        text,
  description text,
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  integer DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 4. ARTISANS (table maître, PII protégé)
-- ============================================================================
CREATE TABLE IF NOT EXISTS app.artisans (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dédup
  stable_id       text NOT NULL UNIQUE,
  company_name    text NOT NULL,
  slug            text NOT NULL UNIQUE,
  siren           text,
  siret           text,

  -- PII (JAMAIS exposé via vue publique)
  phone_raw       text,
  phone_e164      text,
  email_raw       text,
  email_canonical citext,
  website         text,
  contact_name    text,

  -- Localisation
  city_id         uuid REFERENCES app.cities(id),
  address         text,
  postal_code     text,
  department      text,
  region          text,
  latitude        double precision,
  longitude       double precision,
  geo             geography(Point, 4326),

  -- Réputation
  google_rating       numeric(2,1),
  google_reviews_count int NOT NULL DEFAULT 0,
  internal_rating     numeric(2,1),
  internal_reviews_count int NOT NULL DEFAULT 0,
  trust_score         numeric(5,2) DEFAULT 0,

  -- Source & enrichissement
  source          text,
  source_id       text,
  code_naf        text,
  libelle_naf     text,
  capital         numeric,
  employee_count  text,
  legal_form_code text,
  scraped_at      timestamptz,
  enriched_at     timestamptz,

  -- Claim & vérification
  claimed_at      timestamptz,
  claimed_by      uuid REFERENCES app.profiles(id),
  verified_at     timestamptz,
  verification_method text
                  CHECK (verification_method IN ('sms','email','document','call','kbis')),

  -- Lifecycle
  deleted_at      timestamptz,
  merged_into_id  uuid REFERENCES app.artisans(id),
  deletion_reason text,

  is_active       boolean NOT NULL DEFAULT true,
  data_quality_score int DEFAULT 0
                  CHECK (data_quality_score BETWEEN 0 AND 100),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  -- Contraintes
  CONSTRAINT siren_format CHECK (siren IS NULL OR siren = '' OR siren ~ '^\d{9}$'),
  CONSTRAINT siret_format CHECK (siret IS NULL OR siret = '' OR siret ~ '^\d{14}$'),
  CONSTRAINT siret_starts_with_siren CHECK (
    siren IS NULL OR siret IS NULL OR siren = '' OR siret = ''
    OR left(siret, 9) = siren
  ),
  CONSTRAINT rating_range CHECK (google_rating IS NULL OR google_rating BETWEEN 0 AND 5),
  CONSTRAINT no_self_merge CHECK (merged_into_id != id)
);

-- Index critiques
CREATE INDEX IF NOT EXISTS artisans_geo_gist
  ON app.artisans USING gist(geo) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS artisans_city_idx
  ON app.artisans(city_id) WHERE is_active AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS artisans_dept_idx
  ON app.artisans(department) WHERE is_active AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS artisans_claimed_idx
  ON app.artisans(claimed_by) WHERE claimed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS artisans_quality_idx
  ON app.artisans(data_quality_score) WHERE is_active;
CREATE INDEX IF NOT EXISTS artisans_slug_idx
  ON app.artisans(slug);
CREATE INDEX IF NOT EXISTS artisans_code_naf_idx
  ON app.artisans(code_naf) WHERE code_naf IS NOT NULL;
CREATE INDEX IF NOT EXISTS artisans_trust_score_idx
  ON app.artisans(trust_score DESC) WHERE is_active AND deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS artisans_siren_uniq
  ON app.artisans(siren) WHERE siren IS NOT NULL AND siren != '';
CREATE UNIQUE INDEX IF NOT EXISTS artisans_phone_uniq
  ON app.artisans(phone_e164) WHERE phone_e164 IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS artisans_email_uniq
  ON app.artisans(email_canonical) WHERE email_canonical IS NOT NULL;

-- ============================================================================
-- 5. ARTISAN_SERVICES (N:N avec rayon d'intervention)
-- ============================================================================
CREATE TABLE IF NOT EXISTS app.artisan_services (
  artisan_id  uuid NOT NULL REFERENCES app.artisans(id) ON DELETE CASCADE,
  service_id  uuid NOT NULL REFERENCES app.services(id) ON DELETE CASCADE,
  radius_km   int NOT NULL DEFAULT 30 CHECK (radius_km BETWEEN 1 AND 200),
  is_primary  boolean NOT NULL DEFAULT false,
  price_min   numeric(10,2),
  price_max   numeric(10,2),
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (artisan_id, service_id)
);

CREATE INDEX IF NOT EXISTS artisan_services_service_idx
  ON app.artisan_services(service_id);

-- ============================================================================
-- 6. ARTISAN_ZONES (départements/villes desservis)
-- ============================================================================
CREATE TABLE IF NOT EXISTS app.artisan_zones (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id  uuid NOT NULL REFERENCES app.artisans(id) ON DELETE CASCADE,
  zone_type   text NOT NULL CHECK (zone_type IN ('department','city','region')),
  zone_code   text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (artisan_id, zone_type, zone_code)
);

CREATE INDEX IF NOT EXISTS artisan_zones_artisan_idx
  ON app.artisan_zones(artisan_id);
CREATE INDEX IF NOT EXISTS artisan_zones_zone_idx
  ON app.artisan_zones(zone_type, zone_code);

-- ============================================================================
-- 7. PLANS (offres commerciales)
-- ============================================================================
CREATE TABLE IF NOT EXISTS app.plans (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  slug          text NOT NULL UNIQUE,
  price_monthly numeric(10,2) NOT NULL DEFAULT 0,
  price_yearly  numeric(10,2),
  lead_quota    int NOT NULL DEFAULT 10,
  features      jsonb DEFAULT '[]'::jsonb,
  is_active     boolean NOT NULL DEFAULT true,
  sort_order    int DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 8. SUBSCRIPTIONS (abonnements Stripe)
-- ============================================================================
CREATE TABLE IF NOT EXISTS app.subscriptions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id      uuid NOT NULL REFERENCES app.artisans(id) ON DELETE CASCADE,
  plan_id         uuid NOT NULL REFERENCES app.plans(id),
  stripe_sub_id   text UNIQUE,
  stripe_customer text,
  status          text NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','past_due','canceled','trialing','paused')),
  current_period_start timestamptz,
  current_period_end   timestamptz,
  canceled_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscriptions_artisan_idx
  ON app.subscriptions(artisan_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx
  ON app.subscriptions(status) WHERE status = 'active';

-- ============================================================================
-- 9. LEADS (demandes clients)
-- ============================================================================
CREATE TABLE IF NOT EXISTS app.leads (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id    uuid REFERENCES app.services(id),
  city_id       uuid REFERENCES app.cities(id),
  service_name  text,
  description   text,
  urgency       text DEFAULT 'medium'
                CHECK (urgency IN ('low','medium','high','emergency')),

  -- Client (PII, jamais exposé à anon)
  client_name       text NOT NULL,
  client_phone      text NOT NULL,
  client_email      text,
  client_phone_e164 text,

  -- Géo du chantier
  postal_code   text,
  city          text,
  department    text,
  latitude      double precision,
  longitude     double precision,
  geo           geography(Point, 4326),

  budget        text,
  source        text NOT NULL DEFAULT 'website',
  status        text NOT NULL DEFAULT 'new'
                CHECK (status IN ('new','distributed','fulfilled','expired','canceled')),
  distributed_at timestamptz,
  expires_at    timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_status_idx
  ON app.leads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS leads_service_idx
  ON app.leads(service_id) WHERE service_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS leads_geo_gist
  ON app.leads USING gist(geo) WHERE geo IS NOT NULL;
CREATE INDEX IF NOT EXISTS leads_created_idx
  ON app.leads(created_at DESC);

-- ============================================================================
-- 10. LEAD_ASSIGNMENTS (distribution quota-safe)
-- ============================================================================
CREATE TABLE IF NOT EXISTS app.lead_assignments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id       uuid NOT NULL REFERENCES app.leads(id) ON DELETE CASCADE,
  artisan_id    uuid NOT NULL REFERENCES app.artisans(id) ON DELETE CASCADE,

  score         numeric(7,2),
  distance_km   numeric(7,2),
  position      int,

  status        text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','viewed','accepted','declined','expired','won','lost')),

  -- Quota tracking
  reserved_at   timestamptz,
  consumed_at   timestamptz,
  released_at   timestamptz,

  -- Timestamps
  assigned_at   timestamptz NOT NULL DEFAULT now(),
  viewed_at     timestamptz,
  responded_at  timestamptz,

  UNIQUE (lead_id, artisan_id)
);

CREATE INDEX IF NOT EXISTS lead_assignments_artisan_idx
  ON app.lead_assignments(artisan_id, assigned_at DESC);
CREATE INDEX IF NOT EXISTS lead_assignments_lead_idx
  ON app.lead_assignments(lead_id);
CREATE INDEX IF NOT EXISTS lead_assignments_status_idx
  ON app.lead_assignments(status);

-- ============================================================================
-- 11. ARTISAN_MONTHLY_USAGE (compteurs quota avec row lock)
-- ============================================================================
CREATE TABLE IF NOT EXISTS app.artisan_monthly_usage (
  artisan_id    uuid NOT NULL REFERENCES app.artisans(id) ON DELETE CASCADE,
  month         date NOT NULL,             -- premier jour du mois
  leads_reserved int NOT NULL DEFAULT 0,
  leads_consumed int NOT NULL DEFAULT 0,
  leads_released int NOT NULL DEFAULT 0,
  updated_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (artisan_id, month)
);

-- ============================================================================
-- 12. REVIEWS (avis vérifiés)
-- ============================================================================
CREATE TABLE IF NOT EXISTS app.reviews (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id    uuid NOT NULL REFERENCES app.artisans(id) ON DELETE CASCADE,
  lead_id       uuid REFERENCES app.leads(id),
  author_name   text NOT NULL,
  author_email  text,
  rating        int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title         text,
  content       text,
  response      text,
  responded_at  timestamptz,
  is_verified   boolean NOT NULL DEFAULT false,
  status        text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','published','rejected','flagged')),
  photos        jsonb DEFAULT '[]'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reviews_artisan_idx
  ON app.reviews(artisan_id, created_at DESC);
CREATE INDEX IF NOT EXISTS reviews_status_idx
  ON app.reviews(status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS reviews_lead_idx
  ON app.reviews(lead_id) WHERE lead_id IS NOT NULL;

-- ============================================================================
-- 13. NOTIFICATIONS (in-app)
-- ============================================================================
CREATE TABLE IF NOT EXISTS app.notifications (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id  uuid NOT NULL REFERENCES app.profiles(id) ON DELETE CASCADE,
  type          text NOT NULL,
  title         text NOT NULL,
  body          text,
  data          jsonb DEFAULT '{}'::jsonb,
  read_at       timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notif_recipient_unread
  ON app.notifications(recipient_id, created_at DESC)
  WHERE read_at IS NULL;

-- ============================================================================
-- 14. CONTACT_SUPPRESSIONS (opt-out RGPD par canal)
-- ============================================================================
CREATE TABLE IF NOT EXISTS app.contact_suppressions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id    uuid NOT NULL REFERENCES app.artisans(id) ON DELETE CASCADE,
  channel       text NOT NULL CHECK (channel IN ('email','sms','whatsapp','phone')),
  reason        text,
  suppressed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (artisan_id, channel)
);

-- ============================================================================
-- 15. ARTISAN_MERGES (chaîne de fusion pour dédup)
-- ============================================================================
CREATE TABLE IF NOT EXISTS app.artisan_merges (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  old_id        uuid NOT NULL REFERENCES app.artisans(id),
  new_id        uuid NOT NULL REFERENCES app.artisans(id),
  merged_by     uuid REFERENCES app.profiles(id),
  reason        text,
  merged_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT no_self_merge CHECK (old_id != new_id)
);

CREATE INDEX IF NOT EXISTS artisan_merges_old_idx
  ON app.artisan_merges(old_id);

-- ============================================================================
-- 16. OUTREACH_MESSAGES (partitionné par mois)
-- ============================================================================
CREATE TABLE IF NOT EXISTS app.outreach_messages (
  id            uuid NOT NULL DEFAULT gen_random_uuid(),
  artisan_id    uuid NOT NULL,
  channel       text NOT NULL CHECK (channel IN ('email','sms','whatsapp')),
  template      text,
  status        text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','sent','delivered','failed','bounced','opened','clicked')),
  sent_at       timestamptz,
  delivered_at  timestamptz,
  opened_at     timestamptz,
  error         text,
  metadata      jsonb DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

-- Partitions pour les 6 prochains mois
CREATE TABLE IF NOT EXISTS app.outreach_messages_2026_02
  PARTITION OF app.outreach_messages
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE TABLE IF NOT EXISTS app.outreach_messages_2026_03
  PARTITION OF app.outreach_messages
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

CREATE TABLE IF NOT EXISTS app.outreach_messages_2026_04
  PARTITION OF app.outreach_messages
  FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

CREATE TABLE IF NOT EXISTS app.outreach_messages_2026_05
  PARTITION OF app.outreach_messages
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

CREATE TABLE IF NOT EXISTS app.outreach_messages_2026_06
  PARTITION OF app.outreach_messages
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

CREATE TABLE IF NOT EXISTS app.outreach_messages_2026_07
  PARTITION OF app.outreach_messages
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

-- ============================================================================
-- 17. EVENTS (audit trail, partitionné par mois)
-- ============================================================================
CREATE TABLE IF NOT EXISTS app.events (
  id            uuid NOT NULL DEFAULT gen_random_uuid(),
  actor_id      uuid,
  entity_type   text NOT NULL,
  entity_id     uuid,
  event_type    text NOT NULL,
  metadata      jsonb DEFAULT '{}'::jsonb,
  ip_address    inet,
  created_at    timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

CREATE TABLE IF NOT EXISTS app.events_2026_02
  PARTITION OF app.events
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE TABLE IF NOT EXISTS app.events_2026_03
  PARTITION OF app.events
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

CREATE TABLE IF NOT EXISTS app.events_2026_04
  PARTITION OF app.events
  FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

CREATE TABLE IF NOT EXISTS app.events_2026_05
  PARTITION OF app.events
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

CREATE TABLE IF NOT EXISTS app.events_2026_06
  PARTITION OF app.events
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

CREATE TABLE IF NOT EXISTS app.events_2026_07
  PARTITION OF app.events
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

-- ============================================================================
-- 18. ALGORITHM_CONFIG (dashboard réglages algorithmiques)
-- ============================================================================
CREATE TABLE IF NOT EXISTS app.algorithm_config (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- === Distribution ===
  matching_strategy     text NOT NULL DEFAULT 'scored'
                        CHECK (matching_strategy IN ('round_robin','scored','geographic')),
  max_artisans_per_lead int NOT NULL DEFAULT 3
                        CHECK (max_artisans_per_lead BETWEEN 1 AND 20),
  geo_radius_km         int NOT NULL DEFAULT 50
                        CHECK (geo_radius_km BETWEEN 1 AND 500),
  require_same_department boolean NOT NULL DEFAULT false,
  require_specialty_match boolean NOT NULL DEFAULT true,
  specialty_match_mode  text NOT NULL DEFAULT 'category'
                        CHECK (specialty_match_mode IN ('exact','fuzzy','category')),

  -- === Scoring (poids 0-100, total arbitraire) ===
  weight_rating         int NOT NULL DEFAULT 30
                        CHECK (weight_rating BETWEEN 0 AND 100),
  weight_reviews        int NOT NULL DEFAULT 15
                        CHECK (weight_reviews BETWEEN 0 AND 100),
  weight_verified       int NOT NULL DEFAULT 20
                        CHECK (weight_verified BETWEEN 0 AND 100),
  weight_proximity      int NOT NULL DEFAULT 25
                        CHECK (weight_proximity BETWEEN 0 AND 100),
  weight_response_rate  int NOT NULL DEFAULT 10
                        CHECK (weight_response_rate BETWEEN 0 AND 100),

  -- === Quotas ===
  daily_lead_quota      int NOT NULL DEFAULT 0
                        CHECK (daily_lead_quota >= 0),
  monthly_lead_quota    int NOT NULL DEFAULT 0
                        CHECK (monthly_lead_quota >= 0),
  cooldown_minutes      int NOT NULL DEFAULT 30
                        CHECK (cooldown_minutes >= 0),

  -- === Expiration ===
  lead_expiry_hours     int NOT NULL DEFAULT 48
                        CHECK (lead_expiry_hours > 0),
  quote_expiry_hours    int NOT NULL DEFAULT 72
                        CHECK (quote_expiry_hours > 0),
  auto_reassign_hours   int NOT NULL DEFAULT 24
                        CHECK (auto_reassign_hours > 0),

  -- === Filtres ===
  min_rating            numeric(2,1) NOT NULL DEFAULT 0
                        CHECK (min_rating BETWEEN 0 AND 5),
  require_verified_urgent boolean NOT NULL DEFAULT false,
  exclude_inactive_days int NOT NULL DEFAULT 90
                        CHECK (exclude_inactive_days >= 0),
  prefer_claimed        boolean NOT NULL DEFAULT true,

  -- === Urgence multipliers ===
  urgency_low_multiplier    numeric(3,2) NOT NULL DEFAULT 1.00,
  urgency_medium_multiplier numeric(3,2) NOT NULL DEFAULT 1.00,
  urgency_high_multiplier   numeric(3,2) NOT NULL DEFAULT 1.50,
  urgency_emergency_multiplier numeric(3,2) NOT NULL DEFAULT 2.00,

  -- Metadata
  updated_by    uuid REFERENCES app.profiles(id),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Insérer la config par défaut (une seule ligne)
INSERT INTO app.algorithm_config (id)
VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 19. VUE PUBLIQUE (zéro PII)
-- ============================================================================
CREATE OR REPLACE VIEW app.public_artisans AS
SELECT
  a.id, a.stable_id, a.company_name, a.slug,
  a.city_id, a.department, a.region,
  a.postal_code,
  a.latitude, a.longitude,
  a.google_rating, a.google_reviews_count,
  a.internal_rating, a.internal_reviews_count,
  a.trust_score, a.code_naf, a.libelle_naf,
  (a.claimed_at IS NOT NULL) AS is_claimed,
  (a.verified_at IS NOT NULL) AS is_verified,
  a.is_active, a.created_at, a.updated_at
FROM app.artisans a
WHERE a.deleted_at IS NULL
  AND a.merged_into_id IS NULL
  AND a.is_active = true;

COMMENT ON VIEW app.public_artisans IS 'Vue publique des artisans sans PII (phone, email, etc.)';

-- ============================================================================
-- 20. FONCTIONS UTILITAIRES
-- ============================================================================

-- Canonical email
CREATE OR REPLACE FUNCTION app.canonical_email(raw text)
RETURNS citext AS $$
  SELECT lower(trim(raw))::citext
$$ LANGUAGE sql IMMUTABLE;

-- Canonical phone (FR: 06→+336)
CREATE OR REPLACE FUNCTION app.canonical_phone_e164(raw text)
RETURNS text AS $$
DECLARE
  cleaned text;
BEGIN
  IF raw IS NULL OR trim(raw) = '' THEN RETURN NULL; END IF;
  cleaned := regexp_replace(trim(raw), '[^0-9+]', '', 'g');
  IF cleaned LIKE '0%' AND length(cleaned) = 10 THEN
    RETURN '+33' || substring(cleaned FROM 2);
  ELSIF cleaned LIKE '+33%' THEN
    RETURN cleaned;
  ELSIF cleaned LIKE '33%' AND length(cleaned) = 11 THEN
    RETURN '+' || cleaned;
  END IF;
  RETURN cleaned;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trust score composite
CREATE OR REPLACE FUNCTION app.compute_trust_score(p_artisan_id uuid)
RETURNS numeric AS $$
  SELECT
    coalesce(a.google_rating * 10, 0)                          -- max 50
    + CASE WHEN a.verified_at IS NOT NULL THEN 20 ELSE 0 END  -- max 20
    + least(a.internal_reviews_count * 2, 20)                  -- max 20
    + least(extract(year FROM age(a.created_at))::int * 2, 10) -- max 10
  FROM app.artisans a WHERE a.id = p_artisan_id
$$ LANGUAGE sql STABLE;

-- Résolution de merge (anti-cycle)
CREATE OR REPLACE FUNCTION app.resolve_artisan_id(p_id uuid, p_max_depth int DEFAULT 10)
RETURNS uuid AS $$
DECLARE
  v uuid := p_id;
  nxt uuid;
  i int := 0;
BEGIN
  LOOP
    SELECT new_id INTO nxt FROM app.artisan_merges WHERE old_id = v;
    EXIT WHEN nxt IS NULL OR i >= p_max_depth;
    v := nxt;
    i := i + 1;
  END LOOP;
  RETURN v;
END;
$$ LANGUAGE plpgsql STABLE;

-- Reserve quota
CREATE OR REPLACE FUNCTION app.reserve_quota(p_artisan_id uuid, p_now timestamptz DEFAULT now())
RETURNS boolean AS $$
DECLARE
  v_month date;
  v_plan_quota int;
  v_used int;
BEGIN
  v_month := date_trunc('month', p_now)::date;

  -- Chercher le quota du plan de l'artisan
  SELECT COALESCE(pl.lead_quota, 999999) INTO v_plan_quota
  FROM app.subscriptions s
  JOIN app.plans pl ON pl.id = s.plan_id
  WHERE s.artisan_id = p_artisan_id AND s.status = 'active'
  LIMIT 1;

  IF v_plan_quota IS NULL THEN
    v_plan_quota := 999999; -- pas d'abonnement = illimité
  END IF;

  -- Upsert usage row avec lock
  INSERT INTO app.artisan_monthly_usage (artisan_id, month, leads_reserved)
  VALUES (p_artisan_id, v_month, 1)
  ON CONFLICT (artisan_id, month) DO UPDATE
  SET leads_reserved = app.artisan_monthly_usage.leads_reserved + 1,
      updated_at = now();

  -- Vérifier quota
  SELECT leads_reserved INTO v_used
  FROM app.artisan_monthly_usage
  WHERE artisan_id = p_artisan_id AND month = v_month
  FOR UPDATE;

  IF v_used > v_plan_quota THEN
    -- Rollback la réservation
    UPDATE app.artisan_monthly_usage
    SET leads_reserved = leads_reserved - 1
    WHERE artisan_id = p_artisan_id AND month = v_month;
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Consume quota (quand l'artisan voit le lead)
CREATE OR REPLACE FUNCTION app.consume_quota(p_artisan_id uuid, p_now timestamptz DEFAULT now())
RETURNS void AS $$
  UPDATE app.artisan_monthly_usage
  SET leads_consumed = leads_consumed + 1, updated_at = now()
  WHERE artisan_id = p_artisan_id
    AND month = date_trunc('month', p_now)::date
$$ LANGUAGE sql;

-- Release quota (quand l'artisan décline)
CREATE OR REPLACE FUNCTION app.release_quota(p_artisan_id uuid, p_now timestamptz DEFAULT now())
RETURNS void AS $$
  UPDATE app.artisan_monthly_usage
  SET leads_released = leads_released + 1,
      leads_reserved = GREATEST(leads_reserved - 1, 0),
      updated_at = now()
  WHERE artisan_id = p_artisan_id
    AND month = date_trunc('month', p_now)::date
$$ LANGUAGE sql;

-- ============================================================================
-- 21. DISTRIBUTE_LEAD (version configurable via algorithm_config)
-- ============================================================================
CREATE OR REPLACE FUNCTION app.distribute_lead(p_lead_id uuid)
RETURNS void AS $$
DECLARE
  v_lead    record;
  v_config  record;
  v_lock    bigint;
  v_count   int := 0;
  v_artisan record;
BEGIN
  -- Charger le lead
  SELECT * INTO STRICT v_lead FROM app.leads WHERE id = p_lead_id;

  -- Charger la config algorithmique
  SELECT * INTO v_config FROM app.algorithm_config LIMIT 1;

  -- Lock idempotent par lead (advisory lock)
  v_lock := ('x' || left(replace(p_lead_id::text, '-', ''), 16))::bit(64)::bigint;
  PERFORM pg_advisory_xact_lock(v_lock);

  -- Déjà distribué ? → skip
  IF EXISTS (SELECT 1 FROM app.lead_assignments WHERE lead_id = p_lead_id) THEN
    RETURN;
  END IF;

  -- Sélection des candidats selon la stratégie
  FOR v_artisan IN
    SELECT
      a.id AS artisan_id,
      CASE WHEN a.geo IS NOT NULL AND v_lead.geo IS NOT NULL
        THEN ST_Distance(a.geo, v_lead.geo) / 1000.0
        ELSE NULL
      END AS distance_km,
      a.trust_score,
      -- Score composite configurable
      CASE v_config.matching_strategy
        WHEN 'round_robin' THEN 0  -- pas de scoring, ordre par dernière assignation
        WHEN 'geographic' THEN
          CASE WHEN a.geo IS NOT NULL AND v_lead.geo IS NOT NULL
            THEN 1000.0 - (ST_Distance(a.geo, v_lead.geo) / 1000.0)
            ELSE 0
          END
        ELSE -- 'scored'
          (COALESCE(a.google_rating, 0) / 5.0 * v_config.weight_rating)
          + (LEAST(a.google_reviews_count, 100) / 100.0 * v_config.weight_reviews)
          + (CASE WHEN a.verified_at IS NOT NULL THEN v_config.weight_verified ELSE 0 END)
          + (CASE WHEN a.geo IS NOT NULL AND v_lead.geo IS NOT NULL
              THEN (1.0 - LEAST(ST_Distance(a.geo, v_lead.geo) / 1000.0 / v_config.geo_radius_km, 1.0)) * v_config.weight_proximity
              ELSE 0
            END)
      END AS computed_score
    FROM app.artisans a
    LEFT JOIN app.artisan_services asv
      ON asv.artisan_id = a.id AND asv.service_id = v_lead.service_id
    WHERE a.deleted_at IS NULL
      AND a.is_active = true
      -- Filtre géo
      AND (NOT v_config.require_same_department
           OR a.department = v_lead.department)
      AND (a.geo IS NULL OR v_lead.geo IS NULL
           OR ST_DWithin(a.geo, v_lead.geo,
              COALESCE(asv.radius_km, v_config.geo_radius_km) * 1000))
      -- Filtre spécialité
      AND (NOT v_config.require_specialty_match
           OR asv.service_id IS NOT NULL
           OR (v_lead.service_name IS NOT NULL
               AND a.libelle_naf ILIKE '%' || v_lead.service_name || '%'))
      -- Filtre rating minimum
      AND (v_config.min_rating = 0
           OR COALESCE(a.google_rating, 0) >= v_config.min_rating)
      -- Filtre vérifié pour urgent
      AND (NOT v_config.require_verified_urgent
           OR v_lead.urgency NOT IN ('high','emergency')
           OR a.verified_at IS NOT NULL)
      -- Préférer claimed
      AND (NOT v_config.prefer_claimed OR a.claimed_at IS NOT NULL
           -- Si pas assez de claimed, on prend les non-claimed aussi
           OR NOT EXISTS (
             SELECT 1 FROM app.artisans a2
             WHERE a2.claimed_at IS NOT NULL AND a2.is_active AND a2.deleted_at IS NULL
             LIMIT 1
           ))
    ORDER BY
      CASE v_config.matching_strategy
        WHEN 'round_robin' THEN 0
        ELSE 1
      END,
      computed_score DESC,
      random()  -- départage aléatoire
    LIMIT v_config.max_artisans_per_lead * 2  -- sur-sélection pour quotas épuisés
  LOOP
    -- Vérifier quota
    IF app.reserve_quota(v_artisan.artisan_id) THEN
      v_count := v_count + 1;

      INSERT INTO app.lead_assignments (
        lead_id, artisan_id, score, distance_km, position, reserved_at
      ) VALUES (
        p_lead_id, v_artisan.artisan_id, v_artisan.computed_score,
        v_artisan.distance_km, v_count, now()
      );

      EXIT WHEN v_count >= v_config.max_artisans_per_lead;
    END IF;
  END LOOP;

  -- Marquer le lead comme distribué
  IF v_count > 0 THEN
    UPDATE app.leads SET status = 'distributed', distributed_at = now()
    WHERE id = p_lead_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION app.distribute_lead IS
  'Distribue un lead aux artisans selon la stratégie configurée dans algorithm_config';

-- ============================================================================
-- 22. TRIGGERS
-- ============================================================================

-- Auto updated_at
CREATE OR REPLACE FUNCTION app.trigger_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  -- profiles
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_profiles_updated_at') THEN
    CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON app.profiles
    FOR EACH ROW EXECUTE FUNCTION app.trigger_updated_at();
  END IF;
  -- artisans
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_artisans_updated_at') THEN
    CREATE TRIGGER trg_artisans_updated_at BEFORE UPDATE ON app.artisans
    FOR EACH ROW EXECUTE FUNCTION app.trigger_updated_at();
  END IF;
  -- subscriptions
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_subscriptions_updated_at') THEN
    CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON app.subscriptions
    FOR EACH ROW EXECUTE FUNCTION app.trigger_updated_at();
  END IF;
  -- algorithm_config
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_algorithm_config_updated_at') THEN
    CREATE TRIGGER trg_algorithm_config_updated_at BEFORE UPDATE ON app.algorithm_config
    FOR EACH ROW EXECUTE FUNCTION app.trigger_updated_at();
  END IF;
END $$;

-- Canonise phone + email sur artisans
CREATE OR REPLACE FUNCTION app.trigger_artisan_canonicalize()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.phone_raw IS DISTINCT FROM OLD.phone_raw OR TG_OP = 'INSERT' THEN
    NEW.phone_e164 := app.canonical_phone_e164(NEW.phone_raw);
  END IF;
  IF NEW.email_raw IS DISTINCT FROM OLD.email_raw OR TG_OP = 'INSERT' THEN
    NEW.email_canonical := app.canonical_email(NEW.email_raw);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_artisan_canonicalize') THEN
    CREATE TRIGGER trg_artisan_canonicalize BEFORE INSERT OR UPDATE ON app.artisans
    FOR EACH ROW EXECUTE FUNCTION app.trigger_artisan_canonicalize();
  END IF;
END $$;

-- Géo auto depuis lat/lng sur artisans
CREATE OR REPLACE FUNCTION app.trigger_artisan_geo()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL)
     AND (NEW.latitude IS DISTINCT FROM OLD.latitude OR NEW.longitude IS DISTINCT FROM OLD.longitude OR TG_OP = 'INSERT')
  THEN
    NEW.geo := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_artisan_geo') THEN
    CREATE TRIGGER trg_artisan_geo BEFORE INSERT OR UPDATE ON app.artisans
    FOR EACH ROW EXECUTE FUNCTION app.trigger_artisan_geo();
  END IF;
END $$;

-- Géo auto sur leads
CREATE OR REPLACE FUNCTION app.trigger_lead_geo()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL)
     AND (NEW.latitude IS DISTINCT FROM OLD.latitude OR NEW.longitude IS DISTINCT FROM OLD.longitude OR TG_OP = 'INSERT')
  THEN
    NEW.geo := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_lead_geo') THEN
    CREATE TRIGGER trg_lead_geo BEFORE INSERT OR UPDATE ON app.leads
    FOR EACH ROW EXECUTE FUNCTION app.trigger_lead_geo();
  END IF;
END $$;

-- Recalcul internal_rating sur reviews INSERT/UPDATE/DELETE
CREATE OR REPLACE FUNCTION app.trigger_review_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_artisan_id uuid;
BEGIN
  v_artisan_id := COALESCE(NEW.artisan_id, OLD.artisan_id);

  UPDATE app.artisans SET
    internal_rating = sub.avg_rating,
    internal_reviews_count = sub.cnt
  FROM (
    SELECT
      ROUND(AVG(rating)::numeric, 1) AS avg_rating,
      COUNT(*)::int AS cnt
    FROM app.reviews
    WHERE artisan_id = v_artisan_id AND status = 'published'
  ) sub
  WHERE id = v_artisan_id;

  RETURN NULL;  -- AFTER trigger
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_review_stats') THEN
    CREATE TRIGGER trg_review_stats AFTER INSERT OR UPDATE OR DELETE ON app.reviews
    FOR EACH ROW EXECUTE FUNCTION app.trigger_review_stats();
  END IF;
END $$;

-- Canonise phone client sur leads
CREATE OR REPLACE FUNCTION app.trigger_lead_canonicalize()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.client_phone IS DISTINCT FROM OLD.client_phone OR TG_OP = 'INSERT' THEN
    NEW.client_phone_e164 := app.canonical_phone_e164(NEW.client_phone);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_lead_canonicalize') THEN
    CREATE TRIGGER trg_lead_canonicalize BEFORE INSERT OR UPDATE ON app.leads
    FOR EACH ROW EXECUTE FUNCTION app.trigger_lead_canonicalize();
  END IF;
END $$;

-- ============================================================================
-- 23. REFRESH STATS (cron)
-- ============================================================================
CREATE OR REPLACE FUNCTION app.refresh_stats()
RETURNS void AS $$
BEGIN
  UPDATE app.artisans a SET
    trust_score = app.compute_trust_score(a.id)
  WHERE a.deleted_at IS NULL AND a.is_active;
END;
$$ LANGUAGE plpgsql;

-- Partitions mensuelles auto
CREATE OR REPLACE FUNCTION app.create_monthly_partitions(p_date date)
RETURNS void AS $$
DECLARE
  v_start text;
  v_end text;
  v_suffix text;
BEGIN
  v_start := to_char(p_date, 'YYYY-MM-DD');
  v_end := to_char(p_date + interval '1 month', 'YYYY-MM-DD');
  v_suffix := to_char(p_date, 'YYYY_MM');

  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS app.outreach_messages_%s PARTITION OF app.outreach_messages FOR VALUES FROM (%L) TO (%L)',
    v_suffix, v_start, v_end
  );
  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS app.events_%s PARTITION OF app.events FOR VALUES FROM (%L) TO (%L)',
    v_suffix, v_start, v_end
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 24. RLS POLICIES
-- ============================================================================

-- Profiles
ALTER TABLE app.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_own ON app.profiles
  FOR ALL USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Artisans
ALTER TABLE app.artisans ENABLE ROW LEVEL SECURITY;

CREATE POLICY artisan_own_profile ON app.artisans
  FOR ALL USING (claimed_by = auth.uid())
  WITH CHECK (claimed_by = auth.uid());

CREATE POLICY artisan_public_read ON app.artisans
  FOR SELECT USING (
    is_active = true AND deleted_at IS NULL AND merged_into_id IS NULL
  );

-- Lead assignments
ALTER TABLE app.lead_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY artisan_own_leads ON app.lead_assignments
  FOR SELECT USING (artisan_id IN (
    SELECT id FROM app.artisans WHERE claimed_by = auth.uid()
  ));

CREATE POLICY artisan_respond_leads ON app.lead_assignments
  FOR UPDATE USING (artisan_id IN (
    SELECT id FROM app.artisans WHERE claimed_by = auth.uid()
  ))
  WITH CHECK (status IN ('viewed','accepted','declined'));

-- Reviews
ALTER TABLE app.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY reviews_public_read ON app.reviews
  FOR SELECT USING (status = 'published');

CREATE POLICY artisan_own_reviews ON app.reviews
  FOR SELECT USING (artisan_id IN (
    SELECT id FROM app.artisans WHERE claimed_by = auth.uid()
  ));

-- Notifications
ALTER TABLE app.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_notifications ON app.notifications
  FOR ALL USING (recipient_id = auth.uid());

-- Leads : pas de RLS anon, insert via API (service_role côté serveur)
ALTER TABLE app.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY leads_admin_all ON app.leads
  FOR ALL USING (
    EXISTS (SELECT 1 FROM app.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Algorithm config : admin seulement
ALTER TABLE app.algorithm_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY algorithm_config_admin ON app.algorithm_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM app.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Services : lecture publique
ALTER TABLE app.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY services_public_read ON app.services
  FOR SELECT USING (is_active = true);

CREATE POLICY services_admin_all ON app.services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM app.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Cities : lecture publique
ALTER TABLE app.cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY cities_public_read ON app.cities
  FOR SELECT USING (true);

-- Contact suppressions
ALTER TABLE app.contact_suppressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY suppressions_artisan ON app.contact_suppressions
  FOR ALL USING (artisan_id IN (
    SELECT id FROM app.artisans WHERE claimed_by = auth.uid()
  ));

-- Plans : lecture publique
ALTER TABLE app.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY plans_public_read ON app.plans
  FOR SELECT USING (is_active = true);

-- Subscriptions : artisan voit les siens
ALTER TABLE app.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscriptions_own ON app.subscriptions
  FOR SELECT USING (artisan_id IN (
    SELECT id FROM app.artisans WHERE claimed_by = auth.uid()
  ));

-- Artisan services : lecture publique
ALTER TABLE app.artisan_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY artisan_services_read ON app.artisan_services
  FOR SELECT USING (true);

CREATE POLICY artisan_services_own ON app.artisan_services
  FOR ALL USING (artisan_id IN (
    SELECT id FROM app.artisans WHERE claimed_by = auth.uid()
  ));

-- Artisan zones : lecture publique
ALTER TABLE app.artisan_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY artisan_zones_read ON app.artisan_zones
  FOR SELECT USING (true);

CREATE POLICY artisan_zones_own ON app.artisan_zones
  FOR ALL USING (artisan_id IN (
    SELECT id FROM app.artisans WHERE claimed_by = auth.uid()
  ));

-- ============================================================================
-- 25. GRANTS (vue publique + service_role bypass)
-- ============================================================================
GRANT USAGE ON SCHEMA app TO anon, authenticated, service_role;

GRANT SELECT ON app.public_artisans TO anon, authenticated;
GRANT SELECT ON app.services TO anon, authenticated;
GRANT SELECT ON app.cities TO anon, authenticated;
GRANT SELECT ON app.plans TO anon, authenticated;
GRANT SELECT ON app.artisan_services TO anon, authenticated;
GRANT SELECT ON app.artisan_zones TO anon, authenticated;
GRANT SELECT ON app.reviews TO anon, authenticated;

-- Service role : accès total (scripts, API routes)
GRANT ALL ON ALL TABLES IN SCHEMA app TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA app TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO service_role;

-- Authenticated : tables avec RLS
GRANT SELECT, INSERT, UPDATE ON app.profiles TO authenticated;
GRANT SELECT ON app.artisans TO authenticated;
GRANT SELECT ON app.leads TO authenticated;
GRANT SELECT, UPDATE ON app.lead_assignments TO authenticated;
GRANT SELECT ON app.notifications TO authenticated;
GRANT UPDATE ON app.notifications TO authenticated;
GRANT SELECT ON app.subscriptions TO authenticated;
GRANT SELECT, INSERT ON app.reviews TO authenticated;
GRANT SELECT, INSERT, DELETE ON app.contact_suppressions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.artisan_services TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.artisan_zones TO authenticated;
GRANT SELECT ON app.artisan_monthly_usage TO authenticated;

-- ============================================================================
-- 26. COMMENTS
-- ============================================================================
COMMENT ON SCHEMA app IS 'Schéma principal ServicesArtisans — données métier séparées de public/auth';
COMMENT ON TABLE app.artisans IS 'Table maître artisans — PII protégé, soft delete + merge';
COMMENT ON TABLE app.algorithm_config IS 'Config algorithmique unique — paramètres distribution, scoring, quotas';
COMMENT ON TABLE app.lead_assignments IS 'Distribution leads → artisans avec quota reserve/consume/release';
COMMENT ON TABLE app.artisan_monthly_usage IS 'Compteurs quota mensuels avec row lock pour concurrence';
COMMENT ON TABLE app.outreach_messages IS 'Messages sortants partitionnés par mois pour rétention';
COMMENT ON TABLE app.events IS 'Audit trail partitionné par mois';
COMMENT ON TABLE app.artisan_merges IS 'Chaîne de fusion pour déduplication artisans';

-- ============================================================================
-- DONE
-- ============================================================================
