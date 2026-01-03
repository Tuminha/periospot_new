-- ============================================
-- PERIOSPOT SUPABASE DATABASE SCHEMA
-- Version: 1.0
-- Date: 2026-01-02
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. USER PROFILES (extends Supabase Auth)
-- ============================================

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    country TEXT,
    avatar_url TEXT,
    interests TEXT[], -- Array of interests from assessments
    newsletter_subscribed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. ASSESSMENTS (Quiz/Form Definitions)
-- ============================================

CREATE TYPE question_type AS ENUM (
    'multiple_choice',
    'picture_choice',
    'short_text',
    'long_text',
    'email',
    'dropdown',
    'opinion_scale',
    'rating',
    'legal',
    'number',
    'date',
    'file_upload'
);

CREATE TABLE public.assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    typeform_id TEXT UNIQUE, -- Original Typeform ID for migration
    title TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    language TEXT DEFAULT 'en',
    is_public BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    show_progress_bar BOOLEAN DEFAULT true,
    show_question_numbers BOOLEAN DEFAULT true,
    time_limit_minutes INTEGER, -- Optional time limit
    passing_score INTEGER, -- Minimum score to pass (percentage)
    total_points INTEGER DEFAULT 0, -- Calculated from questions
    welcome_title TEXT,
    welcome_description TEXT,
    welcome_image_url TEXT,
    welcome_button_text TEXT DEFAULT 'Start',
    theme_color TEXT DEFAULT '#3b82f6',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assessments_slug ON public.assessments(slug);
CREATE INDEX idx_assessments_typeform_id ON public.assessments(typeform_id);

-- ============================================
-- 3. QUESTIONS
-- ============================================

CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    typeform_ref TEXT, -- Original Typeform reference
    type question_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    video_url TEXT,
    is_required BOOLEAN DEFAULT true,
    points INTEGER DEFAULT 1, -- Points for correct answer
    order_index INTEGER NOT NULL,
    -- Type-specific settings (JSON for flexibility)
    settings JSONB DEFAULT '{}',
    -- For opinion_scale: {min: 1, max: 10, labels: {start: "Bad", end: "Good"}}
    -- For dropdown: {alphabetical_order: true}
    -- For multiple_choice: {allow_multiple: false, randomize: false}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_questions_assessment ON public.questions(assessment_id);
CREATE INDEX idx_questions_order ON public.questions(assessment_id, order_index);

-- ============================================
-- 4. CHOICES (Answer Options)
-- ============================================

CREATE TABLE public.choices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    typeform_ref TEXT, -- Original Typeform reference
    label TEXT NOT NULL,
    image_url TEXT, -- For picture_choice
    is_correct BOOLEAN DEFAULT false, -- For scoring
    points INTEGER DEFAULT 0, -- Points awarded if selected
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_choices_question ON public.choices(question_id);

-- ============================================
-- 5. RESULT SCREENS (Thank You Pages)
-- ============================================

CREATE TABLE public.result_screens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    typeform_ref TEXT,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    button_text TEXT,
    button_url TEXT,
    -- Conditions for showing this screen
    min_score INTEGER, -- Minimum score (percentage) to show this
    max_score INTEGER, -- Maximum score (percentage) to show this
    is_default BOOLEAN DEFAULT false,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_result_screens_assessment ON public.result_screens(assessment_id);

-- ============================================
-- 6. ASSESSMENT ATTEMPTS (User Submissions)
-- ============================================

CREATE TABLE public.assessment_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Nullable for anonymous
    -- Captured user info (for anonymous users)
    user_email TEXT,
    user_name TEXT,
    user_country TEXT,
    -- Attempt data
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    score INTEGER DEFAULT 0,
    max_score INTEGER DEFAULT 0,
    score_percentage DECIMAL(5,2),
    passed BOOLEAN,
    time_spent_seconds INTEGER,
    -- Result tracking
    result_screen_id UUID REFERENCES public.result_screens(id),
    pdf_url TEXT, -- Generated PDF certificate
    share_image_url TEXT, -- Generated social share image
    -- Typeform migration data
    typeform_response_id TEXT,
    typeform_submitted_at TIMESTAMPTZ,
    typeform_landed_at TIMESTAMPTZ,
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attempts_assessment ON public.assessment_attempts(assessment_id);
CREATE INDEX idx_attempts_user ON public.assessment_attempts(user_id);
CREATE INDEX idx_attempts_email ON public.assessment_attempts(user_email);
CREATE INDEX idx_attempts_typeform ON public.assessment_attempts(typeform_response_id);

