// MCP Tools for Page Analysis and Content Inspection
// Gives Claude full visibility into what's rendered on pages

import type { SupabaseClient } from '@supabase/supabase-js';
import type { MCPToolManifest } from '@/lib/types/mcp';

// =============================================================================
// TOOL MANIFESTS
// =============================================================================

export const pageToolManifests: MCPToolManifest[] = [
  {
    name: 'analyze_page',
    description: 'Fetch and analyze a live page from the Periospot website. Returns the full HTML content, extracted text, images, links, and meta tags. Use this to see exactly what visitors see on any page.',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Full URL or path to analyze (e.g., "https://periospot.com/blog/bone-remodeling" or "/blog/bone-remodeling")',
        },
        include_html: {
          type: 'boolean',
          description: 'Include the raw HTML in the response (can be large)',
          default: false,
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'check_page_seo',
    description: 'Analyze SEO elements of a page including meta tags, Open Graph tags, structured data, headings, and more. Use this to audit SEO for any page.',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Full URL or path to check (e.g., "/blog/dental-implants")',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'get_page_images',
    description: 'Get all images on a specific page with their URLs, alt text, dimensions, and loading status. Use this to verify images are displaying correctly.',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Full URL or path to check',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'get_page_links',
    description: 'Get all links on a page including internal links, external links, and broken links. Useful for navigation and link auditing.',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Full URL or path to check',
        },
        check_broken: {
          type: 'boolean',
          description: 'Check if links are broken (slower but more thorough)',
          default: false,
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'get_site_structure',
    description: 'Get the overall structure of the Periospot website including all main pages, blog posts, and navigation. Provides a complete sitemap.',
    parameters: {
      type: 'object',
      properties: {
        include_posts: {
          type: 'boolean',
          description: 'Include all blog posts in the structure',
          default: true,
        },
        include_drafts: {
          type: 'boolean',
          description: 'Include draft posts (not public)',
          default: false,
        },
      },
      required: [],
    },
  },
  {
    name: 'compare_post_versions',
    description: 'Compare the database content of a post with what is actually rendered on the live page. Useful for debugging display issues.',
    parameters: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'The post slug to compare',
        },
      },
      required: ['slug'],
    },
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://periospot.com';

