const fs = require('fs');
const path = require('path');

const postsPath = path.join(__dirname, '..', 'legacy-wordpress', 'content', 'posts.json');
const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));

let totalFixed = 0;
let postsModified = 0;

// Function to create a proper responsive YouTube embed
function createResponsiveEmbed(videoId) {
  return `<figure class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube">
<div class="wp-block-embed__wrapper">
<iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy" style="width:100%;aspect-ratio:16/9;"></iframe>
</div>
</figure>`;
}

// Fix each post
posts.forEach((post, index) => {
  if (!post.content) return;

  let content = post.content;
  let modified = false;

  // Pattern 1: Plain YouTube watch URLs (not in an iframe src)
  // Match: https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID
  const plainUrlRegex = /(?<!src=["'])(?<!href=["'])(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11}))(?![^<]*<\/iframe)/gi;

  let match;
  const urlsToReplace = [];

  // Collect all URLs to replace (to avoid issues with regex.exec and string modification)
  const tempContent = content;
  while ((match = plainUrlRegex.exec(tempContent)) !== null) {
    const fullUrl = match[1];
    const videoId = match[2];

    // Check if this URL is inside an anchor tag or already in an embed
    const before = tempContent.substring(Math.max(0, match.index - 100), match.index);
    const after = tempContent.substring(match.index, Math.min(tempContent.length, match.index + fullUrl.length + 50));

    // Skip if it's a link text or already in an iframe
    if (before.includes('href="') && !before.includes('">')) continue;
    if (after.includes('</a>') && !after.includes('<')) continue;

    urlsToReplace.push({ fullUrl, videoId, index: match.index });
  }

  // Replace from end to start to maintain indices
  urlsToReplace.reverse().forEach(({ fullUrl, videoId }) => {
    // Check if this specific URL is already properly embedded
    if (!content.includes(`embed/${videoId}`)) {
      content = content.replace(fullUrl, createResponsiveEmbed(videoId));
      modified = true;
      totalFixed++;
    }
  });

  // Pattern 2: Bare iframes without responsive wrapper
  const bareIframeRegex = /(?<!<div[^>]*>)\s*(<iframe[^>]*youtube\.com\/embed\/([a-zA-Z0-9_-]{11})[^>]*><\/iframe>)\s*(?!<\/div>)/gi;

  content = content.replace(bareIframeRegex, (match, iframe, videoId) => {
    // Check if already wrapped
    if (match.includes('wp-block-embed')) return match;

    modified = true;
    totalFixed++;
    return createResponsiveEmbed(videoId);
  });

  // Pattern 3: Old embed format without proper wrapper
  const oldEmbedRegex = /<div[^>]*class="[^"]*(?:video|embed)[^"]*"[^>]*>\s*<iframe[^>]*youtube\.com\/embed\/([a-zA-Z0-9_-]{11})[^>]*><\/iframe>\s*<\/div>/gi;

  content = content.replace(oldEmbedRegex, (match, videoId) => {
    if (match.includes('wp-block-embed__wrapper')) return match;

    modified = true;
    totalFixed++;
    return createResponsiveEmbed(videoId);
  });

  if (modified) {
    post.content = content;
    postsModified++;
    console.log(`✅ Fixed: ${post.slug}`);
  }
});

// Save the modified posts
fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));

console.log(`\n## Summary`);
console.log(`- Posts modified: ${postsModified}`);
console.log(`- Total embeds fixed: ${totalFixed}`);
console.log(`\n✅ Changes saved to posts.json`);
