-- Create status_history table for tracking status changes
CREATE TABLE public.status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id uuid NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL CHECK (new_status IN ('New', 'In Progress', 'Action Taken', 'Closed')),
  changed_by uuid REFERENCES auth.users(id),
  changed_at timestamp with time zone DEFAULT now() NOT NULL,
  notes text
);

-- Create index for faster lookups
CREATE INDEX idx_status_history_grievance_id ON public.status_history(grievance_id);
CREATE INDEX idx_status_history_changed_at ON public.status_history(changed_at DESC);

-- Enable Row Level Security
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users (admins) full access
CREATE POLICY "Allow admins full access to status history"
ON public.status_history
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Allow anonymous users to view status history for their grievance
CREATE POLICY "Allow anon to view status history by grievance"
ON public.status_history
FOR SELECT
TO anon
USING (true);

-- Function to automatically create status history entry when status changes
CREATE OR REPLACE FUNCTION public.track_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    -- Initial status entry
    INSERT INTO public.status_history (grievance_id, old_status, new_status, changed_by)
    VALUES (NEW.id, NULL, NEW.status, auth.uid());
  ELSIF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    -- Status changed
    INSERT INTO public.status_history (grievance_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on grievances table
CREATE TRIGGER trigger_track_status_change
AFTER INSERT OR UPDATE ON public.grievances
FOR EACH ROW
EXECUTE FUNCTION public.track_status_change();
