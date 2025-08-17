-- NUCLEAR RESET: Complete Database Schema
-- This creates the family-centric architecture with extension points

-- 1. FAMILIES (Core family units)
CREATE TABLE public.families (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_name TEXT NOT NULL,
  primary_contact_name TEXT,
  primary_contact_phone TEXT,
  primary_contact_email TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. STUDENTS (Student records linked to families)
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  student_id_external TEXT, -- For SIS correlation
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  grade TEXT,
  class_name TEXT,
  date_of_birth DATE,
  gender TEXT,
  allergies TEXT,
  medications TEXT,
  special_needs TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. GUARDIANS (Parent/guardian contacts with communication preferences)
CREATE TABLE public.guardians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  relationship TEXT NOT NULL, -- 'mother', 'father', 'guardian', 'grandparent', etc.
  phone_primary TEXT,
  phone_secondary TEXT,
  email TEXT,
  is_primary_contact BOOLEAN DEFAULT FALSE,
  can_pickup BOOLEAN DEFAULT TRUE,
  emergency_contact BOOLEAN DEFAULT FALSE,
  communication_preference TEXT DEFAULT 'email', -- 'email', 'phone', 'both', 'none'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. BEHAVIOR REQUESTS (Enhanced BSR with family context)
CREATE TABLE public.behavior_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES auth.users(id),
  teacher_name TEXT NOT NULL,
  behavior_type TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  time_of_incident TIMESTAMP WITH TIME ZONE DEFAULT now(),
  priority_level TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status TEXT NOT NULL DEFAULT 'waiting', -- 'waiting', 'in_progress', 'completed', 'archived'
  assigned_kiosk INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. REFLECTIONS (Student 4-question responses with AI hooks)
CREATE TABLE public.reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  behavior_request_id UUID NOT NULL REFERENCES public.behavior_requests(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  question_1_response TEXT, -- What happened?
  question_2_response TEXT, -- How did others feel?
  question_3_response TEXT, -- What could you do differently?
  question_4_response TEXT, -- What's your plan?
  mood_rating INTEGER, -- 1-5 mood slider
  teacher_feedback TEXT,
  teacher_approved BOOLEAN DEFAULT FALSE,
  revision_requested BOOLEAN DEFAULT FALSE,
  ai_analysis JSONB, -- For future AI insights
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. BEHAVIOR HISTORY (Completed workflow records)
CREATE TABLE public.behavior_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  behavior_request_id UUID NOT NULL REFERENCES public.behavior_requests(id),
  reflection_id UUID NOT NULL REFERENCES public.reflections(id),
  resolution_type TEXT NOT NULL, -- 'approved', 'revised', 'escalated'
  resolution_notes TEXT,
  family_notified BOOLEAN DEFAULT FALSE,
  notification_method TEXT, -- 'email', 'phone', 'app', 'none'
  intervention_applied TEXT,
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  archived_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. PROFILES (Enhanced user management with super_admin)
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'teacher', -- 'teacher', 'admin', 'super_admin'
  grade_level TEXT,
  classroom TEXT,
  phone TEXT,
  department TEXT,
  hire_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. KIOSKS (Physical device management)
CREATE TABLE public.kiosks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  location TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  current_student_id UUID REFERENCES public.students(id),
  current_behavior_request_id UUID REFERENCES public.behavior_requests(id),
  activated_at TIMESTAMP WITH TIME ZONE,
  activated_by UUID REFERENCES auth.users(id),
  device_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. USER SESSIONS (Session management with device tracking)
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT,
  device_type TEXT,
  device_info JSONB,
  ip_address INET,
  location TEXT,
  login_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_status TEXT NOT NULL DEFAULT 'active', -- 'active', 'idle', 'ended'
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- EXTENSION POINT TABLES (Future-ready)

-- 10. EXTERNAL DATA (For SIS correlation)
CREATE TABLE public.external_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  data_source_id UUID NOT NULL,
  external_student_id TEXT,
  correlation_confidence DECIMAL(3,2), -- 0.00 to 1.00
  academic_data JSONB,
  attendance_data JSONB,
  disciplinary_data JSONB,
  last_sync TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 11. DATA SOURCES (External system tracking)
CREATE TABLE public.data_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- 'PowerSchool', 'Infinite Campus', etc.
  type TEXT NOT NULL, -- 'SIS', 'LMS', 'Assessment', etc.
  connection_info JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_frequency INTERVAL DEFAULT '1 day',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 12. BEHAVIOR PATTERNS (AI analysis)
CREATE TABLE public.behavior_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL, -- 'recurring', 'escalating', 'improving', etc.  
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  pattern_data JSONB,
  ai_insights JSONB,
  intervention_suggestions JSONB,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 13. AI INSIGHTS (Generated recommendations)
CREATE TABLE public.ai_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL, -- 'early_warning', 'intervention', 'pattern', etc.
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  priority_level TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status TEXT DEFAULT 'new', -- 'new', 'reviewed', 'acted_upon', 'dismissed'
  insight_data JSONB,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 14. COMMUNICATION TEMPLATES (Parent notification templates)
CREATE TABLE public.communication_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  template_type TEXT NOT NULL, -- 'behavior_alert', 'positive_recognition', 'follow_up', etc.
  subject_template TEXT,
  body_template TEXT NOT NULL,
  variables JSONB, -- Available template variables
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 15. COMMUNICATION LOGS (Message delivery tracking)
CREATE TABLE public.communication_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  guardian_id UUID NOT NULL REFERENCES public.guardians(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.communication_templates(id),
  method TEXT NOT NULL, -- 'email', 'sms', 'app_notification'
  recipient TEXT NOT NULL, -- actual email/phone
  subject TEXT,
  message_body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'bounced'
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  engagement_data JSONB, -- click tracking, etc.
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavior_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavior_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kiosks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavior_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Families: Users can see all families (for student selection)
CREATE POLICY "Users can view all families" ON public.families FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage families" ON public.families FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Students: Users can see all students (for BSR creation)
CREATE POLICY "Users can view all students" ON public.students FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage students" ON public.students FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Guardians: Users can see all guardians (for family context)
CREATE POLICY "Users can view all guardians" ON public.guardians FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage guardians" ON public.guardians FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Behavior Requests: Teachers see their own + admins see all
CREATE POLICY "Teachers can view their own behavior requests" ON public.behavior_requests 
FOR SELECT USING (teacher_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "Teachers can create behavior requests" ON public.behavior_requests 
FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their own behavior requests" ON public.behavior_requests 
FOR UPDATE USING (teacher_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Reflections: Based on associated behavior request
CREATE POLICY "Users can view reflections for their behavior requests" ON public.reflections 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.behavior_requests br WHERE br.id = behavior_request_id AND (br.teacher_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))))
);

CREATE POLICY "System can create reflections" ON public.reflections FOR INSERT WITH CHECK (true);
CREATE POLICY "Teachers can update reflections" ON public.reflections FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.behavior_requests br WHERE br.id = behavior_request_id AND (br.teacher_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))))
);

