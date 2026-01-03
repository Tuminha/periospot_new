#!/usr/bin/env node
/**
 * Affiliate MCP Server for Claude Desktop
 *
 * Provides affiliate link management tools via MCP protocol.
 *
 * Tools:
 *   - create_affiliate_link: Create Genius Link and save to Tana
 *   - search_affiliate_links: Search existing links in Tana
 *   - suggest_programs: Get affiliate program recommendations
 *   - list_quick_products: List pre-defined products
 *
 * Usage:
 *   Add to Claude Desktop config:
 *   "affiliate": {
 *     "command": "node",
 *     "args": ["/path/to/affiliate-mcp-server.cjs"]
 *   }
 */

const { createGeniusLink } = require('./geniuslink-api.cjs');
const { createAffiliateLink } = require('./tana-api.cjs');
const { COMMON_PRODUCTS } = require('./affiliate-manager.cjs');
const { AFFILIATE_PROGRAMS, getRecommendations } = require('./affiliate-programs.cjs');
const { execSync } = require('child_process');
const readline = require('readline');

// MCP Protocol Implementation
class AffiliateMCPServer {
  constructor() {
    this.tools = {
      create_affiliate_link: {
        name: 'create_affiliate_link',
        description: 'Create a geo-targeted Genius Link from an Amazon URL and save it to Tana with the #affiliate-links supertag. Returns the short URL and markdown for blog posts.',
        inputSchema: {
          type: 'object',
          properties: {
            product_name: {
              type: 'string',
              description: 'Name of the product (e.g., "Lindhe Clinical Periodontology")'
            },
            amazon_url: {
              type: 'string',
              description: 'Amazon product URL or ASIN (e.g., "https://amazon.com/dp/1119438888" or just "1119438888")'
            },
            category: {
              type: 'string',
              description: 'Product category: books, equipment, instruments, tech, health, lifestyle',
              enum: ['books', 'equipment', 'instruments', 'tech', 'health', 'lifestyle', 'courses', 'materials']
            }
          },
          required: ['product_name', 'amazon_url']
        }
      },
      search_affiliate_links: {
        name: 'search_affiliate_links',
        description: 'Search existing affiliate links in Tana. Use this before creating new links to avoid duplicates.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search term (product name, keyword, or category)'
            }
          },
          required: ['query']
        }
      },
      suggest_programs: {
        name: 'suggest_programs',
        description: 'Get affiliate program recommendations based on audience and content. Shows which programs to apply to.',
        inputSchema: {
          type: 'object',
          properties: {
            priority: {
              type: 'string',
              description: 'Filter by priority level',
              enum: ['HIGH', 'MEDIUM', 'LOW', 'all']
            }
          }
        }
      },
      list_quick_products: {
        name: 'list_quick_products',
        description: 'List all pre-defined products with verified ASINs. Use these for quick affiliate link creation.',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Filter by category',
              enum: ['books', 'equipment', 'instruments', 'tech', 'health', 'lifestyle', 'all']
            }
          }
        }
      },
      get_enrolled_programs: {
        name: 'get_enrolled_programs',
        description: 'List all affiliate programs currently enrolled in.',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    };
  }

  // Handle incoming JSON-RPC messages
  async handleMessage(message) {
    const { id, method, params } = message;

    try {
      switch (method) {
        case 'initialize':
          return this.handleInitialize(id, params);
        case 'initialized':
          // Client acknowledgment - no response needed for notifications
          return null;
        case 'tools/list':
          return this.handleToolsList(id);
        case 'tools/call':
          return this.handleToolsCall(id, params);
        case 'ping':
          return { jsonrpc: '2.0', id, result: {} };
        case 'notifications/cancelled':
        case 'shutdown':
          // No response for notifications
          return null;
        default:
          // Only respond with error if this is a request (has id), not a notification
          if (id !== undefined && id !== null) {
            return this.errorResponse(id, -32601, `Method not found: ${method}`);
          }
          return null;
      }
    } catch (error) {
      if (id !== undefined && id !== null) {
        return this.errorResponse(id, -32603, error.message);
      }
      return null;
    }
  }

  handleInitialize(id, params) {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'periospot-affiliate',
          version: '1.0.0'
        }
      }
    };
  }

  handleToolsList(id) {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        tools: Object.values(this.tools)
      }
    };
  }

  async handleToolsCall(id, params) {
    const { name, arguments: args } = params;

    let result;
    try {
      switch (name) {
        case 'create_affiliate_link':
          result = await this.createAffiliateLink(args);
          break;
        case 'search_affiliate_links':
          result = await this.searchAffiliateLinks(args);
          break;
        case 'suggest_programs':
          result = this.suggestPrograms(args);
          break;
        case 'list_quick_products':
          result = this.listQuickProducts(args);
          break;
        case 'get_enrolled_programs':
          result = this.getEnrolledPrograms();
          break;
        default:
          return this.errorResponse(id, -32602, `Unknown tool: ${name}`);
      }

      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
            }
          ]
        }
      };
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ],
          isError: true
        }
      };
    }
  }

  errorResponse(id, code, message) {
    return {
      jsonrpc: '2.0',
      id,
      error: { code, message }
    };
  }

  // Tool implementations
  async createAffiliateLink({ product_name, amazon_url, category = 'general' }) {
    // Check if it's an ASIN or full URL
    let url = amazon_url;
    if (/^[A-Z0-9]{10}$/i.test(amazon_url)) {
      url = `https://www.amazon.com/dp/${amazon_url}`;
    }

    // Create Genius Link
    const geniusResult = await createGeniusLink(url);

    if (!geniusResult.success) {
      throw new Error(`Failed to create Genius Link: ${JSON.stringify(geniusResult.error)}`);
    }

    // Save to Tana
    const tanaResult = await createAffiliateLink({
      name: product_name,
      url: geniusResult.shortUrl,
      platform: 'amazon',
      category: category,
      notes: `Original: ${url}`
    });

    // Generate markdown templates
    const markdownTemplates = {
      books: `[${product_name}](${geniusResult.shortUrl}) *(affiliate link)*`,
      equipment: `**Recommended:** [${product_name}](${geniusResult.shortUrl})`,
      default: `[${product_name}](${geniusResult.shortUrl})`
    };

    return {
      success: true,
      product_name,
      genius_link: geniusResult.shortUrl,
      original_url: url,
      tagged_url: geniusResult.taggedUrl,
      category,
      tana_node_id: tanaResult?.children?.[0]?.nodeId || null,
      markdown: markdownTemplates[category] || markdownTemplates.default,
      message: `✅ Affiliate link created and saved to Tana!`
    };
  }

  async searchAffiliateLinks({ query }) {
    try {
      // Search using supertag-cli
      const searchResult = execSync(
        `~/bin/supertag search "${query}" 2>/dev/null | grep -i affiliate | head -20`,
        { encoding: 'utf-8', shell: true }
      ).trim();

      if (!searchResult) {
        // Check quick products
        const matchingProducts = Object.entries(COMMON_PRODUCTS)
          .filter(([key, prod]) =>
            key.includes(query.toLowerCase()) ||
            prod.name.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 5);

        if (matchingProducts.length > 0) {
          return {
            found_in_tana: false,
            message: `No existing links found in Tana for "${query}"`,
            quick_products_available: matchingProducts.map(([key, prod]) => ({
              key,
              name: prod.name,
              asin: prod.asin,
              category: prod.category,
              suggestion: `Use: create_affiliate_link with product_name="${prod.name}" and amazon_url="${prod.asin}"`
            }))
          };
        }

        return {
          found_in_tana: false,
          message: `No existing links found for "${query}". You can create a new one with create_affiliate_link.`
        };
      }

      // Parse results
      const lines = searchResult.split('\n').filter(Boolean);
      const results = lines.map(line => {
        const parts = line.split('\t');
        return {
          id: parts[0],
          name: parts[1],
          tags: parts[2] || '',
          score: parts[3] || ''
        };
      });

      return {
        found_in_tana: true,
        count: results.length,
        results,
        message: `Found ${results.length} affiliate link(s) matching "${query}"`
      };
    } catch (error) {
      return {
        found_in_tana: false,
        message: `Search error: ${error.message}. Try creating a new link instead.`
      };
    }
  }

  suggestPrograms({ priority = 'all' }) {
    const recommendations = getRecommendations(priority === 'all' ? null : priority);
    const enrolled = AFFILIATE_PROGRAMS.enrolled;

    return {
      enrolled_programs: enrolled.map(p => ({
        name: p.name,
        status: p.status,
        category: p.category
      })),
      recommendations: recommendations.slice(0, 10).map(p => ({
        name: p.name,
        priority: p.priority,
        category: p.category,
        audience_match: `${p.audienceMatch}%`,
        potential_revenue: p.potentialRevenue,
        reason: p.reason,
        apply_url: p.url
      })),
      summary: {
        enrolled_count: enrolled.length,
        high_priority_opportunities: recommendations.filter(p => p.priority === 'HIGH').length,
        total_recommendations: recommendations.length
      }
    };
  }

  listQuickProducts({ category = 'all' }) {
    const products = Object.entries(COMMON_PRODUCTS)
      .filter(([key, prod]) => category === 'all' || prod.category === category)
      .map(([key, prod]) => ({
        key,
        name: prod.name,
        asin: prod.asin || null,
        url: prod.url || null,
        category: prod.category
      }));

    // Group by category
    const grouped = {};
    products.forEach(p => {
      if (!grouped[p.category]) grouped[p.category] = [];
      grouped[p.category].push(p);
    });

    return {
      total_products: products.length,
      categories: Object.keys(grouped),
      products_by_category: grouped,
      usage: 'Use create_affiliate_link with the ASIN to create a Genius Link'
    };
  }

  getEnrolledPrograms() {
    return {
      programs: AFFILIATE_PROGRAMS.enrolled,
      amazon_tag: 'advaimpldigid-20',
      genius_link_group: '416233',
      total: AFFILIATE_PROGRAMS.enrolled.length
    };
  }
}

// Main server loop
async function main() {
  const server = new AffiliateMCPServer();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  let buffer = '';

  rl.on('line', async (line) => {
    buffer += line;

    try {
      const message = JSON.parse(buffer);
      buffer = '';

      const response = await server.handleMessage(message);
      // Only output if there's a response (notifications don't need responses)
      if (response !== null) {
        console.log(JSON.stringify(response));
      }
    } catch (e) {
      // Not complete JSON yet, wait for more
      if (e instanceof SyntaxError) {
        return;
      }
      // Other error - but we can't send error without id, so just log to stderr
      console.error('Parse error:', e.message);
      buffer = '';
    }
  });

  rl.on('close', () => {
    process.exit(0);
  });
}

main().catch(console.error);