-- ============================================
-- 7. RESPONSES (Individual Answers)
-- ============================================

CREATE TABLE public.responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES public.assessment_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    -- Answer data (flexible for different types)
    text_value TEXT, -- For short_text, long_text, email
    number_value DECIMAL, -- For number, opinion_scale, rating
    boolean_value BOOLEAN, -- For legal
    date_value DATE, -- For date
    file_url TEXT, -- For file_upload
    selected_choice_ids UUID[], -- For multiple_choice, picture_choice, dropdown
    -- Scoring
    points_earned INTEGER DEFAULT 0,
    is_correct BOOLEAN,
    answered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_responses_attempt ON public.responses(attempt_id);
CREATE INDEX idx_responses_question ON public.responses(question_id);

-- ============================================
-- 8. BLOG POSTS (WordPress Migration)
-- ============================================

CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wordpress_id INTEGER UNIQUE,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL, -- Markdown or HTML
    featured_image_url TEXT,
    author_name TEXT,
    author_avatar TEXT,
    -- SEO (from Yoast)
    meta_title TEXT,
    meta_description TEXT,
    focus_keyword TEXT,
    canonical_url TEXT,
    og_image_url TEXT,
    seo JSONB DEFAULT '{}',
    -- Categorization
    categories TEXT[],
    tags TEXT[],
    language TEXT DEFAULT 'en',
    -- Status
    status TEXT DEFAULT 'published', -- draft, published, archived
    published_at TIMESTAMPTZ,
    reading_time_minutes INTEGER,
    -- Engagement
    view_count INTEGER DEFAULT 0,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_slug ON public.posts(slug);
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_published ON public.posts(published_at DESC);
CREATE INDEX idx_posts_categories ON public.posts USING GIN(categories);
CREATE INDEX idx_posts_tags ON public.posts USING GIN(tags);

-- ============================================
-- 9. COMMENTS (WordPress + New User Comments)
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

-- ============================================
-- 10. PAGES (Static Pages)
-- ============================================

CREATE TABLE public.pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wordpress_id INTEGER UNIQUE,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    og_image_url TEXT,
    seo JSONB DEFAULT '{}',
    -- Layout
    template TEXT DEFAULT 'default', -- default, landing, about, contact
    show_in_navigation BOOLEAN DEFAULT false,
    navigation_order INTEGER,
    parent_id UUID REFERENCES public.pages(id),
    -- Status
    status TEXT DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pages_slug ON public.pages(slug);

-- ============================================
-- 10. PRODUCTS (WooCommerce Cache)
-- ============================================

CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    woocommerce_id INTEGER UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    -- Pricing
    price DECIMAL(10,2),
    sale_price DECIMAL(10,2),
    currency TEXT DEFAULT 'EUR',
    -- Type
    product_type TEXT DEFAULT 'simple', -- simple, variable, downloadable
    is_digital BOOLEAN DEFAULT false,
    -- Images
    featured_image_url TEXT,
    gallery_image_urls TEXT[],
    -- Categorization
    categories TEXT[],
    tags TEXT[],
    -- Stock
    stock_status TEXT DEFAULT 'instock', -- instock, outofstock, onbackorder
    stock_quantity INTEGER,
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    seo JSONB DEFAULT '{}',
    -- External links
    woocommerce_url TEXT, -- Link to WooCommerce for purchase
    -- Timestamps
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_woo_id ON public.products(woocommerce_id);
CREATE INDEX idx_products_categories ON public.products USING GIN(categories);

-- ============================================
-- 11. MEDIA ASSETS
-- ============================================

CREATE TABLE public.media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wordpress_id INTEGER,
    filename TEXT NOT NULL,
    original_url TEXT, -- Original WordPress URL
    storage_path TEXT NOT NULL, -- Supabase Storage path
    public_url TEXT NOT NULL, -- Supabase public URL
    mime_type TEXT,
    file_size INTEGER, -- In bytes
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_wordpress ON public.media(wordpress_id);
CREATE INDEX idx_media_filename ON public.media(filename);

