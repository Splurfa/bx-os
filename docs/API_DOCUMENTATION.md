# API Documentation

## Overview

The Behavior Support System API is built on Supabase, providing a comprehensive REST API with real-time capabilities through WebSocket subscriptions. The API follows RESTful principles and includes robust authentication, authorization, and data validation.

## Base Configuration

### Supabase Client Setup

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tuxvwpgwnnozubdpskhr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Authentication Headers

All API requests require authentication via JWT tokens:

```typescript
// Authentication is handled automatically by Supabase client
// after successful login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'teacher@school.edu',
  password: 'password123'
});
```

## Authentication Endpoints

### Sign In

**POST** `/auth/v1/token?grant_type=password`

Authenticate a user and receive access tokens.

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: string,
  password: string
});
```

**Request Body:**
```json
{
  "email": "teacher@school.edu",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "abc123...",
  "user": {
    "id": "uuid",
    "email": "teacher@school.edu",
    "role": "authenticated"
  }
}
```

### Sign Up

**POST** `/auth/v1/signup`

Create a new user account.

```typescript
const { data, error } = await supabase.auth.signUp({
  email: string,
  password: string,
  options: {
    data: {
      first_name: string,
      last_name: string,
      role: string
    }
  }
});
```

### Sign Out

**POST** `/auth/v1/logout`

```typescript
const { error } = await supabase.auth.signOut();
```

## Data Endpoints

### Behavior Requests

#### Get All Behavior Requests

**GET** `/rest/v1/behavior_requests`

Retrieve all behavior requests with related data.

```typescript
const { data, error } = await supabase
  .from('behavior_requests')
  .select(`
    *,
    student:students(*),
    teacher:profiles(*),
    reflection:reflections(*)
  `)
  .order('created_at', { ascending: true });
```

**Query Parameters:**
- `select`: Specify columns to return
- `order`: Sort order (e.g., `created_at.asc`)
- `limit`: Maximum number of records
- `offset`: Number of records to skip

**Response:**
```json
[
  {
    "id": "uuid",
    "student_id": "uuid",
    "teacher_id": "uuid",
    "urgent": false,
    "assigned_kiosk_id": null,
    "mood": "frustrated",
    "behaviors": ["disruption", "defiance"],
    "status": "waiting",
    "notes": "Student needs reflection time",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "student": {
      "id": "uuid",
      "name": "John Doe",
      "grade": "5th",
      "class_name": "5A"
    },
    "teacher": {
      "id": "uuid",
      "full_name": "Jane Smith",
      "email": "jane.smith@school.edu",
      "role": "teacher"
    },
    "reflection": null
  }
]
```

#### Create Behavior Request

**POST** `/rest/v1/behavior_requests`

Create a new behavior support request.

```typescript
const { data, error } = await supabase
  .from('behavior_requests')
  .insert({
    student_id: 'uuid',
    teacher_id: 'uuid',
    mood: 'frustrated',
    behaviors: ['disruption', 'defiance'],
    urgent: false,
    notes: 'Student needs reflection time'
  })
  .select()
  .single();
```

**Request Body:**
```json
{
  "student_id": "uuid",
  "teacher_id": "uuid",
  "mood": "frustrated",
  "behaviors": ["disruption", "defiance"],
  "urgent": false,
  "notes": "Student needs reflection time"
}
```

#### Update Behavior Request

**PATCH** `/rest/v1/behavior_requests?id=eq.{id}`

Update an existing behavior request.

```typescript
const { data, error } = await supabase
  .from('behavior_requests')
  .update({ 
    status: 'in_progress',
    assigned_kiosk_id: 1 
  })
  .eq('id', requestId)
  .select()
  .single();
```

#### Delete Behavior Request

**DELETE** `/rest/v1/behavior_requests?id=eq.{id}`

Remove a behavior request from the queue.

```typescript
const { error } = await supabase
  .from('behavior_requests')
  .delete()
  .eq('id', requestId);
