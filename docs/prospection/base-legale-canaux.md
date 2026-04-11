# Base légale par canal de prospection

> Document de référence — P1.4 prospection de masse (50 538 artisans RGE ADEME).
> Dernière mise à jour : 2026-04-11.
> Propriétaires : équipe prospection + DPO ServicesArtisans.

Ce document cadre **ce qu'on a le droit de faire par canal**, **quelle preuve
on doit pouvoir présenter en cas de contrôle CNIL / DGCCRF**, et **quel
mécanisme technique dans le code garantit le fail-close**.

**Règle d'or** : en cas de doute sur la base légale d'un contact, on refuse
l'envoi. Un message non envoyé ne coûte rien. Un envoi illégal coûte
15 000 à 75 000 €.

---

## Table récapitulative

| Canal     | Base légale                               | Preuve exigée                                                     | Risque de sanction                    |
| --------- | ----------------------------------------- | ----------------------------------------------------------------- | ------------------------------------- |
| Email B2B | Intérêt légitime (RGPD Art. 6.1.f)        | Source ADEME publique + traçabilité opt-out + lien désabo visible | Modéré — mise en demeure CNIL         |
| SMS       | Consentement préalable (Art. L.34-5 CPCE) | `consent_proof` JSONB horodaté + version texte opt-in             | **15 000 € par envoi illégal** (CNIL) |
| WhatsApp  | Idem SMS (assimilé message électronique)  | Idem SMS                                                          | **15 000 € par envoi illégal** (CNIL) |
| Voice     | Bloctel obligatoire (L.223-1 C. conso)    | `bloctel_listed=false` + `bloctel_checked_at` récent              | **75 000 € par infraction** (DGCCRF)  |

---

## 1. Email B2B — intérêt légitime

### Cadre

Le RGPD (Art. 6.1.f) et la doctrine CNIL autorisent l'envoi d'emails de
prospection B2B **sans consentement préalable** sous réserve de :

1. Le destinataire est une personne morale ou un contact professionnel
   (ex : `contact@entreprise.fr`, `jean.dupont@artisan.fr`).
