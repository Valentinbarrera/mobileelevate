-- Create storage bucket for exercise videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('exercise-videos', 'exercise-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for public read access
CREATE POLICY "Exercise videos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'exercise-videos');

-- Create policy for authenticated users to upload (coaches)
CREATE POLICY "Authenticated users can upload exercise videos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'exercise-videos' AND auth.role() = 'authenticated');

-- Create policy for authenticated users to update their uploads
CREATE POLICY "Authenticated users can update exercise videos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'exercise-videos' AND auth.role() = 'authenticated');

-- Create policy for authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete exercise videos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'exercise-videos' AND auth.role() = 'authenticated');