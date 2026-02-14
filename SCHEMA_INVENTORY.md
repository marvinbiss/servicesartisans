# Schema Inventory — ServicesArtisans
> Generated: 2026-02-14 | Source: supabase/migrations/*.sql

## CRITICAL NOTES
- **Active schema**: `public` — all application code uses `public.*` tables
- **`app` schema** (migration 110): ASPIRATIONAL ONLY, not used by TypeScript code
- Migration 100 dropped many toxic columns from `providers`
- Migration 306 RE-ADDED several columns (avatar_url, certifications, etc.) that were dropped by 100
- `subscriptions` table: EXISTS ONLY in `app` schema — does NOT exist in `public`
- `leads` table: EXISTS ONLY in `app` schema — does NOT exist in `public`

---

## Table: public.profiles
> Created by Supabase auth (initial), extended by migrations 002, 003, 100, 309

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | = auth.users.id |
| email | TEXT | | |
| full_name | TEXT | | |
| phone | TEXT | | |
| phone_e164 | TEXT | | |
| user_type | TEXT | | 'client' or 'artisan' |
| artisan_id | UUID | FK→providers? | Links to providers table |
| is_admin | BOOLEAN | NOT NULL DEFAULT FALSE | Added by migration 100 |
| role | TEXT | CHECK IN ('super_admin','admin','moderator','viewer') | Added by migration 309 |
| average_rating | DECIMAL(2,1) | DEFAULT 0 | Added by migration 003 |
| review_count | INTEGER | DEFAULT 0 | Added by migration 003 |
| subscription_plan | TEXT | CHECK IN ('gratuit','pro','premium') DEFAULT 'gratuit' | Added by migration 309 |
| subscription_status | TEXT | CHECK IN ('active','canceled','past_due','trialing') | Added by migration 309 |
| stripe_customer_id | TEXT | | Added by migration 309 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

### DROPPED from profiles (migration 100)
- google_calendar_connected, video_enabled, video_price

---

## Table: public.providers
> Core artisan/provider table. Base columns assumed from initial setup, extended by many migrations.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| name | TEXT | NOT NULL | **NOT company_name** |
| slug | TEXT | UNIQUE | |
| email | TEXT | | |
| phone | TEXT | | |
| siret | TEXT | | |
| user_id | UUID | FK→profiles(id) | |
| specialty | TEXT | | Added by migration 015 |
| description | TEXT | | |
| address_city | TEXT | | |
| address_postal_code | TEXT | | |
| address_region | TEXT | | |
| latitude | DECIMAL(10,8) | | Added by migration 010 |
| longitude | DECIMAL(11,8) | | Added by migration 010 |
| location | GEOGRAPHY(POINT,4326) | | Added by migration 015 |
| search_vector | TSVECTOR | | Added by migration 015 |
| rating_average | DECIMAL | | |
| review_count | INTEGER | | |
| is_verified | BOOLEAN | | |
| is_active | BOOLEAN | | |
| stable_id | TEXT | NOT NULL UNIQUE | Added by migration 100 |
| noindex | BOOLEAN | NOT NULL DEFAULT TRUE | Added by migration 100 |
| code_naf | TEXT | | Added by migration 108 |
| libelle_naf | TEXT | | Added by migration 108 |
| legal_form_code | TEXT | | Added by migration 108 |
| capital | NUMERIC | | Added by migration 108 |
| date_radiation | DATE | | Added by migration 108 |
| is_artisan | BOOLEAN | DEFAULT FALSE | Added by migration 108 |
| source_api | TEXT | | Added by migration 108 |
| derniere_maj_api | TIMESTAMPTZ | | Added by migration 108 |
| data_quality_score | INTEGER | DEFAULT 0 | Added by migration 108 |
| data_quality_flags | JSONB | DEFAULT '[]' | Added by migration 108 |
| last_lead_assigned_at | TIMESTAMPTZ | | Added by migration 103/202 |
| avatar_url | TEXT | length ≤ 2048 | DROPPED by 100, RE-ADDED by 306 |
| certifications | TEXT[] | DEFAULT '{}', max 20 | DROPPED by 100, RE-ADDED by 306 |
| insurance | TEXT[] | DEFAULT '{}', max 10 | DROPPED by 100, RE-ADDED by 306 |
| payment_methods | TEXT[] | DEFAULT '{}', max 10 | DROPPED by 100, RE-ADDED by 306 |
| languages | TEXT[] | DEFAULT ARRAY['Français'], max 10 | DROPPED by 100, RE-ADDED by 306 |
| emergency_available | BOOLEAN | DEFAULT FALSE | DROPPED by 100, RE-ADDED by 306 |
| available_24h | BOOLEAN | DEFAULT FALSE | Added by migration 306 |
| hourly_rate_min | NUMERIC(10,2) | | DROPPED by 100, RE-ADDED by 306 |
| hourly_rate_max | NUMERIC(10,2) | max ≥ min | DROPPED by 100, RE-ADDED by 306 |
| phone_secondary | TEXT | length ≤ 20 | Added by migration 306 |
| opening_hours | JSONB | DEFAULT '{}' | Added by migration 306 |
| accepts_new_clients | BOOLEAN | DEFAULT TRUE | Added by migration 306 |
| free_quote | BOOLEAN | DEFAULT TRUE | Added by migration 306 |
| intervention_radius_km | INTEGER | 1-200, DEFAULT 30 | Added by migration 306 |
| service_prices | JSONB | DEFAULT '[]' | Added by migration 306 |
| faq | JSONB | DEFAULT '[]' | Added by migration 306 |
| team_size | INTEGER | 1-1000 | Added by migration 306 |
| services_offered | TEXT[] | DEFAULT '{}', max 30 | Added by migration 306 |
| bio | TEXT | length ≤ 5000 | Added by migration 306 |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

### DROPPED from providers (migration 100) — PERMANENTLY GONE
- trust_badge, trust_score, is_premium
- avg_response_time_hours, response_rate, years_on_platform, response_time
- intervention_zone, video_enabled, video_price

### Foreign Keys
- user_id → profiles(id)

---

## Table: public.bookings
> Created by migration 010_v2, enhanced by 002

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| client_id | UUID | FK→profiles(id) ON DELETE SET NULL | |
| provider_id | UUID | | **NOT artisan_id** |
| service_id | UUID | | |
| status | VARCHAR(30) | CHECK IN ('pending','confirmed','in_progress','completed','cancelled','disputed') | |
| scheduled_date | DATE | | |
| scheduled_time | TIME | | |
| duration_minutes | INTEGER | | |
| address | TEXT | | |
| city | VARCHAR(100) | | |
| postal_code | VARCHAR(10) | | |
| notes | TEXT | | |
| total_amount | DECIMAL(10,2) | | |
| payment_status | VARCHAR(20) | CHECK IN ('pending','paid','refunded','failed') | |
| cancelled_at | TIMESTAMPTZ | | Added by migration 002 |
| cancelled_by | VARCHAR(50) | | Added by migration 002 |
| cancellation_reason | TEXT | | Added by migration 002 |
| rescheduled_at | TIMESTAMPTZ | | Added by migration 002 |
| rescheduled_from_slot_id | UUID | | Added by migration 002 |
| payment_session_id | VARCHAR(255) | | Added by migration 002 |
| payment_intent_id | VARCHAR(255) | | Added by migration 002 |
| deposit_amount | INTEGER | DEFAULT 0 | Added by migration 002 |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

### DROPPED from bookings (migration 100)
- video_room_id, is_video_consultation

---

## Table: public.reviews
> Created by migration 003

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| booking_id | UUID | NOT NULL FK→bookings(id) CASCADE | |
| artisan_id | UUID | NOT NULL FK→profiles(id) CASCADE | |
| client_name | VARCHAR(255) | NOT NULL | |
| client_email | VARCHAR(255) | NOT NULL | |
| rating | INTEGER | NOT NULL CHECK 1-5 | |
| comment | TEXT | | |
| would_recommend | BOOLEAN | | |
| status | VARCHAR(50) | DEFAULT 'published' | 'published','pending_review','hidden','flagged' |
| fraud_indicators | JSONB | | |
| artisan_response | TEXT | | |
| artisan_responded_at | TIMESTAMPTZ | | |
| helpful_count | INTEGER | DEFAULT 0 | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

---

## Table: public.audit_logs
> Created by migration 003_audit_logs

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| action | TEXT | NOT NULL | |
| user_id | UUID | FK→**auth.users(id)** ON DELETE SET NULL | NOT profiles FK |
| provider_id | UUID | | |
| resource_type | TEXT | | |
| resource_id | TEXT | | |
| old_value | JSONB | | |
| new_value | JSONB | | |
| metadata | JSONB | | |
| ip_address | INET | | |
| user_agent | TEXT | | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

## Table: public.user_reports
> Created by migration 004

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| reporter_id | UUID | FK→profiles(id) | |
| target_type | VARCHAR(50) | NOT NULL | 'user','review','artisan','message' |
| target_id | UUID | NOT NULL | |
| reason | VARCHAR(100) | NOT NULL | 'spam','inappropriate','fake','harassment','other' |
| description | TEXT | | |
| status | VARCHAR(50) | DEFAULT 'pending' | 'pending','reviewed','resolved','dismissed' |
| reviewed_by | UUID | FK→profiles(id) | **NOT resolved_by** |
| reviewed_at | TIMESTAMPTZ | | **NOT resolved_at** |
| resolution | TEXT | | **NOT resolution_notes** |
| created_at | TIMESTAMPTZ | | |

---

## Table: public.devis_requests
> Created by migration 100

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| client_id | UUID | FK→profiles(id) ON DELETE SET NULL | |
| service_id | UUID | FK→services(id) ON DELETE SET NULL | |
| service_name | TEXT | NOT NULL | |
| postal_code | TEXT | NOT NULL | |
| city | TEXT | | |
| description | TEXT | NOT NULL | |
| budget | TEXT | | |
| urgency | TEXT | NOT NULL DEFAULT 'normal' | CHECK IN ('normal','urgent','tres_urgent') |
| status | TEXT | NOT NULL DEFAULT 'pending' | CHECK IN ('pending','sent','accepted','refused','completed') |
| client_name | TEXT | NOT NULL | |
| client_email | TEXT | NOT NULL | |
| client_phone | TEXT | NOT NULL | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

---

## Table: public.quotes
> Created by migration 100

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| request_id | UUID | NOT NULL FK→devis_requests(id) CASCADE | |
| provider_id | UUID | NOT NULL FK→providers(id) CASCADE | |
| amount | DECIMAL(10,2) | NOT NULL | |
| description | TEXT | NOT NULL | |
| valid_until | DATE | NOT NULL | |
| status | TEXT | DEFAULT 'pending' | CHECK IN ('pending','accepted','refused','expired') |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

---

## Table: public.lead_assignments
> Created by migration 103, extended by 202

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| lead_id | UUID | NOT NULL | Polymorphic FK (validated by trigger) |
| provider_id | UUID | NOT NULL FK→providers(id) CASCADE | |
| assigned_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| status | TEXT | NOT NULL DEFAULT 'pending' | CHECK IN ('pending','viewed','quoted','declined') |
| viewed_at | TIMESTAMPTZ | | |
| source_table | TEXT | NOT NULL DEFAULT 'devis_requests' | CHECK IN ('devis_requests','leads') — added by 202 |
| score | REAL | | Added by 202 |
| distance_km | REAL | | Added by 202 |
| position | INTEGER | | Added by 202 |

### Unique constraint
- (lead_id, provider_id, source_table)

---

## Table: public.notifications
> Created by migration 107

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| user_id | UUID | NOT NULL FK→auth.users(id) CASCADE | |
| type | TEXT | NOT NULL CHECK | 'lead_created','lead_dispatched','lead_viewed','quote_received','lead_closed','system' |
| title | TEXT | NOT NULL | |
| message | TEXT | NOT NULL | |
| link | TEXT | | |
| read | BOOLEAN | NOT NULL DEFAULT FALSE | |
| metadata | JSONB | NOT NULL DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | | |

---

## Table: public.notification_deliveries
> Created by migration 107

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| event_id | UUID | NOT NULL | |
| channel | TEXT | NOT NULL CHECK | 'email','in_app','sms','push' |
| recipient_id | UUID | NOT NULL FK→auth.users(id) CASCADE | |
| status | TEXT | NOT NULL DEFAULT 'sent' | CHECK IN ('sent','failed','skipped') |
| error_message | TEXT | | |
| created_at | TIMESTAMPTZ | | |

### Unique constraint
- (event_id, channel, recipient_id)

---

## Table: public.algorithm_config
> Created by migration 201

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| matching_strategy | TEXT | NOT NULL DEFAULT 'scored' | |
| max_artisans_per_lead | INTEGER | NOT NULL DEFAULT 3 | |
| geo_radius_km | INTEGER | NOT NULL DEFAULT 50 | |
| require_same_department | BOOLEAN | NOT NULL DEFAULT false | |
| require_specialty_match | BOOLEAN | NOT NULL DEFAULT true | |
| specialty_match_mode | TEXT | NOT NULL DEFAULT 'category' | |
| weight_rating | INTEGER | NOT NULL DEFAULT 30 | |
| weight_reviews | INTEGER | NOT NULL DEFAULT 15 | |
| weight_verified | INTEGER | NOT NULL DEFAULT 20 | |
| weight_proximity | INTEGER | NOT NULL DEFAULT 25 | |
| weight_response_rate | INTEGER | NOT NULL DEFAULT 10 | |
| daily_lead_quota | INTEGER | NOT NULL DEFAULT 0 | |
| monthly_lead_quota | INTEGER | NOT NULL DEFAULT 0 | |
| cooldown_minutes | INTEGER | NOT NULL DEFAULT 30 | |
| lead_expiry_hours | INTEGER | NOT NULL DEFAULT 48 | |
| quote_expiry_hours | INTEGER | NOT NULL DEFAULT 72 | |
| auto_reassign_hours | INTEGER | NOT NULL DEFAULT 24 | |
| min_rating | REAL | NOT NULL DEFAULT 0 | |
| require_verified_urgent | BOOLEAN | NOT NULL DEFAULT false | |
| exclude_inactive_days | INTEGER | NOT NULL DEFAULT 90 | |
| prefer_claimed | BOOLEAN | NOT NULL DEFAULT true | |
| urgency_low_multiplier | REAL | NOT NULL DEFAULT 1.0 | |
| urgency_medium_multiplier | REAL | NOT NULL DEFAULT 1.0 | |
| urgency_high_multiplier | REAL | NOT NULL DEFAULT 1.5 | |
| urgency_emergency_multiplier | REAL | NOT NULL DEFAULT 2.0 | |
| updated_at | TIMESTAMPTZ | | |
| updated_by | UUID | | |

---

## Table: public.webhook_events
> Created by migration 100

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| stripe_event_id | TEXT | NOT NULL UNIQUE | |
| type | TEXT | NOT NULL | |
| status | TEXT | NOT NULL DEFAULT 'processing' | |
| payload | JSONB | | |
| error | TEXT | | |
| created_at | TIMESTAMPTZ | | |
| processed_at | TIMESTAMPTZ | | |

---

## Table: public.notification_logs
> Created by migration 002

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| booking_id | UUID | FK→bookings(id) CASCADE | |
| type | VARCHAR(50) | NOT NULL | |
| status | VARCHAR(50) | NOT NULL | |
| recipient_email | VARCHAR(255) | NOT NULL | |
| error_message | TEXT | | |
| sent_at | TIMESTAMPTZ | | |
| created_at | TIMESTAMPTZ | | |

---

## Table: public.team_members
> Created by migration 002

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| artisan_id | UUID | NOT NULL FK→profiles(id) CASCADE | |
| name | VARCHAR(255) | NOT NULL | |
| email | VARCHAR(255) | NOT NULL | |
| phone | VARCHAR(50) | | |
| role | VARCHAR(255) | NOT NULL | |
| color | VARCHAR(7) | DEFAULT '#3b82f6' | |
| avatar_url | TEXT | | |
| is_active | BOOLEAN | DEFAULT true | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

---

## Table: public.email_suppressions
> Created by migration 308

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| email | TEXT | NOT NULL, length ≤ 320 | |
| reason | TEXT | NOT NULL CHECK | 'hard_bounce','soft_bounce','complaint','unsubscribe','manual' |
| source | TEXT | length ≤ 100 | |
| error_message | TEXT | length ≤ 1000 | |
| created_at | TIMESTAMPTZ | | |

### Unique index
- (lower(email), reason)

---

## Table: public.cms_pages
> Created by migration 305

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| slug | TEXT | NOT NULL, regex, length ≤ 200 | |
| page_type | TEXT | NOT NULL CHECK | 'static','blog','service','location','homepage','faq' |
| title | TEXT | NOT NULL, length ≤ 500 | |
| content_json | JSONB | | |
| content_html | TEXT | length ≤ 500000 | |
| structured_data | JSONB | | |
| meta_title | TEXT | length ≤ 70 | |
| meta_description | TEXT | length ≤ 170 | |
| og_image_url | TEXT | length ≤ 2048 | |
| canonical_url | TEXT | length ≤ 2048 | |
| excerpt | TEXT | length ≤ 1000 | |
| author | TEXT | length ≤ 200 | |
| author_bio | TEXT | length ≤ 2000 | |
| category | TEXT | length ≤ 200 | |
| tags | TEXT[] | NOT NULL DEFAULT '{}', max 50 | |
| read_time | TEXT | length ≤ 50 | |
| featured_image | TEXT | length ≤ 2048 | |
| service_slug | TEXT | regex format | |
| location_slug | TEXT | regex format | |
| status | TEXT | NOT NULL DEFAULT 'draft' | CHECK IN ('draft','published','archived') |
| published_at | TIMESTAMPTZ | | Required when status='published' |
| published_by | UUID | | |
| sort_order | INTEGER | DEFAULT 0 | |
| is_active | BOOLEAN | NOT NULL DEFAULT true | |
| created_by | UUID | | |
| updated_by | UUID | | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

---

## Table: public.cms_page_versions
> Created by migration 305

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| page_id | UUID | NOT NULL FK→cms_pages(id) CASCADE | |
| version_number | INTEGER | NOT NULL DEFAULT 1, > 0 | |
| title | TEXT | NOT NULL | |
| content_json | JSONB | | |
| content_html | TEXT | | |
| structured_data | JSONB | | |
| meta_title | TEXT | | |
| meta_description | TEXT | | |
| status | TEXT | NOT NULL CHECK | 'draft','published','archived' |
| created_by | UUID | | |
| created_at | TIMESTAMPTZ | | |
| change_summary | TEXT | length ≤ 500 | |

### Unique constraint
- (page_id, version_number)

---

## Table: public.prospection_contacts
> Created by migration 300

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| contact_type | TEXT | NOT NULL CHECK | 'artisan','client','mairie' |
| company_name | TEXT | | **HAS company_name** (unlike providers) |
| contact_name | TEXT | | |
| email | TEXT | | |
| email_canonical | TEXT | GENERATED lower(trim(email)) STORED | |
| phone | TEXT | | |
| phone_e164 | TEXT | | Set by trigger |
| address | TEXT | | |
| postal_code | TEXT | | |
| city | TEXT | | |
| department | TEXT | | |
| region | TEXT | | |
| commune_code | TEXT | | Mairie-specific |
| population | INTEGER | | Mairie-specific |
| artisan_id | UUID | | Link to existing artisan |
| source | TEXT | NOT NULL DEFAULT 'import' | CHECK IN ('import','database','manual','api','scraping') |
| source_file | TEXT | | |
| source_row | INTEGER | | |
| tags | TEXT[] | DEFAULT '{}' | |
| custom_fields | JSONB | DEFAULT '{}' | |
| consent_status | TEXT | DEFAULT 'unknown' | CHECK IN ('opted_in','opted_out','unknown') |
| opted_out_at | TIMESTAMPTZ | | |
| is_active | BOOLEAN | NOT NULL DEFAULT true | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

---

## Table: public.prospection_lists
> Created by migration 300

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| name | TEXT | NOT NULL | |
| description | TEXT | | |
| list_type | TEXT | NOT NULL DEFAULT 'static' | CHECK IN ('static','dynamic') |
| filter_criteria | JSONB | | |
| contact_count | INTEGER | DEFAULT 0 | Updated by trigger |
| created_by | UUID | | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

---

## Table: public.prospection_list_members
> Created by migration 300

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| list_id | UUID | PK, FK→prospection_lists(id) CASCADE | |
| contact_id | UUID | PK, FK→prospection_contacts(id) CASCADE | |
| added_at | TIMESTAMPTZ | | |

---

## Table: public.prospection_templates
> Created by migration 300

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| name | TEXT | NOT NULL | |
| channel | TEXT | NOT NULL CHECK | 'email','sms','whatsapp' |
| audience_type | TEXT | CHECK | 'artisan','client','mairie' |
| subject | TEXT | | |
| body | TEXT | NOT NULL | |
| html_body | TEXT | | |
| whatsapp_template_name | TEXT | | |
| whatsapp_template_sid | TEXT | | |
| whatsapp_approved | BOOLEAN | DEFAULT false | |
| ai_system_prompt | TEXT | | |
| ai_context | JSONB | DEFAULT '{}' | |
| variables | TEXT[] | DEFAULT '{}' | |
| is_active | BOOLEAN | NOT NULL DEFAULT true | |
| created_by | UUID | | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

---

## Table: public.prospection_campaigns
> Created by migration 300

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| name | TEXT | NOT NULL | |
| description | TEXT | | |
| channel | TEXT | NOT NULL CHECK | 'email','sms','whatsapp' |
| audience_type | TEXT | NOT NULL CHECK | 'artisan','client','mairie' |
| template_id | UUID | FK→prospection_templates(id) | |
| list_id | UUID | FK→prospection_lists(id) | |
| status | TEXT | NOT NULL DEFAULT 'draft' | CHECK IN ('draft','scheduled','sending','paused','completed','cancelled') |
| scheduled_at | TIMESTAMPTZ | | |
| started_at | TIMESTAMPTZ | | |
| completed_at | TIMESTAMPTZ | | |
| paused_at | TIMESTAMPTZ | | |
| batch_size | INTEGER | DEFAULT 100 | |
| batch_delay_ms | INTEGER | DEFAULT 1000 | |
| daily_send_limit | INTEGER | DEFAULT 10000 | |
| ab_test_enabled | BOOLEAN | DEFAULT false | |
| ab_variant_b_template_id | UUID | FK→prospection_templates(id) | |
| ab_split_percent | INTEGER | DEFAULT 50, 10-90 | |
| ai_auto_reply | BOOLEAN | DEFAULT false | |
| ai_provider | TEXT | DEFAULT 'claude' | CHECK IN ('claude','openai') |
| ai_model | TEXT | | |
| ai_system_prompt | TEXT | | |
| ai_max_tokens | INTEGER | DEFAULT 500 | |
| ai_temperature | NUMERIC(3,2) | DEFAULT 0.7 | |
| total_recipients | INTEGER | DEFAULT 0 | |
| sent_count | INTEGER | DEFAULT 0 | |
| delivered_count | INTEGER | DEFAULT 0 | |
| opened_count | INTEGER | DEFAULT 0 | |
| clicked_count | INTEGER | DEFAULT 0 | |
| replied_count | INTEGER | DEFAULT 0 | |
| failed_count | INTEGER | DEFAULT 0 | |
| opted_out_count | INTEGER | DEFAULT 0 | |
| estimated_cost | NUMERIC(10,2) | DEFAULT 0 | |
| actual_cost | NUMERIC(10,2) | DEFAULT 0 | |
| created_by | UUID | | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

---

## Table: public.prospection_messages (PARTITIONED BY RANGE created_at)
> Created by migration 300

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | NOT NULL | |
| campaign_id | UUID | NOT NULL | |
| contact_id | UUID | NOT NULL | |
| channel | TEXT | NOT NULL CHECK | 'email','sms','whatsapp' |
| rendered_body | TEXT | | |
| rendered_subject | TEXT | | |
| ab_variant | TEXT | DEFAULT 'A' | CHECK IN ('A','B') |
| external_id | TEXT | | Twilio SID or Resend ID |
| status | TEXT | NOT NULL DEFAULT 'queued' | CHECK IN ('queued','sending','sent','delivered','read','replied','failed','bounced','opted_out','cancelled') |
| queued_at | TIMESTAMPTZ | | |
| sent_at | TIMESTAMPTZ | | |
| delivered_at | TIMESTAMPTZ | | |
| read_at | TIMESTAMPTZ | | |
| replied_at | TIMESTAMPTZ | | |
| failed_at | TIMESTAMPTZ | | |
| error_code | TEXT | | |
| error_message | TEXT | | |
| retry_count | INTEGER | DEFAULT 0 | |
| max_retries | INTEGER | DEFAULT 3 | |
| next_retry_at | TIMESTAMPTZ | | |
| cost | NUMERIC(8,4) | DEFAULT 0 | |
| created_at | TIMESTAMPTZ | | Partition key |

---

## Table: public.prospection_conversations
> Created by migration 300

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| campaign_id | UUID | FK→prospection_campaigns(id) | |
| contact_id | UUID | NOT NULL FK→prospection_contacts(id) | |
| message_id | UUID | | |
| channel | TEXT | NOT NULL CHECK | 'email','sms','whatsapp' |
| status | TEXT | NOT NULL DEFAULT 'open' | CHECK IN ('open','ai_handling','human_required','resolved','archived') |
| ai_provider | TEXT | | |
| ai_model | TEXT | | |
| ai_replies_count | INTEGER | DEFAULT 0 | |
| assigned_to | UUID | | |
| last_message_at | TIMESTAMPTZ | | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

---

## Table: public.prospection_conversation_messages
> Created by migration 300

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| conversation_id | UUID | NOT NULL FK→prospection_conversations(id) CASCADE | |
| direction | TEXT | NOT NULL CHECK | 'inbound','outbound' |
| sender_type | TEXT | NOT NULL CHECK | 'contact','ai','human','system' |
| content | TEXT | NOT NULL | |
| ai_provider | TEXT | | |
| ai_model | TEXT | | |
| ai_prompt_tokens | INTEGER | | |
| ai_completion_tokens | INTEGER | | |
| ai_cost | NUMERIC(8,6) | DEFAULT 0 | |
| external_id | TEXT | | |
| created_at | TIMESTAMPTZ | | |

---

## Table: public.prospection_ai_settings
> Created by migration 300

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| default_provider | TEXT | NOT NULL DEFAULT 'claude' | CHECK IN ('claude','openai') |
| claude_model | TEXT | | |
| claude_api_key_set | BOOLEAN | DEFAULT false | |
| claude_max_tokens | INTEGER | DEFAULT 500 | |
| claude_temperature | NUMERIC(3,2) | DEFAULT 0.7 | |
| openai_model | TEXT | | |
| openai_api_key_set | BOOLEAN | DEFAULT false | |
| openai_max_tokens | INTEGER | DEFAULT 500 | |
| openai_temperature | NUMERIC(3,2) | DEFAULT 0.7 | |
| auto_reply_enabled | BOOLEAN | DEFAULT false | |
| max_auto_replies | INTEGER | DEFAULT 3 | |
| escalation_keywords | TEXT[] | | |
| artisan_system_prompt | TEXT | | |
| client_system_prompt | TEXT | | |
| mairie_system_prompt | TEXT | | |
| updated_by | UUID | | |
| updated_at | TIMESTAMPTZ | | |

---

## TABLES THAT DO NOT EXIST IN public SCHEMA
These are commonly referenced incorrectly:
- `subscriptions` — ONLY in `app` schema
- `leads` — ONLY in `app` schema
- `services` — assumed to exist (initial setup, not in migrations)
- `availability_slots` — assumed to exist (initial setup)

## TABLES DROPPED BY MIGRATION 100
All of these no longer exist:
- identity_verifications, insurance_verifications, certification_verifications
- video_verification_sessions, kyc_documents, kyc_profiles
- dispute_messages, disputes, escrow_milestones, escrow_transactions
- two_factor_backup_codes, two_factor_secrets, fraud_assessments
- artisan_similarities, realtime_activity, provider_goals
- analytics_insights, analytics_funnels, report_history
- scheduled_reports, provider_benchmarks, analytics_aggregates
- saved_search_alerts, search_analytics, search_suggestions
- user_search_history, provider_availability_cache
- review_response_templates, response_metrics, trust_badges
- review_authenticity, review_sentiment, review_media, review_votes
- quick_reply_templates, conversation_settings, message_read_receipts
- message_reactions, message_attachments, video_rooms
- gift_card_transactions, gift_cards, loyalty_points, waitlist
- google_calendar_tokens, oauth_states, artisan_pricing_settings
- client_booking_history, artisan_slot_stats, platform_stats
- admin_roles, moderation_logs, data_export_requests
- deletion_requests, cookie_consents, push_subscriptions
- search_history, saved_searches, favorite_artisans, analytics_events

---

## Key Functions (public schema)
- `generate_stable_id(UUID)` → TEXT — HMAC-SHA256 stable ID for providers
- `dispatch_lead(UUID, TEXT, TEXT, TEXT, TEXT, DOUBLE, DOUBLE, TEXT)` → UUID[] — Configurable lead dispatch (migration 202)
- `update_artisan_rating()` — Trigger function for review stats
- `update_updated_at_column()` — Generic updated_at trigger
- `is_admin()` — Admin check function
- `validate_lead_assignment_fk()` — Polymorphic FK validation trigger
- `cms_auto_version()` — CMS version snapshot trigger
- `prospection_normalize_phone()` — Phone E.164 normalization trigger
- `prospection_list_count_update()` — List member count trigger
- `prospection_updated_at()` — Generic updated_at for prospection tables

## Key Functions (app schema — NOT USED BY CODE)
- `app.distribute_lead(UUID)` — Lead distribution (app schema version)
- `app.compute_trust_score(UUID)` — Trust score calculation
- `app.reserve_quota(UUID)` / `app.consume_quota(UUID)` / `app.release_quota(UUID)` — Quota management
- `app.canonical_email(TEXT)` / `app.canonical_phone_e164(TEXT)` — Canonicalization
