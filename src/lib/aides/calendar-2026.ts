/**
 * Sprint O 2026-05-03 — Calendrier des aides rénovation 2026.
 *
 * Source de vérité YMYL pour le hub `/aides/calendrier-2026`. Couvre :
 *   - les échéances officielles barème / plafonds revenus
 *   - les transitions calendaires (revalorisation 1er janvier, mid-year, etc.)
 *   - la saisonnalité optimale par type de travaux (isolation, chauffage, PAC)
 *   - les fenêtres fiscales (déclaration impôts mars-mai → réflexe rénovation)
 *
 * Pure module : aucun I/O, importable côté SSR + tests. Toute date utilise
 * format ISO YYYY-MM-DD pour traçabilité.
 *
 * Mise à jour : à incrémenter chaque trimestre (vérifier maprimerenov.gouv.fr,
 * service-public.fr, ecologie.gouv.fr pour ajustements officiels).
 */

export type CalendarEventCategory = 'bareme' | 'fiscal' | 'saisonnalite' | 'echeance' | 'campagne'

export interface AidesCalendarEvent {
  /** Identifiant stable, slug-safe (anchor URL). */
  slug: string
  /** Date ISO YYYY-MM-DD (jour clé) ou plage (startDate-endDate). */
  startDate: string
  /** Optionnel : fin de la plage si événement multi-jours. */
  endDate?: string
  /** Mois principal (1-12) pour groupement timeline. */
  month: number
  category: CalendarEventCategory
  title: string
  /** Description détaillée avec sources officielles, ≥ 80 char. */
  description: string
  /** Aides concernées (slug aidesCatalog) — pour cross-link. */
  relatedAids: string[]
  /** URL officielle source (E-E-A-T). */
  sourceUrl: string
  /** Action recommandée pour le ménage (CTA implicite). */
  recommendedAction: string
}