-- Behavior History: Same as behavior requests
CREATE POLICY "Teachers can view their behavior history" ON public.behavior_history 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.behavior_requests br WHERE br.id = behavior_request_id AND (br.teacher_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))))
);

CREATE POLICY "System can create behavior history" ON public.behavior_history FOR INSERT WITH CHECK (true);

-- Profiles: Users can see their own profile, admins can see all
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can manage profiles" ON public.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Kiosks: All authenticated users can view/update (for kiosk management)
CREATE POLICY "Users can view kiosks" ON public.kiosks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update kiosks" ON public.kiosks FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage kiosks" ON public.kiosks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- User Sessions: Users see their own, admins see all
CREATE POLICY "Users can view their own sessions" ON public.user_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all sessions" ON public.user_sessions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "System can manage sessions" ON public.user_sessions FOR ALL USING (true);

-- Extension tables: Admin only for now
CREATE POLICY "Admins can manage external data" ON public.external_data FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can manage data sources" ON public.data_sources FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can manage behavior patterns" ON public.behavior_patterns FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can manage ai insights" ON public.ai_insights FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Users can view communication templates" ON public.communication_templates FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage communication templates" ON public.communication_templates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Users can view communication logs for their students" ON public.communication_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.behavior_requests br WHERE br.student_id = communication_logs.student_id AND (br.teacher_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))))
);
CREATE POLICY "System can create communication logs" ON public.communication_logs FOR INSERT WITH CHECK (true);

-- TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON public.families FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_guardians_updated_at BEFORE UPDATE ON public.guardians FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_behavior_requests_updated_at BEFORE UPDATE ON public.behavior_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reflections_updated_at BEFORE UPDATE ON public.reflections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_kiosks_updated_at BEFORE UPDATE ON public.kiosks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_communication_templates_updated_at BEFORE UPDATE ON public.communication_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- INITIAL KIOSKS
INSERT INTO public.kiosks (name, location) VALUES 
('Kiosk 1', 'Main Office'),
('Kiosk 2', 'Library'),
('Kiosk 3', 'Counselor Office');

-- RPC FUNCTIONS

-- Create user session (for auth)
CREATE OR REPLACE FUNCTION create_user_session(
  p_user_id UUID,
  p_device_type TEXT DEFAULT NULL,
  p_device_info JSONB DEFAULT NULL,
  p_location TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_id UUID;
BEGIN
  INSERT INTO public.user_sessions (
    user_id,
    device_type,
    device_info,
    location
  ) VALUES (
    p_user_id,
    p_device_type,
    p_device_info,
    p_location
  )
  RETURNING id INTO session_id;
  
  RETURN session_id;
END;
$$;

-- End user session
CREATE OR REPLACE FUNCTION end_user_session(p_session_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_sessions 
  SET 
    session_status = 'ended',
    ended_at = now()
  WHERE id = p_session_id;
END;
$$;