#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DEFAULT_MODEL = "gemini-2.5-flash";
const DEFAULT_DELAY_MS = 250;
const MAX_RETRIES = 3;

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
    // Ignore missing env file.
  }
};

const parseArgs = (argv) => {
  const args = {
    scope: "posts,pages,products",
    limit: null,
    model: null,
    delay: DEFAULT_DELAY_MS,
    dryRun: false,
    push: false,
  };

  argv.forEach((arg, index) => {
    if (arg === "--dry-run") {
      args.dryRun = true;
    }
    if (arg === "--push") {
      args.push = true;
    }
    if (arg === "--scope" && argv[index + 1]) {
      args.scope = argv[index + 1];
    }
    if (arg.startsWith("--scope=")) {
      args.scope = arg.split("=")[1];
    }
    if (arg === "--limit" && argv[index + 1]) {
      args.limit = Number.parseInt(argv[index + 1], 10) || null;
    }
    if (arg.startsWith("--limit=")) {
      args.limit = Number.parseInt(arg.split("=")[1], 10) || null;
    }
    if (arg === "--model" && argv[index + 1]) {
      args.model = argv[index + 1];
    }
    if (arg.startsWith("--model=")) {
      args.model = arg.split("=")[1];
    }
    if (arg === "--delay" && argv[index + 1]) {
      args.delay = Number.parseInt(argv[index + 1], 10) || DEFAULT_DELAY_MS;
    }
    if (arg.startsWith("--delay=")) {
      args.delay = Number.parseInt(arg.split("=")[1], 10) || DEFAULT_DELAY_MS;
    }
  });

  return args;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const stripHtml = (value) => String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const truncate = (value, max = 2000) => {
  if (!value) return "";
  return value.length > max ? value.slice(0, max).trim() : value;
};

const clampLength = (value, max) => {
  if (!value) return "";
  const trimmed = value.trim();
  return trimmed.length > max ? trimmed.slice(0, max - 1).trim() : trimmed;
};

const safeJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
};

const buildPrompt = ({ type, title, excerpt, content, categories }) => {
  return `You are an SEO assistant. Generate SEO metadata for a ${type}.

Rules:
- Output valid JSON only.
- Preserve the content language.
- Title: 50-60 chars. Description: 140-160 chars.
- Avoid quotes unless needed.

Return JSON with keys:
{"title":"", "description":"", "og_title":"", "og_description":"", "twitter_title":"", "twitter_description":"", "focus_keyword":""}

Context:
Title: ${title}
Categories: ${categories?.join(", ") || ""}
Excerpt: ${excerpt}
Content: ${content}
`;
};

const normalizeModel = (model) => model.replace(/^models\//, "");

const callGemini = async ({ apiKey, model, prompt }) => {
  const normalizedModel = normalizeModel(model);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${normalizedModel}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 256,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(`Gemini error (${response.status}): ${errorText}`);
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return safeJsonParse(text);
};

const callGeminiWithRetry = async ({ apiKey, model, prompt }) => {
  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    try {
      return await callGemini({ apiKey, model, prompt });
    } catch (error) {
      const status = error?.status || 0;
      if (status === 429) {
        const delay = 15000 + attempt * 5000;
        console.warn(`Rate limit hit. Retrying in ${delay / 1000}s...`);
        await sleep(delay);
        attempt += 1;
        continue;
      }
      throw error;
    }
  }
  throw new Error("Gemini error: retries exhausted");
};

const mergeSeo = (existing, generated, fallback) => {
  const merged = {
    title: existing?.title || generated?.title || fallback.title,
    description: existing?.description || generated?.description || fallback.description,
    og_title: existing?.og_title || generated?.og_title || generated?.title || fallback.title,
    og_description: existing?.og_description || generated?.og_description || generated?.description || fallback.description,
    twitter_title: existing?.twitter_title || generated?.twitter_title || generated?.title || fallback.title,
    twitter_description: existing?.twitter_description || generated?.twitter_description || generated?.description || fallback.description,
    focus_keyword: existing?.focus_keyword || generated?.focus_keyword || "",
  };

  return {
    ...existing,
    ...merged,
    title: clampLength(merged.title, 60),
    description: clampLength(merged.description, 160),
    og_title: clampLength(merged.og_title, 70),
    og_description: clampLength(merged.og_description, 160),
    twitter_title: clampLength(merged.twitter_title, 70),
    twitter_description: clampLength(merged.twitter_description, 160),
  };
};

const needsSeo = (seo = {}) => !seo.title || !seo.description;

const CONTENT_DIR = path.join(process.cwd(), "legacy-wordpress", "content");

const loadJson = async (filename) => {
  const filePath = path.join(CONTENT_DIR, filename);
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
};

