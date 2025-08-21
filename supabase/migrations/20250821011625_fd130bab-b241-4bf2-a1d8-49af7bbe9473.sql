-- Create notification settings table for per-user notification control
CREATE TABLE public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, notification_type)
);

-- Enable RLS
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notification settings"
ON public.notification_settings
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notification settings"
ON public.notification_settings
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all notification settings"
ON public.notification_settings
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role IN ('admin', 'super_admin')
));

-- Auto-update timestamp trigger
CREATE TRIGGER update_notification_settings_updated_at
BEFORE UPDATE ON public.notification_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Initialize notification settings for existing teachers
INSERT INTO public.notification_settings (user_id, notification_type, enabled)
SELECT p.id, 'reflection_ready_for_review', true
FROM profiles p
WHERE p.role = 'teacher'
ON CONFLICT (user_id, notification_type) DO NOTHING;