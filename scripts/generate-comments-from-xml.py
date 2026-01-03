#!/usr/bin/env python3
"""Generate legacy-wordpress/content/comments.json from a WordPress export.xml."""

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


def text_or_empty(value: str | None) -> str:
    return value if value is not None else ""


def get_child_text(item: ET.Element, tag: str) -> str:
    return text_or_empty(item.findtext(tag, namespaces=NAMESPACES))


def get_comment_text(comment: ET.Element, tag: str) -> str:
    return text_or_empty(comment.findtext(tag, namespaces=NAMESPACES))


def normalize_status(value: str) -> str:
    normalized = value.strip().lower()
    if normalized in {"1", "approved", "approve", "publish"}:
        return "approved"
    if normalized in {"0", "hold", "pending"}:
        return "pending"
    if normalized == "spam":
        return "spam"
    if normalized in {"trash", "deleted", "delete"}:
        return "deleted"
    return "pending"


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


def extract_comments(channel: ET.Element) -> list[dict[str, object]]:
    items = channel.findall("item")
    comments: list[dict[str, object]] = []

    for item in items:
        post_type = get_child_text(item, "wp:post_type")
        if post_type != "post":
            continue

        wordpress_post_id = get_child_text(item, "wp:post_id")
        slug = get_child_text(item, "wp:post_name")

        for comment in item.findall("wp:comment", namespaces=NAMESPACES):
            comment_type = get_comment_text(comment, "wp:comment_type").strip().lower()
            if comment_type not in {"", "comment"}:
                continue

            content = get_comment_text(comment, "wp:comment_content").strip()
            if not content:
                continue

            comment_id = get_comment_text(comment, "wp:comment_id")
            parent_id = get_comment_text(comment, "wp:comment_parent")
            approved = get_comment_text(comment, "wp:comment_approved")
            created_at = get_comment_text(comment, "wp:comment_date_gmt") or get_comment_text(
                comment, "wp:comment_date"
            )

            status = normalize_status(approved)
            approved_at = created_at if status == "approved" else ""

            comments.append(
                {
                    "legacy_comment_id": int(comment_id) if comment_id.isdigit() else comment_id,
                    "wordpress_post_id": int(wordpress_post_id)
                    if wordpress_post_id.isdigit()
                    else wordpress_post_id,
                    "post_slug": slug,
                    "parent_legacy_id": int(parent_id) if parent_id.isdigit() else parent_id,
                    "author_name": get_comment_text(comment, "wp:comment_author"),
                    "author_email": get_comment_text(comment, "wp:comment_author_email"),
                    "author_url": get_comment_text(comment, "wp:comment_author_url"),
                    "content": content,
                    "status": status,
                    "created_at": created_at,
                    "approved_at": approved_at,
                    "ip_address": get_comment_text(comment, "wp:comment_author_IP"),
                    "user_agent": get_comment_text(comment, "wp:comment_agent"),
                }
            )

    return comments


def main() -> int:
    root_dir = Path.cwd()
    default_input = root_dir / "legacy-wordpress" / "export.xml"
    default_output = root_dir / "legacy-wordpress" / "content" / "comments.json"

    input_path = Path(sys.argv[1]) if len(sys.argv) > 1 else default_input
    output_path = Path(sys.argv[2]) if len(sys.argv) > 2 else default_output

    root = load_xml(input_path)
    channel = get_channel(root)
    comments = extract_comments(channel)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(comments, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Extracted {len(comments)} comments -> {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
