const posts = require('../legacy-wordpress/content/posts.json');
const post = posts.find(p => p.slug === 'two-ways-to-restore-edentulous-spaces-in-the-aesthetic-zone');

// Find plain YouTube URLs
const urlRegex = /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}/g;
let match;
while ((match = urlRegex.exec(post.content)) !== null) {
  const idx = match.index;
  const before = post.content.substring(Math.max(0, idx - 200), idx);
  const after = post.content.substring(idx, idx + match[0].length + 100);

  // Check if it's in an iframe src or href
  if (before.includes('src="') || before.includes("src='") || before.includes('href="') || before.includes("href='")) {
    // Check if the src/href is closed before our URL
    const lastSrc = Math.max(before.lastIndexOf('src="'), before.lastIndexOf("src='"));
    const lastHref = Math.max(before.lastIndexOf('href="'), before.lastIndexOf("href='"));
    const lastQuote = Math.max(before.lastIndexOf('"'), before.lastIndexOf("'"));

    if (lastQuote > lastSrc && lastQuote > lastHref) {
      // URL is not inside src or href
      console.log('--- Plain URL found ---');
      console.log('Before:', before.slice(-100));
      console.log('URL:', match[0]);
      console.log('After:', after.slice(0, 100));
    }
  } else {
    console.log('--- Plain URL found ---');
    console.log('Before:', before.slice(-100));
    console.log('URL:', match[0]);
    console.log('After:', after.slice(0, 100));
  }
}
