-- Migration 419 — Drop unused indexes
-- 
-- Audit 2026-04-12: 546 total indexes, 233 unused non-constraint indexes
-- wasting 422 MB of storage and slowing writes/WAL.
-- 
-- Rules applied:
--   - NO primary keys dropped
--   - NO unique constraint indexes dropped
--   - NO indexes created in last 7 days (migrations 412-418)
--   - NO indexes referenced in application code
--   - DROP INDEX IF EXISTS for safety
-- 
-- Total indexes dropped: 230
-- Estimated space reclaimed: 422.2 MB

BEGIN;

-- ══════════════════════════════════════════════
-- Table: providers (12 indexes, 373.4 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 143 MB
-- Was: CREATE INDEX idx_providers_location_gist ON public.providers USING gist (location)
DROP INDEX IF EXISTS idx_providers_location_gist;

-- 0 scans since stats reset, not a constraint, size: 58 MB
-- Was: CREATE INDEX idx_providers_location ON public.providers USING btree (latitude, longitude)
DROP INDEX IF EXISTS idx_providers_location;

-- 0 scans since stats reset, not a constraint, size: 46 MB
-- Was: CREATE INDEX idx_providers_search_vector ON public.providers USING gin (search_vector)
DROP INDEX IF EXISTS idx_providers_search_vector;

-- 0 scans since stats reset, not a constraint, size: 40 MB
-- Was: CREATE INDEX idx_providers_quality_zero ON public.providers USING btree (id) WHERE ((data_quality_score = 0) AND (is_artisan = true))
DROP INDEX IF EXISTS idx_providers_quality_zero;

-- 0 scans since stats reset, not a constraint, size: 26 MB
-- Was: CREATE INDEX idx_providers_rge_qualifications_gin ON public.providers USING gin (rge_qualifications) WHERE (rge_qualifications IS NOT NULL)
DROP INDEX IF EXISTS idx_providers_rge_qualifications_gin;

-- 0 scans since stats reset, not a constraint, size: 18 MB
-- Was: CREATE INDEX idx_providers_department ON public.providers USING btree (address_department)
DROP INDEX IF EXISTS idx_providers_department;

-- 0 scans since stats reset, not a constraint, size: 13 MB
-- Was: CREATE INDEX idx_providers_city_lower ON public.providers USING btree (lower((address_city)::text))
DROP INDEX IF EXISTS idx_providers_city_lower;

-- Exact duplicate of idx_providers_city_lower (same definition: btree(lower(address_city)))
-- Was: CREATE INDEX idx_providers_city_unaccent ON public.providers USING btree (lower((address_city)::text))
DROP INDEX IF EXISTS idx_providers_city_unaccent;

-- 0 scans since stats reset, not a constraint, size: 13 MB
-- Was: CREATE INDEX idx_providers_postal_prefix ON public.providers USING btree ("left"((address_postal_code)::text, 2))
DROP INDEX IF EXISTS idx_providers_postal_prefix;

-- 0 scans since stats reset, not a constraint, size: 2888 kB
-- Was: CREATE INDEX idx_providers_rge_categories_decret ON public.providers USING gin (rge_categories_decret) WHERE (cardinality(rge_categories_decret) > 0)
DROP INDEX IF EXISTS idx_providers_rge_categories_decret;

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX idx_providers_last_lead_assigned ON public.providers USING btree (last_lead_assigned_at) WHERE (last_lead_assigned_at IS NOT NULL)
DROP INDEX IF EXISTS idx_providers_last_lead_assigned;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_providers_radiated ON public.providers USING btree (date_radiation) WHERE (date_radiation IS NOT NULL)
DROP INDEX IF EXISTS idx_providers_radiated;

-- ══════════════════════════════════════════════
-- Table: googlebot_logs (1 indexes, 26.2 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 26 MB
-- Was: CREATE INDEX idx_googlebot_logs_url ON public.googlebot_logs USING btree (url)
DROP INDEX IF EXISTS idx_googlebot_logs_url;

-- ══════════════════════════════════════════════
-- Table: communes (3 indexes, 8.4 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 6696 kB
-- Was: CREATE INDEX idx_communes_geo ON public.communes USING gist (geo) WHERE (geo IS NOT NULL)
DROP INDEX IF EXISTS idx_communes_geo;

-- 0 scans since stats reset, not a constraint, size: 1816 kB
-- Was: CREATE INDEX idx_communes_dept_pop ON public.communes USING btree (departement_code, population DESC) WHERE (is_active = true)
DROP INDEX IF EXISTS idx_communes_dept_pop;

-- 0 scans since stats reset, not a constraint, size: 128 kB
-- Was: CREATE INDEX idx_communes_with_providers ON public.communes USING btree (provider_count) WHERE ((is_active = true) AND (provider_count > 0))
DROP INDEX IF EXISTS idx_communes_with_providers;

-- ══════════════════════════════════════════════
-- Table: analytics_events (3 indexes, 4.6 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 2112 kB
-- Was: CREATE INDEX idx_analytics_events_page_path ON public.analytics_events USING btree (page_path, created_at DESC) WHERE (page_path IS NOT NULL)
DROP INDEX IF EXISTS idx_analytics_events_page_path;

-- 0 scans since stats reset, not a constraint, size: 1504 kB
-- Was: CREATE INDEX idx_analytics_events_session_pages ON public.analytics_events USING btree (session_id, created_at) WHERE ((event_type = 'page_view'::text) AND (session_id IS NOT NULL))
DROP INDEX IF EXISTS idx_analytics_events_session_pages;

-- 0 scans since stats reset, not a constraint, size: 1080 kB
-- Was: CREATE INDEX idx_analytics_events_visitor ON public.analytics_events USING btree (visitor_id, created_at DESC) WHERE (visitor_id IS NOT NULL)
DROP INDEX IF EXISTS idx_analytics_events_visitor;

-- ══════════════════════════════════════════════
-- Table: barometre_stats (1 indexes, 4.3 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 4424 kB
-- Was: CREATE INDEX idx_barometre_stats_dept ON public.barometre_stats USING btree (departement_code) WHERE (departement_code IS NOT NULL)
DROP INDEX IF EXISTS idx_barometre_stats_dept;

-- ══════════════════════════════════════════════
-- Table: locations (4 indexes, 3.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 1384 kB
-- Was: CREATE INDEX idx_locations_coords ON public.locations USING btree (latitude, longitude)
DROP INDEX IF EXISTS idx_locations_coords;

-- Duplicate of unique constraint: locations_insee_code_key covers this
-- Was: CREATE INDEX idx_locations_insee ON public.locations USING btree (insee_code)
DROP INDEX IF EXISTS idx_locations_insee;

-- 0 scans since stats reset, not a constraint, size: 584 kB
-- Was: CREATE INDEX idx_locations_postal ON public.locations USING btree (postal_code)
DROP INDEX IF EXISTS idx_locations_postal;

-- 0 scans since stats reset, not a constraint, size: 280 kB
-- Was: CREATE INDEX idx_locations_department ON public.locations USING btree (department_code)
DROP INDEX IF EXISTS idx_locations_department;

-- ══════════════════════════════════════════════
-- Table: provider_services (2 indexes, 0.2 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 144 kB
-- Was: CREATE INDEX idx_provider_services_provider ON public.provider_services USING btree (provider_id)
DROP INDEX IF EXISTS idx_provider_services_provider;

-- 0 scans since stats reset, not a constraint, size: 48 kB
-- Was: CREATE INDEX idx_provider_services_service ON public.provider_services USING btree (service_id)
DROP INDEX IF EXISTS idx_provider_services_service;

-- ══════════════════════════════════════════════
-- Table: cms_pages (5 indexes, 0.2 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 120 kB
-- Was: CREATE INDEX cms_pages_title_trgm_idx ON public.cms_pages USING gin (title gin_trgm_ops)
DROP INDEX IF EXISTS cms_pages_title_trgm_idx;

-- 0 scans since stats reset, not a constraint, size: 24 kB
-- Was: CREATE INDEX cms_pages_tags_idx ON public.cms_pages USING gin (tags)
DROP INDEX IF EXISTS cms_pages_tags_idx;

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX cms_pages_type_idx ON public.cms_pages USING btree (page_type)
DROP INDEX IF EXISTS cms_pages_type_idx;

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX cms_pages_slug_idx ON public.cms_pages USING btree (slug)
DROP INDEX IF EXISTS cms_pages_slug_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX cms_pages_published_idx ON public.cms_pages USING btree (published_at DESC) WHERE (status = 'published'::text)
DROP INDEX IF EXISTS cms_pages_published_idx;

-- ══════════════════════════════════════════════
-- Table: prospection_contacts (6 indexes, 0.1 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 24 kB
-- Was: CREATE INDEX prosp_contacts_tags_idx ON public.prospection_contacts USING gin (tags)
DROP INDEX IF EXISTS prosp_contacts_tags_idx;

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX prosp_contacts_type_idx ON public.prospection_contacts USING btree (contact_type)
DROP INDEX IF EXISTS prosp_contacts_type_idx;

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX prosp_contacts_dept_idx ON public.prospection_contacts USING btree (department)
DROP INDEX IF EXISTS prosp_contacts_dept_idx;

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX prosp_contacts_active_idx ON public.prospection_contacts USING btree (is_active, contact_type)
DROP INDEX IF EXISTS prosp_contacts_active_idx;

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX prosp_contacts_name_idx ON public.prospection_contacts USING btree (contact_name) WHERE (contact_name IS NOT NULL)
DROP INDEX IF EXISTS prosp_contacts_name_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prosp_contacts_company_idx ON public.prospection_contacts USING btree (company_name) WHERE (company_name IS NOT NULL)
DROP INDEX IF EXISTS prosp_contacts_company_idx;

-- ══════════════════════════════════════════════
-- Table: reviews (1 indexes, 0.1 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 88 kB
-- Was: CREATE INDEX idx_reviews_rating ON public.reviews USING btree (rating)
DROP INDEX IF EXISTS idx_reviews_rating;

-- ══════════════════════════════════════════════
-- Table: leads (5 indexes, 0.1 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX idx_leads_service ON public.leads USING btree (service_id)
DROP INDEX IF EXISTS idx_leads_service;

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX idx_leads_location ON public.leads USING btree (location_id)
DROP INDEX IF EXISTS idx_leads_location;

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX leads_client_user_id_idx ON public.leads USING btree (client_user_id)
DROP INDEX IF EXISTS leads_client_user_id_idx;

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX idx_leads_status ON public.leads USING btree (status)
DROP INDEX IF EXISTS idx_leads_status;

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX idx_leads_created ON public.leads USING btree (created_at)
DROP INDEX IF EXISTS idx_leads_created;

-- ══════════════════════════════════════════════
-- Table: cee_operations (4 indexes, 0.1 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 24 kB
-- Was: CREATE INDEX idx_cee_operations_rge_gin ON public.cee_operations USING gin (rge_qualifications_requises)
DROP INDEX IF EXISTS idx_cee_operations_rge_gin;

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX idx_cee_operations_rge_status ON public.cee_operations USING btree (rge_requirement_status) WHERE (is_active = true)
DROP INDEX IF EXISTS idx_cee_operations_rge_status;

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX idx_cee_operations_rge_decret_category ON public.cee_operations USING gin (rge_decret_category) WHERE (is_active = true)
DROP INDEX IF EXISTS idx_cee_operations_rge_decret_category;

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX idx_cee_operations_precarite ON public.cee_operations USING btree (secteur, domaine) WHERE ((precarite_eligible = true) AND (is_active = true))
DROP INDEX IF EXISTS idx_cee_operations_precarite;

-- ══════════════════════════════════════════════
-- Table: cee_delegataires (2 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 24 kB
-- Was: CREATE INDEX idx_cee_delegataires_secteurs_gin ON public.cee_delegataires USING gin (secteurs_couverts)
DROP INDEX IF EXISTS idx_cee_delegataires_secteurs_gin;

-- 0 scans since stats reset, not a constraint, size: 24 kB
-- Was: CREATE INDEX idx_cee_delegataires_operations_gin ON public.cee_delegataires USING gin (operations_supportees)
DROP INDEX IF EXISTS idx_cee_delegataires_operations_gin;

-- ══════════════════════════════════════════════
-- Table: prospection_messages_2026_02 (4 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX prospection_messages_2026_02_campaign_id_status_idx ON public.prospection_messages_2026_02 USING btree (campaign_id, status)
DROP INDEX IF EXISTS prospection_messages_2026_02_campaign_id_status_idx;

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX prospection_messages_2026_02_contact_id_idx ON public.prospection_messages_2026_02 USING btree (contact_id)
DROP INDEX IF EXISTS prospection_messages_2026_02_contact_id_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_02_next_retry_at_idx ON public.prospection_messages_2026_02 USING btree (next_retry_at) WHERE ((status = 'failed'::text) AND (retry_count < max_retries))
DROP INDEX IF EXISTS prospection_messages_2026_02_next_retry_at_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_02_external_id_idx ON public.prospection_messages_2026_02 USING btree (external_id) WHERE (external_id IS NOT NULL)
DROP INDEX IF EXISTS prospection_messages_2026_02_external_id_idx;

-- ══════════════════════════════════════════════
-- Table: prospection_campaigns (3 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX prosp_campaigns_status_idx ON public.prospection_campaigns USING btree (status)
DROP INDEX IF EXISTS prosp_campaigns_status_idx;

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX prosp_campaigns_status_created_idx ON public.prospection_campaigns USING btree (status, created_at DESC)
DROP INDEX IF EXISTS prosp_campaigns_status_created_idx;

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX prosp_campaigns_channel_idx ON public.prospection_campaigns USING btree (channel, audience_type)
DROP INDEX IF EXISTS prosp_campaigns_channel_idx;

-- ══════════════════════════════════════════════
-- Table: cee_dossiers (5 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_cee_dossiers_provider_id ON public.cee_dossiers USING btree (provider_id)
DROP INDEX IF EXISTS idx_cee_dossiers_provider_id;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_cee_dossiers_delegataire_id ON public.cee_dossiers USING btree (delegataire_id) WHERE (delegataire_id IS NOT NULL)
DROP INDEX IF EXISTS idx_cee_dossiers_delegataire_id;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_cee_dossiers_operation_code ON public.cee_dossiers USING btree (operation_code)
DROP INDEX IF EXISTS idx_cee_dossiers_operation_code;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_cee_dossiers_date_engagement ON public.cee_dossiers USING btree (date_engagement) WHERE (date_engagement IS NOT NULL)
DROP INDEX IF EXISTS idx_cee_dossiers_date_engagement;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_cee_dossiers_client_id ON public.cee_dossiers USING btree (client_id) WHERE (client_id IS NOT NULL)
DROP INDEX IF EXISTS idx_cee_dossiers_client_id;

-- ══════════════════════════════════════════════
-- Table: bookings (5 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_bookings_provider ON public.bookings USING btree (provider_id)
DROP INDEX IF EXISTS idx_bookings_provider;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_bookings_status ON public.bookings USING btree (status)
DROP INDEX IF EXISTS idx_bookings_status;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_bookings_provider_date ON public.bookings USING btree (provider_id, scheduled_date, status)
DROP INDEX IF EXISTS idx_bookings_provider_date;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_bookings_provider_status ON public.bookings USING btree (provider_id, status)
DROP INDEX IF EXISTS idx_bookings_provider_status;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_bookings_scheduled_date ON public.bookings USING btree (scheduled_date)
DROP INDEX IF EXISTS idx_bookings_scheduled_date;

-- ══════════════════════════════════════════════
-- Table: services (2 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX idx_services_active ON public.services USING btree (is_active)
DROP INDEX IF EXISTS idx_services_active;

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX idx_services_parent ON public.services USING btree (parent_id)
DROP INDEX IF EXISTS idx_services_parent;

-- ══════════════════════════════════════════════
-- Table: prospection_list_members (2 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX prosp_list_members_list_idx ON public.prospection_list_members USING btree (list_id)
DROP INDEX IF EXISTS prosp_list_members_list_idx;

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX prosp_list_members_contact_idx ON public.prospection_list_members USING btree (contact_id)
DROP INDEX IF EXISTS prosp_list_members_contact_idx;

-- ══════════════════════════════════════════════
-- Table: sitemap_snapshots (2 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX idx_snapshots_active ON public.sitemap_snapshots USING btree (status) WHERE (status = 'active'::text)
DROP INDEX IF EXISTS idx_snapshots_active;

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX idx_snapshots_status ON public.sitemap_snapshots USING btree (status)
DROP INDEX IF EXISTS idx_snapshots_status;

-- ══════════════════════════════════════════════
-- Table: provider_removal_requests (2 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX idx_removal_requests_provider ON public.provider_removal_requests USING btree (provider_id)
DROP INDEX IF EXISTS idx_removal_requests_provider;

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX idx_removal_requests_email ON public.provider_removal_requests USING btree (requester_email)
DROP INDEX IF EXISTS idx_removal_requests_email;

-- ══════════════════════════════════════════════
-- Table: notification_logs (4 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- Exact duplicate of idx_notification_logs_booking (same column: booking_id)
-- Was: CREATE INDEX idx_notification_logs_booking_id ON public.notification_logs USING btree (booking_id)
DROP INDEX IF EXISTS idx_notification_logs_booking_id;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_notification_logs_sent_at ON public.notification_logs USING btree (sent_at DESC)
DROP INDEX IF EXISTS idx_notification_logs_sent_at;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_notification_logs_booking ON public.notification_logs USING btree (booking_id)
DROP INDEX IF EXISTS idx_notification_logs_booking;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_notification_logs_type ON public.notification_logs USING btree (type)
DROP INDEX IF EXISTS idx_notification_logs_type;

-- ══════════════════════════════════════════════
-- Table: prospection_messages_2026_04 (4 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_04_campaign_id_status_idx ON public.prospection_messages_2026_04 USING btree (campaign_id, status)
DROP INDEX IF EXISTS prospection_messages_2026_04_campaign_id_status_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_04_contact_id_idx ON public.prospection_messages_2026_04 USING btree (contact_id)
DROP INDEX IF EXISTS prospection_messages_2026_04_contact_id_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_04_external_id_idx ON public.prospection_messages_2026_04 USING btree (external_id) WHERE (external_id IS NOT NULL)
DROP INDEX IF EXISTS prospection_messages_2026_04_external_id_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_04_next_retry_at_idx ON public.prospection_messages_2026_04 USING btree (next_retry_at) WHERE ((status = 'failed'::text) AND (retry_count < max_retries))
DROP INDEX IF EXISTS prospection_messages_2026_04_next_retry_at_idx;

-- ══════════════════════════════════════════════
-- Table: prospection_messages_2026_05 (4 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_05_campaign_id_status_idx ON public.prospection_messages_2026_05 USING btree (campaign_id, status)
DROP INDEX IF EXISTS prospection_messages_2026_05_campaign_id_status_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_05_contact_id_idx ON public.prospection_messages_2026_05 USING btree (contact_id)
DROP INDEX IF EXISTS prospection_messages_2026_05_contact_id_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_05_external_id_idx ON public.prospection_messages_2026_05 USING btree (external_id) WHERE (external_id IS NOT NULL)
DROP INDEX IF EXISTS prospection_messages_2026_05_external_id_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_05_next_retry_at_idx ON public.prospection_messages_2026_05 USING btree (next_retry_at) WHERE ((status = 'failed'::text) AND (retry_count < max_retries))
DROP INDEX IF EXISTS prospection_messages_2026_05_next_retry_at_idx;

-- ══════════════════════════════════════════════
-- Table: prospection_messages_2026_06 (4 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_06_campaign_id_status_idx ON public.prospection_messages_2026_06 USING btree (campaign_id, status)
DROP INDEX IF EXISTS prospection_messages_2026_06_campaign_id_status_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_06_contact_id_idx ON public.prospection_messages_2026_06 USING btree (contact_id)
DROP INDEX IF EXISTS prospection_messages_2026_06_contact_id_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_06_external_id_idx ON public.prospection_messages_2026_06 USING btree (external_id) WHERE (external_id IS NOT NULL)
DROP INDEX IF EXISTS prospection_messages_2026_06_external_id_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_06_next_retry_at_idx ON public.prospection_messages_2026_06 USING btree (next_retry_at) WHERE ((status = 'failed'::text) AND (retry_count < max_retries))
DROP INDEX IF EXISTS prospection_messages_2026_06_next_retry_at_idx;

-- ══════════════════════════════════════════════
-- Table: prospection_messages_2026_07 (4 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_07_campaign_id_status_idx ON public.prospection_messages_2026_07 USING btree (campaign_id, status)
DROP INDEX IF EXISTS prospection_messages_2026_07_campaign_id_status_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_07_contact_id_idx ON public.prospection_messages_2026_07 USING btree (contact_id)
DROP INDEX IF EXISTS prospection_messages_2026_07_contact_id_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_07_external_id_idx ON public.prospection_messages_2026_07 USING btree (external_id) WHERE (external_id IS NOT NULL)
DROP INDEX IF EXISTS prospection_messages_2026_07_external_id_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_07_next_retry_at_idx ON public.prospection_messages_2026_07 USING btree (next_retry_at) WHERE ((status = 'failed'::text) AND (retry_count < max_retries))
DROP INDEX IF EXISTS prospection_messages_2026_07_next_retry_at_idx;

-- ══════════════════════════════════════════════
-- Table: prospection_messages_2026_08 (4 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_08_campaign_id_status_idx ON public.prospection_messages_2026_08 USING btree (campaign_id, status)
DROP INDEX IF EXISTS prospection_messages_2026_08_campaign_id_status_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_08_contact_id_idx ON public.prospection_messages_2026_08 USING btree (contact_id)
DROP INDEX IF EXISTS prospection_messages_2026_08_contact_id_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_08_external_id_idx ON public.prospection_messages_2026_08 USING btree (external_id) WHERE (external_id IS NOT NULL)
DROP INDEX IF EXISTS prospection_messages_2026_08_external_id_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_08_next_retry_at_idx ON public.prospection_messages_2026_08 USING btree (next_retry_at) WHERE ((status = 'failed'::text) AND (retry_count < max_retries))
DROP INDEX IF EXISTS prospection_messages_2026_08_next_retry_at_idx;

-- ══════════════════════════════════════════════
-- Table: prospection_messages_2026_09 (4 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_09_campaign_id_status_idx ON public.prospection_messages_2026_09 USING btree (campaign_id, status)
DROP INDEX IF EXISTS prospection_messages_2026_09_campaign_id_status_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_09_contact_id_idx ON public.prospection_messages_2026_09 USING btree (contact_id)
DROP INDEX IF EXISTS prospection_messages_2026_09_contact_id_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_09_external_id_idx ON public.prospection_messages_2026_09 USING btree (external_id) WHERE (external_id IS NOT NULL)
DROP INDEX IF EXISTS prospection_messages_2026_09_external_id_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_09_next_retry_at_idx ON public.prospection_messages_2026_09 USING btree (next_retry_at) WHERE ((status = 'failed'::text) AND (retry_count < max_retries))
DROP INDEX IF EXISTS prospection_messages_2026_09_next_retry_at_idx;

-- ══════════════════════════════════════════════
-- Table: prospection_messages_2026_10 (4 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_10_campaign_id_status_idx ON public.prospection_messages_2026_10 USING btree (campaign_id, status)
DROP INDEX IF EXISTS prospection_messages_2026_10_campaign_id_status_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_10_contact_id_idx ON public.prospection_messages_2026_10 USING btree (contact_id)
DROP INDEX IF EXISTS prospection_messages_2026_10_contact_id_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_10_external_id_idx ON public.prospection_messages_2026_10 USING btree (external_id) WHERE (external_id IS NOT NULL)
DROP INDEX IF EXISTS prospection_messages_2026_10_external_id_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_10_next_retry_at_idx ON public.prospection_messages_2026_10 USING btree (next_retry_at) WHERE ((status = 'failed'::text) AND (retry_count < max_retries))
DROP INDEX IF EXISTS prospection_messages_2026_10_next_retry_at_idx;

-- ══════════════════════════════════════════════
-- Table: prospection_messages_2026_11 (4 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_11_campaign_id_status_idx ON public.prospection_messages_2026_11 USING btree (campaign_id, status)
DROP INDEX IF EXISTS prospection_messages_2026_11_campaign_id_status_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_11_contact_id_idx ON public.prospection_messages_2026_11 USING btree (contact_id)
DROP INDEX IF EXISTS prospection_messages_2026_11_contact_id_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_11_external_id_idx ON public.prospection_messages_2026_11 USING btree (external_id) WHERE (external_id IS NOT NULL)
DROP INDEX IF EXISTS prospection_messages_2026_11_external_id_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_11_next_retry_at_idx ON public.prospection_messages_2026_11 USING btree (next_retry_at) WHERE ((status = 'failed'::text) AND (retry_count < max_retries))
DROP INDEX IF EXISTS prospection_messages_2026_11_next_retry_at_idx;

-- ══════════════════════════════════════════════
-- Table: prospection_messages_2026_12 (4 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_12_campaign_id_status_idx ON public.prospection_messages_2026_12 USING btree (campaign_id, status)
DROP INDEX IF EXISTS prospection_messages_2026_12_campaign_id_status_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_12_contact_id_idx ON public.prospection_messages_2026_12 USING btree (contact_id)
DROP INDEX IF EXISTS prospection_messages_2026_12_contact_id_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_12_external_id_idx ON public.prospection_messages_2026_12 USING btree (external_id) WHERE (external_id IS NOT NULL)
DROP INDEX IF EXISTS prospection_messages_2026_12_external_id_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_12_next_retry_at_idx ON public.prospection_messages_2026_12 USING btree (next_retry_at) WHERE ((status = 'failed'::text) AND (retry_count < max_retries))
DROP INDEX IF EXISTS prospection_messages_2026_12_next_retry_at_idx;

-- ══════════════════════════════════════════════
-- Table: prospection_messages_2027_01 (4 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2027_01_campaign_id_status_idx ON public.prospection_messages_2027_01 USING btree (campaign_id, status)
DROP INDEX IF EXISTS prospection_messages_2027_01_campaign_id_status_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2027_01_contact_id_idx ON public.prospection_messages_2027_01 USING btree (contact_id)
DROP INDEX IF EXISTS prospection_messages_2027_01_contact_id_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2027_01_external_id_idx ON public.prospection_messages_2027_01 USING btree (external_id) WHERE (external_id IS NOT NULL)
DROP INDEX IF EXISTS prospection_messages_2027_01_external_id_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2027_01_next_retry_at_idx ON public.prospection_messages_2027_01 USING btree (next_retry_at) WHERE ((status = 'failed'::text) AND (retry_count < max_retries))
DROP INDEX IF EXISTS prospection_messages_2027_01_next_retry_at_idx;

-- ══════════════════════════════════════════════
-- Table: prospection_messages_2026_03 (4 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_03_campaign_id_status_idx ON public.prospection_messages_2026_03 USING btree (campaign_id, status)
DROP INDEX IF EXISTS prospection_messages_2026_03_campaign_id_status_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_03_contact_id_idx ON public.prospection_messages_2026_03 USING btree (contact_id)
DROP INDEX IF EXISTS prospection_messages_2026_03_contact_id_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_03_external_id_idx ON public.prospection_messages_2026_03 USING btree (external_id) WHERE (external_id IS NOT NULL)
DROP INDEX IF EXISTS prospection_messages_2026_03_external_id_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_2026_03_next_retry_at_idx ON public.prospection_messages_2026_03 USING btree (next_retry_at) WHERE ((status = 'failed'::text) AND (retry_count < max_retries))
DROP INDEX IF EXISTS prospection_messages_2026_03_next_retry_at_idx;

-- ══════════════════════════════════════════════
-- Table: prospection_messages_default (4 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_default_campaign_id_status_idx ON public.prospection_messages_default USING btree (campaign_id, status)
DROP INDEX IF EXISTS prospection_messages_default_campaign_id_status_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_default_external_id_idx ON public.prospection_messages_default USING btree (external_id) WHERE (external_id IS NOT NULL)
DROP INDEX IF EXISTS prospection_messages_default_external_id_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_default_next_retry_at_idx ON public.prospection_messages_default USING btree (next_retry_at) WHERE ((status = 'failed'::text) AND (retry_count < max_retries))
DROP INDEX IF EXISTS prospection_messages_default_next_retry_at_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prospection_messages_default_contact_id_idx ON public.prospection_messages_default USING btree (contact_id)
DROP INDEX IF EXISTS prospection_messages_default_contact_id_idx;

-- ══════════════════════════════════════════════
-- Table: profiles (2 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX profiles_role_idx ON public.profiles USING btree (role) WHERE (role IS NOT NULL)
DROP INDEX IF EXISTS profiles_role_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX profiles_stripe_customer_idx ON public.profiles USING btree (stripe_customer_id) WHERE (stripe_customer_id IS NOT NULL)
DROP INDEX IF EXISTS profiles_stripe_customer_idx;

-- ══════════════════════════════════════════════
-- Table: devis_requests (2 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX idx_devis_requests_cee_eligible ON public.devis_requests USING btree (cee_eligible, status) WHERE (cee_eligible = true)
DROP INDEX IF EXISTS idx_devis_requests_cee_eligible;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_devis_requests_cee_dossier_id ON public.devis_requests USING btree (cee_dossier_id) WHERE (cee_dossier_id IS NOT NULL)
DROP INDEX IF EXISTS idx_devis_requests_cee_dossier_id;

-- ══════════════════════════════════════════════
-- Table: messages (2 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX idx_messages_search ON public.messages USING gin (search_vector)
DROP INDEX IF EXISTS idx_messages_search;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_messages_conversation_created ON public.messages USING btree (conversation_id, created_at DESC)
DROP INDEX IF EXISTS idx_messages_conversation_created;

-- ══════════════════════════════════════════════
-- Table: voice_calls (3 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_voice_calls_contact ON public.voice_calls USING btree (contact_id)
DROP INDEX IF EXISTS idx_voice_calls_contact;

-- Duplicate of unique constraint: voice_calls_vapi_call_id_key covers this
-- Was: CREATE INDEX idx_voice_calls_vapi ON public.voice_calls USING btree (vapi_call_id)
DROP INDEX IF EXISTS idx_voice_calls_vapi;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_voice_calls_score ON public.voice_calls USING btree (qualification_score) WHERE (qualification_score IS NOT NULL)
DROP INDEX IF EXISTS idx_voice_calls_score;

-- ══════════════════════════════════════════════
-- Table: import_jobs (3 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_import_jobs_type_status ON public.import_jobs USING btree (job_type, status)
DROP INDEX IF EXISTS idx_import_jobs_type_status;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_import_jobs_created_at ON public.import_jobs USING btree (created_at DESC)
DROP INDEX IF EXISTS idx_import_jobs_created_at;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_import_jobs_running ON public.import_jobs USING btree (job_type) WHERE (status = 'running'::text)
DROP INDEX IF EXISTS idx_import_jobs_running;

-- ══════════════════════════════════════════════
-- Table: seo_pages (3 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_seo_pages_type ON public.seo_pages USING btree (page_type)
DROP INDEX IF EXISTS idx_seo_pages_type;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_seo_pages_indexable ON public.seo_pages USING btree (is_indexable) WHERE (is_indexable = true)
DROP INDEX IF EXISTS idx_seo_pages_indexable;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_seo_pages_sitemap ON public.seo_pages USING btree (page_type, is_indexable, updated_at)
DROP INDEX IF EXISTS idx_seo_pages_sitemap;

-- ══════════════════════════════════════════════
-- Table: security_logs (3 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_security_logs_user_id ON public.security_logs USING btree (user_id)
DROP INDEX IF EXISTS idx_security_logs_user_id;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_security_logs_event_type ON public.security_logs USING btree (event_type)
DROP INDEX IF EXISTS idx_security_logs_event_type;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_security_logs_created_at ON public.security_logs USING btree (created_at DESC)
DROP INDEX IF EXISTS idx_security_logs_created_at;

-- ══════════════════════════════════════════════
-- Table: questions (3 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_questions_service ON public.questions USING btree (service_id)
DROP INDEX IF EXISTS idx_questions_service;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_questions_location ON public.questions USING btree (location_id)
DROP INDEX IF EXISTS idx_questions_location;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_questions_status ON public.questions USING btree (status)
DROP INDEX IF EXISTS idx_questions_status;

-- ══════════════════════════════════════════════
-- Table: price_history (3 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_price_history_service ON public.price_history USING btree (service_id)
DROP INDEX IF EXISTS idx_price_history_service;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_price_history_location ON public.price_history USING btree (location_id)
DROP INDEX IF EXISTS idx_price_history_location;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_price_history_period ON public.price_history USING btree (period_start)
DROP INDEX IF EXISTS idx_price_history_period;

-- ══════════════════════════════════════════════
-- Table: user_behaviors (3 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_user_behaviors_session ON public.user_behaviors USING btree (session_id)
DROP INDEX IF EXISTS idx_user_behaviors_session;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_user_behaviors_action ON public.user_behaviors USING btree (action_type)
DROP INDEX IF EXISTS idx_user_behaviors_action;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_user_behaviors_created ON public.user_behaviors USING btree (created_at)
DROP INDEX IF EXISTS idx_user_behaviors_created;

-- ══════════════════════════════════════════════
-- Table: pages (3 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- Duplicate of unique constraint: pages_url_path_key covers this
-- Was: CREATE INDEX idx_pages_url ON public.pages USING btree (url_path)
DROP INDEX IF EXISTS idx_pages_url;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_pages_service ON public.pages USING btree (service_id)
DROP INDEX IF EXISTS idx_pages_service;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_pages_location ON public.pages USING btree (location_id)
DROP INDEX IF EXISTS idx_pages_location;

-- ══════════════════════════════════════════════
-- Table: audit_logs (3 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_audit_logs_user ON public.audit_logs USING btree (user_id)
DROP INDEX IF EXISTS idx_audit_logs_user;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action)
DROP INDEX IF EXISTS idx_audit_logs_action;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_audit_logs_entity ON public.audit_logs USING btree (entity_type, entity_id)
DROP INDEX IF EXISTS idx_audit_logs_entity;

-- ══════════════════════════════════════════════
-- Table: search_logs (3 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_search_logs_service ON public.search_logs USING btree (service_id)
DROP INDEX IF EXISTS idx_search_logs_service;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_search_logs_location ON public.search_logs USING btree (location_id)
DROP INDEX IF EXISTS idx_search_logs_location;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_search_logs_created ON public.search_logs USING btree (created_at)
DROP INDEX IF EXISTS idx_search_logs_created;

-- ══════════════════════════════════════════════
-- Table: portfolio_items (3 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_portfolio_artisan ON public.portfolio_items USING btree (artisan_id)
DROP INDEX IF EXISTS idx_portfolio_artisan;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_portfolio_artisan_visible ON public.portfolio_items USING btree (artisan_id, is_visible, display_order) WHERE (is_visible = true)
DROP INDEX IF EXISTS idx_portfolio_artisan_visible;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_portfolio_featured ON public.portfolio_items USING btree (artisan_id, is_featured) WHERE (is_featured = true)
DROP INDEX IF EXISTS idx_portfolio_featured;

-- ══════════════════════════════════════════════
-- Table: devis_abandons (1 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX idx_devis_abandons_pending ON public.devis_abandons USING btree (created_at) WHERE ((completed_at IS NULL) AND (unsubscribed = false))
DROP INDEX IF EXISTS idx_devis_abandons_pending;

-- ══════════════════════════════════════════════
-- Table: prospection_templates (1 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX prosp_templates_channel_idx ON public.prospection_templates USING btree (channel, audience_type)
DROP INDEX IF EXISTS prosp_templates_channel_idx;

-- ══════════════════════════════════════════════
-- Table: googlebot_analysis (1 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX idx_googlebot_analysis_created_at ON public.googlebot_analysis USING btree (created_at DESC)
DROP INDEX IF EXISTS idx_googlebot_analysis_created_at;

-- ══════════════════════════════════════════════
-- Table: cron_leases (1 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX idx_cron_leases_expires_at ON public.cron_leases USING btree (expires_at)
DROP INDEX IF EXISTS idx_cron_leases_expires_at;

-- ══════════════════════════════════════════════
-- Table: estimation_leads (1 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 16 kB
-- Was: CREATE INDEX idx_estimation_leads_artisan ON public.estimation_leads USING btree (artisan_public_id) WHERE (artisan_public_id IS NOT NULL)
DROP INDEX IF EXISTS idx_estimation_leads_artisan;

-- ══════════════════════════════════════════════
-- Table: seo_enhancement_log (2 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_seo_enhancement_log_path ON public.seo_enhancement_log USING btree (page_path, applied_at DESC)
DROP INDEX IF EXISTS idx_seo_enhancement_log_path;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_seo_enhancement_log_type ON public.seo_enhancement_log USING btree (enhancement_type, applied_at DESC)
DROP INDEX IF EXISTS idx_seo_enhancement_log_type;

-- ══════════════════════════════════════════════
-- Table: waitlist (2 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_waitlist_artisan ON public.waitlist USING btree (artisan_id)
DROP INDEX IF EXISTS idx_waitlist_artisan;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_waitlist_date ON public.waitlist USING btree (preferred_date)
DROP INDEX IF EXISTS idx_waitlist_date;

-- ══════════════════════════════════════════════
-- Table: loyalty_points (2 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_loyalty_points_client ON public.loyalty_points USING btree (client_email)
DROP INDEX IF EXISTS idx_loyalty_points_client;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_loyalty_points_artisan ON public.loyalty_points USING btree (artisan_id)
DROP INDEX IF EXISTS idx_loyalty_points_artisan;

-- ══════════════════════════════════════════════
-- Table: cee_dossier_events (2 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_cee_dossier_events_dossier_id ON public.cee_dossier_events USING btree (dossier_id)
DROP INDEX IF EXISTS idx_cee_dossier_events_dossier_id;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_cee_dossier_events_created_at ON public.cee_dossier_events USING btree (created_at DESC)
DROP INDEX IF EXISTS idx_cee_dossier_events_created_at;

-- ══════════════════════════════════════════════
-- Table: webhook_events (2 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- Duplicate of unique constraint: webhook_events_stripe_event_id_key covers this
-- Was: CREATE INDEX idx_webhook_events_stripe_id ON public.webhook_events USING btree (stripe_event_id)
DROP INDEX IF EXISTS idx_webhook_events_stripe_id;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_webhook_events_status ON public.webhook_events USING btree (status)
DROP INDEX IF EXISTS idx_webhook_events_status;

-- ══════════════════════════════════════════════
-- Table: provider_financials (2 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_provider_financials_provider ON public.provider_financials USING btree (provider_id)
DROP INDEX IF EXISTS idx_provider_financials_provider;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_provider_financials_annee ON public.provider_financials USING btree (annee DESC)
DROP INDEX IF EXISTS idx_provider_financials_annee;

-- ══════════════════════════════════════════════
-- Table: prospection_conversation_messages (2 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prosp_conv_msgs_conv_idx ON public.prospection_conversation_messages USING btree (conversation_id, created_at)
DROP INDEX IF EXISTS prosp_conv_msgs_conv_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prosp_conv_msgs_desc_idx ON public.prospection_conversation_messages USING btree (conversation_id, created_at DESC)
DROP INDEX IF EXISTS prosp_conv_msgs_desc_idx;

-- ══════════════════════════════════════════════
-- Table: provider_sitemap_urls (2 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_psm_snapshot_batch ON public.provider_sitemap_urls USING btree (snapshot_id, batch_id)
DROP INDEX IF EXISTS idx_psm_snapshot_batch;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_psm_snapshot_batch_refreshed ON public.provider_sitemap_urls USING btree (snapshot_id, batch_id, refreshed_at)
DROP INDEX IF EXISTS idx_psm_snapshot_batch_refreshed;

-- ══════════════════════════════════════════════
-- Table: location_stats (2 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_location_stats_location ON public.location_stats USING btree (location_id)
DROP INDEX IF EXISTS idx_location_stats_location;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_location_stats_service ON public.location_stats USING btree (service_id)
DROP INDEX IF EXISTS idx_location_stats_service;

-- ══════════════════════════════════════════════
-- Table: prospection_conversations (2 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prosp_conv_contact_idx ON public.prospection_conversations USING btree (contact_id)
DROP INDEX IF EXISTS prosp_conv_contact_idx;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX prosp_conv_channel_idx ON public.prospection_conversations USING btree (channel)
DROP INDEX IF EXISTS prosp_conv_channel_idx;

-- ══════════════════════════════════════════════
-- Table: content_freshness (2 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- Duplicate of unique constraint: content_freshness_page_id_page_type_key covers this
-- Was: CREATE INDEX idx_content_freshness_page ON public.content_freshness USING btree (page_id, page_type)
DROP INDEX IF EXISTS idx_content_freshness_page;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_content_freshness_score ON public.content_freshness USING btree (freshness_score)
DROP INDEX IF EXISTS idx_content_freshness_score;

-- ══════════════════════════════════════════════
-- Table: redirects (2 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_redirects_source ON public.redirects USING btree (source_path)
DROP INDEX IF EXISTS idx_redirects_source;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_redirects_active ON public.redirects USING btree (is_active)
DROP INDEX IF EXISTS idx_redirects_active;

-- ══════════════════════════════════════════════
-- Table: schema_markup (2 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_schema_markup_page ON public.schema_markup USING btree (page_id)
DROP INDEX IF EXISTS idx_schema_markup_page;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_schema_markup_type ON public.schema_markup USING btree (schema_type)
DROP INDEX IF EXISTS idx_schema_markup_type;

-- ══════════════════════════════════════════════
-- Table: users (2 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- Duplicate of unique constraint: users_email_key covers this
-- Was: CREATE INDEX idx_users_email ON public.users USING btree (email)
DROP INDEX IF EXISTS idx_users_email;

-- Duplicate of unique constraint: users_auth_id_key covers this
-- Was: CREATE INDEX idx_users_auth ON public.users USING btree (auth_id)
DROP INDEX IF EXISTS idx_users_auth;

-- ══════════════════════════════════════════════
-- Table: answers (2 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_answers_question ON public.answers USING btree (question_id)
DROP INDEX IF EXISTS idx_answers_question;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_answers_status ON public.answers USING btree (status)
DROP INDEX IF EXISTS idx_answers_status;

-- ══════════════════════════════════════════════
-- Table: contacts (2 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_contacts_lead ON public.contacts USING btree (lead_id)
DROP INDEX IF EXISTS idx_contacts_lead;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_contacts_status ON public.contacts USING btree (status)
DROP INDEX IF EXISTS idx_contacts_status;

-- ══════════════════════════════════════════════
-- Table: internal_links (2 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_internal_links_source ON public.internal_links USING btree (source_page_id)
DROP INDEX IF EXISTS idx_internal_links_source;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_internal_links_target ON public.internal_links USING btree (target_page_id)
DROP INDEX IF EXISTS idx_internal_links_target;

-- ══════════════════════════════════════════════
-- Table: indexation_status (2 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- Duplicate of unique constraint: indexation_status_page_id_key covers this
-- Was: CREATE INDEX idx_indexation_status_page ON public.indexation_status USING btree (page_id)
DROP INDEX IF EXISTS idx_indexation_status_page;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_indexation_status_google ON public.indexation_status USING btree (google_indexed)
DROP INDEX IF EXISTS idx_indexation_status_google;

-- ══════════════════════════════════════════════
-- Table: page_quality_scores (2 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- Duplicate of unique constraint: page_quality_scores_page_id_key covers this
-- Was: CREATE INDEX idx_page_quality_scores_page ON public.page_quality_scores USING btree (page_id)
DROP INDEX IF EXISTS idx_page_quality_scores_page;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_page_quality_scores_status ON public.page_quality_scores USING btree (index_status)
DROP INDEX IF EXISTS idx_page_quality_scores_status;

-- ══════════════════════════════════════════════
-- Table: seo_priority_pages (2 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_seo_priority_pages_path ON public.seo_priority_pages USING btree (path)
DROP INDEX IF EXISTS idx_seo_priority_pages_path;

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_seo_priority_pages_pending ON public.seo_priority_pages USING btree (enhanced, "position") WHERE (enhanced = false)
DROP INDEX IF EXISTS idx_seo_priority_pages_pending;

-- ══════════════════════════════════════════════
-- Table: team_members (1 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_team_members_artisan ON public.team_members USING btree (artisan_id)
DROP INDEX IF EXISTS idx_team_members_artisan;

-- ══════════════════════════════════════════════
-- Table: gift_cards (1 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- Duplicate of unique constraint: gift_cards_code_key covers this
-- Was: CREATE INDEX idx_gift_cards_code ON public.gift_cards USING btree (code)
DROP INDEX IF EXISTS idx_gift_cards_code;

-- ══════════════════════════════════════════════
-- Table: access_logs (1 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_access_logs_path ON public.access_logs USING btree (path, created_at DESC)
DROP INDEX IF EXISTS idx_access_logs_path;

-- ══════════════════════════════════════════════
-- Table: notification_deliveries (1 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_notification_deliveries_event ON public.notification_deliveries USING btree (event_id)
DROP INDEX IF EXISTS idx_notification_deliveries_event;

-- ══════════════════════════════════════════════
-- Table: seo_metrics (1 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_seo_metrics_type_date ON public.seo_metrics USING btree (metric_type, collected_at DESC)
DROP INDEX IF EXISTS idx_seo_metrics_type_date;

-- ══════════════════════════════════════════════
-- Table: cms_page_versions (1 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX cms_versions_page_idx ON public.cms_page_versions USING btree (page_id, version_number DESC)
DROP INDEX IF EXISTS cms_versions_page_idx;

-- ══════════════════════════════════════════════
-- Table: provider_stats (1 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_provider_stats_period ON public.provider_stats USING btree (period_start)
DROP INDEX IF EXISTS idx_provider_stats_period;

-- ══════════════════════════════════════════════
-- Table: meta_tags (1 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_meta_tags_page ON public.meta_tags USING btree (page_id)
DROP INDEX IF EXISTS idx_meta_tags_page;

-- ══════════════════════════════════════════════
-- Table: subscriptions (1 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_subscriptions_status ON public.subscriptions USING btree (status)
DROP INDEX IF EXISTS idx_subscriptions_status;

-- ══════════════════════════════════════════════
-- Table: commissions (1 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_commissions_status ON public.commissions USING btree (status)
DROP INDEX IF EXISTS idx_commissions_status;

-- ══════════════════════════════════════════════
-- Table: review_votes (1 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_review_votes_fingerprint ON public.review_votes USING btree (voter_fingerprint)
DROP INDEX IF EXISTS idx_review_votes_fingerprint;

-- ══════════════════════════════════════════════
-- Table: coverage_zones (1 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_coverage_zones_center ON public.coverage_zones USING btree (center_latitude, center_longitude)
DROP INDEX IF EXISTS idx_coverage_zones_center;

-- ══════════════════════════════════════════════
-- Table: provider_scores (1 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_provider_scores_overall ON public.provider_scores USING btree (overall_score)
DROP INDEX IF EXISTS idx_provider_scores_overall;

-- ══════════════════════════════════════════════
-- Table: provider_features (1 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_provider_features_type ON public.provider_features USING btree (feature_type)
DROP INDEX IF EXISTS idx_provider_features_type;

-- ══════════════════════════════════════════════
-- Table: transactions (1 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_transactions_created ON public.transactions USING btree (created_at)
DROP INDEX IF EXISTS idx_transactions_created;

-- ══════════════════════════════════════════════
-- Table: invoices (1 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_invoices_status ON public.invoices USING btree (status)
DROP INDEX IF EXISTS idx_invoices_status;

-- ══════════════════════════════════════════════
-- Table: oauth_states (1 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- Duplicate of unique constraint: oauth_states_state_key covers this
-- Was: CREATE INDEX idx_oauth_states_state ON public.oauth_states USING btree (state)
DROP INDEX IF EXISTS idx_oauth_states_state;

-- ══════════════════════════════════════════════
-- Table: client_booking_history (1 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_client_booking_history_email ON public.client_booking_history USING btree (client_email)
DROP INDEX IF EXISTS idx_client_booking_history_email;

-- ══════════════════════════════════════════════
-- Table: artisan_slot_stats (1 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_artisan_slot_stats_artisan ON public.artisan_slot_stats USING btree (artisan_id)
DROP INDEX IF EXISTS idx_artisan_slot_stats_artisan;

-- ══════════════════════════════════════════════
-- Table: conversations (1 indexes, 0.0 MB reclaimed)
-- ══════════════════════════════════════════════

-- 0 scans since stats reset, not a constraint, size: 8192 bytes
-- Was: CREATE INDEX idx_conversations_client ON public.conversations USING btree (client_id)
DROP INDEX IF EXISTS idx_conversations_client;

COMMIT;