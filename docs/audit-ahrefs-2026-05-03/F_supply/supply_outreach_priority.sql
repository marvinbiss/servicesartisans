-- ============================================================================
-- AUDIT F — SUPPLY MARCHÉ : top 5K artisans RGE prioritaires onboarding
-- À exécuter dans Supabase SQL Editor (servicesartisans-prod)
-- Sortie : CSV téléchargeable, à intégrer dans Lemlist/Pipedrive pour outreach
-- ============================================================================

-- F.1 — Distribution actuelle : combien d'artisans RGE ont email/téléphone usable
SELECT 
  COUNT(*) AS total_rge,
  COUNT(*) FILTER (WHERE email IS NOT NULL AND email != '') AS with_email,
  COUNT(*) FILTER (WHERE phone IS NOT NULL AND phone != '') AS with_phone,
  COUNT(*) FILTER (WHERE claimed_at IS NOT NULL) AS already_claimed,
  COUNT(*) FILTER (WHERE rge_qualifications IS NOT NULL AND array_length(rge_qualifications, 1) >= 2) AS multi_qualif,
  COUNT(DISTINCT address_region) AS distinct_regions,
  COUNT(DISTINCT address_city) AS distinct_cities
FROM providers
WHERE rge_qualifications IS NOT NULL 
  AND array_length(rge_qualifications, 1) > 0
  AND is_active = true;

-- F.2 — Top 5K artisans RGE prioritaires pour outreach
-- Score priorité = 
--   +50 si multi-qualif (RGE multiple)
--   +30 si email présent
--   +20 si phone présent
--   +15 si dans top 30 villes France (priorité géographique)
--   +10 si rge_expires_at >= now() + 365 days (qualif fraîche, valable 1+ an)
--   -100 si déjà claimed (exclu)

WITH top_villes AS (
  SELECT unnest(ARRAY[
    'paris','marseille','lyon','toulouse','nice','nantes','montpellier',
    'strasbourg','bordeaux','lille','rennes','reims','le-havre','toulon',
    'grenoble','dijon','angers','nimes','villeurbanne','saint-denis',
    'aix-en-provence','le-mans','clermont-ferrand','brest','tours','amiens',
    'limoges','annecy','perpignan','besancon','metz','orleans'
  ]) AS slug
)
SELECT 
  p.id,
  p.stable_id,
  p.name,
  p.slug,
  p.email,
  p.phone,
  p.siret,
  p.address_city,
  p.address_region,
  array_to_string(p.rge_qualifications, ',') AS rge_qualifs,
  array_length(p.rge_qualifications, 1) AS nb_qualifs,
  p.rge_verified_at,
  p.rge_expires_at,
  -- Score
  (
    (CASE WHEN array_length(p.rge_qualifications, 1) >= 2 THEN 50 ELSE 0 END) +
    (CASE WHEN p.email IS NOT NULL AND p.email != '' THEN 30 ELSE 0 END) +
    (CASE WHEN p.phone IS NOT NULL AND p.phone != '' THEN 20 ELSE 0 END) +
    (CASE WHEN tv.slug IS NOT NULL THEN 15 ELSE 0 END) +
    (CASE WHEN p.rge_expires_at >= now() + interval '365 days' THEN 10 ELSE 0 END)
  ) AS priority_score
FROM providers p
LEFT JOIN top_villes tv ON tv.slug = p.slug
WHERE p.rge_qualifications IS NOT NULL 
  AND array_length(p.rge_qualifications, 1) > 0
  AND p.is_active = true
  AND p.claimed_at IS NULL  -- exclure déjà claimed
ORDER BY priority_score DESC, p.review_count DESC NULLS LAST, p.average_rating DESC NULLS LAST
LIMIT 5000;

-- F.3 — Distribution par qualification RGE (pour priorisation thématique)
SELECT 
  qualif,
  COUNT(*) AS nb_artisans,
  COUNT(*) FILTER (WHERE email IS NOT NULL) AS with_email
FROM providers p,
     unnest(p.rge_qualifications) AS qualif
WHERE p.is_active = true
  AND p.claimed_at IS NULL
GROUP BY qualif
ORDER BY nb_artisans DESC
LIMIT 30;

-- F.4 — Distribution par région (cibler densité commerciale)
SELECT 
  address_region,
  COUNT(*) AS nb_rge,
  COUNT(*) FILTER (WHERE email IS NOT NULL) AS with_email,
  COUNT(*) FILTER (WHERE phone IS NOT NULL) AS with_phone,
  COUNT(*) FILTER (WHERE array_length(rge_qualifications, 1) >= 2) AS multi_qualif
FROM providers
WHERE rge_qualifications IS NOT NULL 
  AND array_length(rge_qualifications, 1) > 0
  AND is_active = true
  AND claimed_at IS NULL
GROUP BY address_region
ORDER BY nb_rge DESC;
