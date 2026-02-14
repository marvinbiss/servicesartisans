# Checklist de Deploiement — Module Prospection

## 1. Variables d'environnement (Vercel Dashboard)

### Obligatoires
```env
# Secret pour signer les liens de desinscription (generer avec: openssl rand -base64 32)
UNSUBSCRIBE_SECRET=<votre_secret_64_chars>

# Twilio (SMS + WhatsApp)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+33...         # Numero SMS
TWILIO_WHATSAPP_NUMBER=+33...      # Numero WhatsApp Business

# Resend (Email)
RESEND_API_KEY=re_...
RESEND_WEBHOOK_SECRET=whsec_...    # Depuis Resend Dashboard > Webhooks

# IA (au moins un des deux)
ANTHROPIC_API_KEY=sk-ant-...       # Pour Claude
OPENAI_API_KEY=sk-...              # Pour OpenAI (fallback)
```

### Deja configurees (verifier qu'elles existent)
```env
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=https://servicesartisans.fr
```

---

## 2. Migration Supabase

La migration 302 est deja appliquee. Verifier :

```sql
-- Verifier que les tables existent
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'prospection_%';
-- Attendu: 9+ tables (contacts, lists, list_members, templates, campaigns, messages, conversations, conversation_messages, ai_settings, unsubscribe_tokens)

-- Verifier la contrainte consent
SELECT conname FROM pg_constraint WHERE conname = 'chk_consent_no_unknown';
-- Attendu: 1 ligne

-- Verifier le singleton AI settings
SELECT id FROM prospection_ai_settings;
-- Attendu: 00000000-0000-0000-0000-000000000001

-- Verifier le trigger state machine
SELECT tgname FROM pg_trigger WHERE tgname = 'prosp_campaigns_validate_transition';
-- Attendu: 1 ligne
```

### Creer la premiere partition messages

```sql
-- Partition pour le mois en cours (adapter la date)
CREATE TABLE IF NOT EXISTS prospection_messages_2026_02
  PARTITION OF prospection_messages
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- Partition mois suivant (anticiper)
CREATE TABLE IF NOT EXISTS prospection_messages_2026_03
  PARTITION OF prospection_messages
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
```

> Repeter chaque mois, ou automatiser avec un cron SQL / pg_cron.

---

## 3. Configurer les webhooks externes

### Twilio
1. Aller sur https://console.twilio.com
2. Phone Numbers > votre numero > Messaging
3. **Status Callback URL** : `https://servicesartisans.fr/api/admin/prospection/webhooks/twilio`
4. **Incoming Message URL** : `https://servicesartisans.fr/api/admin/prospection/webhooks/twilio-incoming`
5. Meme chose pour le numero WhatsApp Business

### Resend
1. Aller sur https://resend.com/webhooks
2. Ajouter un endpoint : `https://servicesartisans.fr/api/admin/prospection/webhooks/resend`
3. Evenements a cocher : `email.sent`, `email.delivered`, `email.bounced`, `email.complained`, `email.delivery_delayed`
4. Copier le **Signing Secret** (whsec_...) dans `RESEND_WEBHOOK_SECRET`

---

## 4. Cron Jobs (Vercel Cron)

Ajouter dans `vercel.json` :

```json
{
  "crons": [
    {
      "path": "/api/admin/prospection/campaigns/process",
      "schedule": "*/2 * * * *"
    }
  ]
}
```

> Note : La route `/api/admin/prospection/campaigns/process` n'existe pas encore.
> Alternative : appeler `processBatch()` depuis un cron externe (GitHub Actions, Railway, etc.)
> qui fait un POST sur `/api/admin/prospection/campaigns/{id}/send` pour chaque campagne active.

### Cron partitions mensuelles (optionnel, via pg_cron dans Supabase)

```sql
-- Dans Supabase SQL Editor, activer pg_cron puis :
SELECT cron.schedule('create-monthly-partition', '0 0 25 * *',
  $$ SELECT create_monthly_partition() $$
);
```

---

## 5. Permissions admin

Verifier que le role admin a la permission `prospection` :

```sql
-- Verifier les permissions dans admin_users
SELECT id, email, role, permissions->'prospection' as prosp_perms
FROM admin_users
WHERE role IN ('super_admin', 'admin');
```

Si la permission `prospection` n'apparait pas, mettre a jour :

```sql
UPDATE admin_users
SET permissions = permissions || '{"prospection": {"read": true, "write": true, "send": true, "ai": true}}'::jsonb
WHERE role = 'super_admin';
```

---

## 6. Test en conditions reelles

### Etape 1 : Creer un contact test
```
POST /api/admin/prospection/contacts
{
  "contact_type": "artisan",
  "contact_name": "Test Artisan",
  "email": "votre-email@test.com",
  "phone": "+33612345678",
  "city": "Paris",
  "department": "75"
}
```

### Etape 2 : Creer un template email
```
POST /api/admin/prospection/templates
{
  "name": "Test Email",
  "channel": "email",
  "subject": "Test Prospection - {{company_name}}",
  "body": "Bonjour {{contact_name}},\n\nCeci est un test.\n\n{{unsubscribe_link}}"
}
```

### Etape 3 : Creer une liste + ajouter le contact
```
POST /api/admin/prospection/lists
{ "name": "Test Batch" }

POST /api/admin/prospection/lists/{list_id}/members
{ "contact_ids": ["{contact_id}"] }
```

### Etape 4 : Creer et lancer une campagne (1 seul destinataire)
```
POST /api/admin/prospection/campaigns
{
  "name": "Test Campagne",
  "channel": "email",
  "audience_type": "artisan",
  "template_id": "{template_id}",
  "list_id": "{list_id}",
  "batch_size": 1
}

POST /api/admin/prospection/campaigns/{campaign_id}/send
```

### Etape 5 : Verifier
- [ ] Email recu dans la boite de reception
- [ ] Statut message passe a `sent` puis `delivered` (via webhook Resend)
- [ ] Lien de desinscription fonctionne
- [ ] Stats campagne mises a jour

### Etape 6 : Tester SMS (optionnel)
Meme procedure avec `"channel": "sms"` et un template SMS.

### Etape 7 : Tester WhatsApp (optionnel)
Meme procedure avec `"channel": "whatsapp"` et un template WhatsApp approuve.

---

## 7. Monitoring post-deploiement

- [ ] Verifier les logs Vercel pour erreurs sur les routes `/api/admin/prospection/*`
- [ ] Surveiller les webhooks Twilio/Resend (logs dans leurs dashboards respectifs)
- [ ] Verifier que `reconcileOrphanedMessages()` recupere les messages bloques
- [ ] Configurer alertes Sentry/Datadog si disponible

---

## 8. RGPD — Avant le premier envoi reel

- [ ] Verifier que tous les contacts ont `consent_status = 'opted_in'` avant envoi
- [ ] Lien de desinscription present dans tous les templates email
- [ ] Mot-cle STOP detecte pour SMS/WhatsApp (webhook twilio-incoming)
- [ ] Fonction `prospection_gdpr_erase()` testee sur un contact fictif
- [ ] Politique de retention : planifier la suppression des partitions > 24 mois

---

## Ordre recommande

1. Variables d'environnement
2. Partitions messages
3. Permissions admin
4. Webhooks Twilio + Resend
5. Test email avec 1 contact
6. Test SMS avec 1 contact
7. Cron job
8. Premier batch reel (10-50 contacts)
