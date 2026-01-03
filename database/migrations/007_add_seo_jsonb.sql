-- Add SEO JSONB column to content tables
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{}'::jsonb;
