/**
 * Import subscribers from CSV to Supabase
 *
 * Usage: npx ts-node scripts/import-subscribers.ts
 *
 * Requires:
 * - NEXT_PUBLIC_SUPABASE_URL in .env.local
 * - SUPABASE_SERVICE_ROLE_KEY in .env.local (for admin access)
 */

import { createClient } from "@supabase/supabase-js"
import { config as loadEnv } from "dotenv"
import * as fs from "fs"
import * as path from "path"

// Load environment variables
loadEnv({ path: path.join(__dirname, "../.env.local") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface Subscriber {
  email: string
  name: string | null
  last_name: string | null
  country: string | null
  city: string | null
  location: string | null
  subscribed_at: string | null
  language: string | null
  sent: number
  opens: number
  clicks: number
  tags: string | null
  groups: string | null
  score_on_test: string | null
  source: string
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

async function createSubscribersTable() {
  console.log("Creating subscribers table if not exists...")

  // Note: Run this SQL in Supabase dashboard if the table doesn't exist
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS subscribers (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      last_name TEXT,
      country TEXT,
      city TEXT,
      location TEXT,
      subscribed_at TIMESTAMPTZ,
      language TEXT DEFAULT 'en',
      sent INTEGER DEFAULT 0,
      opens INTEGER DEFAULT 0,
      clicks INTEGER DEFAULT 0,
      tags TEXT,
      groups TEXT,
      score_on_test TEXT,
      source TEXT DEFAULT 'mailchimp_import',
      status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
    CREATE INDEX IF NOT EXISTS idx_subscribers_country ON subscribers(country);
    CREATE INDEX IF NOT EXISTS idx_subscribers_subscribed_at ON subscribers(subscribed_at);
  `

  console.log("\nPlease run this SQL in Supabase dashboard if the table doesn't exist:\n")
  console.log(createTableSQL)
  console.log("\n")
}

async function importSubscribers(csvPath: string) {
  console.log(`Reading CSV from: ${csvPath}`)

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found: ${csvPath}`)
    process.exit(1)
  }

  const content = fs.readFileSync(csvPath, "utf-8")
  const lines = content.split("\n").filter((line) => line.trim())

  // Parse header
  const header = parseCSVLine(lines[0])
  console.log(`Found ${lines.length - 1} subscribers`)
  console.log("Headers:", header.slice(0, 10).join(", "), "...")

  // Find column indices
  const getIndex = (name: string): number => {
    const idx = header.findIndex(
      (h) => h.toLowerCase() === name.toLowerCase()
    )
    return idx
  }

  const emailIdx = getIndex("Subscriber")
  const sentIdx = getIndex("Sent")
  const opensIdx = getIndex("Opens")
  const clicksIdx = getIndex("Clicks")
  const subscribedIdx = getIndex("Subscribed")
  const locationIdx = getIndex("Location")
  const nameIdx = getIndex("Name")
  const lastNameIdx = getIndex("Last name")
  const countryIdx = getIndex("Country")
  const cityIdx = getIndex("City")
  const languageIdx = getIndex("Language")
  const tagsIdx = getIndex("Tags")
  const groupsIdx = getIndex("Groups")
  const scoreIdx = getIndex("Score on Test")

  console.log("\nColumn mappings:")
  console.log(`  Email: ${emailIdx}, Name: ${nameIdx}, Country: ${countryIdx}`)

  const subscribers: Subscriber[] = []
  let skipped = 0

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const email = values[emailIdx]?.toLowerCase().trim()

    if (!email || !email.includes("@")) {
      skipped++
      continue
    }

    subscribers.push({
      email,
      name: values[nameIdx] || null,
      last_name: values[lastNameIdx] || null,
      country: values[countryIdx] || null,
      city: values[cityIdx] || null,
      location: values[locationIdx] || null,
      subscribed_at: values[subscribedIdx] || null,
      language: values[languageIdx] || null,
      sent: parseInt(values[sentIdx]) || 0,
      opens: parseInt(values[opensIdx]) || 0,
      clicks: parseInt(values[clicksIdx]) || 0,
      tags: values[tagsIdx] || null,
      groups: values[groupsIdx] || null,
      score_on_test: values[scoreIdx] || null,
      source: "mailchimp_import",
    })
  }

  console.log(`\nParsed ${subscribers.length} valid subscribers (skipped ${skipped})`)

  // Import in batches
  const batchSize = 100
  let imported = 0
  let errors = 0

  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize)

    const { error } = await supabase.from("subscribers").upsert(batch, {
      onConflict: "email",
      ignoreDuplicates: false,
    })

    if (error) {
      console.error(`Batch ${Math.floor(i / batchSize) + 1} error:`, error.message)
      errors += batch.length
    } else {
      imported += batch.length
    }

    // Progress
    const progress = Math.round(((i + batch.length) / subscribers.length) * 100)
    process.stdout.write(`\rProgress: ${progress}% (${imported} imported, ${errors} errors)`)
  }

  console.log("\n")
  console.log("=== Import Complete ===")
  console.log(`Total subscribers: ${subscribers.length}`)
  console.log(`Successfully imported: ${imported}`)
  console.log(`Errors: ${errors}`)
}

async function main() {
  await createSubscribersTable()

  const csvPath = path.join(
    __dirname,
    "../../1767424122_175556916436534406_subscribers_active.csv"
  )

  console.log("\nTo import subscribers, ensure the subscribers table exists in Supabase.")
  console.log("Then uncomment the import line below and run again.\n")

  // Uncomment to run import:
  // await importSubscribers(csvPath)

  console.log("Import script ready. Edit the script to run the import.")
}

main().catch(console.error)
