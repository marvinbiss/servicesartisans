-- =============================================================================
-- Migration 498: dispatch_lead — RGE-first hard filter (Action #2 / Plan Phase 1)
-- ServicesArtisans — 2026-05-03
-- =============================================================================
-- Context (Audit F + pivot RGE 2026-05-03):
--   La home affiche "Le 1er annuaire 100% artisans RGE certifiés", mais le
--   dispatch envoyait encore les leads PAC / isolation / audit énergétique
--   à n'importe quel artisan actif dans la zone, qu'il soit RGE ou non.
--
--   Conséquences :
--     - Promesse marketing cassée → conversion claim s'effondre.
--     - Mandataire CEE Sonergia bloqué : un dossier signé chez un non-RGE
--       ne déclenche AUCUNE prime → perte client + risque litige.
--     - MaPrimeRénov' identique : prime conditionnée au RGE par décret.
--
--   Vague 1 (fix `address_region`, 2026-05-03) ayant ramené à 100% la
--   normalisation des 49 228 RGE actifs, on peut désormais activer un
--   filtrage strict sans risque de famine.
--
-- Architecture :
--   1. Liste canonique des services qui REQUIÈRENT RGE par construction
--      (PAC, isolation, audit, fenêtres, ventilation, panneaux solaires,
--      chauffe-eau thermo, borne de recharge, rénovation énergétique).
--      Stockée dans `algorithm_config.rge_required_services` pour pouvoir
--      l'éditer en runtime sans redeploy.
--
--   2. Flag `require_rge_strict` (true par défaut) qui active le hard filter
--      quand `service ∈ rge_required_services` OU `p_cee_eligible = true`.
--      Reversible : `UPDATE algorithm_config SET require_rge_strict = false`.
--
--   3. Escalade radius automatique pour les leads RGE : si 0 candidat à
--      `geo_radius_km` (50 par défaut), on retente à 80, puis 120, puis
--      200 km AVANT de retomber sur un fallback. Permet de couvrir les
--      zones rurales sans RGE local.
--
--   4. Si toujours 0 candidat après expand → return tableau vide. JAMAIS
--      de leak silencieux vers un non-RGE. Le caller TS doit logger l'event
--      et basculer le lead en suivi commercial manuel.
--
--   5. Observabilité : INSERT dans `audit_logs` avec
--      `action = 'dispatch.rge_strict_no_match'` quand le filtre RGE empêche
--      le dispatch. Visible dans le dashboard ops + extractible Sentry.
--
-- Backward compat :
--   - Signature inchangée (9 params, identique à mig 462/463).
--   - `claimed_boost_weight` (mig 463) préservé.
--   - Si `require_rge_strict = false` ET `require_rge_for_cee = false`,
--     comportement identique à mig 463 → rollback = 1 UPDATE config.
--
-- Variable naming : préfixe `_` pour éviter le quirk RLS auto Supabase
-- (cf. memory feedback_supabase_plpgsql_auto_rls).
-- =============================================================================

BEGIN;

-- 1. Nouvelles colonnes de config (idempotent)

ALTER TABLE public.algorithm_config
  ADD COLUMN IF NOT EXISTS rge_required_services TEXT[] NOT NULL
    DEFAULT ARRAY[
      'pompe-a-chaleur',
      'panneaux-solaires',
      'isolation-thermique',
      'chauffe-eau-thermodynamique',
      'audit-energetique',
      'renovation-energetique',
      'ventilation',
      'fenetres',
      'borne-recharge'
    ]::TEXT[];

ALTER TABLE public.algorithm_config
  ADD COLUMN IF NOT EXISTS require_rge_strict BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.algorithm_config
  ADD COLUMN IF NOT EXISTS rge_fallback_radius_km INTEGER[] NOT NULL
    DEFAULT ARRAY[80, 120, 200]::INTEGER[];

COMMENT ON COLUMN public.algorithm_config.rge_required_services IS
  'Services pour lesquels seul un artisan RGE-valide peut recevoir le lead. Mirror SQL de src/lib/dispatch/rge-required-services.ts. Migration 498.';
COMMENT ON COLUMN public.algorithm_config.require_rge_strict IS
  'Si true, hard-filter les leads RGE-required (par service OU p_cee_eligible) aux artisans RGE-valides. Reversible. Migration 498.';
COMMENT ON COLUMN public.algorithm_config.rge_fallback_radius_km IS
  'Liste ordonnée de rayons (km) à essayer si la 1ère passe à geo_radius_km ne trouve aucun RGE. Migration 498.';

-- 2. Activer le filtre CEE existant (sécurisé maintenant : 49K RGE actifs)
UPDATE public.algorithm_config SET require_rge_for_cee = true WHERE require_rge_for_cee IS DISTINCT FROM true;

-- 3. Recreate dispatch_lead (signature 9-param identique à mig 463)

CREATE OR REPLACE FUNCTION dispatch_lead(
  p_lead_id UUID,
  p_service_name TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_postal_code TEXT DEFAULT NULL,
  p_urgency TEXT DEFAULT 'normal',
  p_latitude DOUBLE PRECISION DEFAULT NULL,
  p_longitude DOUBLE PRECISION DEFAULT NULL,
  p_source_table TEXT DEFAULT 'devis_requests',
  p_cee_eligible BOOLEAN DEFAULT false
)
RETURNS UUID[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  _cfg RECORD;
  _lock BIGINT;
  _cnt INT := 0;
  _out UUID[] := '{}';
  _prov RECORD;
  _geo GEOGRAPHY;
  _urg_mult REAL := 1.0;
  _dept TEXT;
  _has_loc BOOLEAN;
  _requires_rge BOOLEAN := false;
  _radius_attempts INTEGER[];
  _current_radius INTEGER;
  _attempt_idx INT := 0;
BEGIN
  SELECT * INTO _cfg FROM public.algorithm_config LIMIT 1;

  IF _cfg IS NULL THEN
    INSERT INTO public.algorithm_config (id) VALUES (gen_random_uuid())
    ON CONFLICT DO NOTHING;
    SELECT * INTO _cfg FROM public.algorithm_config LIMIT 1;
  END IF;

  _lock := ('x' || left(replace(p_lead_id::text, '-', ''), 16))::bit(64)::bigint;
  PERFORM pg_advisory_xact_lock(_lock);

  IF EXISTS (
    SELECT 1 FROM lead_assignments
    WHERE lead_id = p_lead_id AND source_table = p_source_table
  ) THEN
    SELECT array_agg(provider_id) INTO _out
    FROM lead_assignments
    WHERE lead_id = p_lead_id AND source_table = p_source_table;
    RETURN _out;
  END IF;

  IF p_latitude IS NOT NULL AND p_longitude IS NOT NULL THEN
    _geo := ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography;
  END IF;

  IF p_postal_code IS NOT NULL AND length(p_postal_code) >= 2 THEN
    _dept := left(p_postal_code, 2);
  END IF;

  _has_loc := (_geo IS NOT NULL OR p_city IS NOT NULL OR p_postal_code IS NOT NULL);

  _urg_mult := CASE p_urgency
    WHEN 'flexible' THEN _cfg.urgency_low_multiplier
    WHEN 'normal'   THEN _cfg.urgency_medium_multiplier
    WHEN 'semaine'  THEN _cfg.urgency_medium_multiplier
    WHEN 'mois'     THEN _cfg.urgency_low_multiplier
    WHEN 'urgent'   THEN _cfg.urgency_high_multiplier
    WHEN 'tres_urgent' THEN _cfg.urgency_emergency_multiplier
    ELSE _cfg.urgency_medium_multiplier
  END;

  -- =====================================================================
  -- RGE strict gate
  -- =====================================================================
  -- Le lead requiert un artisan RGE si :
  --   (a) require_rge_strict est activé globalement (par défaut true), ET
  --   (b) le caller a flagué cee_eligible=true OU le service appartient
  --       à la liste canonique rge_required_services (pompe-a-chaleur,
  --       isolation, audit énergétique, etc.)
  _requires_rge := COALESCE(_cfg.require_rge_strict, false) AND (
    p_cee_eligible
    OR (
      p_service_name IS NOT NULL
      AND _cfg.rge_required_services IS NOT NULL
      AND p_service_name = ANY(_cfg.rge_required_services)
    )
  );

  -- Construit la liste de rayons à essayer.
  -- - Lead RGE strict + coords géocodées → escalade : geo_radius_km puis fallback list.
  -- - Lead RGE strict sans coords        → escalade no-op (la WHERE retombe sur
  --   city/postal-prefix qui n'utilise pas le radius). On la conserve pour la
  --   trace `attempts` dans l'audit_log mais elle ne change pas le résultat.
  -- - Lead non-RGE → un seul tour à geo_radius_km (comportement historique).
  IF _requires_rge AND _cfg.rge_fallback_radius_km IS NOT NULL THEN
    _radius_attempts := ARRAY[_cfg.geo_radius_km] || _cfg.rge_fallback_radius_km;
  ELSE
    _radius_attempts := ARRAY[_cfg.geo_radius_km];
  END IF;

  -- =====================================================================
  -- Sélection des candidats (avec escalade radius pour leads RGE)
  -- =====================================================================
  FOREACH _current_radius IN ARRAY _radius_attempts LOOP
    _attempt_idx := _attempt_idx + 1;

    -- Si on a déjà au moins un candidat, ne pas retenter avec un radius
    -- plus large (on prend les plus proches uniquement).
    EXIT WHEN _cnt > 0;

    FOR _prov IN
      SELECT
        p.id AS provider_id,
        CASE WHEN p.location IS NOT NULL AND _geo IS NOT NULL
          THEN ST_Distance(p.location, _geo) / 1000.0
          ELSE NULL
        END AS distance_km,
        CASE _cfg.matching_strategy
          WHEN 'round_robin' THEN 0::real
          WHEN 'geographic' THEN
            CASE WHEN p.location IS NOT NULL AND _geo IS NOT NULL
              THEN (1.0 - LEAST(ST_Distance(p.location, _geo) / 1000.0
                    / GREATEST(_current_radius, 1), 1.0)) * 100.0
              ELSE 0
            END::real
          ELSE
            (
              (COALESCE(p.rating_average, 0)::real / 5.0 * _cfg.weight_rating)
              + (LEAST(COALESCE(p.review_count, 0), 100)::real / 100.0 * _cfg.weight_reviews)
              + (CASE WHEN p.is_verified = true THEN _cfg.weight_verified ELSE 0 END)
              + (CASE WHEN p.location IS NOT NULL AND _geo IS NOT NULL
                  THEN (1.0 - LEAST(ST_Distance(p.location, _geo) / 1000.0
                        / GREATEST(_current_radius, 1), 1.0))
                        * _cfg.weight_proximity
                  ELSE 0
                END)
              + (COALESCE(p.data_quality_score, 0)::real / 100.0 * _cfg.weight_data_quality)
              + (CASE WHEN p_cee_eligible
                       AND p.rge_qualifications IS NOT NULL
                       AND p.rge_valid_until IS NOT NULL
                       AND p.rge_valid_until > CURRENT_DATE
                  THEN _cfg.rge_boost_weight
                  ELSE 0
                END)
              + (CASE WHEN p.user_id IS NOT NULL
                  THEN COALESCE(_cfg.claimed_boost_weight, 0)
                  ELSE 0
                END)
            ) * _urg_mult
        END AS computed_score
      FROM providers p
      WHERE p.is_active = true
        AND (
          NOT _has_loc
          OR
          (_geo IS NOT NULL AND p.location IS NOT NULL
           AND ST_DWithin(p.location, _geo, _current_radius * 1000))
          OR
          (_geo IS NULL AND p_city IS NOT NULL
           AND p.address_city IS NOT NULL
           AND lower(unaccent(p.address_city)) = lower(unaccent(p_city)))
          OR
          (_geo IS NULL AND p_postal_code IS NOT NULL
           AND p.address_postal_code IS NOT NULL
           AND left(p.address_postal_code, 2) = left(p_postal_code, 2))
        )
        AND (NOT _cfg.require_same_department OR _dept IS NULL
             OR p.address_postal_code IS NULL
             OR left(p.address_postal_code, 2) = _dept)
        AND (NOT _cfg.require_specialty_match OR p_service_name IS NULL
             OR (CASE _cfg.specialty_match_mode
                  WHEN 'exact' THEN p.specialty = p_service_name
                  WHEN 'fuzzy' THEN (p.specialty ILIKE '%' || p_service_name || '%'
                    OR COALESCE(p.libelle_naf, '') ILIKE '%' || p_service_name || '%')
                  ELSE p.specialty ILIKE '%' || p_service_name || '%'
                END))
        AND (_cfg.min_rating = 0 OR COALESCE(p.rating_average, 0) >= _cfg.min_rating)
        AND (NOT _cfg.require_verified_urgent
             OR p_urgency NOT IN ('urgent', 'tres_urgent')
             OR p.is_verified = true)
        AND (_cfg.exclude_inactive_days = 0
             OR p.last_lead_assigned_at IS NULL
             OR p.last_lead_assigned_at > now() - (_cfg.exclude_inactive_days || ' days')::interval)
        AND (_cfg.cooldown_minutes = 0
             OR p.last_lead_assigned_at IS NULL
             OR p.last_lead_assigned_at < now() - (_cfg.cooldown_minutes || ' minutes')::interval)
        -- HARD FILTER RGE (mig 498) : si le lead est RGE-required, ne retenir
        -- que les artisans avec qualif RGE non expirée. Sinon comportement
        -- d'historique (pas de filtre — boost score uniquement).
        AND (
          NOT _requires_rge
          OR (p.rge_qualifications IS NOT NULL
              AND p.rge_valid_until IS NOT NULL
              AND p.rge_valid_until > CURRENT_DATE)
        )
        -- Compat héritée mig 462 (pour leads cee_eligible si require_rge_strict
        -- est désactivé ; sinon redondant avec _requires_rge ci-dessus)
        AND (
          NOT p_cee_eligible
          OR NOT _cfg.require_rge_for_cee
          OR (p.rge_qualifications IS NOT NULL
              AND p.rge_valid_until IS NOT NULL
              AND p.rge_valid_until > CURRENT_DATE)
        )
        AND p.id NOT IN (
          SELECT la.provider_id FROM lead_assignments la
          WHERE la.lead_id = p_lead_id AND la.source_table = p_source_table)
      ORDER BY
        CASE WHEN _cfg.matching_strategy = 'round_robin'
          THEN EXTRACT(EPOCH FROM COALESCE(p.last_lead_assigned_at, '1970-01-01'::timestamptz))
          ELSE 0
        END ASC,
        computed_score DESC,
        random()
      LIMIT _cfg.max_artisans_per_lead * 2
    LOOP
      IF _cfg.daily_lead_quota > 0 THEN
        IF (SELECT count(*) FROM lead_assignments
            WHERE provider_id = _prov.provider_id
              AND assigned_at >= date_trunc('day', now())
        ) >= _cfg.daily_lead_quota THEN
          CONTINUE;
        END IF;
      END IF;

      IF _cfg.monthly_lead_quota > 0 THEN
        IF (SELECT count(*) FROM lead_assignments
            WHERE provider_id = _prov.provider_id
              AND assigned_at >= date_trunc('month', now())
        ) >= _cfg.monthly_lead_quota THEN
          CONTINUE;
        END IF;
      END IF;

      _cnt := _cnt + 1;

      INSERT INTO lead_assignments (lead_id, provider_id, source_table, score, distance_km, position)
      VALUES (p_lead_id, _prov.provider_id, p_source_table,
              _prov.computed_score, _prov.distance_km, _cnt);

      UPDATE providers SET last_lead_assigned_at = now()
      WHERE id = _prov.provider_id;

      _out := _out || _prov.provider_id;

      EXIT WHEN _cnt >= _cfg.max_artisans_per_lead;
    END LOOP;
  END LOOP;

  -- =====================================================================
  -- Observabilité : tracer les leads RGE-strict sans match
  -- =====================================================================
  -- Permet au dashboard ops de détecter les zones blanches RGE et au
  -- caller TS de rebasculer le lead en pending_no_artisan_rge / suivi
  -- commercial manuel sans risque de leak vers un non-RGE.
  IF _cnt = 0 AND _requires_rge THEN
    INSERT INTO public.audit_logs (action, resource_type, resource_id, metadata)
    VALUES (
      'dispatch.rge_strict_no_match',
      'lead',
      p_lead_id::text,
      jsonb_build_object(
        'service_name', p_service_name,
        'city', p_city,
        'postal_code', p_postal_code,
        'urgency', p_urgency,
        'cee_eligible', p_cee_eligible,
        'attempted_radii_km', _radius_attempts,
        'attempts', _attempt_idx,
        'source_table', p_source_table
      )
    );
  END IF;

  RETURN _out;
END;
$$;

-- 4. COMMENT signature-explicite (évite 42725)
COMMENT ON FUNCTION dispatch_lead(
  UUID, TEXT, TEXT, TEXT, TEXT, DOUBLE PRECISION, DOUBLE PRECISION, TEXT, BOOLEAN
) IS
  'Distributes a lead to artisans per algorithm_config. Mig 498: HARD filter RGE-valide quand service ∈ rge_required_services OU p_cee_eligible AND require_rge_strict. Escalade radius (geo_radius_km → fallback list) pour les leads RGE. Logue dispatch.rge_strict_no_match dans audit_logs si 0 candidat. SECURITY DEFINER, search_path pinned (CVE-2018-1058).';

COMMIT;

-- =============================================================================
-- Rollback (en cas de famine inattendue) :
--
--   -- Désactiver les DEUX flags : require_rge_strict (mig 498) ET
--   -- require_rge_for_cee (réactivé par mig 498 step 2). Sans ce double
--   -- reset, les leads cee_eligible=true continueraient d'être hard-filtrés
--   -- via la branche héritée mig 462.
--   UPDATE public.algorithm_config
--     SET require_rge_strict = false,
--         require_rge_for_cee = false;
--
-- → Comportement immédiat identique à mig 463 (RGE = score boost only).
--   Aucun rollback de schema requis (les colonnes restent, juste désactivées).
-- =============================================================================
