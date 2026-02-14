-- =============================================================================
-- FIX: is_admin() SECURITY DEFINER — restrict execution to authenticated users
-- ServicesArtisans — 2026-02-14
-- =============================================================================
-- Problem: is_admin() is defined as SECURITY DEFINER (runs with owner privileges)
-- but was callable by PUBLIC (including anon role). This means unauthenticated
-- users could potentially call is_admin() and bypass RLS policies that depend on it.
--
-- Fix: Revoke EXECUTE from PUBLIC, grant only to authenticated role.
-- =============================================================================

-- Revoke from PUBLIC (includes anon)
REVOKE EXECUTE ON FUNCTION is_admin() FROM PUBLIC;

-- Grant only to authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
