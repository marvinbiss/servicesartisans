# Checklist soumission data.gouv.fr — Indice Rénovation 2026

**Cible** : publication du dataset `Indice Rénovation Énergétique 2026 — ServicesArtisans`
sur https://www.data.gouv.fr → backlink DR ~88 quasi-garanti + crédibilité YMYL +
déblocage outreach presse Tier 1 (Le Monde, Les Échos, Capital).

**Préparé le** : 2026-05-22
**Exécution** : Marvin (impl. KBIS lien obligatoire — bloquant)
**Mode** : **dry-run uniquement cette session**. Soumission live planifiée
après création compte + liaison KBIS.

---

## 1. Création / configuration du compte data.gouv.fr

- [ ] Créer compte personnel sur https://www.data.gouv.fr (gratuit, email).
- [ ] Activer la double authentification (recommandé pour API key).
- [ ] Créer/rejoindre l'**organisation** "ServicesArtisans SAS".
  - SIREN obligatoire. SIREN ServicesArtisans SAS : **à compléter par Marvin**.
  - Le système data.gouv.fr vérifie automatiquement vs base Sirene Etalab.
- [ ] Joindre le KBIS PDF si la vérif Sirene seule ne suffit pas (rare —
      Etalab fait la vérif inversée KBIS pour les SAS récentes).
- [ ] Attendre validation organisation par modération data.gouv.fr.
  - Délai typique : **J+1 à J+3 ouvrés**.
  - Pas de validation = pas de soumission possible côté API.

## 2. Récupération API key

- [ ] Une fois l'organisation validée, aller dans **Profil → Mes API keys**.
- [ ] Générer une clé personnelle longue durée.
- [ ] **Stocker hors repo** : `/c/Users/USER/.secrets/datagouv.env`
      (pattern identique Ahrefs — JAMAIS dans `.env*` du repo).
  ```bash
  echo "DATAGOUV_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxx" \
    > /c/Users/USER/.secrets/datagouv.env
  chmod 600 /c/Users/USER/.secrets/datagouv.env
  ```

## 3. Validation du payload (dry-run obligatoire)

- [ ] Vérifier `tmp/datagouv-submission-2026-05-22/dataset-metadata.json` :
  - title, description, license `cc-by`, frequency `monthly`,
    spatial `country/FR`, temporal_coverage start `2026-01-01`.
  - 4 resources (CSV + embed.html + page canonique + hub datasets).
  - extras.canonical_url pointe vers `/barometre/renovation-energetique-2026`.
- [ ] Vérifier que les 3 URLs publiques résolvent avec un `200` :
  ```bash
  for u in \
    https://servicesartisans.fr/api/v1/barometre/renovation/export.csv \
    https://servicesartisans.fr/api/v1/barometre/renovation/embed.html \
    https://servicesartisans.fr/barometre/renovation-energetique-2026 \
    https://servicesartisans.fr/datasets; do
    echo "$u → $(curl -s -o /dev/null -w "%{http_code}" "$u")"
  done
  ```
  Tous doivent renvoyer `200`. **Bloquant** : si le CSV renvoie 404, la
  PR de cette session n'a pas été pushée — re-deployer Vercel.
- [ ] Exécuter le script en mode dry-run (par défaut) :
  ```bash
  DATAGOUV_API_KEY=$(cat /c/Users/USER/.secrets/datagouv.env | cut -d= -f2 | tr -d '\r\n ') \
    npx tsx tmp/datagouv-submission-2026-05-22/script-submit-datagouv.ts
  ```

  - Le script imprime le payload + `[dry-run] would POST to …`.
  - **AUCUNE requête sortante** en dry-run. À valider visuellement.

## 4. Soumission live

- [ ] Une fois dry-run validé + KBIS OK + organisation validée :
  ```bash
  DATAGOUV_API_KEY=$(cat /c/Users/USER/.secrets/datagouv.env | cut -d= -f2 | tr -d '\r\n ') \
    npx tsx tmp/datagouv-submission-2026-05-22/script-submit-datagouv.ts --live
  ```
- [ ] Capturer la réponse 201 (dataset_id + slug + URL data.gouv.fr).
- [ ] Stocker l'ID dans MEMORY : `servicesartisans-datagouv-id.md`.
- [ ] Délai modération communauté : **J+1 à J+7**.
  - Statut `private` au départ, basculera `public` après review.
  - Si rejet → message reçu côté email du compte. Causes typiques :
    - description trop marketing → reformuler en factuel
    - sources non identifiées → ajouter dans description + extras
    - license non claire → vérifier `cc-by` (pas `cc-by-sa` ni `etalab-2.0`).

## 5. Post-publication

- [ ] Ajouter le permalink data.gouv.fr dans :
  - `src/app/(public)/barometre/renovation-energetique-2026/page.tsx`
    (section "Pour aller plus loin" + signal "Référencé sur data.gouv.fr")
  - `src/app/(public)/datasets/page.tsx`
    (badge "Disponible sur data.gouv.fr")
  - `src/app/(public)/datasets/glossaire-rge/page.tsx` (cross-link)
- [ ] Mettre à jour `scripts/llm-stores/src/manifests/data-gouv.mjs` :
  - retirer le commentaire `dry-run only — actual POST/PUT lives behind …`
  - ajouter l'ID dataset retourné dans `extras.datagouv_id`.
- [ ] Ouvrir 12 mails outreach médias Tier 2 + 3 mails Tier 1 dans la foulée
      (réf. Sprint 5 du strategy 20/80 — la publication data.gouv.fr =
      preuve de sérieux pour décrocher les backlinks).
- [ ] Ajouter le backlink data.gouv.fr dans Ahrefs `tmp/disavow.txt`
      whitelist (pas un spam même si ratio refdomains baisse).

## 6. Garanties / contre-indications

- **Backlink** : data.gouv.fr passe `nofollow` sur les liens externes des
  pages dataset → impact PageRank direct **nul**. Le vrai gain est :
  - signal **Trust / EEAT** (gov.fr cite votre source dans un cadre officiel)
  - **citations** dans la presse (les journalistes citent souvent
    « source : data.gouv.fr »)
  - **crédibilité** outreach Tier 1 (« nous publions sur data.gouv.fr »)
- **Risque rejet modération** : faible si données factuelles + sources
  publiques + licence CC-BY 4.0 explicite + organisation validée.
- **Délai total** : organisation J+3, modération dataset J+1 à J+7,
  outreach mail J+7 à J+14, premier backlink presse réaliste **M+1 à M+2**.

## 7. KPIs cibles M+3

| Métrique                          | Avant | Cible M+3 |
| --------------------------------- | ----- | --------- |
| Refdomains DR>50 unique           | 0     | 3-5       |
| Mentions presse régionale         | 0     | 5-8       |
| Mentions presse Tier 1            | 0     | 1-2       |
| Embed iframe live (médias tiers)  | 0     | 8-15      |
| Page rank DR du domaine SA        | 0.6   | 2-4       |
| Sessions organic /barometre/      | < 50  | 300-600   |
| Backlinks `data.gouv.fr/…` direct | 0     | 1         |

## 8. Hors-scope cette session (Marvin only)

- Création compte personnel
- Liaison KBIS ServicesArtisans SAS
- Génération API key
- Exécution `--live`
- Outreach presse

Tout le code (CSV endpoint + script soumission + payload metadata) est livré
**prêt-à-tourner** dans cette PR.
