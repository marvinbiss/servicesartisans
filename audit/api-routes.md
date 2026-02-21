# API Routes — Inventaire exhaustif (routes qui EXISTENT réellement)
# Source: scan récursif de src/app/api/
# RÈGLE: Toute route absente ici = 404 si appelée.

---

## /api/admin/
- GET  /api/admin/stats
- GET  /api/admin/bookings
- GET  /api/admin/bookings/[id]
- PUT  /api/admin/bookings/[id]
- GET  /api/admin/users
- GET  /api/admin/users/[id]
- PUT  /api/admin/users/[id]
- POST /api/admin/users/[id]/ban
- GET  /api/admin/providers
- GET  /api/admin/providers/[id]
- PUT  /api/admin/providers/[id]
- DELETE /api/admin/providers/[id]
- GET  /api/admin/reviews
- PUT  /api/admin/reviews/[id]
- GET  /api/admin/reports
- PUT  /api/admin/reports/[id]
- GET  /api/admin/leads
- GET  /api/admin/quotes
- GET  /api/admin/quotes/[id]
- PUT  /api/admin/quotes/[id]
- GET  /api/admin/admins/[id]
- PUT  /api/admin/admins/[id]
- GET  /api/admin/claims
- PUT  /api/admin/claims/[id]
- GET  /api/admin/export
- POST /api/admin/export
- GET  /api/admin/audit
- GET  /api/admin/messages
- POST /api/admin/dispatch
- GET  /api/admin/algorithme
- PUT  /api/admin/algorithme
- GET  /api/admin/settings
- PUT  /api/admin/settings
- POST /api/admin/system
- GET  /api/admin/journal
- GET  /api/admin/gdpr/[userId]
- DELETE /api/admin/gdpr/delete/[userId]
- GET  /api/admin/prospection/contacts
- POST /api/admin/prospection/contacts
- GET  /api/admin/prospection/contacts/[id]
- PUT  /api/admin/prospection/contacts/[id]
- DELETE /api/admin/prospection/contacts/[id]
- GET  /api/admin/prospection/campaigns
- POST /api/admin/prospection/campaigns
- GET  /api/admin/prospection/campaigns/[id]
- PUT  /api/admin/prospection/campaigns/[id]
- POST /api/admin/prospection/campaigns/[id]/start
- POST /api/admin/prospection/campaigns/[id]/pause
- GET  /api/admin/prospection/lists
- POST /api/admin/prospection/lists
- GET  /api/admin/prospection/templates
- POST /api/admin/prospection/templates

## /api/artisan/
- GET  /api/artisan/profile
- PUT  /api/artisan/profile
- GET  /api/artisan/stats
- GET  /api/artisan/avis
- POST /api/artisan/avis/[id]/response
- GET  /api/artisan/messages
- POST /api/artisan/messages
- GET  /api/artisan/leads
- GET  /api/artisan/leads/[id]
- POST /api/artisan/leads/[id]/action
- GET  /api/artisan/leads/[id]/history
- POST /api/artisan/devis
- GET  /api/artisan/devis/[id]
- GET  /api/artisan/demandes
- GET  /api/artisan/equipe
- POST /api/artisan/equipe
- PUT  /api/artisan/equipe/[id]
- DELETE /api/artisan/equipe/[id]
- GET  /api/artisan/provider
- PUT  /api/artisan/settings
- GET  /api/artisan/subscription
- POST /api/artisan/claim

## /api/client/
- GET  /api/client/profile
- PUT  /api/client/profile
- GET  /api/client/avis
- POST /api/client/avis
- PUT  /api/client/avis
- DELETE /api/client/avis
- GET  /api/client/messages
- POST /api/client/messages
- GET  /api/client/demandes
- GET  /api/client/leads
- GET  /api/client/leads/[id]
- POST /api/client/leads/[id]/accept
- POST /api/client/leads/[id]/refuse
- POST /api/client/leads/claim

## /api/bookings/
- GET  /api/bookings
- POST /api/bookings
- GET  /api/bookings/[id]
- POST /api/bookings/[id]/cancel
- POST /api/bookings/[id]/reschedule

## /api/user/
- GET  /api/user/preferences
- PUT  /api/user/preferences
# ATTENTION: /api/user/profile N'EXISTE PAS — utiliser /api/client/profile

## /api/gdpr/
- GET  /api/gdpr/delete
- POST /api/gdpr/delete
- DELETE /api/gdpr/delete
- POST /api/gdpr/export
- GET  /api/gdpr/consent
- POST /api/gdpr/consent

## /api/notifications/
- GET  /api/notifications
- POST /api/notifications/[id]/read
- POST /api/notifications/read-all

## /api/reviews/ (public)
- GET  /api/reviews
- POST /api/reviews
- GET  /api/reviews/featured
- POST /api/reviews/vote
- GET/POST /api/reviews/bulk

## /api/providers/ (public)
- GET  /api/providers/listing
- GET  /api/providers/by-city
- POST /api/providers/bulk

## /api/quotes/ (public/artisan)
- GET  /api/quotes
- POST /api/quotes
- GET  /api/quotes/[id]

## /api/devis/
- POST /api/devis

## /api/messages/ (public messaging)
- GET  /api/messages/[id]
- PUT  /api/messages/[id]
- DELETE /api/messages/[id]
- POST /api/messages/[id]/reactions
- POST /api/messages/[id]/read
- GET  /api/messages/search
- POST /api/messages/upload

## /api/conversations/
- POST /api/conversations/[id]/archive

## Autres routes existantes
- GET  /api/artisans/[id]
- GET  /api/availability
- GET  /api/availability/slots
- GET  /api/geo/menu-data
- GET  /api/geocode
- GET  /api/health
- POST /api/contact
- POST /api/newsletter
- POST /api/inscription-artisan
- GET  /api/stats/public
- POST /api/push/subscribe
- POST /api/stripe/create-checkout
- POST /api/stripe/create-portal
- POST /api/stripe/webhook
- POST /api/verify/siret
- POST /api/verify/entreprise
- GET  /api/sitemap-index
- POST /api/revalidate
- GET  /api/indexnow
- GET  /api/widget
- POST /api/cron/send-reminders
- POST /api/cron/send-reminders-1h
- POST /api/cron/send-review-requests
- POST /api/cron/calculate-trust-badges
- POST /api/cron/recalculate-quality
- POST /api/cron/prospection-process
- POST /api/prospection/unsubscribe
- GET/POST /api/portfolio
- POST /api/portfolio/upload
- POST /api/portfolio/reorder
- GET/PUT/DELETE /api/portfolio/[id]

## ROUTES INEXISTANTES (appelées parfois par le front)
- /api/user/profile — N'EXISTE PAS
- /api/payments/invoices — N'EXISTE PAS
- /api/artisan/notifications — N'EXISTE PAS (utiliser /api/notifications)
- /api/admin/subscriptions — route existe MAIS table subscriptions n'existe pas
