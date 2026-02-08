/**
 * Indexation Validation Script
 *
 * Samples URLs from the site and checks that they are properly configured
 * for search engine indexation: status 200, canonical, robots, title,
 * description, JSON-LD, and response time.
 *
 * Usage:
 *   npx tsx scripts/validate-indexation.ts
 *   npx tsx scripts/validate-indexation.ts --base-url http://localhost:3000
 *   npx tsx scripts/validate-indexation.ts --base-url https://servicesartisans.fr
 *   npx tsx scripts/validate-indexation.ts --sample 50
 */

// ---------------------------------------------------------------------------
// Static data (duplicated to keep the script dependency-free)
// ---------------------------------------------------------------------------

const SERVICE_SLUGS = [
  'plombier', 'electricien', 'serrurier', 'chauffagiste',
  'peintre-en-batiment', 'menuisier', 'carreleur', 'couvreur',
  'macon', 'jardinier', 'vitrier', 'climaticien',
  'cuisiniste', 'solier', 'nettoyage',
];

const VILLE_SLUGS = [
  'paris', 'marseille', 'lyon', 'toulouse', 'nice', 'nantes',
  'strasbourg', 'montpellier', 'bordeaux', 'lille', 'rennes',
  'reims', 'saint-etienne', 'toulon', 'le-havre', 'grenoble',
  'dijon', 'angers', 'nimes', 'villeurbanne', 'clermont-ferrand',
  'le-mans', 'aix-en-provence', 'brest', 'tours', 'amiens',
  'limoges', 'perpignan', 'metz', 'besancon', 'orleans',
  'rouen', 'mulhouse', 'caen', 'nancy', 'argenteuil',
  'saint-denis', 'montreuil', 'roubaix', 'tourcoing',
  'avignon', 'dunkerque', 'asnieres-sur-seine', 'nanterre',
  'poitiers', 'versailles', 'courbevoie', 'vitry-sur-seine',
  'creteil', 'pau', 'colombes', 'aulnay-sous-bois',
  'rueil-malmaison', 'la-rochelle', 'antibes', 'saint-maur-des-fosses',
  'calais', 'champigny-sur-marne', 'aubervilliers', 'beziers',
  'bourges', 'cannes', 'saint-nazaire', 'quimper',
  'colmar', 'valence', 'drancy', 'ajaccio',
  'troyes', 'neuilly-sur-seine', 'issy-les-moulineaux',
  'levallois-perret', 'noisy-le-grand', 'la-seyne-sur-mer',
  'antony', 'venissieux', 'clichy', 'pessac',
  'ivry-sur-seine', 'cergy', 'charleville-mezieres', 'lorient',
  'sarcelles', 'niort', 'chambery', 'saint-quentin',
  'beauvais', 'villenave-d-ornon', 'epinay-sur-seine',
  'cholet', 'meaux', 'pantin', 'fontenay-sous-bois',
  'bondy', 'evry-courcouronnes', 'frejus', 'sevran',
  'vannes', 'le-blanc-mesnil', 'chelles', 'arles',
  'clamart', 'sartrouville', 'bobigny', 'grasse',
  'laval', 'belfort', 'evreux', 'vincennes',
  'montrouge', 'albi', 'martigues', 'saint-ouen-sur-seine',
  'suresnes', 'mantes-la-jolie', 'bagneux', 'gennevilliers',
  'saint-brieuc', 'bastia', 'roanne', 'ales',
  'gap', 'bourg-en-bresse', 'thionville', 'tarbes',
  'castres', 'macon', 'compiegne', 'arras',
  'melun', 'charleville-mezieres', 'douai', 'saint-malo',
  'bayonne', 'quimper', 'boulogne-sur-mer', 'aubagne',
  'angouleme', 'carcassonne', 'saint-herblain',
];

// ---------------------------------------------------------------------------
// CLI arguments
// ---------------------------------------------------------------------------

function parseArgs(): { baseUrl: string; sampleSize: number } {
  const args = process.argv.slice(2);
  let baseUrl = 'https://servicesartisans.fr';
  let sampleSize = 200;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--base-url' && args[i + 1]) {
      baseUrl = args[i + 1].replace(/\/+$/, '');
      i++;
    } else if (args[i] === '--sample' && args[i + 1]) {
      sampleSize = parseInt(args[i + 1], 10);
      i++;
    }
  }

  return { baseUrl, sampleSize };
}