-- ============================================
-- 12. NEWSLETTER SUBSCRIBERS
-- ============================================

CREATE TABLE public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    source TEXT, -- 'signup', 'assessment', 'download'
    interests TEXT[],
    is_active BOOLEAN DEFAULT true,
    unsubscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX idx_subscribers_active ON public.newsletter_subscribers(is_active);

-- ============================================
-- 13. URL REDIRECTS (SEO Migration)
-- ============================================

CREATE TABLE public.redirects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    old_path TEXT UNIQUE NOT NULL, -- e.g., '/producto/bone-dynamics/'
    new_path TEXT NOT NULL, -- e.g., '/products/bone-dynamics'
    status_code INTEGER DEFAULT 301, -- 301 (permanent) or 302 (temporary)
    is_active BOOLEAN DEFAULT true,
    hit_count INTEGER DEFAULT 0,
    last_hit_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_redirects_old_path ON public.redirects(old_path);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON public.assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate score percentage on attempt completion
CREATE OR REPLACE FUNCTION calculate_attempt_score()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.completed_at IS NOT NULL AND NEW.max_score > 0 THEN
        NEW.score_percentage = (NEW.score::DECIMAL / NEW.max_score) * 100;
        -- Check if passed (if passing_score is set on assessment)
        SELECT
            CASE
                WHEN a.passing_score IS NOT NULL AND NEW.score_percentage >= a.passing_score THEN true
                WHEN a.passing_score IS NOT NULL THEN false
                ELSE NULL
            END INTO NEW.passed
        FROM public.assessments a WHERE a.id = NEW.assessment_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_score_on_complete
    BEFORE INSERT OR UPDATE ON public.assessment_attempts
    FOR EACH ROW EXECUTE FUNCTION calculate_attempt_score();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.result_screens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public can view active assessments" ON public.assessments
    FOR SELECT USING (is_active = true AND is_public = true);

CREATE POLICY "Public can view questions" ON public.questions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.is_active = true)
    );

CREATE POLICY "Public can view choices" ON public.choices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.questions q
            JOIN public.assessments a ON a.id = q.assessment_id
            WHERE q.id = question_id AND a.is_active = true
        )
    );

CREATE POLICY "Public can view result screens" ON public.result_screens
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.is_active = true)
    );

CREATE POLICY "Public can view published posts" ON public.posts
    FOR SELECT USING (status = 'published');

CREATE POLICY "Public can view approved comments" ON public.comments
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Authenticated users can insert comments" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.comments
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.comments
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public can view published pages" ON public.pages
    FOR SELECT USING (status = 'published');

CREATE POLICY "Public can view products" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Public can view media" ON public.media
    FOR SELECT USING (true);

CREATE POLICY "Public can view redirects" ON public.redirects
    FOR SELECT USING (is_active = true);

-- Users can insert their own attempts
CREATE POLICY "Anyone can create assessment attempts" ON public.assessment_attempts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own attempts" ON public.assessment_attempts
    FOR SELECT USING (
        user_id = auth.uid() OR
        user_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    );

-- Users can insert responses
CREATE POLICY "Anyone can create responses" ON public.responses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own responses" ON public.responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.assessment_attempts a
            WHERE a.id = attempt_id AND (
                a.user_id = auth.uid() OR
                a.user_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
            )
        )
    );

-- Newsletter signup
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers
    FOR INSERT WITH CHECK (true);

-- ============================================
-- SAMPLE DATA COMMENTS
-- ============================================

-- After running this schema, you'll need to:
-- 1. Run the Typeform migration script to import assessments and responses
-- 2. Run the WordPress migration script to import posts, pages, and media
-- 3. Set up Supabase Storage buckets for media files
-- 4. Configure authentication providers (Google OAuth)

COMMENT ON TABLE public.assessments IS 'Quizzes and forms, migrated from Typeform';
COMMENT ON TABLE public.assessment_attempts IS 'User submissions, includes 3,819 historical Typeform responses';
COMMENT ON TABLE public.posts IS 'Blog posts, migrated from WordPress (80 posts)';
COMMENT ON TABLE public.pages IS 'Static pages, migrated from WordPress (41 pages)';
COMMENT ON TABLE public.products IS 'Product cache from WooCommerce (41 products)';
