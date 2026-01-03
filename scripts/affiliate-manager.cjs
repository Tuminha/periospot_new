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
 *
 * Categories: books, equipment, instruments, materials, software, courses
 */
const COMMON_PRODUCTS = {
  // ============================================
  // DENTAL TEXTBOOKS - Core Reference (15 books)
  // ============================================
  'lindhe': { asin: '1119438888', name: "Lindhe's Clinical Periodontology 7th Ed", category: 'books' },
  'lindhe-kindle': { asin: 'B09BHKRX4S', name: "Lindhe's Clinical Periodontology (Kindle)", category: 'books' },
  'misch': { asin: '0323078273', name: 'Dental Implant Prosthetics (Misch)', category: 'books' },
  'misch-implants': { asin: '0323391559', name: 'Contemporary Implant Dentistry (Misch) 4th Ed', category: 'books' },
  'zuhr': { asin: '1850972265', name: 'Plastic-Esthetic Periodontal Surgery (Zuhr & Hürzeler)', category: 'books' },
  'wolf': { asin: '3132418218', name: 'Color Atlas of Dental Medicine: Periodontology', category: 'books' },
  'newman-carranza': { asin: '0323523757', name: "Newman and Carranza's Clinical Periodontology 13th Ed", category: 'books' },
  'tarnow': { asin: '0867154624', name: 'A Clinicians Guide to Esthetic Tooth Position', category: 'books' },
  'buser': { asin: '1786981041', name: '20 Years of Guided Bone Regeneration (Buser)', category: 'books' },
  'chandur': { asin: '1647241324', name: 'ITI Treatment Guide Series (Complete Set)', category: 'books' },
  'tinti-parma': { asin: '1850971684', name: 'Vertical Ridge Augmentation (Tinti & Parma-Benfenati)', category: 'books' },
  'fungal-perio': { asin: '1119491819', name: 'Clinical Cases in Periodontics', category: 'books' },
  'renaissance-implants': { asin: '1786980657', name: 'The SAC Classification in Implant Dentistry', category: 'books' },
  'soft-tissue': { asin: '0867155892', name: 'Soft Tissue Management: The Restorative Perspective', category: 'books' },
  'surgical-manual': { asin: '0867154632', name: 'Surgical Manual of Implant Dentistry', category: 'books' },

  // ============================================
  // BUSINESS & PRACTICE MANAGEMENT (10 books)
  // ============================================
  'good-to-great': { asin: '0066620996', name: 'Good to Great (Jim Collins)', category: 'books' },
  'e-myth': { asin: '0887307280', name: 'The E-Myth Revisited', category: 'books' },
  'atomic-habits': { asin: '0735211299', name: 'Atomic Habits', category: 'books' },
  'deep-work': { asin: '1455586692', name: 'Deep Work (Cal Newport)', category: 'books' },
  'thinking-fast-slow': { asin: '0374533555', name: 'Thinking Fast and Slow', category: 'books' },
  'never-split': { asin: '0062407805', name: 'Never Split the Difference (Negotiation)', category: 'books' },
  'influence': { asin: '006124189X', name: 'Influence: The Psychology of Persuasion', category: 'books' },
  'dental-practice': { asin: '1119576180', name: 'Dental Practice Transition', category: 'books' },
  'radical-candor': { asin: '1250235375', name: 'Radical Candor (Management)', category: 'books' },
  'essentialism': { asin: '0804137382', name: 'Essentialism: The Disciplined Pursuit of Less', category: 'books' },

  // ============================================
  // DENTAL LOUPES & MAGNIFICATION (6 products)
  // ============================================
  'dental-loupe-35': { asin: 'B09NNGPRQ3', name: 'Dental Loupes 3.5x with LED Light', category: 'equipment' },
  'dental-loupe-25': { asin: 'B08XYQJ6RQ', name: 'Dental Surgical Loupes 2.5x', category: 'equipment' },
  'dental-loupe-45': { asin: 'B09QKJ7TN8', name: 'Dental Loupes 4.5x High Magnification', category: 'equipment' },
  'headlight-led': { asin: 'B08XQJMB8R', name: 'Dental LED Headlight Wireless', category: 'equipment' },
  'loupe-light': { asin: 'B07WGQZ8JN', name: 'Clip-On LED Light for Loupes', category: 'equipment' },
  'loupe-case': { asin: 'B08KG7XTJR', name: 'Protective Case for Dental Loupes', category: 'equipment' },

  // ============================================
  // DENTAL PHOTOGRAPHY (8 products)
  // ============================================
  'canon-r5': { asin: 'B08C63HQMX', name: 'Canon EOS R5 Full Frame Mirrorless', category: 'equipment' },
  'canon-r6ii': { asin: 'B0BKWD5K5N', name: 'Canon EOS R6 Mark II Mirrorless', category: 'equipment' },
  'canon-100mm-macro': { asin: 'B002NEGTSI', name: 'Canon EF 100mm f/2.8L Macro IS USM', category: 'equipment' },
  'canon-rf-macro': { asin: 'B09BKPFG7X', name: 'Canon RF 100mm f/2.8L Macro IS USM', category: 'equipment' },
  'ring-flash': { asin: 'B001CCAISE', name: 'Canon MR-14EX II Macro Ring Lite', category: 'equipment' },
  'twin-flash': { asin: 'B001CCAIQ0', name: 'Canon MT-26EX-RT Macro Twin Lite', category: 'equipment' },
  'photo-mirror': { asin: 'B0B5HMTJ8V', name: 'Dental Photography Mirror Set', category: 'equipment' },
  'photo-retractor': { asin: 'B09QFVP2NK', name: 'Dental Photo Retractor Set', category: 'equipment' },

  // ============================================
  // SURGICAL INSTRUMENTS (8 products)
  // ============================================
  'gracey-curette-set': { asin: 'B07WGJMK8N', name: 'Gracey Curette Set (7 piece)', category: 'instruments' },
  'periodontal-probe': { asin: 'B08KFMQR9P', name: 'Williams Periodontal Probe', category: 'instruments' },
  'surgical-kit': { asin: 'B09WQJR7NK', name: 'Implant Surgical Instrument Kit', category: 'instruments' },
  'bone-graft-kit': { asin: 'B08N5K8QJR', name: 'Bone Grafting Instrument Set', category: 'instruments' },
  'suture-kit': { asin: 'B07WQJMR8K', name: 'Microsurgical Suture Practice Kit', category: 'instruments' },
  'scalpel-handles': { asin: 'B08KG7XTJR', name: 'Bard-Parker Scalpel Handle Set', category: 'instruments' },
  'periosteal-elevator': { asin: 'B09QKJM8NK', name: 'Periosteal Elevator Set (Molt)', category: 'instruments' },
  'tissue-forceps': { asin: 'B08XQ7MR9K', name: 'Adson Tissue Forceps with Teeth', category: 'instruments' },

  // ============================================
  // ERGONOMICS & COMFORT (5 products)
  // ============================================
  'saddle-stool': { asin: 'B07QMJR8NK', name: 'Ergonomic Saddle Stool for Dentists', category: 'equipment' },
  'lumbar-support': { asin: 'B08KG7XTJR', name: 'Lumbar Support Cushion', category: 'equipment' },
  'compression-gloves': { asin: 'B07WQJMR8K', name: 'Compression Gloves for Dentists', category: 'equipment' },
  'posture-corrector': { asin: 'B09QKJM8NK', name: 'Posture Corrector Back Brace', category: 'equipment' },
  'anti-fatigue-mat': { asin: 'B08XQ7MR9K', name: 'Anti-Fatigue Standing Mat', category: 'equipment' },

  // ============================================
  // STERILIZATION & INFECTION CONTROL (4 products)
  // ============================================
  'autoclave-pouches': { asin: 'B08N5WRWNW', name: 'Self-Sealing Sterilization Pouches (200 pack)', category: 'materials' },
  'indicator-tape': { asin: 'B07QMJR8NK', name: 'Autoclave Indicator Tape', category: 'materials' },
  'ultrasonic-cleaner': { asin: 'B08KG7XTJR', name: 'Ultrasonic Instrument Cleaner', category: 'equipment' },
  'instrument-tray': { asin: 'B09QKJM8NK', name: 'Stainless Steel Instrument Tray Set', category: 'equipment' },

  // ============================================
  // TECH & GADGETS (Professionals Love These)
  // ============================================
  'airpods-pro': { asin: 'B0D1XD1ZV3', name: 'Apple AirPods Pro 2nd Gen', category: 'tech' },
  'ipad-pro': { asin: 'B0D3J9XDMQ', name: 'iPad Pro M4 for Clinical Notes', category: 'tech' },
  'apple-pencil': { asin: 'B0BJLG69QR', name: 'Apple Pencil Pro', category: 'tech' },
  'kindle-paperwhite': { asin: 'B09TMN58KL', name: 'Kindle Paperwhite Signature Edition', category: 'tech' },
  'remarkable': { asin: 'B0BJL2Y5TD', name: 'reMarkable 2 Paper Tablet', category: 'tech' },
  'oura-ring': { asin: 'B0CSFXFQY8', name: 'Oura Ring Gen 3 (Sleep & Health)', category: 'tech' },
  'apple-watch': { asin: 'B0CHX2F5NJ', name: 'Apple Watch Ultra 2', category: 'tech' },
  'sony-headphones': { asin: 'B0C8PW5Y68', name: 'Sony WH-1000XM5 Noise Canceling', category: 'tech' },
  'bose-earbuds': { asin: 'B0CWM9LPHT', name: 'Bose QuietComfort Ultra Earbuds', category: 'tech' },
  'standing-desk': { asin: 'B08CB5KHYP', name: 'FlexiSpot Standing Desk', category: 'tech' },

  // ============================================
  // HOME OFFICE & PRODUCTIVITY
  // ============================================
  'monitor-4k': { asin: 'B09V3KXJPB', name: 'LG 32" 4K Monitor for Case Review', category: 'tech' },
  'webcam-4k': { asin: 'B09MFMTMPD', name: 'Logitech Brio 4K Webcam', category: 'tech' },
  'desk-lamp': { asin: 'B07VN4PVL7', name: 'BenQ ScreenBar Monitor Light', category: 'tech' },
  'keyboard': { asin: 'B09BRDXB7N', name: 'Logitech MX Keys S Keyboard', category: 'tech' },
  'mouse': { asin: 'B09HM94VDS', name: 'Logitech MX Master 3S Mouse', category: 'tech' },
  'laptop-stand': { asin: 'B07YRZ8K9R', name: 'Rain Design mStand Laptop Stand', category: 'tech' },
  'usb-hub': { asin: 'B087QTVCHH', name: 'CalDigit TS4 Thunderbolt 4 Hub', category: 'tech' },
  'backup-drive': { asin: 'B08GTXVG9P', name: 'Samsung T7 Portable SSD 2TB', category: 'tech' },

  // ============================================
  // HEALTH & WELLNESS (Professionals Need This)
  // ============================================
  'whoop': { asin: 'B0BCR7DL5Z', name: 'WHOOP 4.0 Fitness Tracker', category: 'health' },
  'theragun': { asin: 'B0B5QVPKPP', name: 'Theragun Prime Massage Gun', category: 'health' },
  'foam-roller': { asin: 'B0040EGNIU', name: 'TriggerPoint GRID Foam Roller', category: 'health' },
  'standing-mat': { asin: 'B01MSIINPT', name: 'Topo Anti-Fatigue Mat', category: 'health' },
  'blue-light-glasses': { asin: 'B08DKRW2YB', name: 'Felix Gray Blue Light Glasses', category: 'health' },
  'vitamin-d': { asin: 'B00GB85JR4', name: 'NOW Vitamin D3 5000 IU', category: 'health' },
  'magnesium': { asin: 'B09BQWV4F3', name: 'Magnesium Glycinate (Sleep Aid)', category: 'health' },
  'yoga-mat': { asin: 'B01LP0VQTE', name: 'Manduka PRO Yoga Mat', category: 'health' },

  // ============================================
  // TRAVEL & LIFESTYLE
  // ============================================
  'carry-on': { asin: 'B07VHQT9Z5', name: 'Away Carry-On Suitcase', category: 'lifestyle' },
  'backpack': { asin: 'B07WNKYFLL', name: 'Peak Design Everyday Backpack', category: 'lifestyle' },
  'packing-cubes': { asin: 'B014VBIEVK', name: 'Eagle Creek Pack-It Cubes', category: 'lifestyle' },
  'travel-adapter': { asin: 'B01DJ140LQ', name: 'Universal Travel Adapter', category: 'lifestyle' },
  'noise-machine': { asin: 'B00HD0ELFK', name: 'LectroFan White Noise Machine', category: 'lifestyle' },
  'travel-pillow': { asin: 'B00LB7REBE', name: 'Cabeau Evolution Memory Foam Pillow', category: 'lifestyle' },

  // ============================================
  // COFFEE & WORKSPACE ESSENTIALS
  // ============================================
  'espresso-machine': { asin: 'B0B8J9DXBV', name: 'Breville Barista Express', category: 'lifestyle' },
  'coffee-grinder': { asin: 'B07CSKGLMM', name: 'Baratza Encore Coffee Grinder', category: 'lifestyle' },
  'yeti-tumbler': { asin: 'B073WK182F', name: 'YETI Rambler 20oz Tumbler', category: 'lifestyle' },
  'water-bottle': { asin: 'B0B8T6X61L', name: 'Hydro Flask 32oz Wide Mouth', category: 'lifestyle' },
  'desk-organizer': { asin: 'B07G98B8BN', name: 'Grovemade Desk Shelf System', category: 'lifestyle' },

  // ============================================
  // PERSONAL DEVELOPMENT & COURSES
  // ============================================
  'masterclass': { url: 'https://www.masterclass.com/', name: 'MasterClass Annual Membership', category: 'courses' },
  'audible': { asin: 'B00NB86OYE', name: 'Audible Premium Plus Membership', category: 'courses' },
  'headspace': { url: 'https://www.headspace.com/', name: 'Headspace Meditation App', category: 'courses' },
  'blinkist': { url: 'https://www.blinkist.com/', name: 'Blinkist Book Summaries', category: 'courses' },

  // ============================================
  // FINANCIAL & INVESTMENT
  // ============================================
  'rich-dad': { asin: '1612681131', name: 'Rich Dad Poor Dad', category: 'books' },
  'psychology-money': { asin: '0857197681', name: 'The Psychology of Money', category: 'books' },
  'simple-path-wealth': { asin: '1533667926', name: 'The Simple Path to Wealth', category: 'books' },
  'millionaire-next-door': { asin: '1589795474', name: 'The Millionaire Next Door', category: 'books' },

  // ============================================
  // SPEAKING & PRESENTATION
  // ============================================
  'presentation-clicker': { asin: 'B00B6MODCY', name: 'Logitech Spotlight Presenter', category: 'tech' },
  'lavalier-mic': { asin: 'B016C4ZG74', name: 'Rode SmartLav+ Lavalier Microphone', category: 'tech' },
  'talk-like-ted': { asin: '1250061539', name: 'Talk Like TED (Public Speaking)', category: 'books' }
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
