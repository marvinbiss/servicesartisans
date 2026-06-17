/**
 * ConventionPDF — Mandataire CEE convention PDF document.
 *
 * Uses @react-pdf/renderer to generate the official convention.
 * Contains the 6 mandatory mentions required by arrêté du 2 novembre 2023
 * (R.221-1 du Code de l'énergie) :
 *
 * 1. Identification des parties (mandataire + mandant artisan)
 * 2. Périmètre des opérations éligibles CEE
 * 3. Obligations du mandataire (conformité PNCEE, dépôts, suivi)
 * 4. Conditions de rémunération (prime CEE, commission)
 * 5. Durée et conditions de résiliation
 * 6. Dispositions spécifiques CEE (obligations légales, contrôles PNCEE)
 *
 * Usage (server-side PDF generation):
 *   const buffer = await renderToBuffer(<ConventionPDF artisanName="..." artisanSiret="..." />)
 */

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Register base fonts (safe fallback — no external CDN required)
Font.registerHyphenationCallback((word) => [word])

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1C1917',
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 60,
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 24,
    borderBottom: '2pt solid #C8492A',
    paddingBottom: 12,
  },
  logo: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#C8492A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 8,
    color: '#706A62',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#1C1917',
    textAlign: 'center',
    marginBottom: 4,
  },
  titleSub: {
    fontSize: 9,
    color: '#706A62',
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#C8492A',
    marginTop: 18,
    marginBottom: 6,
    borderBottom: '1pt solid #EDE8E1',
    paddingBottom: 3,
  },
  paragraph: {
    fontSize: 9.5,
    marginBottom: 6,
    textAlign: 'justify',
  },
  listItem: {
    fontSize: 9.5,
    marginBottom: 3,
    paddingLeft: 12,
  },
  bulletPoint: {
    fontSize: 9.5,
    marginBottom: 3,
  },
  table: {
    marginTop: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #EDE8E1',
    paddingVertical: 4,
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    paddingHorizontal: 4,
  },
  tableCellLabel: {
    flex: 1,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    paddingHorizontal: 4,
    color: '#45403B',
  },
  infoBox: {
    backgroundColor: '#F9F4EE',
    border: '0.5pt solid #EDE8E1',
    borderRadius: 4,
    padding: 8,
    marginVertical: 8,
  },
  infoBoxText: {
    fontSize: 8.5,
    color: '#706A62',
  },
  signatureArea: {
    marginTop: 32,
    flexDirection: 'row',
    gap: 40,
  },
  signatureBlock: {
    flex: 1,
    border: '0.5pt solid #EDE8E1',
    borderRadius: 4,
    padding: 12,
    minHeight: 80,
  },
  signatureLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#45403B',
    marginBottom: 4,
  },
  signatureLine: {
    borderBottom: '0.5pt solid #B8A99A',
    marginTop: 40,
  },
  signatureSubText: {
    fontSize: 8,
    color: '#B8A99A',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 60,
    right: 60,
    fontSize: 7,
    color: '#B8A99A',
    textAlign: 'center',
    borderTop: '0.5pt solid #EDE8E1',
    paddingTop: 6,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 60,
    fontSize: 7,
    color: '#B8A99A',
  },
})

export interface ConventionPDFProps {
  /** Artisan's full display name */
  artisanName: string
  /** Artisan's SIRET (14 digits) */
  artisanSiret?: string
  /** Artisan's email */
  artisanEmail?: string
  /** Convention generation date — defaults to today */
  date?: Date
  /** Yousign envelope ID for tracking */
  envelopeId?: string
}

