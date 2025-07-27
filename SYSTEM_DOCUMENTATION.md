# Student Behavior Reflection System - System Documentation

## Current Working Functionality (T:0 State)

### Database Schema Overview

#### Core Tables
- **`profiles`** - User accounts with roles (id, email, full_name, role, created_at, updated_at)
- **`students`** - Student records (id, name, class_name, grade, created_at, updated_at)  
- **`behavior_requests`** - Behavior incidents (id, student_id, teacher_id, behaviors[], mood, urgent, status, assigned_kiosk_id, notes, created_at, updated_at)
- **`reflections`** - Student submissions (id, behavior_request_id, question1-4, status, teacher_feedback, created_at, updated_at)
- **`kiosks`** - Device management (id, name, location, is_active, current_student_id, current_behavior_request_id, activated_at, activated_by, created_at, updated_at)

#### Row-Level Security (RLS) Policies
All tables protected with comprehensive RLS:
- **Teachers/Admins**: Full CRUD access to behavior_requests, reflections, students, kiosks
- **Profile access**: Users can view/update own profile, authenticated users can view all profiles
- **Security**: No INSERT permissions on profiles (managed by auth trigger)

### Authentication & Authorization

#### User Roles
- **Teachers**: Create behavior requests, review reflections, manage queue
- **Admins**: All teacher permissions + kiosk management + user management
- **Students**: No direct login, access via physical kiosks

#### Auth Flow
1. Supabase auth with email/password
2. Automatic profile creation via `handle_new_user()` trigger
3. Role-based routing via `EntryPoint.tsx`
4. Protected routes with authentication checks

### Core Workflows

#### Behavior Request Workflow
1. **Creation**: Teacher selects student → chooses behaviors → sets mood/urgency
2. **Assignment**: Request enters queue with 'waiting' status
3. **Kiosk Assignment**: Can be assigned to specific kiosk for reflection
4. **Reflection**: Student completes 4-question reflection at kiosk
5. **Review**: Teacher approves or requests revision
6. **Completion**: Approved reflections close the request

#### Kiosk Management Workflow
1. **Activation**: Admin navigates to `/admin-mode-selection` → activates kiosk
2. **Assignment**: System assigns next available kiosk ID (1-3)
3. **Usage**: Kiosk shows 'active' status, can accept student sessions
4. **Deactivation**: Individual or bulk deactivation via admin dashboard
5. **Monitoring**: Real-time status updates across admin interfaces

### Current Component Architecture

#### Main Components
- **`TeacherDashboard`** - Primary teacher interface with queue display
- **`AdminDashboard`** - Comprehensive admin management interface  
- **`AdminModeSelection`** - Kiosk activation interface
- **`KioskOne/Two/Three`** - Student reflection interfaces
- **`BSRModal`** - Behavior request creation modal
- **`QueueDisplay`** - Real-time queue visualization
- **`ReviewReflection`** - Teacher reflection review modal

#### Context Providers
- **`AuthContext`** - User authentication state management
- **`KioskContext`** - Kiosk status and management operations

#### Custom Hooks
- **`useSupabaseQueue`** - Queue data fetching and management
- **`useKiosks`** - Kiosk state management and operations

### Current Route Structure
```
/ → EntryPoint (role-based routing)
├── /auth → Authentication page
├── /teacher-dashboard → Teacher interface  
├── /admin-mode-selection → Kiosk activation interface
├── /admin-dashboard → Admin management interface
├── /kiosk1 → Student kiosk #1
├── /kiosk2 → Student kiosk #2
├── /kiosk3 → Student kiosk #3
└── /* → NotFound page
```

### Real-Time Features
- **Queue Updates**: Automatic refresh when behavior_requests/reflections change
- **Kiosk Status**: Live updates when kiosk activation state changes
- **Supabase Subscriptions**: Real-time database change listeners
- **UI Synchronization**: Immediate updates across all connected interfaces

### Key Technical Features

#### Queue Management
- Position calculation for waiting students
- Status tracking (waiting → completed → approved)
- Time elapsed display for each request
- Filter by urgent/non-urgent items
- Real-time updates via Supabase subscriptions

#### Kiosk Management
- Activation/deactivation with database persistence
- Current student/behavior request tracking
- Sequential kiosk numbering (auto-assign next available)
- Maximum kiosk limit enforcement (default: 3)
- Real-time status monitoring

#### Data Integrity
- Foreign key relationships maintained
- Automatic timestamp updates via triggers
- Status consistency across related records
- Transaction-safe operations

### Working Features Confirmed
✅ User authentication and role-based access
✅ Behavior request creation and queuing
✅ Student reflection submission workflow  
✅ Teacher reflection review and approval
✅ Kiosk activation and deactivation
✅ Real-time queue updates
✅ Admin dashboard comprehensive management
✅ Responsive design with theme support
✅ Error handling and user feedback
✅ Database constraints and RLS security

### Current Limitations
- Admin mode selection adds navigation complexity
- No session tracking across devices/users
- Limited analytics and usage monitoring
- Manual kiosk status checking required
- No centralized user session management
- No usage analytics or reporting

### Production-Ready Elements
- Comprehensive error handling
- Responsive design system
- Security via RLS policies
- Real-time data synchronization
- Type-safe TypeScript implementation
- Accessibility considerations
- Mobile-optimized interfaces