```

### Students

#### Get All Students

**GET** `/rest/v1/students`

```typescript
const { data, error } = await supabase
  .from('students')
  .select('*')
  .order('name', { ascending: true });
```

#### Create Student

**POST** `/rest/v1/students`

```typescript
const { data, error } = await supabase
  .from('students')
  .insert({
    name: 'John Doe',
    grade: '5th',
    class_name: '5A'
  })
  .select()
  .single();
```

#### Search Students

**GET** `/rest/v1/students?name=ilike.%{query}%`

```typescript
const { data, error } = await supabase
  .from('students')
  .select('*')
  .ilike('name', `%${searchQuery}%`)
  .limit(10);
```

### Reflections

#### Get Reflections

**GET** `/rest/v1/reflections`

```typescript
const { data, error } = await supabase
  .from('reflections')
  .select(`
    *,
    behavior_request:behavior_requests(
      *,
      student:students(*),
      teacher:profiles(*)
    )
  `)
  .eq('status', 'pending');
```

#### Create Reflection

**POST** `/rest/v1/reflections`

```typescript
const { data, error } = await supabase
  .from('reflections')
  .insert({
    behavior_request_id: 'uuid',
    question1: 'I was talking during instruction',
    question2: 'I wanted to tell my friend something',
    question3: 'My teacher and classmates were disrupted',
    question4: 'I will raise my hand and wait to be called on'
  })
  .select()
  .single();
```

#### Update Reflection Status

**PATCH** `/rest/v1/reflections?id=eq.{id}`

```typescript
const { error } = await supabase
  .from('reflections')
  .update({ 
    status: 'approved',
    teacher_feedback: 'Good reflection, you may return to class'
  })
  .eq('id', reflectionId);
```

### Kiosks

#### Get All Kiosks

**GET** `/rest/v1/kiosks`

```typescript
const { data, error } = await supabase
  .from('kiosks')
  .select('*')
  .order('id', { ascending: true });
```

#### Activate Kiosk

**PATCH** `/rest/v1/kiosks?id=eq.{id}`

```typescript
const { data, error } = await supabase
  .from('kiosks')
  .update({ 
    is_active: true,
    activated_at: new Date().toISOString(),
    activated_by: userId
  })
  .eq('id', kioskId)
  .select()
  .single();
```

#### Assign Student to Kiosk

**PATCH** `/rest/v1/kiosks?id=eq.{id}`

```typescript
const { error } = await supabase
  .from('kiosks')
  .update({ 
    current_student_id: studentId,
    current_behavior_request_id: requestId
  })
  .eq('id', kioskId);
```

### User Sessions

#### Get Active Sessions

**GET** `/rest/v1/user_sessions?session_status=eq.active`

```typescript
const { data, error } = await supabase
  .from('user_sessions')
  .select(`
    *,
    user:profiles(*),
    kiosk:kiosks(*)
  `)
  .eq('session_status', 'active')
  .order('login_time', { ascending: false });
```

#### Create Session

**POST** `/rest/v1/user_sessions`

```typescript
const { data, error } = await supabase
  .from('user_sessions')
  .insert({
    user_id: userId,
    device_type: 'desktop',
    location: 'Main Office',
    kiosk_id: null,
    metadata: { browser: 'Chrome', ip: '192.168.1.100' }
  })
  .select()
  .single();
```

#### Update Session Activity

**PATCH** `/rest/v1/user_sessions?id=eq.{id}`

```typescript
const { error } = await supabase
  .from('user_sessions')
  .update({ 
    last_activity: new Date().toISOString()
  })
  .eq('id', sessionId);
```

### Behavior History

#### Get Historical Data

**GET** `/rest/v1/behavior_history`

```typescript
const { data, error } = await supabase
  .from('behavior_history')
  .select('*')
  .gte('completed_at', startDate)
  .lte('completed_at', endDate)
  .order('completed_at', { ascending: false });
```

#### Analytics Queries

**Student Behavior Trends:**
```typescript
const { data, error } = await supabase
  .from('behavior_history')
  .select('student_id, student_name, behaviors, completed_at')
  .eq('student_id', studentId)
  .order('completed_at', { ascending: false })
  .limit(50);