const saveJson = async (filename, data) => {
  const filePath = path.join(CONTENT_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
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

const generateForPosts = async ({ apiKey, model, delay, limit }) => {
  const posts = await loadJson("posts.json");
  let processed = 0;

  for (const post of posts) {
    if (!needsSeo(post.seo)) {
      continue;
    }
    if (limit && processed >= limit) {
      break;
    }

    const excerpt = stripHtml(post.excerpt || post.content || "");
    const content = truncate(stripHtml(post.content || ""), 2000);
    const prompt = buildPrompt({
      type: "blog post",
      title: post.title || "Untitled",
      excerpt: truncate(excerpt, 300),
      content,
      categories: post.categories || [],
    });

    const generated = await callGeminiWithRetry({ apiKey, model, prompt });
    const fallback = {
      title: post.title || "Untitled",
      description: excerpt.slice(0, 160),
    };

    post.seo = mergeSeo(post.seo || {}, generated || {}, fallback);
    processed += 1;
    console.log(`[posts] ${post.slug || post.id}: SEO generated`);
    await saveJson("posts.json", posts);
    await sleep(delay);
  }

  return processed;
};

const generateForPages = async ({ apiKey, model, delay, limit }) => {
  const pages = await loadJson("pages.json");
  let processed = 0;

  for (const page of pages) {
    const fallbackSeo = mapYoastMeta(page.meta || {});
    const existing = page.seo || fallbackSeo;
    if (!needsSeo(existing)) {
      page.seo = existing;
      continue;
    }
    if (limit && processed >= limit) {
      break;
    }

    const excerpt = stripHtml(page.excerpt || page.content || "");
    const content = truncate(stripHtml(page.content || ""), 2000);
    const prompt = buildPrompt({
      type: "page",
      title: page.title || "Untitled",
      excerpt: truncate(excerpt, 300),
      content,
      categories: page.categories || [],
    });

    const generated = await callGeminiWithRetry({ apiKey, model, prompt });
    const fallbackDescription =
      excerpt.slice(0, 160) ||
      `Learn more about ${page.title || "this page"} on Periospot.`;
    const fallback = {
      title: page.title || "Untitled",
      description: fallbackDescription,
    };

    page.seo = mergeSeo(existing || {}, generated || {}, fallback);
    processed += 1;
    console.log(`[pages] ${page.post_name || page.id}: SEO generated`);
    await saveJson("pages.json", pages);
    await sleep(delay);
  }

  return processed;
};

const generateForProducts = async ({ apiKey, model, delay, limit }) => {
  const products = await loadJson("products.json");
  let processed = 0;

  for (const product of products) {
    if (!needsSeo(product.seo)) {
      continue;
    }
    if (limit && processed >= limit) {
      break;
    }

    const excerpt = stripHtml(product.description || "");
    const content = truncate(stripHtml(product.description || ""), 2000);
    const prompt = buildPrompt({
      type: "product",
      title: product.title || "Untitled",
      excerpt: truncate(excerpt, 300),
      content,
      categories: product.product_type ? [product.product_type] : [],
    });

    const generated = await callGeminiWithRetry({ apiKey, model, prompt });
    const fallback = {
      title: product.title || "Untitled",
      description: excerpt.slice(0, 160),
    };

    product.seo = mergeSeo(product.seo || {}, generated || {}, fallback);
    processed += 1;
    console.log(`[products] ${product.slug || product.id}: SEO generated`);
    await saveJson("products.json", products);
    await sleep(delay);
  }

  return processed;
};

const main = async () => {
  await loadEnvFile(path.resolve(process.cwd(), ".env"));
  await loadEnvFile(path.resolve(process.cwd(), ".env.local"));

  const args = parseArgs(process.argv.slice(2));
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Missing GOOGLE_GEMINI_API_KEY in environment.");
    process.exit(1);
  }

  const model = args.model || process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const scope = args.scope.split(",").map((s) => s.trim()).filter(Boolean);

  let total = 0;
  if (scope.includes("posts")) {
    total += await generateForPosts({ apiKey, model, delay: args.delay, limit: args.limit });
  }
  if (scope.includes("pages")) {
    total += await generateForPages({ apiKey, model, delay: args.delay, limit: args.limit });
  }
  if (scope.includes("products")) {
    total += await generateForProducts({ apiKey, model, delay: args.delay, limit: args.limit });
  }

  console.log(`SEO generation complete. Items updated: ${total}`);

  if (!args.push) {
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for push.");
    process.exit(1);
  }

  const scripts = [];
  if (scope.includes("posts")) scripts.push("node scripts/migrate-posts.js");
  if (scope.includes("pages")) scripts.push("node scripts/migrate-pages.js");
  if (scope.includes("products")) scripts.push("node scripts/migrate-products.js");

  for (const cmd of scripts) {
    console.log(`Running: ${cmd}`);
    const { execSync } = await import("node:child_process");
    execSync(cmd, { stdio: "inherit" });
  }
};

main().catch((error) => {
  console.error("SEO generation failed:", error.message || error);
  process.exit(1);
});
