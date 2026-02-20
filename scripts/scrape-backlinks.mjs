/**
 * Récupère les emails de toutes les cibles backlinks intéressantes
 * Source: API Annuaire Service-Public.fr (Licence Ouverte v2.0)
 *
 * Cibles:
 *   - EPCI (communautés de communes/agglo/métropoles): 1 255
 *   - CMA (chambres des métiers): 101
 *   - CCI (chambres de commerce): 266
 *   - ADIL (info logement): 101
 *   - France Rénov': 468
 *   - CAUE (architecture/urbanisme): 93
 *
 * Usage: node scripts/scrape-backlinks.mjs
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, 'output');

const API_EXPORT = 'https://api-lannuaire.service-public.fr/api/explore/v2.1/catalog/datasets/api-lannuaire-administration/exports/csv';
const SELECT = 'nom,adresse_courriel,telephone,adresse,pivot,site_internet';

const TARGETS = [
  { id: 'epci', label: 'Communautés de communes / Agglo / Métropoles', filter: 'pivot like "epci"' },
  { id: 'chambre_metier', label: 'Chambres des Métiers (CMA)', filter: 'pivot like "chambre_metier"' },
  { id: 'cci', label: 'Chambres de Commerce (CCI)', filter: 'pivot like "cci"' },
  { id: 'adil', label: 'ADIL (Info Logement)', filter: 'pivot like "adil"' },
  { id: 'fr_renov', label: 'Espaces France Rénov\'', filter: 'pivot like "fr_renov"' },
  { id: 'caue', label: 'CAUE (Architecture/Urbanisme)', filter: 'pivot like "caue"' },
];

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

async function fetchTarget(target) {
  const params = new URLSearchParams({
    where: target.filter,
    delimiter: ';',
    select: SELECT,
  });
  const url = `${API_EXPORT}?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${target.id}`);
  const csvText = await res.text();

  const lines = csvText.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  const colIdx = {};
  headers.forEach((h, i) => colIdx[h.trim()] = i);

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    records.push({
      nom: fields[colIdx['nom']] || '',
      email: fields[colIdx['adresse_courriel']] || '',
      telephone: fields[colIdx['telephone']] || '',
      adresse: fields[colIdx['adresse']] || '',
      code_insee: extractInsee(fields[colIdx['pivot']] || ''),
      site_web: fields[colIdx['site_internet']] || '',
    });
  }
  return records;
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('=== Récupération des cibles backlinks ===\n');

  const allRecords = [];
  const header = 'nom,email,telephone,adresse,code_insee,site_web';

  for (const target of TARGETS) {
    try {
      const records = await fetchTarget(target);
      const withEmail = records.filter(r => r.email);

      console.log(`${target.label}`);
      console.log(`  Total: ${records.length} | Avec email: ${withEmail.length}`);

      // Write individual CSV
      if (withEmail.length > 0) {
        const rows = [header, ...withEmail.map(r =>
          [r.nom, r.email, r.telephone, r.adresse, r.code_insee, r.site_web].map(escapeCsv).join(',')
        )];
        const path = join(OUTPUT_DIR, `backlinks-${target.id}.csv`);
        writeFileSync(path, '\uFEFF' + rows.join('\n'), 'utf-8');
        console.log(`  → ${path}`);
      }

      allRecords.push(...withEmail.map(r => ({ ...r, categorie: target.label })));
      console.log('');
    } catch (err) {
      console.error(`  ERREUR ${target.id}: ${err.message}\n`);
    }
  }

  // Write combined CSV
  const combinedHeader = 'categorie,nom,email,telephone,adresse,code_insee,site_web';
  const combinedRows = [combinedHeader, ...allRecords.map(r =>
    [r.categorie, r.nom, r.email, r.telephone, r.adresse, r.code_insee, r.site_web].map(escapeCsv).join(',')
  )];
  const combinedPath = join(OUTPUT_DIR, 'backlinks-tous.csv');
  writeFileSync(combinedPath, '\uFEFF' + combinedRows.join('\n'), 'utf-8');

  console.log('=== Résumé ===');
  console.log(`  Total contacts avec email: ${allRecords.length}`);
  console.log(`  Fichier combiné: ${combinedPath}`);
  console.log('\nTerminé !');
}

main().catch(console.error);
