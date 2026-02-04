-- 1️⃣ COMPTER LE NOMBRE RÉEL D'ARTISANS
SELECT 
    COUNT(*) as total_providers,
    COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_providers,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_providers
FROM providers;

-- 2️⃣ CALCULER LA VRAIE SATISFACTION MOYENNE (basée sur VRAIS avis uniquement)
SELECT 
    COUNT(*) as total_reviews,
    ROUND(AVG(rating)::numeric, 2) as average_rating,
    COUNT(CASE WHEN rating = 5 THEN 1 END) as five_stars,
    COUNT(CASE WHEN rating = 4 THEN 1 END) as four_stars,
    COUNT(CASE WHEN rating = 3 THEN 1 END) as three_stars,
    COUNT(CASE WHEN rating = 2 THEN 1 END) as two_stars,
    COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
FROM reviews
WHERE source IS NOT NULL 
  AND source != ''
  AND source != 'synthetic';

-- 3️⃣ STATISTIQUES PAR SOURCE (pour voir d'où viennent les avis)
SELECT 
    source,
    COUNT(*) as count,
    ROUND(AVG(rating)::numeric, 2) as avg_rating
FROM reviews
WHERE source IS NOT NULL AND source != ''
GROUP BY source
ORDER BY count DESC;

-- 4️⃣ COMPTER LES PROVIDERS AVEC DE VRAIS AVIS
SELECT 
    COUNT(DISTINCT provider_id) as providers_with_reviews
FROM reviews
WHERE source IS NOT NULL 
  AND source != ''
  AND source != 'synthetic';
