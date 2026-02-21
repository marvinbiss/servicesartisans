# Zod Schemas — Champs acceptés par chaque route (vérité terrain)
# Source: lecture directe des schémas Zod dans chaque route.ts
# RÈGLE: Tout champ envoyé hors de ce schéma est silencieusement ignoré par l'API.

---

## /api/client/profile (PUT)
Schéma: updateClientProfileSchema
Champs: full_name (string max 100, optional), phone (string max 20, optional)
Mapping DB: phone → phone_e164 (la conversion est interne à la route)
⚠️ NE PAS envoyer: prenom, nom, telephone, email, city, address

## /api/client/avis (POST)
Schéma: createReviewSchema
Champs: artisan_id (uuid), booking_id (uuid, optional/nullable), rating (int 1-5), comment (string 10-2000)
Colonnes DB insérées: artisan_id, booking_id, client_name, client_email, rating, comment

## /api/client/avis (PUT)
Schéma: updateReviewSchema
Champs: review_id (uuid), rating (int 1-5, optional), comment (string 10-2000, optional)

## /api/client/avis (DELETE)
Schéma: deleteReviewSchema (query param)
Champs: id (uuid)

## /api/client/messages (GET)
Schéma: messagesQuerySchema
Champs: conversation_id (uuid, optional)
⚠️ NE PAS utiliser: ?with=, ?partnerId=

## /api/client/messages (POST)
Schéma: sendMessageSchema
Champs: conversation_id (uuid, optional/nullable), provider_id (uuid, optional/nullable), content (string 1-5000)

## /api/client/demandes (GET)
Pas de schéma Zod strict — query params: page, limit, status

## /api/user/preferences (PUT)
Champs: preferences object avec notifications, privacy, display (colonnes plates dans user_preferences)
⚠️ Colonne "preferences" (jsonb unique) N'EXISTE PAS dans user_preferences — les prefs sont en colonnes plates

## /api/bookings (POST)
Schéma: createBookingSchema (dans @/lib/validations/schemas)
Champs: artisanId (uuid), slotId (uuid), clientName (string), clientPhone (string), clientEmail (email), serviceDescription (string max 1000, optional)
Note: artisanId est un provider.id

## /api/bookings/[id]/cancel (POST)
Schéma: cancelBookingSchema
Champs: reason (string max 500, optional)

## /api/bookings/[id]/reschedule (POST)
Schéma: rescheduleBookingSchema
Champs: slotId (uuid)

## /api/artisan/profile (PUT)
Champs attendus: name, specialty, description, address_city, address_postal_code, address_street, address_region, phone, email
⚠️ NE PAS utiliser: company_name, avatar_url, is_premium

## /api/artisan/avis/[id]/response (POST)
Champs: response (string)
Colonnes DB: artisan_response, artisan_responded_at
⚠️ NE PAS utiliser: response_at, provider_id

## /api/artisan/devis (POST)
Schéma: createQuoteSchema
Champs: request_id (uuid), amount (number > 0), description (string 1-5000), valid_until (date YYYY-MM-DD, optional)
Colonnes DB: request_id, provider_id (auto depuis auth), amount, description, valid_until, status='pending'

## /api/artisan/leads/[id]/action (POST)
Champs: action (viewed|quoted|declined)

## /api/admin/bookings (GET)
Query params: page, limit, status, search
⚠️ search ne filtre PAS sur client_email ou service (colonnes inexistantes ou non indexées dans bookings)

## /api/admin/providers (GET)
Query params: page, limit, search, status, verified
Colonnes sélectionnées: id, name, slug, email, phone, specialty, address_city, is_verified, is_active, rating_average, review_count, created_at
⚠️ NE PAS sélectionner: company_name, address_department (vérifier)

## /api/admin/users/[id]/ban (POST)
⚠️ profiles N'A PAS: is_banned, ban_reason, banned_at, banned_by
Solution: utiliser role='banned' ou une logique dédiée

## /api/admin/reports (GET)
Statuts valides: pending|reviewed|dismissed
⚠️ 'under_review' N'EST PAS un statut valide dans user_reports.status

## /api/admin/quotes (GET)
Table: quotes
Statuts valides: pending|accepted|refused|expired
⚠️ 'sent' N'EST PAS un statut valide dans quotes.status

## /api/admin/export (GET/POST)
Reviews: utiliser status pour filtrer (published|pending_review|hidden|flagged)
⚠️ NE PAS utiliser: author_name (c'est client_name), is_visible (n'existe pas)

## /api/gdpr/delete (GET/POST/DELETE)
Table: deletion_requests
Colonnes: user_id, reason, status, scheduled_deletion_at, cancelled_at
⚠️ NE PAS utiliser: scheduled_for (ancienne migration)

## /api/gdpr/consent (GET/POST)
Table: cookie_consents
Colonnes: user_id, session_id, ip_address, user_agent, necessary, functional, analytics, marketing, personalization, consent_given_at
⚠️ NE PAS utiliser: consented_at (ancienne migration)
