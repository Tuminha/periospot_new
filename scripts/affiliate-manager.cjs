/**
 * Periospot Affiliate Link Manager
 *
 * Combined tool for managing affiliate links:
 * 1. Creates Genius Links from Amazon URLs
 * 2. Saves affiliate links to Tana
 * 3. Generates markdown for blog posts
 *
 * Usage:
 *   node scripts/affiliate-manager.cjs create-link "Product Name" "https://amazon.com/dp/..." "books"
 *   node scripts/affiliate-manager.cjs from-asin "Product Name" "B08N5WRWNW" "equipment"
 *   node scripts/affiliate-manager.cjs markdown "https://geni.us/xxx" "Product Name"
 */

const { createGeniusLink, createDentalAffiliateLink, GENIUSLINK_CONFIG } = require('./geniuslink-api.cjs');
const { createAffiliateLink, TANA_CONFIG } = require('./tana-api.cjs');

/**
 * Create affiliate link and save to Tana
 *
 * @param {string} name - Product name
 * @param {string} url - Original URL (Amazon, etc.)
 * @param {string} category - Category (books, equipment, courses, etc.)
 * @param {boolean} saveToTana - Whether to save to Tana
 * @returns {Promise<object>} - The created link info
 */
async function createAndSaveAffiliateLink(name, url, category = 'general', saveToTana = true) {
  console.log(`\nCreating Genius Link for: ${name}`);
  console.log(`Original URL: ${url}`);

  // 1. Create Genius Link
  const geniusResult = await createGeniusLink(url);

  if (!geniusResult.success) {
    throw new Error(`Failed to create Genius Link: ${JSON.stringify(geniusResult.error)}`);
  }

  console.log(`✅ Genius Link created: ${geniusResult.shortUrl}`);

  // 2. Save to Tana (if enabled)
  let tanaResult = null;
  if (saveToTana) {
    console.log('Saving to Tana...');
    tanaResult = await createAffiliateLink({
      name: name,
      url: geniusResult.shortUrl,
      platform: 'geniuslink',
      category: category,
      notes: `Original: ${url}`
    });
    console.log('✅ Saved to Tana');
  }

  // 3. Generate markdown
  const markdown = generateMarkdown(name, geniusResult.shortUrl, category);

  return {
    name,
    originalUrl: url,
    taggedUrl: geniusResult.taggedUrl,
    geniusLink: geniusResult.shortUrl,
    code: geniusResult.code,
    category,
    tanaNodeId: tanaResult?.children?.[0]?.nodeId || null,
    markdown
  };
}

/**
 * Create affiliate link from Amazon ASIN
 */
async function createFromASIN(name, asin, category = 'general', saveToTana = true) {
  const amazonUrl = `https://www.amazon.com/dp/${asin}`;
  return createAndSaveAffiliateLink(name, amazonUrl, category, saveToTana);
}

/**
 * Generate markdown for use in blog posts
 */
function generateMarkdown(name, url, category) {
  const templates = {
    books: `[${name}](${url}) *(affiliate link)*`,
    equipment: `**Recommended:** [${name}](${url})`,
    courses: `[Enroll in ${name}](${url})`,
    instruments: `[${name} - View on Amazon](${url})`,
    software: `[Try ${name}](${url})`,
    general: `[${name}](${url})`
  };

  return templates[category] || templates.general;
}

/**
 * Generate product box HTML for blog posts
 */
function generateProductBox(name, url, description, imageUrl = null) {
  return `
<div class="affiliate-product-box">
  ${imageUrl ? `<img src="${imageUrl}" alt="${name}" />` : ''}
  <div class="product-info">
    <h4>${name}</h4>
    <p>${description}</p>
    <a href="${url}" class="btn" target="_blank" rel="noopener sponsored">
      View on Amazon
    </a>
  </div>
</div>
<p class="disclosure"><em>Affiliate link - we may earn a commission</em></p>
`;
}

/**
 * Batch process multiple products
 */
async function batchProcess(products) {
  const results = [];

  for (const product of products) {
    try {
      const result = await createAndSaveAffiliateLink(
        product.name,
        product.url,
        product.category,
        product.saveToTana !== false
      );
      results.push({ success: true, ...result });
      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      results.push({ success: false, name: product.name, error: error.message });
    }
  }

  return results;
}

/**
 * Common dental products for quick creation
 * VERIFIED ASINs - January 2026
 */
