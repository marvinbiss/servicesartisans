# DB Schema — État final après toutes migrations (002→329)
# Source: analyse exhaustive de toutes les migrations dans l'ordre
# RÈGLE: Ce fichier fait foi. Toute colonne absente ici = FANTÔME.

---

## TABLE: profiles
Colonnes: id (uuid PK), email (text), full_name (text), is_admin (bool), role (text), phone_e164 (text), average_rating (numeric), review_count (int), created_at (timestamptz), updated_at (timestamptz)
Colonnes SUPPRIMÉES (migration 100): company_name, google_calendar_connected, video_enabled, video_price
Colonnes JAMAIS EXISTÉES: phone (sans _e164), city, address, postal_code, is_banned, ban_reason, banned_at, banned_by, user_type, subscription_plan, subscription_status, stripe_customer_id, avatar_url, experience_years, employee_count
RLS: oui

## TABLE: providers
Colonnes: id (uuid PK), name (text), slug (text), email (text), phone (text), siret (text), siren (text), is_verified (bool), is_active (bool), stable_id (text), noindex (bool), address_city (text), address_postal_code (text), address_street (text), address_region (text), address_department (text), specialty (text), rating_average (numeric), review_count (int), created_at (timestamptz), updated_at (timestamptz), meta_description (text), latitude (numeric), longitude (numeric), source (text), source_id (text), description (text)
Colonnes SUPPRIMÉES (migration 100): is_premium, trust_badge, trust_score, company_name, hourly_rate_min, hourly_rate_max, emergency_available, certifications, insurance, payment_methods, languages, avatar_url, intervention_zone, video_enabled, video_price, response_time, response_rate
RLS: oui

## TABLE: bookings
Colonnes: id (uuid PK), provider_id (uuid FK→providers), client_id (uuid FK→profiles), status (text), scheduled_date (timestamptz), service_name (varchar 255), cancelled_at (timestamptz), cancelled_by (text), cancellation_reason (text), rescheduled_at (timestamptz), rescheduled_from_slot_id (uuid), payment_status (text), payment_session_id (text), payment_intent_id (text), deposit_amount (numeric), created_at (timestamptz), updated_at (timestamptz)
Colonnes SUPPRIMÉES (migration 100): video_room_id, is_video_consultation
Colonnes JAMAIS EXISTÉES: artisan_id, booking_date, date, total_amount, amount
FK: provider_id → providers(id), client_id → profiles(id)
RLS: oui

