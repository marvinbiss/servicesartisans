import { supabase } from './lib/supabase-admin'
async function main() {
  const { data, error } = await supabase
    .from('providers')
    .select('id, rge_qualifications')
    .not('rge_qualifications', 'is', null)
    .limit(3)
  if (error) console.error(error)
  console.log(JSON.stringify(data, null, 2))
}
main()
