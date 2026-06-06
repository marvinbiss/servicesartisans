/**
 * verify-tunnel-cee-db.mjs — vérifie la chaîne DB du tunnel CEE de bout en
 * bout : partner temporaire → insert dossier réel (FK référentiels mig 543,
 * trigger mig 544, colonnes générées) → cleanup total.
 *
 * À re-runner après application de mig 544 (SQL editor). Échec attendu tant
 * que 544 n'est pas appliquée : « Illegal cee_dossiers status transition:
 * <NULL> -> draft » (trigger 431 + fonction 433/437 qui lit OLD sur INSERT).
 *
 * Usage : node scripts/verify-tunnel-cee-db.mjs
 */
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const { data: prof } = await sb
  .from('profiles')
  .select('id')
  .eq('email', 'marvin+artisan-test@yeoskin.com')
  .maybeSingle()
const { data: provider } = await sb
  .from('providers')
  .select('id, user_id, name')
  .eq('user_id', prof.id)
  .maybeSingle()
console.log('provider:', provider.id, provider.name)

const { data: partner, error: pe } = await sb
  .from('cee_artisan_partners')
  .insert({
    provider_id: provider.id,
    user_id: provider.user_id,
    status: 'active',
    invited_at: new Date().toISOString(),
    convention_signed_at: new Date().toISOString(),
    certified_at: new Date().toISOString(),
  })
  .select('id, commission_rate_effective')
  .single()
if (pe) {
  console.error('partner insert:', pe.message)
  process.exit(1)
}
console.log('partner temp:', partner.id, 'commission:', partner.commission_rate_effective)

const { data: f } = await sb
  .from('cee_forfaits')
  .select('id, prime_forfait_eur_cts, date_validite_debut')
  .eq('operation_code', 'BAR-TH-171')
  .eq('zone', 'H1')
  .eq('categorie_revenus', 'modeste')
  .maybeSingle()

const key = crypto.randomBytes(32)
const enc = (s) => {
  const iv = crypto.randomBytes(12)
  const c = crypto.createCipheriv('aes-256-gcm', key, iv)
  const ct = Buffer.concat([c.update(s, 'utf8'), c.final()])
  return Buffer.concat([iv, c.getAuthTag(), ct])
}
const hex = (b) => '\\x' + b.toString('hex')
const email = 'test-tunnel-cee@example.com'
const ref = 'SAE-202606-' + String(Math.floor(Math.random() * 1000000)).padStart(6, '0')

const { data: dossier, error: de } = await sb
  .from('cee_dossiers')
  .insert({
    reference: ref,
    partner_id: partner.id,
    provider_id: provider.id,
    client_nom_encrypted: hex(enc('Dupont')),
    client_prenom_encrypted: hex(enc('Jean')),
    client_email_encrypted: hex(enc(email)),
    client_email_hash: crypto.createHash('sha256').update(email).digest('hex'),
    client_telephone_encrypted: hex(enc('0612345678')),
    client_adresse_encrypted: hex(enc('12 rue de la Paix')),
    client_code_postal: '75011',
    client_commune_insee: '75056',
    foyer_personnes: 4,
    revenus_categorie: 'modeste',
    operation_code: 'BAR-TH-171',
    type_travaux: 'Pompe à chaleur air/eau — etas=130, cop=4.2',
    surface_m2: 100,
    annee_construction: 1985,
    energie_remplacee: 'fioul',
    montant_ht_cts: 850000,
    montant_ttc_cts: 896750,
    date_devis: '2026-06-01',
    forfait_id: f.id,
    forfait_version: f.date_validite_debut + ':' + f.prime_forfait_eur_cts,
    prime_cee_cts: Number(f.prime_forfait_eur_cts),
    commission_rate: Number(partner.commission_rate_effective),
    status: 'draft',
  })
  .select('id, reference, prime_total_cts, reste_a_charge_cts, commission_amount_cts, status')
  .single()

if (de) {
  console.error('dossier insert:', de.message)
  await sb.from('cee_artisan_partners').delete().eq('id', partner.id)
  process.exit(1)
}
console.log('DOSSIER CRÉÉ:', JSON.stringify(dossier))

const { error: dd } = await sb.from('cee_dossiers').delete().eq('id', dossier.id)
const { error: dp } = await sb.from('cee_artisan_partners').delete().eq('id', partner.id)
console.log('cleanup dossier:', dd ? dd.message : 'OK', '| partner:', dp ? dp.message : 'OK')
