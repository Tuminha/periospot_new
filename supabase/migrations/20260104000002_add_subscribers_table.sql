-- Create subscribers table for newsletter and email marketing
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  last_name TEXT,
  country TEXT,
  city TEXT,
  location TEXT,
  subscribed_at TIMESTAMPTZ,
  language TEXT DEFAULT 'en',
  sent INTEGER DEFAULT 0,
  opens INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  tags TEXT,
  groups TEXT,
  score_on_test TEXT,
  source TEXT DEFAULT 'website',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced', 'cleaned')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_country ON public.subscribers(country);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON public.subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_subscribed_at ON public.subscribers(subscribed_at);
CREATE INDEX IF NOT EXISTS idx_subscribers_source ON public.subscribers(source);

-- Enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all subscribers
CREATE POLICY "Admins can view all subscribers"
  ON public.subscribers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to manage subscribers
CREATE POLICY "Admins can manage subscribers"
  ON public.subscribers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow service role full access (for imports)
CREATE POLICY "Service role has full access"
  ON public.subscribers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add comments
COMMENT ON TABLE public.subscribers IS 'Newsletter subscribers imported from Mailchimp and website signups';
COMMENT ON COLUMN public.subscribers.source IS 'Source of subscription: mailchimp_import, website, typeform, etc.';
COMMENT ON COLUMN public.subscribers.status IS 'Subscription status: active, unsubscribed, bounced, cleaned';
