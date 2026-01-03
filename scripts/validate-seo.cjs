#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const flags = {
  strict: args.includes('--strict'),
  warnOnly: args.includes('--warn-only'),
};

const scopeFlag = args.find((arg) => arg.startsWith('--scope='));
const scope = scopeFlag ? scopeFlag.split('=')[1] : 'all';
const scopes = scope === 'all' ? ['posts', 'pages', 'products'] : scope.split(',');

const rootDir = process.cwd();
const contentDir = path.join(rootDir, 'legacy-wordpress', 'content');

const loadJson = (filename) => {
  const filePath = path.join(contentDir, filename);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  if (!raw.trim()) {
    return [];
  }
  return JSON.parse(raw);
};

const stripHtml = (value) => String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const mapYoastMeta = (meta = {}) => ({
  title: meta['_yoast_wpseo_title'] || '',
  description: meta['_yoast_wpseo_metadesc'] || '',
  focus_keyword: meta['_yoast_wpseo_focuskw'] || '',
  canonical: meta['_yoast_wpseo_canonical'] || '',
  og_title: meta['_yoast_wpseo_opengraph-title'] || '',
  og_description: meta['_yoast_wpseo_opengraph-description'] || '',
  og_image: meta['_yoast_wpseo_opengraph-image'] || '',
  twitter_title: meta['_yoast_wpseo_twitter-title'] || '',
  twitter_description: meta['_yoast_wpseo_twitter-description'] || '',
  twitter_image: meta['_yoast_wpseo_twitter-image'] || '',
  meta_robots: meta['_yoast_wpseo_meta-robots'] || '',
  meta_robots_noindex: meta['_yoast_wpseo_meta-robots-noindex'] || '',
  meta_robots_nofollow: meta['_yoast_wpseo_meta-robots-nofollow'] || '',
  meta_robots_adv: meta['_yoast_wpseo_meta-robots-adv'] || '',
});

const summarizeMissing = (items, label, getKey) => {
  const missing = items.filter((item) => !getKey(item));
  return { missing, count: missing.length, label };
};

const validatePosts = () => {
  const posts = loadJson('posts.json') || [];
  const published = posts.filter((post) => (post.status || 'publish') === 'publish');
  const withSeo = published.map((post) => ({
    id: post.slug || post.id,
    title: post.title || 'Untitled',
    seo: post.seo || {},
    featured_image: post.featured_image || '',
    excerpt: stripHtml(post.excerpt || post.content || ''),
  }));

  const titleMissing = summarizeMissing(withSeo, 'meta title', (item) => item.seo.title);
  const descMissing = summarizeMissing(withSeo, 'meta description', (item) => item.seo.description);
  const ogImageMissing = summarizeMissing(withSeo, 'og:image', (item) => item.seo.og_image || item.featured_image);

  return {
    label: 'posts',
    total: withSeo.length,
    missing: [titleMissing, descMissing, ogImageMissing],
  };
};

const validatePages = () => {
  const pages = loadJson('pages.json') || [];
  const withSeo = pages.map((page) => {
    const seo = page.seo || mapYoastMeta(page.meta || {});
    return {
      id: page.post_name || page.id,
      title: page.title || 'Untitled',
      seo,
      excerpt: stripHtml(page.excerpt || page.content || ''),
    };
  });

  const titleMissing = summarizeMissing(withSeo, 'meta title', (item) => item.seo.title);
  const descMissing = summarizeMissing(withSeo, 'meta description', (item) => item.seo.description);
  const ogImageMissing = summarizeMissing(withSeo, 'og:image', (item) => item.seo.og_image);

  return {
    label: 'pages',
    total: withSeo.length,
    missing: [titleMissing, descMissing, ogImageMissing],
  };
};

const validateProducts = () => {
  const products = loadJson('products.json') || [];
  const withSeo = products.map((product) => ({
    id: product.slug || product.id,
    title: product.title || 'Untitled',
    seo: product.seo || {},
    featured_image: product.featured_image_url || '',
    excerpt: stripHtml(product.description || ''),
  }));

  const titleMissing = summarizeMissing(withSeo, 'meta title', (item) => item.seo.title);
  const descMissing = summarizeMissing(withSeo, 'meta description', (item) => item.seo.description);
  const ogImageMissing = summarizeMissing(withSeo, 'og:image', (item) => item.seo.og_image || item.featured_image);

  return {
    label: 'products',
    total: withSeo.length,
    missing: [titleMissing, descMissing, ogImageMissing],
  };
};

const validators = {
  posts: validatePosts,
  pages: validatePages,
  products: validateProducts,
};

const results = scopes
  .filter((scopeName) => validators[scopeName])
  .map((scopeName) => validators[scopeName]());

let totalIssues = 0;
console.log('SEO Validation Report');
console.log('======================');
console.log(`Scopes: ${scopes.join(', ')}`);
console.log(`Mode: ${flags.strict ? 'strict' : 'warn-only'}`);
console.log('');

for (const result of results) {
  console.log(`${result.label.toUpperCase()}: ${result.total} items`);
  result.missing.forEach((entry) => {
    totalIssues += entry.count;
    console.log(`- Missing ${entry.label}: ${entry.count}`);
    if (entry.count > 0) {
      const examples = entry.missing.slice(0, 5).map((item) => item.title).join(' | ');
      console.log(`  e.g. ${examples}`);
    }
  });
  console.log('');
}

if (totalIssues > 0 && flags.strict && !flags.warnOnly) {
  console.error(`SEO validation failed with ${totalIssues} missing fields.`);
  process.exit(1);
}

console.log(`SEO validation completed. Missing fields: ${totalIssues}`);