```

**Teacher Workload Analysis:**
```typescript
const { data, error } = await supabase
  .from('behavior_history')
  .select('teacher_id, teacher_name, intervention_outcome')
  .gte('completed_at', startDate)
  .lte('completed_at', endDate);
```

**Behavior Pattern Analysis:**
```typescript
const { data, error } = await supabase
  .from('behavior_history')
  .select('behaviors, mood, intervention_outcome')
  .gte('completed_at', startDate)
  .lte('completed_at', endDate);
```

## Real-time Subscriptions

### WebSocket Connections

Supabase provides real-time updates through WebSocket connections:

```typescript
// Subscribe to behavior request changes
const subscription = supabase
  .channel('behavior_requests_channel')
  .on('postgres_changes', 
    { 
      event: '*', 
      schema: 'public', 
      table: 'behavior_requests' 
    },
    (payload) => {
      console.log('Change detected:', payload);
      // Handle real-time update
    }
  )
  .subscribe();
```

### Event Types

- **INSERT**: New records created
- **UPDATE**: Existing records modified  
- **DELETE**: Records removed
- *****: All change types

### Subscription Examples

#### Queue Updates

```typescript
const queueSubscription = supabase
  .channel('queue_updates')
  .on('postgres_changes', 
    { 
      event: '*', 
      schema: 'public', 
      table: 'behavior_requests',
      filter: 'status=eq.waiting'
    },
    handleQueueUpdate
  )
  .subscribe();
```

#### Reflection Submissions

```typescript
const reflectionSubscription = supabase
  .channel('reflection_updates')
  .on('postgres_changes', 
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'reflections'
    },
    handleNewReflection
  )
  .subscribe();
```

#### Kiosk Status Changes

```typescript
const kioskSubscription = supabase
  .channel('kiosk_updates')
  .on('postgres_changes', 
    { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'kiosks'
    },
    handleKioskUpdate
  )
  .subscribe();
```

## Error Handling

### Error Response Format

```json
{
  "error": {
    "message": "Invalid input",
    "details": "mood must be one of: happy, sad, angry, frustrated, anxious, calm, excited",
    "hint": "Check the allowed values for the mood field",
    "code": "23514"
  }
}
```

### Common Error Codes

- **401**: Unauthorized - Invalid or missing authentication
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource doesn't exist
- **409**: Conflict - Constraint violation
- **422**: Unprocessable Entity - Validation error
- **500**: Internal Server Error - Server-side error

### Error Handling Patterns

```typescript
const handleDatabaseOperation = async (operation) => {
  try {
    const { data, error } = await operation();
    
    if (error) {
      switch (error.code) {
        case '23503':
          throw new Error('Referenced record not found');
        case '23505':
          throw new Error('Duplicate record');
        case '23514':
          throw new Error('Invalid data value');
        default:
          throw new Error(error.message);
      }
    }
    
    return data;
  } catch (err) {
    console.error('Database operation failed:', err);
    throw err;
  }
};
```

## Rate Limiting

### Default Limits

- **Authenticated requests**: 100 per minute per user
- **Anonymous requests**: 30 per minute per IP
- **Real-time subscriptions**: 100 concurrent per user

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Data Validation

### Request Validation

All API endpoints include server-side validation:

#### Behavior Request Validation

```typescript
interface BehaviorRequestInput {
  student_id: string;     // Required UUID
  teacher_id: string;     // Required UUID
  mood: string;          // Required enum value
  behaviors: string[];   // Required array
  urgent: boolean;       // Optional, defaults to false
  notes?: string;        // Optional text
}
```

#### Reflection Validation

```typescript
interface ReflectionInput {
  behavior_request_id: string;  // Required UUID
  question1: string;           // Required, min 10 characters
  question2: string;           // Required, min 10 characters
  question3: string;           // Required, min 10 characters
  question4: string;           // Required, min 10 characters
}
```

### Input Sanitization

- All text inputs are sanitized to prevent XSS
- SQL injection protection through parameterized queries
- File upload validation (if applicable)
- Maximum field length enforcement

## Performance Optimization

### Query Optimization

#### Use Specific Selects

```typescript
// Good - specific columns
const { data } = await supabase
  .from('behavior_requests')
  .select('id, student_id, status, created_at');

