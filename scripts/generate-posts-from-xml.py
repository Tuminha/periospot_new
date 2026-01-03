#!/usr/bin/env python3
"""Generate legacy-wordpress/content/posts.json from a WordPress export.xml."""

from __future__ import annotations

import json
import sys
from pathlib import Path
import xml.etree.ElementTree as ET

NAMESPACES = {
    "content": "http://purl.org/rss/1.0/modules/content/",
    "excerpt": "http://purl.org/rss/1.0/modules/excerpt/",
    "dc": "http://purl.org/dc/elements/1.1/",
    "wp": "http://wordpress.org/export/1.2/",
}

for prefix, uri in NAMESPACES.items():
    ET.register_namespace(prefix, uri)


def detect_language(categories: list[str], tags: list[str], slug: str, title: str) -> str:
    combined = " ".join(categories + tags + [slug, title]).lower()
    if any(token in combined for token in ["espanol", "español", "spanish"]):
        return "es"
    if any(token in combined for token in ["portugues", "português", "portuguese"]):
        return "pt"
    if any(token in combined for token in ["chinese", "中文", "chino"]):
        return "zh"
    return "en"


def text_or_empty(value: str | None) -> str:
    return value if value is not None else ""


def get_child_text(item: ET.Element, tag: str) -> str:
    return text_or_empty(item.findtext(tag, namespaces=NAMESPACES))


def load_xml(path: Path) -> ET.Element:
    raw = path.read_text(encoding="utf-8", errors="ignore")
    start_index = raw.find("<?xml")
    if start_index == -1:
        raise ValueError("XML declaration not found in export file")
    trimmed = raw[start_index:]
    return ET.fromstring(trimmed)


def get_channel(root: ET.Element) -> ET.Element:
    channel = root.find("channel")
    if channel is None:
        raise ValueError("Invalid WordPress export: missing channel")
    return channel


def build_attachment_index(items: list[ET.Element]) -> dict[str, str]:
    attachments: dict[str, str] = {}
    for item in items:
        post_type = get_child_text(item, "wp:post_type")
        if post_type != "attachment":
            continue
        post_id = get_child_text(item, "wp:post_id")
        url = get_child_text(item, "wp:attachment_url")
        if post_id and url:
            attachments[post_id] = url
    return attachments


def extract_categories(item: ET.Element) -> tuple[list[str], list[str]]:
    categories: list[str] = []
    tags: list[str] = []
    for category in item.findall("category"):
        domain = category.get("domain", "")
        name = text_or_empty(category.text).strip()
        if not name:
            continue
        if domain == "category":
            categories.append(name)
        elif domain == "post_tag":
            tags.append(name)
    return categories, tags


def extract_meta(item: ET.Element) -> dict[str, str]:
    meta: dict[str, str] = {}
    for meta_node in item.findall("wp:postmeta", namespaces=NAMESPACES):
        key = meta_node.findtext("wp:meta_key", namespaces=NAMESPACES)
        value = meta_node.findtext("wp:meta_value", namespaces=NAMESPACES)
        if key and value is not None:
            meta[key] = value
    return meta


def parse_json_meta(value: str) -> object:
    value = value.strip()
    if not value:
        return ""
    if value.startswith("{") or value.startswith("["):
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return value
    return value


