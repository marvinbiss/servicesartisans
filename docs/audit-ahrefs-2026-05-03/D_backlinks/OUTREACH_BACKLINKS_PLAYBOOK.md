# Backlinks Outreach Playbook — Action #10 (Sprint B)

**Date** : 2026-05-03
**Source data** : `outreach_targets_2026-05.csv` (audit Ahrefs Phase 0, 384 domaines)
**Cible** : 50 domaines × 4 tiers, 1-3 backlinks Tier 1 + 5-10 Tier 2/3 sur 60-90 jours

## Pré-requis (assets à pitcher)

| Asset                                 | Status                                           | URL                                       |
| ------------------------------------- | ------------------------------------------------ | ----------------------------------------- |
| Dataset RGE (page /datasets/rge live) | ✅ Action #4 livré (49K artisans, CC-BY 4.0)     | https://servicesartisans.fr/datasets/rge  |
| Dataset RGE sur **data.gouv.fr**      | ⏸️ Bloqué jusqu'à ~2026-05-07 (KBIS attendu J+4) | (pending)                                 |
| Pillar `/rge` upgrade (49K artisans)  | ✅ Action #3 sub-step 1 livré                    | https://servicesartisans.fr/rge           |
| Baromètre RGE (snapshots mensuels)    | ✅ Existant                                      | https://servicesartisans.fr/barometre/rge |
| Cluster CEE (24 ops)                  | ✅ Title rewrite Action #9                       | https://servicesartisans.fr/cee           |

> ⚠️ **Outreach Tier 1 Press et Tier 3 Inst à différer** jusqu'à soumission data.gouv.fr (asset clé pour légitimité). Sans data.gouv.fr, ratio reply Tier 1 chute de ~50% (-3-4 backlinks Tier 1).
>
> **En attendant** : démarrer **Tier 2 BTP (10 cibles)** + **Tier 4 General (11 cibles)** dès maintenant — le pitch repose sur les assets déjà live (page dataset SA + pillar /rge + baromètre + carto), pas sur data.gouv.fr.

## Génération du fichier outreach

```bash
npx tsx scripts/build-outreach-backlinks-csv.ts
# → 50 contacts (8 press + 21 inst + 10 btp + 11 general)
```

Output : `docs/audit-ahrefs-2026-05-03/D_backlinks/outreach_lemlist_top50.csv`

Colonnes vides à enrichir manuellement avant upload Lemlist :

- `email` — Hunter.io (recherche domain) ou Findymail (recherche nom/entreprise)
- `firstName` / `lastName` — LinkedIn ou Hunter
- `jobTitle` — rédac chef / journaliste section éco / responsable contenu

Budget enrichissement : ~50€ (Hunter starter 50 recherches/mois) ou ~25€ (Findymail credits).

## Templates email par tier

### Tier 1 Press (8 cibles — Le Figaro, Les Échos, BFM, etc.)

**Subject** : `Data inédite : 49 000 artisans RGE en France (carto + baromètre)`

**Body** :

```
Bonjour {{firstName}},

Je me permets de vous contacter car {{domain}} a publié plusieurs articles sur la rénovation énergétique récemment.

Nous venons de publier l'annuaire complet des artisans RGE de France en open data sur data.gouv.fr — premier acteur du secteur à le faire.

3 angles potentiellement intéressants pour vos lecteurs :

1. **Carto interactive** : 49 228 artisans RGE actifs croisés ADEME + INSEE, géolocalisés. Vue par département / qualif (Qualibat, Qualit'EnR, Qualifelec).
   → https://servicesartisans.fr/rge

2. **Baromètre mensuel** : évolution du parc RGE (+/- entreprises, qualifs entrantes/sortantes par région, anomalies déclarées).
   → https://servicesartisans.fr/barometre/rge

3. **Dataset CC-BY** : CSV/JSON/Parquet librement réutilisables (cités sur data.gouv.fr).
   → https://servicesartisans.fr/datasets/rge

Je peux préparer un brief data sur-mesure si un angle vous intéresse — délai 24h, format de votre choix.

À très vite,

Marvin Bissohong
Co-fondateur ServicesArtisans
servicesartisans.fr
```

**KPIs cible** : open ≥45%, reply ≥10%, backlink ≥3 sur 8 (37.5%)

### Tier 3 Institutionnel (21 cibles — ADEME, ANAH, gouv.fr divers)

**Subject** : `Dataset RGE open-data : ressource utile pour vos références`

**Body** :

```
Bonjour {{firstName}},

Je me permets de vous solliciter au sujet d'une ressource open-data sur les artisans RGE qui pourrait compléter utilement les pages d'orientation rénovation énergétique sur {{domain}}.

Nous avons publié sur data.gouv.fr un annuaire enrichi des entreprises RGE de France :
- ~49 000 fiches actives (sync mensuelle ADEME / France Rénov')
- Croisement INSEE pour vérification SIRET active
- Géolocalisation, codes département/région normalisés
- Licence CC-BY 4.0 (équivalent Licence Ouverte)

URL ressource : https://servicesartisans.fr/datasets/rge
URL data.gouv.fr : (à compléter post-soumission)

Si la ressource a sa place dans une de vos pages "trouver un artisan RGE" ou similaire, on serait ravis. Aucune contrepartie demandée — juste mention "Source : ServicesArtisans, https://servicesartisans.fr/datasets/rge".

Bien cordialement,

Marvin Bissohong
Co-fondateur ServicesArtisans
```

**KPIs cible** : open ≥50% (institutionnel), reply ≥15%, citation ≥4 sur 21 (19%)

