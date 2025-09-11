-- Create historical_staff table for 2024-2025 staff records
CREATE TABLE public.historical_staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  academic_year TEXT NOT NULL DEFAULT '2024-2025',
  department TEXT,
  position TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on historical_staff
ALTER TABLE public.historical_staff ENABLE ROW LEVEL SECURITY;

-- Create policies for historical_staff
CREATE POLICY "Admins can manage historical staff" 
ON public.historical_staff 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY(ARRAY['admin', 'super_admin'])
));

-- Create indexes for performance
CREATE INDEX idx_historical_staff_academic_year ON public.historical_staff(academic_year);
CREATE INDEX idx_historical_staff_email ON public.historical_staff(email);