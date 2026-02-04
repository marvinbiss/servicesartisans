-- Script pour supprimer les reviews dupliquées
-- Un doublon est défini comme : même provider_id, content, author_name, created_at

-- Étape 1 : Identifier les doublons (pour vérification avant suppression)
SELECT 
    provider_id,
    content,
    author_name,
    created_at,
    COUNT(*) as duplicate_count,
    STRING_AGG(id::text, ', ') as duplicate_ids
FROM reviews
GROUP BY provider_id, content, author_name, created_at
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC
LIMIT 20;

-- Étape 2 : Supprimer les doublons (garder seulement le premier ID)
-- ATTENTION : Exécutez cette requête APRÈS avoir vérifié l'étape 1 !
DELETE FROM reviews
WHERE id IN (
    SELECT id
    FROM (
        SELECT 
            id,
            ROW_NUMBER() OVER (
                PARTITION BY provider_id, content, author_name, created_at 
                ORDER BY id
            ) as row_num
        FROM reviews
    ) duplicates
    WHERE row_num > 1
);

-- Étape 3 : Vérifier le résultat
SELECT 
    COUNT(*) as total_reviews_after_cleanup
FROM reviews;

-- Étape 4 : Recalculer les statistiques des providers
-- (review_count et rating_average doivent être mis à jour)
UPDATE providers p
SET 
    review_count = (
        SELECT COUNT(*) 
        FROM reviews r 
        WHERE r.provider_id = p.id
    ),
    rating_average = (
        SELECT AVG(rating) 
        FROM reviews r 
        WHERE r.provider_id = p.id
    )
WHERE EXISTS (
    SELECT 1 
    FROM reviews r 
    WHERE r.provider_id = p.id
);
