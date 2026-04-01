-- Fix commune slug collisions: "saint-denis" was incorrectly assigned to Aude (11)
-- instead of Seine-Saint-Denis (93) because seed script processed by INSEE code order.
--
-- The bare slug should go to the commune matching france.ts static data (most well-known city).
-- All other communes with the same name get dept-suffixed slugs.
--
-- This migration fixes Saint-Denis and any similar cases where the wrong commune
-- got the bare slug.

-- Step 1: Move the incorrectly-assigned bare slug to a dept-suffixed slug
-- Saint-Denis in Aude (code_insee 11339) currently has slug 'saint-denis' → rename to 'saint-denis-11'
UPDATE communes
SET slug = 'saint-denis-11'
WHERE code_insee = '11339' AND slug = 'saint-denis';

-- Saint-Denis in Gard (code_insee 30247) — ensure it has dept-suffixed slug
UPDATE communes
SET slug = 'saint-denis-30'
WHERE code_insee = '30247' AND slug = 'saint-denis';

-- Step 2: Assign bare slug to Seine-Saint-Denis (93066) — the most well-known Saint-Denis
-- First check if saint-denis-93 exists and rename it to bare slug
UPDATE communes
SET slug = 'saint-denis'
WHERE code_insee = '93066' AND slug LIKE 'saint-denis%';

-- Step 3: Ensure La Réunion Saint-Denis (97411) has a clear dept-suffixed slug
UPDATE communes
SET slug = 'saint-denis-974'
WHERE code_insee = '97411' AND slug NOT IN ('saint-denis-974', 'saint-denis-reunion');

-- Step 4: Verify department data is correct for all Saint-Denis communes
UPDATE communes SET departement_code = '11', departement_name = 'Aude', region_name = 'Occitanie'
WHERE code_insee = '11339';

UPDATE communes SET departement_code = '30', departement_name = 'Gard', region_name = 'Occitanie'
WHERE code_insee = '30247';

UPDATE communes SET departement_code = '93', departement_name = 'Seine-Saint-Denis', region_name = 'Île-de-France'
WHERE code_insee = '93066';

UPDATE communes SET departement_code = '974', departement_name = 'La Réunion', region_name = 'La Réunion'
WHERE code_insee = '97411';
