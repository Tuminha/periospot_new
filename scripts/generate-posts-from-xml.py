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
        thumbnail_id = meta.get("_thumbnail_id", "")
        featured_image = attachments.get(thumbnail_id, "")
        language = detect_language(categories, tags, slug, title)

        posts.append(
            {
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
        )

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