2. Le contenu du message est **en rapport avec l'activité professionnelle**
   du destinataire (ici : rejoindre une plateforme d'artisans → OK).
3. Chaque message comporte un **mécanisme de désinscription simple et gratuit**
   (lien "se désabonner" visible en bas de l'email).
4. La **source** des données est documentée et licite (ici : registre ADEME,
   données publiques par définition).

### Preuve à conserver

- `prospection_contacts.source = 'import'` + `source_file` pointant vers le
  dump ADEME daté.
- `prospection_contacts.consent_status = 'unknown'` est **acceptable** pour
  l'email B2B (pas de consentement requis).
- Tout opt-out est tracé via `prospection_contacts.opted_out_at` et l'email
  entre en `email_suppressions` (migration 308) — **jamais** de relance.

### Garde-fous techniques

- `src/lib/prospection/message-queue.ts` filtre automatiquement contre
  `email_suppressions` via la RPC `find_suppressed_emails` (migration 392).
- Fail-close : si la vérification suppression échoue, l'enqueue est refusé
  (protection réputation domaine).

---

## 2. SMS / WhatsApp — consentement explicite OBLIGATOIRE

### Cadre

L'**Article L.34-5 du Code des postes et des communications électroniques**
interdit formellement toute prospection par SMS ou WhatsApp sans
**consentement préalable, libre, spécifique, éclairé et univoque** du
destinataire.

**Il n'existe AUCUNE exception B2B pour le SMS.** L'article ne distingue pas
particulier et professionnel — les artisans sont protégés au même titre
qu'un consommateur. La CNIL a confirmé cette lecture dans plusieurs
sanctions (délibérations récentes, 15 000 € par envoi non consenti).

WhatsApp est juridiquement assimilé au SMS (message électronique adressé
individuellement), **mêmes règles s'appliquent**.

### Preuve exigée : `consent_proof` JSONB

En cas de contrôle CNIL, on doit pouvoir démontrer :

1. **Qui** a consenti (identité du contact).
2. **Quand** (timestamp ISO-8601 précis).
3. **Comment** (formulaire web, landing page, appel vocal enregistré, etc.).
4. **À quoi** (version exacte du texte légal affiché au moment du clic).

Le champ `prospection_contacts.consent_proof` stocke cette preuve :

```json
{
  "timestamp": "2026-04-14T10:23:45.000Z",
  "source": "form:artisan-rge-signup",
  "ip_hash": "sha256:abc123...",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0...)",
  "optin_text_version": "v2026-04"
}
```

**NULL** dans `consent_proof` = consentement non prouvé = **SMS/WhatsApp
interdits** (garde-fou applicatif + trigger DB).

### Garde-fous techniques

1. **Migration 394** — trigger `prospection_enforce_consent_proof` refuse
   tout `UPDATE` qui passerait `consent_status='opted_in'` sans attacher
   un `consent_proof` non nul.
2. **`enqueueCampaignMessages`** (`src/lib/prospection/message-queue.ts`) —
   si `campaign.channel IN ('sms', 'whatsapp')`, filtre les contacts pour
   ne garder que `consent_status='opted_in' AND consent_proof IS NOT NULL`.
   Si zéro contact éligible → throw explicite en français, campagne refusée.

---

## 3. Voice (téléphone) — Bloctel obligatoire

### Cadre

L'**Article L.223-1 du Code de la consommation** impose à tout professionnel
qui démarche par téléphone de vérifier préalablement que le numéro n'est
pas inscrit sur la liste d'opposition **Bloctel**.

**Sanction DGCCRF** : 75 000 € d'amende administrative par infraction
(contrôles actifs, rapports annuels publics).

### Workflow Bloctel

Bloctel **ne propose pas d'API temps réel**. L'organisme délivre :

1. Un accès opérateur (inscription obligatoire, payante, délai ~1 mois).
2. Un fichier CSV hebdomadaire à télécharger, contenant tous les numéros
   inscrits (format E.164).

Workflow attendu :

```
[Lundi]      Télécharger bloctel-YYYY-MM-DD.csv depuis l'espace opérateur
[Lundi+1h]   importBloctelFile('/tmp/bloctel-YYYY-MM-DD.csv')
              → SET bloctel_listed=true WHERE phone_e164 IN (fichier)
              → SET bloctel_checked_at=CURRENT_DATE pour les matches
[Lundi+2h]   markAsBloctelClean(contactIds non matchés)
              → SET bloctel_listed=false WHERE non présents dans fichier
[Mardi+]     Les campagnes voice peuvent s'enqueuer (bloctel_listed=false)
```

### Preuve à conserver

- `prospection_contacts.bloctel_checked_at` — date du dernier check par
  contact. **Doit être récente** (recommandation : ≤ 7 jours avant tout
  démarchage, à confirmer avec notre DPO).
- `prospection_contacts.bloctel_listed = false` — état vérifié absent.
- Archive du fichier Bloctel hebdomadaire dans un bucket S3 chiffré
  (preuve de l'import).

### Garde-fous techniques

1. **Migration 394** — colonnes `bloctel_listed` (NULL par défaut) et
   `bloctel_checked_at`.
2. **`enqueueCampaignMessages`** — si `campaign.channel === 'voice'`, filtre
   strictement `bloctel_listed === false` (exclut NULL et TRUE). Fail-close :
   un contact jamais vérifié est refusé.
3. **`src/lib/prospection/bloctel.ts`** — helpers `importBloctelFile` et
   `markAsBloctelClean`. Pas de cron pour l'instant (Phase 2 après
   validation de l'inscription opérateur Bloctel).

---

## 4. Workflow de collecte de consentement (SMS/WhatsApp)

Pour obtenir un opt-in valide et stocker un `consent_proof` opposable :

### Étape 1 — Formulaire web avec checkbox non-pré-cochée

```tsx
<label className="flex items-start gap-2">
  <input
    type="checkbox"
    name="sms_optin"
    required={false} // JAMAIS required — consentement doit être libre
    defaultChecked={false} // JAMAIS pré-coché (CJUE Planet49)
  />
  <span className="text-sm text-gray-700">
    J'accepte de recevoir des SMS et messages WhatsApp de la part de ServicesArtisans concernant{' '}
    <strong>l'envoi de demandes de devis qualifiées</strong>. Je peux me désinscrire à tout moment
    en répondant STOP. (Version v2026-04)
  </span>
</label>
```

### Étape 2 — À la soumission, stocker la preuve

```ts
// src/app/api/artisan/signup/route.ts (exemple)
import { createHash } from 'crypto'

const ipHash = createHash('sha256')
  .update(request.headers.get('x-forwarded-for') ?? 'unknown')
  .digest('hex')

await supabase
  .from('prospection_contacts')
  .update({
    consent_status: 'opted_in',
    consent_proof: {
      timestamp: new Date().toISOString(),
      source: 'form:artisan-rge-signup',
      ip_hash: `sha256:${ipHash}`,
      user_agent: request.headers.get('user-agent'),
      optin_text_version: 'v2026-04',
    },
  })
  .eq('id', contactId)
```

### Étape 3 — Versionner le texte d'opt-in

Toute modification du texte légal affiché à côté de la checkbox doit
incrémenter `optin_text_version` (ex: `v2026-04` → `v2026-07`). Conserver
un registre (fichier ou table) des versions successives et de leur texte
exact, pour pouvoir produire la version consultée par chaque contact en
cas de contrôle.

### Étape 4 — Gérer les opt-out (STOP)

- À la réception d'un message "STOP", mettre `consent_status='opted_out'`
  et `opted_out_at=now()`.
- **Ne JAMAIS** effacer `consent_proof` : c'est la preuve qu'à un moment
  donné le contact avait consenti. L'opt-out est un événement postérieur.
- Le garde-fou applicatif filtre déjà sur `consent_status='opted_in'`,
  donc les opt-out sont automatiquement exclus des envois futurs.

---

## 5. Checklist avant lancement d'une campagne

| Canal    | Vérification avant GO                                                  |
| -------- | ---------------------------------------------------------------------- |
| Email    | Le template contient un lien de désinscription visible et fonctionnel  |
| Email    | La liste a été filtrée contre `email_suppressions` (automatique)       |
| SMS / WA | 100 % des contacts ont `consent_proof IS NOT NULL`                     |
| SMS / WA | Le template contient la mention "STOP au 36XXX pour vous désabonner"   |
| Voice    | Le fichier Bloctel a été importé il y a moins de 7 jours               |
| Voice    | 100 % des contacts appelables ont `bloctel_listed=false`               |
| Tous     | Le contact peut être identifié comme professionnel (registre ADEME OK) |

---

## 6. Références

- RGPD : Règlement (UE) 2016/679, Art. 6.1.f (intérêt légitime)
- CPCE : Code des postes et communications électroniques, Art. L.34-5
- Code de la consommation : Art. L.223-1 à L.223-7 (Bloctel)
- CNIL : « Communication commerciale par voie électronique »
- DGCCRF : rapports annuels sur les contrôles démarchage téléphonique
- Migration DB : `supabase/migrations/394_prospection_consent_proof.sql`
- Code : `src/lib/prospection/message-queue.ts`, `src/lib/prospection/bloctel.ts`
