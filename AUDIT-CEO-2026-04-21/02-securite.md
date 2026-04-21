# Audit Sécurité — ServicesArtisans 2026-04-21

**Verdict : 3.5/10 — État de crise**

## P0 — SECRETS COMMITÉS (.env.local, CVSS 9.8)

`.env.local:1-17` contient en clair et versionné dans Git :

- `SUPABASE_SERVICE_ROLE_KEY` (eyJ...6hXd...)
- `ANTHROPIC_API_KEY` (sk-ant-api03-yde9...)
- `GOOGLE_PLACES_API_KEY`
- `SCRAPER_API_KEY`
- `INDEXNOW_API_KEY`
- `SUPABASE_DB_PASSWORD`

Exploit : RCE via Anthropic, admin Supabase (bypass RLS), harvesting 50K+ contacts.

## P0 — CRONS SANS PROTECTION SYSTÉMATIQUE (CVSS 8.9)

31 crons dans `src/app/api/cron/**`. 2 vérifient `CRON_SECRET`, 29 non.
Exemple OK : `send-reminders/route.ts:12-24`, `pipedrive-retry/route.ts:33-39`.
Exploit : envoi SMS masse, génération devis frauduleux, injection Pipedrive.

## P0 — RLS PROFILES OPEN (CVSS 8.5)

`supabase/migrations/101_v2_rls_policies.sql:44-46` :

```sql
CREATE POLICY "Public can view basic profile info" ON profiles
  FOR SELECT USING (TRUE);
```

Tous les profils artisans (email, phone, SIRET) lisibles anon → GDPR violation.

## P0 — @supabase/ssr 0.1.0 EOL (CVSS 8.1)

`package.json:44` : version EOL, padding oracle possible SSR token refresh.
`@capacitor/android ^8.0.2` : WebView CVEs.

## P1 — PIPEDRIVE CSV INJECTION (CVSS 7.8)

Champs devis (service/city) envoyés sans sanitize → `=cmd|'/c calc'` dans Excel = RCE user.

## P1 — WEBHOOK COVERAGE INCOMPLET (CVSS 7.5)

Yousign + IndexNow signent HMAC-SHA256 OK.
Pas de webhook Stripe détecté — si présent ailleurs, à vérifier.

## P1 — PATH TRAVERSAL MESSAGES/UPLOAD (CVSS 7.2)

`src/app/api/messages/upload/route.ts:96-102` : pas de whitelist extensions stricte. `malicious.gif.php` passable.
Portfolio OK (`portfolio/upload/route.ts:61-71`).

## P1 — ADMIN AUTH GAPS (CVSS 6.9)

30+ routes `/api/admin/*` — certaines utilisent `createAdminClient()` sans `requirePermission()` préalable.

## P1 — SSRF PARTIEL (CVSS 6.5)

`yousign/route.ts:184-201` : allowlist OK. Risque futur si fetch sur `convention_pdf_url` stocké.

## P2 — RATE LIMITER FAIL-OPEN (CVSS 5.3)

`src/middleware.ts:281-284` : Redis down → requests passent. Flood `/api/devis` possible.

## Quick Wins 24h

1. Git filter-branch `.env.local` + rotate tous secrets + Vercel env vars
2. Enforce `CRON_SECRET` check sur les 29 crons manquants
3. Drop RLS profiles policy + VIEW `artisans_public(id, full_name)`
