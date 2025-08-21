# API Reference

## Database Schema

### Core Tables

#### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### students  
```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  grade INTEGER CHECK (grade IN (6, 7, 8)),
  homeroom TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### behavior_support_requests
```sql
CREATE TABLE behavior_support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students NOT NULL,
  teacher_id UUID REFERENCES profiles NOT NULL,
  behavior_category TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);
```

#### queue_items
```sql
CREATE TABLE queue_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bsr_id UUID REFERENCES behavior_support_requests NOT NULL,
  student_id UUID REFERENCES students NOT NULL,
  kiosk_id INTEGER CHECK (kiosk_id IN (1, 2, 3)),
  position INTEGER,
  status TEXT DEFAULT 'waiting',
  assigned_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
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

### BSR Management
```sql
-- Teachers can create BSRs
CREATE POLICY "Teachers can create BSRs" ON behavior_support_requests
  FOR INSERT WITH CHECK (
    teacher_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- BSR visibility to creator and admins
CREATE POLICY "BSR visibility" ON behavior_support_requests
  FOR SELECT USING (
    teacher_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );
```

## Real-time Subscriptions

### Queue Updates
```typescript
// Subscribe to queue changes
const subscription = supabase
  .channel('queue_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'queue_items' },
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
  .channel(`kiosk_${kioskId}`)
  .on('postgres_changes',
    { 
      event: '*', 
      schema: 'public', 
      table: 'queue_items',
      filter: `kiosk_id=eq.${kioskId}`
    },
    (payload) => {
      // Update kiosk interface with new assignment
    }
  )
  .subscribe();
```