const TODAY_FR = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export default function ConventionPDF({
  artisanName,
  artisanSiret = '— à compléter —',
  artisanEmail = '— à compléter —',
  date,
  envelopeId,
}: ConventionPDFProps) {
  const conventionDate = TODAY_FR.format(date ?? new Date())

  return (
    <Document
      title="Convention Mandataire CEE — SA Energy"
      author="ServicesArtisans Energy"
      subject="Convention de mandataire CEE — arrêté du 2 novembre 2023"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>SA Energy</Text>
          <Text style={styles.subtitle}>ServicesArtisans Energy SAS — mandataire CEE</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>CONVENTION DE MANDAT CEE</Text>
        <Text style={styles.titleSub}>
          Arrêté du 2 novembre 2023 relatif aux obligations d&apos;économies d&apos;énergie (article
          R.221-1 du Code de l&apos;énergie)
        </Text>

        {/* === MENTION 1 : Identification des parties === */}
        <Text style={styles.sectionTitle}>ARTICLE 1 — IDENTIFICATION DES PARTIES</Text>
        <Text style={styles.paragraph}>La présente convention est conclue entre :</Text>

        <View style={styles.infoBox}>
          <Text style={[styles.paragraph, { fontFamily: 'Helvetica-Bold', marginBottom: 2 }]}>
            LE MANDATAIRE :
          </Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Dénomination</Text>
              <Text style={styles.tableCell}>ServicesArtisans Energy SAS</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>SIRET</Text>
              <Text style={styles.tableCell}>— en cours d&apos;immatriculation —</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Siège social</Text>
              <Text style={styles.tableCell}>France</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Qualité</Text>
              <Text style={styles.tableCell}>Mandataire CEE (R.221-1)</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.paragraph, { marginTop: 8 }]}>Et :</Text>

        <View style={styles.infoBox}>
          <Text style={[styles.paragraph, { fontFamily: 'Helvetica-Bold', marginBottom: 2 }]}>
            LE MANDANT (ARTISAN) :
          </Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Nom / Raison sociale</Text>
              <Text style={styles.tableCell}>{artisanName}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>SIRET</Text>
              <Text style={styles.tableCell}>{artisanSiret}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Email</Text>
              <Text style={styles.tableCell}>{artisanEmail}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Qualification RGE</Text>
              <Text style={styles.tableCell}>
                Vérifiée via ADEME (base ADEME – service ServicesArtisans)
              </Text>
            </View>
          </View>
        </View>

        {/* === MENTION 2 : Périmètre des opérations === */}
        <Text style={styles.sectionTitle}>ARTICLE 2 — PÉRIMÈTRE DES OPÉRATIONS ÉLIGIBLES CEE</Text>
        <Text style={styles.paragraph}>
          La présente convention porte sur les opérations standardisées d&apos;économies
          d&apos;énergie définies à l&apos;article R.221-1 du Code de l&apos;énergie et dont la
          liste est fixée par arrêté :
        </Text>
        <Text style={styles.listItem}>• BAR-TH-171 — Pompe à chaleur air/eau (logements)</Text>
        <Text style={styles.listItem}>
          • BAR-TH-127 — Ventilation mécanique contrôlée double flux
        </Text>
        <Text style={styles.listItem}>• BAR-TH-113 — Chaudière à condensation</Text>
        <Text style={styles.listItem}>• BAR-EN-101 — Isolation des combles</Text>
        <Text style={styles.listItem}>• BAR-EN-102 — Isolation des murs</Text>
        <Text style={styles.listItem}>
          • Et toute autre fiche d&apos;opération standardisée applicable
        </Text>
        <Text style={styles.paragraph}>
          Le périmètre géographique est la France métropolitaine et les départements
          d&apos;outre-mer. Les opérations sont réalisées au bénéfice de personnes physiques ou
          morales (ménages, bailleurs).
        </Text>

        {/* === MENTION 3 : Obligations du mandataire === */}
        <Text style={styles.sectionTitle}>ARTICLE 3 — OBLIGATIONS DU MANDATAIRE (SA ENERGY)</Text>
        <Text style={styles.paragraph}>SA Energy s&apos;engage à :</Text>
        <Text style={styles.listItem}>
          3.1. Monter les dossiers CEE dans le respect des exigences PNCEE (Programme National CEE)
          et des fiches d&apos;opérations standardisées.
        </Text>
        <Text style={styles.listItem}>
          3.2. Déposer les dossiers auprès du délégataire en son nom et pour le compte de
          l&apos;artisan mandant.
        </Text>
        <Text style={styles.listItem}>
          3.3. Assurer le suivi administratif et répondre aux demandes de compléments du PNCEE.
        </Text>
        <Text style={styles.listItem}>
          3.4. Conserver l&apos;ensemble des pièces justificatives pendant 10 ans conformément à
          l&apos;arrêté du 2 novembre 2023.
        </Text>
        <Text style={styles.listItem}>
          3.5. Informer l&apos;artisan de tout contrôle PNCEE et des résultats.
        </Text>
        <Text style={styles.listItem}>
          3.6. Traiter les données personnelles (IBAN) dans le respect du RGPD et de la politique de
          sécurité SA Energy (chiffrement AES-256).
        </Text>

        {/* === MENTION 4 : Conditions de rémunération === */}
        <Text style={styles.sectionTitle}>ARTICLE 4 — CONDITIONS DE RÉMUNÉRATION</Text>
        <Text style={styles.paragraph}>
          L&apos;artisan perçoit une prime CEE calculée sur la base des volumes de kWh CUMAC validés
          par le PNCEE, selon la grille tarifaire en vigueur communiquée lors de l&apos;invitation.
        </Text>
        <Text style={styles.paragraph}>
          Le taux de commission de SA Energy est défini dans l&apos;annexe tarifaire communiquée
          séparément lors de l&apos;onboarding. Les paiements sont effectués par virement bancaire
          sur le compte IBAN déclaré dans la présente convention, sous 30 jours suivant la
          validation définitive du dossier par le PNCEE.
        </Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxText}>
            Important : le montant des primes est conditionné à la conformité complète du dossier
            (qualification RGE en cours de validité, pièces justificatives complètes, absence de
            non-conformité PNCEE).
          </Text>
        </View>

        {/* === MENTION 5 : Durée et résiliation === */}
        <Text style={styles.sectionTitle}>ARTICLE 5 — DURÉE ET CONDITIONS DE RÉSILIATION</Text>
        <Text style={styles.paragraph}>
          La présente convention est conclue pour une durée indéterminée à compter de la date de
          signature électronique par l&apos;artisan. Elle peut être résiliée par l&apos;une ou
          l&apos;autre des parties :
        </Text>
        <Text style={styles.listItem}>
          • Par lettre recommandée avec accusé de réception, avec un préavis de 30 jours.
        </Text>
        <Text style={styles.listItem}>
          • Sans préavis en cas de faute grave : non-respect des exigences qualité PNCEE, fraude
          documentaire ou fourniture de pièces falsifiées.
        </Text>
        <Text style={styles.listItem}>
          • De plein droit en cas de perte de la qualification RGE requise pour les opérations
          couvertes.
        </Text>
        <Text style={styles.paragraph}>
          La résiliation n&apos;affecte pas les dossiers en cours de traitement par le PNCEE à la
          date de résiliation.
        </Text>

        {/* === MENTION 6 : Dispositions CEE === */}
        <Text style={styles.sectionTitle}>ARTICLE 6 — DISPOSITIONS SPÉCIFIQUES CEE</Text>
        <Text style={styles.paragraph}>
          Conformément à l&apos;arrêté du 2 novembre 2023 et à la loi n°&nbsp;2025-594,
          l&apos;artisan mandant reconnaît et accepte :
        </Text>
        <Text style={styles.listItem}>
          6.1. Que l&apos;artisan est responsable de la conformité RGE au moment du devis ET de la
          facture.
        </Text>
        <Text style={styles.listItem}>
          6.2. Que le bénéficiaire (client final) doit signer le mandat CEE AVANT le début des
          travaux.
        </Text>
        <Text style={styles.listItem}>
          6.3. Que toute non-conformité détectée après dépôt engage la responsabilité de
          l&apos;artisan (retenue ou rejet du dossier).
        </Text>
        <Text style={styles.listItem}>
          6.4. Que les dossiers doivent être déposés dans les 12 mois suivant la fin des travaux.
        </Text>
        <Text style={styles.listItem}>
          6.5. Que les contrôles PNCEE peuvent intervenir à tout moment et que l&apos;artisan doit y
          coopérer.
        </Text>
        <Text style={styles.listItem}>
          6.6. Que les présentes dispositions s&apos;appliquent pour toute la durée de la période
          d&apos;obligations en cours (5e période CEE).
        </Text>

        {/* Signature area */}
        <View style={styles.signatureArea}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Pour SA Energy (Mandataire)</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureSubText}>Signature électronique via Yousign</Text>
            <Text style={styles.signatureSubText}>Date : {conventionDate}</Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Pour {artisanName} (Mandant)</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureSubText}>Signature électronique via Yousign</Text>
            <Text style={styles.signatureSubText}>Date : en attente</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          ServicesArtisans Energy SAS — Convention mandataire CEE — arrêté du 2 novembre 2023 —
          Document généré le {conventionDate}
          {envelopeId ? ` — Réf. Yousign : ${envelopeId}` : ''}
        </Text>
      </Page>
    </Document>
  )
}
