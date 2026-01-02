import { legacyPosts } from "@/data/legacyPosts";

export type Language = "en" | "es" | "pt" | "zh";

export type PostSummary = {
  id: number;
  slug: string;
  title: string;
  date: string;
  categories: string[];
  category: string;
  excerpt: string;
  language: Language;
  author: string;
  authorAvatar: string;
  readTimeMinutes: number;
  image: string;
  views: number;
};

export type PostDetail = PostSummary & {
  content: string;
  tableOfContents: { id: string; title: string }[];
  authorBio: string;
};

const fallbackImages = [
  "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=1200&q=80",
  "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1200&q=80",
  "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=1200&q=80",
  "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&q=80",
  "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=1200&q=80",
  "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=1200&q=80",
];

const categoryImages: Record<string, string> = {
  Implantology: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=1200&q=80",
  Periodontics: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1200&q=80",
  Aesthetics: "https://images.unsplash.com/photo-1501901609772-df0848060b33?w=1200&q=80",
  "Periospot Hacks": "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=1200&q=80",
  "Periospot Bookshelf": "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=1200&q=80",
  "Periospot Patron": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
  "Periospot for Patients": "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=1200&q=80",
};

const author = "Periospot Team";
const authorAvatar = "PT";

const getPrimaryCategory = (categories: string[]) => {
  if (!categories || categories.length === 0) {
    return "General";
  }

  const nonEmpty = categories.find((category) => category && category !== "Uncategorized");
  return nonEmpty || "General";
};

const estimateReadTime = (excerpt: string) => {
  const words = excerpt.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(6, Math.round(words / 28));
  return minutes;
};

export const postSummaries: PostSummary[] = legacyPosts.map((post, index) => {
  const category = getPrimaryCategory(post.categories);
  const image = categoryImages[category] || fallbackImages[index % fallbackImages.length];
  const excerpt = post.excerpt || "Full article content is being migrated.";

  return {
    id: index + 1,
    slug: post.slug,
    title: post.title || "Untitled article",
    date: post.date,
    categories: post.categories,
    category,
    excerpt,
    language: post.language,
    author,
    authorAvatar,
    readTimeMinutes: estimateReadTime(excerpt),
    image,
    views: Math.max(120, 1600 - index * 9),
  };
});

export const getPostsByLanguage = (language: Language) =>
  postSummaries.filter((post) => post.language === language);

export const getPostsByCategory = (category: string) =>
  postSummaries.filter((post) => post.categories.includes(category) || post.category === category);

export const getPostPath = (post: PostSummary) => {
  if (post.language === "es") {
    return `/articles/spanish/${post.slug}`;
  }

  if (post.language === "pt") {
    return `/articles/portuguese/${post.slug}`;
  }

  if (post.language === "zh") {
    return `/articles/chinese/${post.slug}`;
  }

  return `/blog/${post.slug}`;
};

export const formatDate = (dateString: string, locale = "en-US") => {
  const normalized = dateString.includes("T") ? dateString : dateString.replace(" ", "T");
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatReadTime = (minutes: number, language: Language) => {
  const labels: Record<Language, string> = {
    en: "min read",
    es: "min lectura",
    pt: "min leitura",
    zh: "分钟阅读",
  };

  return `${minutes} ${labels[language]}`;
};

const defaultTableOfContents = [
  { id: "overview", title: "Overview" },
  { id: "key-takeaways", title: "Key takeaways" },
  { id: "clinical-notes", title: "Clinical notes" },
];

const buildFallbackContent = (title: string) => `
  <p class="lead">Content for "${title}" is being migrated from WordPress. This placeholder keeps the page structure intact while we move the full article.</p>

  <h2 id="overview">Overview</h2>
  <p>We will surface the full introduction, clinical context, and outcomes once the migration is complete.</p>

  <h2 id="key-takeaways">Key takeaways</h2>
  <p>Highlights, protocols, and evidence summaries will appear here after review.</p>

  <h2 id="clinical-notes">Clinical notes</h2>
  <p>Case images, step-by-step guidance, and references will be restored soon.</p>
`;

const contentOverrides: Record<string, Partial<PostDetail>> = {};

const defaultAuthorBio =
  "Clinical education team focused on periodontics, implantology, and evidence-based workflows.";

export const getPostDetail = (slug: string | undefined, language: Language) => {
  const fallback = postSummaries.find((post) => post.language === language) || postSummaries[0];
  const summary = (slug && postSummaries.find((post) => post.slug === slug)) || fallback;

  if (!summary) {
    return null;
  }

  const override = contentOverrides[summary.slug] || {};

  return {
    ...summary,
    authorBio: override.authorBio || defaultAuthorBio,
    content: override.content || buildFallbackContent(summary.title),
    tableOfContents: override.tableOfContents || defaultTableOfContents,
  };
};
