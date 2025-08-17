# 🔓 Anonymous Kiosk Access Strategy

## Strategic Overview
**Objective:** Enable student access to reflection kiosks without authentication while maintaining security and queue management.

---

## 🎯 Core Requirements

### Functional Specifications
- Students access kiosks anonymously (no login required)
- FIFO queue management without user_id dependencies  
- Real-time position tracking for kiosk queue
- Secure reflection submission to teacher's BSR queue
- Device-based session management for kiosk continuity

### Security Constraints
- No sensitive data exposure to anonymous users
- Queue integrity maintained without authentication
- Reflection data properly attributed to correct BSR
- Prevention of queue manipulation or unauthorized access

---

## 🏗️ Technical Architecture

### Database Schema Adaptations
```sql
-- Kiosk sessions without authentication
CREATE TABLE kiosk_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_identifier TEXT NOT NULL,
  kiosk_id INTEGER REFERENCES kiosks(id),
  behavior_request_id UUID REFERENCES behavior_requests(id),
  session_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '2 hours'
);

-- Anonymous queue tracking
ALTER TABLE behavior_requests 
ADD COLUMN kiosk_session_id UUID REFERENCES kiosk_sessions(id);
```

### RLS Policies for Anonymous Access
```sql
-- Allow anonymous reads for active queue positions
CREATE POLICY "Anonymous kiosk queue access" ON behavior_requests
FOR SELECT TO anon
USING (
  status = 'waiting' 
  AND kiosk_status IN ('waiting', 'ready')
  AND assigned_kiosk_id IS NOT NULL
);

-- Allow anonymous reflection submissions
CREATE POLICY "Anonymous reflection submission" ON reflections
FOR INSERT TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM behavior_requests br
    WHERE br.id = behavior_request_id
    AND br.status = 'waiting'
    AND br.assigned_kiosk_id IS NOT NULL
  )
);
```

---

## 🔄 Queue Management Flow

### Queue Position Algorithm
```typescript
// Device-based queue position tracking
const getQueuePosition = async (kioskId: number, deviceId: string) => {
  const { data } = await supabase
    .from('behavior_requests')
    .select('id, created_at')
    .eq('assigned_kiosk_id', kioskId)
    .eq('status', 'waiting')
    .order('created_at', { ascending: true });
    
  return data?.findIndex(req => 
    req.kiosk_session?.device_identifier === deviceId
  ) + 1 || null;
};
```

### Session Management Strategy
```typescript
// Create anonymous kiosk session
const createKioskSession = async (kioskId: number) => {
  const deviceId = await getDeviceIdentifier(); // Browser fingerprint
  
  const { data } = await supabase
    .from('kiosk_sessions')
    .insert({
      device_identifier: deviceId,
      kiosk_id: kioskId,
      session_status: 'active'
    })
    .select()
    .single();
    
  return data;
};
```

---

## 🛡️ Security Implementation

### Device Identification
```typescript
// Generate consistent device identifier
const getDeviceIdentifier = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('Device fingerprint', 2, 2);
  
  return btoa(JSON.stringify({
    screen: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    canvas: canvas.toDataURL()
  }));
};
```

### Data Isolation Controls
```typescript
// Ensure anonymous users only see minimal required data
const getKioskData = async (kioskId: number) => {
  const { data } = await supabase
    .from('behavior_requests')
    .select(`
      id,
      created_at,
      assigned_kiosk_id,
      kiosk_status,
      students!inner(name)
    `)
    .eq('assigned_kiosk_id', kioskId)
    .eq('status', 'waiting')
    .single();
    
  // Return only essential data for kiosk interface
  return {
    studentName: data?.students?.name,
    position: await getQueuePosition(kioskId, deviceId),
    status: data?.kiosk_status
  };
};
```

---

## 📱 Kiosk Component Architecture

### Anonymous Authentication Context
```typescript
// KioskContext for anonymous operations
interface KioskContextType {
  deviceId: string;
  sessionId: string | null;
  currentBSR: BehaviorRequest | null;
  queuePosition: number | null;
  submitReflection: (answers: ReflectionAnswers) => Promise<void>;
  refreshPosition: () => Promise<void>;
}
```

### Real-Time Updates Without Auth
```typescript
// Subscribe to kiosk-specific updates
useEffect(() => {
  const channel = supabase
    .channel(`kiosk-${kioskId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public', 
      table: 'behavior_requests',
      filter: `assigned_kiosk_id=eq.${kioskId}`
    }, (payload) => {
      updateQueuePosition();
    })
    .subscribe();
    
  return () => supabase.removeChannel(channel);
}, [kioskId]);
```

---

## 🔍 Testing & Validation

### Anonymous Access Testing
```typescript
// Test suite for anonymous kiosk functionality
describe('Anonymous Kiosk Access', () => {
  test('Student can access kiosk without authentication', async () => {
    // Navigate to /kiosk1 without auth
    // Verify kiosk interface loads
    // Confirm no authentication prompt
  });
  
  test('Queue position updates in real-time', async () => {
    // Create multiple BSRs assigned to kiosk
    // Verify anonymous user sees correct position
    // Test position updates when queue changes
  });
  
  test('Reflection submission works anonymously', async () => {
    // Fill out reflection form without auth
    // Submit reflection
    // Verify teacher receives notification
  });
});
```

### Security Validation
- [ ] Anonymous users cannot access sensitive data
- [ ] Queue manipulation prevented through RLS
- [ ] Device fingerprinting works consistently
- [ ] Session expiration properly handled
- [ ] No authentication bypass vulnerabilities

---

## 🚨 Risk Mitigation

### Potential Risks & Solutions
1. **Queue Gaming:** Device fingerprinting prevents multiple sessions
2. **Data Exposure:** Minimal data exposure through careful RLS policies
3. **Session Hijacking:** Short session timeouts and device validation
4. **Performance Impact:** Efficient queries and proper indexing

### Monitoring Requirements
- Anonymous session creation rates
- Queue position calculation performance
- Failed reflection submission attempts
- Device identifier collision detection

---

## 📊 Success Metrics

### Functional Validation
- [ ] Students can access all three kiosks anonymously
- [ ] Queue positions calculate correctly without authentication
- [ ] Reflections submit successfully to correct BSRs
- [ ] Real-time updates function for anonymous sessions

### Performance Benchmarks
- [ ] Kiosk load time: <2 seconds on tablet devices
- [ ] Queue position calculation: <500ms response time
- [ ] Reflection submission: <1 second processing time
- [ ] Real-time updates: <100ms latency for queue changes

---

*This anonymous access strategy enables the core kiosk functionality while maintaining security and system integrity. Implementation must prioritize both user experience and data protection.*