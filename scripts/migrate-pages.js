import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DEFAULT_INPUT = "legacy-wordpress/content/pages.json";
const DEFAULT_BATCH_SIZE = 25;

const loadEnvFile = async (envPath) => {
  try {
    const raw = await fs.readFile(envPath, "utf8");
    raw.split(/\r?\n/).forEach((line) => {
      if (!line || line.trim().startsWith("#")) {
        return;
      }
      const [key, ...rest] = line.split("=");
      if (!key) {
        return;
      }
      if (process.env[key]) {
        return;
      }
      process.env[key] = rest.join("=").trim();
    });
  } catch {
    // ignore
  }
};

const parseArgs = (argv) => {
  const args = {
    input: DEFAULT_INPUT,
    batchSize: DEFAULT_BATCH_SIZE,
    dryRun: false,
    limit: null,
  };

  argv.forEach((arg, index) => {
    if (arg === "--dry-run") {
      args.dryRun = true;
    }
    if (arg === "--input" && argv[index + 1]) {
      args.input = argv[index + 1];
    }
    if (arg === "--batch-size" && argv[index + 1]) {
      args.batchSize = Number.parseInt(argv[index + 1], 10) || DEFAULT_BATCH_SIZE;
    }
    if (arg === "--limit" && argv[index + 1]) {
      args.limit = Number.parseInt(argv[index + 1], 10) || null;
    }
  });

  return args;
};

const normalizeStatus = (status) => {
  const normalized = (status || "").toLowerCase();
  if (normalized === "publish" || normalized === "published") {
    return "published";
  }
  if (normalized === "draft" || normalized === "pending") {
    return "draft";
  }
  if (normalized === "archived") {
    return "archived";
  }
  return "published";
};

const mapYoastMeta = (meta = {}) => ({
  title: meta["_yoast_wpseo_title"],
  description: meta["_yoast_wpseo_metadesc"],
  focus_keyword: meta["_yoast_wpseo_focuskw"],
  canonical: meta["_yoast_wpseo_canonical"],
  og_title: meta["_yoast_wpseo_opengraph-title"],
  og_description: meta["_yoast_wpseo_opengraph-description"],
  og_image: meta["_yoast_wpseo_opengraph-image"],
  twitter_title: meta["_yoast_wpseo_twitter-title"],
  twitter_description: meta["_yoast_wpseo_twitter-description"],
  twitter_image: meta["_yoast_wpseo_twitter-image"],
  meta_robots: meta["_yoast_wpseo_meta-robots"],
  meta_robots_noindex: meta["_yoast_wpseo_meta-robots-noindex"],
  meta_robots_nofollow: meta["_yoast_wpseo_meta-robots-nofollow"],
  meta_robots_adv: meta["_yoast_wpseo_meta-robots-adv"],
});

const toSupabasePage = (page) => {
  const seo = page.seo || mapYoastMeta(page.meta || {});
  const slug = page.post_name || page.slug || "";
  return {
    wordpress_id: Number.isFinite(page.id) ? page.id : Number.parseInt(page.id, 10) || null,
    slug,
    title: page.title || "Untitled",
    content: page.content || "",
    meta_title: seo?.title || null,
    meta_description: seo?.description || null,
    og_image_url: seo?.og_image || null,
    seo: seo && Object.values(seo).some(Boolean) ? seo : null,
    status: normalizeStatus(page.post_status),
    updated_at: new Date().toISOString(),
  };
};

const chunk = (items, size) => {
  const batches = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
};

const migrateBatch = async ({ supabaseUrl, serviceRoleKey, batch, dryRun }) => {
  if (dryRun) {
    return { ok: true };
  }

  const url = new URL(`${supabaseUrl}/rest/v1/pages`);
  url.searchParams.set("on_conflict", "slug");

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(batch),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { ok: false, error: errorText };
  }

  return { ok: true };
};

const main = async () => {
  await loadEnvFile(path.resolve(process.cwd(), ".env"));
  await loadEnvFile(path.resolve(process.cwd(), ".env.local"));

  const args = parseArgs(process.argv.slice(2));

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
    process.exit(1);
  }

  const inputPath = path.resolve(process.cwd(), args.input);
  const raw = await fs.readFile(inputPath, "utf8");
  const pages = JSON.parse(raw);

  const normalized = pages
    .filter((page) => page && (page.post_name || page.slug))
    .map(toSupabasePage);

  const limited = args.limit ? normalized.slice(0, args.limit) : normalized;
  const batches = chunk(limited, args.batchSize);

  let inserted = 0;
  let failed = 0;

  for (let index = 0; index < batches.length; index += 1) {
    const batch = batches[index];
    const result = await migrateBatch({ supabaseUrl, serviceRoleKey, batch, dryRun: args.dryRun });

    if (result.ok) {
      inserted += batch.length;
      console.log(`Batch ${index + 1}/${batches.length} migrated (${batch.length} pages).`);
    } else {
      failed += batch.length;
      console.error(`Batch ${index + 1} failed: ${result.error}`);
    }
  }

  console.log(`\nMigration complete. Inserted: ${inserted}, Failed: ${failed}`);
  if (failed > 0) {
    process.exit(1);
  }
};

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
