# SimulateurCTA — Research Handoff

Date: 2026-04-14
État repo: master, 47 commits ahead of origin/master (10 nouveaux SimulateurCTA + 37 antérieurs).

## Commits SimulateurCTA (10)

| #   | Commit     | Scope                                                                       |
| --- | ---------- | --------------------------------------------------------------------------- |
| 1   | `d58c61e7` | Composant SimulateurCTA (card/banner/inline) + event `simulateur_cta_click` |
| 2   | `cbcc10ae` | Footer cluster — lien global                                                |
| 3   | `a7f6a1e2` | /cee hub — card                                                             |
| 4   | `a14ef080` | /maprimerenov-cumulaison-cee — banner post-tableau                          |
| 5   | `baf0a5db` | /comparatif-primes-cee-2026 — banner post-tableau                           |
| 6   | `acfbdfee` | Homepage ClayHomePage — card post-hero                                      |
| 7   | `ddada6e2` | PrimesCEEBlock — inline attribué (service×ville)                            |
| 8   | `81007ead` | Variant sticky-bottom + 3 hub mounts                                        |
| 9   | `3e5e8748` | 3 guides aides — sticky                                                     |

Skip : bloc 3 `/devenir-partenaire-cee` (doublon section custom existante).

## Agents de recherche lancés (5)

Tous en background, 2 complétés, 3 en cours au moment du handoff.

| Agent ID            | Sujet                                                                             | Status       |
| ------------------- | --------------------------------------------------------------------------------- | ------------ |
| `ae3ee954f3552ebf0` | SaaS lead funnels (HubSpot, Calendly, Typeform, Drift, Intercom)                  | ✅ Completed |
| `a4856a0f20542ab92` | Concurrents FR rénovation (Effy, Hellio, IZI, Engie, Sonergia, France Rénov')     | ✅ Completed |
| `aaa9e36a989d1f41d` | Comparateurs FR (Selectra, LesFurets, Meilleurtaux, JeChange, Tacotax, Papernest) | ⏳ Running   |
| `a12f2579fac042b7f` | Conversion giants (Booking, Airbnb, Amazon, Stripe)                               | ⏳ Running   |
| `a0d36105cb724a90f` | Fintech calculators (NerdWallet, Bankrate, Credit Karma, Pretto)                  | ✅ Completed |

**Next session** : `SendMessage to='<agent_id>'` pour récupérer les rapports finaux des 3 agents restants. Leurs outputs sont dans :

```
C:\Users\USER\AppData\Local\Temp\claude\C--Users-USER\67515161-4e47-417f-a08d-67fa94ea91ad\tasks\<agent_id>.output
```

## Insights consolidés (agents 1 + 2)

### Règles dures découvertes

1. **Simulateur NE VA JAMAIS sur BOFU** (HubSpot A/B confirmed : −21% demo conversion si calc ajouté sur pricing). → Notre inline simulateur sur pSEO service×ville (BOFU) cannibalise les leads devis.
2. **One page, one CTA, one funnel stage** — Notre /comparatif avec 5 CTAs simulateur viole la règle.
3. **Capture email/tel à step N-1** dans le simulateur (+40% vs post-résultat, benchmark Typeform).
4. **Post-simulation = handoff vers devis** avec données pré-remplies (code postal, travaux, budget).
5. **Callback téléphonique post-simulation** = secret weapon Effy/Hellio.
6. **Framing "reste à charge"** IZI : "Devis 12 000€ − 5 800€ aides = 6 200€" au lieu de "prime estimée".

### Stratégie ajustée proposée

| Funnel           | Pages                           | Simulateur                          | Devis/CeeCTA |
| ---------------- | ------------------------------- | ----------------------------------- | ------------ |
| **TOFU** (froid) | Home, blog, guides, baromètre   | **Dominant**                        | Secondaire   |
| **MOFU** (tiède) | /cee, /comparatif, /cumul, /rge | **Équilibré 1:1**                   | Équilibré    |
| **BOFU** (chaud) | pSEO service×ville              | **Conditionnel énergie uniquement** | **Dominant** |

### Actions prioritaires (à planifier next session)

1. **Retirer simulateur inline sur pSEO non-énergétique** — gater `PrimesCEEBlock` inline par `eligibleOps.length > 0 && serviceIsEnergetic`.
2. **Retirer 1 sticky** sur /comparatif (déjà 4 CTAs desktop).
3. **Ajouter callback conseiller post-simulation** dans `/simulateur-aides-renovation/resultat/` (nouveau endpoint Pipedrive).
4. **Réécrire page résultat simulateur** : framing "reste à charge" + 2 paths (A) mise en relation artisan RGE / (B) rappel gratuit.
5. **Gate email/tel à step N-1** dans le simulateur (capture avant résultat).
6. **Étendre simulateur à 10 pages éditoriales TOFU** hors-aides : blog prix-_, /guides/pompe-a-chaleur, /guides/isolation-_, /guides/budget-renovation.
7. **Poser dashboard conversion** : `simulateur_cta_click` par variant → `estimation_lead_submitted`. Décider par data.

### KPI cible (après ajustement)

- Ratio CTAs devis / simulateur sur pSEO : **2:1 en faveur devis** (actuellement 1:4 en faveur simulateur).
- Conversion `simulateur_cta_click` → lead exclusif artisan : cible **> 10%**.

## Quand reprendre

Next session :

1. `SendMessage to='aaa9e36a989d1f41d'`, `to='a12f2579fac042b7f'`, `to='a0d36105cb724a90f'` → collecter rapports restants.
2. Synthèse finale 5 agents → plan d'action chiffré.
3. Implémenter actions prioritaires (1, 2 faciles ; 3-6 demandent refonte page résultat simulateur).
4. Push à la fin (PAT à fournir, pas de push auto).
