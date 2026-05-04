# Supply Activation — Outreach Playbook (Sprint A #11)

**Objectif** : convertir les artisans RGE non-claim en comptes actifs sur ServicesArtisans pour débloquer le contenu unique des 49K fiches (avis, descriptions, photos) → impact compound sur Sprint B (#3 pillar /rge), #5 (LP organic) et #8 (4 pillars).

**Lead time** : 3 mois. C'est pour ça que cette action est en V1 et non V4 : on lance le compteur dès J0 pour récolter les conversions à temps pour les sprints suivants.

---

## Génération du fichier outreach

```bash
npx tsx scripts/build-supply-outreach-csv.ts
# Default: top 200 contacts (priority_score >= 80, dedup email)
# Custom : --limit 500 --min-score 70
```

Output (gitignored, PII) : `docs/audit-ahrefs-2026-05-03/F_supply/outreach_lemlist_top200.csv`

Le script query Supabase live (pas le CSV F2 historique) pour avoir les données fraîches : un artisan qui claim aujourd'hui sort automatiquement du pool demain.

### Logique de scoring (alignée avec `supply_outreach_priority.sql`)

| Signal                              | Points |
| ----------------------------------- | ------ |
| Multi-qualif (≥2 qualifs RGE)       | +50    |
| Email valide (regex + anti-noreply) | +30    |
| Téléphone présent                   | +20    |
| Slug dans top 32 villes France      | +15    |
| Qualif fraîche (expire ≥ 12 mois)   | +10    |

Filter par défaut : `score >= 80`. Si seulement 30K candidats → 200 retenus = top 0.66% du parc RGE non-claimé.

### Colonnes Lemlist

| Colonne         | Usage email                                                                    |
| --------------- | ------------------------------------------------------------------------------ |
| `email`         | Standard Lemlist (mandatory)                                                   |
| `firstName`     | `{{firstName}}` — best-effort (dernier mot du nom société, hors SARL/SAS/etc.) |
| `companyName`   | `{{companyName}}` — raison sociale brute                                       |
| `postalCode`    | `{{postalCode}}` — code postal FR (5 chiffres)                                 |
| `addressRegion` | `{{addressRegion}}` — région normalisée (ex "Grand Est")                       |
| `specialty`     | `{{specialty}}` — spécialité ADEME (chauffagiste/plombier/...)                 |
| `rgeCodes`      | `{{rgeCodes}}` — codes courts dédupliqués ex "41, 43, 71"                      |
| `rgeOrganismes` | `{{rgeOrganismes}}` — ex "qualibat", "qualitenr"                               |
| `nbQualifs`     | `{{nbQualifs}}`                                                                |
| `priorityScore` | `{{priorityScore}}` — interne, ne pas exposer                                  |
| `ficheUrl`      | `{{ficheUrl}}` — `/artisan/{slug}` (redirect compat → canonical)               |
| `claimUrl`      | `{{claimUrl}}` — même URL + `#revendiquer`                                     |

---

## Email template (Lemlist v1)

**Subject** : `{{firstName}}, votre fiche RGE est en ligne sur ServicesArtisans`

**Body** :

```
Bonjour {{firstName}},

Votre entreprise {{companyName}} ({{specialty}}, {{addressRegion}}) est référencée sur ServicesArtisans dans notre annuaire des artisans RGE.

Votre fiche est ici : {{ficheUrl}}

Vous êtes certifié RGE par {{rgeOrganismes}} ({{nbQualifs}} qualifs : {{rgeCodes}}). Cette qualification vous donne accès à un volume de demandes en rénovation énergétique très ciblées (CEE, MaPrimeRénov').

**3 points concrets** :
1. Notre annuaire reçoit ~16K visites/mois de particuliers cherchant un artisan RGE
2. Les leads sont **exclusifs** : 1 demande = 1 artisan (pas de mise en concurrence sauvage type Effy/Hellio)
3. La revendication est **gratuite** et prend 2 minutes (vérification SIRET automatique)

Revendiquez votre fiche : {{claimUrl}}

Une question ? Répondez simplement à ce mail, je vous lis personnellement.

Marvin Bissohong
Co-fondateur ServicesArtisans
servicesartisans.fr
```

**Notes** :

- Pas d'emoji (ouverture B2B chauffagiste/plombier).
- Mentionne "exclusivité leads" (vrai différenciateur vs Effy 1:3 partagé).
- Argumente RGE-compatibility sans jargon trop technique.
- CTA unique (`{{claimUrl}}`) pour mesure clic claire dans Lemlist.

---

## Suivi conversions

### Pipedrive

- Pipeline : **"Claim Onboarding Q2 2026"**
- Stages : `Email envoyé` → `Email ouvert` → `Lien cliqué` → `Compte créé` → `Fiche claimée` → `Pipedrive deal: Activated`
- Source `lemlist:supply-activation-q2-2026`

### KPIs hebdo (à reporter dans Slack)

| Métrique                      | Cible J+30              | Cible J+90              |
| ----------------------------- | ----------------------- | ----------------------- |
| Open rate Lemlist             | ≥35%                    | ≥40% (warm-up step 2/3) |
| Click rate (`claimUrl`)       | ≥6%                     | ≥10%                    |
| Compte créé (auth)            | ≥3%                     | ≥5%                     |
| Fiche revendiquée             | ≥2% (=4 claims sur 200) | ≥4% (=8 claims)         |
| Avis postés post-claim (J+14) | n/a                     | ≥30% des claims         |

Cible Sprint A : **≥8 claims sur 200 envois à J+90**, dont **≥3 fiches avec ≥1 avis publié**.

---

## Itérations

- **V1 (J0)** : Top 200 (score ≥80) — campagne actuelle
- **V2 (J+15)** : Si V1 open ≥35% et click ≥6% → étendre à top 500 (score ≥70) avec même template
- **V3 (J+30)** : Si V2 click ≥6% → top 1500 (score ≥60) + variation A/B email subject
- **V4 (J+60)** : Si signal claim ≥2% → industrialiser : génération hebdo automatique, exclusion auto-pull des nouveaux claims via `is null claimed_at` direct dans le query

Stop signal : si open <25% à J+15 → retirer la campagne, refaire warm-up domaine, retester.

---

## Notes RGPD

- **Base légale** : intérêt légitime (B2B prospection, contact pro listé publiquement via ADEME).
- **Lien désinscription** Lemlist obligatoire dans pied de page.
- **Si un destinataire répond "désinscription"** : flag DB `outreach_optout=true` (à créer si volume signaux >5/sem) + suppression Pipedrive.
- **Conservation** : CSV outreach détruit après 6 mois (RGPD délai prospection B2B).

---

## Maintenance

- Le script `build-supply-outreach-csv.ts` re-query la DB à chaque exécution. Refaire 1× / mois pour propager les claims (et exclure les déjà-claim du nouveau pool).
- Fichier source CSV F2 (`F2_top5000_artisans.csv`) reste local-only (gitignored) — référence historique audit Phase 0, ne pas re-régénérer sauf besoin.
- Fichier outreach `outreach_lemlist_top<N>.csv` aussi local-only (PII).
