/**
 * Disclaimer YMYL pour les pages d'aides financières publiques.
 *
 * Garantit l'affichage uniforme d'une mention "à titre indicatif" + lien
 * france-renov.gouv.fr + numéro 3818 conseillers, indépendamment du composant
 * porteur. Évite la dépendance implicite à `AideMontants` (security INFO
 * round 4 chantier #6) — un futur refactor d'AideMontants ne fait pas
 * disparaître silencieusement le disclaimer YMYL des sous-pages.
 *
 * Usage :
 *   <YmylDisclaimer />                    // taille par défaut (xs, footer)
 *   <YmylDisclaimer variant="prominent" /> // body section, plus visible
 */

type Variant = 'default' | 'prominent'

type Props = {
  variant?: Variant
  /** Préfixe optionnel ajouté avant le disclaimer standard. */
  prefix?: string
  className?: string
}

export default function YmylDisclaimer({ variant = 'default', prefix, className = '' }: Props) {
  const isProminent = variant === 'prominent'
  const baseClasses = isProminent
    ? 'text-sm text-charcoal-700 leading-relaxed'
    : 'text-xs text-charcoal-500 leading-relaxed'

  return (
    <p className={`${baseClasses} ${className}`.trim()} data-ymyl-disclaimer="true">
      {prefix ? `${prefix} ` : null}
      Informations à titre indicatif. Vérifiez les conditions exactes sur{' '}
      <a
        href="https://france-renov.gouv.fr/"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-accent-700"
      >
        france-renov.gouv.fr
      </a>{' '}
      ou auprès d&apos;un conseiller France Rénov&apos; (3818, appel non surtaxé) avant signature
      d&apos;un devis.
    </p>
  )
}
