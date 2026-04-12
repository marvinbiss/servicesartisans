-- Migration 420: Table des cours de marché CEE
-- Permet à l'admin de mettre à jour les prix classique/précarité sans redéployer.

CREATE TABLE IF NOT EXISTS cee_market_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  price_type text NOT NULL CHECK (price_type IN ('classique', 'precarite')),
  eur_per_mwhc numeric(8,2) NOT NULL CHECK (eur_per_mwhc > 0),
  source text,  -- ex: 'Emmy PNCEE', 'admin_manual'
  effective_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Seed avec les cours actuels
INSERT INTO cee_market_prices (price_type, eur_per_mwhc, source, effective_date)
VALUES
  ('classique', 9.00, 'Emmy PNCEE février 2026', '2026-02-01'),
  ('precarite', 16.00, 'Emmy PNCEE février 2026', '2026-02-01');

-- Index pour requête "cours le plus récent par type"
CREATE INDEX idx_cee_market_prices_latest
  ON cee_market_prices (price_type, effective_date DESC);

-- RLS : lecture publique (les cours CEE sont publics), écriture admin only
ALTER TABLE cee_market_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique cours CEE" ON cee_market_prices
  FOR SELECT USING (true);

CREATE POLICY "Écriture admin cours CEE" ON cee_market_prices
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = true
  ));
