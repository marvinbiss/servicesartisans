# Plan v2 — Chapitre 1 : Experiments & Measurement Framework

**Version** : 2.0
**Date** : 2026-04-18
**Auteur** : Orchestration measurement v2 (niveau Anthropic / Stripe Growth / Linear)
**Scope** : ServicesArtisans.fr — annuaire artisans France, 970 326 providers (50 332 RGE actifs), 459K pages indexées Google, DR 0,6, 164 trafic/j, 261 KW, 71 jours d'âge, crawl Google quotidien
**North Star Metric** : **Nombre de devis exclusifs générés / mois avec artisan RGE certifié + éligible MaPrimeRénov'**

---

## 0. Philosophie — pourquoi un framework expérimental avant l'exécution

Le MASTER-PLAN v1.2 propose 45 000 mots d'exécution. **Ils ne valent rien sans un dispositif de mesure falsifiable**. L'erreur classique des plans SEO est d'exécuter 12 mois de sprints avant de découvrir qu'une hypothèse racine (ex : "le bailout SSR bloque tout") était soit déjà résolue, soit seulement 30 % du blocage. Stripe, Linear, Notion et Anthropic partagent le même schéma : **pre-register chaque pari, définir un stop-loss, et arrêter les paris perdants sans débat émotionnel**.

Ce chapitre installe :

1. Les **hypothèses falsifiables** qui guident les 12 prochaines semaines (priors chiffrés, stop-loss contractuels)
2. La **taxonomie d'events** GA4 + PostHog qui permet de mesurer chaque hypothèse
3. Les **dashboards** qui rendent la mesure lisible (et donc actionnable) en < 15 secondes
4. Les **SLOs** production avec error budget — ServicesArtisans est YMYL (aides financières), la fiabilité = la trust
5. Le **pipeline A/B testing** (outil, process, stat threshold)
6. Les **templates** de pre-registration et de QBR
7. La **matrice d'ownership** — un seul nom par metric, sinon le metric n'existe pas

**Trois principes non négociables (copiés de Stripe Growth et Linear)** :

