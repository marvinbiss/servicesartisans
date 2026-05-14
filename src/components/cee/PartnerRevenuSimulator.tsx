'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Briefcase, Calculator, Clock, Info, TrendingUp } from 'lucide-react'

/**
 * Simulateur de revenu artisan — programme partenaire CEE ServicesArtisans.
 *
 * Périmètre intentionnel : ce simulateur ne calcule PAS la prime CEE versée au
 * client. Le montant exact d'une prime dépend de la fiche DGEC, du forfait
 * unitaire (kWh cumac), de la zone climatique RT2012 (H1/H2/H3), du ménage
 * MaPrimeRénov' (très modestes → supérieurs), de la surface, et du prix de
 * marché EMMY du mois. Toute estimation cliente précise passe par
 * `/simulateur-aides-renovation` (qui interroge la table `cee_operations`
 * + barème MaPrimeRénov' à jour).
 *
 * Ce composant répond à une question différente, côté artisan :
 *   « Combien je gagne si j'accepte des leads exclusifs et je laisse SA gérer
 *     mes dossiers CEE ? »
 *
 * Donc inputs orientés activité artisan (panier moyen, volume, mix CEE),
 * outputs orientés revenu artisan (CA mensuel/annuel, temps gagné, uplift
 * conversion). Aucune valeur DGEC hardcodée — on évite les chiffres faux.
 *
 * Hypothèses (documentées dans la note de bas de bloc) :
 *   - Temps moyen montage dossier CEE artisan en autonomie : 2,5 h (collecte
 *     pièces, attestation honneur, photos EXIF, soumission délégataire, suivi).
 *   - Taux horaire valorisation artisan : 50 €/h (INSEE 2024, médiane bâtiment
 *     hors charges).
 *   - Uplift conversion devis lorsqu'une prime CEE est annoncée et gérée pour
 *     le client : +15 % (référence : retour terrain mandataires CEE 2024, à
 *     remplacer par étude interne dès que disponible).
 *   - Commission SA en phase de lancement : 0 € sur toute prime gérée. À terme
 *     10–15 % sur la prime CEE uniquement (jamais sur le devis artisan).
 */

const PANIER_MIN = 2_000
const PANIER_MAX = 25_000
const PANIER_DEFAULT = 8_000
const PANIER_STEP = 500

const VOLUME_MIN = 0
const VOLUME_MAX = 15
const VOLUME_DEFAULT = 4

const CEE_MIX_MIN = 0
const CEE_MIX_MAX = 100
const CEE_MIX_DEFAULT = 60

// Hypothèses (cf. JSDoc en haut)
const HEURES_PAR_DOSSIER_CEE = 2.5
const TAUX_HORAIRE_EUR = 50
const UPLIFT_CONVERSION_RATIO = 0.15

function formatEuro(value: number, opts?: { withDecimals?: boolean }): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: opts?.withDecimals ? 2 : 0,
  }).format(value)
}

function formatNombre(value: number, opts?: { withDecimals?: boolean }): string {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: opts?.withDecimals ? 1 : 0,
  }).format(value)
}

