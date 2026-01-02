import rawPosts from "./posts.json";

export type LegacyPost = {
  id: number | string;
  slug: string;
  title: string;
  date: string;
  categories: string[];
  excerpt: string;
  language: "en" | "es" | "pt" | "zh";
  content: string;
  author: string;
  tags: string[];
  featured_image: string;
  status: string;
};

const normalizeLanguage = (language?: string): LegacyPost["language"] => {
  const normalized = (language || "en").toLowerCase();
  if (normalized === "es" || normalized === "pt" || normalized === "zh" || normalized === "en") {
    return normalized as LegacyPost["language"];
  }
  return "en";
};

const normalizeArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

export const legacyPosts: LegacyPost[] = (rawPosts as LegacyPost[]).map((post, index) => ({
  id: post.id ?? index + 1,
  slug: post.slug || `post-${index + 1}`,
  title: post.title || "Untitled article",
  date: post.date || "",
  categories: normalizeArray(post.categories),
  excerpt: post.excerpt || "",
  language: normalizeLanguage(post.language),
  content: post.content || "",
  author: post.author || "",
  tags: normalizeArray(post.tags),
  featured_image: post.featured_image || "",
  status: post.status || "publish",
}));
