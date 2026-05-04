# Outreach Sprint 3 — Sites qui linkent les /blog/prix-\*-2026 concurrents

**Date** : 2026-05-04
**Sprint** : 3 (résiduel) — audit `STRATEGIE-RENOVATION-ENERGETIQUE.md` ligne 242
**Action** : _« Outreach sites qui linkent /blog/prix-_ déjà »\*
**Statut** : kit prêt à exécuter (script Ahrefs livré, outreach humain ensuite).

---

## Stratégie

Les concurrents qui rankent sur les KW `prix pompe à chaleur 2026`, `prix isolation combles 2026`, etc. ont déjà accumulé des **referring domains éditoriaux** (blogs habitat, comparateurs, presse spé). Ces sites linkers sont **les meilleures cibles outreach** pour ServicesArtisans :

- Ils ont prouvé leur intérêt éditorial pour le sujet rénovation énergétique.
- Ils ont déjà un process de linkage externe (pas hostile au backlink).
- Ils sont thématiquement alignés (Google score le « topical relevance » fort).
- Notre angle est unique : **annuaire RGE 49 K open-data CC-BY 4.0 + 8 articles `/blog/prix-*` plus complets et plus récents**.

Plan : extraire les linkers via Ahrefs API → enrichir contacts → outreach 2 templates (Tier A DR ≥ 60 = pitch data scoop, Tier B DR 25-59 = pitch « complétez votre article avec source plus récente »).

---

## Étape 1 — Extraction Ahrefs (automatisée)

### Pré-requis

```bash
export AHREFS_TOKEN=$(cat ~/.secrets/ahrefs.env | tr -d '\r\n ')
```

### Lancement

```bash
npx tsx scripts/build-prix-2026-outreach-ahrefs.ts
```

### Ce que fait le script

1. Pour chaque KW (8) : récupère le top 10 SERP via `/keywords-explorer/serp-overview`.
2. Pour chaque URL concurrente (80 max) : récupère les top 100 referring domains via `/site-explorer/refdomains`.
3. Filtre : DR ≥ 25, agrégation par domaine, garde uniquement ceux qui linkent **≥ 2 concurrents** (signal éditorial fort).
4. Tri par nombre de concurrents linkés DESC, puis par DR DESC.

### Coût Ahrefs

~1 200 unités sur les 707 K dispo jusqu'au 18/05/2026 (< 0.2 % du budget mensuel). Aucun risque pour les autres usages.

### Output

- `docs/outreach/sprint3-prix-2026-outreach-targets.csv` : prêt enrichissement contact + envoi
- `docs/outreach/sprint3-prix-2026-outreach-raw.json` : données brutes pour analyse approfondie

### Volume attendu

Hypothèse P50 : **120-180 candidats** après filtrage (DR ≥ 25, ≥ 2 concurrents linkés).
Hypothèse haute : **250+ candidats** si concurrents bien linkés (Habitatpresto, Effy, Quelleenergie historiquement linkés par 100-200 refdomains chacun).

---

## Étape 2 — Enrichissement contact (manuel)

Pour chaque candidat dans le CSV :

1. Ouvrir le domaine, identifier l'éditeur du contenu (auteur de l'article qui linke un concurrent).
2. Email pattern via **Hunter.io** (25 free/mois) ou **Findymail** (3 free/mois).
3. Remplir colonne `contact_email`.
4. Si pas de contact direct : fallback formulaire site `Contact / Suggérer un sujet`.

**Priorisation** : commencer par les top 30 (DR ≥ 50 ou ≥ 4 concurrents linkés).

---

## Étape 3 — Templates email

### Template A — Tier 1 (DR ≥ 60) — _« Data scoop »_

