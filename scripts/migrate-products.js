import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DEFAULT_INPUT = "legacy-wordpress/content/products.json";
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

const toSupabaseProduct = (product) => {
  const seo = product.seo || null;
  const price = Number(product.price ?? 0);
  const salePrice = product.sale_price != null ? Number(product.sale_price) : null;

  return {
    woocommerce_id: product.woocommerce_id || product.id || null,
    slug: product.slug || "",
    name: product.title || "Untitled",
    description: product.description || "",
    short_description: product.short_description || null,
    price,
    sale_price: salePrice,
    currency: product.currency || "EUR",
    product_type: product.product_type || "simple",
    is_digital: Boolean(product.is_digital || product.product_type === "downloadable"),
    featured_image_url: product.featured_image_url || null,
    gallery_image_urls: product.gallery_images || [],
    categories: product.categories || [],
    tags: product.tags || [],
    stock_status: product.stock_status || "instock",
    stock_quantity: product.stock_quantity || null,
    meta_title: seo?.title || null,
    meta_description: seo?.description || null,
    seo: seo && Object.values(seo).some(Boolean) ? seo : null,
    woocommerce_url: product.link || product.checkout_url || null,
    last_synced_at: new Date().toISOString(),
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

  const url = new URL(`${supabaseUrl}/rest/v1/products`);
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
  const products = JSON.parse(raw);

  const normalized = products
    .filter((product) => product && product.slug)
    .map(toSupabaseProduct);

  const limited = args.limit ? normalized.slice(0, args.limit) : normalized;
  const batches = chunk(limited, args.batchSize);

  let inserted = 0;
  let failed = 0;

  for (let index = 0; index < batches.length; index += 1) {
    const batch = batches[index];
    const result = await migrateBatch({ supabaseUrl, serviceRoleKey, batch, dryRun: args.dryRun });

    if (result.ok) {
      inserted += batch.length;
      console.log(`Batch ${index + 1}/${batches.length} migrated (${batch.length} products).`);
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