function normalizeUrl(urlOrPath: string): string {
  if (urlOrPath.startsWith('http')) {
    return urlOrPath;
  }
  const path = urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`;
  return `${BASE_URL}${path}`;
}

async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Periospot-MCP-Analyzer/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function extractMetaTags(html: string): Record<string, string> {
  const meta: Record<string, string> = {};

  // Title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleMatch) meta.title = titleMatch[1].trim();

  // Meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  if (descMatch) meta.description = descMatch[1];

  // Meta keywords
  const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']*)["']/i);
  if (keywordsMatch) meta.keywords = keywordsMatch[1];

  // Canonical URL
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  if (canonicalMatch) meta.canonical = canonicalMatch[1];

  // Open Graph tags
  const ogMatches = html.matchAll(/<meta[^>]*property=["']og:([^"']*)["'][^>]*content=["']([^"']*)["']/gi);
  for (const match of ogMatches) {
    meta[`og:${match[1]}`] = match[2];
  }

  // Twitter tags
  const twitterMatches = html.matchAll(/<meta[^>]*name=["']twitter:([^"']*)["'][^>]*content=["']([^"']*)["']/gi);
  for (const match of twitterMatches) {
    meta[`twitter:${match[1]}`] = match[2];
  }

  return meta;
}

function extractImages(html: string): Array<{
  src: string;
  alt: string;
  width?: string;
  height?: string;
  loading?: string;
}> {
  const images: Array<{
    src: string;
    alt: string;
    width?: string;
    height?: string;
    loading?: string;
  }> = [];

  const imgMatches = html.matchAll(/<img[^>]*>/gi);
  for (const match of imgMatches) {
    const imgTag = match[0];

    const srcMatch = imgTag.match(/src=["']([^"']*)["']/i);
    const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
    const widthMatch = imgTag.match(/width=["']?(\d+)["']?/i);
    const heightMatch = imgTag.match(/height=["']?(\d+)["']?/i);
    const loadingMatch = imgTag.match(/loading=["']([^"']*)["']/i);

    if (srcMatch) {
      images.push({
        src: srcMatch[1],
        alt: altMatch ? altMatch[1] : '',
        width: widthMatch ? widthMatch[1] : undefined,
        height: heightMatch ? heightMatch[1] : undefined,
        loading: loadingMatch ? loadingMatch[1] : undefined,
      });
    }
  }

  return images;
}

function extractLinks(html: string, baseUrl: string): Array<{
  href: string;
  text: string;
  type: 'internal' | 'external' | 'anchor' | 'mailto' | 'tel';
}> {
  const links: Array<{
    href: string;
    text: string;
    type: 'internal' | 'external' | 'anchor' | 'mailto' | 'tel';
  }> = [];

  const linkMatches = html.matchAll(/<a[^>]*href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gi);
  for (const match of linkMatches) {
    const href = match[1];
    const text = match[2].trim();

    let type: 'internal' | 'external' | 'anchor' | 'mailto' | 'tel' = 'external';
    if (href.startsWith('#')) {
      type = 'anchor';
    } else if (href.startsWith('mailto:')) {
      type = 'mailto';
    } else if (href.startsWith('tel:')) {
      type = 'tel';
    } else if (href.startsWith('/') || href.includes('periospot.com')) {
      type = 'internal';
    }

    links.push({ href, text, type });
  }

  return links;
}

function extractHeadings(html: string): Array<{ level: number; text: string }> {
  const headings: Array<{ level: number; text: string }> = [];

  const headingMatches = html.matchAll(/<h([1-6])[^>]*>([^<]*)<\/h\1>/gi);
  for (const match of headingMatches) {
    headings.push({
      level: parseInt(match[1]),
      text: match[2].trim(),
    });
  }

  return headings;
}

function extractTextContent(html: string): string {
  // Remove scripts and styles
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');

  return text;
}

function extractStructuredData(html: string): unknown[] {
  const structuredData: unknown[] = [];

  const jsonLdMatches = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const match of jsonLdMatches) {
    try {
      const data = JSON.parse(match[1]);
      structuredData.push(data);
    } catch (e) {
      // Invalid JSON, skip
    }
  }

  return structuredData;
}

// =============================================================================
// TOOL HANDLERS
// =============================================================================

export const pageTools = {
  async analyze_page(
    params: { url: string; include_html?: boolean },
    _supabase: SupabaseClient
  ): Promise<{
    url: string;
    status: 'success' | 'error';
    meta: Record<string, string>;
    headings: Array<{ level: number; text: string }>;
    images: Array<{ src: string; alt: string; width?: string; height?: string }>;
    links: { internal: number; external: number; total: number };
    content_preview: string;
    word_count: number;
    html?: string;
  }> {
    const url = normalizeUrl(params.url);

    try {
      const html = await fetchPage(url);
      const meta = extractMetaTags(html);
      const headings = extractHeadings(html);
      const images = extractImages(html);
      const links = extractLinks(html, url);
      const textContent = extractTextContent(html);

      const internalLinks = links.filter(l => l.type === 'internal').length;
      const externalLinks = links.filter(l => l.type === 'external').length;

      return {
        url,
        status: 'success',
        meta,
        headings,
        images,
        links: {
          internal: internalLinks,
          external: externalLinks,
          total: links.length,
        },
        content_preview: textContent.substring(0, 500) + (textContent.length > 500 ? '...' : ''),
        word_count: textContent.split(/\s+/).filter(w => w.length > 0).length,
        ...(params.include_html ? { html } : {}),
      };
    } catch (error) {
      return {
        url,
        status: 'error',
        meta: {},
        headings: [],
        images: [],
        links: { internal: 0, external: 0, total: 0 },
        content_preview: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        word_count: 0,
      };
    }
  },

  async check_page_seo(
    params: { url: string },
    _supabase: SupabaseClient
  ): Promise<{
    url: string;
    score: number;
    issues: string[];
    warnings: string[];
    passed: string[];
    meta: Record<string, string>;
    headings: Array<{ level: number; text: string }>;
    structured_data: unknown[];
    images_without_alt: number;
    total_images: number;
  }> {
    const url = normalizeUrl(params.url);
    const html = await fetchPage(url);

    const meta = extractMetaTags(html);
    const headings = extractHeadings(html);
    const images = extractImages(html);
    const structuredData = extractStructuredData(html);

    const issues: string[] = [];
    const warnings: string[] = [];
    const passed: string[] = [];

    // Check title
    if (!meta.title) {
      issues.push('Missing page title');
    } else if (meta.title.length < 30) {
      warnings.push(`Title is too short (${meta.title.length} chars, recommended 50-60)`);
    } else if (meta.title.length > 60) {
      warnings.push(`Title is too long (${meta.title.length} chars, recommended 50-60)`);
    } else {
      passed.push('Title length is optimal');
    }

    // Check description
    if (!meta.description) {
      issues.push('Missing meta description');
    } else if (meta.description.length < 120) {
      warnings.push(`Meta description is short (${meta.description.length} chars, recommended 150-160)`);
    } else if (meta.description.length > 160) {
      warnings.push(`Meta description is too long (${meta.description.length} chars, recommended 150-160)`);
    } else {
      passed.push('Meta description length is optimal');
    }

    // Check Open Graph
    if (!meta['og:title']) {
      warnings.push('Missing Open Graph title');
    } else {
      passed.push('Open Graph title present');
    }

    if (!meta['og:description']) {
      warnings.push('Missing Open Graph description');
    } else {
      passed.push('Open Graph description present');
    }

    if (!meta['og:image']) {
      issues.push('Missing Open Graph image (social sharing will have no image)');
    } else {
      passed.push('Open Graph image present');
    }

    // Check headings
    const h1Count = headings.filter(h => h.level === 1).length;
    if (h1Count === 0) {
      issues.push('Missing H1 heading');
    } else if (h1Count > 1) {
      warnings.push(`Multiple H1 headings found (${h1Count}), should have only one`);
    } else {
      passed.push('Single H1 heading present');
    }

    // Check images
    const imagesWithoutAlt = images.filter(img => !img.alt || img.alt.trim() === '').length;
    if (imagesWithoutAlt > 0) {
      warnings.push(`${imagesWithoutAlt} images missing alt text`);
    } else if (images.length > 0) {
      passed.push('All images have alt text');
    }

    // Check structured data
    if (structuredData.length === 0) {
      warnings.push('No structured data (JSON-LD) found');
    } else {
      passed.push(`Structured data present (${structuredData.length} schemas)`);
    }

    // Check canonical
    if (!meta.canonical) {
      warnings.push('No canonical URL specified');
    } else {
      passed.push('Canonical URL specified');
    }

    // Calculate score
    const totalChecks = issues.length + warnings.length + passed.length;
    const score = Math.round((passed.length / totalChecks) * 100);

    return {
      url,
      score,
      issues,
      warnings,
      passed,
      meta,
      headings,
      structured_data: structuredData,
      images_without_alt: imagesWithoutAlt,
      total_images: images.length,
    };
  },

  async get_page_images(
    params: { url: string },
    _supabase: SupabaseClient
  ): Promise<{
    url: string;
    total_images: number;
    images: Array<{
      src: string;
      alt: string;
      width?: string;
      height?: string;
      loading?: string;
      has_alt: boolean;
      is_external: boolean;
    }>;
    issues: string[];
  }> {
    const url = normalizeUrl(params.url);
    const html = await fetchPage(url);
    const images = extractImages(html);

    const issues: string[] = [];

    const enrichedImages = images.map(img => {
      const hasAlt = Boolean(img.alt && img.alt.trim().length > 0);
      const isExternal = img.src.startsWith('http') && !img.src.includes('periospot.com') && !img.src.includes('supabase');

      if (!hasAlt) {
        issues.push(`Image missing alt text: ${img.src.substring(0, 50)}...`);
      }

      return {
        ...img,
        has_alt: hasAlt,
        is_external: isExternal,
      };
    });

    return {
      url,
      total_images: images.length,
      images: enrichedImages,
      issues,
    };
  },

  async get_page_links(
    params: { url: string; check_broken?: boolean },
    _supabase: SupabaseClient
  ): Promise<{
    url: string;
    total_links: number;
    internal_links: Array<{ href: string; text: string }>;
    external_links: Array<{ href: string; text: string }>;
    broken_links?: Array<{ href: string; status: number }>;
  }> {
    const url = normalizeUrl(params.url);
    const html = await fetchPage(url);
    const links = extractLinks(html, url);

    const internalLinks = links
      .filter(l => l.type === 'internal')
      .map(l => ({ href: l.href, text: l.text }));

    const externalLinks = links
      .filter(l => l.type === 'external')
      .map(l => ({ href: l.href, text: l.text }));

    let brokenLinks: Array<{ href: string; status: number }> | undefined;

    if (params.check_broken) {
      brokenLinks = [];
      const allUrls = [...internalLinks, ...externalLinks]
        .map(l => l.href)
        .filter(href => href.startsWith('http'));

      // Check up to 10 links to avoid timeout
      const urlsToCheck = allUrls.slice(0, 10);

      for (const linkUrl of urlsToCheck) {
        try {
          const response = await fetch(linkUrl, { method: 'HEAD' });
          if (!response.ok) {
            brokenLinks.push({ href: linkUrl, status: response.status });
          }
        } catch {
          brokenLinks.push({ href: linkUrl, status: 0 });
        }
      }
    }

    return {
      url,
      total_links: links.length,
      internal_links: internalLinks,
      external_links: externalLinks,
      ...(brokenLinks !== undefined ? { broken_links: brokenLinks } : {}),
    };
  },

  async get_site_structure(
    params: { include_posts?: boolean; include_drafts?: boolean },
    supabase: SupabaseClient
  ): Promise<{
    main_pages: Array<{ path: string; title: string }>;
    blog_posts?: Array<{ slug: string; title: string; status: string; published_at: string | null }>;
    categories: Array<{ slug: string; name: string; post_count: number }>;
    total_posts: number;
    total_published: number;
  }> {
    const { include_posts = true, include_drafts = false } = params;

    // Main pages (static)
    const mainPages = [
      { path: '/', title: 'Home' },
      { path: '/blog', title: 'Blog' },
      { path: '/about', title: 'About' },
      { path: '/courses', title: 'Courses' },
      { path: '/contact', title: 'Contact' },
    ];

    // Get categories with post counts
    const { data: categories } = await supabase
      .from('categories')
      .select('slug, name');

    // Get posts
    let postsQuery = supabase
      .from('posts')
      .select('slug, title, status, published_at, categories')
      .order('published_at', { ascending: false });

    if (!include_drafts) {
      postsQuery = postsQuery.eq('status', 'published');
    }

    const { data: posts, count } = await postsQuery;

    // Count posts per category
    const categoryCounts: Record<string, number> = {};
    posts?.forEach(post => {
      (post.categories || []).forEach((cat: string) => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    });

    const categoriesWithCounts = (categories || []).map(cat => ({
      slug: cat.slug,
      name: cat.name,
      post_count: categoryCounts[cat.slug] || 0,
    }));

    const publishedCount = posts?.filter(p => p.status === 'published').length || 0;

    return {
      main_pages: mainPages,
      ...(include_posts ? {
        blog_posts: posts?.map(p => ({
          slug: p.slug,
          title: p.title,
          status: p.status,
          published_at: p.published_at,
        })),
      } : {}),
      categories: categoriesWithCounts,
      total_posts: posts?.length || 0,
      total_published: publishedCount,
    };
  },

  async compare_post_versions(
    params: { slug: string },
    supabase: SupabaseClient
  ): Promise<{
    slug: string;
    database: {
      title: string;
      status: string;
      featured_image_url: string | null;
      meta_title: string | null;
      meta_description: string | null;
      content_length: number;
      has_content_html: boolean;
    };
    live_page: {
      status: 'success' | 'error' | 'not_found';
      title?: string;
      meta_description?: string;
      og_image?: string;
      images_found: number;
      headings: Array<{ level: number; text: string }>;
    };
    discrepancies: string[];
  }> {
    const { slug } = params;

    // Get from database
    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !post) {
      throw new Error(`Post not found: ${slug}`);
    }

    const database = {
      title: post.title,
      status: post.status,
      featured_image_url: post.featured_image_url,
      meta_title: post.meta_title,
      meta_description: post.meta_description,
      content_length: (post.content || '').length,
      has_content_html: !!post.content_html,
    };

    // Try to fetch live page
    const discrepancies: string[] = [];
    let livePage: {
      status: 'success' | 'error' | 'not_found';
      title?: string;
      meta_description?: string;
      og_image?: string;
      images_found: number;
      headings: Array<{ level: number; text: string }>;
    };

    try {
      const url = `${BASE_URL}/blog/${slug}`;
      const html = await fetchPage(url);
      const meta = extractMetaTags(html);
      const headings = extractHeadings(html);
      const images = extractImages(html);

      livePage = {
        status: 'success',
        title: meta.title,
        meta_description: meta.description,
        og_image: meta['og:image'],
        images_found: images.length,
        headings,
      };

      // Check for discrepancies
      if (meta.title && !meta.title.includes(post.title)) {
        discrepancies.push(`Title mismatch: DB="${post.title}" vs Page="${meta.title}"`);
      }

      if (post.featured_image_url && !images.some(img => img.src.includes(post.featured_image_url!))) {
        discrepancies.push('Featured image from database not found on page');
      }

      if (post.meta_description && meta.description !== post.meta_description) {
        discrepancies.push('Meta description differs between database and rendered page');
      }

    } catch (error) {
      livePage = {
        status: post.status === 'published' ? 'error' : 'not_found',
        images_found: 0,
        headings: [],
      };

      if (post.status === 'published') {
        discrepancies.push('Published post not accessible at expected URL');
      }
    }

    return {
      slug,
      database,
      live_page: livePage,
      discrepancies,
    };
  },
};
