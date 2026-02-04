-- =====================================================
-- SCRIPT DE NETTOYAGE DES FAUX AVIS
-- =====================================================

-- 1️⃣ CHERCHER les avis avec ID "synth-" (synthetic = générés par code)
SELECT id, author_name, rating, content, source, created_at, provider_id
FROM reviews
WHERE id::text LIKE 'synth-%'
ORDER BY created_at DESC
LIMIT 100;

-- 2️⃣ CHERCHER les avis avec auteurs suspects (Prénom X.)
SELECT id, author_name, rating, content, source, created_at
FROM reviews
WHERE author_name ~ '^(Marie|Jean|Pierre|Sophie|Michel|Isabelle|Philippe|Catherine|François|Nathalie|Laurent|Sylvie|Patrick|Christine|Nicolas|Sandrine|Christophe|Valérie|Thierry|Céline|Eric|Véronique|Olivier|Anne|David|Martine|Frédéric|Monique|Stéphane|Brigitte) [A-Z]\.$'
ORDER BY created_at DESC
LIMIT 100;

-- 3️⃣ CHERCHER les avis avec source NULL ou vide (pas de source = suspect)
SELECT id, author_name, rating, content, source, created_at
FROM reviews
WHERE source IS NULL OR source = ''
ORDER BY created_at DESC
LIMIT 100;

-- 4️⃣ STATISTIQUES des avis par source
SELECT 
    source,
    COUNT(*) as total,
    AVG(rating) as avg_rating,
    MIN(created_at) as oldest,
    MAX(created_at) as newest
FROM reviews
GROUP BY source
ORDER BY total DESC;

-- =====================================================
-- ⚠️ SUPPRESSION (À FAIRE APRÈS VÉRIFICATION)
-- =====================================================

-- 🔥 SUPPRIMER les avis avec ID "synth-"
-- DELETE FROM reviews WHERE id::text LIKE 'synth-%';

-- 🔥 SUPPRIMER les avis avec pattern "Prénom X."
-- DELETE FROM reviews 
-- WHERE author_name ~ '^(Marie|Jean|Pierre|Sophie|Michel|Isabelle|Philippe|Catherine|François|Nathalie|Laurent|Sylvie|Patrick|Christine|Nicolas|Sandrine|Christophe|Valérie|Thierry|Céline|Eric|Véronique|Olivier|Anne|David|Martine|Frédéric|Monique|Stéphane|Brigitte) [A-Z]\.$';

-- 🔥 SUPPRIMER les avis sans source
-- DELETE FROM reviews WHERE source IS NULL OR source = '';

-- =====================================================
-- ✅ VÉRIFICATION APRÈS NETTOYAGE
-- =====================================================

-- Compter les avis restants
-- SELECT COUNT(*) as total_reviews FROM reviews;

-- Voir les 20 derniers avis
-- SELECT id, author_name, rating, LEFT(content, 50) as content_preview, source, created_at
-- FROM reviews
-- ORDER BY created_at DESC
-- LIMIT 20;
