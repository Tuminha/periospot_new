-- Create storage bucket for hero videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-videos', 'hero-videos', true);

-- Allow public read access to hero videos
CREATE POLICY "Public read access for hero videos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'hero-videos');

-- Allow authenticated users to upload hero videos (optional - for admin use)
CREATE POLICY "Authenticated users can upload hero videos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'hero-videos');