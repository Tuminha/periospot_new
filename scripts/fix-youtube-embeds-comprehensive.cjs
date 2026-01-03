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
<iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>
</div>
</figure>`;
}

// Extract video ID from various YouTube URL formats
function extractVideoId(url) {
  if (!url) return null;
  
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

  // Pattern 1: WordPress shortcode [embed]https://youtube.com/watch?v=VIDEO_ID[/embed]
  const shortcodeRegex = /\[embed\](https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}[^\]]*)\[\/embed\]/gi;
  content = content.replace(shortcodeRegex, (match, url) => {
    const videoId = extractVideoId(url);
    if (videoId) {
      modified = true;
      totalFixed++;
      return createResponsiveEmbed(videoId);
    }
    return match;
  });

  // Pattern 2: Bare iframe without proper wrapper
  // <iframe src="https://www.youtube.com/embed/VIDEO_ID" ...></iframe>
  const bareIframeRegex = /<iframe([^>]*src=["']https?:\/\/(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})[^"']*["'][^>]*)><\/iframe>/gi;
  content = content.replace(bareIframeRegex, (match, iframeAttrs, videoId) => {
    // Check if already wrapped properly
    const beforeMatch = content.substring(Math.max(0, content.indexOf(match) - 200), content.indexOf(match));
    if (beforeMatch.includes('wp-block-embed__wrapper')) return match;
    
    modified = true;
    totalFixed++;
    return createResponsiveEmbed(videoId);
  });

  // Pattern 3: WordPress Gutenberg embed block with plain URL in wrapper
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

  // Pattern 4: WordPress comment block with URL followed by empty embed
  // <!-- wp:embed {"url":"https://youtu.be/..."} -->
  // <figure class="wp-block-embed"><div class="wp-block-embed__wrapper"></div></figure>
  // <!-- /wp:embed -->
  const wpCommentRegex = /<!-- wp:embed[^>]*\{[^}]*"url":\s*"(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}[^"]*)"[^}]*\}[^>]* -->\s*<figure class="wp-block-embed[^"]*">\s*<div class="wp-block-embed__wrapper">\s*(?:https?:\/\/[^\s<]+)?\s*<\/div>\s*<\/figure>\s*<!-- \/wp:embed -->/gi;
  content = content.replace(wpCommentRegex, (match, url) => {
    const videoId = extractVideoId(url);
    if (videoId) {
      modified = true;
      totalFixed++;
      return createResponsiveEmbed(videoId);
    }
    return match;
  });

  // Pattern 5: Plain YouTube URLs on their own (not in links or iframes)
  // This is more complex - need to be careful not to replace URLs that are already processed
  // Look for URLs that appear between HTML tags or at paragraph boundaries
  const plainUrlRegex = /(?:<p[^>]*>|>)\s*(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S*)?)\s*(?:<\/p>|<)/gi;
  content = content.replace(plainUrlRegex, (match, url, videoId, offset) => {
    // Check context - skip if inside a link or iframe
    const beforeContext = content.substring(Math.max(0, offset - 100), offset);
    const afterContext = content.substring(offset + match.length, Math.min(content.length, offset + match.length + 100));
    
    if (beforeContext.includes('href=') || beforeContext.includes('src=') || 
        beforeContext.includes('wp-block-embed') || afterContext.includes('</a>')) {
      return match;
    }
    
    modified = true;
    totalFixed++;
    return match.replace(url, createResponsiveEmbed(videoId));
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
