-- Add first_name, last_name, phone to profiles for admin contact details
ALTER TABLE profiles
  ADD COLUMN first_name TEXT,
  ADD COLUMN last_name TEXT,
  ADD COLUMN phone TEXT;

-- Create organisation-logos storage bucket (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('organisation-logos', 'organisation-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload org logos
CREATE POLICY "Authenticated users can upload org logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'organisation-logos');

-- Allow authenticated users to update/replace org logos
CREATE POLICY "Authenticated users can update org logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'organisation-logos');

-- Allow public read access to org logos
CREATE POLICY "Public read access for org logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'organisation-logos');
