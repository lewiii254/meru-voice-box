-- Create comments table for internal communication
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id uuid NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_public boolean DEFAULT false NOT NULL,
  is_request_info boolean DEFAULT false NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create index for faster lookups
CREATE INDEX idx_comments_grievance_id ON public.comments(grievance_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);
CREATE INDEX idx_comments_is_public ON public.comments(is_public);

-- Enable Row Level Security
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users (admins) full access to all comments
CREATE POLICY "Allow admins full access to comments"
ON public.comments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Allow anonymous users to view public comments for their grievance
CREATE POLICY "Allow anon to view public comments"
ON public.comments
FOR SELECT
TO anon
USING (is_public = true);

-- Policy: Allow anonymous users to respond to info requests
CREATE POLICY "Allow anon to respond to info requests"
ON public.comments
FOR INSERT
TO anon
WITH CHECK (
  content IS NOT NULL
  AND is_public = true
  AND created_by IS NULL
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
CREATE TRIGGER trigger_update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();
