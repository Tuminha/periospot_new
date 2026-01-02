import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { XMLParser } from "fast-xml-parser";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..", "..", "..");
const xmlPath = path.join(repoRoot, "legacy-wordpress", "export.xml");
const outputPath = path.resolve(scriptDir, "..", "src", "data", "legacyPosts.ts");

const languageMap: Record<string, "en" | "es" | "pt" | "zh"> = {
  "Blog English": "en",
  "Blog español": "es",
  "Blog português": "pt",
  "Blog in Chinese": "zh",
};

const stripHtml = (value: string) =>
  value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const normalizeArray = <T>(value: T | T[] | undefined) => {
  if (!value) {
    return [] as T[];
  }

  return Array.isArray(value) ? value : [value];
};

const getText = (value: unknown) => {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const text = record.text ?? record["#text"];
    if (typeof text === "string") {
      return text;
    }
  }

  return "";
};

const xmlRaw = fs.readFileSync(xmlPath, "utf8");
const xmlStart = xmlRaw.indexOf("<?xml");
if (xmlStart === -1) {
  throw new Error(`No XML declaration found in ${xmlPath}`);
}

const xml = xmlRaw.slice(xmlStart);
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "text",
  removeNSPrefix: false,
});

const parsed = parser.parse(xml);
const channel = parsed?.rss?.channel;
const items = normalizeArray(channel?.item);

const posts = items
  .filter((item) => item?.["wp:post_type"] === "post" && item?.["wp:status"] === "publish")
  .map((item) => {
    const categories = normalizeArray(item.category)
      .filter((category) => {
        if (typeof category === "string") {
          return true;
        }
        if (category && typeof category === "object") {
          return category["@_domain"] === "category";
        }
        return false;
      })
      .map((category) => getText(category))
      .filter(Boolean);

    const language = categories
      .map((category) => languageMap[category])
      .find((value) => value !== undefined) ?? "en";

    const excerptRaw = getText(item["excerpt:encoded"]);
    const excerpt = stripHtml(excerptRaw);

    return {
      slug: getText(item["wp:post_name"]),
      title: getText(item.title),
      date: getText(item["wp:post_date"]),
      categories,
      excerpt,
      language,
    };
  })
  .filter((post) => post.slug);

const output = `export type LegacyPost = {\n  slug: string;\n  title: string;\n  date: string;\n  categories: string[];\n  excerpt: string;\n  language: \"en\" | \"es\" | \"pt\" | \"zh\";\n};\n\nexport const legacyPosts: LegacyPost[] = ${JSON.stringify(
  posts,
  null,
  2
)};\n`;

fs.writeFileSync(outputPath, output, "utf8");
console.log(`Generated ${outputPath} with ${posts.length} posts.`);
