/**
 * Layout YMYL pour le cluster /aides/* — Tier 1 2026-05-04.
 *
 * Câble automatiquement YmylDisclaimer au footer de toutes les pages /aides
 * (hub, [slug]/maprimerenov, [slug]/renovation, [slug]/[aide], futures pages).
 * Remplace les 3 câblages manuels existants par un câblage layout DRY.
 *
 * @audit-source tmp/ahrefs/AUDIT-KPMG-AGENT3-eeat-ymyl-2026-05-04.md
 */

import YmylDisclaimer from '@/components/aides/YmylDisclaimer'

export default function AidesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <section className="bg-white border-t border-sand-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <YmylDisclaimer variant="default" prefix="Aides à la rénovation — barèmes 2026." />
        </div>
      </section>
    </>
  )
}
