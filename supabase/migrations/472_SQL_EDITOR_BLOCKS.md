# Migration 472 — Blocs copy-paste Supabase SQL Editor

Appliquer dans l'ordre A → B → C → D → E1 → E2 → F → G → H.

Chaque bloc est autonome, idempotent (DROP IF EXISTS + CREATE).
**Pas de `$$` imbriqué** (Supabase SQL editor quirk).
Coller, "Run", attendre NOTICE, passer au suivant.

---

## BLOC A — Référentiels publics (RLS ON + SELECT public)

```sql
DO LANGUAGE plpgsql
$BODY$
DECLARE
  v_public_refs TEXT[] := ARRAY[
    'cee_forfaits','cee_operations_ref','canonical_urls','coverage_zones',
    'roles','schema_markup','seo_pages','sitemaps','content_freshness',
    'data_sources','indexation_status','internal_links'
  ];
  v_table TEXT;
BEGIN
  FOREACH v_table IN ARRAY v_public_refs LOOP
    IF to_regclass('public.' || quote_ident(v_table)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', v_table);
      EXECUTE format('DROP POLICY IF EXISTS "Public read %I" ON public.%I', v_table, v_table);
      EXECUTE format('CREATE POLICY "Public read %I" ON public.%I FOR SELECT TO anon, authenticated USING (TRUE)', v_table, v_table);
      RAISE NOTICE 'OK % : RLS ON + SELECT public', v_table;
    ELSE
      RAISE NOTICE 'SKIP % : table absente', v_table;
    END IF;
  END LOOP;
END
$BODY$;
```

---

## BLOC B — Service-role only (RLS + FORCE, deny all)

```sql
DO LANGUAGE plpgsql
$BODY$
DECLARE
  v_service_only TEXT[] := ARRAY[
    'cee_simulator_events','commissions','client_booking_history',
    'devis_requests','gift_card_transactions','prospection_messages_default',
    'provider_stats','search_logs','user_behaviors'
  ];
  v_table TEXT;
BEGIN
  FOREACH v_table IN ARRAY v_service_only LOOP
    IF to_regclass('public.' || quote_ident(v_table)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', v_table);
      EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', v_table);
      RAISE NOTICE 'OK % : RLS + FORCE (service_role only)', v_table;
    ELSE
      RAISE NOTICE 'SKIP % : table absente', v_table;
    END IF;
  END LOOP;
END
$BODY$;
```

---

## BLOC C — audit_logs (admin read + insert)

```sql
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_logs_admin_read ON public.audit_logs;
CREATE POLICY audit_logs_admin_read ON public.audit_logs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

DROP POLICY IF EXISTS audit_logs_admin_insert ON public.audit_logs;
CREATE POLICY audit_logs_admin_insert ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));
```

---

## BLOC D — artisan_slot_stats (owner/admin read)

```sql
ALTER TABLE public.artisan_slot_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artisan_slot_stats FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS artisan_slot_stats_owner_read ON public.artisan_slot_stats;
CREATE POLICY artisan_slot_stats_owner_read ON public.artisan_slot_stats
  FOR SELECT TO authenticated
  USING (
    artisan_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );
```

---

## BLOC E1 — answers (published read + pending insert + admin write + PII revoke)

```sql
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS answers_public_read_published ON public.answers;
CREATE POLICY answers_public_read_published ON public.answers
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS answers_anon_submit ON public.answers;
CREATE POLICY answers_anon_submit ON public.answers
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    (status IS NULL OR status = 'pending')
    AND is_accepted IS NOT TRUE
    AND moderated_at IS NULL
  );

DROP POLICY IF EXISTS answers_admin_update ON public.answers;
CREATE POLICY answers_admin_update ON public.answers
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

DROP POLICY IF EXISTS answers_admin_delete ON public.answers;
CREATE POLICY answers_admin_delete ON public.answers
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

REVOKE SELECT (author_email) ON public.answers FROM anon, authenticated;
```

---

## BLOC E2 — questions (published read + pending insert + admin write)

```sql
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS questions_public_read_published ON public.questions;
CREATE POLICY questions_public_read_published ON public.questions
  FOR SELECT TO anon, authenticated
  USING (status = 'published' OR status IS NULL);

DROP POLICY IF EXISTS questions_anon_submit ON public.questions;
CREATE POLICY questions_anon_submit ON public.questions
  FOR INSERT TO anon, authenticated
  WITH CHECK (status IS NULL OR status = 'pending');

DROP POLICY IF EXISTS questions_admin_write ON public.questions;
CREATE POLICY questions_admin_write ON public.questions
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

DROP POLICY IF EXISTS questions_admin_delete ON public.questions;
CREATE POLICY questions_admin_delete ON public.questions
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));
```