const EVENTS_2026: AidesCalendarEvent[] = [
  {
    slug: 'bareme-mpr-revalorise-2026',
    startDate: '2026-01-01',
    month: 1,
    category: 'bareme',
    title: 'Revalorisation annuelle des barèmes MaPrimeRénov’',
    description:
      "Au 1er janvier 2026, les plafonds de revenus MaPrimeRénov' (catégories bleu/jaune/violet/rose) sont revalorisés selon l'inflation INSEE. Les forfaits par geste sont également ajustés. Conséquence : un ménage qui était en jaune en 2025 peut basculer en bleu en 2026 (ou inversement) — recalculer son éligibilité avant tout devis.",
    relatedAids: ['maprimerenov'],
    sourceUrl: 'https://www.maprimerenov.gouv.fr',
    recommendedAction:
      "Recalculez votre éligibilité MaPrimeRénov' 2026 avec les nouveaux plafonds avant de signer un devis.",
  },
  {
    slug: 'cee-arrete-precarite-2026',
    startDate: '2026-01-01',
    month: 1,
    category: 'bareme',
    title: 'Coefficients CEE et bonifications précarité actualisés',
    description:
      "Les coefficients de bonification CEE pour les ménages précaires (BAR-TH-* et BAR-EN-*) sont actualisés au 1er janvier par arrêté DGEC. Les forfaits restent calculés en kWh cumac mais le multiplicateur précarité peut évoluer. Référence : Direction générale de l'énergie et du climat (DGEC).",
    relatedAids: ['cee', 'coup-de-pouce'],
    sourceUrl: 'https://www.ecologie.gouv.fr/dispositif-des-certificats-deconomies-denergie',
    recommendedAction:
      "Vérifiez si votre ménage relève du segment précarité (sous plafond Anah) — la prime CEE est doublée à triplée selon la qualification de l'obligé.",
  },
  {
    slug: 'q1-pic-isolation',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    month: 1,
    category: 'saisonnalite',
    title: 'Q1 — Pic de demande isolation (avant le printemps)',
    description:
      "Janvier-mars concentrent 30-35% des demandes annuelles d'isolation thermique (combles, murs, planchers). Les artisans RGE ont des carnets très chargés. Pour signer un devis avant le printemps, il faut prendre contact dès janvier — les délais d'intervention dépassent souvent 6-8 semaines en zone H1 (Île-de-France, Hauts-de-France, Grand Est).",
    relatedAids: ['maprimerenov', 'cee', 'aide-isolation'],
    sourceUrl: 'https://france-renov.gouv.fr',
    recommendedAction:
      'Demandez 3 devis isolation dès janvier pour intervention avant fin mars (avant pic de chaleur).',
  },
  {
    slug: 'declaration-revenus-2026',
    startDate: '2026-04-10',
    endDate: '2026-06-08',
    month: 4,
    category: 'fiscal',
    title: 'Campagne déclaration des revenus 2025 — réflexe rénovation',
    description:
      "Avril à juin 2026 = campagne de déclaration des revenus 2025. C'est le moment de vérifier : (1) si vous avez bénéficié du crédit d'impôt transition énergétique pour des travaux 2025, (2) si votre revenu fiscal de référence (RFR) vous place dans une catégorie MaPrimeRénov' bleu/jaune/violet/rose pour 2026. Le RFR 2025 est utilisé pour déterminer l'éligibilité MaPrimeRénov' 2026 et 2027.",
    relatedAids: ['maprimerenov', 'tva-5-5'],
    sourceUrl: 'https://www.impots.gouv.fr',
    recommendedAction:
      "Notez votre RFR 2025 (case 25 de l'avis d'imposition) pour calculer votre catégorie MaPrimeRénov' 2026.",
  },
  {
    slug: 'q2-pac-planification',
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    month: 4,
    category: 'saisonnalite',
    title: 'Q2 — Fenêtre optimale planification PAC et chaudière',
    description:
      "Avril-juin = saison creuse pour les installateurs PAC et chaudières biomasse (la demande chauffage est faible). Les délais d'intervention sont 30-50% plus courts qu'en automne. Idéal pour planifier un remplacement avec mise en service avant l'hiver. La majorité des installations PAC sont réalisées entre mai et septembre par cette logique.",
    relatedAids: ['maprimerenov', 'cee', 'aide-pompe-a-chaleur', 'coup-de-pouce'],
    sourceUrl: 'https://france-renov.gouv.fr',
    recommendedAction:
      'Planifiez votre PAC ou chaudière biomasse en avril-mai pour mise en service avant octobre — délais réduits + Coup de pouce Chauffage actif.',
  },
  {
    slug: 'mid-year-bareme-ajustement',
    startDate: '2026-07-01',
    month: 7,
    category: 'bareme',
    title: 'Ajustements mi-année barèmes MaPrimeRénov’ (le cas échéant)',
    description:
      "Le ministère peut publier au 1er juillet des ajustements de barème en cours d'année (modification de forfait par geste, fermeture/ouverture de catégories de travaux). Historique : juillet 2024 a vu un resserrement temporaire du forfait pompe à chaleur, levé fin 2024. Ces ajustements ne sont pas systématiques — vérifier la version courante des arrêtés sur Légifrance.",
    relatedAids: ['maprimerenov'],
    sourceUrl: 'https://www.legifrance.gouv.fr',
    recommendedAction:
      "Si vous projetez un dépôt MPR au S2 2026, vérifiez la version courante de l'arrêté avant signature du devis.",
  },
  {
    slug: 'q3-pic-toiture-fenetres',
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    month: 7,
    category: 'saisonnalite',
    title: 'Q3 — Pic isolation toiture, fenêtres et ravalement',
    description:
      'Juillet-septembre concentrent 40-45% des chantiers extérieurs (couverture, isolation toiture, menuiseries extérieures, ravalement, ITE). Météo sèche et stable indispensable pour ces interventions. Demande toiture x3 par rapport à la moyenne annuelle. Réserver dès juin pour intervention en juillet-août.',
    relatedAids: ['maprimerenov', 'cee', 'aide-isolation'],
    sourceUrl: 'https://france-renov.gouv.fr',
    recommendedAction:
      'Devis toiture/ITE/fenêtres en juin pour intervention juillet-septembre (avant pluies automnales).',
  },
  {
    slug: 'rentree-conseil-renovation',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    month: 9,
    category: 'campagne',
    title: 'Rentrée — campagne nationale conseillers France Rénov’',
    description:
      "Septembre 2026 : campagne nationale de communication France Rénov' pour préparer l'hiver. Les Espaces Conseils France Rénov' (250+ permanences gratuites en France) sont saturés. Prendre rendez-vous tôt avec un conseiller Mon Accompagnateur Rénov' (MAR) pour éviter les délais de 4-6 semaines.",
    relatedAids: ['maprimerenov', 'cee', 'aide-audit-energetique'],
    sourceUrl: 'https://france-renov.gouv.fr/agences',
    recommendedAction:
      'Prenez rendez-vous avec un conseiller France Rénov’ en septembre pour audit personnalisé gratuit.',
  },
  {
    slug: 'q4-pic-chauffage-urgence',
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    month: 10,
    category: 'saisonnalite',
    title: 'Q4 — Pic urgence chauffage et PAC',
    description:
      "Octobre-décembre = saison haute chaudières et PAC en urgence (panne, remplacement). Les artisans RGE refusent souvent les nouveaux dossiers entre novembre et février. Risque : signer avec un artisan non-RGE pour gagner du temps = perte de TOUTES les aides (MPR, CEE, Coup de pouce). Mieux vaut chauffage d'appoint temporaire et installation propre au S1 2027.",
    relatedAids: ['maprimerenov', 'cee', 'coup-de-pouce', 'aide-pompe-a-chaleur'],
    sourceUrl: 'https://france-renov.gouv.fr',
    recommendedAction:
      'En cas de panne hivernale : appoint électrique court terme + planifier installation RGE au printemps. Ne JAMAIS signer avec un non-RGE pour les aides.',
  },
  {
    slug: 'deadline-factures-2026',
    startDate: '2026-12-31',
    month: 12,
    category: 'echeance',
    title: 'Date limite factures acquittées 2026 pour comptabilisation fiscale',
    description:
      "Pour bénéficier des aides au titre de l'année fiscale 2026, la facture doit être ACQUITTÉE (payée) avant le 31 décembre 2026. Une facture émise en 2026 mais payée en 2027 est rattachée à 2027 (différent barème). Prévoir le règlement avant Noël pour éviter les délais bancaires de fin d'année.",
    relatedAids: ['maprimerenov', 'cee', 'eco-ptz', 'tva-5-5'],
    sourceUrl: 'https://www.maprimerenov.gouv.fr',
    recommendedAction:
      'Réglez vos factures travaux avant le 24 décembre 2026 (délais bancaires fin année) pour comptabilisation 2026.',
  },
  {
    slug: 'depot-dossier-mpr-2026',
    startDate: '2026-12-31',
    month: 12,
    category: 'echeance',
    title: 'Délai de dépôt du dossier MaPrimeRénov’ post-travaux',
    description:
      "Le dépôt du dossier MaPrimeRénov' final (avec facture acquittée + photos) doit être effectué dans les 6 mois suivant la fin des travaux (article 7 du décret n°2020-26). Pour des travaux terminés en 2026, le dépôt doit donc être finalisé au plus tard 6 mois après. Au-delà, le dossier est rejeté irrévocablement.",
    relatedAids: ['maprimerenov'],
    sourceUrl: 'https://www.maprimerenov.gouv.fr',
    recommendedAction:
      'Calendarisez votre dépôt MPR final dans les 30 jours suivant la fin des travaux — ne procrastinez jamais (rejet automatique au-delà de 6 mois).',
  },
]

