const posts = require('../legacy-wordpress/content/posts.json');
const products = require('../legacy-wordpress/content/products.json');

console.log('='.repeat(60));
console.log('PERIOSPOT MONETIZATION ANALYSIS');
console.log('='.repeat(60));

// Analyze posts
console.log('\n## CONTENT OVERVIEW');
console.log(`Total Posts: ${posts.length}`);
console.log(`Total Products: ${products.length}`);

// Category breakdown
const cats = {};
posts.forEach(p => {
  (p.categories || []).forEach(c => {
    cats[c] = (cats[c] || 0) + 1;
  });
});
console.log('\nCategories:');
Object.entries(cats).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v} posts`));

// Extract links from posts
const linkPattern = /href=["']([^"']+)["']/gi;
const amazonLinks = [];
const bookLinks = [];
const externalLinks = [];
const allDomains = {};

posts.forEach(post => {
  const content = post.content || '';
  let match;
  const regex = new RegExp('href=["\']([^"\']+)["\']', 'gi');
  while ((match = regex.exec(content)) !== null) {
    const url = match[1];

    // Check for Amazon links
    if (url.includes('amazon') || url.includes('amzn')) {
      amazonLinks.push({ title: post.title, url, slug: post.slug });
    }

    // Check for book-related links
    if (url.toLowerCase().includes('book') || url.includes('wiley') || url.includes('springer') || url.includes('elsevier')) {
      bookLinks.push({ title: post.title, url });
    }

    // Track external domains
    if (url.startsWith('http') && !url.includes('periospot.com')) {
      try {
        const u = new URL(url);
        allDomains[u.hostname] = (allDomains[u.hostname] || 0) + 1;
        externalLinks.push({ title: post.title, url, domain: u.hostname });
      } catch(e) {}
    }
  }
});

console.log('\n## EXISTING AFFILIATE LINKS');
console.log(`Amazon Links Found: ${amazonLinks.length}`);
if (amazonLinks.length > 0) {
  console.log('\nAmazon Links:');
  amazonLinks.forEach(l => console.log(`  - ${l.title}\n    ${l.url}`));
}

console.log(`\nBook-related Links Found: ${bookLinks.length}`);

console.log('\n## TOP EXTERNAL DOMAINS (link opportunities)');
Object.entries(allDomains)
  .sort((a,b) => b[1]-a[1])
  .slice(0, 25)
  .forEach(([d, c]) => console.log(`  ${d}: ${c} links`));

// Analyze content topics for affiliate opportunities
console.log('\n## MONETIZATION OPPORTUNITY ANALYSIS');
console.log('\n### Current Products (for internal promotion):');
const productTypes = {};
products.forEach(p => {
  productTypes[p.product_type] = (productTypes[p.product_type] || 0) + 1;
});
Object.entries(productTypes).forEach(([t, c]) => console.log(`  ${t}: ${c} products`));

// Analyze post content for monetization keywords
console.log('\n### Content Topics with Affiliate Potential:');
const monetizableKeywords = {
  'implant': { count: 0, posts: [] },
  'instrument': { count: 0, posts: [] },
  'suture': { count: 0, posts: [] },
  'graft': { count: 0, posts: [] },
  'membrane': { count: 0, posts: [] },
  'bone': { count: 0, posts: [] },
  'scaler': { count: 0, posts: [] },
  'curette': { count: 0, posts: [] },
  'loupes': { count: 0, posts: [] },
  'microscope': { count: 0, posts: [] },
  'laser': { count: 0, posts: [] },
  'cbct': { count: 0, posts: [] },
  'scanner': { count: 0, posts: [] },
  'software': { count: 0, posts: [] },
  'book': { count: 0, posts: [] },
  'textbook': { count: 0, posts: [] },
  'course': { count: 0, posts: [] },
  'webinar': { count: 0, posts: [] },
};

posts.forEach(post => {
  const content = (post.content || '' + post.title || '').toLowerCase();
  Object.keys(monetizableKeywords).forEach(kw => {
    if (content.includes(kw)) {
      monetizableKeywords[kw].count++;
      monetizableKeywords[kw].posts.push(post.title);
    }
  });
});

Object.entries(monetizableKeywords)
  .filter(([k, v]) => v.count > 0)
  .sort((a,b) => b[1].count - a[1].count)
  .forEach(([kw, data]) => {
    console.log(`\n  "${kw}" mentioned in ${data.count} posts:`);
    data.posts.slice(0, 3).forEach(t => console.log(`    - ${t}`));
    if (data.posts.length > 3) console.log(`    ... and ${data.posts.length - 3} more`);
  });

// Summary output
console.log('\n' + '='.repeat(60));
console.log('SUMMARY: MONETIZATION GAPS & OPPORTUNITIES');
console.log('='.repeat(60));

console.log(`
1. AMAZON AFFILIATES: ${amazonLinks.length === 0 ? 'NO AMAZON AFFILIATE LINKS FOUND - MAJOR OPPORTUNITY' : amazonLinks.length + ' links found'}

2. HIGH-VALUE AFFILIATE CATEGORIES:
   - Dental Implant Systems (Straumann, Nobel Biocare, Zimmer)
   - Surgical Instruments (Hu-Friedy, LM-Dental)
   - Bone Graft Materials (Geistlich, BioHorizons)
   - Dental Loupes & Microscopes (Carl Zeiss, Orascoptic)
   - CBCT Scanners & Digital Equipment
   - Dental Textbooks (Amazon, Wiley, Quintessence)
   - Online Courses & CE Credits

3. CONTENT GAPS FOR MONETIZATION:
   - Product reviews and comparisons
   - "Best of" lists for dental equipment
   - Buying guides for dental professionals
   - Course/education recommendations

4. INTERNAL PRODUCT PROMOTION:
   - ${products.length} products available for cross-promotion
   - Speaker Packs, Animations, Dental Instruments
`);
