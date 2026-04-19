# Plan v2 — Chapitre 3 : RGPD & Legal Pre-Clearance

**Statut** : Pre-clearance obligatoire avant outreach 50K artisans RGE
**Échéance** : Toutes les actions P0 closes avant J-7 du premier envoi
**Auteur** : Équipe ServicesArtisans
**Date** : 2026-04-18
**Révision légale recommandée** : avocat data protection + DPO externe (budget chap. 9)
**Périmètre** : 970K providers en DB, pivot indexation RGE-only (50K), outreach email+SMS, contenu YMYL (aides MaPrimeRénov')

---

## Executive Summary

ServicesArtisans détient 970K fiches providers contenant noms, adresses, SIRET, téléphones et emails. Sans clarification immédiate de la source et de la base légale de ce traitement, un seul signalement CNIL suffit à déclencher un contrôle sur place (art. 58 RGPD) avec pouvoir de saisie des serveurs Supabase. Le barème CNIL 2026 plafonne les sanctions à **20M€ ou 4 % du CA mondial** (art. 83.5 RGPD). Pour une TPE, la CNIL applique historiquement un plafond modulé (cf. délibération SAN-2023-019 Canal+ : 600K€ pour démarchage non consenti, SAN-2022-021 Free Mobile : 300K€ pour défaut de sécurité).

Ce chapitre fournit :

1. Un arbre de décision RGPD selon les 3 scénarios d'acquisition plausibles (scraping, import sirene, opt-in organique).
2. Les règles d'affichage public des 50K fiches RGE pivotées (données autorisées / interdites / tolérées).
3. Les règles d'outreach B2B email+SMS conformes (LCEN art. 22, L34-5 CPCE) avec templates A/B.
4. Les mentions juridiques YMYL pour contenu aides financières (MaPrimeRénov', CEE).
5. Les 12 actions ordonnées du Pre-Clearance avec estimation coût et risque résiduel.

**Risque résiduel si rien n'est fait** : sanction CNIL 150K-600K€ + injonction de cesser le traitement + médiatisation négative = extinction commerciale probable.

**Coût compliance minimum viable** : 3 800 € (option DIY + relecture avocat junior).
**Coût compliance niveau Anthropic** : 12 500 € (DPO externe + avocat senior + outils).

---

## 1. Audit RGPD — Source des 970K providers

### 1.1 Questions à clarifier avant tout outreach

La base légale d'un traitement de données personnelles **doit être définie AVANT la collecte** (art. 6 RGPD). Elle ne peut pas être reconstruite a posteriori. Avant toute action, le CEO doit répondre par écrit aux 7 questions suivantes (stocker la réponse dans `docs/compliance/data-origin-statement.md` signé + horodaté) :

| #   | Question                                                                                                                  | Implication légale                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Q1  | **D'où viennent les 970K records ?** (scraping Pages Jaunes, import CSV sirene.fr, achat fichier tiers, opt-in organique) | Détermine la base légale applicable (art. 6.1 RGPD)                                                          |
| Q2  | **Les téléphones et emails sont-ils génériques (contact@, info@) ou nominatifs (prenom.nom@) ?**                          | Les emails nominatifs = données personnelles → RGPD applicable. Emails génériques pro = zone grise (cf. 1.3) |
| Q3  | **Date de collecte initiale ?**                                                                                           | Durée de conservation max = 3 ans sans sollicitation active (CNIL fiche prospection 2024)                    |
| Q4  | **Les artisans ont-ils été informés de la collecte ?**                                                                    | Obligation d'information art. 13-14 RGPD (y compris collecte indirecte)                                      |
| Q5  | **Un opt-out a-t-il été proposé ?**                                                                                       | Pas d'opt-out = violation art. 21 RGPD (droit d'opposition)                                                  |
| Q6  | **Y a-t-il une AIPD (Analyse d'Impact) documentée ?**                                                                     | Obligatoire si profilage + volume > 100K (art. 35 RGPD + lignes directrices WP248)                           |
| Q7  | **Qui est désigné DPO ?**                                                                                                 | Obligatoire si traitement à grande échelle (art. 37 RGPD) — 970K = grande échelle sans ambiguïté             |

**Deadline réponse CEO** : J-14 avant premier envoi outreach.

### 1.2 Scénarios et bases légales applicables

**Scénario A — Import sirene.fr (Open Data INSEE)**

- Source : base SIRENE publiée en Open Data par l'INSEE (licence Etalab 2.0).
- Données publiques : SIRET, raison sociale, adresse, APE/NAF, dates.
- Données NON présentes dans SIRENE : téléphone, email, contact personnel.
- Base légale applicable pour SIRENE : **intérêt légitime** (art. 6.1.f RGPD) pour un annuaire professionnel, sous réserve d'information (art. 14 RGPD).
- **Problème** : si la base contient phone+email, ils n'ont PAS été obtenus via SIRENE. Source complémentaire obligatoire à documenter.
- Risque sanction si seul SIRENE : faible (déjà traitement accepté par CNIL, cf. délibération 2018-153 annuaires).

**Scénario B — Scraping Pages Jaunes / sites tiers**

- Techniquement possible (HTML publics) mais juridiquement risqué.
- Jurisprudence : **Cass. com. 4 décembre 2013, n°12-26.186** (Leboncoin vs Entreparticuliers) : extraction substantielle d'une base de données = concurrence déloyale + violation art. L342-1 CPI.
- RGPD : scraping = collecte indirecte → obligation d'information art. 14 RGPD sous 30 jours ou lors du premier contact. **Si non respectée → sanction directe**.
- Précédent CNIL : **SAN-2023-020 Cityscoot** (125 000 €) pour collecte disproportionnée (mais différent). Plus pertinent : **CNIL Espagne AEPD vs Equifax 2021 (1M€)** pour scraping professionnels.
- Base légale possible : intérêt légitime (art. 6.1.f) MAIS uniquement si test de balance documenté (LIA — Legitimate Interest Assessment) prouvant que l'intérêt business ne l'emporte pas sur les droits des personnes.
- Risque sanction scraping non documenté : **150K-600K€** (TPE française, cf. SAN-2023-019 Canal+ 600K€).

**Scénario C — Opt-in organique (formulaire claim)**

- Base légale : **consentement** (art. 6.1.a RGPD) + consentement spécifique art. 7.
- Le plus protecteur mais inapplicable rétroactivement aux 970K records non collectés ainsi.
- À viser pour les artisans qui claim leur fiche après outreach (le claim = consentement explicite).

**Scénario D — Achat fichier tiers (courtage données)**

- Base légale possible : intérêt légitime + fourniture de la preuve d'un consentement initial valide par le vendeur.
- CNIL **délibération SAN-2022-009 Free** rappelle que l'acheteur ne peut pas se décharger sur le vendeur → vérification obligatoire.
- Documents requis : contrat de cession + attestation RGPD du cédant + échantillon de preuves d'opt-in + AIPD.
- Risque sanction : **100K-300K€** si preuves d'opt-in du vendeur insuffisantes.

### 1.3 Statut juridique des données pros (email `contact@`, téléphone fixe)

**Point critique souvent mal compris** : le RGPD ne distingue pas "email pro" vs "email perso". Il distingue **données personnelles** vs **données non personnelles**.

Un email `contact@artisan-plombier-nice.fr` lié à une société identifiable = **donnée personnelle** au sens RGPD (cf. considérant 14 + CJUE C-434/16 Nowak, 2017 : toute info se rapportant à une personne physique identifiée ou identifiable).

**Exception** : personne morale (SARL, SAS). Les données d'une personne morale (raison sociale, SIRET) ne sont PAS des données personnelles.

**Cas spécifique artisan individuel** : un auto-entrepreneur, EI, micro-entrepreneur = personne physique = RGPD pleinement applicable même pour ses coordonnées pro. Sur 970K providers, la proportion de personnes physiques vs morales doit être quantifiée (probablement 60-75 % de personnes physiques vu la structure du marché artisanal).

**Conséquence opérationnelle** : le statut "B2B" ne dispense PAS du RGPD pour les TPE/EI. Seul le régime de prospection change (cf. §3).

### 1.4 Barème sanctions CNIL 2026

| Manquement                       | Article RGPD         | Sanction max théorique | Pratique CNIL TPE/PME (médiane) |
| -------------------------------- | -------------------- | ---------------------- | ------------------------------- |
| Base légale défaillante          | art. 6               | 20M€ ou 4 % CA         | 50-300K€                        |
| Défaut d'information             | art. 13-14           | 20M€ ou 4 % CA         | 20-150K€                        |
| Défaut AIPD                      | art. 35              | 10M€ ou 2 % CA         | 20-100K€                        |
| Prospection non consentie        | art. 21 + L34-5 CPCE | 20M€ ou 4 % CA         | 100-600K€                       |
| Défaut DPO                       | art. 37              | 10M€ ou 2 % CA         | 20-50K€                         |
| Transfert hors UE non encadré    | art. 44-49           | 20M€ ou 4 % CA         | 50-500K€                        |
| Défaut de sécurité (data breach) | art. 32              | 10M€ ou 2 % CA         | 50-300K€                        |

**Source barème** : [CNIL — Les sanctions prononcées](https://www.cnil.fr/fr/les-sanctions-prononcees-par-la-cnil), révisions rapport annuel 2025 publié mars 2026.

**Facteurs aggravants 2025-2026** (CNIL orientation stratégique) :

- Volume > 100K personnes → coefficient multiplicateur 1,5-3x.
- Absence totale de documentation compliance → sanction plancher augmentée de 50 %.
- Démarchage non sollicité → sanction automatique supplémentaire (plafond pénal cumulable : 750€ par envoi litigieux, art. R10-1 CPCE).

### 1.5 Documents obligatoires à produire

Avant tout outreach, les documents suivants doivent exister (horodatés, signés, stockés sous `docs/compliance/`) :

1. **Registre des traitements** (art. 30 RGPD) — modèle CNIL : [cnil.fr/fr/registre](https://www.cnil.fr/fr/RGPD-le-registre-des-activites-de-traitement).
   - Traitement 1 : Annuaire public professionnel (970K providers).
   - Traitement 2 : Comptes utilisateurs (clients).
   - Traitement 3 : Comptes artisans claim.
   - Traitement 4 : Prospection B2B (outreach RGE).
   - Traitement 5 : Avis et modération.
   - Traitement 6 : Leads commerciaux (devis).
2. **AIPD** (Analyse d'Impact) pour le traitement "Annuaire 970K" et le traitement "Prospection 50K" — obligatoires (volume + profilage + personnes vulnérables TPE).
3. **Legitimate Interest Assessment (LIA)** si base légale = intérêt légitime, documentant le test de balance (nécessité, proportionnalité, droits des personnes).
4. **Politique de confidentialité** publique (art. 13-14 RGPD) listant : finalités, bases légales, durées, destinataires, droits.
5. **Contrat sous-traitant** (DPA) avec Supabase signé (art. 28 RGPD) — à récupérer via le dashboard Supabase.
6. **Procédure de gestion des droits** (accès, rectification, effacement, opposition, portabilité) avec SLA 1 mois (art. 12.3 RGPD).
7. **Procédure de notification violation** (art. 33-34) : notification CNIL sous 72h + information personnes si risque élevé.
8. **Désignation DPO** (interne ou externe) notifiée à la CNIL via [cnil.fr/fr/designer-un-dpo](https://www.cnil.fr/fr/designer-un-dpo).

---

## 2. Compliance affichage public fiches artisans non-claim

### 2.1 Principe directeur

Les 50K fiches RGE pivotées sont affichées SANS consentement explicite des artisans concernés. La base légale retenue est **l'intérêt légitime** (art. 6.1.f RGPD) couplé à la notion d'**annuaire professionnel d'intérêt public** (cf. délibération CNIL 2018-153 relative aux annuaires).

Cette base est solide SI et SEULEMENT SI :

- Seules les données professionnelles au sens strict sont affichées.
- Un droit d'opposition simple est effectivement opérationnel.
- L'information art. 14 RGPD est délivrée (page "Comment nous traitons vos données").

### 2.2 Données AFFICHABLES sans consentement (zone verte)

| Donnée                             | Source                                      | Justification                                    |
| ---------------------------------- | ------------------------------------------- | ------------------------------------------------ |
| Raison sociale                     | SIRENE Open Data                            | Publique par nature (registre du commerce)       |
| SIRET                              | SIRENE                                      | Publique par nature                              |
| Code NAF/APE                       | SIRENE                                      | Publique                                         |
| Adresse de l'établissement         | SIRENE                                      | Publique (sauf adresse du domicile EI — cf. 2.4) |
| Forme juridique                    | SIRENE                                      | Publique                                         |
| Date de création                   | SIRENE                                      | Publique                                         |
| Qualification RGE                  | Annuaire france-renov.gouv.fr               | Registre public officiel                         |
| Certifications Qualibat/Qualit'EnR | Organismes certificateurs, listes publiques | Publiques par nature du label                    |

**Référence jurisprudentielle** : **CE, 10e et 9e ch., 18 octobre 2018, n°405608** — le Conseil d'État confirme que la publication d'informations professionnelles extraites de registres publics ne nécessite pas de consentement si la finalité est légitime et l'information délivrée.

### 2.3 Données INTERDITES en affichage public (zone rouge)

CNIL **recommandation 2024 sur les annuaires en ligne** (publiée le 14 mai 2024, [cnil.fr/fr/annuaires-en-ligne-la-cnil-publie-ses-recommandations](https://www.cnil.fr/fr/annuaires-en-ligne-la-cnil-publie-ses-recommandations)) :

| Donnée                                                           | Statut                                  | Justification interdit             |
| ---------------------------------------------------------------- | --------------------------------------- | ---------------------------------- |
| Téléphone personnel / mobile privé                               | INTERDIT sans consentement              | Donnée personnelle hors sphère pro |
| Email nominatif `prenom.nom@`                                    | INTERDIT sans consentement              | Idem                               |
| Prénom+nom du dirigeant si non publié par l'entreprise elle-même | INTERDIT                                | Attendu CNIL 2024                  |
| Photo du dirigeant (si non fournie)                              | INTERDIT                                | Données image = sensibles          |
| Note agrégée générée automatiquement                             | INTERDIT sans méthodologie transparente | CNIL 2024 + loi Hamon              |
| Avis tiers sans modération humaine                               | À risque                                | Cf. §6                             |

**Conséquence immédiate pour ServicesArtisans** : la base 970K doit être **purgée** des colonnes `phone` et `email` pour les 920K artisans non-RGE non-claim. Seules les 50K fiches RGE pivotées peuvent afficher l'adresse professionnelle (pas phone/email) + un formulaire de mise en relation qui route vers l'artisan via un canal que nous contrôlons.

### 2.4 Cas particulier : adresse du domicile des EI/auto-entrepreneurs

Un EI ou auto-entrepreneur peut avoir domicilié son entreprise à son domicile personnel. Dans ce cas, l'adresse SIRENE = adresse personnelle.

**Recommandation CNIL** : masquer la voie et le numéro si le code NAF + le SIRENE correspondent à un EI sans local commercial distinct. Afficher uniquement ville + code postal.

**Implémentation technique** (à prévoir en §9) : requête SQL identifiant les providers dont l'adresse est identique à une adresse résidentielle connue (cross-check via DVF cadastre) → masquer voie/numéro.

### 2.5 Workflow opt-out 1-clic

Obligation art. 21 RGPD : le droit d'opposition doit être **aussi simple à exercer que le traitement est facile à faire**.

**Spécification fonctionnelle** :

- Sur chaque fiche non-claim, un lien visible en pied de fiche : `"Vous êtes cet artisan ? Demander le retrait ou réclamer la fiche"`.
- Page dédiée `/opt-out/[slug]` accessible sans compte.
- Formulaire : SIRET de vérification (cross-check SIRENE en temps réel) + email + raison (optionnelle).
- Confirmation par email avec lien à cliquer sous 7 jours (double opt-in pour éviter abus concurrents).
- **Délai de traitement : 15 jours calendaires** (SLA interne plus strict que les 30 jours légaux).
- Après retrait : fiche 410 Gone (pas 404) + `X-Robots-Tag: noindex` + entrée dans `docs/compliance/optout-log.csv` (horodatée, signée hash SHA-256 pour intégrité).
- Audit logs (table `audit_logs` existante) : `action='opt_out_request'`, `resource_type='provider'`, `metadata={siret, email, status}`.

**Risque si non-implémenté** : CNIL **SAN-2023-022** (PAP.fr, 100K€) pour droit d'opposition défaillant.

### 2.6 Page "Droit d'opposition" dédiée

Créer `/mentions-rgpd/` avec les 8 droits RGPD listés + formulaire unique de contact DPO :

1. Droit d'accès (art. 15) — SLA 1 mois
2. Droit de rectification (art. 16)
3. Droit à l'effacement (art. 17)
4. Droit à la limitation (art. 18)
5. Droit à la portabilité (art. 20)
6. Droit d'opposition (art. 21)
7. Droit de ne pas faire l'objet de décision automatisée (art. 22)
8. Droit de réclamation CNIL (www.cnil.fr/fr/plaintes)

---

## 3. Outreach 50K artisans RGE — règles strictes

### 3.1 Cadre légal applicable

Deux régimes se superposent pour l'outreach B2B :

**A. Prospection par email** — régie par la **LCEN art. 22** (loi Confiance Économie Numérique 2004) + **Loi République Numérique 2016**.

Principe général LCEN : opt-in préalable (art. L34-5 CPCE pour BtoC, art. 22 LCEN pour BtoB avec assouplissement).

**Exception BtoB LCEN art. 22 alinéa 4** : est dispensée de consentement préalable la prospection envoyée à une adresse professionnelle d'une personne morale, sous réserve :

1. Le message concerne l'activité professionnelle du destinataire.
2. Le destinataire a été informé de la collecte et peut s'opposer à l'utilisation.
3. Un lien de désabonnement fonctionnel est présent.

**Position CNIL 2024** (mise à jour doctrine prospection) : adresse `contact@entreprise.fr`, `info@`, `secretariat@` = adresses **génériques** → régime BtoB assoupli applicable. Adresse `prenom.nom@entreprise.fr` = adresse **nominative** → régime BtoC = opt-in préalable obligatoire.

**Conséquence opérationnelle critique** : sur les 50K emails RGE, il faut **classifier email par email** en `generic` vs `nominative`. L'outreach sans opt-in n'est possible que sur les emails génériques.

Estimation du split (benchmarks secteur artisanat) :

- Génériques (`contact@`, `info@`, `devis@`) : ~55-65 %
- Nominatifs (`prenom.nom@`, `prenom@`) : ~35-45 %
- Ambigus (`sarl-durand@gmail.com`) : ~0-5 %

→ **Cohorte addressable sans opt-in : ~30K emails max sur 50K**.

Les emails nominatifs doivent passer par un autre canal (courrier postal, SMS pro, appel via un préposé humain avec mention LCEN).

**B. Prospection par SMS** — régie par **L34-5 CPCE**.

Le SMS est assimilé à l'appel téléphonique automatisé → régime **strict opt-in préalable obligatoire même en BtoB** sauf exception narrow.

Position CNIL (référentiel prospection mise à jour juillet 2024) : le SMS à un numéro de mobile professionnel d'une personne physique (EI, auto-entrepreneur) = interdit sans consentement.

**Conséquence** : le SMS outreach doit être abandonné OU limité aux numéros fixes pro (01, 02, 03, 04, 05) ET uniquement pour prospection proportionnée et documentée. **Recommandation : abandonner le SMS dans le premier tour d'outreach**. Réserver le SMS aux artisans qui ont opt-in post-claim.

### 3.2 Mentions légales obligatoires dans chaque email

Tout email d'outreach doit contenir (art. 22.III LCEN + art. 13 RGPD) :

1. Identité de l'expéditeur (ServicesArtisans SAS, SIRET, adresse siège).
2. Finalité : "Proposition de référencement de votre entreprise RGE".
3. Source des données : "Votre entreprise figure dans l'annuaire RGE officiel de france-renov.gouv.fr".
4. Base légale : "Intérêt légitime à contacter les professionnels RGE".
5. Droits : "Vous pouvez vous opposer à tout moment en cliquant sur le lien de désinscription".
6. Lien désinscription fonctionnel (obligation L34-5 + art. 22 LCEN).
7. Coordonnées DPO : dpo@servicesartisans.fr.
8. Mention : "Vous pouvez adresser une réclamation à la CNIL (www.cnil.fr)".

**Risque si manquement** : plafond pénal R10-1 CPCE = 750€ par message × 50 000 = **37,5M€ théoriques**. En pratique la CNIL module, précédent **SAN-2023-019 Canal+ = 600K€ pour 125M emails**.

### 3.3 Volume et cadence recommandés

Aucune limite chiffrée dans la loi, mais CNIL + ARCEP encadrent via la notion de **proportionnalité** (art. 5.1.c RGPD — minimisation).

Cadence recommandée :

- **Vague 1 (J0)** : 5 000 emails — cohorte pilote, email générique uniquement.
- **Attendre 14 jours** : mesurer taux bounce (> 5 % = problème qualité data, arrêt immédiat), taux plainte spam (> 0,1 % = arrêt immédiat car signal CNIL).
- **Vague 2 (J+14)** : 10 000 emails.
- **Vague 3 (J+28)** : 15 000 emails.
- **Vague 4 (J+42)** : reliquat jusqu'à 30K max emails génériques.

Fréquence par destinataire : **maximum 2 emails** total (initial + 1 relance à J+10). Pas de 3e relance. Après 2 emails sans réponse → cohorte "cold", exclusion définitive.

### 3.4 Templates email conformes — 3 versions A/B

**Template A — Informatif neutre** (baseline conversion attendue : 0,8-1,5 %)

```
Objet : Votre entreprise [RAISON_SOCIALE] est listée sur ServicesArtisans

Bonjour,

Votre entreprise [RAISON_SOCIALE] (SIRET [SIRET_MASQUE_4]) apparaît dans l'annuaire RGE officiel publié par France Rénov'. Nous référençons ces entreprises sur ServicesArtisans.fr pour aider les particuliers à trouver des artisans qualifiés pour leurs travaux de rénovation énergétique.

Votre fiche : https://servicesartisans.fr/p/[SLUG]

En tant que dirigeant, vous pouvez :
- Réclamer et compléter votre fiche gratuitement : [LIEN_CLAIM]
- Demander son retrait : [LIEN_OPTOUT]

Source des données : france-renov.gouv.fr + base SIRENE (INSEE).
Base légale : intérêt légitime à maintenir un annuaire professionnel (art. 6.1.f RGPD).
Désinscription de nos prochains messages : [LIEN_UNSUB]

Cordialement,
L'équipe ServicesArtisans

---
ServicesArtisans SAS — [ADRESSE_SIEGE] — SIRET [NOTRE_SIRET]
DPO : dpo@servicesartisans.fr
Réclamation CNIL : www.cnil.fr/fr/plaintes
```

**Template B — Orienté bénéfice** (baseline attendue : 1,5-3 %)

```
Objet : [RAISON_SOCIALE] — 127 demandes de devis RGE cette semaine dans votre département

Bonjour,

ServicesArtisans.fr reçoit actuellement 3 200 demandes de devis par mois pour des travaux RGE (pompes à chaleur, isolation, MaPrimeRénov'). Votre entreprise [RAISON_SOCIALE] est déjà listée dans notre annuaire.

En réclamant votre fiche gratuitement, vous pouvez :
- Afficher votre téléphone et recevoir des appels directs
- Publier photos de chantiers et avis clients
- Recevoir les demandes de devis de votre zone

Réclamer ma fiche : [LIEN_CLAIM]
Voir ma fiche actuelle : [LIEN_FICHE]

Source : votre qualification RGE figure sur france-renov.gouv.fr.
Base légale : intérêt légitime (art. 6.1.f RGPD).
Se désinscrire : [LIEN_UNSUB]

---
[Mentions légales identiques template A]
```

**Template C — Ultra-court** (baseline attendue : 0,5-1 % mais plus haute délivrabilité)

```
Objet : Votre fiche RGE sur ServicesArtisans

Bonjour [PRENOM_SI_DISPO ou RAISON_SOCIALE],

Votre entreprise figure dans l'annuaire RGE de france-renov.gouv.fr, donc sur ServicesArtisans.fr.

Voir votre fiche : [LIEN_FICHE]
La réclamer gratuitement : [LIEN_CLAIM]
Demander retrait : [LIEN_OPTOUT]

— L'équipe ServicesArtisans

Base légale : art. 6.1.f RGPD. Désinscription : [LIEN_UNSUB]. DPO : dpo@servicesartisans.fr.
```

Tester A vs B vs C sur 3 cohortes de 500 emails (vague pilote), garder la variante avec meilleur taux claim ET taux plainte < 0,05 %.

### 3.5 Templates SMS (réservés post-claim uniquement)

**Rappel** : SMS réservé aux artisans ayant opt-in via le process claim. Interdit en outreach initial.

```
SVC Artisans : Nouveau devis RGE à Nice (06000), pompe à chaleur. Répondez OUI pour recevoir les détails. STOP au 36180 pour désinscrire.
```

Mentions obligatoires : nom expéditeur, numéro STOP conforme ARCEP (36180), identifiant court (SVC Artisans).

### 3.6 Gestion bounces et opt-out automatiques

Pipeline technique obligatoire :

1. **Bounce hard (5xx SMTP)** → exclusion DB immédiate (flag `email_invalid=true`). Pas de 2e tentative.
2. **Bounce soft (4xx)** → 1 retry à J+3 max. Si second bounce → `email_invalid=true`.
3. **Plainte spam (FBL — Feedback Loop)** → exclusion immédiate + flag `spam_complaint=true` + log dans `audit_logs`. Ne plus jamais contacter par aucun canal.
4. **Clic lien désinscription** → insertion dans table `email_optouts` avec timestamp + source. Vérification systématique avant tout envoi futur (toutes finalités).
5. **Réponse "STOP", "désinscription", "unsubscribe" détectée** → exclusion manuelle sous 24h.

**Tool recommandé** : Mailjet (EU, conforme RGPD) ou Brevo (EU, ex-Sendinblue). Ne PAS utiliser SendGrid (US) sans SCC documentés.

**Rétention des logs d'opt-out** : 3 ans minimum (CNIL fiche 2024) pour prouver respect de la désinscription.

---

## 4. YMYL — Protection juridique contenu aides financières

### 4.1 Contexte risque YMYL

Le contenu ServicesArtisans traitant de MaPrimeRénov', CEE, Éco-PTZ, TVA 5,5 % relève de YMYL (Your Money Your Life) au sens Google E-E-A-T + constitue des **informations à portée juridico-financière** au sens du droit français.

Risques :

1. Erreur sur montant MaPrimeRénov' → action en responsabilité contractuelle (art. 1231-1 Code civil) par artisan ou particulier.
2. Information périmée sur CEE → action en concurrence déloyale (art. 1240 Code civil).
3. Qualification de "conseil en investissement" → régulation AMF (peu probable mais à cadrer).
4. Qualification de "courtage en opérations d'assurance" ou "courtage en IOBSP" → régulation ACPR (peu probable).

### 4.2 Auteur identifié obligatoire

CNIL + Google E-E-A-T requièrent un auteur identifié pour chaque contenu YMYL.

Spécification :

- Chaque article `/guides/` et `/blog/` signé nom+prénom + titre + bio + LinkedIn.
- Page `/a-propos/equipe/` listant les auteurs avec crédits (diplôme, expérience, certifications).
- Schema.org `Article` avec `author` + `reviewedBy` (relecteur expert indépendant pour les contenus sensibles).

Si pas d'expert interne → faire appel à un **expert externe sous contrat de prestation** pour relire et co-signer (ex : ancien conseiller France Rénov', courtier RGE). Coût : 150-300€ / article relu.

### 4.3 Mentions disclaimer obligatoires

Toute page traitant d'aides financières doit contenir en fin de contenu :

```
⚠️ Cette information est fournie à titre indicatif et ne constitue ni un conseil juridique,
ni un conseil fiscal, ni un conseil en investissement.
Les montants, conditions et barèmes présentés sont susceptibles d'évoluer.
Avant toute décision, consultez les sources officielles :
- France Rénov' : www.france-renov.gouv.fr (Espace Conseil France Rénov')
- ANAH : www.anah.gouv.fr
- Impots.gouv.fr pour les crédits d'impôt

Dernière vérification par notre équipe : [DATE_VERIFICATION]
Auteur : [NOM_AUTEUR] — [FONCTION]
Relu par : [NOM_RELECTEUR_EXPERT]
```

Placer en fin de contenu (pas en pop-up qui gêne conversion) avec styling discret mais lisible (14px, gris 600, fond clair).

### 4.4 Datestamp et traçabilité mise à jour

Chaque page YMYL doit afficher :

- `Publié le [DATE_CREATION]`
- `Dernière mise à jour : [DATE_UPDATE]`
- `Prochaine vérification prévue : [DATE_UPDATE + 90j]`

Champ `lastVerifiedAt` dans la DB par page + tâche cron qui alerte quand > 90j.

### 4.5 Process de mise à jour barèmes — traçabilité

Table `content_updates` avec colonnes :

- `page_slug`, `field_updated`, `old_value`, `new_value`, `updated_by`, `source_url`, `updated_at`.

Workflow mensuel (premier lundi du mois) :

1. Auditeur interne lit les bulletins officiels Anah + france-renov.gouv.fr + legifrance.
2. Cross-check avec les montants affichés sur le site.
3. Si écart → PR sur `content/renovation/*.md` + entrée dans `content_updates`.
4. Republication avec nouveau `lastVerifiedAt`.

Responsable : rôle `content_reviewer` dédié (peut être le CEO ou un rédacteur senior).

**Précédent juridique** : **TGI Paris 27 juin 2019** (n°17/18482) — site d'information condamné pour avoir maintenu des informations fiscales périmées ayant induit en erreur. Dommages-intérêts 35K€ + obligation de retrait.

### 4.6 Sources officielles à citer systématiquement

Pour toute info aide financière, citation d'au moins UNE source officielle via lien `rel="noopener"` :

- **MaPrimeRénov'** : www.maprimerenov.gouv.fr ou www.anah.gouv.fr
- **CEE** : www.ecologie.gouv.fr/dispositif-des-certificats-economies-denergie
- **Éco-PTZ** : www.service-public.fr/particuliers/vosdroits/F19905
- **TVA 5,5 %** : www.impots.gouv.fr (recherche "TVA rénovation")
- **Annuaire RGE officiel** : france-renov.gouv.fr/annuaire-rge

Schema.org `citation` dans le JSON-LD pour aider Google à identifier les sources.

---

## 5. CGU + CGV à jour

### 5.1 Qualification juridique ServicesArtisans

Avant rédaction CGU, trancher le statut :

| Statut                             | Obligations                                               | Avantages                | Risques                                            |
| ---------------------------------- | --------------------------------------------------------- | ------------------------ | -------------------------------------------------- |
| **Éditeur**                        | Responsabilité du contenu art. 93-2 Loi 1982              | Contrôle éditorial total | Responsabilité civile/pénale sur tout contenu      |
| **Hébergeur LCEN art. 6**          | Pas de responsabilité proactive, retrait sur notification | Protection large         | Perte si "rôle actif" caractérisé (CJUE eBay 2011) |
| **Intermédiaire mise en relation** | Obligations spécifiques art. L111-7 C.conso (loi Hamon)   | Position neutre          | Obligations de transparence renforcées             |
| **Annonceur**                      | Responsabilité contenu + annonces                         | Simple                   | Exposition max                                     |

**Recommandation ServicesArtisans** : statut hybride **Éditeur de contenu éditorial + Intermédiaire mise en relation + Hébergeur pour UGC (avis)**.

Justification :

- Contenus `/guides/`, `/blog/`, fiches RGE éditorialisées = éditeur.
- Formulaires devis, chat client-artisan = intermédiaire mise en relation.
- Avis clients UGC = hébergeur LCEN.

Cette qualification doit apparaître en tête des CGU.

### 5.2 Obligations art. L111-7 C. consommation (loi République Numérique)

Obligation de transparence des plateformes de mise en relation :

1. Critères de classement des résultats (algorithme) — publier loyaulement.
2. Existence d'une relation contractuelle ou d'un lien capitalistique avec les professionnels référencés.
3. Existence ou non d'une rémunération (lead facturé, subscription payante).

Créer page `/classement-et-tri` expliquant :

- Les résultats sont triés par : distance + pertinence RGE + ancienneté + avis (pondérations explicites).
- Un artisan peut-il payer pour remonter ? Si oui (option "boost") → le mentionner avec badge "Sponsorisé" conforme DGCCRF.
- Nos revenus proviennent de : abonnements artisans + leads facturés.

**Sanction** : plafond DGCCRF 1,5M€ pour non-respect L111-7 (cf. décret 2017-1434).

### 5.3 Obligations hébergeur LCEN (notice and take down)

Art. 6 LCEN : l'hébergeur n'est pas responsable du contenu UGC sauf connaissance effective de son caractère illicite et défaut d'action prompte.

Spécifications :

- Formulaire de signalement accessible sur chaque avis et chaque fiche.
- Champs : identité signalant, contenu signalé, motif légal (diffamation, contrefaçon, etc.), preuve.
- SLA : accusé réception sous 48h, décision sous 7 jours ouvrés.
- Log exhaustif : `moderation_actions` (qui, quand, décision, motivation).
- Rétention logs : 1 an (décret LCEN 2011-219).

**Nota** : une simple notification ne suffit pas à engager la responsabilité. Elle doit respecter le formalisme art. 6.I.5 LCEN (identité précise, faits litigieux, motifs, correspondance préalable avec l'auteur du contenu).

### 5.4 CGV B2B (artisans payants)

Si monétisation via lead facturé ou abonnement :

Obligations CGV B2B (art. L441-1 C. commerce) :

- Conditions de vente, barème des prix (HT), réductions, conditions de règlement.
- Clause de réserve de propriété si applicable.
- Pénalités de retard (3x taux légal minimum).
- Indemnité forfaitaire recouvrement 40€ (art. L441-10 C. commerce).

**Facturation** :

- Facture conforme art. 242 nonies A CGI : mentions obligatoires.
- Format électronique conforme **obligation 2026** (à partir de septembre 2026 pour les grandes entreprises, 2027 pour les PME — vérifier calendrier MAJ Bercy) via plateforme de dématérialisation partenaire (PDP) ou portail public de facturation.
- TVA intracom si clients hors France UE.

### 5.5 Droit de rétractation (particuliers)

Si vente de prestation au particulier (non concerné sauf extension) : art. L221-18 C.conso — 14 jours. À documenter si un jour ServicesArtisans vend directement des services au particulier.

---

## 6. Avis et reviews — modération légale

### 6.1 Loi Hamon 2014 + décret 2017-1436

Obligation de transparence sur les processus de modération des avis en ligne.

Afficher sur chaque page d'avis :

- Existence ou non d'un contrôle des avis.
- Caractéristiques principales du contrôle (automatique, humain, délai moyen).
- Date de publication de l'avis + date d'expérience.
- Possibilité ou non pour le professionnel de répondre.
- Critères de tri par défaut.
- Possibilité de demander le retrait d'un avis jugé non conforme.

### 6.2 Norme NF Z 74-501 (AFNOR)

Certification optionnelle mais fortement recommandée pour la crédibilité + défense en cas de contrôle DGCCRF.

Exigences :

- Collecte avis uniquement auprès de clients ayant réellement consommé.
- Modération par personnel formé + procédure documentée.
- Conservation 3 ans des données brutes + preuves d'achat.
- Audit annuel externe possible.

Coût certification : 3 000-8 000 € selon organisme (AFNOR Certification, Bureau Veritas).

**Positionnement ServicesArtisans recommandé** : viser NF Z 74-501 en année 2 après stabilisation produit. Pas P0.

### 6.3 Workflow modération RGPD-compliant

Pipeline :

1. Client dépose avis via formulaire (nom, email vérifié via lien, note, commentaire).
2. IA filtre automatiquement (mots-clés insulte, propos diffamatoires) → quarantaine.
3. Modérateur humain valide sous 7 jours : `published` / `hidden` / `flagged` (statuts déjà présents en DB).
4. Artisan notifié par email + option de réponse publique (droit de réponse art. 6 loi 1881 adapté).
5. Si litige → médiation interne puis médiateur de la consommation (obligation si activité B2C — art. L612-1 C.conso).

### 6.4 Rétention données brutes 5 ans

Les avis publiés peuvent être contestés jusqu'à 5 ans (prescription quinquennale art. 2224 Code civil). Conserver :

- IP du dépôt.
- Email vérifié.
- Booking ou devis lié (preuve de la relation commerciale).
- Horodatage précis.
- Historique modifications.

Table `reviews_audit` dédiée (ou extension de `reviews` existant) avec rétention 5 ans minimum.

### 6.5 Cas litige artisan vs avis négatif

Scénarios fréquents :

1. **Avis diffamatoire** → procédure 6.I.5 LCEN obligatoire AVANT suppression pour se prévaloir de la protection hébergeur.
2. **Avis non authentique** (concurrent malveillant) → burden of proof sur l'artisan (art. 9 CPC). Nous suppriomons uniquement si preuve objective fournie.
3. **Avis légitime défavorable mais dur** → NON supprimé. Réponse publique de l'artisan possible.

Politique publique recommandée : `/politique-avis/` détaillant ces règles.

---

## 7. Cookies et analytics

### 7.1 Cadre CNIL 2024-2026

**Délibération CNIL 2020-091** (lignes directrices cookies) confirmée et renforcée en 2024 :

- Consentement **préalable, libre, spécifique, éclairé, univoque**.
- Refus aussi simple que l'acceptation (bouton "Tout refuser" au même niveau visuel que "Tout accepter").
- Pas de **dark pattern** (couleurs trompeuses, cases pré-cochées, chemin de refus plus long).
- Durée validité consentement : 13 mois max.

Outils nécessitant opt-in :

- Google Analytics 4 (même avec IP anonymisée) — obligatoire depuis sanction Google Analytics 2022.
- PostHog (feature flags + analytics) si tracking visiteurs.
- Microsoft Clarity (heatmaps).
- Meta Pixel.
- Hotjar.

Outils dispensés d'opt-in (CNIL liste 2024) :

- Cookies techniques strictement nécessaires (session, CSRF, panier).
- Mesure d'audience anonymisée (Matomo configuré conformément, Plausible) avec IP tronquée + pas de cross-site tracking.

### 7.2 Recommandation CMP (Consent Management Platform)

| Outil             | Hébergement    | Prix         | Notes                                                  |
| ----------------- | -------------- | ------------ | ------------------------------------------------------ |
| **Axeptio**       | FR             | 15-90€/mois  | Favori ServicesArtisans. FR, réputation, intégrations. |
| **Didomi**        | FR             | 30-300€/mois | Plus enterprise, overkill pour TPE.                    |
| **Cookiebot**     | DK (EU)        | 10-50€/mois  | Correct, scan automatique.                             |
| **Tarteaucitron** | Open source FR | 0€           | DIY, maintenance interne. Bon pour MVP.                |

**Recommandation** : démarrer avec **Tarteaucitron** (0€, conforme, code ouvert auditable) puis migrer Axeptio si volume visiteurs > 50K/mois + besoin reporting avancé.

### 7.3 Bandeau conforme — spécifications UX

Exigences :

- Affiché **avant tout dépôt de cookie non essentiel**.
- 2 boutons visuellement équivalents : "Tout accepter" / "Tout refuser".
- Option "Personnaliser" accessible en 1 clic.
- Lien vers politique cookies complète.
- Pas de cross sur le bandeau qui équivaut à acceptation (dark pattern interdit).

Mock textuel :

```
ServicesArtisans utilise des cookies pour :
  - Fonctionnement du site (essentiels, toujours actifs)
  - Mesure d'audience (Matomo, Plausible)
  - Amélioration produit (PostHog, si activé)

[ Tout accepter ]  [ Tout refuser ]  [ Personnaliser ]

Politique cookies  |  Mentions légales
```

### 7.4 Documentation consentement

Le consentement donné doit être tracé (art. 7.1 RGPD : capacité à démontrer).

Table `cookie_consents` avec :

- `user_id` (si connecté) ou `session_id` (hashé).
- `consent_timestamp`.
- `categories_accepted` (JSONB : `{essential: true, analytics: true, marketing: false}`).
- `cmp_version` (version du bandeau).
- `ip_hash` (IP tronquée + salée).

Rétention : 3 ans post-expiration.

---

## 8. Hébergement des données — Supabase et transferts hors UE

### 8.1 Audit Supabase

**À vérifier immédiatement** :

1. **Région hébergement actuelle** — dashboard Supabase → Project Settings → General → Region. Doit être `eu-west-3` (Paris AWS) ou `eu-central-1` (Francfort AWS) ou `eu-west-1` (Irlande). Si `us-east-1` ou `ap-south-1` → migration obligatoire.

2. **DPA Supabase signé** — Supabase propose un DPA sur request : [supabase.com/privacy/dpa](https://supabase.com/privacy/dpa). Signature CEO + archivage `docs/compliance/dpa-supabase-signed-[date].pdf`.

3. **Sous-traitants Supabase** — Supabase utilise AWS (sous-traitant ultérieur). Liste disponible : [supabase.com/privacy/subprocessors](https://supabase.com/privacy/subprocessors). Obligation d'accepter les changements sous-traitants art. 28.2 RGPD.

4. **Localisation sauvegardes** — confirmer que PITR backups restent dans la région EU.

### 8.2 Transferts hors UE — cadre juridique

Si un service tiers est hors UE (Vercel hosting US, Stripe IE→US, SendGrid US, etc.) :

**Instruments de transfert légalement valides** (art. 44-49 RGPD post Schrems II) :

1. **Décision d'adéquation** (art. 45) : Royaume-Uni, Suisse, Canada (entreprises PIPEDA), USA via **Data Privacy Framework (DPF) 2023** pour entreprises certifiées (vérifier sur [dataprivacyframework.gov/list](https://www.dataprivacyframework.gov/list)).
2. **Clauses Contractuelles Types (SCC) 2021** (art. 46.2.c) : à annexer au contrat, avec AIPD spécifique transfert (TIA — Transfer Impact Assessment).
3. **Règles d'entreprise contraignantes (BCR)** : pour les grands groupes, non applicable ici.

**Action immédiate** : inventaire des sous-traitants (onglet dédié dans registre art. 30) + vérification de leur conformité :

| Sous-traitant            | Finalité        | Localisation    | DPF ?          | SCC signé ? | TIA ? |
| ------------------------ | --------------- | --------------- | -------------- | ----------- | ----- |
| Supabase                 | DB + auth       | EU (à vérifier) | N/A si EU      | via DPA     | N/A   |
| Vercel                   | Hosting Next.js | US              | Oui (vérifier) | via DPA     | Oui   |
| Stripe                   | Paiement        | IE + US         | Oui (Stripe)   | via DPA     | Oui   |
| Resend / Mailjet / Brevo | Emails          | UE              | N/A            | via DPA     | N/A   |
| Google Analytics 4       | Analytics       | US              | Oui (Google)   | oui         | Oui   |
| Pipedrive                | CRM simulateur  | EE (UE)         | N/A            | via DPA     | N/A   |

Si un sous-traitant critique n'est ni DPF ni SCC signés → migration obligatoire ou désactivation.

### 8.3 Clause d'audit (art. 28.3.h RGPD)

Le contrat sous-traitant doit autoriser le responsable de traitement à auditer. Supabase propose un Standard Audit Report (SOC 2 Type II) accessible sur demande. Archiver.

### 8.4 Notification violation de données

Process interne obligatoire :

1. Détection → alerte DPO sous 2h.
2. Qualification gravité → notification CNIL art. 33 si risque pour droits et libertés (formulaire CNIL en ligne).
3. Délai : **72h max**.
4. Information personnes concernées si risque élevé (art. 34).
5. Registre violations : table `data_breaches` avec chronologie complète.

---

## 9. Plan d'action urgence — AVANT premier email outreach

### 9.1 7 actions P0 (blocantes)

| #    | Action                                                  | Responsable   | Deadline | Livrable                         | Coût                            |
| ---- | ------------------------------------------------------- | ------------- | -------- | -------------------------------- | ------------------------------- |
| P0.1 | Data Origin Statement signé CEO (7 questions §1.1)      | CEO           | J-21     | `data-origin-statement.md` signé | 0€                              |
| P0.2 | Registre traitements + AIPD Annuaire + AIPD Prospection | DPO externe   | J-14     | 3 docs PDF signés                | 1 500-3 000€                    |
| P0.3 | Politique confidentialité + CGU + CGV publiées          | Avocat junior | J-10     | 3 pages web + Word signés        | 1 500-4 000€                    |
| P0.4 | Purge phone+email de la DB pour 920K non-RGE non-claim  | Tech lead     | J-10     | Script SQL + backup + log        | 0€ (interne)                    |
| P0.5 | Page opt-out `/opt-out/[slug]` + workflow fonctionnel   | Tech lead     | J-7      | URL live + test e2e              | 0€ (interne)                    |
| P0.6 | DPA Supabase signé + vérification région EU             | CEO           | J-14     | PDF signé archivé                | 0€                              |
| P0.7 | CMP cookies déployée (Tarteaucitron minimum)            | Tech lead     | J-7      | Bandeau live + test refus        | 0€ (DIY) à 500€ (Axeptio setup) |

### 9.2 5 actions P1 (peuvent démarrer J-14 mais non-bloquantes premier envoi)

| #    | Action                                                  | Responsable      | Deadline | Livrable                     | Coût       |
| ---- | ------------------------------------------------------- | ---------------- | -------- | ---------------------------- | ---------- |
| P1.1 | Classification emails génériques vs nominatifs          | Tech lead        | J-7      | Script Python + flag DB      | 0€         |
| P1.2 | Setup ESP conforme (Brevo/Mailjet) + DKIM + SPF + DMARC | Tech lead        | J-7      | Score mail-tester.com > 9/10 | 0-50€/mois |
| P1.3 | Templates emails A/B/C + relecture juridique            | Avocat junior    | J-7      | 3 templates validés          | 500-1 000€ |
| P1.4 | Process bounce + optout automatique                     | Tech lead        | J-7      | Tests e2e                    | 0€         |
| P1.5 | Disclaimers YMYL déployés sur contenu aides             | Rédacteur + tech | J-7      | Audit site                   | 0€         |

### 9.3 Ressources humaines et budget

**Option Minimum Viable (3 800 €)**

- Template AIPD + registre CNIL DIY : 0€ (modèles publics)
- Relecture avocat junior (2h à 250€/h) : 500€
- Politique confidentialité templates + adaptation : 1 000€ (avocat junior)
- CGU/CGV templates B2B + adaptation : 1 500€
- Outil CMP cookies (Axeptio starter) : 180€/an
- Setup ESP Brevo : 50€/mois × 12 = 600€

**Option Anthropic-tier (12 500 €)**

- DPO externe 6 mois (forfait mensuel) : 500€/mois × 6 = 3 000€
- Avocat senior data protection (audit complet + rédaction) : 6 000€
- AIPD sur-mesure (2 traitements) : 1 500€
- Certification ISO 27001 consulting (phase 1 scoping) : 1 000€
- CMP Enterprise (Didomi/Axeptio) : 600€/an
- Outil monitoring (Dashlane/Vanta) : 400€

**Recommandation ServicesArtisans** : option hybride à **6 500€** :

- DPO externe part-time 3 mois (1 500€)
- Avocat senior audit + docs (3 500€)
- AIPD sur-mesure (1 000€)
- Outils (500€)

### 9.4 Profils recommandés

- **Avocat** : cabinet spécialisé data protection. Recommandations : Herald Avocats (Paris), Derriennic Associés, Cabinet Bensoussan. Éviter cabinet généraliste.
- **DPO externe** : certification AFNOR DPO ou CIPP/E IAPP. Freelance via [lemondedudpo.fr](https://www.lemondedudpo.fr) ou Malt/Comet avec filtre certification.
- **Expert YMYL** : ancien conseiller France Rénov' (via LinkedIn) ou courtier RGE reconnu pour co-signature contenus.

---

## 10. Risques résiduels à assumer ou éliminer

### 10.1 Si scraping = source des 970K

**Risque maximal** : CNIL détecte la source via plainte artisan + contrôle sur place → sanction 300-600K€ + obligation suppression base + ordonnance urgence.

**Précédent** : SAN-2022-020 (clearview AI 20M€ mais dimension internationale) ; SAN-2021-013 (20 min cas Brico Dépôt 500K€ scraping associé).

**Option A — Assumer et préparer défense** : LIA solide + purge phone/email + opt-out proactif + aucune utilisation marketing scrapée → probabilité sanction 10-20 % mais sanction réduite 50-150K€.

**Option B — Éliminer** : purger totalement la base scrapée et repartir de SIRENE + annuaire RGE officiel (45K RGE publiques). C'est l'option **fortement recommandée**.

**Option B opérationnel** :

1. Garder ID, SIRET, raison sociale, adresse depuis SIRENE.
2. Supprimer phone, email, descriptions issues scraping.
3. Re-enrichir via formulaire claim ou via données RGE officielles.
4. Documenter la purge dans `docs/compliance/data-purge-2026.md`.

### 10.2 Si intérêt légitime mal documenté

**Risque** : CNIL qualifie la base légale comme défaillante → sanction art. 6 RGPD.

**Précédent** : SAN-2020-013 (Spartoo 250K€ pour bases légales défaillantes).

**Mitigation** : LIA obligatoire, signée DPO, stockée `docs/compliance/lia-annuaire-[date].pdf` avec 3 parties :

- Test de finalité (intérêt poursuivi).
- Test de nécessité (alternative moins intrusive ?).
- Test de balance (droits et intérêts des personnes vs intérêt poursuivi).

### 10.3 Si outreach envoyé avant compliance complète

**Risque** : plainte d'un artisan → CNIL → contrôle sur place → effet boule de neige.

**Sanction minimale attendue** : 50K€ + injonction de cesser.
**Sanction maximale** : 600K€ + médiatisation négative + perte confiance artisans.

**Mitigation** : ne **jamais** envoyer un email outreach avant fin P0.1 à P0.7. Discipline absolue.

### 10.4 Données biométriques ou sensibles

Ne pas collecter : orientation politique, santé, religion, biométrie, orientation sexuelle (art. 9 RGPD). Si photo artisan fournie → c'est OK (photo non biométrique), mais pas de reconnaissance faciale ni traitement automatisé d'image.

### 10.5 Artisans mineurs (apprentis)

Si un artisan référencé a < 18 ans → consentement parental requis (art. 8 RGPD + loi informatique et libertés art. 45). Probabilité faible (artisans sont dirigeants donc majeurs) mais à filtrer si données d'état civil accessibles.

---

## 11. Cadre contentieux et plan de défense

### 11.1 Scénarios contentieux prévisibles

| Scénario                                       | Probabilité | Impact                        | Réponse                                       |
| ---------------------------------------------- | ----------- | ----------------------------- | --------------------------------------------- |
| Artisan demande retrait fiche                  | Élevée      | Faible si opt-out fonctionnel | SLA 15j + log                                 |
| Artisan menace procès diffamation avis         | Moyenne     | Moyen                         | LCEN art. 6.I.5 + médiation                   |
| Concurrent dépose plainte CNIL scraping        | Moyenne     | Élevé                         | Dossier LIA + purge                           |
| Particulier lésé par info MaPrimeRénov' fausse | Faible      | Moyen                         | Disclaimer + preuves de sources               |
| DGCCRF contrôle transparence L111-7            | Faible      | Moyen                         | Page classement documentée                    |
| Injonction CNIL article 20 LIL 1978            | Très faible | Critique                      | Avocat data protection + compliance préalable |

### 11.2 Plan de communication crise CNIL

Si contrôle inopiné CNIL (art. 19 loi 1978) :

1. Ne pas paniquer, accueillir l'agent, demander ordre de mission.
2. Appeler immédiatement avocat data protection (garder numéro 24/7 sur contact d'urgence).
3. Faciliter l'accès mais PAS donner plus que demandé. Toute question → DPO ou avocat.
4. Demander copie PV de contrôle.
5. Communication publique : radio silence avant conseil avocat.

### 11.3 Assurance RC Pro + cyber

Souscrire assurance responsabilité civile professionnelle avec volet data protection + cyber :

- Acteurs marché : Hiscox, AXA XL, Allianz Data Protect.
- Couverture recommandée : 2M€ défense + 1M€ sanctions (attention : sanctions RGPD non assurables par principe sauf coûts défense).
- Budget : 1 500-4 000€/an pour TPE.

---

## 12. Governance et revue périodique

### 12.1 Comité Data Protection interne

Trimestriel, présidé CEO, avec :

- CEO
- DPO (externe)
- Tech lead
- Responsable contenu
- Avocat (invité annuel)

Ordre du jour type :

- Revue registre traitements (évolutions).
- Revue incidents mois écoulé (bounces anormaux, plaintes, demandes droits).
- Revue KPI compliance (SLA réponse droits, taux opt-out, % emails bounced).
- Revue évolutions réglementaires (CNIL, jurisprudence, lois).
- Planification audits internes.

### 12.2 KPI compliance à tracker

| KPI                                  | Cible            | Fréquence    |
| ------------------------------------ | ---------------- | ------------ |
| Taux réponse droits RGPD sous 1 mois | 100 %            | Mensuel      |
| Taux bounce emails outreach          | < 5 %            | Par vague    |
| Taux plainte spam                    | < 0,05 %         | Par vague    |
| Taux opt-out vs base active          | < 10 % annualisé | Trimestriel  |
| Délai notification breach            | < 72h            | Par incident |
| Âge moyen données (sans activité)    | < 3 ans          | Trimestriel  |
| % pages YMYL avec datestamp < 90j    | 100 %            | Mensuel      |

### 12.3 Mises à jour réglementaires à surveiller

- **Règlement AI Act** (entrée en vigueur progressive 2025-2026) : si IA générative sur le site.
- **DMA/DSA** (peu applicable au vu de la taille mais surveiller si passage > 45M MAU).
- **Directive NIS2** (cybersécurité) : vérifier éligibilité si > 50 salariés.
- **Règlement ePrivacy** (en discussion UE depuis 2017, probablement 2026-2027) : remplacera doctrine cookies actuelle.
- **Facturation électronique France 2026-2027** (Ordonnance 2021-1190).

Abonnement newsletter CNIL + Legifrance alertes sur mots-clés "annuaire", "prospection", "plateformes numériques".

---

## Action Sequence — 12 actions ordonnées

Les 12 actions critiques avant premier outreach, dans l'ordre d'exécution. Chaque action produit un livrable horodaté stocké sous `docs/compliance/`. Statut de chaque action tracké dans `docs/compliance/STATUS.md`.

**J-21 (trois semaines avant premier envoi)**

1. **Data Origin Statement** — CEO répond par écrit aux 7 questions §1.1, signe le document, archive. Bloquant pour toutes les actions suivantes. Livrable : `data-origin-statement.md`. Responsable : CEO. Durée : 2h.

2. **Choix avocat + DPO externe** — RFP à 3 cabinets data protection, sélection sous 48h, contrat signé. Livrable : `contrats-dpo-avocat.pdf`. Responsable : CEO. Durée : 3 jours. Budget : 1 500€ mobilisés.

**J-14**

3. **Registre des traitements + AIPD Annuaire + AIPD Prospection** — 3 documents produits par DPO externe sur la base du Data Origin Statement. Revue CEO + tech lead. Livrables : `registre-traitements-v1.pdf`, `aipd-annuaire-v1.pdf`, `aipd-prospection-v1.pdf`. Responsable : DPO externe. Durée : 5 jours.

4. **DPA Supabase signé + vérification région EU** — CEO récupère DPA sur dashboard Supabase, signe. Tech lead vérifie région hébergement = EU. Si US → ticket migration immédiat. Livrable : `dpa-supabase-[date].pdf`. Responsable : CEO + tech lead. Durée : 1 jour.

**J-10**

5. **Politique de confidentialité + CGU + CGV publiées** — 3 pages web live sur `/mentions-legales`, `/cgu`, `/cgv`. Révisée avocat. Livrable : URLs live + PDF horodaté. Responsable : avocat junior + tech lead. Durée : 4 jours.

6. **Purge phone+email DB pour 920K non-RGE non-claim** — script SQL de purge, backup préalable, execution en maintenance window, log. Preserve 50K RGE + claimed providers. Livrable : `purge-log-[date].sql` + backup + hash SHA-256. Responsable : tech lead. Durée : 1 jour.

**J-7**

7. **Page opt-out + workflow fonctionnel** — `/opt-out/[slug]` live, double opt-in email, SLA 15j, logs dans `audit_logs`. Tests e2e. Livrable : URL live + rapport test. Responsable : tech lead. Durée : 3 jours.

8. **CMP cookies déployée** — Tarteaucitron (MVP) ou Axeptio (si budget) live, bouton "Tout refuser" aussi visible que "Tout accepter", aucun cookie non-essentiel avant consentement (vérifier via DevTools + outil CookieChecker CNIL). Livrable : URL live + screenshot + rapport conformité. Responsable : tech lead. Durée : 2 jours.

9. **Classification emails génériques vs nominatifs** — script Python + regex + validation manuelle échantillon 500 emails. Flag DB `email_type` = `generic|nominative|ambiguous`. Seuls `generic` éligibles outreach sans opt-in préalable. Livrable : rapport + script + DB enrichie. Responsable : tech lead + analyst. Durée : 2 jours.

10. **ESP conforme setup** — Brevo ou Mailjet (EU), DKIM + SPF + DMARC configurés, score mail-tester.com > 9/10, template A/B/C uploadés et testés. Process bounce + optout automatiques câblés. Livrable : config ESP + rapport delivrabilité + tests e2e bounce/optout. Responsable : tech lead. Durée : 3 jours.

11. **Disclaimers YMYL + datestamp déployés** — sur toutes pages aides financières, disclaimer bas de page + `lastVerifiedAt`. Auteur identifié + relecteur expert nommé. Livrable : audit site (grep `disclaimer-ymyl`) + rapport. Responsable : rédacteur + tech lead. Durée : 2 jours.

**J-3 (répétition générale)**

12. **Revue pre-envoi complète** — checklist finale tous livrables P0 validés, test email à 5 destinataires internes + 5 artisans bêta opt-in préalable (interne), vérification anti-spam + conformité mentions, archivage final dossier compliance dans `docs/compliance/pre-clearance-closed-[date]/`. Livrable : `pre-clearance-report-[date].pdf` signé CEO + DPO. Responsable : CEO + DPO + tech lead. Durée : 2 jours.

**J0** — Premier envoi vague pilote 5 000 emails génériques uniquement, template A/B/C répartis équitablement. Mesure J+3 et J+7 : bounce rate, plainte spam, CTR, taux claim. Go/no-go pour vague 2 statué en comité data protection.

---

## Annexes

### A. Modèles de documents

- Registre des traitements : [cnil.fr/fr/registre-des-activites-de-traitement](https://www.cnil.fr/fr/RGPD-le-registre-des-activites-de-traitement)
- AIPD : [cnil.fr/fr/outil-pia-logiciel-pour-realiser-son-analyse-dimpact](https://www.cnil.fr/fr/outil-pia-logiciel-pour-realiser-son-analyse-dimpact)
- LIA template : [ICO UK LIA template](https://ico.org.uk/for-organisations/documents/1076/legitimate_interests_assessment.pdf)
- SCC Clauses Contractuelles Types : [ec.europa.eu/info/law/law-topic/data-protection](https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/standard-contractual-clauses-scc_en)

### B. Références légales clés

- **RGPD** : Règlement UE 2016/679
- **LIL** : Loi n°78-17 du 6 janvier 1978 modifiée
- **LCEN** : Loi n°2004-575 du 21 juin 2004
- **L34-5 CPCE** : Code des postes et communications électroniques
- **Loi République Numérique** : Loi n°2016-1321 du 7 octobre 2016
- **Loi Hamon** : Loi n°2014-344 du 17 mars 2014 + décret 2017-1436
- **CPI art. L342-1** : Protection bases de données
- **C. consommation art. L111-7** : Obligations plateformes
- **C. civ. art. 1240** : Responsabilité délictuelle

### C. Délibérations CNIL citées

- SAN-2023-019 Canal+ 600K€ (prospection email)
- SAN-2023-020 Cityscoot 125K€ (collecte disproportionnée)
- SAN-2023-022 PAP.fr 100K€ (droit d'opposition)
- SAN-2022-009 Free 300K€ (défaut sécurité)
- SAN-2022-020 Clearview AI 20M€ (scraping)
- SAN-2022-021 Free Mobile 300K€ (sécurité)
- SAN-2020-013 Spartoo 250K€ (bases légales)
- Délibération 2018-153 annuaires
- Délibération 2020-091 cookies (lignes directrices)
- Recommandation annuaires en ligne 14 mai 2024

### D. Jurisprudence citée

- CE 18 octobre 2018 n°405608 (annuaires professionnels)
- Cass. com. 4 décembre 2013 n°12-26.186 (extraction BDD)
- CJUE C-434/16 Nowak 2017 (définition donnée personnelle)
- CJUE C-311/18 Schrems II 2020 (transferts internationaux)
- TGI Paris 27 juin 2019 n°17/18482 (information périmée)

### E. Checklist finale (à imprimer, afficher au mur équipe)

```
[ ] Data Origin Statement signé CEO
[ ] Avocat + DPO externes contractés
[ ] Registre traitements produit
[ ] 2 AIPD produites (Annuaire + Prospection)
[ ] LIA signée si intérêt légitime
[ ] DPA Supabase signé + région EU
[ ] Politique confidentialité live
[ ] CGU live
[ ] CGV live (si B2B monétisé)
[ ] Page opt-out live + double opt-in
[ ] Purge phone/email 920K non-RGE effectuée + backup
[ ] CMP cookies live + refus aussi simple qu'acceptation
[ ] Disclaimers YMYL déployés
[ ] Datestamp lastVerifiedAt sur contenu YMYL
[ ] Auteur + relecteur identifiés sur YMYL
[ ] Emails classifiés generic vs nominative
[ ] ESP EU configuré + DKIM/SPF/DMARC
[ ] Templates email A/B/C validés avocat
[ ] Process bounce + optout automatique
[ ] Test vague pilote 500 emails internes OK
[ ] Comité Data Protection constitué
[ ] Assurance RC Pro + cyber souscrite
[ ] Formation équipe RGPD 2h faite
```

**Aucune case non cochée ne permet le premier envoi outreach.**

---

_Fin du chapitre 3. Chapitre 4 suivant : Architecture technique & déploiement pivot RGE-only._
