/**
 * Seed CMS pages — Pre-populate cms_pages with entries for all public pages.
 *
 * All entries are created with status='draft' so the site remains unchanged
 * until an admin explicitly publishes content via the CMS.
 *
 * Idempotent: skips entries where slug+page_type already exists.
 *
 * Usage:
 *   npx tsx scripts/seed-cms.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface CmsSeed {
  slug: string
  page_type: 'static' | 'blog' | 'service' | 'location' | 'homepage' | 'faq'
  title: string
  meta_description?: string
  service_slug?: string
}

// ─── Static pages ─────────────────────────────────────────────
const staticPages: CmsSeed[] = [
  { slug: 'cgv', page_type: 'static', title: 'Conditions Générales de Vente et d\'Utilisation', meta_description: 'Conditions générales de vente et d\'utilisation du service ServicesArtisans.' },
  { slug: 'confidentialite', page_type: 'static', title: 'Politique de confidentialité', meta_description: 'Comment nous collectons, utilisons et protégeons vos données personnelles.' },
  { slug: 'a-propos', page_type: 'static', title: 'À propos — Le plus grand annuaire d\'artisans de France', meta_description: 'ServicesArtisans référence 350 000+ artisans grâce aux données ouvertes du gouvernement.' },
  { slug: 'contact', page_type: 'static', title: 'Contactez-nous', meta_description: 'Contactez l\'équipe ServicesArtisans pour toute question.' },
  { slug: 'accessibilite', page_type: 'static', title: 'Déclaration d\'accessibilité', meta_description: 'Notre engagement pour rendre le site accessible à tous.' },
  { slug: 'mediation', page_type: 'static', title: 'Médiation et résolution des litiges', meta_description: 'Processus de médiation de ServicesArtisans.' },
  { slug: 'notre-processus-de-verification', page_type: 'static', title: 'Notre processus de vérification', meta_description: 'Comment nous vérifions les artisans référencés sur la plateforme.' },
  { slug: 'politique-avis', page_type: 'static', title: 'Politique de gestion des avis', meta_description: 'Comment les avis sont collectés, modérés et publiés.' },
  { slug: 'presse', page_type: 'static', title: 'Espace presse', meta_description: 'Communiqués, kit média et contacts presse.' },
  { slug: 'comment-ca-marche', page_type: 'static', title: 'Comment ça marche', meta_description: 'Recherchez, comparez et contactez un artisan en 3 étapes.' },
  { slug: 'carrieres', page_type: 'static', title: 'Carrières — Rejoignez notre équipe', meta_description: 'Découvrez les opportunités de carrière chez ServicesArtisans.' },
  { slug: 'partenaires', page_type: 'static', title: 'Nos partenaires', meta_description: 'Programme partenaires de ServicesArtisans.' },
  { slug: 'urgence', page_type: 'static', title: 'Urgence artisan 24h/24', meta_description: 'Plombier, serrurier, électricien en urgence.' },
  { slug: 'mentions-legales', page_type: 'static', title: 'Mentions légales', meta_description: 'Informations juridiques, éditeur, hébergeur.' },
  { slug: 'services', page_type: 'static', title: 'Tous les services artisans', meta_description: 'Annuaire de 350 000+ artisans référencés.' },
  { slug: 'blog', page_type: 'static', title: 'Blog Artisanat & Travaux', meta_description: 'Conseils, guides et actualités sur l\'artisanat et les travaux de rénovation.' },
  { slug: 'tarifs-artisans', page_type: 'static', title: 'Guide des prix artisans 2026', meta_description: 'Guide complet des tarifs artisans en 2026. Comparez les prix de tous les corps de métier.' },
  { slug: 'departements', page_type: 'static', title: 'Artisans par département', meta_description: 'Trouvez un artisan dans votre département.' },
  { slug: 'regions', page_type: 'static', title: 'Artisans par région', meta_description: 'Trouvez un artisan dans votre région.' },
  { slug: 'villes', page_type: 'static', title: 'Artisans par ville', meta_description: 'Trouvez un artisan dans votre ville.' },
  { slug: 'plan-du-site', page_type: 'static', title: 'Plan du site', meta_description: 'Plan du site ServicesArtisans — toutes les pages.' },
  { slug: 'devis', page_type: 'static', title: 'Demander un devis gratuit', meta_description: 'Recevez jusqu\'à 3 devis gratuits d\'artisans qualifiés.' },
]

// ─── Homepage ──────────────────────────────────────────────────
const homepageSeed: CmsSeed = {
  slug: 'homepage',
  page_type: 'homepage',
  title: 'ServicesArtisans — 350 000+ artisans référencés en France',
  meta_description: 'Le plus grand annuaire d\'artisans de France.',
}

// ─── FAQ ───────────────────────────────────────────────────────
const faqSeed: CmsSeed = {
  slug: 'faq',
  page_type: 'faq',
  title: 'Questions fréquentes (FAQ)',
  meta_description: 'Retrouvez les réponses aux questions les plus fréquentes sur ServicesArtisans.',
}

// ─── Service pages (all 46 trades) ──────────────────────────────
const servicesSlugs = [
  'plombier', 'electricien', 'serrurier', 'chauffagiste', 'peintre-en-batiment',
  'menuisier', 'carreleur', 'couvreur', 'macon', 'jardinier',
  'vitrier', 'climaticien', 'cuisiniste', 'solier', 'nettoyage',
  'terrassier', 'charpentier', 'zingueur', 'etancheiste', 'facadier',
  'platrier', 'metallier', 'ferronnier', 'poseur-de-parquet', 'miroitier',
  'storiste', 'salle-de-bain', 'architecte-interieur', 'decorateur', 'domoticien',
  'pompe-a-chaleur', 'panneaux-solaires', 'isolation-thermique', 'renovation-energetique',
  'borne-recharge', 'ramoneur', 'paysagiste', 'pisciniste', 'alarme-securite',
  'antenniste', 'ascensoriste', 'diagnostiqueur', 'geometre', 'desinsectisation',
  'deratisation', 'demenageur',
]

function capitalize(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')
}

const servicePages: CmsSeed[] = servicesSlugs.map(slug => ({
  slug,
  page_type: 'service' as const,
  title: capitalize(slug) + ' en France',
  service_slug: slug,
}))

// ─── Tarifs per-service pages ────────────────────────────────────
const tarifsPages: CmsSeed[] = servicesSlugs.map(slug => ({
  slug: slug + '-tarifs',
  page_type: 'static' as const,
  title: 'Tarifs ' + capitalize(slug).toLowerCase() + ' 2026',
  meta_description: 'Guide des prix ' + capitalize(slug).toLowerCase() + ' en 2026. Tarifs détaillés par prestation.',
}))

// ─── Urgence per-service pages (only services with emergencyInfo) ─
const emergencySlugs = [
  'plombier', 'electricien', 'serrurier', 'chauffagiste',
  'vitrier', 'climaticien', 'pompe-a-chaleur', 'desinsectisation',
]

const urgencePages: CmsSeed[] = emergencySlugs.map(slug => ({
  slug: slug + '-urgence',
  page_type: 'static' as const,
  title: capitalize(slug) + ' urgence 24h/24',
  meta_description: capitalize(slug) + ' en urgence. Intervention rapide 24h/24 et 7j/7.',
}))

// ─── All seeds ─────────────────────────────────────────────────
const allSeeds: CmsSeed[] = [
  ...staticPages,
  homepageSeed,
  faqSeed,
  ...servicePages,
  ...tarifsPages,
  ...urgencePages,
]

async function main() {
  console.log(`Seeding ${allSeeds.length} CMS pages...`)

  let created = 0
  let skipped = 0
  let errors = 0

  for (const seed of allSeeds) {
    // Check if already exists
    const { data: existing } = await supabase
      .from('cms_pages')
      .select('id')
      .eq('slug', seed.slug)
      .eq('page_type', seed.page_type)
      .limit(1)
      .single()

    if (existing) {
      skipped++
      continue
    }

    const { error } = await supabase
      .from('cms_pages')
      .insert({
        slug: seed.slug,
        page_type: seed.page_type,
        title: seed.title,
        meta_description: seed.meta_description || null,
        service_slug: seed.service_slug || null,
        status: 'draft',
        is_active: true,
        content_html: null,
        content_json: null,
        structured_data: null,
      })

    if (error) {
      // 23505 = unique constraint violation (already exists, race condition)
      if (error.code === '23505') {
        skipped++
      } else {
        console.error(`  Error seeding ${seed.page_type}/${seed.slug}:`, error.message)
        errors++
      }
    } else {
      console.log(`  Created: ${seed.page_type}/${seed.slug}`)
      created++
    }
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped, ${errors} errors`)
}

main().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
