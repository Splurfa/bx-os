# API Reference

## Database Schema

### Core Tables

#### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### students  
```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  name TEXT,
  grade TEXT,
  class_name TEXT,
  date_of_birth DATE,
  student_id_external TEXT,
  notes TEXT,
  special_needs TEXT,
  medications TEXT,
  allergies TEXT,
  gender TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### behavior_requests
```sql
CREATE TABLE behavior_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students NOT NULL,
  teacher_id UUID REFERENCES profiles,
  teacher_name TEXT NOT NULL,
  behavior_type TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  time_of_incident TIMESTAMP WITH TIME ZONE DEFAULT now(),
  antecedent_context_id UUID REFERENCES antecedent_contexts,
  urgency_level TEXT DEFAULT 'standard' CHECK (urgency_level IN ('standard','re_integration','urgent')),
  priority_level TEXT DEFAULT 'medium',
  teacher_mood INTEGER CHECK (teacher_mood BETWEEN 1 AND 5),
  note TEXT,
  status TEXT DEFAULT 'waiting',
  assigned_kiosk INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### antecedent_contexts
```sql
CREATE TABLE antecedent_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### kiosks
```sql
CREATE TABLE kiosks (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  is_active BOOLEAN DEFAULT false,
  current_student_id UUID REFERENCES students,
  current_behavior_request_id UUID REFERENCES behavior_requests,
  device_session_id TEXT,
  device_fingerprint TEXT,
  session_expires_at TIMESTAMP WITH TIME ZONE,
  session_status TEXT DEFAULT 'inactive',
  access_url TEXT,
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### reflections
```sql
CREATE TABLE reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  behavior_request_id UUID REFERENCES behavior_requests NOT NULL,
  student_id UUID REFERENCES students NOT NULL,
  mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 5),
  question_1_response TEXT,
  question_2_response TEXT,
  question_3_response TEXT,
  question_4_response TEXT,
  teacher_feedback TEXT,
  teacher_approved BOOLEAN DEFAULT false,
  revision_requested BOOLEAN DEFAULT false,
  ai_analysis JSONB,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Row Level Security Policies

### Profile Access
```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile  
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

### Student Access
```sql
-- Teachers and admins can view all students
CREATE POLICY "Staff can view students" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('teacher', 'admin', 'super_admin')
    )
  );
```

### Behavior Requests Management
```sql
-- Teachers can create behavior requests
CREATE POLICY "Teachers can create behavior requests" ON behavior_requests
  FOR INSERT WITH CHECK (teacher_id = auth.uid());

-- Teachers can view their own behavior requests, admins can view all
CREATE POLICY "Teachers can view their own behavior requests" ON behavior_requests
  FOR SELECT USING (
    teacher_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Teachers can update their own behavior requests, admins can update all
CREATE POLICY "Teachers can update their own behavior requests" ON behavior_requests
  FOR UPDATE USING (
    teacher_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );
```

## Real-time Subscriptions

### Queue Updates
```typescript
// Subscribe to kiosk changes for queue updates
const subscription = supabase
  .channel('queue_updates')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'kiosks' },
    (payload) => {
      // Handle real-time queue updates
      queryClient.invalidateQueries(['queue']);
    }
  )
  .subscribe();
```

### Kiosk Assignment
```typescript
// Monitor kiosk-specific assignments
const kioskSubscription = supabase
  .channel(`kiosk_assignment`)
  .on('postgres_changes',
    { 
      event: '*', 
      schema: 'public', 
      table: 'kiosks',
      filter: `id=eq.${kioskId}`
    },
    (payload) => {
      // Update kiosk interface with new assignment
      if (payload.new?.current_student_id) {
        // Load student workflow
      }
    }
  )
  .subscribe();
```