const COMMON_PRODUCTS = {
  // Dental Books (Verified)
  'lindhe': { asin: '1119438888', name: "Lindhe's Clinical Periodontology 7th Ed", category: 'books' },
  'lindhe-kindle': { asin: 'B09BHKRX4S', name: "Lindhe's Clinical Periodontology (Kindle)", category: 'books' },
  'misch': { asin: '0323078273', name: 'Dental Implant Prosthetics (Misch)', category: 'books' },
  'good-to-great': { asin: '0066620996', name: 'Good to Great (Jim Collins)', category: 'books' },

  // Dental Equipment (Verified)
  'dental-loupe-35': { asin: 'B09NNGPRQ3', name: 'Dental Loupes 3.5x with LED Light', category: 'equipment' },
  'dental-loupe-25': { asin: 'B08XYQJ6RQ', name: 'Dental Surgical Loupes 2.5x', category: 'equipment' },

  // Photography (Verified)
  'canon-r5': { asin: 'B08C63HQMX', name: 'Canon EOS R5 Full Frame Mirrorless', category: 'equipment' },
  'canon-100mm-macro': { asin: 'B002NEGTSI', name: 'Canon EF 100mm f/2.8L Macro IS USM', category: 'equipment' },
  'ring-flash': { asin: 'B001CCAISE', name: 'Canon MR-14EX II Macro Ring Lite', category: 'equipment' },

  // Business Books for Dentists
  'e-myth': { asin: '0887307280', name: 'The E-Myth Revisited', category: 'books' },
  'atomic-habits': { asin: '0735211299', name: 'Atomic Habits', category: 'books' }
};

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'create-link':
      if (!args[1] || !args[2]) {
        console.log('Usage: node affiliate-manager.cjs create-link "Name" "URL" [category]');
        process.exit(1);
      }
      const createResult = await createAndSaveAffiliateLink(args[1], args[2], args[3] || 'general');
      console.log('\n=== Affiliate Link Created ===');
      console.log(JSON.stringify(createResult, null, 2));
      console.log('\n📋 Copy this markdown:\n');
      console.log(createResult.markdown);
      break;

    case 'from-asin':
      if (!args[1] || !args[2]) {
        console.log('Usage: node affiliate-manager.cjs from-asin "Name" "ASIN" [category]');
        process.exit(1);
      }
      const asinResult = await createFromASIN(args[1], args[2], args[3] || 'general');
      console.log('\n=== Affiliate Link Created ===');
      console.log(JSON.stringify(asinResult, null, 2));
      console.log('\n📋 Copy this markdown:\n');
      console.log(asinResult.markdown);
      break;

    case 'quick':
      if (!args[1]) {
        console.log('Available quick products:');
        Object.entries(COMMON_PRODUCTS).forEach(([key, prod]) => {
          console.log(`  ${key}: ${prod.name}`);
        });
        process.exit(0);
      }
      const quickProd = COMMON_PRODUCTS[args[1]];
      if (!quickProd) {
        console.log(`Unknown product: ${args[1]}`);
        process.exit(1);
      }
      const quickResult = await createFromASIN(quickProd.name, quickProd.asin, quickProd.category);
      console.log('\n=== Quick Affiliate Link ===');
      console.log('Genius Link:', quickResult.geniusLink);
      console.log('Markdown:', quickResult.markdown);
      break;

    case 'markdown':
      if (!args[1] || !args[2]) {
        console.log('Usage: node affiliate-manager.cjs markdown "URL" "Name" [category]');
        process.exit(1);
      }
      const md = generateMarkdown(args[2], args[1], args[3] || 'general');
      console.log('\n📋 Markdown:\n');
      console.log(md);
      break;

    case 'product-box':
      if (!args[1] || !args[2] || !args[3]) {
        console.log('Usage: node affiliate-manager.cjs product-box "URL" "Name" "Description" [imageUrl]');
        process.exit(1);
      }
      const html = generateProductBox(args[2], args[1], args[3], args[4]);
      console.log('\n📋 HTML:\n');
      console.log(html);
      break;

    default:
      console.log(`
Periospot Affiliate Link Manager
=================================

Commands:
  create-link <name> <url> [category]       Create link from any URL
  from-asin <name> <asin> [category]        Create link from Amazon ASIN
  quick <product-key>                       Use pre-defined product
  markdown <url> <name> [category]          Generate markdown only
  product-box <url> <name> <desc> [img]     Generate HTML product box

Categories: books, equipment, courses, instruments, software, materials

Examples:
  node affiliate-manager.cjs create-link "Lindhe Periodontology" "https://amazon.com/dp/123" books
  node affiliate-manager.cjs from-asin "Dental Loupes" "B07QXMZF1Y" equipment
  node affiliate-manager.cjs quick misch-implant

Configuration:
  Amazon Tag: ${GENIUSLINK_CONFIG.amazonTag}
  Genius Link Group: ${GENIUSLINK_CONFIG.defaultGroupId}
  Tana Supertag: ${TANA_CONFIG.affiliateLinksSupertagId || '(not configured)'}

📚 Documentation: .claude/docs/MONETIZATION.md
      `);
  }
}

// Export for use as module
module.exports = {
  createAndSaveAffiliateLink,
  createFromASIN,
  generateMarkdown,
  generateProductBox,
  batchProcess,
  COMMON_PRODUCTS
};

// Run CLI if called directly
if (require.main === module) {
  main().catch(console.error);
}
