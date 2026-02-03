-- Migration: Reviews & Trust Score System
-- Phase 4: World-Class Avis & Trust Score

-- Review media (photos/videos)
CREATE TABLE IF NOT EXISTS review_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    media_type VARCHAR(20) CHECK (media_type IN ('photo', 'video')),
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    is_approved BOOLEAN DEFAULT false,
    moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    moderation_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sentiment analysis results
CREATE TABLE IF NOT EXISTS review_sentiment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE UNIQUE,
    sentiment_score DECIMAL(4,3) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
    sentiment_label VARCHAR(20) CHECK (sentiment_label IN ('positive', 'neutral', 'negative', 'mixed')),
    keywords TEXT[],
    topics JSONB, -- {quality: 0.8, price: 0.6, punctuality: 0.9}
    confidence DECIMAL(4,3) CHECK (confidence >= 0 AND confidence <= 1),
    language VARCHAR(10) DEFAULT 'fr',
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Authenticity scoring
CREATE TABLE IF NOT EXISTS review_authenticity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE UNIQUE,
    authenticity_score INTEGER CHECK (authenticity_score >= 0 AND authenticity_score <= 100),
    verified_booking BOOLEAN DEFAULT false,
    booking_id UUID,
    booking_completion_date DATE,
    flags JSONB, -- {suspected_fake: false, unusual_pattern: false, verified_purchase: true}
    risk_factors TEXT[],
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trust badges for artisans
CREATE TABLE IF NOT EXISTS trust_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id UUID NOT NULL,
    badge_type VARCHAR(50) NOT NULL CHECK (badge_type IN ('bronze', 'silver', 'gold', 'platinum', 'top_rated', 'quick_responder', 'verified_expert', 'eco_friendly')),
    badge_name VARCHAR(100) NOT NULL,
    badge_description TEXT,
    criteria_met JSONB, -- {reviews: 50, rating: 4.5, response_rate: 95}
    awarded_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);

-- Response metrics for artisans
CREATE TABLE IF NOT EXISTS response_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id UUID NOT NULL UNIQUE,
    avg_response_time_hours DECIMAL(6,2),
    median_response_time_hours DECIMAL(6,2),
    response_rate DECIMAL(5,2) CHECK (response_rate >= 0 AND response_rate <= 100),
    total_reviews INTEGER DEFAULT 0,
    reviews_with_response INTEGER DEFAULT 0,
    avg_response_length INTEGER,
    last_response_at TIMESTAMPTZ,
    last_calculated TIMESTAMPTZ DEFAULT NOW()
);

-- Review response templates
CREATE TABLE IF NOT EXISTS review_response_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id UUID NOT NULL,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general' CHECK (category IN ('general', 'positive', 'negative', 'neutral')),
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhance reviews table with new columns
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS authenticity_score INTEGER DEFAULT 0 CHECK (authenticity_score >= 0 AND authenticity_score <= 100),
ADD COLUMN IF NOT EXISTS sentiment_score DECIMAL(4,3),
ADD COLUMN IF NOT EXISTS keywords TEXT[],
ADD COLUMN IF NOT EXISTS has_media BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_verified_purchase BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS booking_id UUID,
ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reported_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS response_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS response_text TEXT;

-- Enhance providers table with trust-related columns
ALTER TABLE providers
ADD COLUMN IF NOT EXISTS trust_badge VARCHAR(20) DEFAULT 'none' CHECK (trust_badge IN ('none', 'bronze', 'silver', 'gold', 'platinum')),
ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
ADD COLUMN IF NOT EXISTS avg_response_time_hours DECIMAL(6,2),
ADD COLUMN IF NOT EXISTS response_rate DECIMAL(5,2) DEFAULT 0 CHECK (response_rate >= 0 AND response_rate <= 100),
ADD COLUMN IF NOT EXISTS rating_average DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS years_on_platform INTEGER DEFAULT 0;

-- Function to calculate trust badge
CREATE OR REPLACE FUNCTION calculate_trust_badge(
    p_review_count INTEGER,
    p_rating_average DECIMAL,
    p_response_rate DECIMAL,
    p_years_on_platform INTEGER
) RETURNS VARCHAR(20) AS $$
BEGIN
    -- Platinum: 100+ reviews, 4.8+ rating, 98%+ response, 5+ years
    IF p_review_count >= 100 AND p_rating_average >= 4.8 AND p_response_rate >= 98 AND p_years_on_platform >= 5 THEN
        RETURN 'platinum';
    -- Gold: 50+ reviews, 4.5+ rating, 95%+ response, 3+ years
    ELSIF p_review_count >= 50 AND p_rating_average >= 4.5 AND p_response_rate >= 95 AND p_years_on_platform >= 3 THEN
        RETURN 'gold';
    -- Silver: 25+ reviews, 4.0+ rating, 90%+ response, 1+ year
    ELSIF p_review_count >= 25 AND p_rating_average >= 4.0 AND p_response_rate >= 90 AND p_years_on_platform >= 1 THEN
        RETURN 'silver';
    -- Bronze: 10+ reviews, 3.5+ rating, verified identity
    ELSIF p_review_count >= 10 AND p_rating_average >= 3.5 THEN
        RETURN 'bronze';
    ELSE
        RETURN 'none';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update provider ratings and trust