// Avoid - selecting all columns
const { data } = await supabase
  .from('behavior_requests')
  .select('*');
```

#### Efficient Joins

```typescript
// Efficient join with specific columns
const { data } = await supabase
  .from('behavior_requests')
  .select(`
    id,
    status,
    student:students(name, grade),
    reflection:reflections(status)
  `);
```

#### Pagination

```typescript
// Implement pagination for large datasets
const { data } = await supabase
  .from('behavior_history')
  .select('*')
  .range(0, 49)  // First 50 records
  .order('completed_at', { ascending: false });
```

### Caching Strategies

#### Client-side Caching

```typescript
// Use React Query for caching
import { useQuery } from '@tanstack/react-query';

const useBehaviorRequests = () => {
  return useQuery({
    queryKey: ['behavior_requests'],
    queryFn: () => fetchBehaviorRequests(),
    staleTime: 30000, // 30 seconds
    cacheTime: 300000, // 5 minutes
  });
};
```

#### Real-time Cache Invalidation

```typescript
// Invalidate cache on real-time updates
const subscription = supabase
  .channel('cache_invalidation')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'behavior_requests' },
    () => {
      queryClient.invalidateQueries(['behavior_requests']);
    }
  )
  .subscribe();
```

## Security Considerations

### Row Level Security (RLS)

All tables implement RLS policies:

```sql
-- Example policy
CREATE POLICY "Teachers can view behavior requests" 
ON behavior_requests 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('teacher', 'admin')
  )
);
```

### Input Validation

- Server-side validation for all inputs
- Type checking and constraint enforcement
- Sanitization of user-provided data
- Protection against SQL injection

### Authentication Security

- JWT tokens with expiration
- Secure token storage
- Automatic token refresh
- Session management

## Testing

### API Testing

```typescript
// Example test
describe('Behavior Requests API', () => {
  test('should create behavior request', async () => {
    const requestData = {
      student_id: 'uuid',
      teacher_id: 'uuid',
      mood: 'frustrated',
      behaviors: ['disruption'],
      urgent: false
    };
    
    const { data, error } = await supabase
      .from('behavior_requests')
      .insert(requestData)
      .select()
      .single();
    
    expect(error).toBeNull();
    expect(data.id).toBeDefined();
    expect(data.status).toBe('waiting');
  });
});
```

### Real-time Testing

```typescript
// Test real-time subscriptions
test('should receive real-time updates', (done) => {
  const subscription = supabase
    .channel('test_channel')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'behavior_requests' },
      (payload) => {
        expect(payload.new).toBeDefined();
        subscription.unsubscribe();
        done();
      }
    )
    .subscribe();
    
  // Trigger an insert
  supabase
    .from('behavior_requests')
    .insert(testData);
});
```

## API Versioning

### Current Version

- **API Version**: v1
- **Base URL**: `https://tuxvwpgwnnozubdpskhr.supabase.co/rest/v1/`
- **Real-time URL**: `wss://tuxvwpgwnnozubdpskhr.supabase.co/realtime/v1/`

### Version Headers

```typescript
// Include version in requests
const headers = {
  'apikey': 'your-api-key',
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};
```

## Migration Guide

### Upgrading API Usage

When API changes are introduced:

1. **Backward Compatibility**: Maintain support for previous versions
2. **Deprecation Notices**: Advance warning of changes
3. **Migration Scripts**: Automated migration tools
4. **Documentation Updates**: Updated examples and guides

### Breaking Changes

- Major version increments for breaking changes
- Advance notice period (minimum 30 days)
- Migration assistance and support
- Parallel version support during transition