## TABLE: reviews
Colonnes: id (uuid PK), artisan_id (uuid FK→profiles), booking_id (uuid FK→bookings), client_name (text), client_email (text), rating (int 1-5), comment (text), artisan_response (text), artisan_responded_at (timestamptz), would_recommend (bool), status (text: pending_review|published|hidden|flagged), helpful_count (int), fraud_indicators (jsonb), created_at (timestamptz), updated_at (timestamptz)
Colonnes JAMAIS EXISTÉES: client_id, user_id, is_visible, author_name, author_email, moderation_status (c'est un alias frontend), service, devis_id
RLS: oui

## TABLE: conversations
Colonnes: id (uuid PK), client_id (uuid FK→profiles), provider_id (uuid FK→providers), quote_id (uuid FK→quotes NULL), booking_id (uuid FK→bookings NULL), status (text: active|archived|blocked), last_message_at (timestamptz), unread_count (int), created_at (timestamptz), updated_at (timestamptz)
UNIQUE: (client_id, provider_id)
Colonnes JAMAIS EXISTÉES: service, service_name, title, artisan_id
RLS: oui

## TABLE: messages
Colonnes: id (uuid PK), conversation_id (uuid FK→conversations), sender_id (uuid), sender_type (text: client|artisan|system), content (text), message_type (text), file_url (text), file_name (text), file_size (int), read_at (timestamptz), created_at (timestamptz)
Colonnes JAMAIS EXISTÉES: receiver_id, is_read, devis_request_id
RLS: oui

## TABLE: notifications
Colonnes: id (uuid PK), user_id (uuid FK→profiles), type (text), title (text), body (text), data (jsonb), read_at (timestamptz), created_at (timestamptz)
Note: champ est "body" pas "message"
RLS: oui

## TABLE: devis_requests
Colonnes: id (uuid PK), client_id (uuid FK→profiles), service_id (uuid FK→services NULL), service_name (text), postal_code (text), city (text), description (text), budget (numeric), urgency (text), status (text: pending|sent|accepted|refused|completed), client_name (text), client_email (text), client_phone (text), created_at (timestamptz), updated_at (timestamptz)
RLS: oui

## TABLE: quotes
Colonnes: id (uuid PK), request_id (uuid FK→devis_requests), provider_id (uuid FK→providers), amount (numeric), description (text), valid_until (date), status (text: pending|accepted|refused|expired), created_at (timestamptz), updated_at (timestamptz)
Colonnes JAMAIS EXISTÉES: artisan_id, devis_id, message (c'est description)
RLS: oui

## TABLE: lead_events
Colonnes: id (uuid PK), lead_id (uuid FK→devis_requests), provider_id (uuid FK→providers), actor_id (uuid), event_type (text CHECK: created|dispatched|viewed|quoted|declined|accepted|refused|completed|expired|reassigned), metadata (jsonb), created_at (timestamptz)
RLS: oui

## TABLE: audit_logs
Colonnes: id (uuid PK), action (text), user_id (uuid FK→auth.users — PAS profiles), provider_id (uuid), resource_type (text), resource_id (uuid), old_value (jsonb), new_value (jsonb), metadata (jsonb), ip_address (text), user_agent (text), created_at (timestamptz)
CRITIQUE: user_id → auth.users (pas profiles) — pas de FK join possible vers profiles
RLS: non (admin only)

## TABLE: user_reports
Colonnes: id (uuid PK), reporter_id (uuid FK→profiles), target_type (text), target_id (uuid), reason (text), description (text), status (text: pending|reviewed|dismissed), reviewed_by (uuid FK→profiles NULL), reviewed_at (timestamptz), resolution (text), created_at (timestamptz)
Colonnes JAMAIS EXISTÉES: resolved_by, resolved_at, resolution_notes, under_review
RLS: oui

## TABLE: user_preferences
Colonnes: id (uuid PK), user_id (uuid FK→profiles UNIQUE), email_booking_confirmation (bool), email_booking_reminder (bool), email_marketing (bool), email_newsletter (bool), sms_booking_reminder (bool), sms_marketing (bool), push_enabled (bool), push_booking_updates (bool), push_messages (bool), push_promotions (bool), profile_public (bool), show_online_status (bool), allow_reviews (bool), language (text), currency (text), theme (text), timezone (text), updated_at (timestamptz)
Colonnes JAMAIS EXISTÉES: preferences (colonne jsonb unique — n'existe PAS, les prefs sont en colonnes plates)
RLS: oui

## TABLE: deletion_requests (migration 329)
Colonnes: id (uuid PK), user_id (uuid FK→profiles), reason (text), status (text: scheduled|cancelled|completed), scheduled_deletion_at (timestamptz), cancelled_at (timestamptz), completed_at (timestamptz), created_at (timestamptz)
Note: recréée en migration 329 après suppression en migration 100
RLS: oui (user_id = auth.uid())

## TABLE: data_export_requests (migration 329)
Colonnes: id (uuid PK), user_id (uuid FK→profiles), format (varchar 20), status (text: pending|processing|completed|failed), download_url (text), expires_at (timestamptz), completed_at (timestamptz), created_at (timestamptz)
Note: recréée en migration 329
RLS: oui

## TABLE: cookie_consents (migration 329)
Colonnes: id (uuid PK), user_id (uuid FK→profiles NULL), session_id (varchar 255), ip_address (varchar 50), user_agent (text), necessary (bool), functional (bool), analytics (bool), marketing (bool), personalization (bool), consent_given_at (timestamptz), updated_at (timestamptz)
Note: recréée en migration 329
RLS: oui

## TABLE: availability_slots
Colonnes: id (uuid PK), artisan_id (uuid FK→profiles), date (date), start_time (time), end_time (time), is_available (bool), created_at (timestamptz)
RLS: oui

## TABLE: invoice
Colonnes: id (uuid PK), invoice_number (text), booking_id (uuid FK→bookings), provider_id (uuid FK→providers), client_id (uuid FK→profiles), provider_name (text), provider_address (text), provider_siret (text), provider_email (text), provider_phone (text), client_name (text), client_address (text), client_email (text), client_phone (text), items (jsonb), subtotal (numeric), tva_amount (numeric), total (numeric), issue_date (date), due_date (date), paid_date (date), status (text), payment_method (text), payment_reference (text), notes (text), created_at (timestamptz)
RLS: oui

## TABLE: prospection_contacts
Colonnes: id (uuid PK), contact_type (text), company_name (text), contact_name (text), email (text), email_canonical (text), phone (text), phone_e164 (text), address (text), postal_code (text), city (text), department (text), region (text), commune_code (text), population (int), artisan_id (uuid), source (text), source_file (text), source_row (int), tags (text[]), custom_fields (jsonb), consent_status (text: unknown|opted_in|opted_out — PAS 'none'), opted_out_at (timestamptz), is_active (bool), created_at, updated_at
RLS: admin only

## TABLE: provider_claims
Colonnes: id (uuid PK), provider_id (uuid FK→providers), user_id (uuid FK→profiles NULL), status (text: pending|approved|rejected), claimed_at (timestamptz), reviewed_at (timestamptz), reviewed_by (uuid), notes (text), created_at (timestamptz)
Note: atomicité — UPDATE WHERE user_id IS NULL pour éviter race condition
RLS: oui

## TABLES INEXISTANTES (demandées parfois par le code)
- subscriptions (public schema) — N'EXISTE PAS
- admin_users — N'EXISTE PAS (utiliser profiles WHERE is_admin=TRUE)
- admin_roles — N'EXISTE PAS
- devis (sans _requests) — N'EXISTE PAS
- artisan_profiles — N'EXISTE PAS (utiliser providers)
- services (table publique) — vérifier existence
- booking_slots — N'EXISTE PAS (c'est availability_slots)
