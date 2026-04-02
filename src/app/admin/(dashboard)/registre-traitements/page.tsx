'use client'

import { FileText, Printer } from 'lucide-react'

const LAST_UPDATED = '2026-04-02'

interface Traitement {
  nom: string
  finalite: string
  baseLegale: string
  categoriesDonnees: string
  personnesConcernees: string
  destinataires: string
  dureeConservation: string
  mesuresSecurite: string
}

const traitements: Traitement[] = [
  {
    nom: 'Gestion des comptes utilisateurs',
    finalite: 'Création et gestion des comptes clients et artisans',
    baseLegale: 'Exécution du contrat (Art. 6.1.b)',
    categoriesDonnees: 'Nom, email, téléphone, mot de passe hashé',
    personnesConcernees: 'Clients, Artisans',
    destinataires: 'Supabase (stockage), Resend (emails)',
    dureeConservation: '3 ans après dernière activité',
    mesuresSecurite: 'RLS, bcrypt, HTTPS',
  },
  {
    nom: 'Annuaire des artisans',
    finalite: 'Référencement des professionnels du bâtiment',
    baseLegale: 'Intérêt légitime (Art. 6.1.f)',
    categoriesDonnees: 'Nom, SIRET, adresse, spécialité, avis',
    personnesConcernees: 'Artisans (données publiques registres professionnels)',
    destinataires: 'Vercel (CDN), Google (indexation)',
    dureeConservation: "Jusqu'à opposition (Art. 21)",
    mesuresSecurite: 'noindex sur demande, suppression sous 72h',
  },
  {
    nom: 'Demandes de devis',
    finalite: 'Mise en relation client-artisan',
    baseLegale: 'Consentement (Art. 6.1.a)',
    categoriesDonnees: 'Nom, email, téléphone, description travaux, adresse',
    personnesConcernees: 'Clients',
    destinataires: 'Artisan concerné, Resend (email)',
    dureeConservation: '3 ans',
    mesuresSecurite: 'Chiffrement transit, RLS',
  },
  {
    nom: 'Avis clients',
    finalite: "Publication d'avis vérifiés",
    baseLegale: 'Intérêt légitime (Art. 6.1.f)',
    categoriesDonnees: 'Nom/prénom, note, commentaire, date',
    personnesConcernees: 'Clients ayant réservé',
    destinataires: 'Public (site web), Google (rich snippets)',
    dureeConservation: 'Durée de publication du service',
    mesuresSecurite: 'Modération manuelle',
  },
  {
    nom: 'Réservations',
    finalite: "Planification d'interventions",
    baseLegale: 'Exécution du contrat (Art. 6.1.b)',
    categoriesDonnees: 'Dates, adresse, type de service, montant',
    personnesConcernees: 'Clients, Artisans',
    destinataires: 'Stripe (paiement), Resend (confirmation)',
    dureeConservation: '5 ans (obligations comptables)',
    mesuresSecurite: 'RLS, Stripe PCI DSS',
  },
  {
    nom: 'Analytics',
    finalite: "Mesure d'audience et amélioration UX",
    baseLegale: 'Consentement (Art. 6.1.a)',
    categoriesDonnees: 'IP anonymisée, pages vues, durée, navigateur',
    personnesConcernees: 'Tous les visiteurs',
    destinataires: 'Google Analytics, Microsoft Clarity',
    dureeConservation: '13 mois',
    mesuresSecurite: 'Consentement préalable, anonymisation IP',
  },
  {
    nom: 'Newsletter',
    finalite: 'Communication marketing',
    baseLegale: 'Consentement (Art. 6.1.a)',
    categoriesDonnees: 'Email',
    personnesConcernees: 'Abonnés newsletter',
    destinataires: 'Resend',
    dureeConservation: "Jusqu'à désinscription",
    mesuresSecurite: 'Double opt-in, lien désinscription',
  },
  {
    nom: 'Cookies',
    finalite: 'Fonctionnement et personnalisation',
    baseLegale: 'Consentement (Art. 6.1.a) sauf essentiels',
    categoriesDonnees: 'Préférences, identifiants session',
    personnesConcernees: 'Tous les visiteurs',
    destinataires: 'Navigateur (localStorage), Supabase',
    dureeConservation: '13 mois max',
    mesuresSecurite: 'Bandeau consentement',
  },
  {
    nom: 'Messagerie',
    finalite: 'Communication client-artisan',
    baseLegale: 'Exécution du contrat (Art. 6.1.b)',
    categoriesDonnees: 'Messages texte, pièces jointes',
    personnesConcernees: 'Clients, Artisans',
    destinataires: 'Supabase (stockage)',
    dureeConservation: '3 ans après dernière activité',
    mesuresSecurite: 'RLS, chiffrement transit',
  },
  {
    nom: 'Demandes de suppression RGPD',
    finalite: "Exercice du droit d'opposition/effacement",
    baseLegale: 'Obligation légale (Art. 6.1.c)',
    categoriesDonnees: 'Nom, email, SIRET, motif',
    personnesConcernees: 'Artisans',
    destinataires: 'Admin uniquement',
    dureeConservation: '1 an après traitement',
    mesuresSecurite: 'RLS admin-only',
  },
]

