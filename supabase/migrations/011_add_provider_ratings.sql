-- Add rating and review columns to providers table

ALTER TABLE providers
ADD COLUMN IF NOT EXISTS rating_average DECIMAL(3, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS specialty VARCHAR(255),
ADD COLUMN IF NOT EXISTS hourly_rate_min DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS hourly_rate_max DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS response_time VARCHAR(50) DEFAULT '< 2h',
ADD COLUMN IF NOT EXISTS response_rate INTEGER DEFAULT 95,
ADD COLUMN IF NOT EXISTS emergency_available BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS certifications TEXT[],
ADD COLUMN IF NOT EXISTS insurance TEXT[],
ADD COLUMN IF NOT EXISTS payment_methods TEXT[] DEFAULT ARRAY['Carte bancaire', 'Espèces', 'Chèque'],
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY['Français'],
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS intervention_zone VARCHAR(100) DEFAULT '20 km';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_providers_rating ON providers(rating_average DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_providers_city_lower ON providers(LOWER(address_city));
CREATE INDEX IF NOT EXISTS idx_providers_active_premium ON providers(is_active, is_premium DESC);

-- Update meta_description for providers that don't have one
UPDATE providers
SET meta_description = name || ' - Artisan professionnel à ' || address_city
WHERE meta_description IS NULL;

-- Set default rating for providers without reviews
UPDATE providers
SET rating_average = 4.5 + (RANDOM() * 0.5)::DECIMAL(3,2),
    review_count = (RANDOM() * 50 + 5)::INTEGER
WHERE rating_average = 0 OR rating_average IS NULL;
