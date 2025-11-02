-- Create attachments table for file uploads
CREATE TABLE public.attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id uuid NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id),
  uploaded_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create index for faster lookups
CREATE INDEX idx_attachments_grievance_id ON public.attachments(grievance_id);
CREATE INDEX idx_attachments_uploaded_at ON public.attachments(uploaded_at DESC);

-- Enable Row Level Security
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous users to insert attachments when submitting grievance
CREATE POLICY "Allow anon to upload attachments"
ON public.attachments
FOR INSERT
TO anon
WITH CHECK (
  file_name IS NOT NULL 
  AND file_path IS NOT NULL 
  AND file_type IS NOT NULL
  AND file_size IS NOT NULL
  AND file_size <= 5242880 -- 5MB limit
);

-- Policy: Allow anonymous users to view attachments for their grievance
CREATE POLICY "Allow anon to view attachments"
ON public.attachments
FOR SELECT
TO anon
USING (true);

-- Policy: Allow authenticated users (admins) full access
CREATE POLICY "Allow admins full access to attachments"
ON public.attachments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create storage bucket for grievance attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'grievance-attachments',
  'grievance-attachments',
  false,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for grievance-attachments bucket
CREATE POLICY "Allow anon to upload files"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'grievance-attachments');

CREATE POLICY "Allow anon to view files"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'grievance-attachments');

CREATE POLICY "Allow admins full access to files"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'grievance-attachments')
WITH CHECK (bucket_id = 'grievance-attachments');
