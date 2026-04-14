# PR2 Reconnaissance — Activation artisan CEE

**Date** : 2026-04-14
**Status** : ✅ Recon terminée, prêt à implémenter

---

## Verdict : **FEU VERT — tous les patterns dispo, 3 gaps à combler**

---

## Disponible (réutiliser)

| Besoin | Chemin | Usage PR2 |
|---|---|---|
| Envoi email | `src/lib/email/resend.ts` | Invite artisan, relances |
| Template email CEE | `src/lib/cee/emails.ts` | Ajouter `sendCeePartnerInvite`, `sendCeeCertificationEmail` |
| HMAC webhook verify | `src/lib/prospection/webhook-security.ts` | Pattern pour `verifyYousignSignature` |
| CRON_SECRET extract | `src/app/api/cron/cee-relance/route.ts` | Idem côté Yousign webhook (header alt) |
| Admin auth | `src/lib/admin-auth.ts` | `requirePermission('cee_partners', 'write')` |
| /espace-artisan/cee | `src/app/(private)/espace-artisan/cee/page.tsx` | Ajouter `/onboarding/*` |
| React PDF | `@react-pdf/renderer@3.3.0` | Composant `ConventionPDF.tsx` |
| Dispatcher devis→CEE | `src/lib/cee/dispatcher-integration.ts` | Référence pour `createCeeLead()` |

## Gaps (à créer)

| Gap | Solution |
|---|---|
| SDK Yousign | HTTP direct (pas de SDK npm officiel fiable) — wrapper maison `src/lib/cee/yousign.ts` |
| Helper IBAN encrypt | `src/lib/cee/iban-crypto.ts` — appelle `pgp_sym_encrypt` côté SQL avec `CEE_IBAN_KEY` |
| `createCeeLead()` | `src/lib/cee/leads-service.ts` |
| `cee_partners` perm | Ajouter à `src/types/admin.ts` + RBAC matrix |
| Env vars | `CEE_IBAN_KEY`, `YOUSIGN_API_KEY`, `YOUSIGN_WEBHOOK_SECRET` → `.env.example` + Vercel |

## Routes API PR2

```
POST /api/cee/partners/invite-batch        # requirePermission('cee_partners','write') + Resend batch
GET  /api/cee/partners/me                  # auth artisan → lit cee_artisan_partners WHERE user_id=auth.uid()
POST /api/cee/partners/onboarding/iban     # chiffre via pgp_sym_encrypt(iban, CEE_IBAN_KEY), store iban_last4
POST /api/cee/partners/onboarding/convention  # Yousign POST /signature_requests → stocke envelope_id
POST /api/webhooks/yousign                 # HMAC verify + update convention_signed_at + pdf_url
POST /api/cee/partners/training/quiz       # valide réponses, score, si >=8/10 → certified
POST /api/cee/partners/activate            # status certified → active (manuel admin OU auto si quiz OK)
```

## UI à créer

```
src/app/(private)/espace-artisan/cee/onboarding/
├── page.tsx                    # Wizard 5 étapes (server component + client state)
├── step-welcome.tsx            # Client: présentation rôle SA Energy
├── step-iban.tsx               # Client: form IBAN+BIC+titulaire
├── step-convention.tsx         # Client: trigger Yousign, affiche iframe signature
├── step-training.tsx           # Client: 4 vidéos + quiz 10 Q
└── step-activate.tsx           # Client: récap + CTA activer
```

## Décisions

1. **Yousign over DocuSign** (cf. migration 430, colonnes `yousign_envelope_id`/`yousign_procedure_id`). Plan V3 §5.5 mentionne "DocuSign" par erreur — **tout Yousign**.
2. **HTTP direct Yousign v3 API** (pas de SDK) — aligné pattern Resend/Svix déjà dans le repo.
3. **IBAN : chiffrage côté SQL** via `pgp_sym_encrypt(iban, CEE_IBAN_KEY)` en bind parameter. Node chiffre PAS, juste relaie la clé. Cohérent avec migration 430.
4. **Quiz auto-certify** si score >= 8/10 (bypass validation admin), sinon escalation manuelle.

## Ordre d'implémentation (atomic commits)

1. `src/types/admin.ts` — ajouter resource `cee_partners`
2. `.env.example` — 3 vars
3. `src/lib/cee/iban-crypto.ts` + test unit
4. `src/lib/cee/yousign.ts` (create request, get envelope, webhook verify) + test unit
5. `src/lib/cee/leads-service.ts` — `createCeeLead()`, `createCeePartner()`, `updateCeePartnerStatus()`
6. `src/lib/cee/emails.ts` — ajout 3 templates
7. 7 routes API (1 commit par route avec tests)
8. `src/components/cee/ConventionPDF.tsx` (template arrêté 2/11/2023, 6 mentions)
9. UI wizard 5 étapes
10. Vitest suite cee-partners-api
