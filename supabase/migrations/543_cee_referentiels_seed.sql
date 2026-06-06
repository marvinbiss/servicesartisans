-- Migration 543: Seed référentiels CEE — débloque le tunnel création dossier
-- Date 2026-06-06
--
-- Constat : zones_climatiques_ref, cee_operations_ref et cee_forfaits étaient
-- VIDES en prod depuis mig 424. Les FK NOT NULL de cee_dossiers
-- (client_commune_insee, operation_code, forfait_id) rendaient tout INSERT
-- impossible → le tunnel /espace-artisan/cee/nouveau n'a jamais pu fonctionner.
--
-- 543.1  cee_operations_ref : 7 fiches BAR couvertes par le tunnel artisan,
--        codes alignés sur src/lib/cee/forfaits-cee-2026.ts (source Légifrance
--        arrêté 22/12/2014 modifié). date_debut = activation tunnel SA Energy,
--        pas la date réglementaire de la fiche.
-- 543.2  zones_climatiques_ref : 34 969 communes depuis la table communes,
--        zone H1/H2/H3 par département (RT2012 annexe, sous-zones collapsées —
--        même mapping que src/lib/shared/climate-zones-data.ts). DOM → H1 par
--        défaut (parité avec postalCodeToClimateZone ; RTAA DOM hors scope).
-- 543.3  cee_forfaits : barème indicatif interne v1 (7 ops × 3 zones × 4
--        catégories revenus). Le montant opposable PNCEE est recalculé au
--        dépôt délégataire — source_doc le rappelle explicitement.

BEGIN;

-- ---------------------------------------------------------------------------
-- 543.1  cee_operations_ref
-- ---------------------------------------------------------------------------
INSERT INTO public.cee_operations_ref (code, libelle, famille, fiche_url, date_debut) VALUES
  ('BAR-TH-171', 'Pompe à chaleur de type air/eau',                        'BAR', NULL, DATE '2026-01-01'),
  ('BAR-TH-129', 'Pompe à chaleur de type air/air',                        'BAR', NULL, DATE '2026-01-01'),
  ('BAR-EN-101', 'Isolation de combles ou de toitures',                    'BAR', NULL, DATE '2026-01-01'),
  ('BAR-EN-102', 'Isolation des murs',                                     'BAR', NULL, DATE '2026-01-01'),
  ('BAR-EN-103', 'Isolation d''un plancher',                               'BAR', NULL, DATE '2026-01-01'),
  ('BAR-TH-112', 'Appareil indépendant de chauffage au bois',              'BAR', NULL, DATE '2026-01-01'),
  ('BAR-TH-148', 'Chauffe-eau thermodynamique à accumulation',             'BAR', NULL, DATE '2026-01-01')
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 543.2  zones_climatiques_ref ← communes (34 969 rows)
-- Zone par département : H3 méditerranée, H2 océanique/sud-ouest, H1 reste.
-- Source sets : src/lib/shared/climate-zones-data.ts (arrêté 26/10/2010 RT2012).
-- ---------------------------------------------------------------------------
INSERT INTO public.zones_climatiques_ref (code_insee, code_postal, commune, departement, zone, note)
SELECT
  c.code_insee,
  CASE WHEN c.code_postal ~ '^[0-9]{5}$' THEN c.code_postal ELSE NULL END,
  c.name,
  c.departement_code,
  CASE
    WHEN c.departement_code IN ('06','11','13','2A','2B','30','34','66','83','84') THEN 'H3'
    WHEN c.departement_code IN (
      '14','17','22','29','35','44','50','56','76','85',
      '16','24','31','32','33','40','46','47','64','65','79','81','82','86',
      '04','07','09','12','26','48'
    ) THEN 'H2'
    ELSE 'H1'
  END,
  'Seed mig 543 (table communes) — zone par département RT2012, sous-zones collapsées'
FROM public.communes c
WHERE c.code_insee ~ '^[0-9AB]{5}$'
ON CONFLICT (code_insee) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 543.3  cee_forfaits — barème indicatif interne v1
-- prime_base_cts : forfait PAR GESTE (BAR-TH-*) ou PAR m² (BAR-EN-*, géré par
-- src/lib/cee/bareme.ts). Multiplicateurs : zone H1 ×1,2 / H2 ×1,0 / H3 ×0,8 ;
-- précarité (très modeste + modeste) ×1,5.
-- ---------------------------------------------------------------------------
INSERT INTO public.cee_forfaits
  (operation_code, zone, categorie_revenus, montant_kwh_cumac, prime_forfait_eur_cts, date_validite_debut, source_doc)
SELECT
  op.code,
  z.zone,
  cat.categorie,
  round(op.kwhc_base * z.mult)::bigint,
  round(op.prime_base_cts * z.mult * cat.mult)::bigint,
  DATE '2026-01-01',
  'Barème indicatif interne SA Energy v1 (2026-06) — montant opposable recalculé au dépôt délégataire'
FROM (VALUES
  ('BAR-TH-171', 30000, 80000),  -- PAC air/eau : 800 € / geste
  ('BAR-TH-129', 18000, 45000),  -- PAC air/air : 450 € / geste
  ('BAR-EN-101',  1500,  1200),  -- combles    :  12 € / m²
  ('BAR-EN-102',  2500,  2000),  -- murs       :  20 € / m²
  ('BAR-EN-103',  1200,  1000),  -- plancher   :  10 € / m²
  ('BAR-TH-112', 15000, 60000),  -- poêle bois : 600 € / geste
  ('BAR-TH-148', 20000, 70000)   -- CET        : 700 € / geste
) AS op(code, kwhc_base, prime_base_cts)
CROSS JOIN (VALUES
  ('H1', 1.2::numeric),
  ('H2', 1.0::numeric),
  ('H3', 0.8::numeric)
) AS z(zone, mult)
CROSS JOIN (VALUES
  ('tres_modeste',  1.5::numeric),
  ('modeste',       1.5::numeric),
  ('intermediaire', 1.0::numeric),
  ('superieur',     1.0::numeric)
) AS cat(categorie, mult)
ON CONFLICT (operation_code, zone, categorie_revenus, date_validite_debut) DO NOTHING;

COMMIT;
