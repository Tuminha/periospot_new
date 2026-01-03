// MCP Tools Index - Exports all tools and manifests

import { postTools, postToolManifests } from './posts';
import { imageTools, imageToolManifests } from './images';
import { categoryTools, categoryToolManifests } from './categories';
import { subscriberTools, subscriberToolManifests } from './subscribers';
import { pageTools, pageToolManifests } from './pages';
import type { MCPToolHandler, MCPToolManifest } from '@/lib/types/mcp';

// =============================================================================
// COMBINED TOOL HANDLERS
// =============================================================================

export const tools: Record<string, MCPToolHandler> = {
  // Post tools
  create_post: postTools.create_post,
  update_post: postTools.update_post,
  get_posts: postTools.get_posts,
  get_post: postTools.get_post,
  delete_post: postTools.delete_post,
  publish_post: postTools.publish_post,

  // Image tools
  upload_image: imageTools.upload_image,
  list_images: imageTools.list_images,
  get_image: imageTools.get_image,
  update_image: imageTools.update_image,
  delete_image: imageTools.delete_image,

  // AI Image Generation tools
  generate_dental_image: imageTools.generate_dental_image,
  generate_blog_hero_image: imageTools.generate_blog_hero_image,
  generate_og_image: imageTools.generate_og_image,

  // Category tools
  list_categories: categoryTools.list_categories,
  create_category: categoryTools.create_category,
  update_category: categoryTools.update_category,
  delete_category: categoryTools.delete_category,

  // Subscriber tools
  add_subscriber: subscriberTools.add_subscriber,
  list_subscribers: subscriberTools.list_subscribers,
  update_subscriber: subscriberTools.update_subscriber,
  unsubscribe: subscriberTools.unsubscribe,
  get_subscriber_stats: subscriberTools.get_subscriber_stats,

  // Page Analysis tools
  analyze_page: pageTools.analyze_page,
  check_page_seo: pageTools.check_page_seo,
  get_page_images: pageTools.get_page_images,
  get_page_links: pageTools.get_page_links,
  get_site_structure: pageTools.get_site_structure,
  compare_post_versions: pageTools.compare_post_versions,
};

// =============================================================================
// COMBINED TOOL MANIFESTS
// =============================================================================

export const toolManifests: MCPToolManifest[] = [
  ...postToolManifests,
  ...imageToolManifests,
  ...categoryToolManifests,
  ...subscriberToolManifests,
  ...pageToolManifests,
];

// =============================================================================
// TOOL LOOKUP HELPERS
// =============================================================================

/**
 * Get a tool handler by name
 */
export function getTool(name: string): MCPToolHandler | undefined {
  return tools[name];
}

/**
 * Get a tool manifest by name
 */
export function getToolManifest(name: string): MCPToolManifest | undefined {
  return toolManifests.find((m) => m.name === name);
}

/**
 * Check if a tool exists
 */
export function hasTools(name: string): boolean {
  return name in tools;
}

/**
 * Get all tool names
 */
export function getToolNames(): string[] {
  return Object.keys(tools);
}
