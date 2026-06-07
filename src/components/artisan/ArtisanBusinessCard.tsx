import {
  Shield,
  CheckCircle,
  ExternalLink,
  Building2,
  Calendar,
  Hash,
  Scale,
  Users,
} from 'lucide-react'
import type { LegacyArtisan } from '@/types/legacy'

const LEGAL_FORM_LABELS: Record<string, string> = {
  '1000': 'Entrepreneur individuel',
  '1100': 'Entrepreneur individuel',
  '1200': 'Commerçant',
  '1300': 'Artisan',
  '1400': 'Officier public ou ministériel',
  '1500': 'Profession libérale',
  '1600': 'Exploitant agricole',
  '1700': 'Agent commercial',
  '1800': 'Auto-entrepreneur',
  '1900': 'Micro-entrepreneur',
  '5410': 'SARL',
  '5422': 'SARL à associé unique (EURL)',
  '5426': 'SARL à associé unique (EURL)',
  '5430': 'SARL',
  '5431': 'SARL',
  '5432': 'SARL',
  '5442': 'SARL',
  '5443': 'SARL',
  '5451': 'SARL',
  '5453': 'SARL',
  '5454': 'SARL',
  '5455': 'SARL',
  '5460': 'EURL',
  '5470': 'SARL',
  '5498': 'SARL unipersonnelle',
  '5499': 'SARL',
  '5505': 'SA',
  '5510': "SA à conseil d'administration",
  '5515': 'SA à directoire',
  '5520': "SA à conseil d'administration",
  '5522': 'SA à directoire',
  '5525': 'SA',
  '5530': 'SA',
  '5531': 'SA',
  '5532': 'SA',
  '5535': 'SA',
  '5538': 'SA',
  '5539': 'SA',
  '5540': 'SA',
  '5545': 'SA à directoire',
  '5547': 'SA',
  '5548': 'SA',
  '5551': 'SA',
  '5553': 'SA',
  '5554': 'SA',
  '5555': 'SA',
  '5560': 'SA',
  '5570': 'SA',
  '5585': 'SA',
  '5599': 'SA',
  '5610': 'SAS',
  '5615': 'SAS',
  '5620': 'SAS',
  '5699': 'SAS',
  '5710': 'SAS à associé unique (SASU)',
  '5720': 'SASU',
  '6100': 'SNC',
  '6210': 'SCS',
  '6220': 'SCA',
  '6316': 'SCOP',
  '6317': 'SCOP',
  '6318': 'SCOP',
  '6411': "Société d'exercice libéral (SELARL)",
  '6521': 'SCI',
  '6532': 'SCI',
  '6533': 'SCI',
  '6534': 'SCI',
  '6535': 'SCI',
  '6540': 'SCI',
  '6541': 'SCI',
  '6542': 'SCI',
  '6543': 'SCI',
  '6544': 'SCI',
  '6551': 'SCI',
  '6554': 'SCI',
  '6558': 'SCI',
  '6560': 'SCI',
  '6589': 'SCI',
  '6599': 'Société civile',
  '9220': 'Association déclarée',
  '9221': 'Association déclarée',
  '9222': 'Association déclarée',
  '9223': "Association d'utilité publique",
  '9224': 'Association déclarée',
  '9230': 'Association déclarée',
  '9240': 'Association déclarée',
  '9260': 'Association déclarée',
  '9300': 'Fondation',
}

function formatLegalForm(code: string): string {
  return LEGAL_FORM_LABELS[code] || code
}

interface ArtisanBusinessCardProps {
  artisan: LegacyArtisan
  /** Conservé pour compat appelant — l'email n'est plus rendu du tout
   *  (décision 2026-06-07), le gate isClaimed n'a plus d'usage interne. */
  isClaimed: boolean
}