### Tier 2 BTP (10 cibles — Batiactu, FFB, Habitatpresto, etc.)

**Subject** : `Échange éditorial RGE : on cite vos contenus, vous citez nos data`

**Body** :

```
Bonjour {{firstName}},

{{domain}} et ServicesArtisans couvrent tous les deux le secteur de la rénovation énergétique sous des angles complémentaires : vous éditorial / pédagogie pro, nous data / annuaire artisan.

J'aimerais explorer un échange éditorial simple :
- De notre côté : on cite vos guides RGE / contenus pédagogiques dans nos articles longs (pillar /rge, /aides, /cee). Sources sourcées avec attribution.
- De votre côté : citation possible de notre dataset open-data RGE (data.gouv.fr, ~49K fiches) dans vos articles "comment trouver un artisan RGE" ou similaires.

Win-win sans engagement formalisé : juste mention naturelle des sources quand pertinent.

Intéressé(e) ? Je peux vous lister 3-4 articles précis chez vous où on a déjà repéré des liens potentiels.

À bientôt,

Marvin Bissohong
ServicesArtisans
```

**KPIs cible** : open ≥40%, reply ≥20%, partenariat actif ≥3 sur 10 (30%)

### Tier 4 Général (11 cibles — sites haute traffic divers)

**Subject** : `Article RGE / rénovation énergétique pour {{domain}} ?`

**Body** :

```
Bonjour {{firstName}},

J'ai vu que {{domain}} traite régulièrement de sujets liés à l'habitat et la rénovation. Je voulais vous proposer 2 options de collaboration éditoriale :

**Option 1 — Guest post original** (1 500-2 500 mots, exclu pour {{domain}})
Sujets candidats :
- "Comment vraiment vérifier qu'un artisan est RGE en 2026 (et 5 fraudes courantes)"
- "MaPrimeRénov 2026 : ce qui change réellement pour les particuliers"
- "Le vrai prix d'une pompe à chaleur : étude data sur 49 000 artisans RGE"

**Option 2 — Lien insertion** sur 1 article existant chez vous
Si vous avez un article ancien sur RGE / rénovation énergétique qui pourrait être enrichi par un lien vers nos data exclusives (carto interactive 49K artisans), on peut vous proposer une insertion contextualisée gratuite.

Quelle option vous parle ?

Cordialement,

Marvin Bissohong
ServicesArtisans
```

**KPIs cible** : open ≥35%, reply ≥8%, backlink ≥2 sur 11 (18%)

## Suivi conversions

### Pipedrive

- Pipeline : **"Backlinks Q2 2026"**
- Stages : `Email envoyé` → `Email ouvert` → `Reply` → `Engagement actif` → `Backlink obtenu` → `Indexé Google`
- Custom field `tier` : tier1_press / tier2_btp / tier3_inst / tier4_general
- Custom field `dr_target` : DR du domain (pour priorisation post-relance)

### KPIs hebdo (Slack report)

| Métrique                            | Cible J+30 | Cible J+90              |
| ----------------------------------- | ---------- | ----------------------- |
| Open rate global Lemlist            | ≥40%       | ≥45% (warm-up step 2/3) |
| Reply rate                          | ≥10%       | ≥15%                    |
| Backlinks Tier 1 obtenus            | 0-1        | **≥3** (impact DR +5-8) |
| Backlinks Tier 2-3 obtenus          | 1-3        | **≥8** (impact DR +2-3) |
| Backlinks Tier 4 obtenus            | 1-2        | ≥4                      |
| **DR Ahrefs SA** (mesure mensuelle) | 0.6 → 1-3  | **8-15**                |

## Itérations (séquence adaptée bloqueur data.gouv.fr)

- **V1 (J0 — démarrable maintenant)** : Tier 2 BTP (10) + Tier 4 General (11) = 21 cibles. Pitch sur assets live (page dataset, pillar /rge, baromètre). N'attend PAS data.gouv.fr.
- **V2 (J+création société + soumission ~7-15j)** : Tier 1 Press (8) + Tier 3 Inst (21) = 29 cibles. Pitch sur dataset data.gouv.fr publié (signal autorité fort).
- **V3 (J+30 post-V2)** : si ratio reply Tier 1 ≥10% → pitch "exclusivité données" sur sujet hot (saison hiver chauffage / saison été clim)
- **V4 (J+60)** : extension top 100 (next 50 du CSV original) avec template adapté selon learnings V1/V2/V3
- **V5 (J+90)** : pivot vers HARO / Sourcee si le ratio direct ne dépasse pas 15% reply Tier 1

## Stop signals

- Si open <30% à J+15 → pause campagne + warm-up domaine 2 semaines
- Si reply <5% Tier 1 → revoir l'asset (signal data trop faible vs Effy/Sonergia)
- Si 0 backlink Tier 1-3 à J+45 → pivot Action #10 vers approche communautaire (LinkedIn organic, Reddit r/france)

## RGPD / Spam

- Base légale : intérêt légitime B2B (pro contact public)
- Désinscription Lemlist obligatoire dans pied de page
- Si reply "désinscription" → flag DB `outreach_optout` + suppression Pipedrive
- Conservation : CSV outreach détruit après 6 mois

## Notes maintenance

- Le script `build-outreach-backlinks-csv.ts` est **idempotent** — safe à re-runner mensuellement pour rafraîchir top 50
- Si un domaine est déjà engagé → exclure manuellement avant upload Lemlist (ou ajouter une exclusion par domaine au script)
- L'audit Ahrefs `outreach_targets_2026-05.csv` doit être refresh tous les 60-90j (pull Phase 0 ou pull dédié backlinks)
