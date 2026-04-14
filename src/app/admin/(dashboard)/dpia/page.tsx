'use client'

import { Shield, Printer, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

const risques = [
  {
    risque: 'Données inexactes/obsolètes sur une fiche',
    probabilite: 'Élevée',
    gravite: 'Moyenne',
    score: 'orange' as const,
    mesures:
      "Droit d'opposition avec noindex immédiat, vérification SIRET, mise à jour via revendication",
  },
  {
    risque: 'Accès non autorisé à la base de données',
    probabilite: 'Faible',
    gravite: 'Élevée',
    score: 'yellow' as const,
    mesures: "RLS Supabase, auth obligatoire, rate limiting, logs d'audit",
  },
  {
    risque: 'Utilisation abusive des coordonnées artisans',
    probabilite: 'Moyenne',
    gravite: 'Moyenne',
    score: 'yellow' as const,
    mesures: 'Téléphones NON affichés publiquement (règle interne), email masqué',
  },
  {
    risque: 'Scraping massif des données',
    probabilite: 'Moyenne',
    gravite: 'Faible',
    score: 'green' as const,
    mesures: 'Rate limiting, WAF Vercel, robots.txt',
  },
  {
    risque: 'Profilage non consenti des artisans',
    probabilite: 'Faible',
    gravite: 'Élevée',
    score: 'yellow' as const,
    mesures: "Pas d'algorithme de scoring public, pas de trust_score affiché (colonnes supprimées)",
  },
  {
    risque: 'Violation de données (data breach)',
    probabilite: 'Faible',
    gravite: 'Élevée',
    score: 'yellow' as const,
    mesures: 'Procédure Art. 33 en place, notification CNIL sous 72h, chiffrement transit',
  },
  {
    risque: 'Opposition ignorée ou retardée',
    probabilite: 'Faible',
    gravite: 'Élevée',
    score: 'yellow' as const,
    mesures: 'noindex immédiat dès demande, traitement admin sous 72h, audit trail',
  },
]

const actions = [
  {
    action: 'Implémenter le cron de purge des données expirées',
    responsable: 'Dev',
    echeance: 'Q2 2026',
    statut: 'En cours',
  },
  {
    action: 'Auditer les accès admin trimestriellement',
    responsable: 'DPO',
    echeance: 'Trimestriel',
    statut: 'Planifié',
  },
  {
    action: "Former l'équipe support aux demandes RGPD",
    responsable: 'DPO',
    echeance: 'Q2 2026',
    statut: 'Planifié',
  },
  {
    action: 'Mettre en place le double opt-in newsletter',
    responsable: 'Dev',
    echeance: 'Q2 2026',
    statut: 'Planifié',
  },
]

function ScoreBadge({ score }: { score: 'green' | 'yellow' | 'orange' }) {
  if (score === 'green')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3.5 h-3.5" /> Faible
      </span>
    )
  if (score === 'yellow')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <AlertTriangle className="w-3.5 h-3.5" /> Moyen
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
      <XCircle className="w-3.5 h-3.5" /> Élevé
    </span>
  )
}

function StatutBadge({ statut }: { statut: string }) {
  if (statut === 'En cours')
    return (
      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        En cours
      </span>
    )
  if (statut === 'Terminé')
    return (
      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Terminé
      </span>
    )
  return (
    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
      Planifié
    </span>
  )
}