Si la colonne `author_email` existe sur `questions`, ajouter ensuite :

```sql
REVOKE SELECT (author_email) ON public.questions FROM anon, authenticated;
```

---

## BLOC F — Vues SECURITY DEFINER → INVOKER

```sql
ALTER VIEW public.v_admin_dashboard SET (security_invoker = true);
ALTER VIEW public.v_public_stats SET (security_invoker = true);
ALTER VIEW public.lead_exclusivity_audit SET (security_invoker = true);
ALTER VIEW public.v_service_location_pages SET (security_invoker = true);
ALTER VIEW public.cee_operations_ref_v SET (security_invoker = true);
```

Si une vue n'existe pas, retirer sa ligne. Vérif après :

```sql
SELECT c.relname AS view_name,
       COALESCE((SELECT option_value FROM pg_options_to_table(c.reloptions)
                 WHERE option_name = 'security_invoker' LIMIT 1), 'false') AS invoker
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'v'
  AND c.relname IN ('v_admin_dashboard','v_public_stats','lead_exclusivity_audit',
                    'v_service_location_pages','cee_operations_ref_v');
```

---

## BLOC G — REVOKE column-level PII

```sql
DO LANGUAGE plpgsql
$BODY$
DECLARE
  v_revokes TEXT[][] := ARRAY[
    ARRAY['cee_simulator_events','email'],
    ARRAY['cee_simulator_events','phone'],
    ARRAY['cee_simulator_events','postal_code'],
    ARRAY['cee_simulator_events','ip_address'],
    ARRAY['search_logs','query'],
    ARRAY['search_logs','ip_address'],
    ARRAY['search_logs','user_agent'],
    ARRAY['user_behaviors','user_id'],
    ARRAY['user_behaviors','ip_address'],
    ARRAY['user_behaviors','session_id']
  ];
  i INT;
  v_table TEXT;
  v_col TEXT;
BEGIN
  FOR i IN 1..array_length(v_revokes, 1) LOOP
    v_table := v_revokes[i][1];
    v_col   := v_revokes[i][2];
    IF to_regclass('public.' || quote_ident(v_table)) IS NOT NULL
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='public' AND table_name=v_table AND column_name=v_col) THEN
      EXECUTE format('REVOKE SELECT (%I) ON public.%I FROM anon, authenticated', v_col, v_table);
      RAISE NOTICE 'OK REVOKE %.%', v_table, v_col;
    ELSE
      RAISE NOTICE 'SKIP %.% (absente)', v_table, v_col;
    END IF;
  END LOOP;
END
$BODY$;
```

---

## BLOC H — VERIFY (fail-loud si résiduel)

```sql
DO LANGUAGE plpgsql
$BODY$
DECLARE
  v_missing TEXT := '';
  v_required TEXT[] := ARRAY[
    'audit_logs','answers','artisan_slot_stats','canonical_urls',
    'cee_forfaits','cee_operations_ref','cee_simulator_events',
    'commissions','client_booking_history','coverage_zones',
    'content_freshness','data_sources','devis_requests',
    'gift_card_transactions','indexation_status','internal_links',
    'roles','schema_markup','search_logs','seo_pages',
    'prospection_messages_default','provider_stats','questions',
    'sitemaps','user_behaviors'
  ];
  v_t TEXT;
BEGIN
  FOREACH v_t IN ARRAY v_required LOOP
    IF to_regclass('public.' || quote_ident(v_t)) IS NOT NULL THEN
      IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname='public' AND c.relname=v_t AND c.relrowsecurity=TRUE
      ) THEN
        v_missing := v_missing || v_t || ' ';
      END IF;
    END IF;
  END LOOP;
  IF v_missing <> '' THEN
    RAISE EXCEPTION 'VERIFY FAILED — RLS toujours OFF sur : %', v_missing;
  END IF;
  RAISE NOTICE 'VERIFY OK — RLS actif sur toutes les tables';
END
$BODY$;
```

---

## Après application : relancer le linter Supabase

Dashboard → Advisors → "Run linter". Les 33 alertes CRITICAL doivent tomber à 0.

Si une table listée par le linter n'était pas dans ma liste, créer un bloc dédié (ENABLE + FORCE + eventuelle policy SELECT selon contenu).
