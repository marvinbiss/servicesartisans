/**
 * Récupère tous les emails des mairies de France
 * Source: API Annuaire Service-Public.fr (Licence Ouverte v2.0)
 *
 * Utilise l'endpoint /exports/csv qui n'a PAS de limite offset
 *
 * Usage: node scripts/scrape-mairies.mjs
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, 'output');

const EXPORT_URL = 'https://api-lannuaire.service-public.fr/api/explore/v2.1/catalog/datasets/api-lannuaire-administration/exports/csv?where=pivot%20like%20%22mairie%22&delimiter=%3B&select=nom%2Cadresse_courriel%2Ctelephone%2Cadresse%2Cpivot%2Csite_internet';

function escapeCsv(val) {
  if (!val) return '';
  const s = String(val);
  return (s.includes(',') || s.includes('"') || s.includes('\n'))
    ? `"${s.replace(/"/g, '""')}"` : s;
}

function extractInsee(pivotRaw) {
  if (!pivotRaw) return '';
  try {
    const pivots = typeof pivotRaw === 'string' ? JSON.parse(pivotRaw) : pivotRaw;
    if (Array.isArray(pivots) && pivots[0]?.code_insee_commune) {
      return pivots[0].code_insee_commune.join(';');
    }
  } catch {}
  return '';
}

function parseCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ';') {
        fields.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('=== Téléchargement du CSV des mairies via export API ===\n');
  console.log('URL:', EXPORT_URL.slice(0, 100) + '...\n');

  const res = await fetch(EXPORT_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);

  console.log('Téléchargement en cours...');
  const csvText = await res.text();
  console.log(`Téléchargé: ${(csvText.length / 1024 / 1024).toFixed(1)} MB\n`);

  const lines = csvText.split('\n').filter(l => l.trim());
  const headerLine = lines[0];
  const headers = parseCsvLine(headerLine);
  console.log(`Colonnes: ${headers.join(', ')}`);
  console.log(`Lignes de données: ${lines.length - 1}\n`);

  // Map column indices
  const colIdx = {};
  headers.forEach((h, i) => colIdx[h.trim()] = i);

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    const nom = fields[colIdx['nom']] || '';
    const email = fields[colIdx['adresse_courriel']] || '';
    const telephone = fields[colIdx['telephone']] || '';
    const adresse = fields[colIdx['adresse']] || '';
    const pivot = fields[colIdx['pivot']] || '';
    const siteWeb = fields[colIdx['site_internet']] || '';
    const codeInsee = extractInsee(pivot);

    records.push({ nom, email, telephone, adresse, code_insee: codeInsee, site_web: siteWeb });
  }

  const withEmail = records.filter(r => r.email);

  console.log(`=== Résultat ===`);
  console.log(`  Total mairies:     ${records.length}`);
  console.log(`  Avec email:        ${withEmail.length}`);
  console.log(`  Sans email:        ${records.length - withEmail.length}\n`);

  // CSV all
  const header = 'nom,email,telephone,adresse,code_insee,site_web';
  const allPath = join(OUTPUT_DIR, 'mairies-toutes.csv');
  const allRows = [header, ...records.map(r =>
    [r.nom, r.email, r.telephone, r.adresse, r.code_insee, r.site_web].map(escapeCsv).join(',')
  )];
  writeFileSync(allPath, '\uFEFF' + allRows.join('\n'), 'utf-8');
  console.log(`  CSV complet:      ${allPath}`);

  // CSV emails only
  const emailPath = join(OUTPUT_DIR, 'mairies-emails.csv');
  const emailRows = [header, ...withEmail.map(r =>
    [r.nom, r.email, r.telephone, r.adresse, r.code_insee, r.site_web].map(escapeCsv).join(',')
  )];
  writeFileSync(emailPath, '\uFEFF' + emailRows.join('\n'), 'utf-8');
  console.log(`  CSV avec emails:  ${emailPath}`);

  // Quick stats
  console.log('\n=== Top 10 domaines email ===');
  const domains = {};
  for (const r of withEmail) {
    const domain = r.email.split('@')[1]?.toLowerCase();
    if (domain) domains[domain] = (domains[domain] || 0) + 1;
  }
  Object.entries(domains)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([d, c]) => console.log(`  ${d}: ${c}`));

  console.log('\nTerminé !');
}

main().catch(console.error);
