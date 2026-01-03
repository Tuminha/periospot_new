const posts = require('../legacy-wordpress/content/posts.json');

let totalEmbeds = 0;
let properlyFormatted = 0;
let issues = [];

posts.forEach(post => {
  if (!post.content) return;

  // Count all YouTube iframes
  const iframes = post.content.match(/<iframe[^>]*youtube\.com\/embed/g) || [];
  totalEmbeds += iframes.length;

  // Count properly wrapped embeds
  const properEmbeds = post.content.match(/<figure class="wp-block-embed[^>]*>[\s\S]*?<iframe[^>]*youtube\.com\/embed/g) || [];
  properlyFormatted += properEmbeds.length;

  // Check for any remaining nested issues
  if (post.content.includes('wp-block-embed__wrapper"><figure')) {
    issues.push(post.slug + ' (nested figures)');
  }

  // Check for plain YouTube URLs not in iframes (ignore those in HTML comments)
  // First, strip HTML comments to avoid false positives
  const contentWithoutComments = post.content.replace(/<!--[\s\S]*?-->/g, '');
  const plainUrlRegex = /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}/g;
  let match;
  let plainCount = 0;
  while ((match = plainUrlRegex.exec(contentWithoutComments)) !== null) {
    // Check if this URL is inside an iframe src or href
    const before = contentWithoutComments.substring(Math.max(0, match.index - 50), match.index);
    if (!before.includes('src="') && !before.includes("src='") && !before.includes('href="') && !before.includes("href='")) {
      plainCount++;
    }
  }
  if (plainCount > 0) {
    issues.push(post.slug + ' (plain URLs: ' + plainCount + ')');
  }
});

console.log('📊 YouTube Embed Summary:');
console.log('------------------------');
console.log('Total YouTube iframes:', totalEmbeds);
console.log('Properly formatted:', properlyFormatted);
console.log('');
if (issues.length > 0) {
  console.log('⚠️  Remaining issues (' + issues.length + '):');
  issues.forEach(i => console.log('   -', i));
} else {
  console.log('✅ All YouTube embeds are properly formatted!');
}
