-- Vérifier l'artisan "Roche-Seguin" (SIRET: 90486746200015)
SELECT id, name, siret, review_count, rating_average, source_id
FROM providers
WHERE siret = '90486746200015';

-- Vérifier ses reviews dans la table reviews
SELECT r.id, r.provider_id, r.rating, r.content, r.author_name, r.created_at
FROM reviews r
JOIN providers p ON r.provider_id = p.id
WHERE p.siret = '90486746200015'
ORDER BY r.created_at DESC
LIMIT 10;

-- Vérifier combien de reviews cet artisan a
SELECT COUNT(*) as total_reviews
FROM reviews r
JOIN providers p ON r.provider_id = p.id
WHERE p.siret = '90486746200015';

-- Vérifier les reviews qui n'ont PAS de provider_id (orphelines)
SELECT COUNT(*) as orphaned_reviews
FROM reviews
WHERE provider_id IS NULL;

-- Vérifier un sample de reviews sans provider_id
SELECT id, rating, content, author_name, source_id
FROM reviews
WHERE provider_id IS NULL
LIMIT 5;
