-- Add role field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT;

-- Add comment to explain role options
COMMENT ON COLUMN public.profiles.role IS 'User role: professor, academic, KOL (Key Opinion Leader), student, or other';

-- Update the updated_at trigger function if needed
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
