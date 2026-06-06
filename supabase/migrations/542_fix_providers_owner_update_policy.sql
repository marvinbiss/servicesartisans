-- Migration 542: restore the owner UPDATE policy on providers.
--
-- Live incident 2026-06-06: every owner-side write from the artisan space
-- (profile editor, avatar_url, hourly rates, …) silently affected 0 rows —
-- UPDATE … RETURNING came back empty with no error, surfacing as PGRST116
-- ("Cannot coerce the result to a single JSON object") in
-- /api/artisan/provider. Migration 101 defines
-- "Artisans can update own provider" but it is missing in production
-- (schema drift). Idempotent re-creation.

DROP POLICY IF EXISTS "Artisans can update own provider" ON public.providers;
CREATE POLICY "Artisans can update own provider" ON public.providers
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
