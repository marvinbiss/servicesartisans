-- 104_seed_enrich_and_sitemap.sql
-- Enrich seed data: services, locations, provider_services links, realistic provider data
-- Part of: hub minimal + sitemap wave 1

-- ============================================================
-- 1. Ensure "Plombier" service exists
-- ============================================================
INSERT INTO services (id, name, slug, description, is_active, created_at)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Plombier',
  'plombier',
  'Plomberie, sanitaire, chauffage, débouchage',
  true,
  now()
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 2. Ensure "Paris" location exists
-- ============================================================
INSERT INTO locations (id, name, slug, postal_code, department_code, department_name, region_code, region_name, latitude, longitude, population, is_active, created_at)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'Paris',
  'paris',
  '75000',
  '75',
  'Paris',
  '11',
  'Île-de-France',
  48.8566,
  2.3522,
  2161000,
  true,
  now()
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 3. Enrich seed providers with realistic data
-- ============================================================
DO $$
DECLARE
  r RECORD;
  idx INTEGER := 0;
  v_service_id UUID;
  v_location_id UUID;
  phones TEXT[] := ARRAY[
    '0145678901','0145678902','0145678903','0145678904','0145678905',
    '0612345601','0612345602','0612345603','0612345604','0612345605'
  ];
  arrondissements TEXT[] := ARRAY[
    '75001','75002','75003','75004','75005','75006','75007','75008',
    '75009','75010','75011','75012','75013','75014','75015','75016',
    '75017','75018','75019','75020'
  ];
  lats NUMERIC[] := ARRAY[
    48.860,48.868,48.863,48.854,48.846,48.849,48.858,48.874,
    48.876,48.872,48.859,48.841,48.832,48.833,48.841,48.862,
    48.886,48.892,48.880,48.863
  ];
  lngs NUMERIC[] := ARRAY[
    2.347,2.344,2.362,2.357,2.349,2.334,2.314,2.311,
    2.339,2.361,2.379,2.389,2.355,2.326,2.299,2.276,
    2.316,2.345,2.393,2.399
  ];
BEGIN
  -- Get service and location IDs
  SELECT id INTO v_service_id FROM services WHERE slug = 'plombier' LIMIT 1;
  SELECT id INTO v_location_id FROM locations WHERE slug = 'paris' LIMIT 1;

  FOR r IN
    SELECT id, name FROM providers
    WHERE specialty = 'Plombier' AND address_city = 'Paris'
    ORDER BY name
  LOOP
    idx := idx + 1;

    -- Enrich provider with realistic data
    UPDATE providers SET
      phone = phones[1 + (idx % 10)],
      address_postal_code = arrondissements[1 + (idx % 20)],
      latitude = lats[1 + (idx % 20)] + (random() * 0.008 - 0.004),
      longitude = lngs[1 + (idx % 20)] + (random() * 0.008 - 0.004),
      rating_average = CASE
        WHEN idx % 5 = 0 THEN NULL  -- 20% have no rating
        ELSE round((3.5 + random() * 1.5)::numeric, 1)
      END,
      review_count = CASE
        WHEN idx % 5 = 0 THEN 0
        ELSE floor(random() * 50 + 1)::integer
      END,
      experience_years = CASE
        WHEN idx % 4 = 0 THEN NULL
        ELSE floor(random() * 25 + 1)::integer
      END,
      description = 'Plombier professionnel à Paris ' || arrondissements[1 + (idx % 20)]
        || '. Interventions rapides : dépannage, installation sanitaire, chauffage, débouchage.'
        || ' Devis gratuit et sans engagement.',
      updated_at = now()
    WHERE id = r.id;

    -- Create provider_services link if not exists
    IF v_service_id IS NOT NULL THEN
      INSERT INTO provider_services (id, provider_id, service_id, is_primary, created_at)
      VALUES (gen_random_uuid(), r.id, v_service_id, true, now())
      ON CONFLICT DO NOTHING;
    END IF;

    -- Create provider_locations link if not exists
    IF v_location_id IS NOT NULL THEN
      INSERT INTO provider_locations (id, provider_id, location_id, is_primary, created_at)
      VALUES (gen_random_uuid(), r.id, v_location_id, true, now())
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  -- Activate exactly 5 providers for sitemap wave 1 (noindex = false)
  UPDATE providers SET noindex = false
  WHERE id IN (
    SELECT id FROM providers
    WHERE specialty = 'Plombier' AND address_city = 'Paris' AND is_verified = true
    ORDER BY name
    LIMIT 5
  );
END $$;
