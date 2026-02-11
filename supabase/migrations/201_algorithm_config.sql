-- Table de configuration algorithmique
-- Dashboard admin: /admin/algorithme

CREATE TABLE IF NOT EXISTS public.algorithm_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Distribution
  matching_strategy TEXT NOT NULL DEFAULT 'scored',
  max_artisans_per_lead INTEGER NOT NULL DEFAULT 3,
  geo_radius_km INTEGER NOT NULL DEFAULT 50,
  require_same_department BOOLEAN NOT NULL DEFAULT false,
  require_specialty_match BOOLEAN NOT NULL DEFAULT true,
  specialty_match_mode TEXT NOT NULL DEFAULT 'category',

  -- Scoring (poids 0-100)
  weight_rating INTEGER NOT NULL DEFAULT 30,
  weight_reviews INTEGER NOT NULL DEFAULT 15,
  weight_verified INTEGER NOT NULL DEFAULT 20,
  weight_proximity INTEGER NOT NULL DEFAULT 25,
  weight_response_rate INTEGER NOT NULL DEFAULT 10,

  -- Quotas
  daily_lead_quota INTEGER NOT NULL DEFAULT 0,
  monthly_lead_quota INTEGER NOT NULL DEFAULT 0,
  cooldown_minutes INTEGER NOT NULL DEFAULT 30,

  -- Expiration
  lead_expiry_hours INTEGER NOT NULL DEFAULT 48,
  quote_expiry_hours INTEGER NOT NULL DEFAULT 72,
  auto_reassign_hours INTEGER NOT NULL DEFAULT 24,

  -- Filtres
  min_rating REAL NOT NULL DEFAULT 0,
  require_verified_urgent BOOLEAN NOT NULL DEFAULT false,
  exclude_inactive_days INTEGER NOT NULL DEFAULT 90,
  prefer_claimed BOOLEAN NOT NULL DEFAULT true,

  -- Multiplicateurs urgence
  urgency_low_multiplier REAL NOT NULL DEFAULT 1.0,
  urgency_medium_multiplier REAL NOT NULL DEFAULT 1.0,
  urgency_high_multiplier REAL NOT NULL DEFAULT 1.5,
  urgency_emergency_multiplier REAL NOT NULL DEFAULT 2.0,

  -- Metadata
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

-- Insérer la config par défaut
INSERT INTO public.algorithm_config (id)
VALUES (gen_random_uuid());

-- Activer RLS
ALTER TABLE public.algorithm_config ENABLE ROW LEVEL SECURITY;

-- Politique: seuls les admins (via service_role) peuvent lire/écrire
CREATE POLICY "Service role full access" ON public.algorithm_config
  FOR ALL
  USING (true)
  WITH CHECK (true);
