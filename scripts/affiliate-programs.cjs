/**
 * Affiliate Program Tracker for Periospot
 *
 * Tracks affiliate programs you're enrolled in and suggests new ones.
 * Integrates with Tana for storage.
 *
 * Usage:
 *   node scripts/affiliate-programs.cjs list              # List all programs
 *   node scripts/affiliate-programs.cjs add "Name" "URL"  # Add new program
 *   node scripts/affiliate-programs.cjs suggest           # Get suggestions
 *   node scripts/affiliate-programs.cjs check             # Check for new opportunities
 */

const { createAffiliateLink, apiRequest, TANA_CONFIG } = require('./tana-api.cjs');

// Known affiliate programs database
const AFFILIATE_PROGRAMS = {
  // ============================================
  // CURRENTLY ENROLLED (based on your data)
  // ============================================
  enrolled: [
    { name: 'Amazon Associates', tag: 'advaimpldigid-20', status: 'active', category: 'marketplace' },
    { name: 'Geni.us', groupId: '416233', status: 'active', category: 'link-management' },
    { name: 'ShareASale', status: 'active', category: 'network' },
    { name: 'TradeDoubler', status: 'active', category: 'network' },
    { name: 'iTunes/Apple', status: 'active', category: 'marketplace' },
    { name: 'LeadPages', status: 'active', category: 'software' },
    { name: 'Bluehost', status: 'active', category: 'hosting' },
    { name: 'eBay Partner Network', status: 'active', category: 'marketplace' },
    { name: 'SoundStripe', status: 'active', category: 'media' }
  ],

  // ============================================
  // RECOMMENDED FOR PERIOSPOT AUDIENCE
  // ============================================
  recommendations: {
    // Dental Industry (HIGH PRIORITY)
    dental: [
      {
        name: 'Straumann',
        url: 'https://www.straumann.com/',
        category: 'implants',
        priority: 'HIGH',
        reason: 'Leading implant manufacturer. Contact sales for affiliate partnership.',
        audienceMatch: 95,
        potentialRevenue: '€500-2000/month'
      },
      {
        name: 'Geistlich',
        url: 'https://www.geistlich.com/',
        category: 'biomaterials',
        priority: 'HIGH',
        reason: 'Bio-Oss, Bio-Gide - most used bone grafts. Many articles mention these.',
        audienceMatch: 90,
        potentialRevenue: '€300-1000/month'
      },
      {
        name: 'Nobel Biocare',
        url: 'https://www.nobelbiocare.com/',
        category: 'implants',
        priority: 'HIGH',
        reason: 'Premium implant brand. High-ticket affiliate potential.',
        audienceMatch: 85,
        potentialRevenue: '€500-1500/month'
      },
      {
        name: 'Hu-Friedy',
        url: 'https://www.hu-friedy.com/',
        category: 'instruments',
        priority: 'MEDIUM',
        reason: 'Gold standard for periodontal instruments. Check ShareASale for partnership.',
        audienceMatch: 80,
        potentialRevenue: '€200-500/month'
      },
      {
        name: 'Orascoptic (Loupes)',
        url: 'https://www.orascoptic.com/',
        category: 'equipment',
        priority: 'MEDIUM',
        reason: 'Premium dental loupes. High commission on expensive items.',
        audienceMatch: 75,
        potentialRevenue: '€100-400/month'
      },
      {
        name: 'Surgitel (Loupes)',
        url: 'https://www.surgitel.com/',
        category: 'equipment',
        priority: 'MEDIUM',
        reason: 'Alternative loupe brand. Often has better affiliate terms.',
        audienceMatch: 75,
        potentialRevenue: '€100-400/month'
      },
      {
        name: 'Planmeca',
        url: 'https://www.planmeca.com/',
        category: 'imaging',
        priority: 'MEDIUM',
        reason: 'CBCT, CAD/CAM systems. Lead generation affiliate model.',
        audienceMatch: 60,
        potentialRevenue: '€200-800/month'
      },
      {
        name: '3Shape',
        url: 'https://www.3shape.com/',
        category: 'scanning',
        priority: 'MEDIUM',
        reason: 'Intraoral scanners. Lead generation potential.',
        audienceMatch: 55,
        potentialRevenue: '€150-600/month'
      }
    ],

    // Education & Courses
    education: [
      {
        name: 'Coursera',
        url: 'https://www.coursera.org/affiliates',
        category: 'courses',
        priority: 'HIGH',
        reason: 'Many dentists take online courses. Easy to integrate.',
        audienceMatch: 70,
        potentialRevenue: '€50-200/month'
      },
      {
        name: 'Udemy',
        url: 'https://www.udemy.com/affiliate/',
        category: 'courses',
        priority: 'MEDIUM',
        reason: 'Business, marketing, tech courses for practice owners.',
        audienceMatch: 65,
        potentialRevenue: '€30-150/month'
      },
      {
        name: 'MasterClass',
        url: 'https://www.masterclass.com/affiliates',
        category: 'courses',
        priority: 'MEDIUM',
        reason: 'Personal development. Appeals to high-earning professionals.',
        audienceMatch: 60,
        potentialRevenue: '€50-200/month'
      },
      {
        name: 'Skillshare',
        url: 'https://www.skillshare.com/affiliates',
        category: 'courses',
        priority: 'LOW',
        reason: 'Creative skills, photography, design.',
        audienceMatch: 40,
        potentialRevenue: '€20-80/month'
      }
    ],

    // Software & Tools
    software: [
      {
        name: 'Adobe Creative Cloud',
        url: 'https://www.adobe.com/affiliates.html',
        category: 'software',
        priority: 'MEDIUM',
        reason: 'Photo editing, presentations. Dental photography content.',
        audienceMatch: 55,
        potentialRevenue: '€50-200/month'
      },
      {
        name: 'Notion',
        url: 'https://affiliate.notion.so/',
        category: 'software',
        priority: 'LOW',
        reason: 'Practice organization, knowledge management.',
        audienceMatch: 45,
        potentialRevenue: '€20-100/month'
      },
      {
        name: 'Calendly',
        url: 'https://calendly.com/partners',
        category: 'software',
        priority: 'LOW',
        reason: 'Appointment scheduling for consultations.',
        audienceMatch: 40,
        potentialRevenue: '€15-80/month'
      }
    ],

    // Lifestyle & Professional
    lifestyle: [
      {
        name: 'Away (Luggage)',
        url: 'https://www.awaytravel.com/affiliates',
        category: 'travel',
        priority: 'LOW',
        reason: 'Dentists travel to conferences. Premium audience.',
        audienceMatch: 50,
        potentialRevenue: '€30-150/month'
      },
      {
        name: 'Audible',
        url: 'https://www.amazon.com/audible-affiliate',
        category: 'books',
        priority: 'MEDIUM',
        reason: 'Audiobooks for busy professionals. Through Amazon.',
        audienceMatch: 60,
        potentialRevenue: '€30-120/month'
      },
      {
        name: 'Headspace',
        url: 'https://www.headspace.com/affiliates',
        category: 'wellness',
        priority: 'LOW',
        reason: 'Stress management for high-pressure profession.',
        audienceMatch: 45,
        potentialRevenue: '€20-80/month'
      }
    ]
  }
};

