-- Migration: Expand geography columns for full names
-- Purpose: Allow storing full region and department names instead of just codes
-- Date: 2026-02-01

-- Expand address_department from varchar(3) to varchar(50)
ALTER TABLE providers ALTER COLUMN address_department TYPE varchar(50);

-- Expand address_region from varchar(50) to varchar(50) (if not already)
ALTER TABLE providers ALTER COLUMN address_region TYPE varchar(50);

-- Add comments
COMMENT ON COLUMN providers.address_department IS 'Full department name (e.g., "Seine-Saint-Denis")';
COMMENT ON COLUMN providers.address_region IS 'Full region name (e.g., "Île-de-France")';