const columnHeaders = [
  'Traitement',
  'Finalité',
  'Base légale',
  'Catégories de données',
  'Personnes concernées',
  'Destinataires',
  'Durée de conservation',
  'Mesures de sécurité',
]

export default function RegistreTraitementsPage() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-7 h-7 text-blue-600" />
              Registre des traitements
            </h1>
            <p className="text-gray-500 mt-1">
              Registre des activités de traitement — Article 30 du RGPD
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Dernière mise à jour : {new Date(LAST_UPDATED).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors print:hidden self-start"
          >
            <Printer className="w-4 h-4" />
            Exporter PDF
          </button>
        </div>

        {/* Info card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 print:mb-4">
          <p className="text-sm text-blue-800">
            <strong>Responsable du traitement :</strong> ServicesArtisans — Ce registre recense
            l&apos;ensemble des traitements de données personnelles conformément à l&apos;article 30
            du Règlement Général sur la Protection des Données (RGPD). Il est tenu à jour et
            consultable par la CNIL sur demande.
          </p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {columnHeaders.map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {traitements.map((t, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 min-w-[180px]">
                      {t.nom}
                    </td>
                    <td className="px-4 py-3 text-gray-600 min-w-[180px]">{t.finalite}</td>
                    <td className="px-4 py-3 min-w-[180px]">
                      <span className="inline-block px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium">
                        {t.baseLegale}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 min-w-[200px]">
                      {t.categoriesDonnees}
                    </td>
                    <td className="px-4 py-3 text-gray-600 min-w-[160px]">
                      {t.personnesConcernees}
                    </td>
                    <td className="px-4 py-3 text-gray-600 min-w-[180px]">
                      {t.destinataires}
                    </td>
                    <td className="px-4 py-3 min-w-[160px]">
                      <span className="inline-block px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-medium">
                        {t.dureeConservation}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 min-w-[160px]">
                      {t.mesuresSecurite}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-sm text-gray-500 space-y-2 print:mt-4">
          <p>
            <strong>Sous-traitants :</strong> Supabase (hébergement DB, auth), Vercel (hébergement
            web, CDN), Stripe (paiements), Resend (emails transactionnels), Google Analytics
            (analytics), Microsoft Clarity (heatmaps).
          </p>
          <p>
            <strong>Transferts hors UE :</strong> Les données peuvent être transférées aux
            États-Unis via Supabase, Vercel, Stripe et Google, couverts par le EU-US Data Privacy
            Framework.
          </p>
          <p>
            <strong>DPO :</strong> Contact via la page{' '}
            <a href="/confidentialite" className="text-blue-600 hover:underline print:text-gray-900">
              Politique de confidentialité
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