export const AIDES_CALENDAR_2026: ReadonlyArray<AidesCalendarEvent> = EVENTS_2026

/** Récupère tous les événements d'un mois donné (1-12). */
export function getAidesCalendarEventsByMonth(month: number): AidesCalendarEvent[] {
  return EVENTS_2026.filter((e) => e.month === month)
}

/** Liste les 12 mois avec leur nombre d'événements (pour timeline UI). */
export function getAidesCalendarMonthsSummary(): Array<{
  month: number
  monthName: string
  events: AidesCalendarEvent[]
}> {
  const monthNames = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ]
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    return {
      month,
      monthName: monthNames[i],
      events: getAidesCalendarEventsByMonth(month),
    }
  })
}

/** Catégories disponibles, pour groupement / filtre / Schema.org Event. */
export const AIDES_CALENDAR_CATEGORIES: ReadonlyArray<{
  category: CalendarEventCategory
  label: string
  description: string
}> = [
  {
    category: 'bareme',
    label: 'Barème',
    description: 'Revalorisations annuelles ou ajustements mid-year des forfaits.',
  },
  {
    category: 'fiscal',
    label: 'Fiscal',
    description: 'Échéances déclaration revenus, RFR utilisé pour catégorie MPR.',
  },
  {
    category: 'saisonnalite',
    label: 'Saisonnalité',
    description: 'Pics de demande artisans RGE selon le type de travaux.',
  },
  {
    category: 'echeance',
    label: 'Échéance',
    description: 'Dates limites pour ne pas perdre les aides (dépôt, paiement).',
  },
  {
    category: 'campagne',
    label: 'Campagne',
    description: 'Communications nationales France Rénov’ et conseillers MAR.',
  },
]

/** Date max(startDate) sur l'ensemble du calendrier — pour Schema.org dateModified. */
export function getAidesCalendarLastDate(): string {
  const dates = EVENTS_2026.map((e) => e.endDate ?? e.startDate)
  return dates.sort().slice(-1)[0] ?? new Date().toISOString().slice(0, 10)
}
