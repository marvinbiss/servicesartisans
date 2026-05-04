/**
 * Layout YMYL pour le cluster /renovation-energetique/* — Tier 1 2026-05-04.
 *
 * Couvre 36+ routes : hub principal, travaux/* (vmc, isolation, chauffage,
 * fenetres, menuiseries, vmc-double-flux), diagnostic/* (DPE, audit-énergétique,
 * thermographie), passoires-thermiques/*, aides/* (maprimerenov-2026,
 * coup-de-pouce, eco-ptz, cee).
 *
 * @audit-source tmp/ahrefs/AUDIT-KPMG-AGENT3-eeat-ymyl-2026-05-04.md
 *   Critère C10 : 25 → 90 sur le pilier rénovation énergétique (~3 500 URLs).
 */

import YmylDisclaimer from '@/components/aides/YmylDisclaimer'

export default function RenovationEnergetiqueLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <section className="bg-white border-t border-sand-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <YmylDisclaimer
            variant="default"
            prefix="Aides à la rénovation énergétique — barèmes 2026."
          />
        </div>
      </section>
    </>
  )
}
