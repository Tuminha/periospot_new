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
posts.forEach((post) => {
  if (!post.content) return;

  let content = post.content;
  let modified = false;

  // Pattern 1: Fix double-nested wp-block-embed figures
  // This matches patterns like <figure class="wp-block-embed..."><div class="wp-block-embed__wrapper"><figure class="wp-block-embed...">
  const doubleNestedRegex = /<figure class="wp-block-embed[^"]*">\s*<div class="wp-block-embed__wrapper">\s*<figure class="wp-block-embed[^"]*">\s*<div class="wp-block-embed__wrapper">\s*<iframe[^>]*youtube\.com\/embed\/([a-zA-Z0-9_-]{11})[^>]*><\/iframe>\s*<\/div>\s*<\/figure>\s*<\/div>\s*<\/figure>/gi;

  content = content.replace(doubleNestedRegex, (match, videoId) => {
    modified = true;
    totalFixed++;
    return createResponsiveEmbed(videoId);
  });

  // Pattern 2: Fix any remaining malformed nested structures
  // Match figure containing another figure with YouTube iframe
  const nestedFigureRegex = /<figure[^>]*>\s*<div[^>]*>\s*<figure[^>]*wp-block-embed[^>]*>[\s\S]*?<iframe[^>]*youtube\.com\/embed\/([a-zA-Z0-9_-]{11})[^>]*>[\s\S]*?<\/figure>\s*<\/div>\s*<\/figure>/gi;

  content = content.replace(nestedFigureRegex, (match, videoId) => {
    modified = true;
    totalFixed++;
    return createResponsiveEmbed(videoId);
  });

  // Pattern 3: Fix triple or more nested wp-block-embed (just in case)
  let prevContent;
  do {
    prevContent = content;
    content = content.replace(
      /<figure class="wp-block-embed[^"]*">\s*<div class="wp-block-embed__wrapper">\s*(<figure class="wp-block-embed[\s\S]*?<\/figure>)\s*<\/div>\s*<\/figure>/gi,
      '$1'
    );
    if (content !== prevContent) {
      modified = true;
      totalFixed++;
    }
  } while (content !== prevContent);

  if (modified) {
    post.content = content;
    postsModified++;
    console.log(`✅ Cleaned: ${post.slug}`);
  }
});

// Save the modified posts
fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));

console.log(`\n## Summary`);
console.log(`- Posts cleaned: ${postsModified}`);
console.log(`- Total fixes: ${totalFixed}`);
console.log(`\n✅ Changes saved to posts.json`);
