-- Ebooks table for storing ebook metadata
CREATE TABLE IF NOT EXISTS ebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  language TEXT NOT NULL DEFAULT 'en',

  -- File references (Supabase Storage)
  pdf_path TEXT, -- Path in Supabase Storage bucket
  cover_image TEXT, -- URL to cover image

  -- Author info
  author TEXT DEFAULT 'Francisco Teixeira Barbosa',
  co_authors TEXT[], -- Additional authors

  -- Content info
  pages INTEGER,

  -- Pricing
  is_free BOOLEAN DEFAULT true,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',

  -- External links (for paid iBooks)
  apple_books_url TEXT,
  amazon_kindle_url TEXT,
  genius_link_url TEXT,

  -- Categorization
  category TEXT, -- 'implantology', 'periodontics', 'aesthetics', 'gbr', 'soft-tissue'
  tags TEXT[],

  -- Stats
  download_count INTEGER DEFAULT 0,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,

  -- Status
  is_published BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ebook downloads tracking (for analytics and lead generation)
CREATE TABLE IF NOT EXISTS ebook_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ebook_id UUID REFERENCES ebooks(id) ON DELETE CASCADE,

  -- User info (nullable for anonymous with email capture)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT, -- For non-logged-in users

  -- Download info
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,

  -- Lead tracking
  email_verified BOOLEAN DEFAULT false,
  marketing_consent BOOLEAN DEFAULT false,
  source TEXT -- 'library', 'blog-cta', 'popup', etc.
);

-- Create indexes
CREATE INDEX idx_ebooks_slug ON ebooks(slug);
CREATE INDEX idx_ebooks_language ON ebooks(language);
CREATE INDEX idx_ebooks_category ON ebooks(category);
CREATE INDEX idx_ebooks_is_published ON ebooks(is_published);
CREATE INDEX idx_ebook_downloads_ebook_id ON ebook_downloads(ebook_id);
CREATE INDEX idx_ebook_downloads_user_id ON ebook_downloads(user_id);
CREATE INDEX idx_ebook_downloads_email ON ebook_downloads(email);

-- Enable RLS
ALTER TABLE ebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ebook_downloads ENABLE ROW LEVEL SECURITY;

-- Ebooks: Public read for published, admin write
CREATE POLICY "Published ebooks are viewable by everyone"
  ON ebooks FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage all ebooks"
  ON ebooks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Ebook downloads: Users can see their own, admins can see all
CREATE POLICY "Users can view their own downloads"
  ON ebook_downloads FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all downloads"
  ON ebook_downloads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Anyone can create download records"
  ON ebook_downloads FOR INSERT
  WITH CHECK (true);

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_ebook_downloads()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ebooks
  SET download_count = download_count + 1,
      updated_at = NOW()
  WHERE id = NEW.ebook_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-increment download count
CREATE TRIGGER on_ebook_download
  AFTER INSERT ON ebook_downloads
  FOR EACH ROW
  EXECUTE FUNCTION increment_ebook_downloads();

-- ============================================
-- INSERT ACTUAL EBOOK DATA
-- Based on actual PDFs in ebooks/pdfs folder
-- ============================================

