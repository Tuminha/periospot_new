import fs from "node:fs";
import path from "node:path";

const requiredFiles = [
  "legacy-wordpress/content/posts.json",
  "legacy-wordpress/content/products.json",
  "legacy-wordpress/content/pages.json",
  "legacy-wordpress/content/authors.json",
  "legacy-wordpress/content/categories.json",
];

const optionalFiles = [
  "legacy-wordpress/content/ebooks.json",
  "legacy-wordpress/content/comments.json",
  "legacy-wordpress/content/tags.json",
  "legacy-wordpress/content/product_categories.json",
  "legacy-wordpress/content/media.json",
];

const projectRoot = process.cwd();

const readJson = (filePath) => {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
};

const summarizeJson = (value) => {
  if (Array.isArray(value)) {
    return `array (${value.length})`;
  }
  if (value && typeof value === "object") {
    return `object (${Object.keys(value).length} keys)`;
  }
  return typeof value;
};

const validateFile = (relativePath, isRequired) => {
  const fullPath = path.resolve(projectRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    return {
      status: isRequired ? "missing" : "optional-missing",
      path: relativePath,
      detail: "not found",
    };
  }

  const stats = fs.statSync(fullPath);
  if (stats.size === 0) {
    return {
      status: isRequired ? "empty" : "optional-empty",
      path: relativePath,
      detail: "0 bytes",
    };
  }

  try {
    const data = readJson(fullPath);
    return {
      status: "ok",
      path: relativePath,
      detail: summarizeJson(data),
    };
  } catch (error) {
    return {
      status: isRequired ? "invalid" : "optional-invalid",
      path: relativePath,
      detail: `invalid JSON (${error.message})`,
    };
  }
};

const results = [
  ...requiredFiles.map((file) => validateFile(file, true)),
  ...optionalFiles.map((file) => validateFile(file, false)),
];

const failures = results.filter((result) =>
  ["missing", "empty", "invalid"].includes(result.status)
);

console.log("\nContent Export Validation");
console.log("==========================");
results.forEach((result) => {
  const label = result.status.padEnd(14);
  console.log(`${label} ${result.path} -> ${result.detail}`);
});

if (failures.length > 0) {
  console.log("\nRequired exports are missing or invalid. Fix the above files first.");
  process.exit(1);
}

console.log("\nAll required exports are present and valid.");
