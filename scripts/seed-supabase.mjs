#!/usr/bin/env node
// Seed Supabase with 340 leads from data.js
// Usage: node scripts/seed-supabase.mjs

const SUPABASE_URL = 'https://jdlyfilsgbtxfrdxccli.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nZdKSA2zRIGb2lB_k5JGNQ_5PORgiwJ';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

const rest = (table) => `${SUPABASE_URL}/rest/v1/${table}`;

// Load leads from JSON
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const leadsRaw = JSON.parse(readFileSync(join(__dirname, '..', '..', 'CASA-PUSH-LEADS.json'), 'utf-8'));

// Also load generated data with coordinates
const dataJs = readFileSync(join(__dirname, '..', 'js', 'data.js'), 'utf-8');
const jsonStr = dataJs.replace('export const LEADS = ', '').replace(/;\s*$/, '').replace(/^\/\/.*$/gm, '');
const leads = JSON.parse(jsonStr);

async function seed() {
  console.log(`Seeding ${leads.length} leads...`);

  // Insert in batches of 50
  const batchSize = 50;
  let inserted = 0;

  for (let i = 0; i < leads.length; i += batchSize) {
    const batch = leads.slice(i, i + batchSize).map(l => ({
      id: l.id,
      name: l.name,
      address: l.address || '',
      phone: l.phone || '',
      rating: l.rating || 0,
      reviews: l.reviews || 0,
      niche: l.niche,
      tier: l.tier || 1,
      score: l.score || 0,
      quartier: l.quartier || '',
      lat: l.lat,
      lng: l.lng,
      website: l.website || ''
    }));

    const res = await fetch(rest('leads'), {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=minimal,resolution=merge-duplicates' },
      body: JSON.stringify(batch)
    });

    if (res.ok) {
      inserted += batch.length;
      console.log(`  ${inserted}/${leads.length} inserted`);
    } else {
      const err = await res.text();
      console.error(`  Batch error: ${res.status} — ${err}`);
    }
  }

  console.log(`Done! ${inserted} leads seeded.`);
}

seed().catch(console.error);
