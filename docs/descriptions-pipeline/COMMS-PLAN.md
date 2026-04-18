# Plan de communication — Migration noindex RGE-only

# ServicesArtisans — Semaine du 2026-04-21

**Version** : 1.0
**Date de rédaction** : 2026-04-19
**Migration de référence** : script `scripts/noindex-non-rge.ts` (batch 5 000, ~3-8 min)
**Périmètre** : ~920K providers en noindex (non-RGE, non-revendiqués), ~50K RGE restant indexés
**Responsable communication** : Marvin Bissohong, CEO

---

## Sommaire

1. [Positionnement public](#1-positionnement-public)
2. [Email artisans revendiqués RGE](#2-email-artisans-revendiqués-rge)
3. [Email artisans revendiqués non-RGE](#3-email-artisans-revendiqués-non-rge)
4. [Template email incident (edge case)](#4-template-email-incident-edge-case)
5. [Snippet banner espace-artisan](#5-snippet-banner-espace-artisan)
6. [Template post blog](#6-template-post-blog)
7. [FAQ — 5 questions types](#7-faq--5-questions-types)
8. [Monitoring dashboard — 30 jours post-migration](#8-monitoring-dashboard--30-jours-post-migration)

---

## 1. Positionnement public

### 1.1 Phrase clé centrale (à utiliser dans tout support)

> ServicesArtisans devient l'annuaire de référence des artisans certifiés RGE en France.

Cette phrase est le pivot de toutes les déclinaisons. Elle est factuelle, vérifiable (données ADEME), et ne promet rien qui dépasse la réalité opérationnelle actuelle.

---

### 1.2 Variantes par canal

**Presse et relations médias**

> ServicesArtisans restructure son annuaire autour des artisans certifiés Reconnu Garant de l'Environnement (RGE) : 50 000 professionnels qualifiés, vérifiés sur la base ADEME, désormais au coeur du moteur de recherche.

Angle journaliste : donnée officielle ADEME intégrée en temps réel, point d'entrée unique pour les particuliers souhaitant bénéficier de MaPrimeRénov'.

---

**Blog / contenu éditorial**

> Depuis le 21 avril 2026, l'annuaire ServicesArtisans référence exclusivement les artisans détenteurs d'une certification RGE en cours de validité. Cette décision répond à un besoin clair : permettre aux particuliers d'identifier rapidement un professionnel éligible aux aides de l'Etat, sans incertitude sur la qualification.

---

**Communication artisans (B2B)**

> Votre certification RGE est désormais le critère central de visibilité sur ServicesArtisans. Les fiches des artisans certifiés bénéficient d'une indexation prioritaire et d'un meilleur positionnement dans les résultats de recherche.

---

**Partenaires institutionnels (CAPEB, FFB, Qualibat, France Renov')**

> ServicesArtisans aligne son modèle d'annuaire sur les exigences réglementaires du marché de la rénovation énergétique. Seuls les artisans titulaires d'une certification RGE valide, issue de la base officielle ADEME, sont désormais référencés en visibilité publique sur le moteur.

---

## 2. Email artisans revendiqués RGE

**Cible** : artisans avec `claimed_at IS NOT NULL` ET `rge_valid_until > now()` — estimé ~15 000 contacts.
**Calendrier d'envoi** : J+1 post-migration (semaine du 21 avril 2026).
**Contraintes** : pas de CTA commercial, pas de upsell, monétisation 0€ en phase actuelle. Ton professionnel.

---

### Template A (version directe)

**Objet** : Votre fiche artisan fait partie du nouveau socle RGE de ServicesArtisans

---

Madame, Monsieur,

ServicesArtisans restructure son annuaire autour des artisans certifiés Reconnu Garant de l'Environnement. A compter de cette semaine, seules les fiches d'artisans titulaires d'une certification RGE valide — ou ayant revendiqué leur fiche — sont référencées dans les résultats de recherche publics de notre plateforme.

Votre fiche fait partie de ce socle de référence. Elle reste pleinement visible, indexée et accessible aux particuliers qui recherchent un professionnel qualifié pour leurs travaux de rénovation énergétique. Votre certification RGE, vérifiée sur la base officielle ADEME, est désormais mise en avant sur votre fiche.

Aucune action de votre part n'est requise.

Cordialement,
L'équipe ServicesArtisans
contact@servicesartisans.fr

---

### Template B (version avec contexte réglementaire)

**Objet** : Votre certification RGE renforce votre visibilité sur ServicesArtisans

---

Madame, Monsieur,

Dans le cadre du repositionnement de ServicesArtisans en annuaire de référence pour la rénovation énergétique, nous avons aligné notre politique d'indexation sur les certifications RGE délivrées par les organismes accrédités (Qualibat, Qualifelec, Qualit'EnR, etc.) et enregistrées dans la base officielle ADEME.

Concrètement : votre fiche bénéficie d'une visibilité prioritaire dans notre moteur de recherche. Les particuliers qui recherchent un artisan qualifié pour des travaux ouvrant droit à MaPrimeRénov' ou aux Certificats d'Economie d'Energie sont dirigés vers des profils certifiés RGE. Le vôtre en fait partie.

Cette évolution ne modifie en rien le contenu de votre fiche. Votre certification est vérifiée automatiquement et mise à jour lors de chaque synchronisation avec la base ADEME.

Cordialement,
L'équipe ServicesArtisans
contact@servicesartisans.fr

---

### Note A/B

- **Template A** : privilégier pour les artisans peu actifs sur leur fiche, message court et rassurant.
- **Template B** : privilégier pour les artisans ayant revendiqué leur fiche et complété leur profil — ils lisent davantage le contexte.
- Mesurer le taux d'ouverture à 72h pour identifier le variant dominant.

---

## 3. Email artisans revendiqués non-RGE

**Cible** : artisans avec `claimed_at IS NOT NULL` ET `rge_valid_until IS NULL OR rge_valid_until <= now()` — estimé 2 000 à 5 000 contacts.
**Calendrier d'envoi** : J+1 post-migration, simultanément à l'email RGE.
**Contraintes** : transparence sans FUD, ton factuel, liens officiels uniquement (france-renov.gouv.fr, ADEME). Pas de CTA commercial.

---

### Template unique

**Objet** : Evolution de votre visibilité sur ServicesArtisans — votre fiche reste accessible

---

Madame, Monsieur,

ServicesArtisans fait évoluer son annuaire pour se concentrer sur les artisans certifiés Reconnu Garant de l'Environnement (RGE). Cette semaine, nous avons modifié notre politique d'indexation : seules les fiches des artisans titulaires d'une certification RGE en cours de validité apparaissent désormais dans les résultats des moteurs de recherche.

Votre fiche reste intégralement accessible via son adresse directe et pour toute personne disposant de ce lien. Elle n'a pas été supprimée. En revanche, elle n'apparait plus dans les résultats de recherche Google pour les requêtes liées à la rénovation énergétique.

Si vous souhaitez retrouver une visibilité complète sur ServicesArtisans, l'obtention d'une certification RGE est la voie à suivre. Les certifications RGE sont délivrées par des organismes accrédités par le COFRAC. Les démarches sont gratuites pour l'artisan (hors coût de la formation si applicable) et ouvrent l'accès à un marché en forte croissance.

Pour en savoir plus :

- France Renov' (service public officiel) : https://france-renov.gouv.fr/renovation/trouver-artisan/rge
- ADEME — liste des organismes certificateurs : https://www.ademe.fr/particuliers-eco-citoyens/habitation/renover-son-logement/reconnaitre-professionnel-competent/
- Qualibat : https://qualibat.com/devenir-qualifie/
- Qualit'EnR : https://qualitenr.fr/adhesion/
- Qualifelec : https://qualifelec.fr/adhesion/
- CAPEB (accompagnement artisans) : https://www.capeb.fr/

Si vous avez obtenu une certification RGE et que votre fiche n'en tient pas compte, contactez-nous afin que nous vérifiions manuellement votre statut dans la base ADEME.

Cordialement,
L'équipe ServicesArtisans
contact@servicesartisans.fr

---

## 4. Template email incident (edge case)

**Contexte** : un bug dans le script `noindex-non-rge.ts` flague par erreur un artisan RGE revendiqué en noindex. Ce template est déclenché manuellement par le support dès qu'un ticket est identifié comme un faux noindex.

**Seuil de déclenchement** : tout ticket où l'artisan peut prouver une certification RGE valide ET une fiche revendiquée, mais signale la disparition de sa page des résultats Google.

---

### Template incident

**Objet** : Correction technique appliquée sur votre fiche ServicesArtisans

---

Madame, Monsieur,

Suite à votre signalement, nous avons identifié une anomalie technique lors de notre migration du 21 avril 2026 : votre fiche a été incorrectement marquée comme non-indexable, alors qu'elle remplit les critères de visibilité (certification RGE valide et fiche revendiquée).

La correction a été appliquée. Votre fiche est de nouveau éligible à l'indexation par les moteurs de recherche.

Le délai de re-indexation effective par Google est généralement de 7 à 14 jours. Ce délai est indépendant de notre volonté et dépend du rythme de re-crawl des robots Google sur notre plateforme. Nous ne pouvons pas l'accélérer au-delà des soumissions manuelles que nous effectuons via Google Search Console.

Nous nous excusons pour la gêne occasionnée. Si vous constatez que votre fiche n'est toujours pas visible dans Google après 14 jours, contactez-nous à l'adresse suivante en indiquant votre SIRET : contact@servicesartisans.fr

Cordialement,
L'équipe ServicesArtisans

---

### Procédure interne associée

1. Vérifier en DB : `SELECT noindex, claimed_at, rge_valid_until FROM providers WHERE siret = '<siret>';`
2. Si `noindex = true` ET `claimed_at IS NOT NULL` ET `rge_valid_until > now()` : c'est un faux positif.
3. Corriger : `UPDATE providers SET noindex = false WHERE siret = '<siret>';`
4. Ping IndexNow pour l'URL de la fiche.
5. Soumettre l'URL dans Google Search Console (inspection URL > Demander l'indexation).
6. Envoyer le template ci-dessus à l'artisan.
7. Logger l'incident dans `audit_logs` : `action = 'noindex_false_positive_corrected'`.

---

## 5. Snippet banner espace-artisan

**Emplacement** : `/espace-artisan/dashboard` — visible pendant 30 jours post-migration (du 21 avril au 21 mai 2026).
**Logique d'affichage** : conditionnel sur le profil provider de l'utilisateur connecté.
**Stack** : React + Tailwind CSS. Classes `.bg-primary-50` et `.text-charcoal-900` déjà présentes dans le projet.

```tsx
// src/components/dashboard/MigrationRGEBanner.tsx
// Afficher du 2026-04-21 au 2026-05-21 uniquement

type MigrationRGEBannerProps = {
  isRGE: boolean
  rgeValidUntil?: string | null
}

export function MigrationRGEBanner({ isRGE, rgeValidUntil }: MigrationRGEBannerProps) {
  const migrationEnd = new Date('2026-05-21')
  if (new Date() > migrationEnd) return null

  if (isRGE && rgeValidUntil && new Date(rgeValidUntil) > new Date()) {
    return (
      <div className="rounded-md bg-primary-50 border border-primary-200 px-4 py-3 text-sm text-charcoal-900">
        <span className="font-medium">
          Votre fiche fait partie du nouveau socle RGE de ServicesArtisans.
        </span>{' '}
        Votre certification est vérifiée sur la base officielle ADEME et mise en avant dans les
        résultats de recherche.
      </div>
    )
  }

  return (
    <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-charcoal-900">
      <span className="font-medium">
        ServicesArtisans référence désormais en priorité les artisans certifiés RGE.
      </span>{' '}
      Pour retrouver une visibilité complète,{' '}
      <a
        href="https://france-renov.gouv.fr/renovation/trouver-artisan/rge"
        target="_blank"
        rel="noopener noreferrer"
        className="underline text-primary-700 hover:text-primary-900"
      >
        découvrez comment obtenir la certification RGE
      </a>{' '}
      (france-renov.gouv.fr).
    </div>
  )
}
```

**Usage dans le dashboard** :

```tsx
// src/app/espace-artisan/dashboard/page.tsx
import { MigrationRGEBanner } from '@/components/dashboard/MigrationRGEBanner'

// Dans le composant page, après récupération du provider :
;<MigrationRGEBanner isRGE={!!provider.rge_valid_until} rgeValidUntil={provider.rge_valid_until} />
```

**Note** : ne pas afficher le banner aux artisans dont la session indique `claimed_at IS NULL` — ils n'ont pas revendiqué leur fiche et ne reçoivent pas les emails de cette migration. Le banner est réservé aux artisans connectés avec une fiche revendiquée.

---

## 6. Template post blog

**URL cible** : `/blog/pourquoi-servicesartisans-annuaire-reference-rge-france`
**Date de publication** : J+7 post-migration (environ 28 avril 2026)
**Longueur cible** : 1 200 mots
**Objectif SEO** : capturer les requêtes informationnelles autour de "annuaire RGE France", "artisan RGE certifié", "trouver artisan RGE"
**Auteur** : Marvin Bissohong, CEO de ServicesArtisans (byline obligatoire — YMYL)
**Sources à citer** : ADEME, france-renov.gouv.fr, ANAH, arrêtés JORF barèmes MaPrimeRénov'

---

### Titre

**Pourquoi ServicesArtisans devient l'annuaire de référence des artisans RGE en France**

_Par Marvin Bissohong, CEO — Publié le 28 avril 2026 — Mis à jour le [date]_

---

### Lead (chapeau introductif, 80-100 mots)

Depuis le 21 avril 2026, ServicesArtisans modifie en profondeur son fonctionnement : l'annuaire référence désormais en priorité les artisans certifiés Reconnu Garant de l'Environnement (RGE). Cette décision n'est pas cosmétique. Elle répond à un constat précis : les particuliers qui souhaitent bénéficier des aides de l'Etat pour financer leurs travaux de rénovation énergétique — MaPrimeRénov', CEE, TVA réduite — doivent impérativement faire appel à un artisan RGE. Or, jusqu'ici, aucun annuaire généraliste ne garantissait la validité en temps réel de cette certification. Nous avons décidé de corriger ce manque.

---

### H2 1 : Qu'est-ce que la certification RGE et pourquoi est-elle obligatoire ?

_Expliquer : définition RGE, organismes certificateurs (Qualibat, Qualifelec, Qualit'EnR, etc.), lien avec MaPrimeRénov' et CEE. Citer l'arrêté du 1er décembre 2015 relatif aux critères de qualification des entreprises RGE. Source officielle : france-renov.gouv.fr et ADEME._

Mots-clés à inclure : "certification RGE", "Reconnu Garant de l'Environnement", "MaPrimeRénov' artisan qualifié"

---

### H2 2 : Pourquoi ServicesArtisans a choisi de se recentrer sur les artisans RGE

_Expliquer la décision stratégique : 50 332 artisans RGE actifs en base (source ADEME synchronisée), qualité vs volume, alignement avec les besoins réels des particuliers en 2026. Eviter les superlatifs — s'appuyer sur les données._

Mots-clés à inclure : "annuaire artisans RGE", "trouver artisan RGE certifié"

---

### H2 3 : Ce que cela change concrètement pour les artisans

_Distinguer les 3 cas : artisan RGE revendiqué (visibilité prioritaire), artisan RGE non revendiqué (indexé mais fiche non personnalisée), artisan non-RGE revendiqué (fiche accessible via lien direct, pas dans les résultats de recherche). Ton factuel, pas alarmiste._

Mots-clés à inclure : "fiche artisan RGE", "revendiquer fiche artisan"

---

### H2 4 : Comment la certification est vérifiée en temps réel

_Expliquer le mécanisme technique (base ADEME synchronisée, colonne `rge_valid_until`, trigger automatique). Insister sur la fraicheur des données — pas de certification expirée dans les résultats. Source : base de données officielle france-renov.gouv.fr._

Mots-clés à inclure : "certification RGE valide", "vérification RGE", "base ADEME"

---

### H2 5 : Comment obtenir la certification RGE si vous êtes artisan

_Guide pratique en 4 étapes : choisir l'organisme selon son métier (tableau : métier → organisme), répondre aux critères (formation, références chantiers), passer l'audit, obtenir le label. Liens officiels : france-renov.gouv.fr, Qualibat, Qualit'EnR, Qualifelec. Coûts indicatifs si disponibles via sources officielles._

Mots-clés à inclure : "comment devenir RGE", "obtenir certification RGE artisan", "qualification RGE"

---

### CTA final (fermeture de l'article)

Les artisans titulaires d'une certification RGE qui souhaitent revendiquer leur fiche sur ServicesArtisans peuvent le faire directement depuis leur espace : [lien vers /espace-artisan]. La revendication est gratuite. Elle permet de personnaliser la fiche, d'ajouter des photos et d'activer la réception de demandes de devis.

---

## 7. FAQ — 5 questions types

Cette FAQ est destinée à deux usages : alimentation de la page `/faq` publique et base de réponse pour le support client.

**Contrainte de rédaction** : réponses factuelles, sources officielles citées, aucune promesse commerciale.

---

### Q1 : Ma fiche a disparu de Google. Pourquoi ?

**Réponse** :

Depuis le 21 avril 2026, ServicesArtisans ne référence dans les moteurs de recherche que les fiches d'artisans certifiés RGE (Reconnu Garant de l'Environnement) dont la certification est en cours de validité, ou ayant formellement revendiqué leur fiche sur la plateforme.

Si votre fiche ne s'affiche plus dans Google, l'une des situations suivantes s'applique :

1. Votre certification RGE a expiré ou n'est pas encore enregistrée dans la base officielle ADEME (france-renov.gouv.fr).
2. Vous n'avez pas revendiqué votre fiche sur ServicesArtisans.
3. Un bug technique a incorrectement modifié votre statut — dans ce cas, contactez le support en indiquant votre SIRET : contact@servicesartisans.fr

Votre fiche reste accessible via son lien direct. Elle n'a pas été supprimée.

---

### Q2 : Comment devenir RGE ?

**Réponse** :

La certification RGE (Reconnu Garant de l'Environnement) est délivrée par des organismes accrédités par le COFRAC, selon votre métier :

- **Qualibat** : maconnerie, isolation, couverture, menuiseries, chauffage — https://qualibat.com/devenir-qualifie/
- **Qualit'EnR** : installation d'énergies renouvelables (PAC, solaire, bois) — https://qualitenr.fr/adhesion/
- **Qualifelec** : installations électriques, pompes à chaleur air/air — https://qualifelec.fr/adhesion/
- **QualiPAC / Qualibois** : spécifiques équipements thermiques (sous Qualit'EnR)

Le processus comprend généralement : une vérification des qualifications professionnelles, des références de chantiers réalisés, et un audit documentaire ou sur site. Des modules de formation obligatoires peuvent s'y ajouter selon l'organisme.

Pour une vue d'ensemble par type de travaux, consultez le service officiel France Renov' : https://france-renov.gouv.fr/renovation/trouver-artisan/rge

---

### Q3 : Est-ce que ma fiche reste accessible même si elle n'est plus dans Google ?

**Réponse** :

Oui. Votre fiche reste intégralement accessible via son adresse directe (URL permanente). Elle n'a pas été supprimée de la plateforme ServicesArtisans.

En revanche, elle n'apparait plus dans les résultats des moteurs de recherche (Google, Bing, etc.) pour les requêtes liées à la rénovation énergétique. Cette modification est technique : une balise `noindex` a été appliquée à votre page, conformément aux recommandations de Google pour éviter les contenus en double ou de faible valeur ajoutée.

Si vous obtenez la certification RGE, votre fiche est automatiquement remise en indexation lors de la synchronisation suivante avec la base ADEME (fréquence : hebdomadaire).

---

### Q4 : Combien coûte une qualification RGE ?

**Réponse** :

Les coûts varient selon l'organisme certificateur, le domaine de qualification et la taille de l'entreprise. A titre indicatif, les fourchettes habituellement constatées pour une PME artisanale :

- Cotisation annuelle à l'organisme : 300 € à 800 € HT selon organisme et chiffre d'affaires
- Audit initial (si requis) : 200 € à 600 € HT
- Formation obligatoire (si requise) : variable selon durée et organisme de formation

Ces montants sont à vérifier directement auprès de chaque organisme, car ils évoluent régulièrement. ServicesArtisans ne peut pas garantir l'exactitude de ces estimations.

Sources officielles pour les tarifs exacts :

- Qualibat : https://qualibat.com/devenir-qualifie/
- Qualit'EnR : https://qualitenr.fr/adhesion/
- Qualifelec : https://qualifelec.fr/adhesion/

Des aides à la certification sont disponibles via l'ADEME et certaines organisations professionnelles (CAPEB, FFB). Renseignez-vous auprès de votre fédération professionnelle.

---

### Q5 : Que se passe-t-il si mon RGE expire ?

**Réponse** :

Les certifications RGE ont une durée de validité limitée (généralement 4 ans, renouvelable par audit). Si votre certification expire :

1. La synchronisation avec la base ADEME (fréquence hebdomadaire) détecte automatiquement l'expiration.
2. Votre fiche passe en statut `noindex` : elle n'apparait plus dans les moteurs de recherche.
3. Votre fiche reste accessible via son lien direct et depuis votre espace artisan.

Pour éviter cette interruption de visibilité, anticipez le renouvellement de votre certification avant son expiration. Les organismes certificateurs vous envoient généralement un rappel plusieurs mois à l'avance.

Dès le renouvellement enregistré dans la base ADEME, votre fiche est automatiquement remise en indexation lors de la prochaine synchronisation.

Source de référence pour les dates de validité : https://france-renov.gouv.fr/renovation/trouver-artisan/rge

---

## 8. Monitoring dashboard — 30 jours post-migration

**Période de suivi** : du 21 avril 2026 au 21 mai 2026.
**Revue** : hebdomadaire (J+7, J+14, J+21, J+30).
**Outil** : Google Search Console (GSC) + Supabase SQL + support ticketing.

---

### 8.1 Tableau des métriques à tracker

| #   | Métrique                                   | Source                                                 | Fréquence | Seuil d'alerte              | Action si dépassement                                     |
| --- | ------------------------------------------ | ------------------------------------------------------ | --------- | --------------------------- | --------------------------------------------------------- |
| M1  | Impressions GSC — pages RGE indexées       | GSC / Performance                                      | Hebdo     | Baisse > 20 % sur 7j        | Vérifier sitemap + IndexNow ping                          |
| M2  | Impressions GSC — pages non-RGE (résiduel) | GSC / Performance                                      | Hebdo     | Hausse > 5 %                | Audit noindex batch — vérifier trigger DB                 |
| M3  | Clics organiques GSC — pages RGE           | GSC / Performance                                      | Hebdo     | Baisse > 15 % sur 7j        | Vérifier H1, meta description, contenu enrichi            |
| M4  | Support tickets "fiche disparue"           | Outil support                                          | Hebdo     | > 50 tickets/semaine        | Déclencher revue noindex, envisager FAQ proactive         |
| M5  | Taux de désinscription newsletter          | Outil emailing                                         | Hebdo     | > 2 % sur une campagne      | Revoir ton et timing des emails                           |
| M6  | Demandes de revendication de fiche (claim) | Supabase `provider_claims`                             | Hebdo     | < 5 nouveaux claims/semaine | Retravailler le CTA espace artisan                        |
| M7  | Trafic direct (hors organic)               | Analytics (PostHog / GA4)                              | Hebdo     | Baisse > 10 %               | Analyser sources — vérifier que la fiche reste accessible |
| M8  | Incidents noindex faux positifs corrigés   | `audit_logs` action=`noindex_false_positive_corrected` | Hebdo     | > 5 incidents/semaine       | Audit script `noindex-non-rge.ts` + trigger DB            |

---

### 8.2 Requêtes SQL de monitoring (Supabase)

```sql
-- M1/M2 : répartition indexables vs noindex post-migration
SELECT
  noindex,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE rge_valid_until > now()) AS rge_actifs,
  COUNT(*) FILTER (WHERE claimed_at IS NOT NULL) AS revendiques
FROM providers
WHERE is_active = true
GROUP BY noindex
ORDER BY noindex;
```

```sql
-- M6 : nouveaux claims depuis la migration
SELECT
  DATE_TRUNC('week', created_at) AS semaine,
  COUNT(*) AS nouveaux_claims,
  COUNT(*) FILTER (WHERE status = 'approved') AS approuves,
  COUNT(*) FILTER (WHERE status = 'pending') AS en_attente
FROM provider_claims
WHERE created_at >= '2026-04-21'
GROUP BY semaine
ORDER BY semaine;
```

```sql
-- M8 : incidents noindex faux positifs
SELECT
  DATE_TRUNC('week', created_at) AS semaine,
  COUNT(*) AS incidents_corriges
FROM audit_logs
WHERE action = 'noindex_false_positive_corrected'
  AND created_at >= '2026-04-21'
GROUP BY semaine
ORDER BY semaine;
```

---

### 8.3 Revue J+30 — critères de clôture

La phase de communication post-migration peut être considérée close si les 4 conditions suivantes sont réunies :

1. M4 (tickets support) < 20 tickets/semaine depuis 2 semaines consécutives.
2. M8 (faux positifs) = 0 sur la dernière semaine.
3. M1 (impressions GSC RGE) stable ou en hausse sur les 14 derniers jours.
4. M5 (désinscriptions) revenu sous 0,5 % sur la dernière campagne.

Si ces conditions ne sont pas réunies à J+30, prolonger le suivi hebdomadaire de 2 semaines supplémentaires.

---

## Annexe — Calendrier d'exécution communication

| Jour               | Action                                                                    | Responsable              |
| ------------------ | ------------------------------------------------------------------------- | ------------------------ |
| J0 — 21 avril 2026 | Lancer le script `noindex-non-rge.ts`                                     | Dev lead                 |
| J0                 | Activer le banner `MigrationRGEBanner` sur `/espace-artisan/dashboard`    | Dev lead                 |
| J+1                | Envoi email artisans RGE revendiqués (Template A ou B selon segmentation) | CEO / support            |
| J+1                | Envoi email artisans non-RGE revendiqués (Template unique section 3)      | CEO / support            |
| J+2                | Ping IndexNow sur les 50K URLs RGE                                        | Dev lead                 |
| J+2                | Soumission GSC manuelle sur 20 URLs RGE prioritaires                      | CEO                      |
| J+3                | Mise en ligne FAQ sur `/faq` avec les 5 Q/R de la section 7               | Dev / content            |
| J+7                | Publication post blog (section 6)                                         | CEO (byline obligatoire) |
| J+7                | Revue monitoring dashboard — première lecture M1 à M8                     | CEO                      |
| J+14               | Revue monitoring dashboard — deuxième lecture                             | CEO                      |
| J+21               | Revue monitoring dashboard — troisième lecture                            | CEO                      |
| J+30               | Revue finale — critères de clôture section 8.3                            | CEO                      |
| J+30               | Désactivation banner `MigrationRGEBanner`                                 | Dev lead                 |

---

_Document interne ServicesArtisans — v1.0 — 2026-04-19_
_Ne pas diffuser en dehors de l'équipe exécution._
