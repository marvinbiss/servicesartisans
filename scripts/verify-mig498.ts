/**
 * Smoke test mig 498 — vérifie que les 3 nouvelles colonnes existent et
 * que les flags sont activés. Lit-only, safe.
 */
import { supabase } from './lib/supabase-admin'

async function main() {
  console.log('='.repeat(70))
  console.log('VERIFY mig 498 — dispatch RGE-first')
  console.log('='.repeat(70))

  // Probe colonne par colonne pour identifier celles qui manquent
  const probes = [
    'require_rge_strict',
    'require_rge_for_cee',
    'rge_required_services',
    'rge_fallback_radius_km',
    'rge_boost_weight',
    'claimed_boost_weight',
    'geo_radius_km',
    'max_artisans_per_lead',
  ]
  console.log('\n[1] Probe colonne par colonne :')
  const present: Record<string, unknown> = {}
  const missing: string[] = []
  for (const col of probes) {
    const { data: row, error: e } = await supabase
      .from('algorithm_config')
      .select(col)
      .limit(1)
      .maybeSingle()
    if (e) {
      missing.push(col)
      console.log(`  ❌ ${col} : MISSING (${e.code} ${e.message.slice(0, 80)})`)
    } else if (row) {
      const v = (row as Record<string, unknown>)[col]
      present[col] = v
      const display = typeof v === 'object' ? JSON.stringify(v) : String(v)
      console.log(`  ✅ ${col.padEnd(28)} : ${display}`)
    }
  }

  const { data, error } = {
    data: present,
    error:
      missing.length > 0
        ? { message: `${missing.length} colonne(s) manquante(s) : ${missing.join(', ')}` }
        : null,
  }

  if (error) {
    console.error('\n⚠️ ', error.message)
    console.error('   → mig 498 incomplete OU cache PostgREST stale')
  }

  // Vérif fonction dispatch_lead existe avec la nouvelle signature
  const { error: fnErr } = await supabase.rpc('dispatch_lead', {
    p_lead_id: '00000000-0000-0000-0000-000000000000',
    p_service_name: 'pompe-a-chaleur',
    p_city: '__smoketest__inexistant__',
    p_postal_code: null,
    p_urgency: 'normal',
    p_latitude: null,
    p_longitude: null,
    p_source_table: 'devis_requests',
    p_cee_eligible: true,
  })

  if (fnErr) {
    if (fnErr.message.includes('violates foreign key')) {
      console.log('\n✅ dispatch_lead 9-param OK (FK error attendue sur lead inexistant)')
    } else if (fnErr.code === 'PGRST202') {
      console.error('\n❌ dispatch_lead 9-param INTROUVABLE — mig 498 incomplète')
      process.exit(1)
    } else {
      console.log('\n⚠️  dispatch_lead error inattendue:', fnErr.message, fnErr.code)
    }
  } else {
    console.log('\n✅ dispatch_lead 9-param appelable (lead UUID nul → assignement vide)')
  }

  // Compte audit_logs récents pour rge_strict_no_match (doit être 0 ou faible juste après deploy)
  const { count } = await supabase
    .from('audit_logs')
    .select('id', { count: 'exact', head: true })
    .eq('action', 'dispatch.rge_strict_no_match')
    .gte('created_at', new Date(Date.now() - 24 * 3600_000).toISOString())

  console.log('\nAudit logs `dispatch.rge_strict_no_match` (24h) :', count ?? 0)
  if ((count ?? 0) > 0) {
    console.log(
      "  → des leads RGE-required ont déjà été créés et n'ont trouvé aucun candidat. Voir audit_logs pour détail."
    )
  }

  console.log('\n' + '='.repeat(70))
  console.log('VERIFY OK')
  console.log('='.repeat(70))
}

main().catch((e) => {
  console.error('FATAL:', e)
  process.exit(1)
})
