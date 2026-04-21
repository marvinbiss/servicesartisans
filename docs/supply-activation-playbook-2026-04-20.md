# Supply Activation Playbook — CEO Directive 2026-04-20

**Décision** : Toutes les initiatives code tactiques sont en pause jusqu'au **2026-04-27 (T+7)**. Un seul objectif : **19 → 100 claimed artisans**. Si ce chiffre est atteint, on repart sur SEO/content/CEE avec un flywheel qui tourne. Sinon, on debug la hypothèse supply-first et on réajuste.

## Pourquoi

| Metric               | Aujourd'hui  | Cible T+7 | Cible T+30 |
| -------------------- | ------------ | --------- | ---------- |
| Claimed artisans     | 19 / 970 339 | 100       | 500        |
| Accept rate leads    | 0%           | 30%       | 50%        |
| Reviews collectées   | 0            | 5         | 50         |
| MQL/mois utilisables | 0-8          | 20        | 120        |

Sans supply : migration 463 dort (claimed_boost_weight=0), reviews flywheel tire sur des artisans qui n'acceptent pas les leads, SEO ramène du trafic dans un tunnel cassé, CEE ne peut pas exécuter faute de capacity. **Unique levier à 10x d'impact sur tout le reste**.

## Data réelle (post-diagnostic 2026-04-20 soir)

Total providers : **970 339** (dont 19 claimed = 0.002%)
Contactable (email OR phone) : **~100K** (50 459 email + 51 513 phone, overlap inconnu)
RGE qualifiés (via `rge_qualifications`) : **50 539**
**→ Pool RGE contactable ≈ 50 000 artisans** (intersection RGE × contact, approximation)

La colonne `rge_verified_at` n'est jamais populée en prod (bug du pipeline de sync). Le vrai signal RGE = `rge_qualifications text[]`.

### Cohortes générées (script run 2026-04-20 23:46)

| Cohort                    | Définition                              | Rows             | Avec contact          |
| ------------------------- | --------------------------------------- | ---------------- | --------------------- |
| A                         | RGE actifs, unclaimed, email/phone      | 500 (cap script) | 500                   |
| B                         | Top40 villes, unclaimed                 | 87               | 46                    |
| C                         | High data_quality_score, unclaimed      | 100              | 0 (⚠️ data pollution) |
| D                         | Ghost claimed (user_id set, 0 activity) | 16               | 5                     |
| **Total dedup reachable** | —                                       | —                | **551**               |

Note : le pool RGE réel est 50K, le script capé à 500 pour l'outbound semaine 1. Ramper à 5K si T+7 OK.

## Ce qui est prêt côté code

1. **Cohortes identifiées** : `scripts/supply-activation-cohorts.ts` (4 cohortes A/B/C/D, 551 reachable)
2. **Dispatch claim-aware** : migration 463 prête à déployer + flip `claimed_boost_weight=40` à T+7 si 100 claimed atteint
3. **Flow revendication** : `/artisan/revendiquer` existant, SIRET verification fonctionnelle (mémoire `servicesartisans-architecture`)
4. **Tracking** : posthog events `ARTISAN_CLAIM_STARTED` + `ARTISAN_CLAIM_SUCCEEDED` déjà instrumentés

## 3 décisions CEO à trancher **avant 2026-04-22**

### Décision 1 — Pricing modèle

Choisir une option et verrouiller. Pas de test A/B sur 500 artisans.

- [ ] **A. Freemium 0€ avec lead cap** : 3 leads gratuits/mois, au-delà = €29 pack ou €79 unlimited
- [ ] **B. Flat free 0€ pendant 6 mois** : pas de friction, monétisation post-PMF. Risque : artisans ne valorisent pas.
- [ ] **C. €29/mois unlimited dès J+0** : positionne premium, filtre sérieux. Risque : CAC ↑, T+7 à 100 claimed moins probable.
- **Recommandation CEO** : **B** (0€ 6 mois, frictionless). T+7 = 100 claimed prouve la demande. Pricing arrive post-validation.

### Décision 2 — Sender + deliverability

- [ ] Domaine sender : **marvin@servicesartisans.fr** (perso-CEO) ou **equipe@servicesartisans.fr** (brand) ?
- [ ] Volume max/jour sur Postmark : **50/jour J+0-3**, **150/jour J+4-7** (warmup). Hardcap 500/j sur Postmark transactional.
- [ ] SPF/DKIM/DMARC servicesartisans.fr : à vérifier avant premier envoi (penalty spam si KO).
- **Recommandation CEO** : **marvin@servicesartisans.fr** + hardcap 50/j pendant 3j pour mesurer open/reply rate, puis ramp à 150/j.

### Décision 3 — Cutoff kill criterion

