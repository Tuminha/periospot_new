/**
 * Genius Link API Integration for Periospot
 *
 * Creates smart affiliate links using Genius Link's API.
 * The links will automatically redirect based on user location
 * and attach your Amazon affiliate tag.
 *
 * Usage:
 *   node scripts/geniuslink-api.cjs create "https://amazon.com/dp/..."
 *   node scripts/geniuslink-api.cjs list
 *   node scripts/geniuslink-api.cjs groups
 */

const https = require('https');

// Genius Link API Configuration
const GENIUSLINK_CONFIG = {
  apiKey: '847ce64e10274a2ebb731e9f2e6e44c5',
  apiSecret: 'abbfaa86d9f04c9a85c71d26210da56a',
  baseUrl: 'api.geni.us',
  defaultGroupId: 416233, // PerioSpot group
  domain: 'geni.us',
  amazonTag: 'advaimpldigid-20'
};

/**
 * Make API request to Genius Link
 */
function apiRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: GENIUSLINK_CONFIG.baseUrl,
      path: path,
      method: method,
      headers: {
        'X-Api-Key': GENIUSLINK_CONFIG.apiKey,
        'X-Api-Secret': GENIUSLINK_CONFIG.apiSecret,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode === 404) {
            reject(new Error(`404 Not Found: ${path}`));
            return;
          }
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

/**
 * Ensure URL has Amazon affiliate tag
 */
function addAffiliateTag(url) {
  const urlObj = new URL(url);

  // Check if it's an Amazon URL
  if (urlObj.hostname.includes('amazon')) {
    // Remove existing tag if present
    urlObj.searchParams.delete('tag');
    // Add our tag
    urlObj.searchParams.set('tag', GENIUSLINK_CONFIG.amazonTag);
  }

  return urlObj.toString();
}

/**
 * Create a Genius Link from any URL
 *
 * @param {string} url - The original URL (Amazon, etc.)
 * @param {number} groupId - Optional group ID (defaults to PerioSpot)
 * @returns {Promise<object>} - The created link info
 */
async function createGeniusLink(url, groupId = GENIUSLINK_CONFIG.defaultGroupId) {
  // Add affiliate tag for Amazon URLs
  const taggedUrl = addAffiliateTag(url);

  const result = await apiRequest('POST', '/v3/shorturls', {
    url: taggedUrl,
    groupId: groupId,
    domain: GENIUSLINK_CONFIG.domain,
    linkCreatorSetting: 'Simple'
  });

  if (result.shortUrl) {
    return {
      success: true,
      originalUrl: url,
      taggedUrl: taggedUrl,
      shortUrl: `https://${result.shortUrl.domain}/${result.shortUrl.code}`,
      code: result.shortUrl.code,
      groupId: result.shortUrl.groupId
    };
  }

  return { success: false, error: result };
}

/**
 * Create a new group in Genius Link
 *
 * @param {string} name - Group name (max 20 characters)
 * @returns {Promise<object>} - The created group info
 */
async function createGroup(name) {
  if (name.length > 20) {
    throw new Error('Group name must be 20 characters or less');
  }

  const result = await apiRequest('GET', `/v1/groups/add?GroupName=${encodeURIComponent(name)}`);

  if (result.NewGroupId) {
    return {
      success: true,
      groupId: result.NewGroupId,
      name: name
    };
  }

  return { success: false, error: result };
}

/**
 * Bulk create Genius Links for multiple URLs
 *
 * @param {string[]} urls - Array of URLs to shorten
 * @returns {Promise<object[]>} - Array of created links
 */
async function bulkCreateLinks(urls) {
  const results = [];

  for (const url of urls) {
    try {
      const result = await createGeniusLink(url);
      results.push(result);
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      results.push({ success: false, url, error: error.message });
    }
  }

  return results;
}

/**
 * Generate affiliate link for common dental products
 *
 * @param {string} productType - Type of product (book, equipment, etc.)
 * @param {string} asin - Amazon ASIN
 * @returns {Promise<object>} - The created link info
 */
async function createDentalAffiliateLink(productType, asin) {
  const amazonUrl = `https://www.amazon.com/dp/${asin}`;
  return createGeniusLink(amazonUrl);
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'create':
      if (!args[1]) {
        console.log('Usage: node geniuslink-api.cjs create <url>');
        process.exit(1);
      }
      const result = await createGeniusLink(args[1]);
      console.log('\n=== Genius Link Created ===');
      console.log('Original URL:', result.originalUrl);
      console.log('Tagged URL:', result.taggedUrl);
      console.log('Short URL:', result.shortUrl);
      console.log('Code:', result.code);
      break;

    case 'bulk':
      const urls = args.slice(1);
      if (urls.length === 0) {
        console.log('Usage: node geniuslink-api.cjs bulk <url1> <url2> ...');
        process.exit(1);
      }
      const bulkResults = await bulkCreateLinks(urls);
      console.log('\n=== Bulk Links Created ===');
      bulkResults.forEach(r => {
        if (r.success) {
          console.log(`${r.shortUrl} <- ${r.originalUrl}`);
        } else {
          console.log(`FAILED: ${r.url} - ${r.error}`);
        }
      });
      break;

    case 'group':
      if (!args[1]) {
        console.log('Usage: node geniuslink-api.cjs group <name>');
        process.exit(1);
      }
      const group = await createGroup(args[1]);
      console.log('\n=== Group Created ===');
      console.log('Group ID:', group.groupId);
      console.log('Name:', group.name);
      break;

    case 'asin':
      if (!args[1]) {
        console.log('Usage: node geniuslink-api.cjs asin <ASIN>');
        process.exit(1);
      }
      const asinResult = await createDentalAffiliateLink('product', args[1]);
      console.log('\n=== Amazon Product Link Created ===');
      console.log('ASIN:', args[1]);
      console.log('Genius Link:', asinResult.shortUrl);
      break;

    default:
      console.log(`
Genius Link API for Periospot
==============================

Commands:
  create <url>     Create a Genius Link from any URL
  bulk <urls...>   Create multiple links at once
  group <name>     Create a new link group
  asin <ASIN>      Create Amazon product link by ASIN

Examples:
  node geniuslink-api.cjs create "https://amazon.com/dp/B08N5WRWNW"
  node geniuslink-api.cjs asin B08N5WRWNW
  node geniuslink-api.cjs group "DentalBooks"

Configuration:
  Amazon Tag: ${GENIUSLINK_CONFIG.amazonTag}
  Default Group: ${GENIUSLINK_CONFIG.defaultGroupId}
  Domain: ${GENIUSLINK_CONFIG.domain}
      `);
  }
}

// Export for use as module
module.exports = {
  createGeniusLink,
  createGroup,
  bulkCreateLinks,
  createDentalAffiliateLink,
  GENIUSLINK_CONFIG
};

// Run CLI if called directly
if (require.main === module) {
  main().catch(console.error);
}
