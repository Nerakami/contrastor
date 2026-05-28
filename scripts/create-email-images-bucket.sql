-- Create storage bucket for email images
-- This script creates a public storage bucket for email images

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('email-images', 'email-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for email images
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload email images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'email-images');

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update their own email images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'email-images');

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete their own email images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'email-images');

-- Allow public read access to all email images
CREATE POLICY "Public read access for email images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'email-images');
