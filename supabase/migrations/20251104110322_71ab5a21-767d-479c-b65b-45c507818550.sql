-- Create feedback table for student satisfaction surveys
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grievance_id UUID NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on feedback table
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit feedback (anonymous)
CREATE POLICY "Allow anon to submit feedback"
ON public.feedback
FOR INSERT
WITH CHECK (grievance_id IS NOT NULL AND rating >= 1 AND rating <= 5);

-- Allow admins to view all feedback
CREATE POLICY "Allow admins to view all feedback"
ON public.feedback
FOR SELECT
USING (true);

-- Create response templates table
CREATE TABLE public.response_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on response_templates
ALTER TABLE public.response_templates ENABLE ROW LEVEL SECURITY;

-- Allow admins full access to templates
CREATE POLICY "Allow admins full access to templates"
ON public.response_templates
FOR ALL
USING (true);

-- Create trigger for updating updated_at on templates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_response_templates_updated_at
BEFORE UPDATE ON public.response_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.feedback;
ALTER PUBLICATION supabase_realtime ADD TABLE public.response_templates;

-- Enable realtime for existing tables (skip if already added)
DO $$ 
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.grievances;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.status_history;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;