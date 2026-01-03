#!/usr/bin/env node
/**
 * Import subscribers from CSV to Resend audiences
 * Usage: node scripts/import-to-resend.js [--dry-run] [--limit=100]
 */

const fs = require('fs');
const path = require('path');

const RESEND_API_KEY = 're_VnTsmyAB_4Nry5BHp43YidatckPWTEJgm';

const AUDIENCES = {
  english: 'd106f6a7-fdb0-4179-bbe2-858ac0be4b69',
  spanish: '9bd44339-6d89-48e0-a016-bdcab66478a2',
  portuguese: 'de1f8975-17b2-4bbb-8696-0716b821ae7d',
  general: '12a1773d-8b3a-4cf4-a26a-03eb604a0c63',
};

const CSV_PATH = path.join(__dirname, '..', '1767424122_175556916436534406_subscribers_active.csv');

// Parse command line args
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : null;

function parseCSV(content) {
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

  const subscribers = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    // Simple CSV parsing (handles basic cases)
    const values = [];
    let current = '';
    let inQuotes = false;

    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });

    subscribers.push(row);
  }

  return subscribers;
}

function detectLanguage(groups) {
  const groupsLower = groups.toLowerCase();
  if (groupsLower.includes('portuguese')) return 'portuguese';
  if (groupsLower.includes('spanish')) return 'spanish';
  if (groupsLower.includes('english')) return 'english';
  return 'general';
}

async function addContact(audienceId, contact) {
  const response = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: contact.email,
      first_name: contact.firstName || '',
      last_name: contact.lastName || '',
      unsubscribed: false,
    }),
  });

  return response.json();
}

async function main() {
  console.log('📧 Resend Subscriber Import\n');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE IMPORT'}`);
  if (limit) console.log(`Limit: ${limit} subscribers`);
  console.log('');

  // Read CSV
  console.log('Reading CSV file...');
  const content = fs.readFileSync(CSV_PATH, 'utf-8');
  let subscribers = parseCSV(content);

  console.log(`Total subscribers in CSV: ${subscribers.length}`);

  if (limit) {
    subscribers = subscribers.slice(0, limit);
    console.log(`Limited to: ${subscribers.length}`);
  }

  // Group by language
  const byLanguage = {
    english: [],
    spanish: [],
    portuguese: [],
    general: [],
  };

  for (const sub of subscribers) {
    const email = sub['Subscriber'] || sub['email'];
    if (!email || !email.includes('@')) continue;

    const groups = sub['Groups'] || '';
    const language = detectLanguage(groups);

    byLanguage[language].push({
      email,
      firstName: sub['Name'] || sub['First Name'] || '',
      lastName: sub['Last name'] || '',
      country: sub['Country'] || '',
    });
  }

  console.log('\nSubscribers by language:');
  console.log(`  English: ${byLanguage.english.length}`);
  console.log(`  Spanish: ${byLanguage.spanish.length}`);
  console.log(`  Portuguese: ${byLanguage.portuguese.length}`);
  console.log(`  General (no group): ${byLanguage.general.length}`);

  if (dryRun) {
    console.log('\n🔍 DRY RUN - No contacts will be created');
    console.log('\nSample contacts:');
    for (const lang of ['english', 'spanish', 'portuguese']) {
      console.log(`\n${lang.toUpperCase()} (first 3):`);
      byLanguage[lang].slice(0, 3).forEach(c => {
        console.log(`  - ${c.email} (${c.firstName} ${c.lastName})`);
      });
    }
    return;
  }

  // Import to Resend
  console.log('\n🚀 Starting import...\n');

  const results = {
    success: 0,
    failed: 0,
    errors: [],
  };

  for (const [language, contacts] of Object.entries(byLanguage)) {
    if (contacts.length === 0) continue;

    const audienceId = AUDIENCES[language];
    console.log(`\nImporting ${contacts.length} contacts to ${language} audience...`);

    let processed = 0;
    for (const contact of contacts) {
      try {
        const result = await addContact(audienceId, contact);

        if (result.id) {
          results.success++;
        } else if (result.statusCode === 422) {
          // Already exists, count as success
          results.success++;
        } else {
          results.failed++;
          if (results.errors.length < 10) {
            results.errors.push(`${contact.email}: ${JSON.stringify(result)}`);
          }
        }
      } catch (error) {
        results.failed++;
        if (results.errors.length < 10) {
          results.errors.push(`${contact.email}: ${error.message}`);
        }
      }

      processed++;
      if (processed % 100 === 0) {
        console.log(`  Processed: ${processed}/${contacts.length}`);
      }

      // Rate limiting - Resend allows 10 req/sec
      await new Promise(r => setTimeout(r, 550)); // Resend allows 2 req/sec
    }
  }

  console.log('\n✅ Import complete!');
  console.log(`  Success: ${results.success}`);
  console.log(`  Failed: ${results.failed}`);

  if (results.errors.length > 0) {
    console.log('\nErrors:');
    results.errors.forEach(e => console.log(`  - ${e}`));
  }
}

main().catch(console.error);
