# Runbook incident — ServicesArtisans

Document minimal pour diagnostiquer et restaurer un incident de production.

## Checklist 5 premières minutes

1. Vérifier status Vercel : https://vercel-status.com
2. Vérifier status Supabase : https://status.supabase.com
3. Vérifier Sentry dernières erreurs : dashboard Sentry / mobile
4. Vérifier rate limiters : `/api/health` répond 200 ?
5. Si 5xx sur toutes les pages → bascule sur les logs Vercel Deployment en cours

## Scénarios courants

### Supabase down / outage

- Symptome : 500 sur `/api/devis`, `/api/cron/*`, fiches artisans vides
- Impact : Les pages pSEO servent le cache ISR stale (pas de rupture SEO immédiate)
- Action : Attendre restauration (SLA Supabase 99.9%). Communiquer aux artisans via newsletter si > 2h.
- Fallback : Pas de failover DB en place. Accepter la dégradation.

### Pipedrive API down

- Symptome : devis créés mais pas dans CRM
- Impact : Leads créés dans `devis_requests`, simplement pas sync Pipedrive
- Action : le cron `pipedrive-retry` (toutes les 6h) retente avec backoff expo
- Vérification : `SELECT count(*) FROM devis_requests WHERE pipedrive_deal_id IS NULL AND created_at > now() - interval '24h'`

### Reviews flywheel panne

- Symptome : aucun email d'invitation avis envoyé depuis X jours
- Impact : flywheel SEO grippé
- Diagnostic :
  - Logs Vercel cron `send-review-invitations` : erreurs ?
  - `SELECT count(*) FROM review_invitations WHERE sent_at IS NULL AND scheduled_at < now() - interval '1d' AND expires_at > now()`
  - Vérifier Resend API quota + `FROM_EMAIL` DKIM/SPF OK
- Action : relancer manuellement `curl -H "Authorization: Bearer $CRON_SECRET" https://servicesartisans.fr/api/cron/send-review-invitations`

### Lead exclusivity violation (P0)

- Symptome : un artisan reporte qu'il partage un lead
- Impact : CRITIQUE — violation de la règle commerciale, risque DGCCRF
- Diagnostic :
  ```sql
  SELECT lead_id, COUNT(*) FILTER (WHERE status IN ('pending', 'viewed', 'quoted')) AS active
  FROM lead_assignments
  GROUP BY lead_id
  HAVING COUNT(*) FILTER (WHERE status IN ('pending', 'viewed', 'quoted')) > 1;
  ```
- Action :
  1. Si doublon trouvé → statut `declined` sur le plus récent
  2. Vérifier que trigger `trg_lead_exclusivity` est actif : `SELECT * FROM pg_trigger WHERE tgname = 'trg_lead_exclusivity'`
  3. Vérifier `SELECT max_artisans_per_lead FROM algorithm_config` = 1
- Escalation : si la contrainte DB a été désactivée par un autre admin → audit immédiat

### Supabase migration cassée en prod

- Symptome : erreur 500 après déploiement avec nouvelle migration
- Action : revert migration manuellement via SQL editor (voir bloc `-- Rollback` en fin de chaque migration). Redéployer avec le code de la version précédente en parallèle.

## Backups DB

- **Supabase Pro** : snapshot quotidien (7 jours), PITR si activé
- **À confirmer** : `pg_dump` offsite hebdo vers S3 privé (à mettre en place — prio P1 Sprint 1)
- **Test restauration** : à faire 1x/mois sur env dev, sinon on n'a aucune garantie que le backup fonctionne

## Variables d'env critiques

| Variable                        | Usage                    | Si absente                      |
| ------------------------------- | ------------------------ | ------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | DB                       | Site down                       |
| `SUPABASE_SERVICE_ROLE_KEY`     | API + crons              | Site dégradé                    |
| `CRON_SECRET`                   | Bearer auth des crons    | Tous les crons ouverts (faille) |
| `FROM_EMAIL` + `RESEND_API_KEY` | Emails                   | Aucune notification             |
| `PIPEDRIVE_API_KEY` + `_DOMAIN` | CRM                      | Leads stockés sans CRM          |
| `REVIEW_HMAC_SECRET`            | Ancien flux review token | Booking reviews désactivés      |

## Observabilité

- Sentry : errors (5xx, exceptions)
- Vercel Analytics : core web vitals, 4xx/5xx rates
- GSC : indexation, impressions, clics (pas accessible depuis MCP, collage manuel user)
- Supabase Dashboard : slow queries, RLS errors, rate limiter metrics

## Commandes utiles

```bash
# Logs cron en direct
vercel logs --prod --since=1h /api/cron/send-review-invitations

# Force rebuild d'une page
curl -X POST "https://servicesartisans.fr/api/revalidate?path=/services/plombier/paris" \
  -H "Origin: https://servicesartisans.fr"

# Smoke test lead flow
curl -X POST https://servicesartisans.fr/api/devis \
  -H "Content-Type: application/json" \
  -H "Origin: https://servicesartisans.fr" \
  -d '{"service":"plombier","urgency":"flexible","telephone":"0601020304"}'
```

## Contacts

- Supabase support : dashboard → Help
- Vercel support : dashboard → Help (Pro plan)
- Resend support : resend.com/docs
- Pipedrive support : via API token dashboard

## Bus factor

Un seul dev actuellement. **Point de défaillance unique.**
Mitigation en cours : recrutement dev senior (S1.14).
En attendant : commits fréquents, push après chaque étape atomique,
migrations documentées avec bloc rollback systématique.
