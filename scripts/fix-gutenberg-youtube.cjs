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

// Extract video ID from various YouTube URL formats
function extractVideoId(url) {
  // youtu.be/VIDEO_ID
  let match = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  // youtube.com/watch?v=VIDEO_ID
  match = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  // youtube.com/embed/VIDEO_ID
  match = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  return null;
}

// Fix each post
posts.forEach((post) => {
  if (!post.content) return;

  let content = post.content;
  let modified = false;

  // Pattern 1: WordPress Gutenberg embed block with plain YouTube URL
  // <figure class="wp-block-embed"><div class="wp-block-embed__wrapper">\nURL\n</div></figure>
  const gutenbergEmbedRegex = /<figure class="wp-block-embed[^"]*">\s*<div class="wp-block-embed__wrapper">\s*(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}[^\s<]*)\s*<\/div>\s*<\/figure>/gi;

  content = content.replace(gutenbergEmbedRegex, (match, url) => {
    const videoId = extractVideoId(url);
    if (videoId) {
      modified = true;
      totalFixed++;
      return createResponsiveEmbed(videoId);
    }
    return match;
  });

  // Pattern 2: Just a plain YouTube URL on its own line (not in a link)
  // Look for URLs that are between HTML tags or at line boundaries
  const plainUrlRegex = />(\s*)(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}[^\s<]*)(\s*)</gi;

  content = content.replace(plainUrlRegex, (match, before, url, after) => {
    const videoId = extractVideoId(url);
    if (videoId) {
      // Make sure this isn't already inside an iframe or a link
      if (!match.includes('href=') && !match.includes('src=')) {
        modified = true;
        totalFixed++;
        return '>' + before + createResponsiveEmbed(videoId) + after + '<';
      }
    }
    return match;
  });

  // Pattern 3: WordPress comment block with URL
  // <!-- wp:embed {"url":"https://youtu.be/..."} -->
  const wpCommentRegex = /<!-- wp:embed \{"url":"(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}[^"]*)"[^}]*\} -->\s*<figure class="wp-block-embed[^"]*">\s*<div class="wp-block-embed__wrapper">\s*(?:https?:\/\/[^\s<]+)?\s*<\/div>\s*<\/figure>\s*<!-- \/wp:embed -->/gi;

  content = content.replace(wpCommentRegex, (match, url) => {
    const videoId = extractVideoId(url);
    if (videoId) {
      modified = true;
      totalFixed++;
      return createResponsiveEmbed(videoId);
    }
    return match;
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
console.log(`- Posts fixed: ${postsModified}`);
console.log(`- Total embeds fixed: ${totalFixed}`);
console.log(`\n✅ Changes saved to posts.json`);