> **Sujet** : Mise à jour 2026 — barème PAC / isolation / DPE complet pour [DOMAINE]
>
> Bonjour [Prénom],
>
> Votre article _« [TITRE ARTICLE LINKÉ AU CONCURRENT] »_ cite [CONCURRENT URL]. Petit point que vous voudrez sans doute connaître :
>
> - Nous publions chez ServicesArtisans **8 articles `/blog/prix-*-2026`** mis à jour avec les barèmes officiels avril 2026 (MaPrimeRénov', CEE, Coup de pouce, Éco-PTZ, TVA 5,5 %).
> - Nous mettons aussi en open-data CC-BY 4.0 l'**annuaire des 49 228 artisans RGE certifiés en France** (`/datasets/rge`), librement réutilisable pour vos lecteurs.
>
> Si vous mettez à jour vos contenus prix rénovation, ou si vous préparez un nouveau dossier, nous serions ravis qu'un de nos articles puisse servir de source à jour. Ils sont tous sourcés sur les arrêtés ministériels et l'ANAH (transparence éditoriale auteur identifié, méthodologie publiée).
>
> 8 articles disponibles, par exemple :
>
> - <https://servicesartisans.fr/blog/prix-pompe-a-chaleur-2026>
> - <https://servicesartisans.fr/blog/prix-isolation-combles-2026>
> - <https://servicesartisans.fr/blog/prix-audit-energetique-2026>
>
> Aucune demande de réciprocité, juste une proposition utile pour vos lecteurs.
>
> Bien cordialement,
> Marvin Bissohong, ServicesArtisans

### Template B — Tier 2 (DR 25-59) — _« Complétez votre article »_

> **Sujet** : Source plus récente pour votre article sur [SUJET]
>
> Bonjour,
>
> Je suis tombé sur votre article _« [TITRE ARTICLE] »_ qui parle des prix [SUJET] et linke vers [CONCURRENT URL]. Petit retour utile : ce contenu cite encore les barèmes 2025 alors que les forfaits MaPrimeRénov' / CEE ont été mis à jour en mars 2026 (arrêté du 22/03/2026).
>
> Nous publions un article complet à jour pour les barèmes 2026 :
> <https://servicesartisans.fr/blog/[SLUG-DU-PRIX]>
>
> Auteur identifié, sources officielles citées (france-renov, anah.fr, service-public, ecologie.gouv), tableau complet par geste. Si vous décidez d'updater votre article, ce lien est une source fraîche, et il y a aussi notre annuaire RGE en open-data si jamais l'angle vous intéresse :
> <https://servicesartisans.fr/datasets/rge>
>
> À votre disposition si questions.
>
> Bien cordialement,
> Marvin Bissohong, ServicesArtisans

### Template C — Suivi J+7 (unique relance)

> **Sujet** : Re: [SUJET INITIAL]
>
> Bonjour [Prénom],
>
> Petit suivi sans pression. Si vous mettez à jour vos contenus rénovation et qu'une source 2026 peut vous servir, je reste joignable. Sinon, je vous laisse tranquille.
>
> Belle journée,
> Marvin

---

## Étape 4 — Envoi & tracking

### Cadence

- 5-10 envois/jour max (anti-spam).
- Étaler les top 60 prioritaires sur 6-12 semaines.
- Suivi unique J+7, jamais 2 relances.

### Tracking dans `sprint3-prix-2026-outreach-targets.csv`

Colonnes pré-remplies par le script Ahrefs : `domain | dr | n_competitors_linking | competitors_linked | first_seen | contact_email | template | sent_at | reply_at | outcome | url_obtained | notes`

À chaque envoi : remplir `contact_email`, `sent_at`, `template`.
À chaque réponse : remplir `reply_at`, `outcome` (`replied`, `published`, `declined`, `no_reply`), `url_obtained`, `notes`.

### Mesure

- À J+30 : compter les réponses + premiers backlinks via Ahrefs `site-explorer/refdomains-history` filtré sur ServicesArtisans.fr
- À M+3 : recompter pour mesurer effet cumulé.

---

## ROI attendu

**Hypothèse conservatrice (P50)** : 120 candidats top → 60 contactés → 8 % réponse positive → **5 backlinks** (DR moyen 35).
**Hypothèse haute (P80)** : 180 candidats → 100 contactés → 12 % réponse → **12 backlinks** (DR moyen 40, 3 backlinks DR ≥ 60).

Couplé au plan ULTRA DOMINATION SEO v2 (objectif M12 : DR 22-32, +30-50 refdomains), cette vague Sprint 3 contribue à **15-25 %** du volume de refdomains gagnés.

---

## Compatibilité avec autres outreach

Ce kit est **complémentaire** aux 2 autres kits outreach existants :

- `tier-1-btp-2026-05-03.md` : presse BTP nationale tier 1 (LeMoniteur, BatiActu, Capital, Les Echos)
- `sprint3-presse-locale-2026-05-04.md` : presse régionale 13 régions (Sprint 3)
- **Ce kit** : blogs / comparateurs / sites éditoriaux thématiques rénovation (Sprint 3)

Aucun chevauchement de cibles : les 3 kits visent des univers distincts. Ils peuvent être lancés en parallèle (capacité d'envoi 5/jour × 3 univers = 15/jour total, gérable en 30 min/jour).

---

## Re-run du script

Le script peut être relancé tous les 3 mois pour rafraîchir les candidats (les referring domains évoluent). Garder l'historique JSON dans `sprint3-prix-2026-outreach-raw-YYYY-MM-DD.json` pour audit longitudinal.