def build_seo(meta: dict[str, str]) -> dict[str, object]:
    seo: dict[str, object] = {}

    def set_if_present(key: str, value: object) -> None:
        if value not in ("", None, [], {}):
            seo[key] = value

    set_if_present("title", meta.get("_yoast_wpseo_title", ""))
    set_if_present("description", meta.get("_yoast_wpseo_metadesc", ""))
    set_if_present("focus_keyword", meta.get("_yoast_wpseo_focuskw", ""))
    set_if_present("focus_keywords", parse_json_meta(meta.get("_yoast_wpseo_focuskeywords", "")))
    set_if_present("keyword_synonyms", parse_json_meta(meta.get("_yoast_wpseo_keywordsynonyms", "")))
    set_if_present("content_score", meta.get("_yoast_wpseo_content_score", ""))
    set_if_present("linkdex", meta.get("_yoast_wpseo_linkdex", ""))
    set_if_present(
        "estimated_reading_time_minutes",
        meta.get("_yoast_wpseo_estimated-reading-time-minutes", ""),
    )

    set_if_present("og_title", meta.get("_yoast_wpseo_opengraph-title", ""))
    set_if_present("og_description", meta.get("_yoast_wpseo_opengraph-description", ""))
    set_if_present("og_image", meta.get("_yoast_wpseo_opengraph-image", ""))
    set_if_present("og_image_id", meta.get("_yoast_wpseo_opengraph-image-id", ""))

    set_if_present("twitter_title", meta.get("_yoast_wpseo_twitter-title", ""))
    set_if_present("twitter_description", meta.get("_yoast_wpseo_twitter-description", ""))
    set_if_present("twitter_image", meta.get("_yoast_wpseo_twitter-image", ""))
    set_if_present("twitter_image_id", meta.get("_yoast_wpseo_twitter-image-id", ""))

    set_if_present("canonical", meta.get("_yoast_wpseo_canonical", ""))
    set_if_present("redirect", meta.get("_yoast_wpseo_redirect", ""))
    set_if_present("meta_robots", meta.get("_yoast_wpseo_meta-robots", ""))
    set_if_present("meta_robots_noindex", meta.get("_yoast_wpseo_meta-robots-noindex", ""))
    set_if_present("meta_robots_nofollow", meta.get("_yoast_wpseo_meta-robots-nofollow", ""))
    set_if_present("meta_robots_adv", meta.get("_yoast_wpseo_meta-robots-adv", ""))

    return seo


def extract_posts(channel: ET.Element) -> list[dict[str, object]]:
    items = channel.findall("item")
    attachments = build_attachment_index(items)
    posts: list[dict[str, object]] = []

    for item in items:
        post_type = get_child_text(item, "wp:post_type")
        if post_type != "post":
            continue

        wordpress_id = get_child_text(item, "wp:post_id")
        slug = get_child_text(item, "wp:post_name")
        title = text_or_empty(item.findtext("title"))
        excerpt = get_child_text(item, "excerpt:encoded")
        content = get_child_text(item, "content:encoded")
        author = get_child_text(item, "dc:creator")
        status = get_child_text(item, "wp:status") or "publish"
        published_at = get_child_text(item, "wp:post_date") or get_child_text(item, "pubDate")

        categories, tags = extract_categories(item)
        meta = extract_meta(item)
        seo = build_seo(meta)
        thumbnail_id = meta.get("_thumbnail_id", "")
        featured_image = attachments.get(thumbnail_id, "")
        language = detect_language(categories, tags, slug, title)

        post: dict[str, object] = {
            "id": int(wordpress_id) if wordpress_id.isdigit() else wordpress_id,
            "title": title,
            "slug": slug,
            "content": content,
            "excerpt": excerpt,
            "author": author,
            "date": published_at,
            "status": status,
            "categories": categories,
            "tags": tags,
            "featured_image": featured_image,
            "language": language,
        }

        if seo:
            post["seo"] = seo

        posts.append(post)

    return posts


def main() -> int:
    root_dir = Path.cwd()
    default_input = root_dir / "legacy-wordpress" / "export.xml"
    default_output = root_dir / "legacy-wordpress" / "content" / "posts.json"

    input_path = Path(sys.argv[1]) if len(sys.argv) > 1 else default_input
    output_path = Path(sys.argv[2]) if len(sys.argv) > 2 else default_output

    if not input_path.exists():
        print(f"Input XML not found: {input_path}")
        return 1

    output_path.parent.mkdir(parents=True, exist_ok=True)

    root = load_xml(input_path)
    channel = get_channel(root)
    posts = extract_posts(channel)

    with output_path.open("w", encoding="utf-8") as handle:
        json.dump(posts, handle, ensure_ascii=False, indent=2)

    print(f"Generated {len(posts)} posts -> {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
