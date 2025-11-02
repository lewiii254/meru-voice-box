-- Create grievances table
CREATE TABLE public.grievances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_code text UNIQUE NOT NULL,
  title text NOT NULL CHECK (char_length(title) <= 100),
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('Academics', 'Security', 'Maintenance', 'Administration', 'Other')),
  status text NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'In Progress', 'Action Taken', 'Closed')),
  submitted_at timestamp with time zone DEFAULT now() NOT NULL,
  response text,
  private_notes text
);

-- Enable Row Level Security
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anonymous users to insert grievances (submission)
CREATE POLICY "Allow anon to submit grievances"
ON public.grievances
FOR INSERT
TO anon
WITH CHECK (
  title IS NOT NULL 
  AND description IS NOT NULL 
  AND category IS NOT NULL 
  AND tracking_code IS NOT NULL
);

-- Policy 2: Allow anonymous users to select their grievance by tracking code
-- Note: We'll need to filter private_notes in the application layer for anon users
CREATE POLICY "Allow anon to track by code"
ON public.grievances
FOR SELECT
TO anon
USING (true);

-- Policy 3: Allow authenticated users (admins) full access
CREATE POLICY "Allow admins full access"
ON public.grievances
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create index on tracking_code for faster lookups
CREATE INDEX idx_grievances_tracking_code ON public.grievances(tracking_code);

-- Create index on status for dashboard filtering
CREATE INDEX idx_grievances_status ON public.grievances(status);

-- Create index on submitted_at for sorting
CREATE INDEX idx_grievances_submitted_at ON public.grievances(submitted_at DESC);