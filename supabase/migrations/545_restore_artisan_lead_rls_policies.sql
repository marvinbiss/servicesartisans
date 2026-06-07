-- Migration 545: restore the artisan-side RLS policies on the lead flow.
--
-- Live incident 2026-06-07: an admin-dispatched lead (lead_assignments row
-- present, provider_id correct, providers.user_id linked) was invisible from
-- the artisan space — /api/artisan/leads returned 0 rows and the inbox showed
-- the "Complétez votre fiche" empty state. Reproduced with a real artisan
-- session: SELECT on lead_assignments, devis_requests and lead_events all
-- return 0 rows under RLS while service_role sees the data.
--
-- Same schema-drift family as migration 542 (providers owner UPDATE policy
-- missing in production): the policies below exist in the repo history
-- (103, 342, 370, 372) but are gone live. Idempotent re-creation.
--
-- Affects EVERY claimed artisan, not just the demo account.

ALTER TABLE public.lead_assignments ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.devis_requests ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;

-- 1. Artisans can view their own assignments (origin: migration 103)
DROP POLICY IF EXISTS lead_assignments_provider_select ON public.lead_assignments;

CREATE POLICY lead_assignments_provider_select
  ON public.lead_assignments FOR SELECT
  USING (
    provider_id IN (
      SELECT id FROM public.providers WHERE user_id = auth.uid()
    )
  );

-- 2. Artisans can update their own assignments (origin: migration 342,
--    'quoted' included in the allowed transitions)
DROP POLICY IF EXISTS lead_assignments_provider_update ON public.lead_assignments;

CREATE POLICY lead_assignments_provider_update
  ON public.lead_assignments FOR UPDATE
  USING (
    provider_id IN (
      SELECT id FROM public.providers WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    status IN ('viewed', 'quoted', 'declined')
  );

-- 3. Admins keep full access (origin: migration 103)
DROP POLICY IF EXISTS lead_assignments_admin_all ON public.lead_assignments;

CREATE POLICY lead_assignments_admin_all
  ON public.lead_assignments FOR ALL
  USING (is_admin());

-- 4. Artisans can read the devis_requests assigned to them (origin:
--    migration 372 — without it the join from lead_assignments comes back
--    with lead = null and the detail page 404s)
DROP POLICY IF EXISTS "Artisans can view assigned devis_requests" ON public.devis_requests;

CREATE POLICY "Artisans can view assigned devis_requests"
  ON public.devis_requests
  FOR SELECT
  USING (
    id IN (
      SELECT lead_id FROM public.lead_assignments
      WHERE provider_id IN (
        SELECT id FROM public.providers WHERE user_id = auth.uid()
      )
    )
  );

-- 5. Artisans can read their own lead events (origin: migration 370 —
--    powers /api/artisan/leads/[id]/history)
DROP POLICY IF EXISTS "Artisans can view own lead events" ON public.lead_events;

CREATE POLICY "Artisans can view own lead events"
  ON public.lead_events
  FOR SELECT
  USING (
    provider_id IN (
      SELECT id FROM public.providers WHERE user_id = auth.uid()
    )
  );
