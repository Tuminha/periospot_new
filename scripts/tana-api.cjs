/**
 * Tana API Integration for Periospot Affiliate Links
 *
 * Writes affiliate links to Tana with the #affiliate-links supertag.
 * NOTE: The Tana Input API is write-only. Reading requires the supertag-cli MCP.
 *
 * Usage:
 *   node scripts/tana-api.cjs add "Product Name" "https://geni.us/xxx" "amazon"
 *   node scripts/tana-api.cjs test
 */

const https = require('https');

// Tana API Configuration
const TANA_CONFIG = {
  token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaWxlSWQiOiJVNzJ6MEt6SWtPejUiLCJjcmVhdGVkIjoxNzY3MDExNDg2OTg4LCJ0b2tlbklkIjoiR1Q4N0dpZFl3Q1ZWIn0.lAxxAR9Lnkw1j7qK0TLP-ZmAiQM3XHnujEdkD6MrN8Y',
  endpoint: 'europe-west1-tagr-prod.cloudfunctions.net',
  path: '/addToNodeV2',
  // You need to get this ID by running "Show API schema" on your #affiliate-links supertag in Tana
  affiliateLinksSupertagId: null // Set this after getting the ID from Tana
};

/**
 * Make API request to Tana
 */
function apiRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);

    const options = {
      hostname: TANA_CONFIG.endpoint,
      path: TANA_CONFIG.path,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TANA_CONFIG.token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Create affiliate link node in Tana
 *
 * @param {object} linkData - The affiliate link data
 * @param {string} linkData.name - Product/link name
 * @param {string} linkData.url - The affiliate URL (preferably Genius Link)
 * @param {string} linkData.platform - Platform (amazon, shareasale, etc.)
 * @param {string} linkData.category - Category (books, equipment, courses)
 * @param {string} linkData.notes - Optional notes
 * @returns {Promise<object>} - The created node info
 */
async function createAffiliateLink(linkData) {
  const node = {
    name: linkData.name,
    description: linkData.url,
    children: [
      { name: `Platform: ${linkData.platform || 'amazon'}` },
      { name: `Category: ${linkData.category || 'general'}` },
      { name: `URL: ${linkData.url}` }
    ]
  };

  // Add supertag if configured
  if (TANA_CONFIG.affiliateLinksSupertagId) {
    node.supertags = [{ id: TANA_CONFIG.affiliateLinksSupertagId }];
  }

  // Add notes if provided
  if (linkData.notes) {
    node.children.push({ name: `Notes: ${linkData.notes}` });
  }

  // Add creation date
  node.children.push({ name: `Added: ${new Date().toISOString().split('T')[0]}` });

  const result = await apiRequest({ nodes: [node] });
  return result;
}

/**
 * Create multiple affiliate links at once
 *
 * @param {object[]} links - Array of link data objects
 * @returns {Promise<object>} - The result
 */
async function bulkCreateAffiliateLinks(links) {
  const nodes = links.map(linkData => ({
    name: linkData.name,
    description: linkData.url,
    children: [
      { name: `Platform: ${linkData.platform || 'amazon'}` },
      { name: `Category: ${linkData.category || 'general'}` },
      { name: `URL: ${linkData.url}` },
      { name: `Added: ${new Date().toISOString().split('T')[0]}` }
    ],
    ...(TANA_CONFIG.affiliateLinksSupertagId && {
      supertags: [{ id: TANA_CONFIG.affiliateLinksSupertagId }]
    })
  }));

  return apiRequest({ nodes });
}

/**
 * Test the Tana API connection
 */
async function testConnection() {
  const result = await apiRequest({
    nodes: [{
      name: 'Tana API Test - ' + new Date().toISOString(),
      children: [
        { name: 'This is a test node from Periospot monetization integration' },
        { name: 'If you see this, the API is working correctly!' }
      ]
    }]
  });

  return result;
}

/**
 * Get the supertag schema (instructions)
 */
function getSupertugInstructions() {
  return `
To get your #affiliate-links supertag ID:

1. Open Tana
2. Find your #affiliate-links supertag (or create one)
3. Click on the supertag
4. Press Cmd+K (or Ctrl+K)
5. Type "Show API schema"
6. Select "Show API schema"
7. Copy the "id" value (looks like "aBc123XyZ")
8. Update TANA_CONFIG.affiliateLinksSupertagId in this file

Example supertag structure for #affiliate-links:
- Name (title)
- URL (url field)
- Platform (options: amazon, shareasale, direct, etc.)
- Category (options: books, equipment, courses, software)
- Status (options: active, expired, pending)
- Commission (number field)
- Notes (text field)
`;
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'add':
      if (!args[1] || !args[2]) {
        console.log('Usage: node tana-api.cjs add "Product Name" "https://url" [platform] [category]');
        process.exit(1);
      }
      const addResult = await createAffiliateLink({
        name: args[1],
        url: args[2],
        platform: args[3] || 'amazon',
        category: args[4] || 'general'
      });
      console.log('\n=== Affiliate Link Added to Tana ===');
      console.log(JSON.stringify(addResult, null, 2));
      break;

    case 'bulk':
      // Read from stdin or file
      console.log('Bulk add not yet implemented. Use individual adds for now.');
      break;

    case 'test':
      console.log('Testing Tana API connection...');
      const testResult = await testConnection();
      console.log('\n=== Tana API Test Result ===');
      console.log(JSON.stringify(testResult, null, 2));
      if (testResult.children) {
        console.log('\n✅ Connection successful! Check your Tana inbox for the test node.');
      }
      break;

    case 'setup':
      console.log(getSupertugInstructions());
      break;

    default:
      console.log(`
Tana API Integration for Periospot
====================================

Commands:
  add <name> <url> [platform] [category]   Add affiliate link to Tana
  test                                      Test API connection
  setup                                     Show supertag setup instructions

Examples:
  node tana-api.cjs add "Misch Implant Book" "https://geni.us/abc" amazon books
  node tana-api.cjs test
  node tana-api.cjs setup

Platforms: amazon, shareasale, direct, geniuslink, tradedoubler
Categories: books, equipment, courses, software, instruments, materials

Note: The Tana Input API is write-only.
To READ existing affiliate links, you need to set up supertag-cli MCP:
https://github.com/jcfischer/supertag-cli
      `);
  }
}

// Export for use as module
module.exports = {
  createAffiliateLink,
  bulkCreateAffiliateLinks,
  testConnection,
  TANA_CONFIG
};

// Run CLI if called directly
if (require.main === module) {
  main().catch(console.error);
}