export default function PartnerRevenuSimulator() {
  const [panier, setPanier] = useState<number>(PANIER_DEFAULT)
  const [volume, setVolume] = useState<number>(VOLUME_DEFAULT)
  const [ceeMix, setCeeMix] = useState<number>(CEE_MIX_DEFAULT)

  const result = useMemo(() => {
    const caMensuel = panier * volume
    const caAnnuel = caMensuel * 12

    const dossiersCeeParMois = volume * (ceeMix / 100)
    const dossiersCeeParAn = dossiersCeeParMois * 12

    const heuresGagneesParMois = dossiersCeeParMois * HEURES_PAR_DOSSIER_CEE
    const heuresGagneesParAn = heuresGagneesParMois * 12
    const valeurTempsGagneAn = heuresGagneesParAn * TAUX_HORAIRE_EUR

    // Uplift conversion : nombre de chantiers signés supplémentaires si la
    // prime CEE est annoncée + gérée. Modèle simple : +15% × chantiers éligibles.
    const chantiersSupplementairesAn = dossiersCeeParAn * UPLIFT_CONVERSION_RATIO
    const caSupplementaireAn = chantiersSupplementairesAn * panier

    const caTotalAn = caAnnuel + caSupplementaireAn

    return {
      caMensuel,
      caAnnuel,
      caTotalAn,
      caSupplementaireAn,
      chantiersSupplementairesAn,
      dossiersCeeParMois,
      dossiersCeeParAn,
      heuresGagneesParAn,
      valeurTempsGagneAn,
    }
  }, [panier, volume, ceeMix])

  return (
    <section className="bg-gradient-to-r from-accent-50 to-accent-100/60 border-y border-accent-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-start gap-3 mb-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-accent-600 flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-1">
              Combien vous gagnez avec le programme partenaire&nbsp;?
            </h2>
            <p className="text-sm text-charcoal-600 leading-relaxed max-w-3xl">
              Trois curseurs : votre panier moyen, votre volume de chantiers, et la part éligible
              aux primes CEE. Le simulateur affiche votre chiffre d'affaires, le temps gagné sur le
              montage des dossiers, et l'uplift de conversion estimé lorsque la prime CEE est
              annoncée et gérée pour le client. Aucune donnée DGEC inventée&nbsp;: la prime exacte
              côté client se calcule sur{' '}
              <Link
                href="/simulateur-aides-renovation"
                className="underline font-semibold text-accent-700 hover:text-accent-900"
              >
                /simulateur-aides-renovation
              </Link>
              .
            </p>
          </div>
        </div>

        {/* -------------------- Inputs -------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Panier moyen */}
          <div className="bg-white rounded-2xl border border-accent-100 p-5 hover:border-accent-300 transition">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-4 h-4 text-accent-700" aria-hidden="true" />
              <h3 className="font-heading font-bold text-charcoal-900 text-base leading-tight">
                Panier moyen par chantier
              </h3>
            </div>
            <label htmlFor="sim-panier" className="sr-only">
              Panier moyen par chantier en euros
            </label>
            <input
              id="sim-panier"
              type="range"
              min={PANIER_MIN}
              max={PANIER_MAX}
              step={PANIER_STEP}
              value={panier}
              onChange={(e) => setPanier(Number(e.target.value))}
              className="w-full accent-accent-600 h-2"
              aria-describedby="sim-panier-value"
            />
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-xs text-charcoal-500">
                {formatEuro(PANIER_MIN)} – {formatEuro(PANIER_MAX)}
              </span>
              <span
                id="sim-panier-value"
                className="font-heading font-extrabold text-accent-700 text-2xl tabular-nums"
              >
                {formatEuro(panier)}
              </span>
            </div>
            <p className="text-xs text-charcoal-500 mt-2">
              Devis TTC moyen TVA 5,5 % ou 10 %. Hors achats matériel facturés au client.
            </p>
          </div>

          {/* Volume chantiers */}
          <div className="bg-white rounded-2xl border border-accent-100 p-5 hover:border-accent-300 transition">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-accent-700" aria-hidden="true" />
              <h3 className="font-heading font-bold text-charcoal-900 text-base leading-tight">
                Chantiers par mois
              </h3>
            </div>
            <label htmlFor="sim-volume" className="sr-only">
              Nombre de chantiers signés par mois
            </label>
            <input
              id="sim-volume"
              type="range"
              min={VOLUME_MIN}
              max={VOLUME_MAX}
              step={1}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full accent-accent-600 h-2"
              aria-describedby="sim-volume-value"
            />
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-xs text-charcoal-500">
                {VOLUME_MIN} – {VOLUME_MAX}
              </span>
              <span
                id="sim-volume-value"
                className="font-heading font-extrabold text-accent-700 text-2xl tabular-nums"
              >
                {volume}
                <span className="text-sm text-charcoal-500 font-normal">/mois</span>
              </span>
            </div>
            <p className="text-xs text-charcoal-500 mt-2">
              Chantiers signés (pas devis envoyés). Médiane artisan RGE&nbsp;: 3–6 chantiers/mois.
            </p>
          </div>

          {/* Mix CEE */}
          <div className="bg-white rounded-2xl border border-accent-100 p-5 hover:border-accent-300 transition">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-accent-700" aria-hidden="true" />
              <h3 className="font-heading font-bold text-charcoal-900 text-base leading-tight">
                Part éligible CEE
              </h3>
            </div>
            <label htmlFor="sim-cee-mix" className="sr-only">
              Pourcentage de chantiers éligibles aux primes CEE
            </label>
            <input
              id="sim-cee-mix"
              type="range"
              min={CEE_MIX_MIN}
              max={CEE_MIX_MAX}
              step={5}
              value={ceeMix}
              onChange={(e) => setCeeMix(Number(e.target.value))}
              className="w-full accent-accent-600 h-2"
              aria-describedby="sim-cee-mix-value"
            />
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-xs text-charcoal-500">0 – 100 %</span>
              <span
                id="sim-cee-mix-value"
                className="font-heading font-extrabold text-accent-700 text-2xl tabular-nums"
              >
                {ceeMix}
                <span className="text-sm text-charcoal-500 font-normal">&nbsp;%</span>
              </span>
            </div>
            <p className="text-xs text-charcoal-500 mt-2">
              Part des chantiers éligibles à une fiche CEE (PAC, isolation, biomasse, VMC double
              flux…). Référence&nbsp;: ~60 % pour un chauffagiste RGE.
            </p>
          </div>
        </div>

        {/* -------------------- Résultats -------------------- */}
        <div className="bg-white rounded-2xl border-2 border-accent-300 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-accent-700" aria-hidden="true" />
            <h3 className="font-heading text-xl font-extrabold text-charcoal-900">
              Votre activité estimée avec ServicesArtisans
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-xs text-charcoal-500 uppercase tracking-wide">CA mensuel</div>
              <div className="font-heading text-2xl font-extrabold text-charcoal-900 tabular-nums">
                {formatEuro(result.caMensuel)}
              </div>
              <div className="text-xs text-charcoal-500">
                {volume} chantier{volume > 1 ? 's' : ''}/mois
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs text-charcoal-500 uppercase tracking-wide">CA annuel</div>
              <div className="font-heading text-2xl font-extrabold text-accent-700 tabular-nums">
                {formatEuro(result.caAnnuel)}
              </div>
              <div className="text-xs text-charcoal-500">hors uplift CEE</div>
            </div>

            <div className="text-center">
              <div className="text-xs text-charcoal-500 uppercase tracking-wide">
                CA + uplift CEE
              </div>
              <div className="font-heading text-2xl font-extrabold text-accent-700 tabular-nums">
                {formatEuro(result.caTotalAn)}
              </div>
              <div className="text-xs text-charcoal-500">
                +{formatEuro(result.caSupplementaireAn)} / an
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs text-charcoal-500 uppercase tracking-wide">Temps gagné</div>
              <div className="font-heading text-2xl font-extrabold text-accent-700 tabular-nums">
                {formatNombre(result.heuresGagneesParAn)}&nbsp;h
              </div>
              <div className="text-xs text-charcoal-500">
                ≈ {formatEuro(result.valeurTempsGagneAn)} / an
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="bg-accent-50 border border-accent-100 rounded-xl p-4">
              <div className="text-xs uppercase tracking-wide text-accent-700 font-semibold mb-1">
                Dossiers CEE gérés
              </div>
              <div className="font-heading font-bold text-charcoal-900">
                {formatNombre(result.dossiersCeeParMois, { withDecimals: true })} / mois
                <span className="text-charcoal-500 font-normal">
                  {' '}
                  · {formatNombre(result.dossiersCeeParAn)} / an
                </span>
              </div>
              <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                Montage du dossier, soumission au délégataire, suivi paiement&nbsp;: pris en charge
                par ServicesArtisans.
              </p>
            </div>

            <div className="bg-accent-50 border border-accent-100 rounded-xl p-4">
              <div className="text-xs uppercase tracking-wide text-accent-700 font-semibold mb-1">
                Uplift conversion
              </div>
              <div className="font-heading font-bold text-charcoal-900">
                +{formatNombre(result.chantiersSupplementairesAn, { withDecimals: true })} chantier
                {result.chantiersSupplementairesAn > 1 ? 's' : ''} / an
              </div>
              <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                +15 % de signature estimé sur les chantiers où la prime CEE est annoncée et gérée
                pour le client.
              </p>
            </div>

            <div className="bg-accent-50 border border-accent-100 rounded-xl p-4">
              <div className="text-xs uppercase tracking-wide text-accent-700 font-semibold mb-1">
                Commission ServicesArtisans
              </div>
              <div className="font-heading font-bold text-charcoal-900">
                {formatEuro(0)} <span className="text-charcoal-500 font-normal">/ mois</span>
              </div>
              <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                Phase de lancement&nbsp;: 0 € sur le devis, 0 € sur la prime. À terme 10–15&nbsp;%
                prélevés uniquement sur la prime CEE (jamais sur votre devis).
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-2 bg-sand-50 border border-charcoal-100 rounded-xl p-4">
            <Info className="w-4 h-4 text-charcoal-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-charcoal-600 leading-relaxed">
              <strong className="text-charcoal-800">Hypothèses du modèle&nbsp;:</strong>{' '}
              {HEURES_PAR_DOSSIER_CEE.toLocaleString('fr-FR')} h/dossier CEE pour le montage en
              autonomie (collecte pièces, AH, photos EXIF, soumission délégataire, suivi),
              valorisées à {formatEuro(TAUX_HORAIRE_EUR)}/h (INSEE 2024, médiane bâtiment). Uplift
              conversion +15 % issu de retours terrain mandataires CEE (à remplacer par étude
              interne dès données suffisantes). Ce simulateur n'estime PAS le montant de la prime
              versée au client&nbsp;: il dépend de la fiche DGEC, du forfait kWh cumac (zone
              H1/H2/H3), du ménage MaPrimeRénov' et du prix EMMY du mois. Le calcul exact côté
              client est disponible sur{' '}
              <Link
                href="/simulateur-aides-renovation"
                className="underline font-semibold text-accent-700 hover:text-accent-900"
              >
                /simulateur-aides-renovation
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
