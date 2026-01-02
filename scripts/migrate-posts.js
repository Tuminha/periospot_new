import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DEFAULT_INPUT = "legacy-wordpress/content/posts.json";
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
    // Ignore missing .env file; rely on existing process.env.
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

const normalizeDate = (value) => {
  if (!value) {
    return null;
  }
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
};

const estimateReadingTime = (content) => {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.round(words / 200));
};

const detectLanguage = (post) => {
  const categories = Array.isArray(post.categories) ? post.categories : [];
  const tags = Array.isArray(post.tags) ? post.tags : [];
  const combined = `${categories.join(" ")} ${tags.join(" ")} ${post.slug || ""} ${post.title || ""}`.toLowerCase();

  if (combined.includes("espanol") || combined.includes("español") || combined.includes("spanish")) {
    return "es";
  }
  if (combined.includes("portugues") || combined.includes("português") || combined.includes("portuguese")) {
    return "pt";
  }
  if (combined.includes("chinese") || combined.includes("中文") || combined.includes("chino")) {
    return "zh";
  }
  return "en";
};

const toSupabasePost = (post) => {
  const content = post.content || "";
  const excerpt = post.excerpt || "";
  const slug = post.slug || "";

  return {
    wordpress_id: Number.isFinite(post.id) ? post.id : Number.parseInt(post.id, 10) || null,
    slug,
    title: post.title || "Untitled",
    excerpt,
    content,
    featured_image_url: post.featured_image || null,
    author_name: post.author || null,
    categories: Array.isArray(post.categories) ? post.categories : [],
    tags: Array.isArray(post.tags) ? post.tags : [],
    language: post.language || detectLanguage(post),
    status: normalizeStatus(post.status),
    published_at: normalizeDate(post.date),
    reading_time_minutes: estimateReadingTime(excerpt || content),
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

  const url = new URL(`${supabaseUrl}/rest/v1/posts`);
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
  const args = parseArgs(process.argv.slice(2));

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
    process.exit(1);
  }

  const inputPath = path.resolve(process.cwd(), args.input);
  const raw = await fs.readFile(inputPath, "utf8");
  const posts = JSON.parse(raw);

  const normalized = posts
    .filter((post) => post && post.slug)
    .map(toSupabasePost);

  const limited = args.limit ? normalized.slice(0, args.limit) : normalized;
  const batches = chunk(limited, args.batchSize);

  let inserted = 0;
  let failed = 0;

  for (let index = 0; index < batches.length; index += 1) {
    const batch = batches[index];
    const result = await migrateBatch({ supabaseUrl, serviceRoleKey, batch, dryRun: args.dryRun });

    if (result.ok) {
      inserted += batch.length;
      console.log(`Batch ${index + 1}/${batches.length} migrated (${batch.length} posts).`);
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