Si à T+7 (2026-04-27) on a :

- **≥ 50 claimed** : continuer, ramper à 500 T+30
- **25-49 claimed** : garder le cap, ajuster messaging cohorte A (RGE) qui devrait convertir le mieux
- **< 25 claimed** : **hypothèse supply-first invalidée**. Pivoter vers achat trafic payant ou B2B sales direct. Arrêter le plan CEO actuel.

## Templates email (4 variants)

**Cohorte A (RGE unclaimed)** — drafted, needs CEO review

```
Subject: {name}, votre fiche RGE sur ServicesArtisans
Preheader: Vos qualifications RGE vous rendent éligible aux leads MaPrimeRénov' exclusifs

Bonjour {name},

Votre entreprise apparaît sur ServicesArtisans.fr — vous êtes qualifié {rge_qualifications}, ce qui vous rend éligible aux demandes MaPrimeRénov' que nous recevons quotidiennement sur la région {address_region}.

Nous fonctionnons en leads exclusifs : 1 demande = 1 artisan. Pas de partage avec 5 concurrents. Pas d'abonnement pour l'instant — on cherche 100 artisans pilotes pour valider le modèle.

Revendiquer votre fiche (2 minutes) : https://servicesartisans.fr/artisan/revendiquer/{slug}

Marvin, fondateur
marvin@servicesartisans.fr
```

**Cohorte B (Top40 unclaimed)** — drafted, needs CEO review

```
Subject: Demandes de devis {specialty} à {address_city}
Preheader: Nous avons X demandes/mois à {address_city}, votre fiche est disponible

Bonjour {name},

Ce mois-ci nous avons reçu plusieurs demandes de devis {specialty} à {address_city} et votre entreprise ressort sur notre plateforme.

Revendiquez votre fiche et recevez ces demandes en exclusivité (pas de partage).

→ https://servicesartisans.fr/artisan/revendiquer/{slug}

Gratuit pendant 6 mois, pas d'abonnement, pas d'engagement.

Marvin
```

**Cohorte C (High-quality unclaimed)** et **D (Ghost reactivate)** — à drafter après premiers résultats A+B.

## Execution timeline T+0 → T+7

| Jour             | Action                                  | Owner  | Blocker     |
| ---------------- | --------------------------------------- | ------ | ----------- |
| J+0 (2026-04-20) | Générer cohortes CSV                    | Code   | —           |
| J+0-1            | Finaliser 3 décisions CEO               | User   | —           |
| J+1              | Valider templates + DKIM/SPF            | User   | Décision 2  |
| J+2 (2026-04-22) | Envoi batch A (25 RGE)                  | Script | Postmark OK |
| J+3              | Mesure open/reply A, envoi batch B (25) | Script | —           |
| J+4-6            | Ramp 150/jour si metric OK              | Script | —           |
| J+7 (2026-04-27) | **Kill check** : claimed count          | CEO    | —           |

## Metrics dashboard (supply)

Requêtes SQL prêtes à coller dans Supabase :

```sql
-- Claimed count real-time
SELECT COUNT(*) FROM providers WHERE user_id IS NOT NULL;

-- Claimed this week
SELECT COUNT(*) FROM providers
WHERE claimed_at >= NOW() - INTERVAL '7 days';

-- Par cohorte (si on track source dans claim)
SELECT source, COUNT(*)
FROM provider_claims
WHERE created_at >= '2026-04-20'
GROUP BY source
ORDER BY 2 DESC;
```

## Ce que cette action **débloque**

1. Flywheel reviews : premier envoi cron 2026-04-27, si 100 claimed accept leads → 5-10 reviews T+14
2. Migration 463 : flip `claimed_boost_weight=40` à T+7 → boost ranking claimed dans dispatch
3. SEO : reviews + claimed badge sur `/services/[s]/[v]` = trust signal authentique
4. CEE : mandataire viable dès 50 artisans qui génèrent dossiers/mois
5. Revenue : pricing test T+30 sur cohorte A (les RGE devraient payer €29-79/mois)

## Si le kill criterion T+7 échoue

- Revisiter hypothèse : peut-être que les artisans n'ont pas d'email valide / les listes sont polluées
- Alternative 1 : **phoning direct** sur cohorte A (250 RGE) — 1 BDR externe €2K pour 2 semaines
- Alternative 2 : **Google Ads B2B** "trouver des leads plombier Lyon" + landing page artisan
- Alternative 3 : **retour plan SEO/content** (Sprint 3 keyword-first flagship pages) — en reconnaissant que la supply sera greffée après pull demand

## Auteur

CEO ServicesArtisans (Marvin) — memo généré 2026-04-20 post-session d'exécution code.