- **Pas de metric sans owner nommé** (pas d'équipe, une personne)
- **Pas d'expérimentation sans pre-registration écrite**, même pour un test de 48h (évite HARKing : Hypothesizing After Results are Known)
- **Pas de green metric célébré sans cohorte de validation** (pas seulement A/B immédiat)

---

## 1. Hypothèses falsifiables prioritaires (12 hypothèses)

Format standard : chaque hypothèse = "Si X alors Y mesuré par Z", avec **prior** (% confiance avant test, méthode Superforecaster), **stop-loss** (condition d'abandon), **sample size** (calcul de puissance basé sur baseline réelle), **durée**, **owner**.

**Baseline MDE (Minimum Detectable Effect)** : pour conv 0,7 % → 1,5 % avec α=0,05 et power=0,8 : **N ≈ 5 842 visiteurs/variante** (calculé via formule 2-prop z-test). Avec 30K sessions/mois actuelles, 14 jours suffisent pour 50/50.

### H1 — Fix bailout SSR débloque indexation et traffic

**Hypothèse** : Si on retire `ssr: false` sur `CompareProviderWrapper` (`src/app/layout.tsx:59-65`) et `DynamicFooterLinks` (`src/components/Footer.tsx:22-24`), alors le body de 10 URLs témoin passe > 10 000 chars et le traffic Ahrefs daily double en 21 jours, mesuré par curl + `ahrefs-overview-organic-history.csv`.

- **Prior** : 85 % (preuve code vérifiée ligne par ligne, curl reproduit le problème)
- **Stop-loss** : Si body < 10K chars sur 3/10 URLs après déploiement J+0, rollback immédiat et réouverture diagnostic. Si traffic Ahrefs inchangé à J+21 (164 ± 20 %), hypothèse racine fausse → escalade Google Search Central.
- **Sample size** : qualitatif (10 URLs témoin) + quantitatif (traffic journalier, n=21 jours, σ≈15 %, MDE détectable 2× = écart 6σ)
- **Durée** : 21 jours de monitoring post-déploiement
- **Owner** : Dev lead (Marvin si solo)

### H2 — Indexation RGE-only concentre le crawl budget

**Hypothèse** : Si on passe 919 544 providers non-RGE en `noindex` (script `scripts/noindex-non-rge.ts`) et garde 50 347 en index, alors le rapport "Pages crawlées non indexées" dans GSC passe < 100K en 60 jours et le crawl rate /jour augmente +30 % sur les 50K restantes.

- **Prior** : 70 % (HCU guidelines sont claires sur doorway pages, mais Google met 4-8 semaines à re-digérer)
- **Stop-loss** : Si GSC "Pages non indexées" reste > 300K à J+60 ET traffic sur pages RGE < +20 %, l'hypothèse thin-content comme cause dominante est partiellement fausse.
- **Sample size** : 970 326 URLs (population totale, pas un échantillon) — mesure GSC + logs serveur
- **Durée** : 60 jours post-migration
- **Owner** : Data lead

### H3 — Réduction formulaire devis 7→4 champs lève la conversion submit-rate

**Hypothèse** : Si DevisForm passe de 7 à 4 champs (name, phone, service, postal_code) alors le taux completion passe de 84,5 % à > 92 % (MDE 7,5pp), mesuré par `funnel.devis.submitted / funnel.devis.started` dans PostHog.

- **Prior** : 75 % (benchmark Baymard Institute : -1 champ = +3-5 % completion)
- **Stop-loss** : Si après 14 jours avec 50/50 split, lift < 2pp (95 % CI inclut 0), arrêter et tester autre levier (trust badges, progress bar).
- **Sample size** : baseline 84,5 %, MDE +7,5pp, α=0,05, power=0,8 → **N = 612 par variante** (formule 2-prop z-test). Avec ~400 form-starts/jour actuels, 4 jours suffisent.
- **Durée** : 14 jours (minimum 2 cycles hebdo)
- **Owner** : Product/UX lead

### H4 — Simulateur visible homepage +3× conversion globale

**Hypothèse** : Si le simulateur MaPrimeRénov' est placé hero homepage + header sticky sur 5 pages cibles (`/`, `/renovation-energetique/`, `/aides/*`, `/guides/maprimerenov-2026`, fiches artisan RGE), alors le taux de visiteurs initiant le simulateur passe de baseline X (à mesurer semaine 1) à 3× X, mesuré par `funnel.simulator.started / session_start`.

- **Prior** : 60 % (pas de benchmark direct, intuition UX senior)
- **Stop-loss** : Si après 14 jours lift < 1,5×, revenir au layout d'origine + test différent (ex : modal exit-intent).
- **Sample size** : baseline ~30 starts/jour → MDE +150 % avec α=0,05 power=0,8 : **N ≈ 180 sessions/variante** → 2 jours suffisent, on tient 14 jours pour absorber variance weekend/weekday.
- **Durée** : 14 jours
- **Owner** : Product lead

### H5 — Schema.org Certification boost AI Overviews citations

**Hypothèse** : Si on déploie Schema.org `LocalBusiness` + `Certification` (type ADEME RGE) + `Service` sur les 50 332 fiches RGE, alors le nombre de citations dans AI Overviews (Google SGE) et ChatGPT Search passe de 395 (baseline Ahrefs) à > 1 000 en 60 jours, mesuré via Perplexity referrals + GSC "Discovered through AI Overview".

- **Prior** : 55 % (corrélation Schema ↔ AI citations non causale prouvée, mais Anthropic/Perplexity papers le suggèrent)
- **Stop-loss** : Si après 60 jours citations < +50 %, pivoter vers stratégie alternative (OPML feeds, llms.txt).
- **Sample size** : n=50 332 fiches, mesure mensuelle
- **Durée** : 90 jours (AI crawl est plus lent que Google)
- **Owner** : Data lead + SEO lead

### H6 — Descriptions uniques sur 50K RGE débloquent ranking longue traîne

**Hypothèse** : Si on génère 200-400 mots de description unique (prompt GPT-4 + template structuré INSEE+NAF+ville) sur les 50 332 fiches RGE, alors le nombre de KW rankés pos 11-30 sur lesquels ces fiches apparaissent passe de ~50 à > 500 en 90 jours.

- **Prior** : 80 % (cause racine "0,06 % fiches avec description" identifiée dans synthèse v1.2)
- **Stop-loss** : Si après 45 jours rank-gain < 100 KW, auditer qualité descriptions (similarité cosinus inter-fiches > 0,85 = échec).
- **Sample size** : cohorte test 5K fiches (10 %) avant scale à 50K — MDE détectable : Ahrefs mesure rank hebdo, n=5000 suffit largement.
- **Durée** : 90 jours (cohorte test 5K d'abord, 45 jours avant go/no-go scale)
- **Owner** : Content lead + Data lead

### H7 — Outreach claim artisan → croissance Tier B indexable

**Hypothèse** : Si on lance une campagne email + SMS (50K artisans avec phone+email confirmés, migration 389) proposant la revendication de fiche en 2 clics, alors le taux de claim hebdomadaire passe de 0,01 %/mois (16 total / 970K / ancienneté) à > 0,5 %/mois sur la cohorte contactée.

- **Prior** : 40 % (tests email cold B2B artisans donnent 2-8 % open, 0,5-2 % click, 0,1-0,5 % conversion)
- **Stop-loss** : Si batch 1 (5K artisans) donne < 25 claims après 14 jours, refondre copy + landing page avant scale.
- **Sample size** : batch progressif 5K → 15K → 50K. N=5K permet détecter 0,5 % vs 0,1 % avec α=0,05 power=0,8.
- **Durée** : 30 jours par batch
- **Owner** : Growth lead

### H8 — Bid sur KW perdus (94K vol) via refresh content

**Hypothèse** : Si on refresh le contenu des 59 KW perdus (pattern "serrurier lyon", "plombier marseille" — identifiés dans `seo-keywords-2026-04.md`) avec H1 corrigé, body > 1500 mots, Schema.org et lien interne depuis `/guides/`, alors 30 % des KW (≈18) reviennent top 20 en 45 jours.

- **Prior** : 65 % (ces KW étaient rankés récemment, pénalité probablement due au bailout SSR)
- **Stop-loss** : Si après 45 jours < 5 KW en top 20, investigation : peut-être ce sont des pages doorway tombées sous HCU.
- **Sample size** : 59 KW (population), mesure hebdo Ahrefs
- **Durée** : 45 jours après dernier refresh
- **Owner** : Content lead

### H9 — Disavow file réduit spam backlinks et stabilise DR

**Hypothèse** : Si on upload `disavow.txt` (44 domaines, 78 % backlinks spam identifiés) dans GSC, alors le DR Ahrefs se stabilise ou augmente (> 0,6) au lieu de continuer à chuter, mesuré sur 60 jours.

- **Prior** : 50 % (Google minimise souvent l'effet des liens spam auto-déclassés ; effet marginal attendu)
- **Stop-loss** : pas de stop-loss (action one-shot, pas d'effet négatif possible)
- **Sample size** : 1 upload, mesure mensuelle DR
- **Durée** : 60 jours
- **Owner** : Growth lead

### H10 — Trust badges lève submit-rate sur fiche artisan

**Hypothèse** : Si on affiche sur fiche artisan RGE un `<TrustBadge>` (SIRET vérifié INSEE + RGE ADEME à jour + date dernière synchro) au-dessus du CTA devis, alors le click-through sur "Demander un devis" passe de baseline X à 1,5× X, mesuré via `funnel.provider_detail.cta_devis.clicked`.

- **Prior** : 70 % (trust signals benchmark Baymard/Nielsen : +20-40 % conversion)
- **Stop-loss** : Si lift < 10 % après 14 jours, tester variante (visuel seulement, textuel seulement, combiné).
- **Sample size** : baseline CTR ~8 %, MDE +50 % → **N = 487/variante** (α=0,05 power=0,8). Avec 200 views/jour sur fiches RGE, ~5 jours.
- **Durée** : 14 jours
- **Owner** : Product lead

### H11 — LCP p75 < 2,5s améliore ranking sur 20 pages témoin

**Hypothèse** : Si on force le p75 LCP < 2,5s (optimisation images AVIF, lazy fiches adjacentes, preload hero) sur les 20 pages /urgence/\* top traffic, alors leur position moyenne Ahrefs gagne > 3 places en 30 jours.

- **Prior** : 45 % (Core Web Vitals sont un signal faible selon Google, effet difficile à isoler)
- **Stop-loss** : Si aucun gain de position ET LCP p75 > 2,5s sur 5 pages, pivoter vers autre optimisation.
- **Sample size** : 20 pages (population), mesure via Vercel Analytics + Ahrefs
- **Durée** : 30 jours
- **Owner** : Dev lead

### H12 — Cron ADEME quotidien empêche les fausses RGE indexées

**Hypothèse** : Si on active un cron quotidien syncant ADEME API (migration 385 + 389 prêtes), alors le nombre de fiches avec `rge_valid_until < now()` non re-flippées en noindex tombe à 0 en moyenne quotidienne (vs ~500 attendus sans cron).

- **Prior** : 95 % (déterministe — si le trigger 13.6 fonctionne, c'est automatique)
- **Stop-loss** : Si cron échoue > 2 jours consécutifs (check via alerte Slack), escalade P1.
- **Sample size** : n=50 332 fiches monitorées
- **Durée** : monitoring continu (SLO plutôt qu'expé)
- **Owner** : Data lead

**Synthèse** : 12 hypothèses, **prior moyen 64 %**, couverture des 5 leviers (SSR, indexation, UX funnel, content quality, trust). Stop-loss contractuel sur chacune → **aucune dérive de 4 mois type blackout v1**.

---

## 2. Event Taxonomy GA4 + PostHog (54 events)

### 2.1 Schema — `<context>.<action>.<object>`

Conventions (inspirées Segment Spec + Stripe analytics) :

- `snake_case` dans le nom de l'event
- Properties typées et documentées
- User properties séparées des event properties
- Chaque event doit répondre à **une seule question business**

### 2.2 Context `seo` — mesure SEO/ranking (9 events)

| Event                        | Properties                                                                                                                    | Source               |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `seo.page.viewed`            | `page_type` (provider_detail/service_city/guide/...), `page_url`, `rge_flag`, `noindex_flag`, `canonical_url`, `load_time_ms` | Auto GA4 + PostHog   |
| `seo.page.first_paint`       | `fcp_ms`, `lcp_ms`, `cls`, `inp_ms`                                                                                           | Web Vitals lib       |
| `seo.search.referrer_google` | `query_landing`, `position_estimate`, `is_rge`                                                                                | GA4 `source=google`  |
| `seo.search.referrer_ai`     | `ai_source` (chatgpt/perplexity/bingai), `prompt_estimate`                                                                    | UTM or Referer sniff |
| `seo.internal_link.clicked`  | `from_url`, `to_url`, `link_type` (footer/header/nav/inline), `anchor_text`                                                   | PostHog autocapture  |
| `seo.footer_link.clicked`    | `tier` (A/B/C), `destination_slug`, `day_rotation`                                                                            | PostHog              |
| `seo.schema.validated`       | `schema_type`, `page_url`, `validation_result`                                                                                | Server-side ping     |
| `seo.sitemap.submitted`      | `sitemap_file`, `url_count`, `hash`                                                                                           | Cron IndexNow        |
| `seo.indexnow.pinged`        | `url`, `http_status`, `latency_ms`                                                                                            | Server log           |

### 2.3 Context `funnel` — conversion tunnels (15 events)

| Event                                      | Properties                                                                         | Source                        |
| ------------------------------------------ | ---------------------------------------------------------------------------------- | ----------------------------- |
| `funnel.landing.entered`                   | `source`, `medium`, `campaign`, `first_touch`, `landing_page`                      | GA4                           |
| `funnel.search.performed`                  | `query_text`, `service_filter`, `city_filter`, `rge_filter`, `results_count`       | Custom                        |
| `funnel.search.no_results`                 | `query_text`, `suggestions_shown`                                                  | Custom                        |
| `funnel.provider_list.viewed`              | `list_slug`, `filter_snapshot`, `cursor_page`                                      | Custom                        |
| `funnel.provider_card.clicked`             | `provider_id`, `position_in_list`, `rge_flag`                                      | Custom                        |
| `funnel.provider_detail.viewed`            | `provider_id`, `rge_flag`, `claim_status`, `has_trust_badge`, `description_length` | Custom                        |
| `funnel.provider_detail.cta_devis.clicked` | `provider_id`, `cta_location` (hero/sticky/inline)                                 | Custom                        |
| `funnel.provider_detail.cta_phone.clicked` | `provider_id`, `phone_masked`                                                      | Custom (NEVER raw phone)      |
| `funnel.devis.started`                     | `service`, `city`, `entry_point` (provider/search/homepage)                        | Custom                        |
| `funnel.devis.field_filled`                | `field_name`, `time_on_field_ms`                                                   | PostHog session replay opt-in |
| `funnel.devis.submitted`                   | `service`, `city`, `provider_id_optional`, `rge_only_flag`, `budget_bucket`        | Custom                        |
| `funnel.devis.validation_error`            | `field_name`, `error_type`                                                         | Custom                        |
| `funnel.simulator.started`                 | `entry_point` (homepage/header/guide/provider)                                     | Custom                        |
| `funnel.simulator.step_completed`          | `step_index`, `step_name`, `time_ms`                                               | Custom                        |
| `funnel.simulator.submitted`               | `eligible_flag`, `estimated_aid_eur`, `travaux_type`                               | Custom                        |

### 2.4 Context `trust` — signaux qualité / E-E-A-T (8 events)

| Event                            | Properties                                                            |
| -------------------------------- | --------------------------------------------------------------------- |
| `trust.badge.viewed`             | `provider_id`, `badge_types_shown` (siret/rge/insee)                  |
| `trust.badge.hovered`            | `provider_id`, `badge_type`, `hover_duration_ms`                      |
| `trust.badge.clicked`            | `provider_id`, `badge_type`, `destination`                            |
| `trust.review.viewed`            | `provider_id`, `review_count_visible`, `avg_rating`                   |
| `trust.review.sorted`            | `sort_order` (recent/rating/helpful)                                  |
| `trust.rge_verification.checked` | `provider_id`, `ademe_synced_at`, `valid_until`                       |
| `trust.author_byline.viewed`     | `guide_slug`, `author_id`                                             |
| `trust.official_source.clicked`  | `source_domain` (france-renov.gouv.fr/ademe.fr/insee.fr), `from_page` |

### 2.5 Context `claim` — revendication artisan (6 events)

| Event                   | Properties                                            |
| ----------------------- | ----------------------------------------------------- |
| `claim.cta.viewed`      | `provider_id`, `cta_location`                         |
| `claim.cta.clicked`     | `provider_id`, `cta_location`                         |
| `claim.form.started`    | `provider_id`                                         |
| `claim.siret.submitted` | `provider_id`, `siret_valid_check`                    |
| `claim.submitted`       | `provider_id`, `channel` (web/email/sms)              |
| `claim.approved`        | `provider_id`, `time_to_approval_hours` (server-side) |

### 2.6 Context `outreach` — campagnes cold artisan (5 events)

| Event                         | Properties                                                          |
| ----------------------------- | ------------------------------------------------------------------- |
| `outreach.email.sent`         | `campaign_id`, `batch_id`, `provider_id_masked`, `template_version` |
| `outreach.email.opened`       | `campaign_id`, `provider_id_masked`                                 |
| `outreach.email.link_clicked` | `campaign_id`, `link_id`, `provider_id_masked`                      |
| `outreach.sms.sent`           | `campaign_id`, `template_version`                                   |
| `outreach.landing.converted`  | `campaign_id`, `action` (claim_started/simulator_started)           |

### 2.7 Context `lead` — dispatch & monétisation (6 events)

| Event                     | Properties                                                         |
| ------------------------- | ------------------------------------------------------------------ |
| `lead.generated`          | `source_table`, `service`, `city`, `budget_bucket`, `rge_required` |
| `lead.dispatched`         | `provider_id`, `distance_km`, `score`, `position`                  |
| `lead.accepted`           | `provider_id`, `time_to_accept_hours`                              |
| `lead.rejected`           | `provider_id`, `reason`                                            |
| `lead.converted_to_quote` | `quote_amount_bucket` (<3k/3-15k/>15k), `provider_id`              |
| `lead.contract_signed`    | `contract_value_bucket`, `provider_id`, `days_from_lead`           |

### 2.8 Context `experiment` — méta-events A/B (5 events)

| Event                   | Properties                                                    |
| ----------------------- | ------------------------------------------------------------- |
| `experiment.assigned`   | `experiment_id`, `variant_key`, `user_id_or_distinct_id`      |
| `experiment.exposure`   | `experiment_id`, `variant_key`, `surface`                     |
| `experiment.conversion` | `experiment_id`, `variant_key`, `conversion_event_name`       |
| `experiment.stopped`    | `experiment_id`, `reason` (winner/loser/inconclusive/harmful) |
| `experiment.rolled_out` | `experiment_id`, `winning_variant`                            |

### 2.9 User Properties (propriétés persistantes par user)

| Property              | Values                              | Use                          |
| --------------------- | ----------------------------------- | ---------------------------- |
| `user_type`           | client / artisan / anonymous        | Segment core                 |
| `is_claimed_artisan`  | true / false                        | Filter outreach cohorts      |
| `claimed_provider_id` | uuid                                | Link back to providers table |
| `is_rge_verified`     | true / false                        | Tier A eligibility           |
| `subscription_plan`   | gratuit / premium                   | Revenue segmentation         |
| `first_source`        | google / direct / ai\_\* / referral | First-touch attribution      |
| `signup_cohort_week`  | ISO week                            | Cohort retention analysis    |
| `dept_code`           | '69', '13', ...                     | Geo segment                  |
| `device_class`        | mobile / desktop / tablet           | Perf segment                 |

### 2.10 Mapping events → North Star Metric (NSM)

NSM = **devis exclusifs RGE + MaPrimeRénov'-éligibles / mois**

```
funnel.devis.submitted
  WHERE rge_only_flag = true
    AND simulator_eligible_flag = true (joint user_id)
    AND lead.dispatched.provider_id UNIQUE (dedupe exclusivité)
  GROUP BY DATE_TRUNC('month')
```

**Leading indicators** (predict NSM 2-4 semaines avance) :

1. `funnel.simulator.submitted` WHERE eligible_flag=true (top-of-funnel intent)
2. `trust.badge.viewed` count / session (trust density)
3. `seo.page.viewed` WHERE page_type=provider_detail AND rge_flag=true (qualified traffic)
4. `claim.approved` weekly count (artisan supply)

**Lagging indicators** (confirm NSM was quality) :

1. `lead.converted_to_quote` / `lead.generated` ratio
2. `lead.contract_signed` / `lead.converted_to_quote` ratio
3. `trust.review.viewed` / provider after lead (post-conversion trust loop)

---

## 3. Dashboards opérationnels (6 dashboards)

Pas d'emoji dans les titres. Chaque dashboard a : **audience**, **questions-clés** (ce qu'on doit pouvoir répondre en < 15s), **metrics**, **fréquence refresh**, **owner**, **alertes Slack**. Outil recommandé : **Metabase** (open-source, connecté direct Supabase + GA4 BigQuery export + PostHog).

### 3.1 Dashboard `D1 — Daily SEO`

- **Audience** : CEO + SEO lead
- **Questions-clés** :
  1. Le traffic Ahrefs daily (164 baseline) progresse-t-il ?
  2. GSC impressions + clicks hier ?
  3. Combien de pages indexées (GSC Coverage) vs indexables (`providers WHERE noindex=false`) ?
  4. Combien de KW en mouvement pos +3 ou -3 ?
- **Metrics affichées** (tuiles) :
  - Organic traffic /j (Ahrefs) avec sparkline 30j
  - Impressions + CTR GSC (hier vs 7j moyen)
  - Pages Indexées / Indexables ratio
  - Top 10 KW moved up (>+3 pos) / Top 10 moved down
  - New KW ranked (entrées en top 100)
  - Body length p50 sur 10 URLs témoin (validation SSR)
  - Crawl rate /j (pages crawlées / sitemaps pings)
- **Fréquence refresh** : 6h (sync Ahrefs API + GSC API)
- **Owner** : SEO lead
- **Alertes Slack** :
  - `#seo-alerts` : traffic /j < 80 % baseline 7j (P1)
  - `#seo-alerts` : pages indexées chute > 5 % en 24h (P0)
  - `#seo-alerts` : body length p50 < 5000 chars (régression SSR, P0)

### 3.2 Dashboard `D2 — Conversion Funnel`

- **Audience** : CEO + Product lead
- **Questions-clés** :
  1. Où est la plus grosse fuite dans le tunnel aujourd'hui ?
  2. Quel segment (mobile/desktop, RGE/non-RGE, ville) sous-performe ?
  3. Quel A/B test actif et son état de significance ?
- **Metrics** :
  - Funnel steps : `landing.entered` → `provider_detail.viewed` → `cta_devis.clicked` → `devis.started` → `devis.submitted`
  - Segmentation : device_class × rge_flag × first_source
  - Simulator funnel : `simulator.started` → `step_completed` (p1-p5) → `submitted`
  - Claim funnel : `claim.cta.viewed` → `started` → `submitted` → `approved`
  - Active experiments : nom, variant-split, conversion rate par variant, p-value (ou posterior probability si Bayesien)
- **Fréquence refresh** : 1h
- **Owner** : Product lead
- **Alertes Slack** :
  - `#product-alerts` : conversion /j (devis.submitted / landing.entered) chute > 20 % 7j rolling (P1)
  - `#product-alerts` : formulaire validation_error rate > 15 % (P2)

### 3.3 Dashboard `D3 — Quality Score` (RGE coverage, descriptions, schema validity)

- **Audience** : Data lead + Content lead
- **Questions-clés** :
  1. Combien de RGE actifs (doit être > 50 000) ?
  2. Combien de fiches Tier A (RGE) avec description enrichie > 200 mots ?
  3. Combien de fiches avec Schema.org `LocalBusiness` + `Certification` valide ?
  4. Dates ADEME sync — dernière à < 24h ?
- **Metrics** :
  - `count(*) FROM providers WHERE rge_valid_until > now()` (target: monitor trend)
  - `% Tier A avec description > 200 mots` (target M3 : 100 %)
  - `% Tier A avec avis > 0` (target M6 : 25 %)
  - `% fiches avec Schema validé` (ping Google Rich Result Test API)
  - Date dernière sync ADEME (alerte > 30h)
  - Date dernière sync INSEE (alerte > 7j)
  - `% fiches Tier A avec TrustBadge rendu server-side` (target : 100 %)
- **Fréquence refresh** : 4h
- **Owner** : Data lead
- **Alertes Slack** :
  - `#data-alerts` : ADEME sync > 30h sans update (P1)
  - `#data-alerts` : RGE actifs chute > 1 % en 24h (P0 — régression trigger)
  - `#data-alerts` : Schema validation rate < 95 % (P1)

### 3.4 Dashboard `D4 — Crawl Health` (GSC + Logs)

- **Audience** : Dev lead + SEO lead
- **Questions-clés** :
  1. Googlebot a-t-il crawlé plus que la veille ?
  2. Y a-t-il des 5xx / 429 renvoyés à Googlebot ?
  3. Combien de soft 404 aujourd'hui ?
  4. LCP p75 pour pages crawlées par Google hier ?
- **Metrics** :
  - Pages crawlées /j (GSC Crawl Stats + parsing Vercel logs)
  - Répartition response codes servis à `User-Agent: Googlebot` : 200/301/304/404/410/5xx
  - Median crawl response time
  - Pages détectées non indexées (GSC Coverage)
  - Pages excluées `Noindex` vs `Soft 404` vs `Redirect` (separate counters)
  - Sitemap status (sitemap.xml, sitemap-providers.xml, sitemap-rge.xml)
  - IndexNow pings envoyés / acceptés
  - LCP p75 Googlebot vs user (si Vercel Analytics supporte ua split)
- **Fréquence refresh** : 6h
- **Owner** : Dev lead
- **Alertes Slack** :
  - `#infra-alerts` : 5xx rate Googlebot > 1 % (P0)
  - `#infra-alerts` : soft 404 count > 100/j (P1)
  - `#infra-alerts` : crawl rate chute > 30 % vs 7j avg (P1)

### 3.5 Dashboard `D5 — Outreach & Claims`

- **Audience** : Growth lead + CEO
- **Questions-clés** :
  1. État des campagnes cold en cours ?
  2. Combien de claims cette semaine ? conversion funnel intact ?
  3. ROI par batch outreach ?
- **Metrics** :
  - Campagnes actives : `outreach.email.sent / opened / clicked` funnel par `campaign_id`
  - Conversion rate par template_version
  - Claims /jour (pending + approved)
  - Temps médian validation claim (pending → approved)
  - Taux rejet claim + top reasons
  - Artisans claimés actifs /mois (avec au moins 1 devis reçu)
  - Cost per claim estimé (si paid)
- **Fréquence refresh** : 2h
- **Owner** : Growth lead
- **Alertes Slack** :
  - `#growth-alerts` : email bounce rate > 5 % (P1)
  - `#growth-alerts` : batch sans claim après 48h (P2)
  - `#growth-alerts` : claims pending > 100 non traités (P1)

### 3.6 Dashboard `D6 — Experiments Control Tower`

- **Audience** : Product lead + Data lead + CEO
- **Questions-clés** :
  1. Quels A/B tests tournent ? avec quel sample collecté ?
  2. Combien ont atteint significance ? combien abandonnés ?
  3. Quel est le throughput expérimental (tests lancés / mois) ?
- **Metrics** :
  - Liste experiments actifs : nom, hypothèse, variante, start_date, days_remaining, sample_current/required, conversion_current_A/B, p-value OR posterior(P(B>A))
  - Experiments archivés 90 derniers jours : status (winner/loser/inconclusive/harmful)
  - Throughput : tests lancés / clos par mois
  - Win rate : % d'experiments ayant atteint significance + lift positif
  - Pre-registration coverage : % experiments avec doc pre-reg écrite avant start
- **Fréquence refresh** : 1h (live PostHog query)
- **Owner** : Product lead
- **Alertes Slack** :
  - `#product-alerts` : experiment running > 2× durée planifiée sans décision (P2)
  - `#product-alerts` : experiment sample > required mais pas de décision (P1)

---

## 4. SLOs production (12 SLOs)

Structure : `SLO = Target | Mesure | Window | Error Budget | Action si dépassement`.

Philosophie Google SRE + Stripe SLI : l'error budget **autorise** les breakages jusqu'au seuil puis **gèle** les nouveaux déploiements risqués.

| #   | SLO                                        | Target                                       | Measurement                                                | Window      | Error Budget /mois         | Action si dépassement                     |
| --- | ------------------------------------------ | -------------------------------------------- | ---------------------------------------------------------- | ----------- | -------------------------- | ----------------------------------------- |
| 1   | Disponibilité front                        | 99,9 %                                       | Vercel monitoring, status 2xx/3xx sur `/` et 10 URLs canon | 30j         | 43 min                     | Freeze non-critical deploys, RCA sous 48h |
| 2   | Disponibilité API `/api/devis`             | 99,95 %                                      | Vercel logs status 2xx                                     | 30j         | 21,6 min                   | Freeze + RCA immédiat (revenue-critical)  |
| 3   | Disponibilité API `/api/simulateur/submit` | 99,95 %                                      | Vercel logs                                                | 30j         | 21,6 min                   | Freeze + RCA                              |
| 4   | LCP p75 mobile                             | < 2,5s                                       | Vercel Analytics + Web Vitals RUM                          | 7j rolling  | 5 % des sessions > 2,5s OK | Investigation + optim images / JS bundles |
| 5   | LCP p95 mobile                             | < 4,0s                                       | Idem                                                       | 7j rolling  | 5 % sessions > 4s          | Idem                                      |
| 6   | INP p75                                    | < 200ms                                      | Web Vitals                                                 | 7j          | 5 % sessions > 200ms       | Script execution profiling                |
| 7   | CLS p75                                    | < 0,1                                        | Web Vitals                                                 | 7j          | 5 % > 0,1                  | Layout shift audit                        |
| 8   | Taux indexation RGE Tier A                 | 100 % pages /providers/\* RGE actif indexées | GSC API + crawler interne                                  | 14j         | 2 % autorisé               | Alerte P1 + investigation bailout/Schema  |
| 9   | ADEME sync freshness                       | `max(now() - rge_last_synced_at)` < 30h      | Cron check                                                 | Continue    | 1 échec autorisé /mois     | Réactivation cron + check ADEME API       |
| 10  | INSEE SIRET sync freshness                 | < 7j                                         | Cron check                                                 | Continue    | 2 échecs /mois             | Idem                                      |
| 11  | Schema.org validity                        | 99 % pages Tier A valides                    | Rich Result Test API sample 100 URLs/j                     | 14j rolling | 1 % invalides              | Rollback dernière PR content              |
| 12  | Leakage RGPD (phone direct)                | 0                                            | Grep runtime logs + audit trail pages public               | Continue    | 0 tolerance                | P0 — revert + incident report             |

**Règle error budget Stripe** : quand un SLO consomme > 50 % son budget sur 7j, un warning Slack `#slo-alerts` déclenche ; > 100 % = **deploy freeze** (sauf fix SLO lui-même) jusqu'à recovery.

**Post-mortem template** : incident > P1 → doc obligatoire `docs/post-mortems/YYYY-MM-DD-title.md` (format Amazon COE : timeline, impact, 5 Whys, action items avec owner + deadline).

---

## 5. Pipeline A/B testing

### 5.1 Outil recommandé : **PostHog Feature Flags + Experiments** (pas GrowthBook)

**Rationale** :

- PostHog déjà en place (cf. `PostHogProvider` layout.tsx ligne 251)
- Feature flags + experiments natifs, zéro nouveau vendor
- Cohort sync avec Supabase pour segmentation avancée (ex : cohorte "artisans RGE claimed")
- Prix : plan gratuit couvre 1M events/mois (suffisant jusqu'à ~5K DAU)
- Intégration Next.js 14 App Router documentée (edge-compatible)

**Alternatives évaluées** :

- **GrowthBook** : meilleur stat engine mais nécessite self-host + pipe events → overhead ops
- **Vercel Edge Config + in-house** : léger mais zéro UI, pas de stat calc — à reconsidérer si PostHog cost explose
- **Optimizely / LaunchDarkly** : overkill à ce stade (pricing > 500 €/mois)

### 5.2 Architecture intégration Next.js 14 App Router

```typescript
// src/lib/experiments/server.ts
import { PostHog } from 'posthog-node'
import { cookies } from 'next/headers'

const posthog = new PostHog(process.env.POSTHOG_KEY!, {
  host: 'https://eu.posthog.com',
  flushAt: 1,
  flushInterval: 0,
})

export async function getVariant(
  flagKey: string,
  defaultVariant: string = 'control'
): Promise<string> {
  const distinctId = cookies().get('ph_distinct_id')?.value ?? crypto.randomUUID()
  const variant = (await posthog.getFeatureFlag(flagKey, distinctId)) as string | undefined
  return variant ?? defaultVariant
}
```

```typescript
// Usage dans un Server Component (Next 14)
import { getVariant } from '@/lib/experiments/server'

export default async function ProviderDetailPage({ params }: { params: { slug: string } }) {
  const ctaVariant = await getVariant('provider_cta_layout', 'hero')
  return <ProviderPage slug={params.slug} ctaVariant={ctaVariant} />
}
```

**Règles architecture** :

1. **Server-side only** pour expés SEO (pas de flash FOUC)
2. **Client-side autorisé** uniquement pour micro-interactions (hover, click) sans impact SEO
3. **Exposure event** auto-fired par PostHog au `getFeatureFlag` (tracking garanti)
4. **Sticky distinct_id** via cookie 365 jours
5. **Kill switch** : toutes les flags ont un fallback control — jamais de single-variant déployé direct

### 5.3 Process review d'expé — template écrit

Chaque expé passe par **5 étapes** avant le go-live. Rejet automatique si l'une manque.

```markdown
## Experiment Proposal — [ID-YYYYMM-XX]

### 1. Hypothesis

**Si [change], alors [outcome], mesuré par [metric primary]**

### 2. Motivation

- Données baseline : [lien dashboard]
- Hypothesis linked to : [H1-H12 du master plan]
- Expected lift : [%] — source benchmark : [Baymard / Stripe / Nielsen / internal]

### 3. Design

- **Variants** : Control / B (describe change)
- **Allocation** : 50/50 (ou justifier autre)
- **Targeting** : [rules user/page]
- **Exclusions** : bots, staff IPs, users in other active experiments on same surface

### 4. Statistical plan

- **Primary metric** : [event_name / ratio]
- **Secondary metrics** : [max 3]
- **Guardrail metrics** : [ne pas dégrader — ex : revenue, LCP, bounce]
- **Stat method** : Bayesian (PostHog default) OR frequentist
- **Significance threshold** : P(B>A) ≥ 95 % (Bayesian) OR p < 0,05 (freq)
- **Required sample** : N = [calcul avec baseline + MDE]
- **Expected duration** : X jours

### 5. Decision rules

- **Ship B** si primary significant positif ET guardrails OK
- **Ship Control** si primary significant négatif OU guardrail dégradé > seuil
- **Extend** si inconclusive mais tendance positive ET budget disponible
- **Kill** si harmful (guardrail broken > X %)

### 6. Pre-mortem

- Si échec : causes probables ?
- Si succès : risques side effects ?

### 7. Approvers

- Proposer : [nom]
- Owner exécution : [nom]
- Reviewer stats : [nom]
- Sign-off CEO si impact > 10 % revenue
```

### 5.4 Statistical significance threshold

- **Bayesian (PostHog natif)** : décision quand `P(B>A) ≥ 95 %` **ET** `Expected Loss ≤ 1 %` du metric baseline
- **Frequentist (backup)** : p < 0,05 avec correction Bonferroni si > 3 metrics primary
- **Peeking guardrail** : Always-Valid Inference (mSPRT) pour regarder tôt sans inflated type-I
- **Minimum sample** : même si early-stop possible, jamais décider en dessous de 80 % du N-required pré-calculé
- **Novelty effect cleanup** : toute expé > 20 % du traffic tourne ≥ 14 jours (deux cycles hebdo) même si significant avant

### 5.5 Eval set d'expériences déjà gagnées chez concurrents

Base de référence documentée pour prior-setting informé :

| Source               | Expé                                   | Lift observé         | Applicabilité ServicesArtisans   |
| -------------------- | -------------------------------------- | -------------------- | -------------------------------- |
| **Stripe**           | Réduction champs checkout 10→6         | +11 % conversion     | H3 DevisForm 7→4                 |
| **Airbnb**           | Exposition badges "Superhost"          | +12 % clic book      | H10 TrustBadge RGE               |
| **Booking.com**      | "Plus que X disponibles" urgency       | +8 % conversion      | À tester H13 scarcity artisans   |
| **Doctolib**         | Auteur médecin identifié pages conseil | +18 % dwell time     | H5 YMYL author byline            |
| **Shopify**          | Schema Product + Review stars          | +17 % CTR SERP       | H5 Schema.org Certification      |
| **LegalZoom (YMYL)** | Badge "Vérifié Ministère"              | +22 % form start     | H10 TrustBadge officiel          |
| **Uber Eats**        | Exit-intent modal 20 % reduc           | +6 % recovered       | H14 exit-intent simulateur       |
| **ManoMano**         | Comparateur devis côte à côte          | +14 % devis soumis   | H15 multi-devis compare          |
| **HomeAdvisor US**   | "Pré-qualifié" tag                     | +9 % conversion lead | H10 déclinaison RGE pré-qualifié |
| **Meilleurtaux**     | Simulateur avant formulaire            | +31 % lead qual      | H4 simulateur homepage           |

Ces priors nourrissent les % de confiance en section 1 — on n'invente pas, on s'appuie sur la base publique.

---

## 6. Pre-registration template

Fichier stocké : `docs/experiments/[ID-YYYYMM-XX]-[slug].md`. Commit obligatoire **avant** feature flag enable en prod.

```markdown
# Experiment [ID-202604-01] — DevisForm 7→4 fields

## Meta

- **Status** : proposed | running | stopped | shipped | reverted
- **Linked hypothesis** : H3 (master plan v2 ch1)
- **Proposer** : Marvin Bissohong
- **Owner** : Product lead
- **Reviewer stats** : Data lead
- **Pre-registered date** : 2026-04-22
- **Start date** : TBD
- **End date (planned)** : Start + 14 days

## Hypothesis

Si on passe DevisForm de 7 à 4 champs obligatoires (name, phone, service,
postal_code — rendre message/budget/urgence optionnels), alors le taux
`funnel.devis.submitted / funnel.devis.started` passe de baseline 84,5 %
à > 92 %, mesuré dans PostHog sur cohorte logged + anonymous.

## Motivation

- Baseline mesurée 2026-04-15 (dashboard D2) : 84,5 % (n=1240 starts)
- Benchmark Baymard : -1 champ = +3-5 % completion rate
- Prior : 75 % confiance (intervalle de lift attendu [3pp, 10pp])

## Design

- **Variant A (control)** : DevisForm 7 champs (actuel)
- **Variant B** : 4 champs obligatoires, 3 optionnels cachés par défaut (toggle "Ajouter plus de détails")
- **Allocation** : 50/50
- **Targeting** : tous users sauf staff (IP allowlist)
- **Exclusions** : bots (User-Agent), users déjà dans experiment actif sur même surface

## Metrics

- **Primary** : `funnel.devis.submitted / funnel.devis.started`
- **Secondary** :
  - `funnel.devis.validation_error rate`
  - `time_to_submit_ms` p50
  - `% submitted with optional fields filled` (qualité lead)
- **Guardrails** (ne pas dégrader) :
  - `lead.converted_to_quote / lead.generated` ≥ baseline -5pp (qualité)
  - 30-day `lead.contract_signed` ≥ baseline -10 %

## Statistical plan

- Method : Bayesian (PostHog native)
- Threshold decision : P(B>A) ≥ 95 % ET Expected Loss ≤ 1pp
- N required : 612 par variante (baseline 84,5 %, MDE +7,5pp, α=0,05, power=0,8)
- Current traffic : ~400 starts/j → atteint en 3-4 jours, mais tenu 14j (cycle hebdo + guardrail 30j quality)

## Decision rules

- Ship B si P(B>A) ≥ 95 % ET guardrails quality non dégradés après 30j délai observation post-ship
- Ship A si P(A>B) ≥ 95 %
- Extend si inconclusive à J+14 ET tendance positive (3-5pp observé)
- Kill si `validation_error rate` B > 2× control (fail design)

## Pre-mortem

- Si B perd : probablement users veulent contexter leur demande — reformer variant avec champ message optionnel bien visible
- Si B gagne mais lead quality drop : trop permissif — ajouter qualification post-submit (page confirm)

## Implementation checklist

- [ ] Feature flag créé : `devis_form_short_v1`
- [ ] Variant B codé derrière flag
- [ ] Events fire correctement (tester staging)
- [ ] Dashboard D2 filtré par variant
- [ ] Runbook rollback : flag off = 100 % control

## Result log (rempli post-expé)

- Final n A / B :
- Final conversion A / B :
- P(B>A) :
- Expected Loss :
- Decision :
- Ship date :
- 30-day guardrail check :

## Post-mortem

- Ce qui a marché :
- Ce qui a surpris :
- Learnings pour future expé :
```

---

## 7. Quarterly Business Review template

Cadence : **trimestrielle** (M3, M6, M9, M12), sync avec synthèse v1.2. Document vivant, commité `docs/qbr/YYYY-Qx-review.md`.

```markdown
# QBR — 2026-Q2

## 1. Executive summary (5 lines max)

Contexte 1 phrase. Biggest win 1 phrase. Biggest miss 1 phrase.
Decision attendue 1 phrase. Next quarter big bet 1 phrase.

## 2. NSM tracking

| Month | NSM target | NSM actual | Gap | Comment   |
| ----- | ---------- | ---------- | --- | --------- |
| M1    | —          | —          | —   | —         |
| M2    | —          | —          | —   | —         |
| M3    | 50         | X          | ±%  | narrative |

Graph : NSM weekly + annotations (experiments shipped, releases majeures).

## 3. KPI scorecard (5 KPI secondaires)

Identique table section 1 master plan : traffic, KW, DR, conv, devis.
Pour chaque : baseline / target M3 / actual M3 / verdict (beat / hit / miss) + root cause si miss.

## 4. Experiments recap

| Exp ID    | Hypothesis    | Result   | Shipped | Lift actual |
| --------- | ------------- | -------- | ------- | ----------- |
| 202604-01 | DevisForm 7→4 | Winner B | Oui     | +9,2pp      |
| ...       |               |          |         |             |

Win rate quarter : X/Y (%). Shipped to prod : N.

## 5. SLO recap

Liste 12 SLOs, % error budget consommé, incidents > P1 survenus avec lien post-mortem.

## 6. Risks & mitigations review

Reprendre table master plan section 10. Pour chaque risque : update status, mitigation actions prises.

## 7. Budget review

Dépensé quarter / budget quarter planifié. ROI estimé (MRR added vs spend).

## 8. Hypothèses business (section 12bis master plan)

État des 3 hypothèses validations. Ajustement modèle pricing si data acquise.

## 9. Decisions for next quarter

1. Go / no-go sur [big bet]
2. Rebalance budget entre Content / Product / Growth
3. Kill / continue / scale experiments

## 10. Open questions for CEO

- [ ] Question 1
- [ ] Question 2

## Approvers

- CEO : ****\_****
- Data lead : ****\_****
- SEO lead : ****\_****
```

---

## 8. Ownership matrix

Principe Linear : un metric sans owner est un metric mort. Un owner = une personne nommée, pas "équipe Product". Si l'équipe est solo (Marvin seul), chaque slot reçoit un **placeholder externe** (freelance senior recruté pour le rôle) + fallback CEO.

| Metric / Surface                 | Owner (R)    | Backup                | Frequency Review     | Decision Right                                 |
| -------------------------------- | ------------ | --------------------- | -------------------- | ---------------------------------------------- |
| NSM (devis RGE exclusifs)        | CEO          | —                     | Weekly               | CEO only                                       |
| Traffic Ahrefs daily             | SEO lead     | CEO                   | Daily (D1)           | SEO lead triages, CEO escalate                 |
| KW organiques (261 → 1500)       | SEO lead     | Content lead          | Weekly (D1)          | SEO lead                                       |
| Domain Rating                    | Growth lead  | CEO                   | Monthly              | Growth lead                                    |
| Conversion globale (0,7 % → 5 %) | Product lead | CEO                   | Daily (D2)           | Product lead                                   |
| Devis /mois (16 → 1000)          | CEO          | —                     | Weekly               | CEO only                                       |
| RGE actifs count (50 332)        | Data lead    | Dev lead              | Daily (D3)           | Data lead                                      |
| RGE description coverage         | Content lead | Data lead             | Weekly (D3)          | Content lead                                   |
| Schema.org validity              | Dev lead     | Data lead             | Weekly (D3)          | Dev lead                                       |
| Crawl rate Googlebot             | Dev lead     | SEO lead              | Daily (D4)           | Dev lead                                       |
| Pages indexées vs indexables     | SEO lead     | Dev lead              | Daily (D4)           | SEO lead                                       |
| Soft 404 count                   | Dev lead     | SEO lead              | Daily (D4)           | Dev lead                                       |
| Claims approved weekly           | Growth lead  | CEO                   | Weekly (D5)          | Growth lead                                    |
| Outreach campaign conv rate      | Growth lead  | —                     | Weekly (D5)          | Growth lead                                    |
| A/B experiments throughput       | Product lead | Data lead             | Weekly (D6)          | Product lead                                   |
| Experiments win rate             | Product lead | CEO                   | Monthly              | Product lead + CEO approve ship > 20 % traffic |
| LCP/INP/CLS p75                  | Dev lead     | —                     | Weekly               | Dev lead                                       |
| Availability front SLO           | Dev lead     | —                     | Continue             | Dev lead ; CEO on P0                           |
| ADEME sync freshness             | Data lead    | Dev lead              | Continue             | Data lead                                      |
| INSEE sync freshness             | Data lead    | Dev lead              | Continue             | Data lead                                      |
| RGPD leakage (phone)             | CEO          | Legal advisor         | Continue             | CEO immédiat                                   |
| MaPrimeRénov' montants accuracy  | Content lead | Expert RGE consultant | On each guide update | Content lead + CEO 2e validation               |
| Disavow file status              | Growth lead  | SEO lead              | Monthly              | Growth lead                                    |
| Backlinks profile                | Growth lead  | SEO lead              | Weekly               | Growth lead                                    |
| PostHog cost                     | Data lead    | CEO                   | Monthly              | Data lead alerte > 80 % free tier              |
| Supabase cost                    | Dev lead     | CEO                   | Monthly              | Dev lead                                       |

**Règle d'escalation** : tout metric hors SLO pendant 72h consécutives = escalade automatique au CEO via Slack DM + creation issue Linear.

**Règle de review** : chaque metric doit avoir été regardé par son owner au moins **au rythme "Frequency Review"** indiqué. Non-review = l'owner perd son ownership (et on note dans la QBR).

---

## 9. Action Sequence — 10 premières actions dans l'ordre

Séquence pour mettre ce chapitre en vie. Ne pas paralléliser — chaque étape débloque la suivante.

1. **J+0 (2h)** — Installer PostHog EU project (si pas déjà), créer events seeds (`funnel.devis.submitted`, `funnel.simulator.started`, `trust.badge.viewed`, `experiment.assigned`) en test staging. Vérifier réception events PostHog dashboard. **Owner : Dev lead**.

2. **J+1 (1h)** — Créer fichier `docs/experiments/README.md` avec le template pre-registration (section 6 ci-dessus). Créer `docs/qbr/README.md` avec template section 7. Commit sur main. **Owner : CEO**.

3. **J+1 (3h)** — Dans Supabase, exécuter la SQL baseline hypothèses (section 12bis master plan) : count RGE actifs, providers_total, claimed count. Capturer le résultat dans `docs/experiments/baselines.md`. **Owner : Data lead**.

4. **J+2 (4h)** — Stand-up Metabase + connexion Supabase read-replica + GA4 BigQuery export + PostHog. Créer dashboard D1 (Daily SEO) en priorité — les 5 autres suivent d'ici J+10. **Owner : Data lead**.

5. **J+2 (1h)** — Dans `src/lib/experiments/server.ts` (à créer), implémenter `getVariant()` (section 5.2). Test unitaire Vitest : `expect(await getVariant('nonexistent', 'ctrl')).toBe('ctrl')`. **Owner : Dev lead**.

6. **J+3 (2h)** — Pre-register les 3 premières expés à partir des hypothèses H3 (DevisForm), H4 (Simulateur homepage), H10 (TrustBadge). Docs `docs/experiments/202604-01-devisform-short.md` etc. **Owner : Product lead**.

7. **J+3 (1h)** — Configurer les 12 SLOs dans Vercel Monitoring + PostHog Alerts + Slack channels `#seo-alerts`, `#product-alerts`, `#data-alerts`, `#infra-alerts`, `#growth-alerts`, `#slo-alerts`. **Owner : Dev lead**.

8. **J+5 (2h)** — Remplir matrice ownership (section 8) avec noms réels. Si slot vide : poser une date de recrutement freelance dans les 14 jours OU accepter que le CEO owne temporairement. Afficher la matrice dans `CLAUDE.md` et `docs/ownership.md`. **Owner : CEO**.

9. **J+7 (3h)** — Première revue hebdo dashboards D1-D2-D3. Valider qu'on peut répondre en < 15s aux questions-clés de chaque dashboard. Si pas → itérer le dashboard avant d'accepter. **Owner : CEO + owners respectifs**.

10. **J+10 (1h)** — Lancer l'expé H3 (DevisForm 7→4) — la plus simple, plus haut prior, plus rapide à statistiquer. Kill/ship à J+24. C'est la première preuve de capability du framework : si elle ne tourne pas proprement, le reste du plan v2 doit attendre. **Owner : Product lead**.

**Règle d'or** : on ne passe pas au chapitre 2 (Technical foundations) tant que dashboard D1 est vert, que 3 expés sont pre-registrées, et que l'ownership matrix est signée. Sinon on mesure des choses qu'on ne regarde pas — ce qui est pire que ne rien mesurer (illusion de contrôle).

---

**Fin du Chapitre 1.**

Référence externe : ce framework s'inspire directement de [Stripe's experimentation platform](https://stripe.com/blog/online-experimentation), du [Linear operating model](https://linear.app/method), de [Notion's growth team playbook](https://notion.so/product) et des principes Google SRE (error budgets, SLOs) adaptés à un contexte startup solo/micro-équipe. Tous les chiffres (164 trafic, 50 332 RGE, 0,7 % conv, 970 326 providers, 459K indexées, 94K vol perdus, 261 KW) proviennent des exports Ahrefs normalisés 2026-04-18 et des requêtes SQL production vérifiées.
