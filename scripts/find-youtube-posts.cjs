const fs = require('fs');
const path = require('path');

const postsPath = path.join(__dirname, '..', 'legacy-wordpress', 'content', 'posts.json');
const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));

// Find posts with YouTube content
const postsWithYoutube = posts.filter(post => {
  const content = post.content || '';
  return /youtube\.com|youtu\.be/i.test(content);
});

console.log(`## Posts with YouTube Content (${postsWithYoutube.length} total)\n`);

const needsFixList = [];

postsWithYoutube.forEach((post, i) => {
  const content = post.content || '';

  // Check for different YouTube patterns
  const hasIframe = /<iframe[^>]*youtube/i.test(content);
  const hasResponsiveWrapper = /wp-block-embed|video-container|responsive|embed-responsive/i.test(content);

  // Extract video IDs
  const videoIds = [];
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (!videoIds.includes(match[1])) {
      videoIds.push(match[1]);
    }
  }

  // Check if there's a plain URL not in an iframe src
  const allYoutubeUrls = (content.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}/gi) || []).length;
  const embedUrls = (content.match(/src=["']https?:\/\/(?:www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]{11}/gi) || []).length;
  const hasPlainUrl = allYoutubeUrls > 0;

  const needsFix = hasPlainUrl || (hasIframe && !hasResponsiveWrapper);

  if (needsFix) {
    needsFixList.push({
      slug: post.slug,
      videoIds,
      hasPlainUrl,
      hasIframe,
      hasResponsiveWrapper
    });
  }

  console.log(`${i+1}. **${post.slug}**`);
  console.log(`   - Status: ${needsFix ? '❌ NEEDS FIX' : '✅ OK'}`);
  console.log(`   - Has iframe: ${hasIframe}, Has wrapper: ${hasResponsiveWrapper}, Plain URLs: ${allYoutubeUrls}`);
  console.log(`   - Video IDs: ${videoIds.join(', ')}`);
  console.log('');
});

console.log('\n## Summary');
console.log(`- Total posts with YouTube: ${postsWithYoutube.length}`);
console.log(`- Posts needing fixes: ${needsFixList.length}`);
console.log('\n## Posts to Fix:');
needsFixList.forEach((post, i) => {
  console.log(`${i+1}. ${post.slug} (Videos: ${post.videoIds.join(', ')})`);
});
