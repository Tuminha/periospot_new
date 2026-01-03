import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { randomUUID } from "node:crypto";

const DEFAULT_INPUT = "legacy-wordpress/content/comments.json";
const DEFAULT_BATCH_SIZE = 50;

const loadEnvFile = async (envPath) => {
  try {
    const raw = await fs.readFile(envPath, "utf8");
    raw.split(/\r?\n/).forEach((line) => {
      if (!line || line.trim().startsWith("#")) {
        return;
      }
      const [key, ...rest] = line.split("=");
      if (!key || process.env[key]) {
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
  if (normalized === "approved" || normalized === "publish" || normalized === "1") {
    return "approved";
  }
  if (normalized === "spam") {
    return "spam";
  }
  if (normalized === "deleted" || normalized === "trash") {
    return "deleted";
  }
  return "pending";
};

const normalizeDate = (value) => {
  if (!value) return null;
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
};

const chunk = (items, size) => {
  const batches = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
};

const fetchAllPosts = async ({ supabaseUrl, serviceRoleKey }) => {
  const posts = [];
  const limit = 1000;
  let offset = 0;

  while (true) {
    const url = new URL(`${supabaseUrl}/rest/v1/posts`);
    url.searchParams.set("select", "id,wordpress_id,slug");
    url.searchParams.set("order", "id");
    url.searchParams.set("limit", limit.toString());
    url.searchParams.set("offset", offset.toString());

    const response = await fetch(url.toString(), {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch posts: ${errorText}`);
    }

    const batch = await response.json();
    if (!Array.isArray(batch) || batch.length === 0) {
      break;
    }

    posts.push(...batch);
    if (batch.length < limit) {
      break;
    }
    offset += limit;
  }

  return posts;
};

const buildLookups = (posts) => {
  const byWordpressId = new Map();
  const bySlug = new Map();

  posts.forEach((post) => {
    if (post.wordpress_id) {
      byWordpressId.set(Number(post.wordpress_id), post);
    }
    if (post.slug) {
      bySlug.set(post.slug, post);
    }
  });

  return { byWordpressId, bySlug };
};

const toSupabaseComments = (rawComments, lookups) => {
  const legacyIdMap = new Map();

  rawComments.forEach((comment) => {
    const legacyId = Number.parseInt(comment.legacy_comment_id, 10);
    if (!Number.isNaN(legacyId)) {
      legacyIdMap.set(legacyId, randomUUID());
    }
  });

  const records = [];
  const skipped = [];

  rawComments.forEach((comment) => {
    const legacyId = Number.parseInt(comment.legacy_comment_id, 10);
    const postWordpressId = Number.parseInt(comment.wordpress_post_id, 10);
    const post = lookups.byWordpressId.get(postWordpressId) || lookups.bySlug.get(comment.post_slug);
    if (!post) {
      skipped.push({ legacy_comment_id: comment.legacy_comment_id, post_slug: comment.post_slug });
      return;
    }

    const parentLegacyId = Number.parseInt(comment.parent_legacy_id, 10);
    const parentId = Number.isNaN(parentLegacyId) ? null : legacyIdMap.get(parentLegacyId) || null;

    records.push({
      id: Number.isNaN(legacyId) ? randomUUID() : legacyIdMap.get(legacyId),
      post_id: post.id,
      post_slug: comment.post_slug || post.slug,
      wordpress_post_id: Number.isNaN(postWordpressId) ? null : postWordpressId,
      parent_id: parentId,
      author_name: comment.author_name || null,
      author_email: comment.author_email || null,
      author_url: comment.author_url || null,
      content: comment.content || "",
      status: normalizeStatus(comment.status),
      is_legacy: true,
      legacy_comment_id: Number.isNaN(legacyId) ? null : legacyId,
      ip_address: comment.ip_address || null,
      user_agent: comment.user_agent || null,
      approved_at: normalizeDate(comment.approved_at),
      created_at: normalizeDate(comment.created_at) || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  });

  return { records, skipped };
};

const migrateBatch = async ({ supabaseUrl, serviceRoleKey, batch, dryRun }) => {
  if (dryRun) {
    return { ok: true };
  }

  const url = new URL(`${supabaseUrl}/rest/v1/comments`);
  url.searchParams.set("on_conflict", "legacy_comment_id");

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
  const comments = JSON.parse(raw);

  const posts = await fetchAllPosts({ supabaseUrl, serviceRoleKey });
  const lookups = buildLookups(posts);
  const { records, skipped } = toSupabaseComments(comments, lookups);

  const limited = args.limit ? records.slice(0, args.limit) : records;
  const batches = chunk(limited, args.batchSize);

  let inserted = 0;
  let failed = 0;

  for (let index = 0; index < batches.length; index += 1) {
    const batch = batches[index];
    const result = await migrateBatch({ supabaseUrl, serviceRoleKey, batch, dryRun: args.dryRun });

    if (result.ok) {
      inserted += batch.length;
      console.log(`Batch ${index + 1}/${batches.length} migrated (${batch.length} comments).`);
    } else {
      failed += batch.length;
      console.error(`Batch ${index + 1} failed: ${result.error}`);
    }
  }

  if (skipped.length > 0) {
    console.warn(`Skipped ${skipped.length} comments due to missing posts.`);
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
