-- ============================================
-- EDITORIAL WORKFLOW MIGRATION
-- Adds post review status, audit history, and admin roles
-- ============================================

-- 1. Add new columns to posts table for editorial workflow
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS review_notes TEXT,
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'import';

-- Add check constraint for source values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'posts_source_check'
    ) THEN
        ALTER TABLE public.posts
        ADD CONSTRAINT posts_source_check
        CHECK (source IN ('admin', 'mcp', 'import'));
    END IF;
END $$;

-- Update the status check to include pending_review and scheduled
-- First drop the existing constraint if it exists
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_status_check;

-- Add the new constraint with all status values
ALTER TABLE public.posts
ADD CONSTRAINT posts_status_check
CHECK (status IN ('draft', 'pending_review', 'published', 'scheduled', 'archived'));

-- Add index for efficient filtering by status
CREATE INDEX IF NOT EXISTS idx_posts_source ON public.posts(source);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled ON public.posts(scheduled_for) WHERE scheduled_for IS NOT NULL;

-- Comment on new columns
COMMENT ON COLUMN public.posts.reviewed_by IS 'UUID of admin who reviewed/published the post';
COMMENT ON COLUMN public.posts.reviewed_at IS 'Timestamp when post was reviewed/published';
COMMENT ON COLUMN public.posts.review_notes IS 'Admin notes during review';
COMMENT ON COLUMN public.posts.scheduled_for IS 'When to auto-publish (for scheduled status)';
COMMENT ON COLUMN public.posts.created_by IS 'UUID of user who created the post';
COMMENT ON COLUMN public.posts.source IS 'Origin of post: admin (manual), mcp (Claude), import (WordPress migration)';

-- ============================================
-- 2. Create post_history audit table
-- ============================================

CREATE TABLE IF NOT EXISTS public.post_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'created', 'updated', 'status_changed', 'published', 'unpublished', 'submitted_for_review'
    old_status TEXT,
    new_status TEXT,
    changed_by UUID REFERENCES auth.users(id),
    changed_by_source TEXT, -- 'admin', 'mcp', 'system'
    notes TEXT,
    changes JSONB, -- Store diff of what changed
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for quick lookups
CREATE INDEX IF NOT EXISTS idx_post_history_post_id ON public.post_history(post_id);
CREATE INDEX IF NOT EXISTS idx_post_history_created_at ON public.post_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_history_action ON public.post_history(action);

-- Enable RLS
ALTER TABLE public.post_history ENABLE ROW LEVEL SECURITY;

-- Only admins can view post history
CREATE POLICY "Admins can view post history" ON public.post_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Service role can insert history
CREATE POLICY "Service role can insert history" ON public.post_history
    FOR INSERT WITH CHECK (true);

COMMENT ON TABLE public.post_history IS 'Audit trail of all post changes for editorial workflow';

-- ============================================
-- 3. Add is_admin column to profiles
-- ============================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Index for admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = true;

-- Set cisco@periospot.com as admin
UPDATE public.profiles
SET is_admin = true
WHERE email = 'cisco@periospot.com';

COMMENT ON COLUMN public.profiles.is_admin IS 'Whether user has admin access to editorial dashboard';

-- ============================================
-- 4. Function to auto-publish scheduled posts
-- ============================================

CREATE OR REPLACE FUNCTION public.publish_scheduled_posts()
RETURNS INTEGER AS $$
DECLARE
    published_count INTEGER;
BEGIN
    WITH published AS (
        UPDATE public.posts
        SET status = 'published',
            published_at = COALESCE(published_at, NOW()),
            updated_at = NOW()
        WHERE status = 'scheduled'
          AND scheduled_for <= NOW()
        RETURNING id
    )
    SELECT COUNT(*) INTO published_count FROM published;

    RETURN published_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.publish_scheduled_posts IS 'Publishes all posts with scheduled status whose scheduled_for time has passed';

-- ============================================
-- 5. Update RLS for posts to include admin access
-- ============================================

-- Drop existing policy
DROP POLICY IF EXISTS "Public can view published posts" ON public.posts;

-- Create new policy that allows:
-- - Public to view published posts
-- - Admins to view all posts
CREATE POLICY "Public can view published posts or admins view all" ON public.posts
    FOR SELECT USING (
        status = 'published'
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Add policy for admins to insert posts
CREATE POLICY "Admins can insert posts" ON public.posts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Add policy for admins to update posts
CREATE POLICY "Admins can update posts" ON public.posts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Add policy for admins to delete posts
CREATE POLICY "Admins can delete posts" ON public.posts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ============================================
-- 6. Trigger to log post status changes
-- ============================================

CREATE OR REPLACE FUNCTION public.log_post_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.post_history (
            post_id,
            action,
            old_status,
            new_status,
            changed_by,
            changed_by_source
        ) VALUES (
            NEW.id,
            CASE
                WHEN NEW.status = 'published' THEN 'published'
                WHEN NEW.status = 'pending_review' THEN 'submitted_for_review'
                WHEN OLD.status = 'published' THEN 'unpublished'
                ELSE 'status_changed'
            END,
            OLD.status,
            NEW.status,
            auth.uid(),
            'admin'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS log_post_status_changes ON public.posts;
CREATE TRIGGER log_post_status_changes
    AFTER UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.log_post_status_change();