export default function AdminDpiaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between print:mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-blue-600 print:hidden" />
              <h1 className="text-2xl font-bold text-gray-900">
                Analyse d&apos;Impact relative à la Protection des Données (DPIA)
              </h1>
            </div>
            <p className="text-gray-500">
              Article 35 du RGPD &mdash; Dernière mise à jour : Avril 2026
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors print:hidden"
          >
            <Printer className="w-4 h-4" />
            Exporter PDF
          </button>
        </div>

        {/* Section 1 : Description du traitement */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Description du traitement</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <dt className="text-sm font-medium text-gray-500 mb-1">Nature</dt>
              <dd className="text-sm text-gray-900">
                Annuaire en ligne de professionnels du bâtiment, mise en relation avec des
                particuliers
              </dd>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <dt className="text-sm font-medium text-gray-500 mb-1">Portée</dt>
              <dd className="text-sm text-gray-900">
                ~360 000 fiches artisans, données issues de registres publics (INSEE, registres des
                métiers)
              </dd>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <dt className="text-sm font-medium text-gray-500 mb-1">Contexte</dt>
              <dd className="text-sm text-gray-900">
                Données professionnelles publiquement disponibles, agrégées et enrichies
              </dd>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <dt className="text-sm font-medium text-gray-500 mb-1">Finalité</dt>
              <dd className="text-sm text-gray-900">
                Faciliter la recherche et la mise en relation entre particuliers et artisans
                qualifiés
              </dd>
            </div>
          </dl>
        </div>

        {/* Section 2 : Nécessité et proportionnalité */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            2. Nécessité et proportionnalité
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Base légale</h3>
              <p className="text-sm text-gray-900">
                Intérêt légitime (Art. 6.1.f) pour les données publiques, consentement (Art. 6.1.a)
                pour les données collectées directement
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Minimisation des données</h3>
              <p className="text-sm text-gray-900">
                Seules les données professionnelles publiques sont collectées (nom entreprise,
                SIRET, adresse professionnelle, spécialité)
              </p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-1">Données NON collectées</h3>
              <p className="text-sm text-blue-700">
                Données personnelles privées, données sensibles (Art. 9), casier judiciaire
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Proportionnalité</h3>
              <p className="text-sm text-gray-900">
                Le traitement est proportionné &mdash; les données étaient déjà publiques
              </p>
            </div>
          </div>
        </div>

        {/* Section 3 : Risques identifiés */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">3. Risques identifiés</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Risque</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Prob.</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Grav.</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Score</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Mesures d&apos;atténuation
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {risques.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{r.risque}</td>
                    <td className="py-3 px-4 text-gray-600">{r.probabilite}</td>
                    <td className="py-3 px-4 text-gray-600">{r.gravite}</td>
                    <td className="py-3 px-4">
                      <ScoreBadge score={r.score} />
                    </td>
                    <td className="py-3 px-4 text-gray-600">{r.mesures}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4 : Mesures de protection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">4. Mesures de protection</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Techniques</h3>
              <ul className="text-sm text-gray-600 space-y-1.5">
                <li>RLS (Row Level Security)</li>
                <li>HTTPS / TLS</li>
                <li>bcrypt pour mots de passe</li>
                <li>Rate limiting</li>
                <li>WAF Vercel</li>
              </ul>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Organisationnelles</h3>
              <ul className="text-sm text-gray-600 space-y-1.5">
                <li>DPO désigné</li>
                <li>Registre des traitements</li>
                <li>Formation équipe</li>
                <li>Procédure de breach</li>
              </ul>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Droits des personnes</h3>
              <ul className="text-sm text-gray-600 space-y-1.5">
                <li>Droit d&apos;opposition fonctionnel (noindex immédiat)</li>
                <li>Droit d&apos;accès / rectification / effacement</li>
                <li>Portabilité JSON</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 5 : Avis du DPO */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">5. Avis du DPO</h2>
          <blockquote className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
            <p className="text-sm text-green-900 italic">
              &laquo;&nbsp;Au regard de l&apos;analyse effectuée, les risques résiduels sont
              acceptables. Les mesures techniques et organisationnelles mises en place permettent de
              garantir un niveau de protection adéquat. La consultation préalable de la CNIL (Art.
              36) n&apos;est pas nécessaire à ce stade.&nbsp;&raquo;
            </p>
          </blockquote>
        </div>

        {/* Section 6 : Plan d'action */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">6. Plan d&apos;action</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Action</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Responsable</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Échéance</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {actions.map((a, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{a.action}</td>
                    <td className="py-3 px-4 text-gray-600">{a.responsable}</td>
                    <td className="py-3 px-4 text-gray-600">{a.echeance}</td>
                    <td className="py-3 px-4">
                      <StatutBadge statut={a.statut} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