// ---------------------------------------------------------------------------
// URL generation
// ---------------------------------------------------------------------------

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateUrls(sampleSize: number): { path: string; category: string }[] {
  const urls: { path: string; category: string }[] = [];

  // Category 1: service pages  /services/{service}
  // All 15 services
  const servicePages = SERVICE_SLUGS.map((s) => ({
    path: `/services/${s}`,
    category: 'service',
  }));

  // Category 2: service x location pages  /services/{service}/{location}
  const serviceLocationPages: { path: string; category: string }[] = [];
  for (const s of SERVICE_SLUGS) {
    for (const v of VILLE_SLUGS) {
      serviceLocationPages.push({
        path: `/services/${s}/${v}`,
        category: 'service-location',
      });
    }
  }

  // Category 3: top-level / static pages
  const staticPages = [
    { path: '/', category: 'static' },
    { path: '/services', category: 'static' },
    { path: '/contact', category: 'static' },
    { path: '/mentions-legales', category: 'static' },
  ];

  // Budget allocation (proportional to what task spec requests):
  // ~25% service pages, ~50% service-location, ~25% static/geographic
  const serviceBudget = Math.min(servicePages.length, Math.ceil(sampleSize * 0.25));
  const staticBudget = Math.min(staticPages.length, Math.ceil(sampleSize * 0.10));
  const locationBudget = Math.max(1, sampleSize - serviceBudget - staticBudget);

  urls.push(...shuffle(servicePages).slice(0, serviceBudget));
  urls.push(...shuffle(serviceLocationPages).slice(0, locationBudget));
  urls.push(...staticPages.slice(0, staticBudget));

  return shuffle(urls).slice(0, sampleSize);
}

// ---------------------------------------------------------------------------
// Validation logic
// ---------------------------------------------------------------------------

interface CheckResult {
  url: string;
  category: string;
  status: number | null;
  responseTimeMs: number;
  checks: {
    name: string;
    passed: boolean;
    detail?: string;
  }[];
}

