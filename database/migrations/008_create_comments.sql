-- ============================================
-- COMMENTS (WordPress + New User Comments)
-- ============================================

CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    post_slug TEXT NOT NULL,
    wordpress_post_id INTEGER,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT,
    author_email TEXT,
    author_url TEXT,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    is_legacy BOOLEAN DEFAULT false,
    legacy_comment_id INTEGER,
    ip_address INET,
    user_agent TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT comments_status_check CHECK (status IN ('pending', 'approved', 'spam', 'deleted'))
);

CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_comments_post_slug ON public.comments(post_slug);
CREATE INDEX idx_comments_status ON public.comments(status);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE UNIQUE INDEX idx_comments_legacy_comment_id ON public.comments(legacy_comment_id);

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved comments" ON public.comments
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Authenticated users can insert comments" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.comments
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.comments
    FOR DELETE USING (auth.uid() = user_id);