CREATE OR REPLACE FUNCTION update_provider_trust_metrics()
RETURNS TRIGGER AS $$
DECLARE
    v_provider_id UUID;
    v_rating_avg DECIMAL;
    v_review_cnt INTEGER;
    v_response_rate DECIMAL;
    v_years INTEGER;
    v_badge VARCHAR(20);
BEGIN
    -- Get the provider ID from the review
    IF TG_OP = 'DELETE' THEN
        v_provider_id := OLD.provider_id;
    ELSE
        v_provider_id := NEW.provider_id;
    END IF;

    -- Calculate new averages
    SELECT
        COALESCE(AVG(rating), 0),
        COUNT(*),
        COALESCE(
            (COUNT(*) FILTER (WHERE response_text IS NOT NULL)::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
            0
        )
    INTO v_rating_avg, v_review_cnt, v_response_rate
    FROM reviews
    WHERE provider_id = v_provider_id AND is_visible = true;

    -- Get years on platform
    SELECT EXTRACT(YEAR FROM AGE(NOW(), created_at))::INTEGER
    INTO v_years
    FROM providers WHERE id = v_provider_id;

    -- Calculate badge
    v_badge := calculate_trust_badge(v_review_cnt, v_rating_avg, v_response_rate, COALESCE(v_years, 0));

    -- Update provider
    UPDATE providers SET
        rating_average = v_rating_avg,
        review_count = v_review_cnt,
        response_rate = v_response_rate,
        trust_badge = v_badge,
        trust_score = LEAST(100, (v_rating_avg * 15 + v_response_rate * 0.3 + LEAST(v_review_cnt, 100) * 0.2)::INTEGER),
        years_on_platform = COALESCE(v_years, 0)
    WHERE id = v_provider_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating provider trust metrics
DROP TRIGGER IF EXISTS trigger_update_provider_trust ON reviews;
CREATE TRIGGER trigger_update_provider_trust
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_provider_trust_metrics();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_review_media_review ON review_media(review_id);
CREATE INDEX IF NOT EXISTS idx_review_sentiment_review ON review_sentiment(review_id);
CREATE INDEX IF NOT EXISTS idx_review_authenticity_review ON review_authenticity(review_id);
CREATE INDEX IF NOT EXISTS idx_trust_badges_artisan ON trust_badges(artisan_id);
CREATE INDEX IF NOT EXISTS idx_trust_badges_type ON trust_badges(badge_type) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_response_metrics_artisan ON response_metrics(artisan_id);
CREATE INDEX IF NOT EXISTS idx_reviews_provider_rating ON reviews(provider_id, rating) WHERE is_visible = true;
CREATE INDEX IF NOT EXISTS idx_providers_trust ON providers(trust_badge, trust_score DESC);

-- RLS Policies for review_media
ALTER TABLE review_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved review media" ON review_media
FOR SELECT USING (is_approved = true OR moderation_status = 'approved');

CREATE POLICY "Review authors can insert media" ON review_media
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM reviews r
        JOIN profiles p ON p.id = auth.uid()
        WHERE r.id = review_media.review_id
        AND (r.author_name = p.full_name OR r.user_id = auth.uid())
    )
);

-- RLS Policies for review_sentiment (read-only for users)
ALTER TABLE review_sentiment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sentiment analysis" ON review_sentiment
FOR SELECT USING (true);

-- RLS Policies for review_authenticity (read-only for users)
ALTER TABLE review_authenticity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view authenticity scores" ON review_authenticity
FOR SELECT USING (true);

-- RLS Policies for trust_badges
ALTER TABLE trust_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active trust badges" ON trust_badges
FOR SELECT USING (is_active = true);

-- RLS Policies for response_metrics
ALTER TABLE response_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view response metrics" ON response_metrics
FOR SELECT USING (true);

-- RLS Policies for review_response_templates
ALTER TABLE review_response_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artisans can view their own templates" ON review_response_templates
FOR SELECT USING (artisan_id = auth.uid());

CREATE POLICY "Artisans can manage their own templates" ON review_response_templates
FOR ALL USING (artisan_id = auth.uid());

-- Update existing providers with calculated ratings
UPDATE providers p SET
    rating_average = COALESCE(sub.avg_rating, 0),
    review_count = COALESCE(sub.cnt, 0)
FROM (
    SELECT
        provider_id,
        AVG(rating) as avg_rating,
        COUNT(*) as cnt
    FROM reviews
    WHERE is_visible = true
    GROUP BY provider_id
) sub
WHERE p.id = sub.provider_id;
