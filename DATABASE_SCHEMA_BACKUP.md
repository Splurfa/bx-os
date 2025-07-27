# Database Schema Backup (T:0 State)

## Complete Database Schema Documentation

### Table: profiles
```sql
CREATE TABLE profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text,
  full_name text,
  role text NOT NULL DEFAULT 'teacher'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS Policies
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON profiles FOR SELECT 
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);
```

### Table: students
```sql
CREATE TABLE students (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  class_name text,
  grade text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS Policies
CREATE POLICY "Teachers and admins can create students" 
ON students FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY (ARRAY['teacher'::text, 'admin'::text])
));

CREATE POLICY "Teachers and admins can update students" 
ON students FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY (ARRAY['teacher'::text, 'admin'::text])
));

CREATE POLICY "Teachers and admins can view students" 
ON students FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY (ARRAY['teacher'::text, 'admin'::text])
));
```

### Table: behavior_requests
```sql
CREATE TABLE behavior_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL,
  teacher_id uuid NOT NULL,
  behaviors text[] NOT NULL DEFAULT '{}'::text[],
  mood text NOT NULL,
  urgent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'waiting'::text,
  assigned_kiosk_id integer,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS Policies
CREATE POLICY "Teachers and admins can create behavior requests" 
ON behavior_requests FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY (ARRAY['teacher'::text, 'admin'::text])
));

CREATE POLICY "Teachers and admins can delete behavior requests" 
ON behavior_requests FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY (ARRAY['teacher'::text, 'admin'::text])
));

CREATE POLICY "Teachers and admins can update behavior requests" 
ON behavior_requests FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY (ARRAY['teacher'::text, 'admin'::text])
));

CREATE POLICY "Teachers and admins can view behavior requests" 
ON behavior_requests FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY (ARRAY['teacher'::text, 'admin'::text])
));
```

### Table: reflections
```sql
CREATE TABLE reflections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  behavior_request_id uuid NOT NULL,
  question1 text NOT NULL,
  question2 text NOT NULL,
  question3 text NOT NULL,
  question4 text NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  teacher_feedback text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS Policies
CREATE POLICY "Teachers and admins can create reflections" 
ON reflections FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY (ARRAY['teacher'::text, 'admin'::text])
));

CREATE POLICY "Teachers and admins can update reflections" 
ON reflections FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY (ARRAY['teacher'::text, 'admin'::text])
));

CREATE POLICY "Teachers and admins can view reflections" 
ON reflections FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY (ARRAY['teacher'::text, 'admin'::text])
));
```

### Table: kiosks
```sql
CREATE TABLE kiosks (
  id integer NOT NULL DEFAULT nextval('kiosks_id_seq'::regclass) PRIMARY KEY,
  name text NOT NULL,
  location text,
  is_active boolean NOT NULL DEFAULT true,
  current_student_id uuid,
  current_behavior_request_id uuid,
  activated_at timestamp with time zone,
  activated_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS Policies
CREATE POLICY "Teachers and admins can create kiosks" 
ON kiosks FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY (ARRAY['teacher'::text, 'admin'::text])
));

CREATE POLICY "Teachers and admins can delete kiosks" 
ON kiosks FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY (ARRAY['teacher'::text, 'admin'::text])
));

CREATE POLICY "Teachers and admins can update kiosks" 
ON kiosks FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY (ARRAY['teacher'::text, 'admin'::text])
));

CREATE POLICY "Teachers and admins can view kiosks" 
ON kiosks FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY (ARRAY['teacher'::text, 'admin'::text])
));
```

## Database Functions

### Function: update_updated_at_column()
```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
STABLE
SET search_path TO ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
```

### Function: handle_new_user()
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'teacher')
  );
  RETURN NEW;
END;
$function$
```

### Function: get_current_user_role()
```sql
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$function$
```

## Sequences
- `kiosks_id_seq` - Auto-incrementing sequence for kiosk IDs

## Triggers
- Triggers for automatic `updated_at` timestamp updates (implied by function existence)
- Auth trigger for automatic profile creation on user signup

## Data Relationships
- `behavior_requests.student_id` → References students (no formal FK)
- `behavior_requests.teacher_id` → References profiles (no formal FK) 
- `behavior_requests.assigned_kiosk_id` → References kiosks (no formal FK)
- `reflections.behavior_request_id` → References behavior_requests (no formal FK)
- `kiosks.current_student_id` → References students (no formal FK)
- `kiosks.current_behavior_request_id` → References behavior_requests (no formal FK)
- `kiosks.activated_by` → References profiles (no formal FK)

## Security Notes
- All tables have RLS enabled
- Comprehensive policies restrict access to teachers/admins only
- Profile table has special policies for self-management
- No public access to any sensitive data
- Functions use SECURITY DEFINER for privilege escalation where needed