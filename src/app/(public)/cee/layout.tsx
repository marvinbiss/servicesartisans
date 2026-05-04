/**
 * Layout YMYL pour le cluster /cee/* — Tier 1 hardening 2026-05-04.
 *
 * Câble automatiquement le YmylDisclaimer au footer de TOUTES les pages
 * enfants (cee/page.tsx + [operation]/* + guides + coup-de-pouce-2026 +
 * mandataire-vs-direct). Évite d'éditer chaque page individuellement et
 * garantit que toute future page CEE héritera du disclaimer YMYL sans
 * intervention manuelle.
 *
 * @audit-source tmp/ahrefs/AUDIT-KPMG-AGENT3-eeat-ymyl-2026-05-04.md
 *   Critère C10 (disclaimers YMYL câblés) : 25/100 → 90/100 sur 8 routes
 *   types CEE × ~6 450 URLs prerendered + ISR.
 */

import YmylDisclaimer from '@/components/aides/YmylDisclaimer'

export default function CeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <section className="bg-white border-t border-sand-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <YmylDisclaimer variant="default" prefix="Aides CEE — barèmes 2026." />
        </div>
      </section>
    </>
  )
}
