/**
 * Applique la migration 110 — Schéma V3 10/10
 * Exécute chaque bloc SQL un par un via connexion PostgreSQL directe.
 * Usage: npx tsx scripts/apply-migration-110.ts
 */

import pg from 'pg'

const { Client } = pg

async function createClient(): Promise<InstanceType<typeof Client>> {
  const client = new Client({
    host: 'db.umjmbdbwcsxrvfqktiui.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'Bulgarie93@',
    ssl: { rejectUnauthorized: false },
  })
  client.on('error', () => {})
  await client.connect()
  await client.query('SET statement_timeout = 0')
  await client.query('SET lock_timeout = 0')
  return client
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

interface Block {
  label: string
  sql: string
}

const blocks: Block[] = [
  // ===== EXTENSIONS + SCHEMA =====
  {
    label: 'Extensions + schema app',
    sql: `
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      CREATE EXTENSION IF NOT EXISTS "postgis";
      CREATE EXTENSION IF NOT EXISTS "citext";
      CREATE SCHEMA IF NOT EXISTS app;
    `,
  },

  // ===== 1. PROFILES =====
  {
    label: 'Table app.profiles',
    sql: `
      CREATE TABLE IF NOT EXISTS app.profiles (
        id            uuid PRIMARY KEY,
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
    `,
  },

  // ===== 2. CITIES =====
  {
    label: 'Table app.cities',
    sql: `
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
    `,
  },

  // ===== 3. SERVICES =====
  {
    label: 'Table app.services',
    sql: `
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
    `,
  },

  // ===== 4. ARTISANS =====
  {
    label: 'Table app.artisans',
    sql: `
      CREATE TABLE IF NOT EXISTS app.artisans (
        id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        stable_id       text NOT NULL UNIQUE,
        company_name    text NOT NULL,
        slug            text NOT NULL UNIQUE,
        siren           text,
        siret           text,
        phone_raw       text,
        phone_e164      text,
        email_raw       text,
        email_canonical citext,
        website         text,
        contact_name    text,
        city_id         uuid REFERENCES app.cities(id),
        address         text,
        postal_code     text,
        department      text,
        region          text,
        latitude        double precision,
        longitude       double precision,
        geo             geography(Point, 4326),
        google_rating       numeric(2,1),
        google_reviews_count int NOT NULL DEFAULT 0,
        internal_rating     numeric(2,1),
        internal_reviews_count int NOT NULL DEFAULT 0,
        trust_score         numeric(5,2) DEFAULT 0,
        source          text,
        source_id       text,
        code_naf        text,
        libelle_naf     text,
        capital         numeric,
        employee_count  text,
        legal_form_code text,
        scraped_at      timestamptz,
        enriched_at     timestamptz,
        claimed_at      timestamptz,
        claimed_by      uuid REFERENCES app.profiles(id),
        verified_at     timestamptz,
        verification_method text
                        CHECK (verification_method IN ('sms','email','document','call','kbis')),
        deleted_at      timestamptz,
        merged_into_id  uuid REFERENCES app.artisans(id),
        deletion_reason text,
        is_active       boolean NOT NULL DEFAULT true,
        data_quality_score int DEFAULT 0
                        CHECK (data_quality_score BETWEEN 0 AND 100),
        created_at      timestamptz NOT NULL DEFAULT now(),
        updated_at      timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT siren_format CHECK (siren IS NULL OR siren = '' OR siren ~ '^\\d{9}$'),
        CONSTRAINT siret_format CHECK (siret IS NULL OR siret = '' OR siret ~ '^\\d{14}$'),
        CONSTRAINT siret_starts_with_siren CHECK (
          siren IS NULL OR siret IS NULL OR siren = '' OR siret = ''
          OR left(siret, 9) = siren
        ),
        CONSTRAINT rating_range CHECK (google_rating IS NULL OR google_rating BETWEEN 0 AND 5),
        CONSTRAINT no_self_merge CHECK (merged_into_id != id)
      );
    `,
  },

  // ===== 4b. ARTISANS INDEXES =====
  {
    label: 'Index artisans (geo, city, dept, claimed, quality, slug, naf, trust, siren, phone, email)',
    sql: `
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
    `,
  },

  // ===== 5. ARTISAN_SERVICES =====
  {
    label: 'Table app.artisan_services',
    sql: `
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
    `,
  },

  // ===== 6. ARTISAN_ZONES =====
  {
    label: 'Table app.artisan_zones',
    sql: `
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
    `,
  },

  // ===== 7. PLANS =====
  {
    label: 'Table app.plans',
    sql: `
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
    `,
  },

  // ===== 8. SUBSCRIPTIONS =====
  {
    label: 'Table app.subscriptions',
    sql: `
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
    `,
  },

  // ===== 9. LEADS =====
  {
    label: 'Table app.leads',
    sql: `
      CREATE TABLE IF NOT EXISTS app.leads (
        id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        service_id    uuid REFERENCES app.services(id),
        city_id       uuid REFERENCES app.cities(id),
        service_name  text,
        description   text,
        urgency       text DEFAULT 'medium'
                      CHECK (urgency IN ('low','medium','high','emergency')),
        client_name       text NOT NULL,
        client_phone      text NOT NULL,
        client_email      text,
        client_phone_e164 text,
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
    `,
  },

  // ===== 10. LEAD_ASSIGNMENTS =====
  {
    label: 'Table app.lead_assignments',
    sql: `
      CREATE TABLE IF NOT EXISTS app.lead_assignments (
        id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        lead_id       uuid NOT NULL REFERENCES app.leads(id) ON DELETE CASCADE,
        artisan_id    uuid NOT NULL REFERENCES app.artisans(id) ON DELETE CASCADE,
        score         numeric(7,2),
        distance_km   numeric(7,2),
        position      int,
        status        text NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','viewed','accepted','declined','expired','won','lost')),
        reserved_at   timestamptz,
        consumed_at   timestamptz,
        released_at   timestamptz,
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
    `,
  },

  // ===== 11. ARTISAN_MONTHLY_USAGE =====
  {
    label: 'Table app.artisan_monthly_usage',
    sql: `
      CREATE TABLE IF NOT EXISTS app.artisan_monthly_usage (
        artisan_id    uuid NOT NULL REFERENCES app.artisans(id) ON DELETE CASCADE,
        month         date NOT NULL,
        leads_reserved int NOT NULL DEFAULT 0,
        leads_consumed int NOT NULL DEFAULT 0,
        leads_released int NOT NULL DEFAULT 0,
        updated_at    timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (artisan_id, month)
      );
    `,
  },

  // ===== 12. REVIEWS =====
  {
    label: 'Table app.reviews',
    sql: `
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
    `,
  },

  // ===== 13. NOTIFICATIONS =====
  {
    label: 'Table app.notifications',
    sql: `
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
    `,
  },

  // ===== 14. CONTACT_SUPPRESSIONS =====
  {
    label: 'Table app.contact_suppressions',
    sql: `
      CREATE TABLE IF NOT EXISTS app.contact_suppressions (
        id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        artisan_id    uuid NOT NULL REFERENCES app.artisans(id) ON DELETE CASCADE,
        channel       text NOT NULL CHECK (channel IN ('email','sms','whatsapp','phone')),
        reason        text,
        suppressed_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE (artisan_id, channel)
      );
    `,
  },

  // ===== 15. ARTISAN_MERGES =====
  {
    label: 'Table app.artisan_merges',
    sql: `
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
    `,
  },

  // ===== 16. OUTREACH_MESSAGES (partitioned) =====
  {
    label: 'Table app.outreach_messages (partitioned)',
    sql: `
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
    `,
  },
  {
    label: 'Partitions outreach_messages (feb-jul 2026)',
    sql: `
      CREATE TABLE IF NOT EXISTS app.outreach_messages_2026_02
        PARTITION OF app.outreach_messages FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
      CREATE TABLE IF NOT EXISTS app.outreach_messages_2026_03
        PARTITION OF app.outreach_messages FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
      CREATE TABLE IF NOT EXISTS app.outreach_messages_2026_04
        PARTITION OF app.outreach_messages FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
      CREATE TABLE IF NOT EXISTS app.outreach_messages_2026_05
        PARTITION OF app.outreach_messages FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
      CREATE TABLE IF NOT EXISTS app.outreach_messages_2026_06
        PARTITION OF app.outreach_messages FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
      CREATE TABLE IF NOT EXISTS app.outreach_messages_2026_07
        PARTITION OF app.outreach_messages FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
    `,
  },

  // ===== 17. EVENTS (partitioned) =====
  {
    label: 'Table app.events (partitioned)',
    sql: `
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
    `,
  },
  {
    label: 'Partitions events (feb-jul 2026)',
    sql: `
      CREATE TABLE IF NOT EXISTS app.events_2026_02
        PARTITION OF app.events FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
      CREATE TABLE IF NOT EXISTS app.events_2026_03
        PARTITION OF app.events FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
      CREATE TABLE IF NOT EXISTS app.events_2026_04
        PARTITION OF app.events FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
      CREATE TABLE IF NOT EXISTS app.events_2026_05
        PARTITION OF app.events FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
      CREATE TABLE IF NOT EXISTS app.events_2026_06
        PARTITION OF app.events FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
      CREATE TABLE IF NOT EXISTS app.events_2026_07
        PARTITION OF app.events FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
    `,
  },

  // ===== 18. ALGORITHM_CONFIG =====
  {
    label: 'Table app.algorithm_config',
    sql: `
      CREATE TABLE IF NOT EXISTS app.algorithm_config (
        id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
        weight_rating         int NOT NULL DEFAULT 30 CHECK (weight_rating BETWEEN 0 AND 100),
        weight_reviews        int NOT NULL DEFAULT 15 CHECK (weight_reviews BETWEEN 0 AND 100),
        weight_verified       int NOT NULL DEFAULT 20 CHECK (weight_verified BETWEEN 0 AND 100),
        weight_proximity      int NOT NULL DEFAULT 25 CHECK (weight_proximity BETWEEN 0 AND 100),
        weight_response_rate  int NOT NULL DEFAULT 10 CHECK (weight_response_rate BETWEEN 0 AND 100),
        daily_lead_quota      int NOT NULL DEFAULT 0 CHECK (daily_lead_quota >= 0),
        monthly_lead_quota    int NOT NULL DEFAULT 0 CHECK (monthly_lead_quota >= 0),
        cooldown_minutes      int NOT NULL DEFAULT 30 CHECK (cooldown_minutes >= 0),
        lead_expiry_hours     int NOT NULL DEFAULT 48 CHECK (lead_expiry_hours > 0),
        quote_expiry_hours    int NOT NULL DEFAULT 72 CHECK (quote_expiry_hours > 0),
        auto_reassign_hours   int NOT NULL DEFAULT 24 CHECK (auto_reassign_hours > 0),
        min_rating            numeric(2,1) NOT NULL DEFAULT 0 CHECK (min_rating BETWEEN 0 AND 5),
        require_verified_urgent boolean NOT NULL DEFAULT false,
        exclude_inactive_days int NOT NULL DEFAULT 90 CHECK (exclude_inactive_days >= 0),
        prefer_claimed        boolean NOT NULL DEFAULT true,
        urgency_low_multiplier    numeric(3,2) NOT NULL DEFAULT 1.00,
        urgency_medium_multiplier numeric(3,2) NOT NULL DEFAULT 1.00,
        urgency_high_multiplier   numeric(3,2) NOT NULL DEFAULT 1.50,
        urgency_emergency_multiplier numeric(3,2) NOT NULL DEFAULT 2.00,
        updated_by    uuid REFERENCES app.profiles(id),
        updated_at    timestamptz NOT NULL DEFAULT now(),
        created_at    timestamptz NOT NULL DEFAULT now()
      );
      INSERT INTO app.algorithm_config (id)
      VALUES (gen_random_uuid())
      ON CONFLICT DO NOTHING;
    `,
  },

  // ===== 19. VUE PUBLIQUE =====
  {
    label: 'Vue app.public_artisans',
    sql: `
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
    `,
  },

  // ===== 20. FONCTIONS UTILITAIRES =====
  {
    label: 'Fonction app.canonical_email',
    sql: `
      CREATE OR REPLACE FUNCTION app.canonical_email(raw text)
      RETURNS citext AS $$
        SELECT lower(trim(raw))::citext
      $$ LANGUAGE sql IMMUTABLE;
    `,
  },
  {
    label: 'Fonction app.canonical_phone_e164',
    sql: `
      CREATE OR REPLACE FUNCTION app.canonical_phone_e164(raw text)
      RETURNS text AS $$
      DECLARE cleaned text;
      BEGIN
        IF raw IS NULL OR trim(raw) = '' THEN RETURN NULL; END IF;
        cleaned := regexp_replace(trim(raw), '[^0-9+]', '', 'g');
        IF cleaned LIKE '0%' AND length(cleaned) = 10 THEN
          RETURN '+33' || substring(cleaned FROM 2);
        ELSIF cleaned LIKE '+33%' THEN RETURN cleaned;
        ELSIF cleaned LIKE '33%' AND length(cleaned) = 11 THEN
          RETURN '+' || cleaned;
        END IF;
        RETURN cleaned;
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;
    `,
  },
  {
    label: 'Fonction app.compute_trust_score',
    sql: `
      CREATE OR REPLACE FUNCTION app.compute_trust_score(p_artisan_id uuid)
      RETURNS numeric AS $$
        SELECT
          coalesce(a.google_rating * 10, 0)
          + CASE WHEN a.verified_at IS NOT NULL THEN 20 ELSE 0 END
          + least(a.internal_reviews_count * 2, 20)
          + least(extract(year FROM age(a.created_at))::int * 2, 10)
        FROM app.artisans a WHERE a.id = p_artisan_id
      $$ LANGUAGE sql STABLE;
    `,
  },
  {
    label: 'Fonction app.resolve_artisan_id',
    sql: `
      CREATE OR REPLACE FUNCTION app.resolve_artisan_id(p_id uuid, p_max_depth int DEFAULT 10)
      RETURNS uuid AS $$
      DECLARE v uuid := p_id; nxt uuid; i int := 0;
      BEGIN
        LOOP
          SELECT new_id INTO nxt FROM app.artisan_merges WHERE old_id = v;
          EXIT WHEN nxt IS NULL OR i >= p_max_depth;
          v := nxt; i := i + 1;
        END LOOP;
        RETURN v;
      END;
      $$ LANGUAGE plpgsql STABLE;
    `,
  },
  {
    label: 'Fonction app.reserve_quota',
    sql: `
      CREATE OR REPLACE FUNCTION app.reserve_quota(p_artisan_id uuid, p_now timestamptz DEFAULT now())
      RETURNS boolean AS $$
      DECLARE v_month date; v_plan_quota int; v_used int;
      BEGIN
        v_month := date_trunc('month', p_now)::date;
        SELECT COALESCE(pl.lead_quota, 999999) INTO v_plan_quota
        FROM app.subscriptions s
        JOIN app.plans pl ON pl.id = s.plan_id
        WHERE s.artisan_id = p_artisan_id AND s.status = 'active'
        LIMIT 1;
        IF v_plan_quota IS NULL THEN v_plan_quota := 999999; END IF;
        INSERT INTO app.artisan_monthly_usage (artisan_id, month, leads_reserved)
        VALUES (p_artisan_id, v_month, 1)
        ON CONFLICT (artisan_id, month) DO UPDATE
        SET leads_reserved = app.artisan_monthly_usage.leads_reserved + 1, updated_at = now();
        SELECT leads_reserved INTO v_used
        FROM app.artisan_monthly_usage
        WHERE artisan_id = p_artisan_id AND month = v_month FOR UPDATE;
        IF v_used > v_plan_quota THEN
          UPDATE app.artisan_monthly_usage SET leads_reserved = leads_reserved - 1
          WHERE artisan_id = p_artisan_id AND month = v_month;
          RETURN false;
        END IF;
        RETURN true;
      END;
      $$ LANGUAGE plpgsql;
    `,
  },
  {
    label: 'Fonction app.consume_quota',
    sql: `
      CREATE OR REPLACE FUNCTION app.consume_quota(p_artisan_id uuid, p_now timestamptz DEFAULT now())
      RETURNS void AS $$
        UPDATE app.artisan_monthly_usage
        SET leads_consumed = leads_consumed + 1, updated_at = now()
        WHERE artisan_id = p_artisan_id AND month = date_trunc('month', p_now)::date
      $$ LANGUAGE sql;
    `,
  },
  {
    label: 'Fonction app.release_quota',
    sql: `
      CREATE OR REPLACE FUNCTION app.release_quota(p_artisan_id uuid, p_now timestamptz DEFAULT now())
      RETURNS void AS $$
        UPDATE app.artisan_monthly_usage
        SET leads_released = leads_released + 1,
            leads_reserved = GREATEST(leads_reserved - 1, 0),
            updated_at = now()
        WHERE artisan_id = p_artisan_id AND month = date_trunc('month', p_now)::date
      $$ LANGUAGE sql;
    `,
  },

  // ===== 21. DISTRIBUTE_LEAD =====
  {
    label: 'Fonction app.distribute_lead (configurable)',
    sql: `
      CREATE OR REPLACE FUNCTION app.distribute_lead(p_lead_id uuid)
      RETURNS void AS $$
      DECLARE
        v_lead    record;
        v_config  record;
        v_lock    bigint;
        v_count   int := 0;
        v_artisan record;
      BEGIN
        SELECT * INTO STRICT v_lead FROM app.leads WHERE id = p_lead_id;
        SELECT * INTO v_config FROM app.algorithm_config LIMIT 1;
        v_lock := ('x' || left(replace(p_lead_id::text, '-', ''), 16))::bit(64)::bigint;
        PERFORM pg_advisory_xact_lock(v_lock);
        IF EXISTS (SELECT 1 FROM app.lead_assignments WHERE lead_id = p_lead_id) THEN RETURN; END IF;
        FOR v_artisan IN
          SELECT
            a.id AS artisan_id,
            CASE WHEN a.geo IS NOT NULL AND v_lead.geo IS NOT NULL
              THEN ST_Distance(a.geo, v_lead.geo) / 1000.0 ELSE NULL END AS distance_km,
            a.trust_score,
            CASE v_config.matching_strategy
              WHEN 'round_robin' THEN 0
              WHEN 'geographic' THEN
                CASE WHEN a.geo IS NOT NULL AND v_lead.geo IS NOT NULL
                  THEN 1000.0 - (ST_Distance(a.geo, v_lead.geo) / 1000.0) ELSE 0 END
              ELSE
                (COALESCE(a.google_rating, 0) / 5.0 * v_config.weight_rating)
                + (LEAST(a.google_reviews_count, 100) / 100.0 * v_config.weight_reviews)
                + (CASE WHEN a.verified_at IS NOT NULL THEN v_config.weight_verified ELSE 0 END)
                + (CASE WHEN a.geo IS NOT NULL AND v_lead.geo IS NOT NULL
                    THEN (1.0 - LEAST(ST_Distance(a.geo, v_lead.geo) / 1000.0 / v_config.geo_radius_km, 1.0)) * v_config.weight_proximity
                    ELSE 0 END)
            END AS computed_score
          FROM app.artisans a
          LEFT JOIN app.artisan_services asv ON asv.artisan_id = a.id AND asv.service_id = v_lead.service_id
          WHERE a.deleted_at IS NULL AND a.is_active = true
            AND (NOT v_config.require_same_department OR a.department = v_lead.department)
            AND (a.geo IS NULL OR v_lead.geo IS NULL
                 OR ST_DWithin(a.geo, v_lead.geo, COALESCE(asv.radius_km, v_config.geo_radius_km) * 1000))
            AND (NOT v_config.require_specialty_match OR asv.service_id IS NOT NULL
                 OR (v_lead.service_name IS NOT NULL AND a.libelle_naf ILIKE '%' || v_lead.service_name || '%'))
            AND (v_config.min_rating = 0 OR COALESCE(a.google_rating, 0) >= v_config.min_rating)
            AND (NOT v_config.require_verified_urgent
                 OR v_lead.urgency NOT IN ('high','emergency') OR a.verified_at IS NOT NULL)
            AND (NOT v_config.prefer_claimed OR a.claimed_at IS NOT NULL
                 OR NOT EXISTS (SELECT 1 FROM app.artisans a2
                   WHERE a2.claimed_at IS NOT NULL AND a2.is_active AND a2.deleted_at IS NULL LIMIT 1))
          ORDER BY
            CASE v_config.matching_strategy WHEN 'round_robin' THEN 0 ELSE 1 END,
            computed_score DESC, random()
          LIMIT v_config.max_artisans_per_lead * 2
        LOOP
          IF app.reserve_quota(v_artisan.artisan_id) THEN
            v_count := v_count + 1;
            INSERT INTO app.lead_assignments (lead_id, artisan_id, score, distance_km, position, reserved_at)
            VALUES (p_lead_id, v_artisan.artisan_id, v_artisan.computed_score, v_artisan.distance_km, v_count, now());
            EXIT WHEN v_count >= v_config.max_artisans_per_lead;
          END IF;
        END LOOP;
        IF v_count > 0 THEN
          UPDATE app.leads SET status = 'distributed', distributed_at = now() WHERE id = p_lead_id;
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `,
  },

  // ===== 22. TRIGGERS =====
  {
    label: 'Trigger updated_at (profiles, artisans, subscriptions, algorithm_config)',
    sql: `
      CREATE OR REPLACE FUNCTION app.trigger_updated_at()
      RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_profiles_updated_at') THEN
          CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON app.profiles
          FOR EACH ROW EXECUTE FUNCTION app.trigger_updated_at();
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_artisans_updated_at') THEN
          CREATE TRIGGER trg_artisans_updated_at BEFORE UPDATE ON app.artisans
          FOR EACH ROW EXECUTE FUNCTION app.trigger_updated_at();
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_subscriptions_updated_at') THEN
          CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON app.subscriptions
          FOR EACH ROW EXECUTE FUNCTION app.trigger_updated_at();
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_algorithm_config_updated_at') THEN
          CREATE TRIGGER trg_algorithm_config_updated_at BEFORE UPDATE ON app.algorithm_config
          FOR EACH ROW EXECUTE FUNCTION app.trigger_updated_at();
        END IF;
      END $$;
    `,
  },
  {
    label: 'Trigger artisan canonicalize (phone + email)',
    sql: `
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
    `,
  },
  {
    label: 'Trigger artisan geo (lat/lng → geography)',
    sql: `
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
    `,
  },
  {
    label: 'Trigger lead geo + canonicalize',
    sql: `
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
    `,
  },
  {
    label: 'Trigger review stats (recalcul internal_rating)',
    sql: `
      CREATE OR REPLACE FUNCTION app.trigger_review_stats()
      RETURNS TRIGGER AS $$
      DECLARE v_artisan_id uuid;
      BEGIN
        v_artisan_id := COALESCE(NEW.artisan_id, OLD.artisan_id);
        UPDATE app.artisans SET
          internal_rating = sub.avg_rating,
          internal_reviews_count = sub.cnt
        FROM (
          SELECT ROUND(AVG(rating)::numeric, 1) AS avg_rating, COUNT(*)::int AS cnt
          FROM app.reviews WHERE artisan_id = v_artisan_id AND status = 'published'
        ) sub
        WHERE id = v_artisan_id;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;

      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_review_stats') THEN
          CREATE TRIGGER trg_review_stats AFTER INSERT OR UPDATE OR DELETE ON app.reviews
          FOR EACH ROW EXECUTE FUNCTION app.trigger_review_stats();
        END IF;
      END $$;
    `,
  },

  // ===== 23. CRON HELPERS =====
  {
    label: 'Fonctions refresh_stats + create_monthly_partitions',
    sql: `
      CREATE OR REPLACE FUNCTION app.refresh_stats()
      RETURNS void AS $$
      BEGIN
        UPDATE app.artisans a SET trust_score = app.compute_trust_score(a.id)
        WHERE a.deleted_at IS NULL AND a.is_active;
      END;
      $$ LANGUAGE plpgsql;

      CREATE OR REPLACE FUNCTION app.create_monthly_partitions(p_date date)
      RETURNS void AS $$
      DECLARE v_start text; v_end text; v_suffix text;
      BEGIN
        v_start := to_char(p_date, 'YYYY-MM-DD');
        v_end := to_char(p_date + interval '1 month', 'YYYY-MM-DD');
        v_suffix := to_char(p_date, 'YYYY_MM');
        EXECUTE format(
          'CREATE TABLE IF NOT EXISTS app.outreach_messages_%s PARTITION OF app.outreach_messages FOR VALUES FROM (%L) TO (%L)',
          v_suffix, v_start, v_end);
        EXECUTE format(
          'CREATE TABLE IF NOT EXISTS app.events_%s PARTITION OF app.events FOR VALUES FROM (%L) TO (%L)',
          v_suffix, v_start, v_end);
      END;
      $$ LANGUAGE plpgsql;
    `,
  },

  // ===== 24. RLS POLICIES =====
  {
    label: 'RLS profiles',
    sql: `
      ALTER TABLE app.profiles ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS profiles_own ON app.profiles;
      CREATE POLICY profiles_own ON app.profiles
        FOR ALL USING (id = auth.uid()) WITH CHECK (id = auth.uid());
    `,
  },
  {
    label: 'RLS artisans',
    sql: `
      ALTER TABLE app.artisans ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS artisan_own_profile ON app.artisans;
      CREATE POLICY artisan_own_profile ON app.artisans
        FOR ALL USING (claimed_by = auth.uid()) WITH CHECK (claimed_by = auth.uid());
      DROP POLICY IF EXISTS artisan_public_read ON app.artisans;
      CREATE POLICY artisan_public_read ON app.artisans
        FOR SELECT USING (is_active = true AND deleted_at IS NULL AND merged_into_id IS NULL);
    `,
  },
  {
    label: 'RLS lead_assignments',
    sql: `
      ALTER TABLE app.lead_assignments ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS artisan_own_leads ON app.lead_assignments;
      CREATE POLICY artisan_own_leads ON app.lead_assignments
        FOR SELECT USING (artisan_id IN (SELECT id FROM app.artisans WHERE claimed_by = auth.uid()));
      DROP POLICY IF EXISTS artisan_respond_leads ON app.lead_assignments;
      CREATE POLICY artisan_respond_leads ON app.lead_assignments
        FOR UPDATE USING (artisan_id IN (SELECT id FROM app.artisans WHERE claimed_by = auth.uid()))
        WITH CHECK (status IN ('viewed','accepted','declined'));
    `,
  },
  {
    label: 'RLS reviews',
    sql: `
      ALTER TABLE app.reviews ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS reviews_public_read ON app.reviews;
      CREATE POLICY reviews_public_read ON app.reviews FOR SELECT USING (status = 'published');
      DROP POLICY IF EXISTS artisan_own_reviews ON app.reviews;
      CREATE POLICY artisan_own_reviews ON app.reviews
        FOR SELECT USING (artisan_id IN (SELECT id FROM app.artisans WHERE claimed_by = auth.uid()));
    `,
  },
  {
    label: 'RLS notifications + leads + algorithm_config',
    sql: `
      ALTER TABLE app.notifications ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS own_notifications ON app.notifications;
      CREATE POLICY own_notifications ON app.notifications
        FOR ALL USING (recipient_id = auth.uid());

      ALTER TABLE app.leads ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS leads_admin_all ON app.leads;
      CREATE POLICY leads_admin_all ON app.leads
        FOR ALL USING (EXISTS (SELECT 1 FROM app.profiles WHERE id = auth.uid() AND role = 'admin'));

      ALTER TABLE app.algorithm_config ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS algorithm_config_admin ON app.algorithm_config;
      CREATE POLICY algorithm_config_admin ON app.algorithm_config
        FOR ALL USING (EXISTS (SELECT 1 FROM app.profiles WHERE id = auth.uid() AND role = 'admin'));
    `,
  },
  {
    label: 'RLS services + cities + plans + artisan_services + artisan_zones + subscriptions + contact_suppressions',
    sql: `
      ALTER TABLE app.services ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS services_public_read ON app.services;
      CREATE POLICY services_public_read ON app.services FOR SELECT USING (is_active = true);
      DROP POLICY IF EXISTS services_admin_all ON app.services;
      CREATE POLICY services_admin_all ON app.services
        FOR ALL USING (EXISTS (SELECT 1 FROM app.profiles WHERE id = auth.uid() AND role = 'admin'));

      ALTER TABLE app.cities ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS cities_public_read ON app.cities;
      CREATE POLICY cities_public_read ON app.cities FOR SELECT USING (true);

      ALTER TABLE app.plans ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS plans_public_read ON app.plans;
      CREATE POLICY plans_public_read ON app.plans FOR SELECT USING (is_active = true);

      ALTER TABLE app.subscriptions ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS subscriptions_own ON app.subscriptions;
      CREATE POLICY subscriptions_own ON app.subscriptions
        FOR SELECT USING (artisan_id IN (SELECT id FROM app.artisans WHERE claimed_by = auth.uid()));

      ALTER TABLE app.artisan_services ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS artisan_services_read ON app.artisan_services;
      CREATE POLICY artisan_services_read ON app.artisan_services FOR SELECT USING (true);
      DROP POLICY IF EXISTS artisan_services_own ON app.artisan_services;
      CREATE POLICY artisan_services_own ON app.artisan_services
        FOR ALL USING (artisan_id IN (SELECT id FROM app.artisans WHERE claimed_by = auth.uid()));

      ALTER TABLE app.artisan_zones ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS artisan_zones_read ON app.artisan_zones;
      CREATE POLICY artisan_zones_read ON app.artisan_zones FOR SELECT USING (true);
      DROP POLICY IF EXISTS artisan_zones_own ON app.artisan_zones;
      CREATE POLICY artisan_zones_own ON app.artisan_zones
        FOR ALL USING (artisan_id IN (SELECT id FROM app.artisans WHERE claimed_by = auth.uid()));

      ALTER TABLE app.contact_suppressions ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS suppressions_artisan ON app.contact_suppressions;
      CREATE POLICY suppressions_artisan ON app.contact_suppressions
        FOR ALL USING (artisan_id IN (SELECT id FROM app.artisans WHERE claimed_by = auth.uid()));
    `,
  },

  // ===== 25. GRANTS =====
  {
    label: 'GRANTS (schema + tables)',
    sql: `
      GRANT USAGE ON SCHEMA app TO anon, authenticated, service_role;

      GRANT SELECT ON app.public_artisans TO anon, authenticated;
      GRANT SELECT ON app.services TO anon, authenticated;
      GRANT SELECT ON app.cities TO anon, authenticated;
      GRANT SELECT ON app.plans TO anon, authenticated;
      GRANT SELECT ON app.artisan_services TO anon, authenticated;
      GRANT SELECT ON app.artisan_zones TO anon, authenticated;
      GRANT SELECT ON app.reviews TO anon, authenticated;

      GRANT ALL ON ALL TABLES IN SCHEMA app TO service_role;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA app TO service_role;
      GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO service_role;

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
    `,
  },

  // ===== 26. COMMENTS =====
  {
    label: 'COMMENTS',
    sql: `
      COMMENT ON SCHEMA app IS 'Schema principal ServicesArtisans — donnees metier separees de public/auth';
      COMMENT ON TABLE app.artisans IS 'Table maitre artisans — PII protege, soft delete + merge';
      COMMENT ON TABLE app.algorithm_config IS 'Config algorithmique unique — parametres distribution, scoring, quotas';
      COMMENT ON TABLE app.lead_assignments IS 'Distribution leads → artisans avec quota reserve/consume/release';
      COMMENT ON TABLE app.artisan_monthly_usage IS 'Compteurs quota mensuels avec row lock pour concurrence';
      COMMENT ON TABLE app.outreach_messages IS 'Messages sortants partitionnes par mois pour retention';
      COMMENT ON TABLE app.events IS 'Audit trail partitionne par mois';
      COMMENT ON TABLE app.artisan_merges IS 'Chaine de fusion pour deduplication artisans';
      COMMENT ON VIEW app.public_artisans IS 'Vue publique des artisans sans PII (phone, email, etc.)';
      COMMENT ON FUNCTION app.distribute_lead IS 'Distribue un lead aux artisans selon la strategie configuree dans algorithm_config';
    `,
  },
]

async function main() {
  console.log('=== Migration 110 — Schema V3 10/10 ===\n')
  console.log(`  ${blocks.length} blocs a executer\n`)

  // Phase 1: Clean orphans
  console.log('Phase 1: Nettoyage des processus orphelins...')
  const cleanup = await createClient()
  const orphans = await cleanup.query(`
    SELECT pid, left(query, 80) as q
    FROM pg_stat_activity
    WHERE datname = 'postgres'
    AND pid != pg_backend_pid()
    AND state = 'active'
    AND (query ILIKE 'CREATE%' OR query ILIKE 'ALTER%' OR query ILIKE 'DO%')
  `)
  if (orphans.rows.length > 0) {
    for (const row of orphans.rows) {
      console.log(`  Terminate PID ${row.pid}: ${row.q}`)
      await cleanup.query('SELECT pg_terminate_backend($1)', [row.pid])
    }
    console.log(`  ${orphans.rows.length} processus termines, attente 5s...\n`)
    await sleep(5000)
  } else {
    console.log('  Aucun processus orphelin\n')
  }
  await cleanup.end()

  // Phase 2: Execute blocks
  console.log('Phase 2: Execution des blocs SQL...\n')

  let success = 0
  let errors = 0
  const MAX_RETRIES = 3

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    let done = false
    let retries = 0

    while (!done && retries <= MAX_RETRIES) {
      if (retries > 0) {
        console.log(`    Retry ${retries}/${MAX_RETRIES} apres 10s...`)
        await sleep(10000)
      }
      process.stdout.write(`  [${i + 1}/${blocks.length}] ${block.label}... `)
      const start = Date.now()

      let client: InstanceType<typeof Client> | null = null
      try {
        client = await createClient()
        await client.query(block.sql)
        const ms = Date.now() - start
        console.log(`OK (${(ms / 1000).toFixed(1)}s)`)
        success++
        done = true
      } catch (err: any) {
        const ms = Date.now() - start
        if (
          err.message?.includes('already exists') ||
          err.message?.includes('does not exist') && err.message?.includes('DROP POLICY')
        ) {
          console.log(`DEJA EXISTANT (${(ms / 1000).toFixed(1)}s)`)
          success++
          done = true
        } else if (
          err.code === 'ECONNRESET' ||
          err.message?.includes('ECONNRESET') ||
          err.message?.includes('connection')
        ) {
          console.log(`DECONNEXION (${(ms / 1000).toFixed(1)}s)`)
          retries++
          if (retries > MAX_RETRIES) {
            console.log(`    Abandon apres ${MAX_RETRIES} tentatives`)
            errors++
            done = true
          }
        } else {
          console.log(`ERREUR (${(ms / 1000).toFixed(1)}s): ${err.message}`)
          errors++
          done = true
        }
      } finally {
        if (client) {
          try { await client.end() } catch { /* ignore */ }
        }
      }
    }
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log(`  TERMINE: ${success} OK, ${errors} erreurs sur ${blocks.length} blocs`)
  console.log(`${'='.repeat(60)}`)

  if (errors > 0) {
    process.exit(1)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
