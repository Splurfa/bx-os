-- Create kiosks table for real-time kiosk management
CREATE TABLE public.kiosks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  current_student_id UUID REFERENCES public.students(id),
  current_behavior_request_id UUID REFERENCES public.behavior_requests(id),
  activated_at TIMESTAMP WITH TIME ZONE,
  activated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.kiosks ENABLE ROW LEVEL SECURITY;

-- Create policies for kiosk access
CREATE POLICY "Authenticated users can view kiosks" 
ON public.kiosks 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Teachers and admins can manage kiosks" 
ON public.kiosks 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role IN ('teacher', 'admin')
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_kiosks_updated_at
BEFORE UPDATE ON public.kiosks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key constraint to behavior_requests for assigned_kiosk_id
ALTER TABLE public.behavior_requests 
ADD CONSTRAINT behavior_requests_assigned_kiosk_id_fkey 
FOREIGN KEY (assigned_kiosk_id) REFERENCES public.kiosks(id);

-- Enable real-time for kiosks table
ALTER TABLE public.kiosks REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.kiosks;

-- Insert default kiosks
INSERT INTO public.kiosks (name, location) VALUES 
('Kiosk 1', 'Classroom A'),
('Kiosk 2', 'Classroom B'),
('Kiosk 3', 'Library');

-- Update existing behavior_requests to have valid kiosk assignments if needed
UPDATE public.behavior_requests 
SET assigned_kiosk_id = 1 
WHERE assigned_kiosk_id IS NOT NULL AND assigned_kiosk_id NOT IN (SELECT id FROM public.kiosks);