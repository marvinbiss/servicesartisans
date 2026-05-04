/**
 * Layout YMYL pour le cluster /rge/labels/* — Tier 1 2026-05-04.
 *
 * Couvre les 5 pages labels RGE (qualibat, qualibois, qualifelec, qualipac,
 * qualisol) qui sont YMYL hard car elles documentent les conditions de
 * cumul d'aides publiques (MaPrimeRénov', CEE).
 *
 * @audit-source tmp/ahrefs/AUDIT-KPMG-AGENT3-eeat-ymyl-2026-05-04.md
 *   Critère C10 : 25 → 90 sur les 5 fiches labels RGE.
 */

import YmylDisclaimer from '@/components/aides/YmylDisclaimer'

export default function RgeLabelsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <section className="bg-white border-t border-sand-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <YmylDisclaimer
            variant="default"
            prefix="Qualifications RGE — données ADEME / France Rénov'."
          />
        </div>
      </section>
    </>
  )
}
