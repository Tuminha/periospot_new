# Periospot.com - Detailed Technical Analysis

This document provides a detailed technical analysis of the periospot.com WordPress site.

- **Theme:** Impreza theme with WPBakery Page Builder, which will require manual conversion to a component-based system in the new Next.js application.
- **Plugins:** Over 10 critical plugins were identified, including Yoast SEO Premium, WooCommerce, Jetpack, and Patreon Connect. Each of these will need to be replaced with a modern equivalent or integrated into the new system.
- **SEO:** The site has a strong SEO foundation with well-structured metadata from Yoast, which is crucial to preserve during the migration. The Ahrefs audit shows a Domain Rating of 19 with 77 referring domains.
- **E-commerce:** The site uses WooCommerce for both digital and physical products. The new architecture will retain WooCommerce as a headless backend, interacting with it via its REST API.
