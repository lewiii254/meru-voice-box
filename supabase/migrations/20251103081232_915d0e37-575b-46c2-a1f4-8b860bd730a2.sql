-- Create attachments table for file uploads
CREATE TABLE public.attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grievance_id UUID NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comments table for communication
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grievance_id UUID NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_request_info BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create status_history table for tracking status changes
CREATE TABLE public.status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grievance_id UUID NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('grievance-attachments', 'grievance-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attachments
CREATE POLICY "Allow anon to view attachments"
  ON public.attachments FOR SELECT
  USING (true);

CREATE POLICY "Allow anon to upload attachments"
  ON public.attachments FOR INSERT
  WITH CHECK (grievance_id IS NOT NULL);

CREATE POLICY "Allow admins full access to attachments"
  ON public.attachments FOR ALL
  USING (true);

-- RLS Policies for comments
CREATE POLICY "Allow anon to view public comments"
  ON public.comments FOR SELECT
  USING (is_public = true);

CREATE POLICY "Allow admins full access to comments"
  ON public.comments FOR ALL
  USING (true);

-- RLS Policies for status_history
CREATE POLICY "Allow anon to view status history"
  ON public.status_history FOR SELECT
  USING (true);

CREATE POLICY "Allow admins to manage status history"
  ON public.status_history FOR ALL
  USING (true);

-- Storage policies for grievance-attachments
CREATE POLICY "Allow anon to view attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'grievance-attachments');

CREATE POLICY "Allow anon to upload attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'grievance-attachments');

CREATE POLICY "Allow admins full access to storage"
  ON storage.objects FOR ALL
  USING (bucket_id = 'grievance-attachments');

-- Create trigger to automatically log status changes
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.status_history (grievance_id, old_status, new_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER grievance_status_change
  AFTER UPDATE ON public.grievances
  FOR EACH ROW
  EXECUTE FUNCTION log_status_change();

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;