-- 10 Tips About Aesthetic Implant Dentistry (3 languages)
INSERT INTO ebooks (slug, title, description, language, category, pages, is_free, is_published, author, cover_image, tags, meta_title, meta_description) VALUES
  (
    '10-tips-aesthetic-implants-en',
    '10 Tips About Aesthetic Implant Dentistry',
    'Essential tips and tricks for achieving optimal aesthetics in implant dentistry. From case selection to final restoration, this guide covers key principles that will help you in your daily practice.',
    'en',
    'aesthetics',
    18,
    true,
    true,
    'Francisco Teixeira Barbosa',
    '/images/ebooks/10-tips-aesthetic.png',
    ARRAY['aesthetics', 'implants', 'anterior zone', 'tips'],
    '10 Tips About Aesthetic Implant Dentistry - Free eBook',
    'Download our free guide with 10 essential tips for achieving optimal aesthetics in implant dentistry. Practical advice for daily clinical practice.'
  ),
  (
    '10-tips-aesthetic-implants-es',
    '10 Consejos y Trucos en Implantología Estética',
    'Consejos y trucos esenciales para lograr una estética óptima en implantología. Desde la selección del caso hasta la restauración final, esta guía cubre los principios clave que te ayudarán en tu práctica diaria.',
    'es',
    'aesthetics',
    18,
    true,
    true,
    'Francisco Teixeira Barbosa',
    '/images/ebooks/10-tips-aesthetic.png',
    ARRAY['estética', 'implantes', 'zona anterior', 'consejos'],
    '10 Consejos en Implantología Estética - eBook Gratis',
    'Descarga nuestra guía gratuita con 10 consejos esenciales para lograr una estética óptima en implantología dental.'
  ),
  (
    '10-tips-aesthetic-implants-pt',
    '10 Dicas Sobre Implantologia Estética',
    'Dicas e truques essenciais para alcançar a estética ideal em implantologia. Da seleção do caso à restauração final, este guia cobre os princípios-chave que ajudarão na sua prática diária.',
    'pt',
    'aesthetics',
    17,
    true,
    true,
    'Francisco Teixeira Barbosa',
    '/images/ebooks/10-tips-aesthetic.png',
    ARRAY['estética', 'implantes', 'zona anterior', 'dicas'],
    '10 Dicas em Implantologia Estética - eBook Grátis',
    'Baixe nosso guia gratuito com 10 dicas essenciais para alcançar a estética ideal em implantologia dentária.'
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  pages = EXCLUDED.pages,
  is_published = EXCLUDED.is_published;

-- Guided Bone Regeneration (Spanish and Portuguese)
INSERT INTO ebooks (slug, title, description, language, category, pages, is_free, is_published, author, co_authors, cover_image, tags, meta_title, meta_description) VALUES
  (
    'guided-bone-regeneration-es',
    'Regeneración Ósea Guiada en Implantología Oral',
    'Guía interactiva completa sobre técnicas de regeneración ósea guiada. Incluye membranas, materiales de injerto, técnicas quirúrgicas y casos clínicos paso a paso. Edición interactiva con videos.',
    'es',
    'gbr',
    100,
    true,
    true,
    'Francisco Teixeira Barbosa',
    ARRAY['Francisco Carroquino', 'Victor Serrano'],
    '/images/ebooks/guided-bone-regeneration.png',
    ARRAY['ROG', 'regeneración ósea', 'membranas', 'injertos', 'implantes'],
    'Regeneración Ósea Guiada - eBook Interactivo Gratis',
    'Guía completa sobre técnicas de ROG en implantología. Incluye videos, casos clínicos y protocolos paso a paso.'
  ),
  (
    'guided-bone-regeneration-pt',
    'Regeneração Óssea Guiada em Implantologia Oral',
    'Guia interativo completo sobre técnicas de regeneração óssea guiada. Inclui membranas, materiais de enxerto, técnicas cirúrgicas e casos clínicos passo a passo. Edição interativa com vídeos.',
    'pt',
    'gbr',
    103,
    true,
    true,
    'Francisco Teixeira Barbosa',
    ARRAY['Francisco Carroquino', 'Vitor Brás', 'João Botto'],
    '/images/ebooks/guided-bone-regeneration.png',
    ARRAY['ROG', 'regeneração óssea', 'membranas', 'enxertos', 'implantes'],
    'Regeneração Óssea Guiada - eBook Interativo Grátis',
    'Guia completo sobre técnicas de ROG em implantologia. Inclui vídeos, casos clínicos e protocolos passo a passo.'
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  pages = EXCLUDED.pages,
  is_published = EXCLUDED.is_published;

-- 17 Immutable Laws (Portuguese only - English version is empty)
INSERT INTO ebooks (slug, title, description, language, category, pages, is_free, is_published, author, cover_image, tags, meta_title, meta_description) VALUES
  (
    '17-immutable-laws-pt',
    'As 17 Leis Imutáveis da Implantologia',
    'Os princípios fundamentais que todo implantodontista deve conhecer. Este guia abrange desde a avaliação do paciente até o acompanhamento a longo prazo, com foco em previsibilidade e sucesso clínico.',
    'pt',
    'implantology',
    70,
    true,
    true,
    'Francisco Teixeira Barbosa',
    '/images/ebooks/17-immutable-laws.png',
    ARRAY['implantologia', 'princípios', 'sucesso', 'protocolos'],
    'As 17 Leis Imutáveis da Implantologia - eBook Grátis',
    'Descubra os 17 princípios fundamentais para o sucesso em implantologia. Guia completo com casos clínicos e protocolos.'
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  pages = EXCLUDED.pages,
  is_published = EXCLUDED.is_published;

-- English versions - NOW AVAILABLE
INSERT INTO ebooks (slug, title, description, language, category, pages, is_free, is_published, author, cover_image, tags, meta_title, meta_description) VALUES
  (
    '17-immutable-laws-en',
    'The 17 Immutable Laws In Implant Dentistry',
    'Essential principles every implant dentist should know. This guide covers everything from patient assessment to long-term follow-up, focusing on predictability and clinical success.',
    'en',
    'implantology',
    70,
    true,
    true,
    'Francisco Teixeira Barbosa',
    '/images/ebooks/17-immutable-laws.png',
    ARRAY['implantology', 'principles', 'success', 'protocols'],
    'The 17 Immutable Laws In Implant Dentistry - Free eBook',
    'Discover the 17 fundamental principles for success in implant dentistry. Complete guide with clinical cases and protocols.'
  ),
  (
    'guided-bone-regeneration-en',
    'Guided Bone Regeneration In Implant Dentistry',
    'Comprehensive interactive guide on GBR techniques. Includes membranes, grafting materials, surgical techniques, and step-by-step clinical cases.',
    'en',
    'gbr',
    85,
    true,
    true,
    'Francisco Teixeira Barbosa',
    '/images/ebooks/guided-bone-regeneration.png',
    ARRAY['GBR', 'bone regeneration', 'membranes', 'grafts', 'implants'],
    'Guided Bone Regeneration - Free Interactive eBook',
    'Complete guide on GBR techniques in implant dentistry. Includes videos, clinical cases, and step-by-step protocols.'
  ),
  (
    'connective-tissue-grafts-en',
    'Connective Tissue Grafts Harvesting Techniques',
    'Step-by-step techniques for harvesting connective tissue grafts. Includes palatal, tuberosity, and de-epithelialized approaches with video demonstrations.',
    'en',
    'soft-tissue',
    120,
    true,
    true,
    'Francisco Teixeira Barbosa',
    '/images/ebooks/connective-tissue-grafts.png',
    ARRAY['CTG', 'soft tissue', 'graft harvesting', 'periodontics'],
    'Connective Tissue Grafts Harvesting - Free eBook',
    'Master CTG harvesting techniques with this comprehensive guide. Palatal, tuberosity, and de-epithelialized approaches.'
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  pages = EXCLUDED.pages,
  is_published = true;

-- Add comment
COMMENT ON TABLE ebooks IS 'Ebooks available for download (free with email capture or paid via Apple Books/Amazon)';
COMMENT ON TABLE ebook_downloads IS 'Tracks all ebook downloads for analytics and lead generation';