/**
 * Get all enrolled programs
 */
function getEnrolledPrograms() {
  return AFFILIATE_PROGRAMS.enrolled;
}

/**
 * Get recommendations based on priority
 */
function getRecommendations(priority = null) {
  const all = [];

  Object.entries(AFFILIATE_PROGRAMS.recommendations).forEach(([category, programs]) => {
    programs.forEach(program => {
      all.push({ ...program, categoryGroup: category });
    });
  });

  if (priority) {
    return all.filter(p => p.priority === priority.toUpperCase());
  }

  return all.sort((a, b) => {
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Get suggestions based on content analysis
 */
function getSuggestionsForContent(content) {
  const suggestions = [];
  const lowercaseContent = content.toLowerCase();

  // Check for topic matches
  if (lowercaseContent.includes('implant')) {
    suggestions.push(...getRecommendations().filter(p => p.category === 'implants'));
  }
  if (lowercaseContent.includes('bone graft') || lowercaseContent.includes('bio-oss')) {
    suggestions.push(...getRecommendations().filter(p => p.category === 'biomaterials'));
  }
  if (lowercaseContent.includes('loupe') || lowercaseContent.includes('magnif')) {
    suggestions.push(...getRecommendations().filter(p => p.category === 'equipment'));
  }
  if (lowercaseContent.includes('course') || lowercaseContent.includes('learn')) {
    suggestions.push(...getRecommendations().filter(p => p.categoryGroup === 'education'));
  }

  // Remove duplicates
  return [...new Map(suggestions.map(s => [s.name, s])).values()];
}

/**
 * Format program for display
 */
function formatProgram(program) {
  return `
📦 ${program.name}
   Priority: ${program.priority}
   Category: ${program.category}
   Audience Match: ${program.audienceMatch}%
   Potential Revenue: ${program.potentialRevenue}
   Reason: ${program.reason}
   Apply: ${program.url}
`;
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'list':
      console.log('\n=== ENROLLED AFFILIATE PROGRAMS ===\n');
      AFFILIATE_PROGRAMS.enrolled.forEach((program, i) => {
        console.log(`${i + 1}. ${program.name} [${program.status}] - ${program.category}`);
        if (program.tag) console.log(`   Tag: ${program.tag}`);
      });
      break;

    case 'suggest':
    case 'recommendations':
      const priority = args[1];
      const recs = getRecommendations(priority);

      console.log('\n=== AFFILIATE PROGRAM RECOMMENDATIONS ===\n');
      console.log(`Showing: ${priority ? priority.toUpperCase() + ' priority' : 'All'}\n`);

      recs.forEach(program => {
        console.log(formatProgram(program));
      });

      console.log('\n💡 Run "node affiliate-programs.cjs suggest HIGH" for high-priority only');
      break;

    case 'high-priority':
      console.log('\n=== HIGH PRIORITY AFFILIATE PROGRAMS ===\n');
      console.log('These programs have the highest potential for your audience:\n');

      getRecommendations('HIGH').forEach(program => {
        console.log(formatProgram(program));
      });
      break;

    case 'check':
      console.log('\n=== OPPORTUNITY CHECK ===\n');
      console.log('Based on your content, you should apply to:\n');

      // Top 5 recommendations
      getRecommendations('HIGH').slice(0, 5).forEach((program, i) => {
        console.log(`${i + 1}. ${program.name}`);
        console.log(`   ${program.reason}`);
        console.log(`   Apply: ${program.url}\n`);
      });
      break;

    case 'for-content':
      if (!args[1]) {
        console.log('Usage: node affiliate-programs.cjs for-content "content text or file path"');
        process.exit(1);
      }
      const content = args.slice(1).join(' ');
      const suggestions = getSuggestionsForContent(content);

      console.log('\n=== CONTENT-BASED SUGGESTIONS ===\n');
      if (suggestions.length === 0) {
        console.log('No specific affiliate matches found for this content.');
      } else {
        suggestions.forEach(program => {
          console.log(formatProgram(program));
        });
      }
      break;

    default:
      console.log(`
Affiliate Program Tracker for Periospot
========================================

Commands:
  list                    Show all enrolled programs
  suggest [priority]      Show program recommendations
  high-priority           Show only high-priority suggestions
  check                   Quick opportunity check
  for-content "text"      Get suggestions based on content

Priority levels: HIGH, MEDIUM, LOW

Examples:
  node affiliate-programs.cjs list
  node affiliate-programs.cjs suggest HIGH
  node affiliate-programs.cjs for-content "article about dental implants and bone grafts"

Current Programs: ${AFFILIATE_PROGRAMS.enrolled.length}
Recommendations: ${Object.values(AFFILIATE_PROGRAMS.recommendations).flat().length}
      `);
  }
}

// Export for use as module
module.exports = {
  AFFILIATE_PROGRAMS,
  getEnrolledPrograms,
  getRecommendations,
  getSuggestionsForContent,
  formatProgram
};

// Run CLI if called directly
if (require.main === module) {
  main().catch(console.error);
}
