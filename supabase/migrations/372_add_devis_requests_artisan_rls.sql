-- Fix P0 : Ajouter une policy SELECT pour les artisans sur devis_requests
-- Un artisan peut voir les devis_requests qui lui sont assignées via lead_assignments
-- Ref: migration 101 avait un commentaire "Artisans can view requests via API, not direct table access"
-- mais le JOIN depuis lead_assignments échoue silencieusement sans policy SELECT directe.

-- S'assurer que RLS est activé (idempotent)
ALTER TABLE devis_requests ENABLE ROW LEVEL SECURITY;

-- Policy : un artisan peut lire les devis_requests qui lui sont assignées
DROP POLICY IF EXISTS "Artisans can view assigned devis_requests" ON devis_requests;
CREATE POLICY "Artisans can view assigned devis_requests"
  ON devis_requests
  FOR SELECT
  USING (
    id IN (
      SELECT lead_id FROM lead_assignments
      WHERE provider_id IN (
        SELECT id FROM providers WHERE user_id = auth.uid()
      )
    )
  );