async function validateUrl(
  baseUrl: string,
  entry: { path: string; category: string },
): Promise<CheckResult> {
  const fullUrl = `${baseUrl}${entry.path}`;
  const checks: CheckResult['checks'] = [];
  let status: number | null = null;
  let responseTimeMs = 0;
  let html = '';

  try {
    const start = Date.now();
    const res = await fetch(fullUrl, {
      redirect: 'follow',
      headers: { 'User-Agent': 'IndexationValidator/1.0' },
    });
    responseTimeMs = Date.now() - start;
    status = res.status;
    html = await res.text();
  } catch (err: any) {
    checks.push({ name: 'fetch', passed: false, detail: `Network error: ${err.message}` });
    return { url: fullUrl, category: entry.category, status, responseTimeMs, checks };
  }

  // 1. HTTP 200
  checks.push({
    name: 'http-200',
    passed: status === 200,
    detail: status !== 200 ? `Got ${status}` : undefined,
  });

  // 2. Response time < 3s
  checks.push({
    name: 'response-time',
    passed: responseTimeMs < 3000,
    detail: responseTimeMs >= 3000 ? `${responseTimeMs}ms (>3000ms)` : `${responseTimeMs}ms`,
  });

  // 3. Canonical link matches URL
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  if (canonicalMatch) {
    const canonical = canonicalMatch[1];
    const expectedCanonical = `https://servicesartisans.fr${entry.path}`;
    checks.push({
      name: 'canonical',
      passed: canonical === expectedCanonical || canonical === fullUrl,
      detail: canonical !== expectedCanonical && canonical !== fullUrl
        ? `Expected "${expectedCanonical}", got "${canonical}"`
        : undefined,
    });
  } else {
    checks.push({ name: 'canonical', passed: false, detail: 'No canonical link found' });
  }

  // 4. No noindex
  const noindexMatch = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
  const hasNoindex = noindexMatch ? /noindex/i.test(noindexMatch[1]) : false;
  checks.push({
    name: 'no-noindex',
    passed: !hasNoindex,
    detail: hasNoindex ? `Found robots noindex: "${noindexMatch![1]}"` : undefined,
  });

  // 5. Title is present and not "Non trouvé"
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  checks.push({
    name: 'title',
    passed: title.length > 0 && title !== 'Non trouvé',
    detail:
      title.length === 0
        ? 'Empty title'
        : title === 'Non trouvé'
          ? 'Title is "Non trouvé"'
          : undefined,
  });

  // 6. Meta description present and not empty
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
  const description = descMatch ? descMatch[1].trim() : '';
  checks.push({
    name: 'meta-description',
    passed: description.length > 0,
    detail: description.length === 0 ? 'Empty or missing meta description' : undefined,
  });

  // 7. JSON-LD present
  const jsonLdCount = (html.match(/<script[^>]+type=["']application\/ld\+json["']/gi) || []).length;
  checks.push({
    name: 'json-ld',
    passed: jsonLdCount > 0,
    detail: jsonLdCount === 0 ? 'No JSON-LD block found' : `${jsonLdCount} block(s)`,
  });

  return { url: fullUrl, category: entry.category, status, responseTimeMs, checks };
}

// ---------------------------------------------------------------------------
// Concurrency helper
// ---------------------------------------------------------------------------

async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const idx = nextIndex++;
      results[idx] = await fn(items[idx], idx);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

function printReport(results: CheckResult[], baseUrl: string) {
  const total = results.length;

  // Aggregate by check name
  const checkNames = [
    'http-200', 'response-time', 'canonical', 'no-noindex',
    'title', 'meta-description', 'json-ld',
  ];

  const summary: Record<string, { pass: number; fail: number }> = {};
  for (const name of checkNames) {
    summary[name] = { pass: 0, fail: 0 };
  }

  const failures: { url: string; category: string; reasons: string[] }[] = [];

  for (const r of results) {
    const reasons: string[] = [];

    // Handle fetch-level failure
    const fetchCheck = r.checks.find((c) => c.name === 'fetch');
    if (fetchCheck) {
      reasons.push(`fetch: ${fetchCheck.detail}`);
      for (const name of checkNames) {
        summary[name].fail++;
      }
    } else {
      for (const c of r.checks) {
        if (summary[c.name]) {
          if (c.passed) summary[c.name].pass++;
          else summary[c.name].fail++;
        }
        if (!c.passed) {
          reasons.push(`${c.name}: ${c.detail || 'FAIL'}`);
        }
      }
    }

    if (reasons.length > 0) {
      failures.push({ url: r.url, category: r.category, reasons });
    }
  }

  // Category breakdown
  const categories = Array.from(new Set(results.map((r) => r.category)));
  const catCounts: Record<string, number> = {};
  for (const c of categories) catCounts[c] = results.filter((r) => r.category === c).length;

  console.log('\n' + '='.repeat(70));
  console.log('  INDEXATION VALIDATION REPORT');
  console.log('='.repeat(70));
  console.log(`  Base URL:   ${baseUrl}`);
  console.log(`  Total URLs: ${total}`);
  console.log(`  Categories: ${categories.map((c) => `${c} (${catCounts[c]})`).join(', ')}`);
  console.log('');

  // Per-check summary table
  console.log('  CHECK               PASS    FAIL    RATE');
  console.log('  ' + '-'.repeat(50));
  for (const name of checkNames) {
    const s = summary[name];
    const rate = total > 0 ? ((s.pass / total) * 100).toFixed(1) : '0.0';
    console.log(
      `  ${name.padEnd(20)} ${String(s.pass).padStart(4)}    ${String(s.fail).padStart(4)}    ${rate}%`,
    );
  }

  const totalPass = results.filter(
    (r) => r.checks.every((c) => c.passed),
  ).length;
  const totalFail = total - totalPass;

  console.log('  ' + '-'.repeat(50));
  console.log(`  OVERALL             ${String(totalPass).padStart(4)}    ${String(totalFail).padStart(4)}    ${((totalPass / total) * 100).toFixed(1)}%`);

  // Average response time
  const avgTime = results.reduce((sum, r) => sum + r.responseTimeMs, 0) / total;
  console.log(`\n  Avg response time: ${avgTime.toFixed(0)}ms`);

  // Failures list
  if (failures.length > 0) {
    console.log('\n' + '-'.repeat(70));
    console.log(`  FAILURES (${failures.length})`);
    console.log('-'.repeat(70));
    for (const f of failures) {
      console.log(`\n  [${f.category}] ${f.url}`);
      for (const reason of f.reasons) {
        console.log(`    - ${reason}`);
      }
    }
  } else {
    console.log('\n  All URLs passed all checks!');
  }

  console.log('\n' + '='.repeat(70));
  console.log('  Re-run commands:');
  console.log(`    npx tsx scripts/validate-indexation.ts --base-url ${baseUrl}`);
  console.log(`    npx tsx scripts/validate-indexation.ts --base-url ${baseUrl} --sample 50`);
  console.log('='.repeat(70) + '\n');

  // Exit code
  if (totalFail > 0) {
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { baseUrl, sampleSize } = parseArgs();

  console.log(`\nIndexation Validator`);
  console.log(`Base URL:    ${baseUrl}`);
  console.log(`Sample size: ${sampleSize}`);
  console.log('');

  const urls = generateUrls(sampleSize);
  console.log(`Generated ${urls.length} URLs to validate...`);

  let completed = 0;
  const results = await runWithConcurrency(urls, 10, async (entry, _idx) => {
    const result = await validateUrl(baseUrl, entry);
    completed++;
    const pct = ((completed / urls.length) * 100).toFixed(0);
    const passed = result.checks.every((c) => c.passed);
    process.stdout.write(
      `\r  [${pct}%] ${completed}/${urls.length} - ${passed ? 'PASS' : 'FAIL'} ${entry.path.substring(0, 50).padEnd(50)}`,
    );
    return result;
  });

  printReport(results, baseUrl);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(2);
});