/** Format SIRET: XXX XXX XXX XXXXX */
function formatSiret(siret: string): string {
  const digits = siret.replace(/\s/g, '')
  if (digits.length !== 14) return siret
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 14)}`
}

/** Format creation date to French locale — full date */
function formatCreationDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/** Calculate full years since creation */
function getYearsSinceCreation(dateStr: string): number | null {
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return null
    const now = new Date()
    return Math.floor((now.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  } catch {
    return null
  }
}

/** Format employee / team size to a readable label */
function formatTeamSize(size: number): string {
  if (size === 0) return 'Indépendant'
  if (size === 1) return '1 salarié'
  return `${size} salariés`
}

export function ArtisanBusinessCard({ artisan, isClaimed: _isClaimed }: ArtisanBusinessCardProps) {
  const hasSiret = !!artisan.siret
  const hasEmployees = artisan.team_size != null && artisan.team_size >= 0
  // Email JAMAIS rendu sur la fiche publique (décision 2026-06-07 : tous les
  // contacts passent par le formulaire devis + tel conseiller — anti-scraping
  // + RGPD art. 5(1)(c) minimisation).
  const hasAnyData =
    hasSiret || !!artisan.legal_form || !!artisan.creation_date || !!artisan.website || hasEmployees

  if (!hasAnyData) return null

  const yearsSinceCreation = artisan.creation_date
    ? getYearsSinceCreation(artisan.creation_date)
    : null

  return (
    <div
      className="animate-fade-in-up bg-white rounded-2xl shadow-soft border border-sand-200 overflow-hidden"
      style={{ animationDelay: '0.2s' }}
    >
      {/* Header */}
      <div className="px-6 py-5 bg-sand-50 border-b border-sand-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary-500 flex items-center justify-center shadow-sm flex-shrink-0">
              <Shield className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-charcoal-900 font-heading">
                Fiche entreprise
              </h3>
              <p className="text-sm text-charcoal-500">
                Données vérifiées par l'API gouvernementale
              </p>
            </div>
          </div>
          {hasSiret && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-50 text-accent-700 text-xs font-semibold border border-accent-200 shadow-sm flex-shrink-0">
              <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
              Vérifiée
            </span>
          )}
        </div>
      </div>

      {/* Data grid */}
      <div className="p-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* SIRET */}
          {artisan.siret && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-sand-50 border border-sand-200 hover:bg-sand-100 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                <Hash className="w-4 h-4 text-primary-400" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-semibold text-charcoal-500 uppercase tracking-wide">
                  SIRET
                </dt>
                <dd className="mt-0.5 text-sm font-bold text-charcoal-900 font-mono tracking-widest">
                  {formatSiret(artisan.siret)}
                </dd>
              </div>
            </div>
          )}

          {/* Date de création */}
          {artisan.creation_date && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/60 border border-amber-100 hover:bg-amber-50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                <Calendar className="w-4 h-4 text-amber-600" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-semibold text-amber-600/90 uppercase tracking-wide">
                  Créée le
                </dt>
                <dd className="mt-0.5">
                  <span className="text-sm font-bold text-charcoal-900">
                    {formatCreationDate(artisan.creation_date)}
                  </span>
                  {yearsSinceCreation !== null && yearsSinceCreation > 0 && (
                    <span className="mt-1.5 flex">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200">
                        {yearsSinceCreation}&nbsp;an{yearsSinceCreation > 1 ? 's' : ''}
                        &nbsp;d'activité
                      </span>
                    </span>
                  )}
                </dd>
              </div>
            </div>
          )}

          {/* Forme juridique */}
          {artisan.legal_form && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-sand-50 border border-sand-200 hover:bg-sand-100 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                <Scale className="w-4 h-4 text-charcoal-600" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-semibold text-charcoal-500 uppercase tracking-wide">
                  Forme juridique
                </dt>
                <dd className="mt-0.5 text-sm font-bold text-charcoal-900">
                  {formatLegalForm(artisan.legal_form)}
                </dd>
              </div>
            </div>
          )}

          {/* Effectif */}
          {hasEmployees && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-primary-50/50 border border-primary-100 hover:bg-primary-50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                <Users className="w-4 h-4 text-primary-400" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-semibold text-primary-600/90 uppercase tracking-wide">
                  Effectif
                </dt>
                <dd className="mt-0.5">
                  <span className="text-sm font-bold text-charcoal-900">
                    {formatTeamSize(artisan.team_size ?? 0)}
                  </span>
                  <span className="mt-1 block text-xs text-charcoal-400">
                    Source : SIRENE (INSEE)
                  </span>
                </dd>
              </div>
            </div>
          )}
        </dl>

        {/* Secondary links */}
        {artisan.website && (
          <div className="mt-5 pt-5 border-t border-sand-200">
            <div className="flex flex-wrap gap-3">
              {artisan.website && (
                <a
                  href={
                    artisan.website.startsWith('http')
                      ? artisan.website
                      : `https://${artisan.website}`
                  }
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-sand-300 text-sm font-medium text-primary-400 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                >
                  <Building2 className="w-4 h-4" aria-hidden="true" />
                  <span className="truncate max-w-[180px]">
                    {artisan.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                  </span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
